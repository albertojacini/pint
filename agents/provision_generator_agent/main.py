"""Main entry point for the provision generator agent."""

import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from langgraph.types import Command

from provision_generator_agent.config import GOLDMINE_URLS
from provision_generator_agent.graph import compile_graph
from provision_generator_agent.nodes.storage import get_entity_id


def get_user_decision() -> str:
    """Get decision from user via CLI."""
    print("[A]pprove  [R]eject  [E]dit  [S]kip  [Q]uit")
    while True:
        choice = input("> ").strip().lower()
        if choice in ("a", "approve", "r", "reject", "e", "edit", "s", "skip", "q", "quit"):
            return choice
        print("Invalid choice. Please enter A, R, E, S, or Q.")


async def process_url(graph, url: str, entity_id: str, entity_name: str, thread_id: str) -> dict:
    """
    Process a single URL through the graph.

    Returns:
        Stats dict with counts of approved, rejected, skipped provisions
    """
    config = {"configurable": {"thread_id": thread_id}}

    # Initial state
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

    # Run graph until completion or interrupt
    result = None
    async for event in graph.astream(initial_state, config, stream_mode="updates"):
        # Check for interrupt
        if "__interrupt__" in event:
            interrupt_info = event["__interrupt__"][0]
            # Human review needed
            decision = get_user_decision()
            # Resume with decision
            async for resume_event in graph.astream(
                Command(resume=decision), config, stream_mode="updates"
            ):
                if "__interrupt__" in resume_event:
                    # Another interrupt (another candidate)
                    decision = get_user_decision()
                    # Continue resuming - need to handle nested interrupts
                    continue

    # Get final state
    final_state = graph.get_state(config)
    return final_state.values.get("stats", {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0})


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


async def main(entity_name: str = "Comune di Milano", urls: list[str] | None = None):
    """
    Run the provision generator pipeline.

    Args:
        entity_name: Name of the political entity
        urls: List of URLs to process (defaults to GOLDMINE_URLS)
    """
    print("\n" + "=" * 60)
    print("PROVISION GENERATOR AGENT (LangGraph)")
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

    # Compile graph once
    graph = compile_graph()

    # Process each URL
    total_stats = {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0}

    for i, url in enumerate(urls):
        thread_id = f"provision-{entity_id}-{i}"
        stats = await process_url_interactive(graph, url, entity_id, entity_name, thread_id)

        for key in total_stats:
            total_stats[key] += stats.get(key, 0)

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
