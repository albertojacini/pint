"""Web operations for base_entity_info_agent - SERP search and Wikipedia API."""

from dotenv import load_dotenv
import os
import requests
from urllib.parse import quote_plus
from typing import Optional, Dict, Any

load_dotenv()


def _make_api_request(url, **kwargs):
    """Make a POST request to BrightData API."""
    api_key = os.getenv("BRIGHTDATA_API_KEY")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(url, headers=headers, **kwargs)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return None
    except Exception as e:
        print(f"Unknown error: {e}")
        return None


def serp_search(query: str, engine: str = "google") -> Optional[Dict[str, Any]]:
    """
    Search using BrightData SERP API.

    Args:
        query: Search query (e.g., "Berlino site:it.wikipedia.org")
        engine: Search engine to use ("google" or "bing")

    Returns:
        Dictionary with 'knowledge' and 'organic' search results
    """
    if engine == "google":
        base_url = "https://www.google.com/search"
    elif engine == "bing":
        base_url = "https://www.bing.com/search"
    else:
        raise ValueError(f"Unknown engine {engine}")

    url = "https://api.brightdata.com/request"

    payload = {
        "zone": "serp_api1",
        "url": f"{base_url}?q={quote_plus(query)}&brd_json=1",
        "format": "raw"
    }

    full_response = _make_api_request(url, json=payload)
    if not full_response:
        return None

    # Extract relevant parts of SERP response
    extracted_data = {
        "knowledge": full_response.get("knowledge", {}),
        "organic": full_response.get("organic", []),
    }
    return extracted_data


def fetch_wikipedia_page(page_title: str, lang: str = "it") -> Optional[Dict[str, Any]]:
    """
    Fetch Wikipedia page content using Wikipedia API.

    Args:
        page_title: Wikipedia page title (e.g., "Berlino")
        lang: Language code (default: "it" for Italian)

    Returns:
        Dictionary with page title and extracted text content
    """
    api_url = f"https://{lang}.wikipedia.org/w/api.php"

    params = {
        "action": "query",
        "prop": "extracts",
        "explaintext": "1",
        "titles": page_title,
        "format": "json"
    }

    headers = {
        "User-Agent": "PintApp/1.0 (https://github.com/albertojacini/pint; albertojacini@gmail.com)"
    }

    try:
        response = requests.get(api_url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()

        # Wikipedia API returns pages in a nested structure
        pages = data.get("query", {}).get("pages", {})

        # Get the first (and should be only) page
        if not pages:
            return {
                "success": False,
                "error": "No pages found"
            }

        page_id = next(iter(pages))
        page_data = pages[page_id]

        # Check if page exists (negative page_id means page doesn't exist)
        if int(page_id) < 0:
            return {
                "success": False,
                "error": f"Page '{page_title}' not found"
            }

        return {
            "success": True,
            "title": page_data.get("title", page_title),
            "extract": page_data.get("extract", "")
        }

    except requests.exceptions.RequestException as e:
        print(f"Wikipedia API request failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        print(f"Unknown error fetching Wikipedia: {e}")
        return {
            "success": False,
            "error": str(e)
        }
