"""LangGraph workflow for entity enrichment."""

import os
import sys
from typing import Literal
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import create_react_agent
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from utils.mcp_client import get_mcp_client
from entity_info_enrichment_agent.models import AgentState


# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Initialize MCP client
mcp_client = get_mcp_client()


async def search_resources_node(state: AgentState) -> AgentState:
    """Node 1: Search for relevant resources using MCP tools."""

    # Create ReAct agent with search tools
    tools = await mcp_client.get_tools()
    search_tools = [t for t in tools if t.name in ["query_wikipedia", "search_engine"]]

    agent = create_agent(llm, search_tools)

    # Build prompt
    if state["iteration"] == 0:
        prompt = f"Find relevant resources about the entity: {state['entity_input']}. Start with Wikipedia, then try web search if needed."
    else:
        prompt = f"Find more resources about {state['entity_input']}. Previous attempt was incomplete: {state['feedback']}. Try different sources."

    # Run agent
    result = await agent.ainvoke({"messages": [HumanMessage(content=prompt)]})

    # Extract resources from agent actions
    resources = []
    for msg in result["messages"]:
        if hasattr(msg, "tool_calls"):
            for tool_call in msg.tool_calls:
                if tool_call["name"] == "query_wikipedia":
                    resources.append({
                        "identifier": tool_call["args"]["title"],
                        "type": "wikipedia",
                        "language": tool_call["args"].get("language", "en")
                    })
                elif tool_call["name"] == "search_engine":
                    # Extract URLs from search results (stored in messages)
                    pass  # Will be in next message content

    state["resources"] = resources if resources else [{"identifier": state["entity_input"], "type": "wikipedia", "language": "en"}]
    return state


async def fetch_content_node(state: AgentState) -> AgentState:
    """Node 2: Fetch content from resources using MCP tools."""

    # Create ReAct agent with fetch tools
    tools = await mcp_client.get_tools()
    fetch_tools = [t for t in tools if t.name in ["query_wikipedia", "scrape_as_markdown", "scrape_batch"]]

    agent = create_react_agent(llm, fetch_tools)

    # Build prompt
    resources_str = "\n".join([f"- {r['type']}: {r['identifier']}" for r in state["resources"]])
    prompt = f"""Fetch content from these resources about {state['entity_input']}:
{resources_str}

For Wikipedia resources, use query_wikipedia. For web URLs, use scrape_as_markdown."""

    # Run agent
    result = await agent.ainvoke({"messages": [HumanMessage(content=prompt)]})

    # Extract content from tool results
    content_parts = []
    for msg in result["messages"]:
        if hasattr(msg, "content") and isinstance(msg.content, str) and len(msg.content) > 100:
            content_parts.append(msg.content)

    state["raw_content"] = "\n\n---\n\n".join(content_parts)
    return state


async def extract_data_node(state: AgentState) -> AgentState:
    """Node 3: Extract structured data from raw content."""

    prompt = f"""Extract the following information about {state['entity_input']} from the content below:
- name: Official name
- description: Brief description (1-2 sentences)
- population: Current population (integer, if available)

Return ONLY a JSON object with these fields. If population is not found, set it to null.

Content:
{state['raw_content'][:5000]}  # Limit content length

Output format:
{{"name": "...", "description": "...", "population": 123456}}"""

    result = await llm.ainvoke([HumanMessage(content=prompt)])

    # Parse JSON from response
    import json
    content = result.content.strip()
    # Extract JSON from markdown code blocks if present
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    state["extracted_data"] = json.loads(content)
    return state


async def quality_check_node(state: AgentState) -> AgentState:
    """Node 4: Check if extracted data is complete and accurate."""

    prompt = f"""Review this extracted data about {state['entity_input']}:
{state['extracted_data']}

Is this data:
1. Accurate (does it match the entity)?
2. Complete (are all fields filled with meaningful information)?
3. High quality (is the description informative)?

Respond with:
- "COMPLETE" if the data is good
- "INCOMPLETE: [specific reason]" if more data is needed

Be concise."""

    result = await llm.ainvoke([HumanMessage(content=prompt)])
    response = result.content.strip()

    if response.startswith("COMPLETE"):
        state["is_complete"] = True
        state["feedback"] = ""
    else:
        state["is_complete"] = False
        state["feedback"] = response.replace("INCOMPLETE:", "").strip()

    return state


def route_after_quality_check(state: AgentState) -> Literal["search_resources", "output"]:
    """Conditional edge: retry or finish."""
    if state["is_complete"]:
        return "output"
    elif state["iteration"] < 2:
        return "search_resources"
    else:
        return "output"  # Max iterations reached, output what we have


async def output_node(state: AgentState) -> AgentState:
    """Final node: Pretty print results."""
    print("\n" + "="*60)
    print(f"ENTITY ENRICHMENT RESULT: {state['entity_input']}")
    print("="*60)

    if state["extracted_data"]:
        data = state["extracted_data"]
        print(f"\nName: {data.get('name', 'N/A')}")
        print(f"\nDescription: {data.get('description', 'N/A')}")
        print(f"\nPopulation: {data.get('population', 'N/A')}")
    else:
        print("\nNo data extracted.")

    print(f"\nIterations: {state['iteration']}")
    print(f"Status: {' Complete' if state['is_complete'] else ' Incomplete'}")

    if not state["is_complete"]:
        print(f"Reason: {state['feedback']}")

    print("\n" + "="*60 + "\n")

    return state


# Build the graph
def build_graph():
    """Build and compile the LangGraph workflow."""
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("search_resources", search_resources_node)
    workflow.add_node("fetch_content", fetch_content_node)
    workflow.add_node("extract_data", extract_data_node)
    workflow.add_node("quality_check", quality_check_node)
    workflow.add_node("output", output_node)

    # Add edges
    workflow.set_entry_point("search_resources")
    workflow.add_edge("search_resources", "fetch_content")
    workflow.add_edge("fetch_content", "extract_data")
    workflow.add_edge("extract_data", "quality_check")

    # Conditional edge from quality_check
    workflow.add_conditional_edges(
        "quality_check",
        route_after_quality_check,
        {
            "search_resources": "search_resources",
            "output": "output"
        }
    )

    # Increment iteration before retrying
    def increment_iteration(state: AgentState) -> AgentState:
        state["iteration"] += 1
        return state

    workflow.add_edge("output", END)

    return workflow.compile()


# Export the compiled graph
graph = build_graph()
