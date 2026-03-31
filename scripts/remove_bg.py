from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageFilter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Remove background from generated character art and export RGBA PNG."
    )
    parser.add_argument("input", help="Input image path")
    parser.add_argument(
        "-o",
        "--output",
        help="Output PNG path. Defaults to <input>_rgba.png",
    )
    parser.add_argument(
        "--alpha-threshold",
        type=int,
        default=8,
        help="Pixels with alpha <= threshold become fully transparent. Default: 8",
    )
    parser.add_argument(
        "--feather-radius",
        type=float,
        default=0.6,
        help="Small feather radius to soften mask edges. Default: 0.6",
    )
    parser.add_argument(
        "--decontaminate",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Reduce white fringe on semi-transparent edges. Default: true",
    )
    parser.add_argument(
        "--print-json",
        action="store_true",
        help="Print machine-readable JSON result",
    )
    return parser.parse_args()


def ensure_rembg() -> object:
    try:
        from rembg import remove  # type: ignore
    except Exception as exc:  # pragma: no cover - runtime environment dependent
        raise RuntimeError(
            "Missing dependency 'rembg'. Install with: "
            "python -m pip install rembg onnxruntime pillow"
        ) from exc
    return remove


def build_default_output(input_path: Path) -> Path:
    return input_path.with_name(f"{input_path.stem}_rgba.png")


def clean_alpha(im: Image.Image, threshold: int, feather_radius: float) -> Image.Image:
    rgba = im.convert("RGBA")
    alpha = rgba.getchannel("A")
    if feather_radius > 0:
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=feather_radius))

    alpha = alpha.point(lambda a: 0 if a <= threshold else a)
    rgba.putalpha(alpha)
    return rgba


def decontaminate_edges(im: Image.Image) -> Image.Image:
    """Reduce white halo on semi-transparent edges.

    For pixels with partial alpha, pull RGB away from bright matte contamination.
    """
    rgba = im.convert("RGBA")
    px = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = px[x, y]
            if a == 0 or a == 255:
                continue
            if r > 235 and g > 235 and b > 235:
                scale = a / 255.0
                nr = min(255, int(r * scale))
                ng = min(255, int(g * scale))
                nb = min(255, int(b * scale))
                px[x, y] = (nr, ng, nb, a)
    return rgba


def crop_transparent(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def verify_alpha(im: Image.Image) -> dict:
    if "A" not in im.getbands():
        return {"mode": im.mode, "alpha_extrema": None}
    alpha = im.getchannel("A")
    return {
        "mode": im.mode,
        "size": list(im.size),
        "alpha_extrema": list(alpha.getextrema()),
    }


def main() -> int:
    args = parse_args()
    input_path = Path(args.input).resolve()
    if not input_path.exists():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        return 2

    output_path = (
        Path(args.output).resolve() if args.output else build_default_output(input_path)
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)

    remove = ensure_rembg()

    input_bytes = input_path.read_bytes()
    result_bytes = remove(input_bytes)
    rgba = Image.open(
        Path(os.devnull) if False else __import__("io").BytesIO(result_bytes)
    ).convert("RGBA")
    rgba = clean_alpha(
        rgba, threshold=args.alpha_threshold, feather_radius=args.feather_radius
    )
    if args.decontaminate:
        rgba = decontaminate_edges(rgba)
    rgba = crop_transparent(rgba)
    rgba.save(output_path, format="PNG")

    result = {
        "ok": True,
        "input": str(input_path),
        "output": str(output_path),
        **verify_alpha(rgba),
    }
    if args.print_json:
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(f"Saved: {output_path}")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
