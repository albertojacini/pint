"""Web operations for Wikipedia and BrightData SERP API calls."""

import os
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
import time
import json
from models import SERPResult


def get_serp_results(
    query: str,
    api_key: Optional[str] = None,
    num_results: int = 10,
    language: str = "it"
) -> List[SERPResult]:
    """
    Fetch search engine results using BrightData SERP API.

    Args:
        query: Search query
        api_key: BrightData API key (uses env var if not provided)
        num_results: Number of results to return
        language: Language for search (default: Italian)

    Returns:
        List of SERP results
    """
    api_key = api_key or os.getenv("BRIGHTDATA_API_KEY")
    if not api_key:
        raise ValueError("BRIGHTDATA_API_KEY not found in environment")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Construct Google search URL (brd_json=1 tells BrightData to return JSON)
    google_url = f"https://www.google.com/search?q={requests.utils.quote(query)}&hl={language}&num={num_results}&brd_json=1"

    payload = {
        "zone": "serp_api1",
        "url": google_url,
        "format": "raw"
    }

    try:
        response = requests.post(
            "https://api.brightdata.com/request",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()

        # Debug: print response if it's not JSON
        try:
            search_results = response.json()
        except json.JSONDecodeError:
            print(f"⚠️ BrightData API response is not JSON. Status: {response.status_code}")
            print(f"Response text (first 500 chars): {response.text[:500]}")
            return []

        # Parse organic results
        results = []
        organic = search_results.get("organic", [])

        for result in organic[:num_results]:
            serp_result = SERPResult(
                title=result.get("title", ""),
                url=result.get("link", ""),
                snippet=result.get("snippet"),
                is_wikipedia="wikipedia.org" in result.get("link", "").lower(),
                is_official=any(domain in result.get("link", "").lower()
                              for domain in [".gov", ".gov.it", "comune.", "provincia.", "regione."])
            )
            results.append(serp_result)

        return results

    except requests.exceptions.RequestException as e:
        print(f"Error fetching SERP results: {e}")
        return []


def get_wikipedia_content(
    page_title: str,
    language: str = "it",
    extract_images: bool = True
) -> Optional[Dict[str, Any]]:
    """
    Fetch Wikipedia page content using the Wikipedia API.

    Args:
        page_title: Wikipedia page title or full URL
        language: Language code (default: Italian)
        extract_images: Whether to extract images including coat of arms

    Returns:
        Dictionary with page content and metadata
    """
    # Extract page title from URL if needed
    if "wikipedia.org" in page_title:
        page_title = page_title.split("/wiki/")[-1]
        # Extract language from URL if present
        if "." in page_title:
            lang_part = page_title.split(".wikipedia.org")[0].split("//")[-1]
            if len(lang_part) == 2:
                language = lang_part

    # Clean up title
    page_title = page_title.replace("_", " ")

    # API endpoint
    api_url = f"https://{language}.wikipedia.org/w/api.php"

    # Parameters for content extraction
    params = {
        "action": "query",
        "format": "json",
        "titles": page_title,
        "prop": "extracts|pageimages|info|categories",
        "explaintext": 1,
        "exsectionformat": "plain",
        "inprop": "url",
        "piprop": "original",
        "cllimit": 50  # Get categories to identify entity type
    }

    # Set User-Agent
    headers = {
        "User-Agent": "PintEntityAgent/1.0 (https://pint.pub; contact@pint.pub)"
    }

    try:
        response = requests.get(api_url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Extract page data
        pages = data.get("query", {}).get("pages", {})
        if not pages:
            return None

        # Get first (and should be only) page
        page = next(iter(pages.values()))

        if "missing" in page:
            return None

        result = {
            "title": page.get("title"),
            "extract": page.get("extract"),
            "url": page.get("fullurl"),
            "categories": [cat.get("title", "").replace("Categoria:", "")
                          for cat in page.get("categories", [])],
            "timestamp": datetime.utcnow().isoformat()
        }

        # Extract image if available (often coat of arms for cities)
        if "original" in page:
            result["main_image"] = page["original"].get("source")
            result["main_image_width"] = page["original"].get("width")
            result["main_image_height"] = page["original"].get("height")

        # If we need more detailed info (infobox), make additional request
        if extract_images:
            infobox_data = get_wikipedia_infobox(page_title, language)
            if infobox_data:
                result["infobox"] = infobox_data

        return result

    except requests.exceptions.RequestException as e:
        print(f"Error fetching Wikipedia content: {e}")
        return None


def get_wikipedia_infobox(page_title: str, language: str = "it") -> Optional[Dict[str, Any]]:
    """
    Extract infobox data from Wikipedia page (includes structured data).

    Args:
        page_title: Wikipedia page title
        language: Language code

    Returns:
        Dictionary with infobox data
    """
    api_url = f"https://{language}.wikipedia.org/w/api.php"

    params = {
        "action": "parse",
        "format": "json",
        "page": page_title,
        "prop": "wikitext",
        "section": 0  # Usually infobox is in first section
    }

    headers = {
        "User-Agent": "PintEntityAgent/1.0 (https://pint.pub; contact@pint.pub)"
    }

    try:
        response = requests.get(api_url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        if "error" in data:
            return None

        wikitext = data.get("parse", {}).get("wikitext", {}).get("*", "")

        # Basic parsing of infobox data
        # This is simplified - could use mwparserfromhell for better parsing
        infobox_data = {}

        # Look for common infobox fields
        patterns = {
            "stemma": r"\|[\s]*Stemma[\s]*=[\s]*([^\n|]*)",
            "sito": r"\|[\s]*Sito[\s]*=[\s]*([^\n|]*)",
            "sindaco": r"\|[\s]*Sindaco[\s]*=[\s]*([^\n|]*)",
            "superficie": r"\|[\s]*Superficie[\s]*=[\s]*([^\n|]*)",
            "abitanti": r"\|[\s]*Abitanti[\s]*=[\s]*([^\n|]*)",
            "densita": r"\|[\s]*Densità[\s]*=[\s]*([^\n|]*)",
            "cap": r"\|[\s]*CAP[\s]*=[\s]*([^\n|]*)",
            "prefisso": r"\|[\s]*Prefisso[\s]*=[\s]*([^\n|]*)",
        }

        import re
        for field, pattern in patterns.items():
            match = re.search(pattern, wikitext, re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                # Clean wiki markup
                value = re.sub(r'\[\[([^|\]]+)\|?[^\]]*\]\]', r'\1', value)
                value = re.sub(r'{{[^}]+}}', '', value)
                infobox_data[field] = value.strip()

        return infobox_data if infobox_data else None

    except Exception as e:
        print(f"Error extracting infobox: {e}")
        return None


def search_official_website(
    entity_name: str,
    entity_type: str = "comune",
    country: str = "italia"
) -> Optional[str]:
    """
    Search for the official website of a political entity.

    Args:
        entity_name: Name of the entity
        entity_type: Type of entity (comune, provincia, regione)
        country: Country name

    Returns:
        URL of official website if found
    """
    # Construct targeted search query
    query = f"sito ufficiale {entity_type} {entity_name} {country}"

    results = get_serp_results(query, num_results=5)

    # Look for official government domains
    for result in results:
        if result.is_official:
            return result.url

    # Fallback: look for comune/provincia/regione in domain
    for result in results:
        url_lower = result.url.lower()
        if entity_type.lower() in url_lower and entity_name.lower().replace(" ", "") in url_lower:
            return result.url

    return None


def extract_wikipedia_urls(serp_results: List[SERPResult], language: str = "it") -> List[str]:
    """
    Extract Wikipedia URLs from SERP results.

    Args:
        serp_results: List of SERP results
        language: Preferred language for Wikipedia

    Returns:
        List of Wikipedia URLs
    """
    wikipedia_urls = []

    for result in serp_results:
        if result.is_wikipedia:
            # Prefer the specified language
            if f"{language}.wikipedia.org" in result.url:
                wikipedia_urls.insert(0, result.url)
            else:
                wikipedia_urls.append(result.url)

    return wikipedia_urls