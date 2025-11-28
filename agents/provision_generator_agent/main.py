"""Main entry point for the provision generator agent."""

import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from provision_generator_agent.config import GOLDMINE_URLS
from provision_generator_agent.models import ReviewDecision
from provision_generator_agent.nodes.scraper import scrape
from provision_generator_agent.nodes.extractor import extract
from provision_generator_agent.nodes.deduper import dedupe
from provision_generator_agent.nodes.reviewer import review
from provision_generator_agent.nodes.storage import (
    get_entity_id,
    get_existing_provisions,
    store,
)


async def process_url(url: str, entity_id: str, entity_name: str) -> dict:
    """
    Process a single URL through the pipeline.

    Returns:
        Stats dict with counts of approved, rejected, skipped provisions
    """
    stats = {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0}

    print(f"\n{'='*60}")
    print(f"Processing: {url}")
    print("=" * 60)

    # Step 1: Scrape
    print("\n[1/5] Scraping...")
    try:
        page = await scrape(url)
        print(f"  ✓ Got {len(page.markdown_content)} characters")
    except Exception as e:
        print(f"  ✗ Scraping failed: {e}")
        stats["errors"] += 1
        return stats

    # Step 2: Extract
    print("\n[2/5] Extracting provisions...")
    try:
        candidates = await extract(page, entity_name=entity_name)
        print(f"  ✓ Found {len(candidates)} candidate provisions")
    except Exception as e:
        print(f"  ✗ Extraction failed: {e}")
        stats["errors"] += 1
        return stats

    if not candidates:
        print("  No provisions found on this page.")
        return stats

    # Get existing provisions for deduplication
    existing = get_existing_provisions(entity_id)
    print(f"\n[3/5] Checking against {len(existing)} existing provisions...")

    # Process each candidate
    for i, candidate in enumerate(candidates, 1):
        print(f"\n--- Candidate {i}/{len(candidates)} ---")

        # Step 3: Dedupe
        try:
            result = await dedupe(candidate, existing)
        except Exception as e:
            print(f"  ✗ Deduplication failed: {e}")
            stats["errors"] += 1
            continue

        # Step 4: Review
        decision, edited_candidate = review(result)

        if decision == ReviewDecision.QUIT:
            print("\nQuitting...")
            return stats

        # Step 5: Store
        if decision == ReviewDecision.APPROVE:
            try:
                provision_id = store(edited_candidate, entity_id)
                print(f"  ✓ Stored provision: {provision_id}")
                stats["approved"] += 1
                # Add to existing for future deduplication
                existing.append({
                    "id": provision_id,
                    "title": edited_candidate.title,
                    "type": edited_candidate.type.value,
                    "description": edited_candidate.description,
                })
            except Exception as e:
                print(f"  ✗ Storage failed: {e}")
                stats["errors"] += 1
        elif decision == ReviewDecision.REJECT:
            print("  → Rejected")
            stats["rejected"] += 1
        else:  # SKIP
            print("  → Skipped")
            stats["skipped"] += 1

    return stats


async def main(entity_name: str = "Comune di Milano", urls: list[str] | None = None):
    """
    Run the provision generator pipeline.

    Args:
        entity_name: Name of the political entity
        urls: List of URLs to process (defaults to GOLDMINE_URLS)
    """
    print("\n" + "=" * 60)
    print("PROVISION GENERATOR AGENT")
    print("=" * 60)
    print(f"\nEntity: {entity_name}")

    # Get entity ID
    entity_id = get_entity_id(entity_name)
    if not entity_id:
        print(f"✗ Entity not found: {entity_name}")
        return

    print(f"Entity ID: {entity_id}")

    # Get URLs to process
    urls = urls or GOLDMINE_URLS
    print(f"URLs to process: {len(urls)}")

    # Process each URL
    total_stats = {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0}

    for url in urls:
        stats = await process_url(url, entity_id, entity_name)

        for key in total_stats:
            total_stats[key] += stats[key]

        # Check if user quit
        if stats.get("quit"):
            break

    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Approved: {total_stats['approved']}")
    print(f"  Rejected: {total_stats['rejected']}")
    print(f"  Skipped:  {total_stats['skipped']}")
    print(f"  Errors:   {total_stats['errors']}")
    print()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate provisions for a political entity")
    parser.add_argument(
        "--entity",
        default="Comune di Milano",
        help="Name of the political entity",
    )
    parser.add_argument(
        "--url",
        help="Single URL to process (instead of all goldmine URLs)",
    )
    parser.add_argument(
        "--urls",
        nargs="+",
        help="List of URLs to process (instead of all goldmine URLs)",
    )

    args = parser.parse_args()

    urls = None
    if args.url:
        urls = [args.url]
    elif args.urls:
        urls = args.urls

    asyncio.run(main(entity_name=args.entity, urls=urls))
