"""Test DALL-E image generation for avatar creation."""

import asyncio
import json
import os
import sys

# Add agents directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from avatar_generation.tools import generate_avatar_dalle_func, process_image_func


async def test_dalle_generation():
    """Test DALL-E image generation."""
    print("Testing DALL-E 3 Image Generation")
    print("=" * 60)

    # Test entities
    test_cases = [
        {
            "entity_name": "Regolamento artisti di strada",
            "prompt": "A simple, modern icon representing street artists regulation. The design should feature a stylized street performer silhouette or a musical note combined with urban elements. Minimalist style, suitable as an avatar icon, professional, using vibrant colors like orange, blue, or purple. Clean lines, easily recognizable at small sizes"
        }
    ]

    for i, test_case in enumerate(test_cases, 1):
        entity_name = test_case["entity_name"]
        prompt = test_case["prompt"]

        print(f"\nTest {i}: {entity_name}")
        print("-" * 60)
        print(f"Prompt: {prompt}")
        print("\nGenerating image with DALL-E 3...")

        # Generate image
        result_json = await generate_avatar_dalle_func(
            prompt=prompt,
            entity_name=entity_name
        )

        result = json.loads(result_json)

        if result.get("success"):
            print("✓ Generation successful!")
            print(f"  Generated image path: {result['local_path']}")
            print(f"  DALL-E URL: {result['dalle_url']}")

            # Verify file exists
            if os.path.exists(result['local_path']):
                file_size = os.path.getsize(result['local_path'])
                print(f"  File size: {file_size:,} bytes")

                # Test processing the generated image
                print("\nProcessing image to 512x512 PNG...")
                from avatar_generation.tools import slugify
                from datetime import datetime

                slug = slugify(entity_name)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                output_filename = f"{slug}_{timestamp}_dalle"

                process_result_json = await process_image_func(
                    input_path=result['local_path'],
                    output_filename=output_filename
                )

                process_result = json.loads(process_result_json)

                if process_result.get("success"):
                    print("✓ Processing successful!")
                    print(f"  Final avatar path: {process_result['output_path']}")
                    print(f"  Dimensions: {process_result['dimensions']}")
                    print(f"  Format: {process_result['format']}")
                else:
                    print(f"✗ Processing failed: {process_result.get('error')}")
            else:
                print(f"✗ File not found at {result['local_path']}")
        else:
            print(f"✗ Generation failed: {result.get('error')}")
            if "OPENAI_API_KEY" in result.get('error', ''):
                print("\n⚠️  Make sure OPENAI_API_KEY is set in your .env file")
                break

        if i < len(test_cases):
            print("\n" + "=" * 60)

    print("\n" + "=" * 60)
    print("Test complete!")


async def test_single_generation():
    """Quick test with a single entity."""
    print("Quick DALL-E Generation Test")
    print("=" * 60)

    entity_name = "Regolamento artisti di strada"
    prompt = "A simple, modern icon representing street artists regulation. The design should feature a stylized street performer silhouette or a musical note combined with urban elements. Minimalist style, suitable as an avatar icon, professional, using vibrant colors like orange, blue, or purple. Clean lines, easily recognizable at small sizes"

    print(f"\nEntity: {entity_name}")
    print(f"Prompt: {prompt}")
    print("\nGenerating...")

    result_json = await generate_avatar_dalle_func(
        prompt=prompt,
        entity_name=entity_name
    )

    result = json.loads(result_json)
    print("\nResult:")
    print(json.dumps(result, indent=2))

    print("\n" + "=" * 60)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test DALL-E image generation")
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Run quick test with single generation"
    )

    args = parser.parse_args()

    if args.quick:
        asyncio.run(test_single_generation())
    else:
        asyncio.run(test_dalle_generation())
