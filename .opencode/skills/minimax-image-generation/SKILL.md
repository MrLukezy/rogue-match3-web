# Skill: minimax-image-generation

Use this skill when the user wants to generate images with **MiniMax**, especially for game icons, UI assets, polished illustrations, or batch image generation inside this project.

## Trigger examples

- 用 MiniMax 生图
- minimax 生图
- 用 minimax 生成图片
- MiniMax 图片生成
- 用 MiniMax 批量出图
- 用 MiniMax 生成技能图标

## What this skill uses

- Tool script: `tools/minimax_image_generate.py`
- API endpoint: `https://api.minimaxi.com/v1/image_generation`

## Default strategy

1. Prefer MiniMax for image generation unless the user explicitly asks for another provider or model.
2. Use `image-01` by default.
3. Use `response_format=url` by default so images can be downloaded to local files.
4. Save outputs into `generated/minimax/` by default.

## API key resolution

Priority:

1. `MINIMAX_API_KEY`
2. `~/.config/opencode/opencode.json` → `provider.minimax.options.apiKey`

## Supported parameters

- `--prompt` required image prompt
- `--model` default `image-01`
- `--aspect-ratio` default `1:1`
- `--response-format` `url` or `base64`, default `url`
- `--output-dir` default `generated/minimax`
- `--image` repeatable reference image URL for subject/style reference
- `--n` number of images to generate, default `1`
- `--prefix` output filename prefix

## Usage examples

Single image:

```bash
python "tools/minimax_image_generate.py" --prompt "single fantasy skill icon, glowing fire rune, centered composition, polished mobile game UI style, no text, no watermark"
```

Batch icon generation:

```bash
python "tools/minimax_image_generate.py" --prompt "single fantasy skill icon, glowing ice rune, centered composition, polished mobile game UI style, no text, no watermark" --n 4 --prefix "ice-skill"
```

Wide illustration:

```bash
python "tools/minimax_image_generate.py" --prompt "fantasy game loading illustration, heroic mage facing a crystal dragon, cinematic lighting, high detail, no text" --aspect-ratio "16:9"
```

## Output behavior

- Saves generated assets into `generated/minimax/` by default
- Downloads returned image URLs automatically when `response_format=url`
- Supports `base64` responses and saves them locally as files
- Prints machine-readable JSON with output paths and API metadata

## Notes

- Do not expose API keys in user-facing output.
- If the user asks for transparent background, state clearly that MiniMax may still need a separate background-removal step after generation.
- For asset sets, keep one shared art direction across the whole batch.
