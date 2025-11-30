"""Main entry point for the search provision resources agent."""

import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from search_provision_resources_agent.agent import create_search_agent
from search_provision_resources_agent.db import get_entity_by_name, batch_insert_resources
from search_provision_resources_agent.config import PROVISION_CATEGORIES
from search_provision_resources_agent.tools.search_tools import build_search_queries
from search_provision_resources_agent.tools.url_validator import validate_provision_url


async def main(entity_name: str, categories: list[str] = None):
    """
    Run the search provision resources agent.

    Args:
        entity_name: Name of the political entity
        categories: List of provision categories to search (default: all)
    """
    print("\n" + "=" * 60)
    print("SEARCH PROVISION RESOURCES AGENT")
    print("=" * 60)
    print(f"\nEntity: {entity_name}")

    # Get entity from DB
    try:
        entity = get_entity_by_name(entity_name)
        print(f"Entity ID: {entity.id}")
        print(f"Language: {entity.language}")
    except ValueError as e:
        print(f"✗ Error: {e}")
        return

    # Default to all categories
    if not categories:
        categories = PROVISION_CATEGORIES
    print(f"Categories: {', '.join(categories)}")

    # Build search queries
    queries = build_search_queries(entity.name, entity.language, categories)
    print(f"\nGenerated {len(queries)} search queries")

    # Create and run agent
    print("\nInitializing deep agent...")
    agent, mcp_client = await create_search_agent()

    # Prepare the message for the agent
    queries_text = "\n".join([f"- {q['query']} (category: {q['category']})" for q in queries])

    user_message = f"""
Find provision resource URLs for the political entity: {entity.name}

Entity language: {entity.language}
Categories to search: {', '.join(categories)}

Here are the search queries you should execute:
{queries_text}

For each query:
1. Use the search_engine tool to find relevant URLs
2. Extract unique URLs from the search results
3. Validate each URL to ensure it's a high-quality provision resource
4. Keep only URLs with a quality score >= 4/10

Return a list of validated URLs organized by category.

Important guidelines:
- Focus on official government sources (.gov, .gob, .comune domains)
- Avoid PDFs, news articles, and social media
- Prefer specific pages over generic homepages
- URLs should contain provision-related content (regulations, taxes, owned companies, etc.)
"""

    print("Running agent...")
    result = await agent.ainvoke({"messages": [{"role": "user", "content": user_message}]})

    print("\n" + "=" * 60)
    print("AGENT RESULT")
    print("=" * 60)
    print(result)

    # TODO: Extract validated URLs from agent result
    # The deep agent should return structured data with the URLs
    # For now, we'll need to parse the result or have the agent use a specific format
    validated_urls = []

    if validated_urls:
        # Insert to database
        print(f"\nInserting {len(validated_urls)} URLs to database...")
        inserted = batch_insert_resources(entity.id, validated_urls)

        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"  URLs found: {len(validated_urls)}")
        print(f"  URLs inserted: {inserted}")
        print()
    else:
        print("\nNote: URL extraction from agent result not yet implemented.")
        print("The agent has completed its search. Check the output above for results.")
        print("Logs saved to: /tmp/search_provision_agent/")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Search for provision resources")
    parser.add_argument("--entity", required=True, help="Political entity name")
    parser.add_argument(
        "--categories",
        nargs="+",
        choices=PROVISION_CATEGORIES,
        help="Categories to search (default: all)"
    )

    args = parser.parse_args()
    asyncio.run(main(entity_name=args.entity, categories=args.categories))
