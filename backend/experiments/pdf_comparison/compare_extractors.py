"""Compare PDF extraction between pdfplumber and AWS Textract (S3 async mode)."""

import asyncio
import sys
import time
import uuid
from pathlib import Path

import boto3

from apps.sources.document_processor import PdfPlumberParser
from core.config import settings


class TextractAsyncParser:
    """
    PDF text extraction using AWS Textract with S3 async mode.

    This supports multi-page PDFs by:
    1. Uploading the PDF to S3
    2. Starting an async Textract job
    3. Polling for completion
    4. Retrieving and combining all pages
    5. Cleaning up the S3 object
    """

    def __init__(self, s3_bucket: str):
        self.s3_bucket = s3_bucket
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
        )
        self.textract_client = boto3.client(
            "textract",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
        )

    async def parse_pdf(self, file_bytes: bytes) -> dict:
        loop = asyncio.get_event_loop()

        # Generate unique S3 key
        s3_key = f"textract-temp/{uuid.uuid4()}.pdf"

        def _upload_to_s3():
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=s3_key,
                Body=file_bytes,
            )

        def _start_textract_job():
            response = self.textract_client.start_document_text_detection(
                DocumentLocation={
                    "S3Object": {
                        "Bucket": self.s3_bucket,
                        "Name": s3_key,
                    }
                }
            )
            return response["JobId"]

        def _get_job_status(job_id: str):
            return self.textract_client.get_document_text_detection(JobId=job_id)

        def _cleanup_s3():
            self.s3_client.delete_object(Bucket=self.s3_bucket, Key=s3_key)

        # Upload to S3
        await loop.run_in_executor(None, _upload_to_s3)

        # Start async job
        job_id = await loop.run_in_executor(None, _start_textract_job)

        # Poll for completion
        while True:
            response = await loop.run_in_executor(None, _get_job_status, job_id)
            status = response["JobStatus"]

            if status == "SUCCEEDED":
                break
            elif status == "FAILED":
                await loop.run_in_executor(None, _cleanup_s3)
                raise Exception(f"Textract job failed: {response.get('StatusMessage', 'Unknown error')}")
            elif status == "IN_PROGRESS":
                await asyncio.sleep(2)
            else:
                await asyncio.sleep(1)

        # Collect all pages (handle pagination)
        all_blocks = response.get("Blocks", [])
        next_token = response.get("NextToken")

        while next_token:
            response = await loop.run_in_executor(
                None,
                lambda: self.textract_client.get_document_text_detection(
                    JobId=job_id, NextToken=next_token
                ),
            )
            all_blocks.extend(response.get("Blocks", []))
            next_token = response.get("NextToken")

        # Cleanup S3
        await loop.run_in_executor(None, _cleanup_s3)

        # Extract text with page metadata
        pages_dict: dict[int, list[str]] = {}

        for block in all_blocks:
            if block["BlockType"] == "LINE":
                text = block.get("Text", "")
                page = block.get("Page", 1)
                if page not in pages_dict:
                    pages_dict[page] = []
                pages_dict[page].append(text)

        # Convert to list format
        page_count = max(pages_dict.keys()) if pages_dict else 0
        pages = []
        for i in range(1, page_count + 1):
            pages.append("\n".join(pages_dict.get(i, [])))

        return {
            "text": "\n\n".join(pages),
            "pages": pages,
            "page_count": page_count,
        }


async def run_comparison(pdf_path: str):
    """Run comparison between pdfplumber and Textract on a PDF file."""
    path = Path(pdf_path)
    if not path.exists():
        print(f"Error: File not found: {pdf_path}")
        sys.exit(1)

    file_bytes = path.read_bytes()
    file_size_mb = len(file_bytes) / (1024 * 1024)

    print("=== PDF Extraction Comparison ===")
    print(f"File: {path.name}")
    print(f"Size: {file_size_mb:.2f} MB")
    print()

    # Run pdfplumber
    print("--- pdfplumber ---")
    pdfplumber_parser = PdfPlumberParser()
    start = time.time()
    pdfplumber_result = await pdfplumber_parser.parse_pdf(file_bytes)
    pdfplumber_time = time.time() - start

    print(f"Time: {pdfplumber_time:.2f}s")
    print(f"Pages: {pdfplumber_result['page_count']}")
    print(f"Characters: {len(pdfplumber_result['text']):,}")
    print(f"Sample: {pdfplumber_result['text'][:500]}...")
    print()

    # Run Textract (S3 async)
    s3_bucket = settings.experiments__s3_bucket or settings.aws_s3_bucket
    if not s3_bucket:
        print("--- AWS Textract (S3 async) ---")
        print("SKIPPED: No S3 bucket configured")
        print("Set EXPERIMENTS__S3_BUCKET or AWS_S3_BUCKET environment variable")
        print()
        return

    print("--- AWS Textract (S3 async) ---")
    textract_parser = TextractAsyncParser(s3_bucket)
    start = time.time()
    textract_result = await textract_parser.parse_pdf(file_bytes)
    textract_time = time.time() - start

    print(f"Time: {textract_time:.2f}s (includes upload + polling)")
    print(f"Pages: {textract_result['page_count']}")
    print(f"Characters: {len(textract_result['text']):,}")
    print(f"Sample: {textract_result['text'][:500]}...")
    print()

    # Comparison
    print("--- Comparison ---")
    char_diff = abs(len(pdfplumber_result["text"]) - len(textract_result["text"]))
    char_pct = (char_diff / max(len(pdfplumber_result["text"]), 1)) * 100
    print(f"Character difference: {char_diff:,} ({char_pct:.1f}%)")
    print(f"Time difference: {abs(textract_time - pdfplumber_time):.2f}s")
    print(f"Faster: {'pdfplumber' if pdfplumber_time < textract_time else 'Textract'}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python -m experiments.pdf_comparison.compare_extractors <pdf_path>")
        print()
        print("Example:")
        print("  python -m experiments.pdf_comparison.compare_extractors /path/to/document.pdf")
        sys.exit(1)

    pdf_path = sys.argv[1]
    asyncio.run(run_comparison(pdf_path))


if __name__ == "__main__":
    main()
