#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen


DEFAULT_ENDPOINT = "https://api.minimaxi.com/v1/image_generation"
DEFAULT_MODEL = "image-01"
DEFAULT_ASPECT_RATIO = "1:1"
DEFAULT_RESPONSE_FORMAT = "url"
DEFAULT_OUTPUT_DIR = "generated/minimax"


def load_env() -> None:
    try:
        from dotenv import load_dotenv  # type: ignore
    except Exception:
        return
    load_dotenv()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate images with MiniMax API.")
    parser.add_argument("--prompt", required=True, help="Image prompt.")
    parser.add_argument(
        "--model",
        default=os.getenv("MINIMAX_MODEL", DEFAULT_MODEL),
        help="MiniMax image model.",
    )
    parser.add_argument(
        "--aspect-ratio",
        default=os.getenv("MINIMAX_ASPECT_RATIO", DEFAULT_ASPECT_RATIO),
        help="Aspect ratio, such as 1:1, 16:9, 9:16, 4:3.",
    )
    parser.add_argument(
        "--response-format",
        choices=["url", "base64"],
        default=os.getenv("MINIMAX_RESPONSE_FORMAT", DEFAULT_RESPONSE_FORMAT),
        help="MiniMax response format.",
    )
    parser.add_argument(
        "--output-dir",
        default=os.getenv("MINIMAX_OUTPUT_DIR", DEFAULT_OUTPUT_DIR),
        help="Directory for saved images.",
    )
    parser.add_argument(
        "--image",
        action="append",
        default=[],
        help="Optional reference image URL. Repeat to provide multiple references.",
    )
    parser.add_argument(
        "--n", type=int, default=1, help="Number of images to generate."
    )
    parser.add_argument("--prefix", default="minimax", help="Output filename prefix.")
    parser.add_argument(
        "--timeout", type=int, default=240, help="HTTP timeout in seconds."
    )
    parser.add_argument("--print-json", action="store_true", help="Print JSON only.")
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_api_key() -> str:
    api_key = os.getenv("MINIMAX_API_KEY")
    if api_key:
        return api_key

    config_path = Path.home() / ".config" / "opencode" / "opencode.json"
    if config_path.exists():
        try:
            data = load_json(config_path)
            raw_key = (
                ((data.get("provider") or {}).get("minimax") or {}).get("options") or {}
            ).get("apiKey")
            if isinstance(raw_key, str):
                match = re.match(r"^\{env:([^}]+)\}$", raw_key)
                return os.getenv(match.group(1), "") if match else raw_key
        except Exception:
            pass

    raise RuntimeError(
        "Missing MiniMax API key. Set MINIMAX_API_KEY or configure provider.minimax.options.apiKey in ~/.config/opencode/opencode.json"
    )


def guess_suffix(url: str, content_type: str | None) -> str:
    if content_type:
        mime = content_type.split(";", 1)[0].strip()
        ext = mimetypes.guess_extension(mime)
        if ext:
            return ext
    parsed = urlparse(url)
    ext = Path(parsed.path).suffix
    return ext or ".png"


def sanitize_name(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-") or "image"


def timestamp() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")


def post_json(url: str, payload: dict, api_key: str, timeout: int) -> dict:
    req = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8"))


def download_url(url: str, output_path: Path, timeout: int) -> None:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=timeout) as res:
        output_path.write_bytes(res.read())


def decode_base64_image(data: str) -> bytes:
    if data.startswith("data:"):
        _, encoded = data.split(",", 1)
        return base64.b64decode(encoded)
    return base64.b64decode(data)


def build_payload(args: argparse.Namespace) -> dict:
    payload = {
        "model": args.model,
        "prompt": args.prompt,
        "aspect_ratio": args.aspect_ratio,
        "response_format": args.response_format,
        "n": args.n,
    }
    if args.image:
        payload["subject_reference"] = args.image
    return payload


def save_outputs(data: dict, out_dir: Path, prefix: str, timeout: int) -> list[str]:
    image_urls = (data.get("data") or {}).get("image_urls") or []
    if image_urls:
        paths: list[str] = []
        stamp = timestamp()
        for idx, url in enumerate(image_urls, start=1):
            suffix = guess_suffix(url, None)
            output_path = out_dir / f"{sanitize_name(prefix)}-{stamp}-{idx}{suffix}"
            download_url(url, output_path, timeout)
            paths.append(str(output_path))
        return paths

    images = (data.get("data") or {}).get("images") or []
    if images:
        paths = []
        stamp = timestamp()
        for idx, item in enumerate(images, start=1):
            raw = item.get("b64_json") or item.get("base64") or item.get("image_base64")
            if not raw:
                continue
            output_path = out_dir / f"{sanitize_name(prefix)}-{stamp}-{idx}.png"
            output_path.write_bytes(decode_base64_image(raw))
            paths.append(str(output_path))
        if paths:
            return paths

    raise RuntimeError(
        f"Unsupported MiniMax response shape: {json.dumps(data, ensure_ascii=False)[:1200]}"
    )


def main() -> int:
    load_env()
    args = parse_args()
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    api_key = resolve_api_key()

    payload = build_payload(args)
    response = post_json(DEFAULT_ENDPOINT, payload, api_key, args.timeout)

    status = (response.get("base_resp") or {}).get("status_code")
    if status not in (0, "0", None):
        raise RuntimeError(json.dumps(response, ensure_ascii=False)[:2000])

    outputs = save_outputs(response, out_dir, args.prefix, args.timeout)
    result = {
        "ok": True,
        "endpoint": DEFAULT_ENDPOINT,
        "model": args.model,
        "aspect_ratio": args.aspect_ratio,
        "response_format": args.response_format,
        "count": len(outputs),
        "outputs": outputs,
        "status": (response.get("base_resp") or {}).get("status_msg", "success"),
        "success_count": ((response.get("metadata") or {}).get("success_count")),
        "failed_count": ((response.get("metadata") or {}).get("failed_count")),
    }

    if args.print_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(
            json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False, indent=2),
            file=sys.stderr,
        )
        raise SystemExit(1)
