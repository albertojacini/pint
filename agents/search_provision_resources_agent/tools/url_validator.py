"""URL validation tool for provision resources."""

from typing import Tuple
from urllib.parse import urlparse
from search_provision_resources_agent.models import URLValidationResult
from search_provision_resources_agent.config import ENABLE_SCRAPE_VALIDATION

CATEGORY_KEYWORDS = {
    "ownership": ["partecipat", "societ", "aziend", "company", "ownership"],
    "contract": ["contratt", "appalti", "bandi", "tender", "contract"],
    "regulation": ["regolament", "ordinanz", "normativ", "regulation", "ordinance"],
    "taxation": ["tribut", "impost", "tass", "tax", "IMU", "TARI"],
    "allocation": ["finanziament", "fondi", "contributi", "budget", "funding"],
    "designation": ["zon", "area", "vincol", "zone", "landmark", "ZTL"]
}


async def scrape_url_for_validation(url: str, mcp_client) -> Tuple[bool, str]:
    """
    Attempt to scrape URL to verify accessibility.

    Args:
        url: URL to scrape
        mcp_client: MCP client with scraping tools

    Returns:
        (is_accessible, reason)
    """
    try:
        tools = await mcp_client.get_tools()
        scrape_tool = next((t for t in tools if t.name == "scrape_as_markdown"), None)
        if not scrape_tool:
            return True, "Scraping tool unavailable, skipping check"

        result = await scrape_tool.ainvoke({"url": url})
        if result and len(result) > 100:  # Basic content check
            return True, "URL accessible and contains content"
        return False, "URL returned insufficient content"
    except Exception as e:
        return False, f"Scraping failed: {str(e)[:50]}"


async def validate_provision_url(
    url: str,
    entity_name: str,
    category: str,
    mcp_client = None
) -> URLValidationResult:
    """
    Validate and score URL (0-10).

    Scoring:
    - Official domain (.gov/.gob): +3
    - URL depth >= 2: +1
    - Contains category keywords: +2
    - Contains entity name: +2
    - Accessible via scraping: +2 (if ENABLE_SCRAPE_VALIDATION=True)

    Args:
        url: URL to validate
        entity_name: Name of the political entity
        category: Provision category
        mcp_client: Optional MCP client for scraping validation

    Returns:
        URLValidationResult with validation details
    """
    score = 0
    reasons = []

    # 1. Structure validation
    parsed = urlparse(url)
    if parsed.scheme not in ['http', 'https']:
        return URLValidationResult(url=url, is_valid=False, score=0,
                                   reason="Invalid protocol", category_match=False)

    if any(url.endswith(ext) for ext in ['.pdf', '.doc', '.xls', '.zip']):
        return URLValidationResult(url=url, is_valid=False, score=0,
                                   reason="File download, not webpage", category_match=False)

    path_depth = len([p for p in parsed.path.split('/') if p])
    if path_depth >= 2:
        score += 1
        reasons.append("Good URL depth")

    # 2. Domain authority
    domain = parsed.netloc.lower()
    if any(tld in domain for tld in ['.gov.', '.gob.', 'governo', 'comune.']):
        score += 3
        reasons.append("Official government domain")
    elif any(tld in domain for tld in ['.org', '.edu']):
        score += 1
        reasons.append("Institutional domain")

    # 3. Category relevance
    category_match = False
    url_lower = url.lower()
    if category in CATEGORY_KEYWORDS:
        for keyword in CATEGORY_KEYWORDS[category]:
            if keyword.lower() in url_lower:
                score += 2
                category_match = True
                reasons.append(f"Contains '{keyword}' keyword")
                break

    # 4. Entity name match
    entity_parts = entity_name.lower().split()
    if any(part in url_lower for part in entity_parts if len(part) > 3):
        score += 2
        reasons.append("Contains entity name")

    # 5. Accessibility check (optional - controlled by config)
    if ENABLE_SCRAPE_VALIDATION and mcp_client:
        is_accessible, scrape_reason = await scrape_url_for_validation(url, mcp_client)
        if is_accessible:
            score += 2
            reasons.append("Verified accessible")
        else:
            reasons.append(f"Not accessible: {scrape_reason}")

    is_valid = score >= 4
    reason = "; ".join(reasons) if reasons else "Low relevance score"

    return URLValidationResult(
        url=url,
        is_valid=is_valid,
        score=score,
        reason=reason,
        category_match=category_match
    )
