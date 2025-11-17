"""Entry point for entity enrichment agent."""

import asyncio
import sys
from graph import graph
from models import AgentState


async def run_agent(entity_input: str):
    """Run the entity enrichment agent."""

    # Initialize state
    initial_state: AgentState = {
        "entity_input": entity_input,
        "resources": [],
        "raw_content": "",
        "extracted_data": None,
        "is_complete": False,
        "feedback": "",
        "iteration": 0
    }

    # Run the graph
    final_state = await graph.ainvoke(initial_state)

    return final_state


async def main():
    """Main entry point."""
    # Get entity input from command line or use default
    if len(sys.argv) > 1:
        entity_input = " ".join(sys.argv[1:])
    else:
        entity_input = "Milan"
        print(f"No entity provided, using default: {entity_input}\n")

    await run_agent(entity_input)


if __name__ == "__main__":
    asyncio.run(main())
