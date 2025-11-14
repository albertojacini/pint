"""
Entity Info Agent - Extracts entity information from Wikipedia and stores in database.

Workflow:
1. Search for entity using BrightData SERP API
2. Filter and rank Wikipedia URLs
3. Fetch Wikipedia pages sequentially
4. Extract structured entity data using LLM
5. Upsert to PostgreSQL database
"""

import os
from typing import TypedDict, Annotated, List, Optional
from pydantic import BaseModel, Field

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

from web_operation import serp_search, fetch_wikipedia_page
from db_operations import upsert_entity
from prompts import (
    get_wikipedia_ranking_messages,
    get_entity_extraction_messages
)

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)


# ============================================================================
# Pydantic Models for Structured Output
# ============================================================================

class WikipediaRanking(BaseModel):
    """LLM output for ranking Wikipedia URLs."""
    selected_urls: List[str] = Field(
        description="Top 3-5 Wikipedia page titles ranked by relevance to the entity",
        max_length=5
    )


class EntityIdentityData(BaseModel):
    """Identity data for the entity (identityData JSONB field)."""
    country_code: Optional[str] = Field(None, description="ISO country code (e.g., 'IT', 'DE')")
    region_name: Optional[str] = Field(None, description="Region or state name")
    official_website: Optional[str] = Field(None, description="Official website URL")


class EntityEssentialStats(BaseModel):
    """Essential statistics for the entity (essentialStats JSONB field)."""
    area: Optional[float] = Field(None, description="Area in square kilometers")
    density: Optional[float] = Field(None, description="Population density per sq km")
    gdp_per_capita: Optional[float] = Field(None, description="GDP per capita in USD")
    timezone: Optional[str] = Field(None, description="Timezone (e.g., 'UTC+1')")
    languages: Optional[List[str]] = Field(None, description="Official or spoken languages")
    elevation: Optional[float] = Field(None, description="Elevation in meters")
    founded: Optional[str] = Field(None, description="Year or date founded/established")


class ExtractedEntityInfo(BaseModel):
    """Complete entity information extracted from Wikipedia."""
    name: str = Field(description="Official name of the entity")
    description: Optional[str] = Field(None, description="Brief description (1-2 sentences)")
    type: str = Field(description="Entity type: 'city', 'region', 'country', etc.")
    population: Optional[int] = Field(None, description="Current population")
    identity_data: EntityIdentityData = Field(description="Identity information")
    essential_stats: EntityEssentialStats = Field(description="Essential statistics")


# ============================================================================
# State Schema
# ============================================================================

class State(TypedDict):
    """State schema for the entity info agent workflow."""
    messages: Annotated[list, add_messages]
    entity_name: str | None
    serp_results: str | None
    wikipedia_titles: list[str] | None
    wiki_page_data: list[dict] | None
    extracted_entity_info: dict | None
    db_result: dict | None


# ============================================================================
# Workflow Nodes
# ============================================================================

def serp_search_node(state: State):
    """Node 1: Search for entity using BrightData SERP API."""
    entity_name = state.get("entity_name", "")
    print(f"\n[1/5] Searching for: {entity_name}")

    # Search with Italian Wikipedia preference
    search_query = f"{entity_name} site:it.wikipedia.org"
    serp_results = serp_search(search_query)

    if not serp_results:
        print("  ❌ SERP search failed")
        return {"serp_results": ""}

    print(f"  ✓ Found SERP results")
    return {"serp_results": serp_results}


def filter_and_rank_wikipedia(state: State):
    """Node 2: Filter for Wikipedia URLs and rank by relevance."""
    entity_name = state.get("entity_name", "")
    serp_results = state.get("serp_results", "")

    print(f"\n[2/5] Filtering and ranking Wikipedia pages")

    if not serp_results:
        return {"wikipedia_titles": []}

    # Use LLM with structured output to select and rank Wikipedia titles
    structured_llm = llm.with_structured_output(WikipediaRanking)
    messages = get_wikipedia_ranking_messages(entity_name, serp_results)

    try:
        ranking = structured_llm.invoke(messages)
        wikipedia_titles = ranking.selected_urls
        print(f"  ✓ Selected {len(wikipedia_titles)} Wikipedia pages")
        for i, title in enumerate(wikipedia_titles, 1):
            print(f"    {i}. {title}")
    except Exception as e:
        print(f"  ❌ Ranking failed: {e}")
        wikipedia_titles = []

    return {"wikipedia_titles": wikipedia_titles}


def fetch_wikipedia_pages_node(state: State):
    """Node 3: Fetch Wikipedia pages sequentially."""
    wikipedia_titles = state.get("wikipedia_titles", [])

    print(f"\n[3/5] Fetching Wikipedia pages")

    if not wikipedia_titles:
        return {"wiki_page_data": []}

    wiki_page_data = []
    for i, title in enumerate(wikipedia_titles, 1):
        print(f"  Fetching {i}/{len(wikipedia_titles)}: {title}")
        page_data = fetch_wikipedia_page(title)

        if page_data and page_data.get("success"):
            wiki_page_data.append(page_data)
            print(f"    ✓ Got {len(page_data.get('extract', ''))} chars")
        else:
            print(f"    ❌ Failed to fetch")

    print(f"  ✓ Successfully fetched {len(wiki_page_data)} pages")
    return {"wiki_page_data": wiki_page_data}


def extract_entity_data_node(state: State):
    """Node 4: Extract structured entity data using LLM."""
    entity_name = state.get("entity_name", "")
    wiki_page_data = state.get("wiki_page_data", [])

    print(f"\n[4/5] Extracting entity data")

    if not wiki_page_data:
        print("  ❌ No Wikipedia data to extract from")
        return {"extracted_entity_info": None}

    # Combine all Wikipedia page extracts
    combined_text = "\n\n---\n\n".join([
        f"Page: {page['title']}\n{page['extract']}"
        for page in wiki_page_data
    ])

    # Use LLM with structured output to extract entity information
    structured_llm = llm.with_structured_output(ExtractedEntityInfo)
    messages = get_entity_extraction_messages(entity_name, combined_text)

    try:
        entity_info = structured_llm.invoke(messages)
        # Convert Pydantic model to dict
        entity_dict = {
            "name": entity_info.name,
            "description": entity_info.description,
            "type": entity_info.type,
            "population": entity_info.population,
            "identity_data": entity_info.identity_data.model_dump(exclude_none=True),
            "essential_stats": entity_info.essential_stats.model_dump(exclude_none=True)
        }

        print(f"  ✓ Extracted entity: {entity_info.name}")
        print(f"    Type: {entity_info.type}")
        print(f"    Population: {entity_info.population}")

        return {"extracted_entity_info": entity_dict}
    except Exception as e:
        print(f"  ❌ Extraction failed: {e}")
        return {"extracted_entity_info": None}


def upsert_to_database_node(state: State):
    """Node 5: Insert or update entity in database."""
    entity_info = state.get("extracted_entity_info")

    print(f"\n[5/5] Saving to database")

    if not entity_info:
        print("  ❌ No entity info to save")
        return {"db_result": {"success": False, "error": "No entity info"}}

    db_result = upsert_entity(entity_info)

    if db_result.get("success"):
        operation = db_result.get("operation")
        entity_id = db_result.get("entity_id")
        print(f"  ✓ {operation.upper()}: {entity_info['name']} (ID: {entity_id})")
    else:
        print(f"  ❌ Database error: {db_result.get('error')}")

    return {"db_result": db_result}


# ============================================================================
# Build Graph
# ============================================================================

def build_graph():
    """Build the LangGraph workflow."""
    graph_builder = StateGraph(State)

    # Add nodes
    graph_builder.add_node("serp_search", serp_search_node)
    graph_builder.add_node("filter_and_rank", filter_and_rank_wikipedia)
    graph_builder.add_node("fetch_wikipedia", fetch_wikipedia_pages_node)
    graph_builder.add_node("extract_data", extract_entity_data_node)
    graph_builder.add_node("upsert_db", upsert_to_database_node)

    # Define edges (linear workflow)
    graph_builder.add_edge(START, "serp_search")
    graph_builder.add_edge("serp_search", "filter_and_rank")
    graph_builder.add_edge("filter_and_rank", "fetch_wikipedia")
    graph_builder.add_edge("fetch_wikipedia", "extract_data")
    graph_builder.add_edge("extract_data", "upsert_db")
    graph_builder.add_edge("upsert_db", END)

    return graph_builder.compile()


# ============================================================================
# Main Execution
# ============================================================================

if __name__ == "__main__":
    # Build the graph
    graph = build_graph()

    # Example: Extract info for Berlin
    entity_name = input("Enter entity name to research: ").strip()

    if not entity_name:
        print("No entity name provided")
        exit(1)

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
    print(f"\n{'='*60}")
    print(f"ENTITY INFO AGENT - Researching: {entity_name}")
    print(f"{'='*60}")

    final_state = graph.invoke(state)

    # Print final result
    print(f"\n{'='*60}")
    print("FINAL RESULT")
    print(f"{'='*60}")

    if final_state.get("db_result", {}).get("success"):
        print("✓ Successfully extracted and saved entity information")
        print(f"Entity ID: {final_state['db_result'].get('entity_id')}")
        print(f"Operation: {final_state['db_result'].get('operation')}")
    else:
        print("❌ Failed to complete entity extraction")
        if final_state.get("db_result"):
            print(f"Error: {final_state['db_result'].get('error')}")
