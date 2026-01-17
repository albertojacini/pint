"""Load PDF files from TEMP directory into the sources system."""

import asyncio
import sys
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.db import db
from apps.sources.services import SourcesService

# Path to TEMP directory (relative to project root)
TEMP_DIR = Path(__file__).parent.parent.parent / "TEMP"

# Map filenames to metadata for better classification
PDF_METADATA = {
    "02 Relazione sulla Gestione  2022.pdf": {
        "title": "Relazione sulla Gestione 2022 - Comune di Milano",
        "fiscal_year": 2022,
        "document_category": "budget",
        "administrative_level": "municipal",
    },
    "02 Relazione sulla gestione 2023.pdf": {
        "title": "Relazione sulla Gestione 2023 - Comune di Milano",
        "fiscal_year": 2023,
        "document_category": "budget",
        "administrative_level": "municipal",
    },
    "02_Relazione_sulla_gestione_2024_-_Modificato.pdf": {
        "title": "Relazione sulla Gestione 2024 - Comune di Milano",
        "fiscal_year": 2024,
        "document_category": "budget",
        "administrative_level": "municipal",
    },
    "Bilancio Consolidato 2023 Comune di Milano.pdf": {
        "title": "Bilancio Consolidato 2023 - Comune di Milano",
        "fiscal_year": 2023,
        "document_category": "budget",
        "administrative_level": "municipal",
    },
    "Bilancio Consolidato 2024 Comune di Milano.pdf": {
        "title": "Bilancio Consolidato 2024 - Comune di Milano",
        "fiscal_year": 2024,
        "document_category": "budget",
        "administrative_level": "municipal",
    },
    "Bilancio consolidato Comune di Milano per esercizio 2022.pdf": {
        "title": "Bilancio Consolidato 2022 - Comune di Milano",
        "fiscal_year": 2022,
        "document_category": "budget",
        "administrative_level": "municipal",
    },
}


async def main():
    """Load all PDFs from TEMP directory into the sources system."""
    print(f"Looking for PDFs in: {TEMP_DIR}")

    if not TEMP_DIR.exists():
        print(f"Error: TEMP directory not found at {TEMP_DIR}")
        return

    pdf_files = list(TEMP_DIR.glob("*.pdf"))
    if not pdf_files:
        print("No PDF files found in TEMP directory")
        return

    print(f"Found {len(pdf_files)} PDF files")

    await db.connect()
    service = SourcesService()

    # Try to find Milan publisher
    publisher = await service.find_publisher_by_url("https://www.comune.milano.it")
    if publisher:
        publisher_id = publisher.id
        print(f"Using publisher: {publisher.name} ({publisher_id})")
    else:
        publisher_id = await service.get_unknown_publisher_id()
        print(f"Milan publisher not found, using Unknown Publisher ({publisher_id})")

    for pdf_path in pdf_files:
        print(f"\nProcessing: {pdf_path.name}")

        # Check if document already exists (by title)
        metadata = PDF_METADATA.get(pdf_path.name, {})
        title = metadata.get("title", pdf_path.stem)

        # Read file bytes
        with open(pdf_path, "rb") as f:
            file_bytes = f.read()

        print(f"  File size: {len(file_bytes):,} bytes")

        try:
            doc = await service.process_pdf_upload(
                file_bytes=file_bytes,
                filename=pdf_path.name,
                title=title,
                publisher_id=publisher_id,
                document_category=metadata.get("document_category"),
                administrative_level=metadata.get("administrative_level"),
                fiscal_year=metadata.get("fiscal_year"),
            )
            print(f"  Created document: {doc.id}")
            print(f"  Chunks: {doc.chunk_count}")
            print(f"  Embedding status: {doc.embedding_status}")
        except Exception as e:
            print(f"  Error processing {pdf_path.name}: {e}")

    await db.close()
    print("\nDone!")


if __name__ == "__main__":
    asyncio.run(main())
