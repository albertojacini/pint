"""Extractor node - ReAct agent that extracts provisions from scraped content."""

import json
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

from provision_generator_agent.models import CandidateProvision, ScrapedPage, ProvisionType
from provision_generator_agent.prompts.extraction import (
    EXTRACTION_SYSTEM_PROMPT,
    EXTRACTION_USER_PROMPT,
)
from utils.mcp_client import get_mcp_tools


class ExtractorAgent:
    """ReAct agent for extracting provisions from webpage content."""

    def __init__(self, entity_name: str = "Comune di Milano"):
        self.entity_name = entity_name
        self.extracted_provisions: list[CandidateProvision] = []
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

    async def _get_tools(self):
        """Get tools for the agent."""
        mcp_tools = await get_mcp_tools()
        scrape_tool = next(t for t in mcp_tools if t.name == "scrape_as_markdown")

        # Wrap scrape tool with our interface
        @tool
        async def scrape_url(url: str) -> str:
            """Scrape a URL to get more details about a provision. Use this when you find a link that might have more specific information about a provision."""
            result = await scrape_tool.ainvoke({"url": url})
            return result

        # Create submit tool
        @tool
        def submit_provisions(provisions_json: str) -> str:
            """Submit the final list of extracted provisions. Call this when you're done analyzing the page.

            Args:
                provisions_json: JSON string containing a list of provisions, each with:
                    - title: string
                    - type: one of "ownership", "contract", "regulation", "taxation", "allocation", "designation"
                    - description: string
                    - effective_from: string (YYYY-MM-DD) or null
                    - source_snippet: string or null
            """
            try:
                provisions_data = json.loads(provisions_json)
                if not isinstance(provisions_data, list):
                    provisions_data = [provisions_data]

                for p in provisions_data:
                    self.extracted_provisions.append(
                        CandidateProvision(
                            title=p["title"],
                            type=ProvisionType(p["type"]),
                            description=p["description"],
                            effective_from=p.get("effective_from"),
                            source_url="",  # Will be set by caller
                            source_snippet=p.get("source_snippet"),
                        )
                    )
                return f"Successfully submitted {len(provisions_data)} provisions."
            except json.JSONDecodeError as e:
                return f"Error parsing JSON: {e}. Please provide valid JSON."
            except Exception as e:
                return f"Error submitting provisions: {e}"

        return [scrape_url, submit_provisions]

    async def extract(self, page: ScrapedPage) -> list[CandidateProvision]:
        """
        Extract provisions from a scraped page.

        Args:
            page: ScrapedPage with url and markdown_content

        Returns:
            List of CandidateProvision objects
        """
        self.extracted_provisions = []

        tools = await self._get_tools()
        agent = create_react_agent(self.llm, tools, prompt=EXTRACTION_SYSTEM_PROMPT)

        user_message = EXTRACTION_USER_PROMPT.format(
            entity_name=self.entity_name,
            url=page.url,
            content=page.markdown_content[:15000],  # Limit content size
        )

        await agent.ainvoke({"messages": [("human", user_message)]})

        # Set source URL on all extracted provisions
        for p in self.extracted_provisions:
            p.source_url = page.url

        return self.extracted_provisions


async def extract(page: ScrapedPage, entity_name: str = "Comune di Milano") -> list[CandidateProvision]:
    """
    Extract provisions from a scraped page.

    Args:
        page: ScrapedPage with url and markdown_content
        entity_name: Name of the political entity

    Returns:
        List of CandidateProvision objects
    """
    agent = ExtractorAgent(entity_name=entity_name)
    return await agent.extract(page)
