from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
from io import BytesIO
from pathlib import Path
from typing import Iterable

import requests
from PIL import Image


DEFAULT_BASE_URL = "https://new.suxi.ai/v1"
DEFAULT_MODELS = [
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
    "gemini-3.1-flash-image-preview",
    "gemini-3.1-flash-image-preview-token",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate images through new.suxi.ai Gemini image models."
    )
    parser.add_argument("--prompt", required=True, help="Image generation prompt")
    parser.add_argument("--model", default=DEFAULT_MODELS[0], help="Gemini image model")
    parser.add_argument(
        "--all-models",
        action="store_true",
        help="Run all verified Gemini image models",
    )
    parser.add_argument(
        "--base-url",
        default=None,
        help="Override base URL. Default resolves from suxi provider or https://new.suxi.ai/v1",
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help="Override API key. Default resolves from SUXI_API_KEY or global opencode suxi provider",
    )
    parser.add_argument(
        "--out-dir",
        default="generated/suxi-gemini",
        help="Output directory for generated files",
    )
    parser.add_argument(
        "--filename",
        default=None,
        help="Single-model output filename. Defaults to <model>-<timestamp>.png",
    )
    parser.add_argument(
        "--prefix",
        default="gemini-image",
        help="Filename prefix when using --all-models",
    )
    parser.add_argument(
        "--prefer",
        choices=["chat", "v1beta"],
        default="chat",
        help="Preferred endpoint. Script automatically falls back to the other route.",
    )
    parser.add_argument(
        "--print-json",
        action="store_true",
        help="Print machine-readable JSON only",
    )
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_provider_config() -> tuple[str, str]:
    api_key = os.getenv("SUXI_API_KEY")
    base_url = None

    config_path = Path.home() / ".config" / "opencode" / "opencode.json"
    if config_path.exists():
        try:
            data = load_json(config_path)
            provider = ((data.get("provider") or {}).get("suxi") or {}).get(
                "options"
            ) or {}
            base_url = provider.get("baseURL") or base_url
            raw_key = provider.get("apiKey")
            if not api_key and isinstance(raw_key, str):
                match = re.match(r"^\{env:([^}]+)\}$", raw_key)
                api_key = os.getenv(match.group(1)) if match else raw_key
        except Exception:
            pass

    base_url = base_url or DEFAULT_BASE_URL
    if not api_key:
        raise RuntimeError(
            "Missing SUXI API key. Set SUXI_API_KEY or configure provider.suxi.options.apiKey in ~/.config/opencode/opencode.json"
        )
    return base_url, api_key


def normalize_base_url(base_url: str) -> str:
    return base_url.rstrip("/")


def sanitize_name(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-")


def decode_data_url(data_url: str) -> tuple[bytes, str]:
    match = re.match(r"^data:(image/[^;]+);base64,(.+)$", data_url, re.DOTALL)
    if not match:
        raise ValueError("Invalid data URL image payload")
    mime_type = match.group(1)
    payload = match.group(2)
    return base64.b64decode(payload), mime_type


def normalize_to_png(image_bytes: bytes, mime_type: str) -> bytes:
    # Keep original transparency if present and always save final artifact as PNG.
    with Image.open(BytesIO(image_bytes)) as im:
        if mime_type.lower() == "image/png" and im.format == "PNG":
            out = BytesIO()
            im.save(out, format="PNG")
            return out.getvalue()
        out = BytesIO()
        im.save(out, format="PNG")
        return out.getvalue()


def extract_chat_data_url(content: object) -> str | None:
    if isinstance(content, str):
        match = re.search(r"data:image/[^;]+;base64,[A-Za-z0-9+/=\n\r]+", content)
        return match.group(0) if match else None
    if isinstance(content, list):
        for item in content:
            if isinstance(item, dict):
                if item.get("type") == "image_url":
                    url = (item.get("image_url") or {}).get("url")
                    if isinstance(url, str) and url.startswith("data:image/"):
                        return url
                text = item.get("text")
                if isinstance(text, str):
                    match = re.search(
                        r"data:image/[^;]+;base64,[A-Za-z0-9+/=\n\r]+", text
                    )
                    if match:
                        return match.group(0)
    return None


def request_chat(base_url: str, api_key: str, model: str, prompt: str) -> dict:
    url = f"{normalize_base_url(base_url)}/chat/completions"
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "modalities": ["text", "image"],
    }
    res = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=180,
    )
    text = res.text
    try:
        data = res.json()
    except Exception:
        raise RuntimeError(f"chat/completions returned non-JSON: {text[:400]}")
    if not res.ok:
        raise RuntimeError(
            f"chat/completions error {res.status}: {json.dumps(data, ensure_ascii=False)[:600]}"
        )
    choice = (data.get("choices") or [{}])[0].get("message") or {}
    data_url = extract_chat_data_url(choice.get("content"))
    if not data_url:
        raise RuntimeError(
            f"chat/completions returned no image data URL: {json.dumps(data, ensure_ascii=False)[:800]}"
        )
    raw_bytes, mime_type = decode_data_url(data_url)
    return {
        "route": "chat",
        "mime_type": mime_type,
        "image_bytes": raw_bytes,
        "raw_response": data,
    }


def request_v1beta(base_url: str, api_key: str, model: str, prompt: str) -> dict:
    root = re.sub(r"/v1/?$", "", normalize_base_url(base_url))
    url = f"{root}/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }
    res = requests.post(
        url,
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=180,
    )
    text = res.text
    try:
        data = res.json()
    except Exception:
        raise RuntimeError(f"v1beta returned non-JSON: {text[:400]}")
    if not res.ok:
        raise RuntimeError(
            f"v1beta error {res.status}: {json.dumps(data, ensure_ascii=False)[:600]}"
        )

    candidates = data.get("candidates") or []
    parts: Iterable[dict] = (
        (((candidates[0] or {}).get("content") or {}).get("parts") or [])
        if candidates
        else []
    )
    for part in parts:
        inline = part.get("inlineData") or {}
        mime_type = inline.get("mimeType")
        b64 = inline.get("data")
        if mime_type and b64:
            return {
                "route": "v1beta",
                "mime_type": mime_type,
                "image_bytes": base64.b64decode(b64),
                "raw_response": data,
            }
    raise RuntimeError(
        f"v1beta returned no inline image data: {json.dumps(data, ensure_ascii=False)[:800]}"
    )


def generate_once(
    base_url: str, api_key: str, model: str, prompt: str, prefer: str
) -> dict:
    routes = [prefer, "v1beta" if prefer == "chat" else "chat"]
    errors: list[str] = []
    for route in routes:
        try:
            if route == "chat":
                return request_chat(base_url, api_key, model, prompt)
            return request_v1beta(base_url, api_key, model, prompt)
        except Exception as exc:
            errors.append(f"{route}: {exc}")
    raise RuntimeError(" | ".join(errors))


def save_png(output_path: Path, image_bytes: bytes, mime_type: str) -> dict:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    png_bytes = normalize_to_png(image_bytes, mime_type)
    output_path.write_bytes(png_bytes)
    with Image.open(output_path) as im:
        info = {
            "format": im.format,
            "mode": im.mode,
            "size": list(im.size),
        }
        if "A" in im.getbands():
            info["alpha_extrema"] = list(im.getchannel("A").getextrema())
    return info


def main() -> int:
    args = parse_args()
    base_url, api_key = resolve_provider_config()
    if args.base_url:
        base_url = args.base_url
    if args.api_key:
        api_key = args.api_key

    out_dir = Path(args.out_dir).resolve()
    models = DEFAULT_MODELS if args.all_models else [args.model]
    results = []
    failures = []

    for index, model in enumerate(models, start=1):
        try:
            result = generate_once(base_url, api_key, model, args.prompt, args.prefer)
            if args.all_models:
                filename = (
                    f"{sanitize_name(args.prefix)}-{index}-{sanitize_name(model)}.png"
                )
            elif args.filename:
                filename = args.filename
            else:
                filename = f"{sanitize_name(model)}-{sanitize_name(str(int(__import__('time').time())))}.png"
            output_path = out_dir / filename
            info = save_png(output_path, result["image_bytes"], result["mime_type"])
            results.append(
                {
                    "ok": True,
                    "model": model,
                    "route": result["route"],
                    "mime_type": result["mime_type"],
                    "output": str(output_path),
                    **info,
                }
            )
        except Exception as exc:
            failures.append({"model": model, "ok": False, "error": str(exc)})

    payload = {
        "ok": len(results) > 0 and len(failures) == 0,
        "base_url": base_url,
        "results": results,
        "failures": failures,
    }
    if args.print_json:
        print(json.dumps(payload, ensure_ascii=False))
    else:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if results else 1


if __name__ == "__main__":
    raise SystemExit(main())
