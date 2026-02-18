---
name: crop-icon
description: Crop and resize an image to a square icon. Trims transparent/low-alpha padding, then centers the content on a square transparent canvas. Use when the user wants to create provision icons or avatars from AI-generated images.
argument-hint: <input-path> [output-path] [--size 64]
allowed-tools: Bash(uv run *), Read
---

Run the crop-icon script to process the image.

## Usage

```bash
uv run .claude/skills/crop-icon/scripts/crop_icon.py <input> [output] [--size 64] [--alpha-threshold 128]
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

- `Pillow` is declared inline via PEP 723 — `uv run` installs it automatically
