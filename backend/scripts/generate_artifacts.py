"""Generate artifacts for all provisions of an entity."""

import asyncio
import sys
from pathlib import Path
from uuid import UUID

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.db import db
from apps.artifact_generation.services import ArtifactGenerator


async def get_provisions_for_entity(entity_slug: str) -> list[dict]:
    """Get all provisions for an entity by slug."""
    async with db.pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT p.id, p.title, p.slug
            FROM gov_provisions p
            JOIN gov_entities e ON e.id = p.entity_id
            WHERE e.slug = $1
            ORDER BY p.title
            """,
            entity_slug,
        )
        return [dict(row) for row in rows]


async def get_provision_by_slug(slug: str) -> dict | None:
    """Get a provision by slug."""
    async with db.pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT p.id, p.title, p.slug
            FROM gov_provisions p
            WHERE p.slug = $1
            """,
            slug,
        )
        return dict(row) if row else None


async def main():
    """Generate artifacts for all provisions of an entity."""
    # Hardcoded to ATM provision only for testing
    ATM_PROVISION_SLUG = "atm-ownership-stake"

    print("Generating artifacts for ATM Ownership Stake provision")
    print("=" * 60)

    await db.connect()

    # Get ATM provision by slug
    provision = await get_provision_by_slug(ATM_PROVISION_SLUG)
    if not provision:
        print(f"Provision '{ATM_PROVISION_SLUG}' not found")
        await db.close()
        return

    provisions = [provision]
    print(f"Found {len(provisions)} provisions\n")

    if not provisions:
        print("No provisions found for this entity")
        await db.close()
        return

    generator = ArtifactGenerator()
    total_artifacts = 0

    for i, provision in enumerate(provisions, 1):
        print(f"[{i}/{len(provisions)}] Processing: {provision['title']}")

        try:
            artifacts = await generator.generate_for_provision(UUID(str(provision["id"])))
            total_artifacts += len(artifacts)
            print(f"  Generated {len(artifacts)} artifacts\n")
        except Exception as e:
            print(f"  Error: {e}\n")
            continue

    print("=" * 60)
    print(f"Done! Generated {total_artifacts} total artifacts")

    await db.close()


if __name__ == "__main__":
    asyncio.run(main())
