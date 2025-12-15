"""Custom tools for the avatar generation agent."""

import base64
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any

import httpx
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import StructuredTool
from openai import OpenAI
from PIL import Image
from pydantic import BaseModel, Field

from avatar_generation.config import (
    ANTHROPIC_API_KEY,
    BRIGHTDATA_API_KEY,
    BRIGHTDATA_PROXY_AUTH,
    DALLE_MODEL,
    DALLE_QUALITY,
    DALLE_SIZE,
    DALLE_STYLE,
    IMAGE_FORMAT,
    MIN_VALIDATION_SCORE,
    OPENAI_API_KEY,
    OUTPUT_DIR,
    TARGET_SIZE,
)


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    return re.sub(r'[^a-z0-9]+', '_', text.lower())[:50].strip('_')


# ============================================================================
# Tool 1: Search Images
# ============================================================================

class SearchImagesInput(BaseModel):
    """Input for search_images_tool."""
    query: str = Field(description="Entity name to search for (e.g., 'Azienda Trasporti Milano')")
    max_results: int = Field(default=5, description="Maximum number of results to return")


async def search_images_func(query: str, max_results: int = 5) -> str:
    """
    Search for avatar/logo images using BrightData's Google Images API.

    Args:
        query: Entity name to search for
        max_results: Maximum number of results

    Returns:
        JSON string with list of image URLs and metadata
    """
    search_query = f"{query} logo"

    # Check if BrightData proxy credentials are available
    if not BRIGHTDATA_PROXY_AUTH:
        return json.dumps({
            "error": "BRIGHTDATA_PROXY_AUTH not configured",
            "message": "Please set BRIGHTDATA_PROXY_AUTH in your .env file with format: brd-customer-XXX-zone-YYY:password",
            "query": search_query,
            "results": [],
            "count": 0,
        }, indent=2)

    try:
        # Format the search query for URL
        formatted_query = search_query.replace(" ", "+")

        # BrightData proxy configuration
        proxy_host = "brd.superproxy.io:33335"
        proxy_url = f"http://{BRIGHTDATA_PROXY_AUTH}@{proxy_host}"

        # Google Images search URL with BrightData parameters
        # tbm=isch specifies image search
        # brd_json=1 returns parsed JSON response
        url = f"https://www.google.com/search?q={formatted_query}&tbm=isch&brd_json=1"

        # Make request through BrightData proxy
        async with httpx.AsyncClient(
            proxies={"http://": proxy_url, "https://": proxy_url},
            timeout=30.0,
            verify=False  # BrightData proxy uses custom certificates
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

            data = response.json()

            # Extract image results from BrightData response
            images = data.get("images", [])

            # Format results
            results = []
            for i, img in enumerate(images[:max_results]):
                # BrightData returns images with various fields
                # Common fields: title, link, original (full size URL), thumbnail
                result = {
                    "image_url": img.get("original") or img.get("link", ""),
                    "thumbnail_url": img.get("thumbnail", ""),
                    "title": img.get("title", ""),
                    "source_page": img.get("source", ""),
                    "position": i + 1,
                }
                results.append(result)

            return json.dumps({
                "query": search_query,
                "results": results,
                "count": len(results),
                "total_found": len(images),
            }, indent=2)

    except httpx.HTTPStatusError as e:
        return json.dumps({
            "error": "HTTP error",
            "message": f"BrightData API returned status {e.response.status_code}",
            "query": search_query,
            "results": [],
            "count": 0,
        }, indent=2)
    except Exception as e:
        return json.dumps({
            "error": "Search failed",
            "message": str(e),
            "query": search_query,
            "results": [],
            "count": 0,
        }, indent=2)


def create_search_images_tool() -> StructuredTool:
    """Create tool for searching images."""
    return StructuredTool.from_function(
        coroutine=search_images_func,
        name="search_images_tool",
        description="Search for avatar/logo images for an entity. Returns JSON with image URLs and metadata.",
        args_schema=SearchImagesInput,
    )


# ============================================================================
# Tool 2: Download Image
# ============================================================================

class DownloadImageInput(BaseModel):
    """Input for download_image_tool."""
    url: str = Field(description="URL of the image to download")
    filename: str = Field(description="Filename to save as (without extension)")


async def download_image_func(url: str, filename: str) -> str:
    """
    Download an image from a URL.

    Args:
        url: Image URL
        filename: Base filename (extension will be added automatically)

    Returns:
        JSON string with download result
    """
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()

            # Determine file extension from content type
            content_type = response.headers.get("content-type", "")
            ext_map = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/gif": ".gif",
                "image/webp": ".webp",
            }
            ext = ext_map.get(content_type, ".jpg")

            # Create temp directory if it doesn't exist
            temp_dir = os.path.join(OUTPUT_DIR, "temp")
            os.makedirs(temp_dir, exist_ok=True)

            # Save file
            filepath = os.path.join(temp_dir, f"{filename}{ext}")
            with open(filepath, "wb") as f:
                f.write(response.content)

            return json.dumps({
                "success": True,
                "local_path": filepath,
                "file_size": len(response.content),
                "content_type": content_type,
            }, indent=2)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
        }, indent=2)


def create_download_image_tool() -> StructuredTool:
    """Create tool for downloading images."""
    return StructuredTool.from_function(
        coroutine=download_image_func,
        name="download_image_tool",
        description="Download an image from a URL to local storage. Returns JSON with local path and metadata.",
        args_schema=DownloadImageInput,
    )


# ============================================================================
# Tool 3: Validate Image
# ============================================================================

class ValidateImageInput(BaseModel):
    """Input for validate_image_tool."""
    image_path: str = Field(description="Path to the image file to validate")


async def validate_image_func(image_path: str) -> str:
    """
    Validate if an image is suitable as an avatar using Claude's vision API.

    Args:
        image_path: Path to the image file

    Returns:
        JSON string with validation result
    """
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            return json.dumps({
                "is_valid": False,
                "score": 0.0,
                "reasons": [f"File not found: {image_path}"],
            }, indent=2)

        # Read image and encode to base64
        with open(image_path, "rb") as f:
            image_data = base64.standard_b64encode(f.read()).decode("utf-8")

        # Determine media type
        suffix = Path(image_path).suffix.lower()
        media_type_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp"
        }
        media_type = media_type_map.get(suffix, "image/jpeg")

        # Create Claude vision request
        llm = ChatAnthropic(model="claude-sonnet-4-5", api_key=ANTHROPIC_API_KEY)

        validation_prompt = """Evaluate this image as a potential avatar/logo. Provide a score from 0 to 1.

Criteria to evaluate:
1. Is it a logo/icon/emblem (not a photograph or complex scene)?
2. Is the aspect ratio square or near-square (0.8-1.2 ratio)?
3. Is it simple and clear (not too busy or cluttered)?
4. Is the content appropriate and professional?
5. Is the resolution adequate (not too blurry)?

Be strict - avatars should be simple, iconic, and professional.

Respond in this exact format:
Score: [0.0 to 1.0]
Reasons:
- [reason 1]
- [reason 2]
- [reason 3]"""

        message = {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": image_data,
                    },
                },
                {"type": "text", "text": validation_prompt}
            ],
        }

        response = await llm.ainvoke([message])
        response_text = response.content

        # Parse response to extract score and reasons
        score = 0.0
        reasons = []

        # Extract score
        score_match = re.search(r'Score:\s*([0-9.]+)', response_text)
        if score_match:
            score = float(score_match.group(1))
            # Ensure score is in range [0, 1]
            score = max(0.0, min(1.0, score))

        # Extract reasons
        reasons_section = re.search(r'Reasons:(.*)', response_text, re.DOTALL)
        if reasons_section:
            reason_lines = reasons_section.group(1).strip().split('\n')
            reasons = [line.strip('- ').strip() for line in reason_lines if line.strip().startswith('-')]

        if not reasons:
            # Fallback: use full response as single reason
            reasons = [response_text.strip()]

        is_valid = score >= MIN_VALIDATION_SCORE

        return json.dumps({
            "is_valid": is_valid,
            "score": score,
            "reasons": reasons[:3],  # Top 3 reasons
            "raw_response": response_text,
        }, indent=2)

    except Exception as e:
        return json.dumps({
            "is_valid": False,
            "score": 0.0,
            "reasons": [f"Validation error: {str(e)}"],
        }, indent=2)


def create_validate_image_tool() -> StructuredTool:
    """Create tool for validating images."""
    return StructuredTool.from_function(
        coroutine=validate_image_func,
        name="validate_image_tool",
        description="Validate if an image is suitable as an avatar using Claude's vision API. Returns JSON with validation score (0-1) and reasons.",
        args_schema=ValidateImageInput,
    )


# ============================================================================
# Tool 4: Process Image
# ============================================================================

class ProcessImageInput(BaseModel):
    """Input for process_image_tool."""
    input_path: str = Field(description="Path to the input image file")
    output_filename: str = Field(description="Base filename for output (without extension)")


async def process_image_func(input_path: str, output_filename: str) -> str:
    """
    Process an image: resize to 512x512 and convert to PNG.

    Args:
        input_path: Path to input image
        output_filename: Base filename for output

    Returns:
        JSON string with processing result
    """
    try:
        # Open image
        img = Image.open(input_path)

        # Convert to RGB if necessary (for PNG transparency handling)
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')

        # Get current dimensions
        width, height = img.size
        aspect_ratio = width / height

        # Resize to target size
        # If not square, center crop to make it square first
        if aspect_ratio != 1.0:
            # Crop to square (center crop)
            if width > height:
                # Landscape: crop width
                left = (width - height) // 2
                img = img.crop((left, 0, left + height, height))
            else:
                # Portrait: crop height
                top = (height - width) // 2
                img = img.crop((0, top, width, top + width))

        # Resize to target size
        img = img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)

        # Ensure output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Save as PNG
        output_path = os.path.join(OUTPUT_DIR, f"{output_filename}.{IMAGE_FORMAT.lower()}")
        img.save(output_path, format=IMAGE_FORMAT, optimize=True)

        return json.dumps({
            "success": True,
            "output_path": output_path,
            "dimensions": f"{TARGET_SIZE[0]}x{TARGET_SIZE[1]}",
            "format": IMAGE_FORMAT,
        }, indent=2)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
        }, indent=2)


def create_process_image_tool() -> StructuredTool:
    """Create tool for processing images."""
    return StructuredTool.from_function(
        coroutine=process_image_func,
        name="process_image_tool",
        description="Process an image: resize to 512x512 PNG with center crop if needed. Returns JSON with output path.",
        args_schema=ProcessImageInput,
    )


# ============================================================================
# Tool 5: Generate Avatar with DALL-E
# ============================================================================

class GenerateAvatarInput(BaseModel):
    """Input for generate_avatar_dalle_tool."""
    prompt: str = Field(description="Prompt for DALL-E to generate the avatar")
    entity_name: str = Field(description="Name of the entity (for filename)")


async def generate_avatar_dalle_func(prompt: str, entity_name: str) -> str:
    """
    Generate an avatar using OpenAI DALL-E 3.

    Args:
        prompt: Description for image generation
        entity_name: Name of entity (for filename)

    Returns:
        JSON string with generation result
    """
    try:
        if not OPENAI_API_KEY:
            return json.dumps({
                "success": False,
                "error": "OPENAI_API_KEY not set in environment variables",
            }, indent=2)

        # Create OpenAI client
        client = OpenAI(api_key=OPENAI_API_KEY)

        # Generate image
        response = client.images.generate(
            model=DALLE_MODEL,
            prompt=prompt,
            size=DALLE_SIZE,
            quality=DALLE_QUALITY,
            style=DALLE_STYLE,
            n=1,
        )

        # Get image URL
        image_url = response.data[0].url

        # Download the generated image
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            img_response = await http_client.get(image_url)
            img_response.raise_for_status()

            # Create temp directory if it doesn't exist
            temp_dir = os.path.join(OUTPUT_DIR, "temp")
            os.makedirs(temp_dir, exist_ok=True)

            # Save to temp file
            slug = slugify(entity_name)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            temp_path = os.path.join(temp_dir, f"{slug}_dalle_{timestamp}.png")

            with open(temp_path, "wb") as f:
                f.write(img_response.content)

            return json.dumps({
                "success": True,
                "local_path": temp_path,
                "dalle_url": image_url,
                "prompt": prompt,
            }, indent=2)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
        }, indent=2)


def create_generate_avatar_dalle_tool() -> StructuredTool:
    """Create tool for generating avatars with DALL-E."""
    return StructuredTool.from_function(
        coroutine=generate_avatar_dalle_func,
        name="generate_avatar_dalle_tool",
        description="Generate an avatar/logo using OpenAI DALL-E 3. Returns JSON with local path to generated image.",
        args_schema=GenerateAvatarInput,
    )


# ============================================================================
# Export all tools
# ============================================================================

def create_avatar_tools() -> list[StructuredTool]:
    """Create all custom avatar tools."""
    return [
        create_search_images_tool(),
        create_download_image_tool(),
        create_validate_image_tool(),
        create_process_image_tool(),
        create_generate_avatar_dalle_tool(),
    ]
