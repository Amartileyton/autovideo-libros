#!/usr/bin/env python3
"""
scripts/generate-leo-audio.py
Generador Neural de Voz para "Leo" (es-ES-AlvaroNeural con edge-tts).
Produce locución humana masculina, cálida y profesional, sin necesidad de API key,
y calcula los wordTimestamps palabra por palabra calibrados al fotograma.
"""

import os
import re
import sys
import json
import asyncio
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import edge_tts

ROOT_DIR = Path(__file__).resolve().parent.parent
SCENES_PATH = ROOT_DIR / "src" / "data" / "scenes.json"
AUDIO_DIR = ROOT_DIR / "public" / "audio"
ASSETS_DIR = ROOT_DIR / "public" / "assets"
INFO_JSON_PATH = AUDIO_DIR / "info.json"
ALIGNMENT_PATH = ASSETS_DIR / "latest_alignment.json"

LEO_VOICE = "es-ES-AlvaroNeural"
VOICE_NAME = "Leo (Voz Oficial)"
FPS = 30
CROSS_DISSOLVE_FRAMES = 10

def clean_pause_markers(text: str) -> str:
    """Convierte [PAUSA...] en pausas prosódicas naturales (... o ,)."""
    if not text:
        return ""
    def _repl(m):
        raw = m.group(1) or ""
        try:
            dur = float(raw.replace(",", ".")) if raw else 0.4
        except ValueError:
            dur = 0.4
        return "... " if dur >= 0.5 else ", "

    cleaned = re.sub(r"\[PAUSA(?:\s*[:=-]?\s*([0-9.,]*)\s*s?)?\]", _repl, text, flags=re.I)
    cleaned = re.sub(r"\s*,\s*,+", ",", cleaned)
    cleaned = re.sub(r"\s*\.{4,}", "...", cleaned)
    cleaned = re.sub(r"\[[^\]]{1,60}\]", "", cleaned)
    cleaned = re.sub(r"`+", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

async def synthesize_scene(scene_id: str, text: str, mp3_path: Path):
    """Sintetiza la escena usando edge-tts y captura boundaries de audio."""
    clean_text = clean_pause_markers(text)
    # Rate -2% y pitch +0Hz para un tono barítono sereno y reflexivo
    communicate = edge_tts.Communicate(clean_text, LEO_VOICE, rate="-2%", pitch="+0Hz")

    sentences = []
    audio_chunks = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            sentences.append({
                "text": chunk["text"],
                "offset_sec": chunk["offset"] / 10_000_000.0,
                "duration_sec": chunk["duration"] / 10_000_000.0,
            })

    audio_bytes = b"".join(audio_chunks)
    with open(mp3_path, "wb") as f:
        f.write(audio_bytes)

    # Medir duración exacta del archivo con ffprobe de Remotion
    ffprobe_bin = ROOT_DIR / "node_modules" / "@remotion" / "compositor-win32-x64-msvc" / "ffprobe.exe"
    ffprobe_cmd = str(ffprobe_bin) if ffprobe_bin.exists() else "ffprobe"

    actual_duration = 12.0
    try:
        import subprocess
        res = subprocess.run(
            [ffprobe_cmd, "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(mp3_path)],
            capture_output=True, text=True, check=True
        )
        parsed = float(res.stdout.strip())
        if parsed > 0:
            actual_duration = parsed
    except Exception as e:
        print(f"Warning ffprobe: {e}")

    # Generar wordTimestamps a partir de las frases y duración real
    word_timestamps = []
    if sentences:
        for sent in sentences:
            s_text = sent["text"].strip()
            words = [w for w in re.split(r"\s+", s_text) if w]
            if not words:
                continue
            total_chars = sum(max(2, len(w)) for w in words)
            s_start = sent["offset_sec"]
            s_dur = sent["duration_sec"]
            cursor = s_start
            for w in words:
                w_weight = max(2, len(w)) / total_chars
                w_dur = w_weight * s_dur
                start_ms = round(cursor * 1000)
                end_ms = round((cursor + w_dur) * 1000)
                word_timestamps.append({
                    "word": w,
                    "startMs": start_ms,
                    "endMs": end_ms,
                    "startFrame": int((start_ms / 1000.0) * FPS),
                    "endFrame": int((end_ms / 1000.0) * FPS),
                })
                cursor += w_dur
    else:
        # Fallback si no hay sentence boundaries
        words = [w for w in re.split(r"\s+", clean_text) if w]
        total_chars = sum(max(2, len(w)) for w in words)
        cursor = 0.08
        usable_sec = max(1.0, actual_duration - 0.2)
        for w in words:
            w_weight = max(2, len(w)) / total_chars
            w_dur = w_weight * usable_sec
            start_ms = round(cursor * 1000)
            end_ms = round((cursor + w_dur) * 1000)
            word_timestamps.append({
                "word": w,
                "startMs": start_ms,
                "endMs": end_ms,
                "startFrame": int((start_ms / 1000.0) * FPS),
                "endFrame": int((end_ms / 1000.0) * FPS),
            })
            cursor += w_dur

    return actual_duration, word_timestamps

async def main():
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    with open(SCENES_PATH, "r", encoding="utf-8") as f:
        scenes_data = json.load(f)

    scenes = scenes_data.get("scenes", [])
    manifest_scenes = []

    print(f"🎙️ [leo-tts] Sintetizando locución con la voz de {VOICE_NAME} ({LEO_VOICE})...")

    global_time_cursor = 0.0

    for i, scene in enumerate(scenes):
        s_id = scene["id"]
        mp3_name = f"{s_id}.mp3"
        mp3_path = AUDIO_DIR / mp3_name

        print(f"   ↳ [{i+1}/{len(scenes)}] Generando '{s_id}'...")
        actual_dur, word_ts = await synthesize_scene(s_id, scene["text"], mp3_path)

        dur_frames = int(actual_dur * FPS) + CROSS_DISSOLVE_FRAMES
        words_per_sec = round(len(word_ts) / max(0.5, actual_dur), 2)

        manifest_scenes.append({
            "id": s_id,
            "audioFile": f"audio/{mp3_name}",
            "characterPreset": scene.get("characterPreset", "narrator"),
            "actualDuration": round(actual_dur, 3),
            "durationInFrames": dur_frames,
            "wordsPerSecond": words_per_sec,
            "leadingSilenceMs": 50,
            "trailingSilenceMs": 150,
            "trimOffsetMs": 0,
            "warnings": [],
            "wordTimestamps": word_ts
        })

        global_time_cursor += max(1, dur_frames - CROSS_DISSOLVE_FRAMES) / FPS

    total_frames = sum(s["durationInFrames"] for s in manifest_scenes) - (len(manifest_scenes) - 1) * CROSS_DISSOLVE_FRAMES
    total_seconds = round(total_frames / FPS, 3)

    manifest = {
        "generatedAt": json.dumps(None),
        "voiceId": LEO_VOICE,
        "voiceName": VOICE_NAME,
        "fps": FPS,
        "crossDissolveFrames": CROSS_DISSOLVE_FRAMES,
        "totalDurationInFrames": total_frames,
        "totalDurationSeconds": total_seconds,
        "backgroundMusicFile": "audio/bgm.mp3" if (AUDIO_DIR / "bgm.mp3").exists() else None,
        "scenes": manifest_scenes
    }

    import datetime
    manifest["generatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    with open(INFO_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"✅ [leo-tts] Manifiesto guardado en public/audio/info.json ({total_frames} frames / {total_seconds}s con {VOICE_NAME}).")

if __name__ == "__main__":
    asyncio.run(main())
