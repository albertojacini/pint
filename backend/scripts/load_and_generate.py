"""
Combined script: Clean seed data, load PDFs, and generate artifacts.

Usage:
    cd /backend && source .venv/bin/activate
    python scripts/load_and_generate.py              # Full run (clean, load PDFs, generate)
    python scripts/load_and_generate.py --artifacts-only  # Just regenerate artifacts
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def log(msg: str):
    """Print with immediate flush."""
    print(msg, flush=True)


from core.db import db
from apps.sources.services import SourcesService
from apps.artifact_generation.services import ArtifactGenerator

# Path to TEMP directory
TEMP_DIR = Path(__file__).parent.parent.parent / "TEMP"

# PDF metadata mapping
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

# Hardcoded provision for testing
TARGET_PROVISION_SLUG = "pedaggi-urbani"


async def cleanup_artifacts_only():
    """Remove only artifacts (keep documents and chunks)."""
    log("\n" + "=" * 60)
    log("Cleaning up artifacts only")
    log("=" * 60)

    async with db.pool.acquire() as conn:
        r1 = await conn.execute("DELETE FROM kno_artifact_sources")
        log(f"  Deleted artifact sources: {r1.split()[-1]} rows")

        r2 = await conn.execute("DELETE FROM gov_provision_artifacts")
        log(f"  Deleted provision-artifact links: {r2.split()[-1]} rows")

        r3 = await conn.execute("DELETE FROM kno_artifacts")
        log(f"  Deleted artifacts: {r3.split()[-1]} rows")

    log("  Done!")


async def cleanup_all():
    """Remove all existing artifacts and documents (seed data)."""
    log("\n" + "=" * 60)
    log("STEP 1: Cleaning up all data")
    log("=" * 60)

    async with db.pool.acquire() as conn:
        r1 = await conn.execute("DELETE FROM kno_artifact_sources")
        log(f"  Deleted artifact sources: {r1.split()[-1]} rows")

        r2 = await conn.execute("DELETE FROM gov_provision_artifacts")
        log(f"  Deleted provision-artifact links: {r2.split()[-1]} rows")

        r3 = await conn.execute("DELETE FROM kno_artifacts")
        log(f"  Deleted artifacts: {r3.split()[-1]} rows")

        r4 = await conn.execute("DELETE FROM sou_document_chunks")
        log(f"  Deleted document chunks: {r4.split()[-1]} rows")

        r5 = await conn.execute("DELETE FROM sou_documents")
        log(f"  Deleted documents: {r5.split()[-1]} rows")

    log("  Done!")


async def load_pdfs():
    """Load all PDFs from TEMP directory."""
    log("\n" + "=" * 60)
    log("STEP 2: Loading PDFs from TEMP")
    log("=" * 60)

    if not TEMP_DIR.exists():
        log(f"  Error: TEMP directory not found at {TEMP_DIR}")
        return

    pdf_files = list(TEMP_DIR.glob("*.pdf"))
    if not pdf_files:
        log("  No PDF files found")
        return

    log(f"  Found {len(pdf_files)} PDF files")

    service = SourcesService()

    # Get Milan publisher
    publisher = await service.find_publisher_by_url("https://www.comune.milano.it")
    if publisher:
        publisher_id = publisher.id
        log(f"  Using publisher: {publisher.name}")
    else:
        publisher_id = await service.get_unknown_publisher_id()
        log(f"  Using Unknown Publisher")

    for i, pdf_path in enumerate(pdf_files, 1):
        log(f"\n  [{i}/{len(pdf_files)}] Processing: {pdf_path.name}")

        metadata = PDF_METADATA.get(pdf_path.name, {})
        title = metadata.get("title", pdf_path.stem)

        log(f"    Reading file...")
        with open(pdf_path, "rb") as f:
            file_bytes = f.read()

        log(f"    Size: {len(file_bytes):,} bytes")
        log(f"    Starting PDF processing (parse, chunk, embed)...")

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
            log(f"    Created: {doc.id}")
            log(f"    Chunks: {doc.chunk_count}")
            log(f"    Status: {doc.embedding_status}")
        except Exception as e:
            log(f"    ERROR: {e}")

    log("\n  PDF loading complete!")


async def get_provision_by_slug(slug: str) -> dict | None:
    """Get a provision by slug."""
    async with db.pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, title, slug FROM gov_provisions WHERE slug = $1",
            slug,
        )
        return dict(row) if row else None


async def generate_artifacts():
    """Generate artifacts for the target provision."""
    log("\n" + "=" * 60)
    log("STEP 3: Generating artifacts")
    log("=" * 60)

    provision = await get_provision_by_slug(TARGET_PROVISION_SLUG)
    if not provision:
        log(f"  Error: Provision '{TARGET_PROVISION_SLUG}' not found")
        return

    log(f"  Provision: {provision['title']}")

    log(f"  Initializing artifact generator...")
    generator = ArtifactGenerator()

    log(f"  Starting artifact generation...")
    try:
        artifacts = await generator.generate_for_provision(provision["id"])
        log(f"\n  Generated {len(artifacts)} artifacts:")
        for a in artifacts:
            log(f"    - {a.title} ({a.artifact_type})")
    except Exception as e:
        log(f"  ERROR during generation: {e}")
        import traceback
        traceback.print_exc()
        artifacts = []

    log("\n  Artifact generation complete!")


async def main(artifacts_only: bool = False):
    log("=" * 60)
    if artifacts_only:
        log("REGENERATE ARTIFACTS ONLY")
    else:
        log("LOAD AND GENERATE ARTIFACTS")
    log("=" * 60)

    await db.connect()

    if artifacts_only:
        await cleanup_artifacts_only()
        await generate_artifacts()
    else:
        await cleanup_all()
        await load_pdfs()
        await generate_artifacts()

    await db.close()

    log("\n" + "=" * 60)
    log("ALL DONE!")
    log("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load PDFs and generate artifacts")
    parser.add_argument(
        "--artifacts-only",
        action="store_true",
        help="Only regenerate artifacts (skip PDF loading, keep existing documents)",
    )
    args = parser.parse_args()

    asyncio.run(main(artifacts_only=args.artifacts_only))
