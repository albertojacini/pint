---
name: crop-icon
description: Crop and resize an image to a square icon. Trims transparent/low-alpha padding, then centers the content on a square transparent canvas. Use when the user wants to create provision icons or avatars from AI-generated images.
argument-hint: <input-path> [output-path] [--size 64]
allowed-tools: Bash(python3 *), Read
---

Run the crop-icon script at `tooling/scripts/crop-icon.py` to process the image.

## Usage

```bash
python3 tooling/scripts/crop-icon.py <input> [output] [--size 64] [--alpha-threshold 128]
```

## Behavior

1. Parse the user's request for: input path, output path (optional), size (default 64), alpha threshold (default 128)
2. Run the script with the appropriate arguments
3. Read the output image to show the result to the user
4. If the user is not satisfied with the trimming, suggest adjusting `--alpha-threshold` (lower = tighter crop, higher = more lenient)

## Defaults

- Output path: `<input-basename>-<size>.png` in the same directory as input
- Size: 64px
- Alpha threshold: 128 (pixels with alpha > this value are considered content)

## Requirements

Requires `Pillow`. If not installed: `pip3 install Pillow`
