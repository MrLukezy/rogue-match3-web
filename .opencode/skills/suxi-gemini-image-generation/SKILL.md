# Skill: suxi-gemini-image-generation

Use this skill when the user wants to generate images through Gemini models on `new.suxi.ai`, especially when `/v1/images/generations` is known to be incompatible.

## Trigger examples

- 用 Gemini 生图
- 用 suxi 的 Gemini 模型出图
- new.suxi.ai Gemini 图片
- gemini-2.5-flash-image 生成图片
- gemini-3-pro-image-preview 出图

## What this skill uses

- Tool script: `tools/suxi_gemini_image_generate.py`
- Optional transparency post-process: `scripts/remove_bg.py`

## Supported models

- `gemini-2.5-flash-image`
- `gemini-3-pro-image-preview`
- `gemini-3.1-flash-image-preview`
- `gemini-3.1-flash-image-preview-token`

## Endpoint strategy

Primary route:

- `POST /v1/chat/completions`

Fallback route:

- `POST /v1beta/models/{model}:generateContent`

Reason:

- Gemini image models on `new.suxi.ai` do not reliably work with `/v1/images/generations`

## Usage examples

Single model:

```bash
python "tools/suxi_gemini_image_generate.py" --model "gemini-2.5-flash-image" --prompt "A cute little cat, transparent background, centered character, no text, no watermark." --filename "cat-test.png"
```

Transparent-background workflow when the user explicitly requires transparency:

```bash
python "tools/suxi_gemini_image_generate.py" --model "gemini-3.1-flash-image-preview" --prompt "A single isolated fantasy character, centered composition, no text, no watermark." --filename "character-source.png"
python "scripts/remove_bg.py" "generated/suxi-gemini/character-source.png" --output "assets/generated/character-source_rgba.png" --print-json
```

All verified models:

```bash
python "tools/suxi_gemini_image_generate.py" --all-models --prompt "A cute little cat, transparent background, centered character, no text, no watermark." --prefix "cat-batch"
```

## API key resolution

Priority:

1. `SUXI_API_KEY`
2. `~/.config/opencode/opencode.json` → `provider.suxi.options.apiKey`

## Output behavior

- Saves image assets to `generated/suxi-gemini/` by default
- Normalizes output to PNG
- Reports model, route, image mode, size, and alpha info when present

## Transparency rule

- If the user does **not** explicitly require a transparent background, generate the image only and do **not** run `scripts/remove_bg.py`.
- If the user explicitly asks for a transparent background / transparent PNG / 去背景 / 抠图 / RGBA output, first generate the source image with `tools/suxi_gemini_image_generate.py`, then run `scripts/remove_bg.py`.
- When transparency is requested, the final deliverable should be the RGBA PNG produced by `scripts/remove_bg.py`, not the raw Gemini output.

## Transparent-background verification

When `scripts/remove_bg.py` is used:

1. Verify output mode is `RGBA`
2. Verify `alpha_extrema` includes both `0` and `255`
3. Prefer reporting the final transparent output path separately from the raw generated source path

## Important notes

- PNG output does not guarantee true transparent alpha
- Always inspect the saved file mode and alpha extrema
- `scripts/remove_bg.py` is conditional post-processing, not a default step
- Do not route Gemini image generation through `scripts/generate-image.mjs` unless that script is explicitly upgraded to support chat/v1beta Gemini flows
