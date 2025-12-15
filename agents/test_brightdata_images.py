"""Test BrightData Google Images API integration."""

import asyncio
import os
import sys

# Add agents directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from avatar_generation.tools import search_images_func


async def test_image_search():
    """Test the image search functionality."""
    print("Testing BrightData Google Images API...")
    print("=" * 60)

    # Test with a well-known entity
    query = "Nike"
    print(f"\nSearching for: {query} logo")

    result = await search_images_func(query=query, max_results=3)
    print("\nResult:")
    print(result)

    print("\n" + "=" * 60)
    print("Test complete!")


if __name__ == "__main__":
    asyncio.run(test_image_search())
