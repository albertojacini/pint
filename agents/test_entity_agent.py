"""Test script for base_entity_info_agent."""

import sys
import os

# Add base_entity_info_agent to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'base_entity_info_agent'))

from main import build_graph

def test_entity_extraction(entity_name: str):
    """Test the entity extraction workflow."""
    print(f"\n{'='*60}")
    print(f"ENTITY INFO AGENT TEST - Researching: {entity_name}")
    print(f"{'='*60}")

    # Build the graph
    graph = build_graph()

    # Initialize state
    state = {
        "messages": [{"role": "user", "content": f"Extract information about {entity_name}"}],
        "entity_name": entity_name,
        "serp_results": None,
        "wikipedia_titles": None,
        "wiki_page_data": None,
        "extracted_entity_info": None,
        "db_result": None
    }

    # Run the workflow
    final_state = graph.invoke(state)

    # Print final result
    print(f"\n{'='*60}")
    print("FINAL RESULT")
    print(f"{'='*60}")

    if final_state.get("db_result", {}).get("success"):
        print("✓ Successfully extracted and saved entity information")
        print(f"Entity ID: {final_state['db_result'].get('entity_id')}")
        print(f"Operation: {final_state['db_result'].get('operation')}")

        # Print extracted data
        if final_state.get("extracted_entity_info"):
            info = final_state["extracted_entity_info"]
            print(f"\nExtracted Information:")
            print(f"  Name: {info.get('name')}")
            print(f"  Type: {info.get('type')}")
            print(f"  Population: {info.get('population'):,}" if info.get('population') else "  Population: N/A")
            print(f"  Description: {info.get('description', 'N/A')[:100]}...")
    else:
        print("❌ Failed to complete entity extraction")
        if final_state.get("db_result"):
            print(f"Error: {final_state['db_result'].get('error')}")

if __name__ == "__main__":
    # Test with Berlin
    test_entity_extraction("Bologna")





