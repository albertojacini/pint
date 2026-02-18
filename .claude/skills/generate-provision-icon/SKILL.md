---
name: generate-provision-icon
description: Generate a flat-style icon for a provision using Gemini image generation (Nano Banana). Takes an optional reference photo and creates an avatarized flat-design icon matching a consistent style. Can upload directly to Supabase storage. Use when the user wants to generate an icon or avatar for a provision.
argument-hint: <subject-description> [reference-image-path] [output-path] [--size 128] [--upload provisions/slug.png]
allowed-tools: Bash(uv run *), Read
---

Run the generate-provision-icon script to generate and crop an icon.

## Usage

```bash
uv run .claude/skills/generate-provision-icon/scripts/generate_icon.py <prompt> [reference-image] [output] [--size 128] [--alpha-threshold 128] [--model gemini-3-pro-image-preview] [--raw] [--upload STORAGE_PATH]
```

## Behavior

1. Parse the user's request for: subject description, reference image path (optional), output path (optional), size (default 128)
2. Read the example style image at `.claude/skills/generate-provision-icon/assets/trolleybus-64.png` to understand the target style
3. Run the script — it sends the prompt, the style example, and optionally the reference photo to Gemini, then auto-crops and resizes the result
4. Read **both** the raw image (`*-raw.png`) and the cropped icon to show results to the user
5. If the user wants to upload, re-run with `--upload provisions/<slug>.png` to push to Supabase storage. The storage path value is what goes in the provision's `avatar_url` DB column.
6. If the user is not satisfied:
   - **Wrong subject/style**: Re-run with a refined prompt
   - **Cropping too tight/loose**: Suggest adjusting `--alpha-threshold` (lower = tighter, higher = more lenient)
   - **Want raw only**: Use `--raw` flag to skip cropping
   - **Different model**: Use `--model gemini-3-pro-image-preview` for higher quality

## How it works

The script sends inputs to Gemini:
1. **Text prompt** — style instructions + subject description
2. **Reference image** (optional) — a real photo of the subject (e.g., a bus photograph) used as the visual basis
3. **Style example** — always the trolleybus icon at `.claude/skills/generate-provision-icon/assets/trolleybus-64.png`, used to enforce consistent flat-icon style

When no reference image is provided, the script works in **prompt-only mode** — relying on the text description and style example alone.

Since Gemini cannot generate truly transparent backgrounds, the script uses a **green-screen approach**: it prompts Gemini for a solid green background, then auto-detects and removes it via chroma-keying. The final output is a PNG with a fully transparent background, tight-cropped and centered on a square canvas.

## Upload to Supabase

Use `--upload <storage-path>` to upload the generated icon directly to the production Supabase `avatars` bucket. The storage path is relative to the bucket root.

Convention: `provisions/<provision-slug>.png`

Example:
```bash
uv run .claude/skills/generate-provision-icon/scripts/generate_icon.py "a metro train" --upload provisions/metro-train.png
```

The printed `Storage path` value (e.g. `provisions/metro-train.png`) is what should be stored in the provision's `avatar_url` database column.

Reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `.env.prod` (always uploads to production).

## Defaults

- Output path: `TEMP/provision-icons/<slugified-prompt>-<size>.png` (project TEMP directory, not versioned)
- Raw image: always saved alongside as `*-raw.png`
- Size: 128px
- Alpha threshold: 128
- Model: gemini-3-pro-image-preview (Nano Banana Pro)

## Requirements

- `GEMINI_API_KEY` environment variable must be set (auto-loaded from project root `.env`)
- Dependencies (`google-genai`, `Pillow`, `numpy`, `supabase`) are declared inline via PEP 723 — `uv run` installs them automatically
- For upload: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.prod`
