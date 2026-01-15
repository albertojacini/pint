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


async def main():
    """Generate artifacts for all provisions of an entity."""
    # Default to Milan
    entity_slug = "comune-di-milano"

    # Allow override from command line
    if len(sys.argv) > 1:
        entity_slug = sys.argv[1]

    print(f"Generating artifacts for entity: {entity_slug}")
    print("=" * 60)

    await db.connect()

    # Get all provisions for entity
    provisions = await get_provisions_for_entity(entity_slug)
    print(f"Found {len(provisions)} provisions\n")

    if not provisions:
        print("No provisions found for this entity")
        await db.disconnect()
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

    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
