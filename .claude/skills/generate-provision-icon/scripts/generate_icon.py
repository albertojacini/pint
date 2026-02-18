#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "google-genai>=1.0.0",
#     "pillow>=10.0.0",
#     "numpy>=1.24.0",
# ]
# ///
"""Generate a flat-style icon for a provision using Gemini image generation.

Takes a reference photo and generates an "avatarized" flat-design icon matching
a consistent style (defined by an example image).

Usage:
    uv run .claude/skills/generate-provision-icon/scripts/generate_icon.py <prompt> <reference-image> [output] [--size 128] [--alpha-threshold 128] [--model gemini-2.5-flash-image]

Examples:
    uv run .claude/skills/generate-provision-icon/scripts/generate_icon.py "a green city bus" bus-photo.jpg
    uv run .claude/skills/generate-provision-icon/scripts/generate_icon.py "a bicycle lane" lane-photo.png bike-lane.png
    uv run .claude/skills/generate-provision-icon/scripts/generate_icon.py "a metro train" metro.jpg --size 256

Requires: google-genai, Pillow
API key: set GEMINI_API_KEY environment variable
"""

import argparse
import os
import re
import sys
from io import BytesIO
from pathlib import Path

import numpy as np
from google import genai
from google.genai import types
from PIL import Image

# Resolve project root (4 levels up from this script)
_PROJECT_ROOT = Path(__file__).resolve().parents[4]

# Load .env from project root
_env_path = _PROJECT_ROOT / ".env"
if _env_path.exists():
    for line in _env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

STYLE_EXAMPLE_PATH = (
    _PROJECT_ROOT
    / ".claude/skills/generate-provision-icon/assets/trolleybus-64.png"
)

CHROMA_TOLERANCE = 60  # how far a pixel can be from detected bg color and still count as background

STYLE_PREFIX = (
    "A flat-design icon illustration on a solid bright green background (#00C800). "
    "Bold, simple shapes with minimal detail. No text, no labels, no shadows. "
    "Clean vector-art style with vivid colors. "
    "The background MUST be a uniform, solid bright green (#00C800) with no gradients or patterns. "
    "Subject: "
)


def generate_image(
    prompt: str,
    reference_image_path: str,
    model: str = "gemini-2.5-flash-image",
) -> Image.Image:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    reference_image = Image.open(reference_image_path)
    style_image = Image.open(STYLE_EXAMPLE_PATH)

    full_prompt = (
        f"{STYLE_PREFIX}{prompt}. "
        f"Use the first image as the reference for the subject. "
        f"Use the second image as the style reference — match its flat icon aesthetic exactly."
    )

    response = client.models.generate_content(
        model=model,
        contents=[full_prompt, reference_image, style_image],
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


def detect_background_color(img: Image.Image) -> np.ndarray:
    """Auto-detect background color by sampling corner pixels."""
    arr = np.array(img)[:, :, :3]
    h, w = arr.shape[:2]
    margin = max(5, min(h, w) // 20)
    samples = np.concatenate([
        arr[:margin, :margin].reshape(-1, 3),
        arr[:margin, -margin:].reshape(-1, 3),
        arr[-margin:, :margin].reshape(-1, 3),
        arr[-margin:, -margin:].reshape(-1, 3),
    ])
    return np.median(samples, axis=0).astype(np.float32)


def remove_background(img: Image.Image) -> Image.Image:
    """Remove solid-color background via chroma-keying using numpy."""
    bg_color = detect_background_color(img)
    print(f"Detected background color: RGB({bg_color[0]:.0f}, {bg_color[1]:.0f}, {bg_color[2]:.0f})")

    arr = np.array(img, dtype=np.float32)
    rgb = arr[:, :, :3]
    dist = np.sqrt(np.sum((rgb - bg_color) ** 2, axis=2))

    # Create alpha: 0 where close to bg, 255 where far — smooth transition at the edge
    alpha = np.clip((dist - CHROMA_TOLERANCE * 0.3) / (CHROMA_TOLERANCE * 0.7) * 255, 0, 255).astype(np.uint8)

    result = np.array(img)
    result[:, :, 3] = np.minimum(result[:, :, 3], alpha)
    return Image.fromarray(result, "RGBA")


def crop_to_icon(img: Image.Image, size: int = 128, alpha_threshold: int = 128) -> Image.Image:
    pixels = img.load()
    w, h = img.size

    # Find bounding box of non-transparent content
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

    # Tight crop — remove all transparent padding
    cropped = img.crop((left, top, right + 1, bottom + 1))
    cw, ch = cropped.size

    # Fit into target size, preserving aspect ratio
    ratio = min(size / cw, size / ch)
    new_w, new_h = int(cw * ratio), int(ch * ratio)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    # Center on a transparent canvas
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
    parser.add_argument("reference_image", help="Path to reference photo for the subject")
    parser.add_argument("output", nargs="?", help="Output path (default: <slugified-prompt>-<size>.png)")
    parser.add_argument("--size", type=int, default=128, help="Output square size in px (default: 128)")
    parser.add_argument("--alpha-threshold", type=int, default=128, help="Min alpha to count as content (default: 128)")
    parser.add_argument("--model", default="gemini-2.5-flash-image", help="Gemini model (default: gemini-2.5-flash-image)")
    parser.add_argument("--raw", action="store_true", help="Save raw generated image (skip crop)")
    args = parser.parse_args()

    if not Path(args.reference_image).exists():
        print(f"Error: Reference image not found: {args.reference_image}", file=sys.stderr)
        sys.exit(1)

    output = args.output
    if not output:
        slug = slugify(args.prompt)
        output = f"{slug}-{args.size}.png"

    print(f"Generating: {args.prompt}", flush=True)
    print(f"Reference: {args.reference_image}", flush=True)
    raw_image = generate_image(args.prompt, args.reference_image, model=args.model)

    raw_path = output.replace(".png", "-raw.png")
    raw_image.save(raw_path)
    print(f"Raw image saved: {raw_path} ({raw_image.size[0]}x{raw_image.size[1]})")

    if args.raw:
        print("Done (raw mode, no crop)")
    else:
        keyed = remove_background(raw_image)
        icon = crop_to_icon(keyed, size=args.size, alpha_threshold=args.alpha_threshold)
        icon.save(output)
        print(f"Icon saved: {output} ({args.size}x{args.size})")
