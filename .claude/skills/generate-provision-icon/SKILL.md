---
name: generate-provision-icon
description: Generate a flat-style icon for a provision using Gemini image generation (Nano Banana). Takes a reference photo and creates an avatarized flat-design icon matching a consistent style. Use when the user wants to generate an icon or avatar for a provision.
argument-hint: <subject-description> <reference-image-path> [output-path] [--size 128]
allowed-tools: Bash(python3 *), Read
---

Run the generate-provision-icon script at `tooling/scripts/generate-provision-icon.py` to generate and crop an icon.

## Usage

```bash
python3 tooling/scripts/generate-provision-icon.py <prompt> <reference-image> [output] [--size 128] [--alpha-threshold 128] [--model gemini-2.5-flash-image] [--raw]
```

## Behavior

1. Parse the user's request for: subject description, reference image path, output path (optional), size (default 128)
2. Read the example style image at `.claude/skills/generate-provision-icon/example-images/trolleybus-64.png` to understand the target style
3. Run the script — it sends the prompt, the reference photo, AND the style example image to Gemini, then auto-crops and resizes the result
4. Read **both** the raw image (`*-raw.png`) and the cropped icon to show results to the user
5. If the user is not satisfied:
   - **Wrong subject/style**: Re-run with a refined prompt
   - **Cropping too tight/loose**: Suggest adjusting `--alpha-threshold` (lower = tighter, higher = more lenient)
   - **Want raw only**: Use `--raw` flag to skip cropping
   - **Different model**: Use `--model gemini-3-pro-image-preview` for higher quality

## How it works

The script sends **three inputs** to Gemini:
1. **Text prompt** — style instructions + subject description
2. **Reference image** — a real photo of the subject (e.g., a bus photograph) used as the visual basis
3. **Style example** — always the trolleybus icon at `.claude/skills/generate-provision-icon/example-images/trolleybus-64.png`, used to enforce consistent flat-icon style

Since Gemini cannot generate truly transparent backgrounds, the script uses a **green-screen approach**: it prompts Gemini for a solid green background, then auto-detects and removes it via chroma-keying. The final output is a PNG with a fully transparent background, tight-cropped and centered on a square canvas.

## Defaults

- Output path: `<slugified-prompt>-<size>.png` in the current directory
- Raw image: always saved alongside as `<slugified-prompt>-<size>-raw.png`
- Size: 128px
- Alpha threshold: 128
- Model: gemini-2.5-flash-image (Nano Banana)

## Requirements

- `GEMINI_API_KEY` environment variable must be set
- Requires `google-genai` and `Pillow`. If not installed: `uv pip install google-genai Pillow`
