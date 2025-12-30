"""Source loader for fetching, validating, and summarizing web sources.

This module provides the SourceLoader class which handles:
- Detecting source type (Wikipedia, web, etc.)
- Fetching content using appropriate method (Wikipedia API vs web scraping)
- Validating content quality with heuristics (no LLM)
- Summarizing valid content with LLM for efficient downstream processing
"""

import re
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse, unquote

from langchain_core.tools import BaseTool
from langchain_anthropic import ChatAnthropic


@dataclass
class LoadResult:
    """Result of loading and processing a source."""
    raw_content: Optional[str]
    source_summary: Optional[str]
    source_type: str  # 'wikipedia', 'web', 'pdf', 'other'
    content_quality: str  # 'good', 'partial', 'failed'
    error: Optional[str] = None


class SourceLoader:
    """Loads, validates, and summarizes web sources."""

    # Patterns that indicate garbage content
    GARBAGE_PATTERNS = [
        r"enable javascript",
        r"javascript is required",
        r"please enable cookies",
        r"access denied",
        r"403 forbidden",
        r"404 not found",
        r"captcha",
        r"cloudflare",
        r"just a moment",
        r"checking your browser",
        r"verifying you are human",
    ]

    # Minimum content length for valid content
    MIN_CONTENT_LENGTH = 200

    # Maximum content to send to summarizer
    MAX_CONTENT_FOR_SUMMARY = 12000

    def __init__(
        self,
        scrape_tool: Optional[BaseTool],
        wikipedia_tool: Optional[BaseTool],
        model: Optional[ChatAnthropic] = None
    ):
        """
        Initialize the source loader.

        Args:
            scrape_tool: BrightData scrape_as_markdown tool
            wikipedia_tool: Wikipedia query_wikipedia tool
            model: LLM model for summarization (defaults to Haiku)
        """
        self.scrape_tool = scrape_tool
        self.wikipedia_tool = wikipedia_tool
        self.model = model or ChatAnthropic(
            model="claude-3-5-haiku-20241022",
            temperature=0,
            max_tokens=1000
        )

    async def load(self, url: str, research_context: str) -> LoadResult:
        """
        Load, validate, and optionally summarize a source.

        Args:
            url: The URL to load
            research_context: The research question/topic for focused summarization

        Returns:
            LoadResult with content, summary, type, and quality
        """
        # 1. Detect source type
        source_type = self._detect_type(url)

        # 2. Fetch content
        raw_content, fetch_error = await self._fetch(url, source_type)

        if fetch_error or not raw_content:
            return LoadResult(
                raw_content=raw_content,
                source_summary=None,
                source_type=source_type,
                content_quality="failed",
                error=fetch_error or "Empty content"
            )

        # 3. Validate content quality (heuristics, no LLM)
        content_quality, validation_error = self._validate(raw_content)

        if content_quality == "failed":
            return LoadResult(
                raw_content=raw_content,
                source_summary=None,
                source_type=source_type,
                content_quality="failed",
                error=validation_error
            )

        # 4. Summarize if content is good enough
        source_summary = None
        if content_quality == "good":
            source_summary = await self._summarize(raw_content, research_context, url)

        return LoadResult(
            raw_content=raw_content,
            source_summary=source_summary,
            source_type=source_type,
            content_quality=content_quality,
            error=None
        )

    def _detect_type(self, url: str) -> str:
        """Detect the type of source from URL."""
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        if "wikipedia.org" in domain:
            return "wikipedia"
        elif url.lower().endswith(".pdf"):
            return "pdf"
        else:
            return "web"

    def _extract_wikipedia_title(self, url: str) -> Optional[str]:
        """Extract Wikipedia article title from URL."""
        parsed = urlparse(url)
        path = parsed.path

        # Handle /wiki/Title format
        if "/wiki/" in path:
            title = path.split("/wiki/")[-1]
            # URL decode and replace underscores with spaces
            title = unquote(title).replace("_", " ")
            # Remove any section anchors
            if "#" in title:
                title = title.split("#")[0]
            return title

        return None

    def _extract_wikipedia_language(self, url: str) -> str:
        """Extract language code from Wikipedia URL."""
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        # Extract language from subdomain (e.g., it.wikipedia.org -> it)
        if ".wikipedia.org" in domain:
            lang = domain.split(".wikipedia.org")[0]
            if lang and lang != "www":
                return lang

        return "en"

    async def _fetch(self, url: str, source_type: str) -> tuple[Optional[str], Optional[str]]:
        """
        Fetch content from URL using appropriate method.

        Returns:
            Tuple of (content, error_message)
        """
        try:
            if source_type == "wikipedia" and self.wikipedia_tool:
                title = self._extract_wikipedia_title(url)
                language = self._extract_wikipedia_language(url)

                if title:
                    content = await self.wikipedia_tool.ainvoke({
                        "title": title,
                        "language": language
                    })
                    return content, None
                else:
                    # Fall back to scraping if we can't parse the URL
                    pass

            # Default: use web scraper
            if self.scrape_tool:
                content = await self.scrape_tool.ainvoke({"url": url})
                return content, None
            else:
                return None, "No scrape tool available"

        except Exception as e:
            return None, str(e)

    def _validate(self, content: str) -> tuple[str, Optional[str]]:
        """
        Validate content quality using heuristics.

        Returns:
            Tuple of (quality, error_message)
            quality: 'good', 'partial', or 'failed'
        """
        if not content:
            return "failed", "Empty content"

        content_lower = content.lower()

        # Check minimum length
        if len(content) < self.MIN_CONTENT_LENGTH:
            return "failed", f"Content too short ({len(content)} chars)"

        # Check for garbage patterns
        for pattern in self.GARBAGE_PATTERNS:
            if re.search(pattern, content_lower):
                return "failed", f"Garbage content detected: {pattern}"

        # Check markup ratio (too much HTML/markdown formatting)
        markup_chars = content.count("<") + content.count(">") + content.count("[") + content.count("]")
        markup_ratio = markup_chars / len(content) if content else 0

        if markup_ratio > 0.3:
            return "partial", f"High markup ratio ({markup_ratio:.1%})"

        # Check for very short lines (might be navigation/menu content)
        lines = content.split("\n")
        short_lines = sum(1 for line in lines if len(line.strip()) < 20)
        short_line_ratio = short_lines / len(lines) if lines else 0

        if short_line_ratio > 0.7:
            return "partial", "Mostly short lines (possibly navigation)"

        return "good", None

    async def _summarize(self, content: str, research_context: str, url: str) -> str:
        """
        Summarize source content focused on the research context.

        Args:
            content: Raw content to summarize
            research_context: The research question/topic
            url: Source URL for context

        Returns:
            Focused summary of the content
        """
        # Truncate content to avoid token overflow
        truncated_content = content[:self.MAX_CONTENT_FOR_SUMMARY]
        if len(content) > self.MAX_CONTENT_FOR_SUMMARY:
            truncated_content += "\n\n[... content truncated ...]"

        prompt = f"""Summarize this source for research on: "{research_context}"

Source URL: {url}

Extract and summarize:
- Key facts, statistics, and data points
- Main claims and arguments
- Relevant dates, names, and entities
- Any policies, regulations, or official information

Be concise but comprehensive. Focus on information relevant to the research topic.
Output 200-400 words in clear prose.

---
SOURCE CONTENT:
{truncated_content}
---

SUMMARY:"""

        response = await self.model.ainvoke(prompt)

        # Extract content from response
        if hasattr(response, "content"):
            return response.content
        return str(response)
