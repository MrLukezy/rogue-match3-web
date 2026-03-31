# Image Background Removal Workflow

## Goal

Produce clean transparent PNG character art for game assets with the highest practical quality in this repository.

## Recommended pipeline

1. Generate source art with a prompt that is friendly to background removal.
2. Run `scripts/remove_bg.py` to create an RGBA PNG.
3. Verify output mode is `RGBA` and alpha extrema include both `0` and `255`.
4. Review edge quality, especially around glow, flame, fur, and thin accessories.

## Install dependencies

```bash
python -m pip install rembg onnxruntime pillow
```

## Usage

```bash
python "scripts/remove_bg.py" "assets/generated/boss/fullbody/chapter01_ember_cub_fullbody_prompt_regen.png"
```

Specify output path:

```bash
python "scripts/remove_bg.py" "input.png" --output "output_rgba.png" --print-json
```

## Output behavior

- Default output path: `<input_stem>_rgba.png`
- Output format: PNG
- Output mode target: RGBA
- Tool applies:
  - rembg foreground extraction
  - light alpha cleanup
  - minor edge feathering
  - simple white fringe reduction on semi-transparent pixels
  - auto-crop to visible content bounds

## Prompt rules for easy high-quality cutout

Use these requirements when generating source character art:

- Ask for **a single isolated full-body character**
- Keep **centered composition**
- Require **full character visible from head to feet**
- Ask for **plain studio background** rather than busy scenery
- Force **high contrast between background and subject**
- Require **clean outer silhouette**
- Avoid smoke, fog, floor shadows, background props, and backplates
- Prefer **light neutral background** if the character is dark, or **dark neutral background** if the character is light
- Avoid white glow spilling into a white background

## Prompt add-on template

Append the following clause to character prompts when the output will be auto-cut out:

```text
single isolated character, full body fully visible, centered composition, clean readable silhouette, plain solid studio background with strong contrast against the character, no scenery, no environment props, no floor, no cast shadow plate, no border, no frame, edge clarity prioritized for clean cutout extraction
```

## Stronger cutout-safe prompt example

```text
Generate an image of a single isolated full-body fantasy game character. Keep the full character fully visible and centered. Use a plain solid studio background with strong contrast against the subject so the silhouette edges are clean and easy to extract. No scenery, no environment props, no floor, no cast shadow plate, no decorative frame, no text, no watermark. Edge clarity and clean cutout extraction are important.
```

## Notes

- PNG output from a model does **not** guarantee transparency.
- A white or light-gray plain background is often easiest to remove if the character is warm/dark.
- If the character contains large white glow or pale VFX, use a darker plain background instead.
