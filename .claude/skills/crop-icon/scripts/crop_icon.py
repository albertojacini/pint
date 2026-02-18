#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pillow>=10.0.0",
# ]
# ///
"""Crop and resize an image to a square icon.

Trims transparent/low-alpha padding around the actual content,
then resizes and centers it on a square transparent canvas.

Usage:
    uv run .claude/skills/crop-icon/scripts/crop_icon.py <input> [output] [--size 64] [--alpha-threshold 128]

Examples:
    uv run .claude/skills/crop-icon/scripts/crop_icon.py trolleybus.png
    uv run .claude/skills/crop-icon/scripts/crop_icon.py trolleybus.png icon-64.png --size 64
    uv run .claude/skills/crop-icon/scripts/crop_icon.py trolleybus.png icon-128.png --size 128
"""

import argparse
import os
from PIL import Image


def crop_icon(input_path: str, output_path: str, size: int = 64, alpha_threshold: int = 128):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    # Find bounding box of pixels with alpha above threshold
    left, top, right, bottom = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if pixels[x, y][3] > alpha_threshold:
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)

    if left >= right or top >= bottom:
        print("No visible content found in image.")
        return

    cropped = img.crop((left, top, right + 1, bottom + 1))
    cw, ch = cropped.size

    # Resize to fit the full canvas
    ratio = min(size / cw, size / ch)
    new_w, new_h = int(cw * ratio), int(ch * ratio)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    # Center on transparent square canvas
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - new_w) // 2, (size - new_h) // 2))
    canvas.save(output_path)
    print(f"{input_path} -> {output_path} ({size}x{size}, content {new_w}x{new_h})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crop and resize an image to a square icon.")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", nargs="?", help="Output image path (default: <input>-<size>.png)")
    parser.add_argument("--size", type=int, default=64, help="Output square size in px (default: 64)")
    parser.add_argument("--alpha-threshold", type=int, default=128, help="Min alpha to count as content (default: 128)")
    args = parser.parse_args()

    output = args.output
    if not output:
        base, _ = os.path.splitext(args.input)
        output = f"{base}-{args.size}.png"

    crop_icon(args.input, output, args.size, args.alpha_threshold)
