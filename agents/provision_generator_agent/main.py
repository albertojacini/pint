"""Main entry point for the provision generator agent."""

import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from langgraph.types import Command

from provision_generator_agent.db import get_pending_resources, update_resource_status
from provision_generator_agent.graph import compile_graph


def get_user_decision() -> str:
    """Get decision from user via CLI."""
    print("[A]pprove  [R]eject  [E]dit  [S]kip  [Q]uit")
    while True:
        choice = input("> ").strip().lower()
        if choice in ("a", "approve", "r", "reject", "e", "edit", "s", "skip", "q", "quit"):
            return choice
        print("Invalid choice. Please enter A, R, E, S, or Q.")


async def process_url_interactive(graph, url: str, entity_id: str, entity_name: str, thread_id: str) -> dict:
    """
    Process a URL with proper interrupt handling for multiple candidates.
    """
    config = {"configurable": {"thread_id": thread_id}}

    initial_state = {
        "url": url,
        "entity_id": entity_id,
        "entity_name": entity_name,
        "page": None,
        "candidates": [],
        "existing_provisions": [],
        "current_candidate_index": 0,
        "current_candidate": None,
        "current_dedupe_result": None,
        "current_decision": None,
        "stats": {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0},
        "stored_provision_ids": [],
        "should_quit": False,
    }

    print(f"\n{'='*60}")
    print(f"Processing: {url}")
    print("=" * 60)

    # Start the graph
    current_input = initial_state

    while True:
        # Run until interrupt or completion
        async for event in graph.astream(current_input, config, stream_mode="updates"):
            pass  # Just consume events

        # Check state
        state = graph.get_state(config)

        if not state.next:
            # Graph completed
            break

        if state.next == ("review",) or "review" in state.next:
            # Interrupted at review node - get human input
            decision = get_user_decision()
            current_input = Command(resume=decision)
        else:
            # Unexpected state
            break

    return state.values.get("stats", {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0})


async def main(entity_name: str = "Comune di Milano", limit: int = 10):
    """
    Run the provision generator pipeline.

    Args:
        entity_name: Name of the political entity
        limit: Maximum number of resources to process
    """
    print("\n" + "=" * 60)
    print("PROVISION GENERATOR AGENT (LangGraph)")
    print("=" * 60)
    print(f"\nEntity: {entity_name}")

    # Get pending resources from DB
    resources = get_pending_resources(entity_name, limit)
    if not resources:
        print(f"✗ No pending resources found for: {entity_name}")
        return

    print(f"Resources to process: {len(resources)}")

    # Compile graph once
    graph = compile_graph()

    # Process each resource
    total_stats = {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0}

    for i, resource in enumerate(resources):
        thread_id = f"provision-{resource['entity_id']}-{i}"

        try:
            stats = await process_url_interactive(
                graph,
                resource["url"],
                resource["entity_id"],
                entity_name,
                thread_id,
            )

            for key in total_stats:
                total_stats[key] += stats.get(key, 0)

            # Mark as processed
            update_resource_status(resource["id"], "processed")

        except Exception as e:
            print(f"✗ Error processing {resource['url']}: {e}")
            update_resource_status(resource["id"], "failed")
            total_stats["errors"] += 1

        # Check if user quit
        final_state = graph.get_state({"configurable": {"thread_id": thread_id}})
        if final_state.values.get("should_quit"):
            print("\nUser requested quit. Stopping...")
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
        "--limit",
        type=int,
        default=10,
        help="Maximum number of resources to process",
    )

    args = parser.parse_args()

    asyncio.run(main(entity_name=args.entity, limit=args.limit))
