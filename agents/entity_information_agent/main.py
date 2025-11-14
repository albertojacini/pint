"""Enhanced Entity Information Agent with 8-node LangGraph workflow."""

import os
import asyncio
import json
from typing import Dict, List, Optional, Any, TypedDict
from datetime import datetime
from dotenv import load_dotenv

# LangGraph imports
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

# Local imports
from models import (
    CompleteEntityInfo, WikipediaRanking, SERPResult, WebsiteContent,
    EntityIdentityData, EntityEssentialStats, PoliticalLandscape,
    PerformanceIndicators, CommunityMetrics
)
from web_operations import (
    get_serp_results, get_wikipedia_content, search_official_website,
    extract_wikipedia_urls
)
from mcp_operations import scrape_website_sync, extract_political_data_from_website
from db_operations import upsert_entity, test_connection
from prompts import PromptTemplates

# Load environment variables
load_dotenv()


# Define the state structure for LangGraph
class AgentState(TypedDict):
    """State structure for the entity information agent."""
    # Input
    entity_name: str
    entity_type: str
    language: str

    # Intermediate data
    serp_results: Optional[List[Dict]]
    wikipedia_urls: Optional[List[str]]
    wikipedia_content: Optional[Dict]
    official_website_url: Optional[str]
    website_content: Optional[Dict]

    # Extracted data
    basic_info: Optional[Dict]
    political_data: Optional[Dict]

    # Final output
    complete_entity: Optional[CompleteEntityInfo]
    db_result: Optional[Dict]

    # Metadata
    errors: List[str]
    timestamp: str


class EntityInformationAgent:
    """Agent for collecting comprehensive political/administrative entity data."""

    def __init__(self):
        """Initialize the agent with LLM and tools."""
        # Initialize LLM (OpenAI)
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0,
            max_tokens=4096
        )

        # Initialize prompts
        self.prompts = PromptTemplates()

        # Build the graph
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the 8-node LangGraph workflow."""
        # Create workflow
        workflow = StateGraph(AgentState)

        # Add nodes
        workflow.add_node("search_serp", self.search_serp_node)
        workflow.add_node("filter_wikipedia", self.filter_wikipedia_node)
        workflow.add_node("fetch_wikipedia", self.fetch_wikipedia_node)
        workflow.add_node("extract_basic_info", self.extract_basic_info_node)
        workflow.add_node("find_official_website", self.find_official_website_node)
        workflow.add_node("scrape_website", self.scrape_website_node)
        workflow.add_node("extract_political_data", self.extract_political_data_node)
        workflow.add_node("save_to_database", self.save_to_database_node)

        # Add edges (workflow sequence)
        workflow.add_edge("search_serp", "filter_wikipedia")
        workflow.add_edge("filter_wikipedia", "fetch_wikipedia")
        workflow.add_edge("fetch_wikipedia", "extract_basic_info")
        workflow.add_edge("extract_basic_info", "find_official_website")
        workflow.add_edge("find_official_website", "scrape_website")
        workflow.add_edge("scrape_website", "extract_political_data")
        workflow.add_edge("extract_political_data", "save_to_database")
        workflow.add_edge("save_to_database", END)

        # Set entry point
        workflow.set_entry_point("search_serp")

        return workflow.compile()

    # Node 1: Search SERP
    def search_serp_node(self, state: AgentState) -> Dict:
        """Search for entity information using SERP API."""
        print(f"🔍 Searching for: {state['entity_name']}")

        try:
            query = f"{state['entity_name']} {state['entity_type']} Wikipedia"
            results = get_serp_results(query, language=state['language'])

            # Convert to dict format
            serp_results = [
                {
                    'title': r.title,
                    'url': r.url,
                    'snippet': r.snippet,
                    'is_wikipedia': r.is_wikipedia,
                    'is_official': r.is_official
                }
                for r in results
            ]

            return {"serp_results": serp_results}
        except Exception as e:
            error_msg = f"SERP search failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {"errors": state.get("errors", []) + [error_msg]}

    # Node 2: Filter and rank Wikipedia URLs
    def filter_wikipedia_node(self, state: AgentState) -> Dict:
        """Filter and rank Wikipedia URLs from SERP results."""
        print("📋 Filtering Wikipedia URLs...")

        if not state.get("serp_results"):
            return {"wikipedia_urls": []}

        try:
            # Extract Wikipedia URLs
            wikipedia_results = [
                r for r in state["serp_results"]
                if r.get("is_wikipedia", False)
            ]

            if not wikipedia_results:
                print("⚠️ No Wikipedia results found")
                return {"wikipedia_urls": []}

            # Use LLM to rank results
            prompt = self.prompts.RANK_WIKIPEDIA.format(
                entity_name=state["entity_name"],
                entity_type=state["entity_type"],
                search_results=self.prompts.format_search_results(wikipedia_results)
            )

            response = self.llm.invoke(prompt)
            ranking_data = json.loads(response.content)

            # Order URLs based on ranking
            ranked_urls = []
            for idx in ranking_data.get("rankings", []):
                if idx < len(wikipedia_results):
                    ranked_urls.append(wikipedia_results[idx]["url"])

            print(f"✅ Found {len(ranked_urls)} Wikipedia URLs")
            return {"wikipedia_urls": ranked_urls}

        except Exception as e:
            error_msg = f"Wikipedia filtering failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "wikipedia_urls": [],
                "errors": state.get("errors", []) + [error_msg]
            }

    # Node 3: Fetch Wikipedia content
    def fetch_wikipedia_node(self, state: AgentState) -> Dict:
        """Fetch content from the top-ranked Wikipedia page."""
        print("📖 Fetching Wikipedia content...")

        if not state.get("wikipedia_urls"):
            return {"wikipedia_content": None}

        try:
            # Try top-ranked URL first
            for url in state["wikipedia_urls"][:3]:  # Try top 3 if needed
                content = get_wikipedia_content(url, language=state["language"])
                if content and content.get("extract"):
                    print(f"✅ Fetched Wikipedia content from: {url}")
                    return {"wikipedia_content": content}

            print("⚠️ No valid Wikipedia content found")
            return {"wikipedia_content": None}

        except Exception as e:
            error_msg = f"Wikipedia fetch failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "wikipedia_content": None,
                "errors": state.get("errors", []) + [error_msg]
            }

    # Node 4: Extract basic entity information
    def extract_basic_info_node(self, state: AgentState) -> Dict:
        """Extract basic entity information from Wikipedia content."""
        print("🔍 Extracting basic entity information...")

        if not state.get("wikipedia_content"):
            print("⚠️ No Wikipedia content to extract from")
            return {"basic_info": None}

        try:
            prompt = self.prompts.EXTRACT_BASIC_INFO.format(
                entity_name=state["entity_name"],
                wikipedia_content=json.dumps(state["wikipedia_content"], ensure_ascii=False)
            )

            response = self.llm.invoke(prompt)
            basic_info = json.loads(response.content)

            print(f"✅ Extracted basic information for: {state['entity_name']}")
            return {"basic_info": basic_info}

        except Exception as e:
            error_msg = f"Basic info extraction failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "basic_info": None,
                "errors": state.get("errors", []) + [error_msg]
            }

    # Node 5: Find official website
    def find_official_website_node(self, state: AgentState) -> Dict:
        """Search for and identify the official government website."""
        print("🌐 Searching for official website...")

        try:
            # First check if we got it from Wikipedia
            if state.get("basic_info") and state["basic_info"].get("identity_data"):
                official_url = state["basic_info"]["identity_data"].get("official_website")
                if official_url:
                    print(f"✅ Found official website from Wikipedia: {official_url}")
                    return {"official_website_url": official_url}

            # Search using SERP
            official_url = search_official_website(
                entity_name=state["entity_name"],
                entity_type=state["entity_type"],
                country="italia" if state["language"] == "it" else None
            )

            if official_url:
                print(f"✅ Found official website: {official_url}")
                return {"official_website_url": official_url}

            print("⚠️ No official website found")
            return {"official_website_url": None}

        except Exception as e:
            error_msg = f"Official website search failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "official_website_url": None,
                "errors": state.get("errors", []) + [error_msg]
            }

    # Node 6: Scrape official website
    def scrape_website_node(self, state: AgentState) -> Dict:
        """Scrape content from the official website if found."""
        print("🕷️ Scraping official website...")

        if not state.get("official_website_url"):
            print("⚠️ No official website to scrape")
            return {"website_content": None}

        try:
            # Use synchronous wrapper for MCP operations
            website_content = scrape_website_sync(state["official_website_url"])

            if website_content:
                print(f"✅ Successfully scraped website")
                return {"website_content": website_content.dict()}
            else:
                print("⚠️ Could not scrape website content")
                return {"website_content": None}

        except Exception as e:
            error_msg = f"Website scraping failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "website_content": None,
                "errors": state.get("errors", []) + [error_msg]
            }

    # Node 7: Extract political landscape data
    def extract_political_data_node(self, state: AgentState) -> Dict:
        """Extract political landscape information from all sources."""
        print("🏛️ Extracting political landscape data...")

        try:
            # Prepare content for extraction
            website_content = ""
            if state.get("website_content"):
                website_content = state["website_content"].get("content", "")[:5000]

            wikipedia_content = ""
            if state.get("wikipedia_content"):
                wikipedia_content = state["wikipedia_content"].get("extract", "")[:5000]

            prompt = self.prompts.EXTRACT_POLITICAL_LANDSCAPE.format(
                entity_name=state["entity_name"],
                website_content=website_content or "No website content available",
                wikipedia_content=wikipedia_content or "No Wikipedia content available"
            )

            response = self.llm.invoke(prompt)
            political_data = json.loads(response.content)

            print("✅ Extracted political landscape data")
            return {"political_data": political_data}

        except Exception as e:
            error_msg = f"Political data extraction failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "political_data": None,
                "errors": state.get("errors", []) + [error_msg]
            }

    # Node 8: Save to database
    def save_to_database_node(self, state: AgentState) -> Dict:
        """Combine all data and save to database."""
        print("💾 Saving to database...")

        try:
            # Combine all extracted data
            basic_info = state.get("basic_info", {})
            political_data = state.get("political_data", {})

            # Create CompleteEntityInfo object
            entity = CompleteEntityInfo(
                name=state["entity_name"],
                description=basic_info.get("description"),
                type=state["entity_type"],
                population=basic_info.get("population"),
                avatar_url=state.get("wikipedia_content", {}).get("main_image"),
                identity_data=EntityIdentityData(**basic_info.get("identity_data", {})),
                essential_stats=EntityEssentialStats(**basic_info.get("essential_stats", {})),
                political_landscape=PoliticalLandscape(**political_data) if political_data else None
            )

            # Save to database
            db_result = upsert_entity(entity)

            print(f"✅ Entity saved to database: {db_result}")
            return {
                "complete_entity": entity,
                "db_result": db_result
            }

        except Exception as e:
            error_msg = f"Database save failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "complete_entity": None,
                "db_result": None,
                "errors": state.get("errors", []) + [error_msg]
            }

    async def process_entity(
        self,
        entity_name: str,
        entity_type: str = "city",
        language: str = "it"
    ) -> Dict[str, Any]:
        """
        Process a political/administrative entity through the full workflow.

        Args:
            entity_name: Name of the entity
            entity_type: Type of entity (city, region, country)
            language: Language for search (default: Italian)

        Returns:
            Dictionary with processing results
        """
        print(f"\n{'='*60}")
        print(f"🚀 Processing entity: {entity_name} ({entity_type})")
        print(f"{'='*60}\n")

        # Initialize state
        initial_state = AgentState(
            entity_name=entity_name,
            entity_type=entity_type,
            language=language,
            serp_results=None,
            wikipedia_urls=None,
            wikipedia_content=None,
            official_website_url=None,
            website_content=None,
            basic_info=None,
            political_data=None,
            complete_entity=None,
            db_result=None,
            errors=[],
            timestamp=datetime.utcnow().isoformat()
        )

        # Run the graph
        try:
            result = await self.graph.ainvoke(initial_state)

            print(f"\n{'='*60}")
            if result.get("db_result") and result["db_result"].get("operation") != "error":
                print(f"✅ Successfully processed: {entity_name}")
                print(f"   Operation: {result['db_result']['operation']}")
                print(f"   Entity ID: {result['db_result'].get('entity_id')}")
            else:
                print(f"⚠️ Processing completed with issues")
                if result.get("errors"):
                    print(f"   Errors: {', '.join(result['errors'])}")
            print(f"{'='*60}\n")

            return result
        except Exception as e:
            print(f"❌ Fatal error processing entity: {str(e)}")
            return {
                "error": str(e),
                "entity_name": entity_name
            }


# Convenience functions for testing
async def main():
    """Main function for testing the agent."""
    # Test database connection first
    if not test_connection():
        print("❌ Database connection failed. Please check your DATABASE_URL.")
        return

    # Initialize agent
    agent = EntityInformationAgent()

    # Test with an Italian city
    result = await agent.process_entity(
        entity_name="Bologna",
        entity_type="city",
        language="it"
    )

    # Print summary
    if result.get("complete_entity"):
        entity = result["complete_entity"]
        print("\n📊 Entity Summary:")
        print(f"  Name: {entity.name}")
        print(f"  Type: {entity.type}")
        print(f"  Population: {entity.population:,}" if entity.population else "  Population: N/A")
        print(f"  Description: {entity.description}")
        if entity.political_landscape and entity.political_landscape.current_mayor:
            print(f"  Mayor: {entity.political_landscape.current_mayor.name}")


if __name__ == "__main__":
    asyncio.run(main())