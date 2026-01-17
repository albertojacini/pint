"""
Combined script: Clean seed data, load PDFs, and generate artifacts.

Usage:
    cd /backend && source .venv/bin/activate
    python scripts/load_and_generate.py
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

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
TARGET_PROVISION_SLUG = "atm-ownership-stake"


async def cleanup_seed_data():
    """Remove all existing artifacts and documents (seed data)."""
    print("\n" + "=" * 60)
    print("STEP 1: Cleaning up seed data")
    print("=" * 60)

    async with db.pool.acquire() as conn:
        # Delete artifact sources (links artifacts to documents)
        r1 = await conn.execute("DELETE FROM kno_artifact_sources")
        print(f"  Deleted artifact sources: {r1.split()[-1]} rows")

        # Delete provision-artifact links
        r2 = await conn.execute("DELETE FROM gov_provision_artifacts")
        print(f"  Deleted provision-artifact links: {r2.split()[-1]} rows")

        # Delete artifacts
        r3 = await conn.execute("DELETE FROM kno_artifacts")
        print(f"  Deleted artifacts: {r3.split()[-1]} rows")

        # Delete document chunks
        r4 = await conn.execute("DELETE FROM sou_document_chunks")
        print(f"  Deleted document chunks: {r4.split()[-1]} rows")

        # Delete documents
        r5 = await conn.execute("DELETE FROM sou_documents")
        print(f"  Deleted documents: {r5.split()[-1]} rows")

    print("  Done!")


async def load_pdfs():
    """Load all PDFs from TEMP directory."""
    print("\n" + "=" * 60)
    print("STEP 2: Loading PDFs from TEMP")
    print("=" * 60)

    if not TEMP_DIR.exists():
        print(f"  Error: TEMP directory not found at {TEMP_DIR}")
        return

    pdf_files = list(TEMP_DIR.glob("*.pdf"))
    if not pdf_files:
        print("  No PDF files found")
        return

    print(f"  Found {len(pdf_files)} PDF files")

    service = SourcesService()

    # Get Milan publisher
    publisher = await service.find_publisher_by_url("https://www.comune.milano.it")
    if publisher:
        publisher_id = publisher.id
        print(f"  Using publisher: {publisher.name}")
    else:
        publisher_id = await service.get_unknown_publisher_id()
        print(f"  Using Unknown Publisher")

    for pdf_path in pdf_files:
        print(f"\n  Processing: {pdf_path.name}")

        metadata = PDF_METADATA.get(pdf_path.name, {})
        title = metadata.get("title", pdf_path.stem)

        with open(pdf_path, "rb") as f:
            file_bytes = f.read()

        print(f"    Size: {len(file_bytes):,} bytes")

        doc = await service.process_pdf_upload(
            file_bytes=file_bytes,
            filename=pdf_path.name,
            title=title,
            publisher_id=publisher_id,
            document_category=metadata.get("document_category"),
            administrative_level=metadata.get("administrative_level"),
            fiscal_year=metadata.get("fiscal_year"),
        )
        print(f"    Created: {doc.id}")
        print(f"    Chunks: {doc.chunk_count}")
        print(f"    Status: {doc.embedding_status}")

    print("\n  PDF loading complete!")


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
    print("\n" + "=" * 60)
    print("STEP 3: Generating artifacts")
    print("=" * 60)

    provision = await get_provision_by_slug(TARGET_PROVISION_SLUG)
    if not provision:
        print(f"  Error: Provision '{TARGET_PROVISION_SLUG}' not found")
        return

    print(f"  Provision: {provision['title']}")

    generator = ArtifactGenerator()
    artifacts = await generator.generate_for_provision(provision["id"])

    print(f"\n  Generated {len(artifacts)} artifacts:")
    for a in artifacts:
        print(f"    - {a.title} ({a.artifact_type})")

    print("\n  Artifact generation complete!")


async def main():
    print("=" * 60)
    print("LOAD AND GENERATE ARTIFACTS")
    print("=" * 60)

    await db.connect()

    await cleanup_seed_data()
    await load_pdfs()
    await generate_artifacts()

    await db.close()

    print("\n" + "=" * 60)
    print("ALL DONE!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
