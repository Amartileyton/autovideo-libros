#!/usr/bin/env python3
"""
resolve_config.py — Resolutor del patrón 'Configurable Agent Skills'.
Permite leer y sobrescribir parámetros globales (FPS=30, resolución 1080x1920,
superficie #F8F7F4, voice_id y model_id de ElevenLabs) desde .agent/skills.config.yaml
y variables de entorno (.env) sin bifurcar los archivos SKILL.md originales.
"""

from __future__ import annotations
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict

ROOT_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT_DIR / ".agent" / "skills.config.yaml"
ENV_PATH = ROOT_DIR / ".env"

DEFAULT_CONFIG: Dict[str, Any] = {
    "studio": {
        "name": "Antigravity Vector Video Studio",
        "fps": 30,
        "width": 1080,
        "height": 1920,
        "aspect_ratio": "9:16",
        "cross_dissolve_frames": 10,
    },
    "theme": {
        "surface": "#F8F7F4",
        "ink_primary": "#141413",
        "ink_secondary": "#575550",
        "accent_primary": "#D94E34",
        "accent_secondary": "#2563EB",
        "grid_line": "#E6E4DD",
        "zero_neon_policy": True,
    },
    "safe_zone": {
        "top_percent": 85,
        "bottom_reserved_px": 288,
        "horizontal_padding_px": 96,
        "min_headline_px": 64,
        "max_headline_words": 7,
        "min_label_px": 28,
        "max_label_words": 20,
    },
    "motion": {
        "forbid_css_transitions": True,
        "forbid_css_keyframes": True,
        "require_extrapolate_clamp": True,
        "springs": {
            "SPRING_SNAPPY": {"damping": 20, "stiffness": 200, "mass": 0.8},
            "SPRING_CAMERA": {"damping": 30, "stiffness": 90, "mass": 1.2},
        },
    },
    "elevenlabs": {
        "voice_id": "RwzBDEn5f6FIgpAjH9YN",
        "voice_name": "Gabriel Blanco (Voz Canónica de Leo)",
        "model_id": "eleven_multilingual_v2",
        "output_format": "mp3_44100_128",
        "apply_text_normalization": "on",
        "canonical_settings": {
            "stability": 0.70,
            "similarity_boost": 0.75,
            "style": 0.05,
            "use_speaker_boost": True,
        },
        "audit": {
            "min_words_per_sec": 2.0,
            "max_words_per_sec": 4.5,
            "max_leading_silence_ms": 200,
            "max_trailing_silence_ms": 500,
        },
    },
}


def parse_scalar(val: str) -> Any:
    val = val.strip()
    if (val.startswith('"') and val.endswith('"')) or (
        val.startswith("'") and val.endswith("'")
    ):
        return val[1:-1]
    if val.lower() == "true":
        return True
    if val.lower() == "false":
        return False
    try:
        if "." in val:
            return float(val)
        return int(val)
    except ValueError:
        return val


def load_simple_yaml(path: Path) -> Dict[str, Any]:
    """Parser ligero sin dependencias externas (PyYAML opcional)."""
    if not path.exists():
        return {}
    try:
        import yaml  # type: ignore

        with path.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except ImportError:
        result: Dict[str, Any] = {}
        stack: list[tuple[int, Dict[str, Any]]] = [(-1, result)]
        with path.open("r", encoding="utf-8") as f:
            for raw_line in f:
                line = re.sub(r"\s+#.*$", "", raw_line.rstrip())
                if not line.strip() or line.lstrip().startswith("#"):
                    continue
                indent = len(line) - len(line.lstrip(" "))
                key_part, _, val_part = line.strip().partition(":")
                key = key_part.strip()
                val_str = val_part.strip()
                while len(stack) > 1 and stack[-1][0] >= indent:
                    stack.pop()
                current_dict = stack[-1][1]
                if val_str == "":
                    new_dict: Dict[str, Any] = {}
                    current_dict[key] = new_dict
                    stack.append((indent, new_dict))
                else:
                    current_dict[key] = parse_scalar(val_str)
        return result


def load_dotenv(path: Path) -> Dict[str, str]:
    env_vars: Dict[str, str] = {}
    if not path.exists():
        return env_vars
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            striped = line.strip()
            if not striped or striped.startswith("#") or "=" not in striped:
                continue
            k, _, v = striped.partition("=")
            env_vars[k.strip()] = v.strip().strip('"').strip("'")
    return env_vars


def deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(merged.get(k), dict):
            merged[k] = deep_merge(merged[k], v)
        else:
            merged[k] = v
    return merged


def resolve_config() -> Dict[str, Any]:
    yaml_cfg = load_simple_yaml(CONFIG_PATH)
    cfg = deep_merge(DEFAULT_CONFIG, yaml_cfg)
    env_vars = {**load_dotenv(ENV_PATH), **os.environ}

    if "ELEVENLABS_VOICE_ID" in env_vars and env_vars["ELEVENLABS_VOICE_ID"]:
        cfg["elevenlabs"]["voice_id"] = env_vars["ELEVENLABS_VOICE_ID"]
    if "ELEVENLABS_MODEL_ID" in env_vars and env_vars["ELEVENLABS_MODEL_ID"]:
        cfg["elevenlabs"]["model_id"] = env_vars["ELEVENLABS_MODEL_ID"]
    if "STUDIO_FPS" in env_vars:
        cfg["studio"]["fps"] = int(env_vars["STUDIO_FPS"])
    if "STUDIO_SURFACE" in env_vars:
        cfg["theme"]["surface"] = env_vars["STUDIO_SURFACE"]

    return cfg


if __name__ == "__main__":
    resolved = resolve_config()
    if "--json" in sys.argv or len(sys.argv) == 1:
        print(json.dumps(resolved, indent=2, ensure_ascii=False))
    elif "--key" in sys.argv:
        idx = sys.argv.index("--key")
        if idx + 1 < len(sys.argv):
            keys = sys.argv[idx + 1].split(".")
            curr: Any = resolved
            for key in keys:
                curr = curr.get(key, {}) if isinstance(curr, dict) else None
            print(curr if not isinstance(curr, dict) else json.dumps(curr))
