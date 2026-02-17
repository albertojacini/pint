---
name: generate-provision-icon
description: Generate a flat-style icon for a provision using Gemini image generation (Nano Banana). Creates an icon from a text description, auto-crops transparent padding, and resizes to a square. Use when the user wants to generate an icon or avatar for a provision.
argument-hint: <subject-description> [output-path] [--size 64]
allowed-tools: Bash(python3 *), Read
---

Run the generate-provision-icon script at `tooling/scripts/generate-provision-icon.py` to generate and crop an icon.

## Usage

```bash
python3 tooling/scripts/generate-provision-icon.py <prompt> [output] [--size 64] [--alpha-threshold 128] [--model gemini-2.5-flash-image] [--raw]
```

## Behavior

1. Parse the user's request for: subject description, output path (optional), size (default 64)
2. Run the script — it will generate a flat-design icon via Gemini, then auto-crop and resize it
3. Read **both** the raw image (`*-raw.png`) and the cropped icon to show results to the user
4. If the user is not satisfied:
   - **Wrong subject/style**: Re-run with a refined prompt
   - **Cropping too tight/loose**: Suggest adjusting `--alpha-threshold` (lower = tighter, higher = more lenient)
   - **Want raw only**: Use `--raw` flag to skip cropping
   - **Different model**: Use `--model gemini-3-pro-image-preview` for higher quality

## Style

The target style is shown in the example image at `.claude/skills/generate-provision-icon/example-images/trolleybus-64.png` — read this file before generating to understand the visual style.

The script automatically prepends a style prefix to the prompt:
> "A flat-design icon illustration on a pure transparent background. Bold, simple shapes with minimal detail. No text, no labels, no shadows. Clean vector-art style with vivid colors."

The user only needs to describe the **subject** (e.g., "a green trolleybus", "a bicycle lane", "a metro station").

If the generated image doesn't match the example style, refine the prompt to get closer.

## Defaults

- Output path: `<slugified-prompt>-<size>.png` in the current directory
- Raw image: always saved alongside as `<slugified-prompt>-<size>-raw.png`
- Size: 64px
- Alpha threshold: 128
- Model: gemini-2.5-flash-image (Nano Banana)

## Requirements

- `GEMINI_API_KEY` environment variable must be set
- Requires `google-genai` and `Pillow`. If not installed: `pip3 install google-genai Pillow`
