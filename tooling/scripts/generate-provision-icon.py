#!/usr/bin/env python3
"""Generate a flat-style icon for a provision using Gemini image generation.

Generates an image from a text prompt, then crops and resizes it to a square icon.

Usage:
    python generate-provision-icon.py <prompt> [output] [--size 64] [--alpha-threshold 128] [--model gemini-2.5-flash-image]

Examples:
    python generate-provision-icon.py "a green trolleybus"
    python generate-provision-icon.py "a bicycle lane" bike-lane.png
    python generate-provision-icon.py "a metro train" --size 128

Requires: google-genai, Pillow
API key: set GEMINI_API_KEY environment variable
"""

import argparse
import os
import re
import sys
from io import BytesIO
from pathlib import Path

from google import genai
from google.genai import types
from PIL import Image

# Load .env from project root
_env_path = Path(__file__).resolve().parents[2] / ".env"
if _env_path.exists():
    for line in _env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

STYLE_PREFIX = (
    "A flat-design icon illustration on a pure transparent background. "
    "Bold, simple shapes with minimal detail. No text, no labels, no shadows. "
    "Clean vector-art style with vivid colors. Subject: "
)


def generate_image(prompt: str, model: str = "gemini-2.5-flash-image") -> Image.Image:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    full_prompt = STYLE_PREFIX + prompt

    response = client.models.generate_content(
        model=model,
        contents=full_prompt,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
        ),
    )

    for part in response.parts:
        if part.inline_data is not None:
            return Image.open(BytesIO(part.inline_data.data)).convert("RGBA")

    print("Error: No image returned by the model", file=sys.stderr)
    if response.text:
        print(f"Model response: {response.text}", file=sys.stderr)
    sys.exit(1)


def crop_to_icon(img: Image.Image, size: int = 64, alpha_threshold: int = 128) -> Image.Image:
    pixels = img.load()
    w, h = img.size

    left, top, right, bottom = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if pixels[x, y][3] > alpha_threshold:
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)

    if left >= right or top >= bottom:
        print("Warning: No visible content found, returning as-is", file=sys.stderr)
        return img.resize((size, size), Image.LANCZOS)

    cropped = img.crop((left, top, right + 1, bottom + 1))
    cw, ch = cropped.size

    ratio = min(size / cw, size / ch)
    new_w, new_h = int(cw * ratio), int(ch * ratio)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - new_w) // 2, (size - new_h) // 2))
    return canvas


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:60]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a flat-style provision icon.")
    parser.add_argument("prompt", help="Description of the icon subject")
    parser.add_argument("output", nargs="?", help="Output path (default: <slugified-prompt>-<size>.png)")
    parser.add_argument("--size", type=int, default=64, help="Output square size in px (default: 64)")
    parser.add_argument("--alpha-threshold", type=int, default=128, help="Min alpha to count as content (default: 128)")
    parser.add_argument("--model", default="gemini-2.5-flash-image", help="Gemini model (default: gemini-2.5-flash-image)")
    parser.add_argument("--raw", action="store_true", help="Save raw generated image (skip crop)")
    args = parser.parse_args()

    output = args.output
    if not output:
        slug = slugify(args.prompt)
        output = f"{slug}-{args.size}.png"

    print(f"Generating: {args.prompt}", flush=True)
    raw_image = generate_image(args.prompt, model=args.model)

    raw_path = output.replace(".png", "-raw.png")
    raw_image.save(raw_path)
    print(f"Raw image saved: {raw_path} ({raw_image.size[0]}x{raw_image.size[1]})")

    if args.raw:
        print(f"Done (raw mode, no crop)")
    else:
        icon = crop_to_icon(raw_image, size=args.size, alpha_threshold=args.alpha_threshold)
        icon.save(output)
        print(f"Icon saved: {output} ({args.size}x{args.size})")
