"""Extractor node - extracts provisions from scraped content using structured output."""

from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from provision_generator_agent.models import CandidateProvision, ScrapedPage, ProvisionType
from provision_generator_agent.prompts.extraction import (
    EXTRACTION_SYSTEM_PROMPT,
    EXTRACTION_USER_PROMPT,
)


class ExtractedProvision(BaseModel):
    """A provision extracted by the LLM (without source_url which is set later)."""

    title: str
    type: ProvisionType
    description: str
    effective_from: str | None = None
    source_snippet: str | None = None


class ExtractionResult(BaseModel):
    """Result of extraction containing a list of provisions."""

    provisions: list[ExtractedProvision]


async def extract(page: ScrapedPage, entity_name: str = "Comune di Milano") -> list[CandidateProvision]:
    """
    Extract provisions from a scraped page.

    Args:
        page: ScrapedPage with url and markdown_content
        entity_name: Name of the political entity

    Returns:
        List of CandidateProvision objects
    """
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    structured_llm = llm.with_structured_output(ExtractionResult)

    user_message = EXTRACTION_USER_PROMPT.format(
        entity_name=entity_name,
        url=page.url,
        content=page.markdown_content[:15000],  # Limit content size
    )

    result = await structured_llm.ainvoke([
        ("system", EXTRACTION_SYSTEM_PROMPT),
        ("human", user_message),
    ])

    # Convert to CandidateProvision with source_url
    return [
        CandidateProvision(
            title=p.title,
            type=p.type,
            description=p.description,
            effective_from=p.effective_from,
            source_url=page.url,
            source_snippet=p.source_snippet,
        )
        for p in result.provisions
    ]
