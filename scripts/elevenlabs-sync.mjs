#!/usr/bin/env node
/**
 * scripts/elevenlabs-sync.mjs
 * Motor Exclusivo ElevenLabs y Sincronización Audio-First para Remotion (Voz Oficial de Leo).
 *
 * Flujo:
 * 1. Lee .env (ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID) y src/data/scenes.json.
 * 2. Usa por defecto la Voz Canónica de Leo: "RwzBDEn5f6FIgpAjH9YN" (Gabriel Blanco — Voz Canónica de Leo)
 *    o el motor neural local de Leo (es-ES-AlvaroNeural vía edge-tts),
 *    con su afinación calibrada (stability: 0.70, similarity_boost: 0.75, style: 0.05, use_speaker_boost: true).
 * 3. Preprocesa el texto con preprocessForTts(): limpia acotaciones de cámara,
 *    backticks de código y convierte [PAUSA X.Xs] en pausas prosódicas naturales (... o ,).
 * 4. Llama a POST https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128
 *    con Request Stitching (previous_text, next_text y previous_request_ids) o delega al motor neural local de Leo.
 * 5. Decodifica audio_base64 en public/audio/${scene.id}.mp3.
 * 6. Convierte alignment usando la cadencia continua de Leo (alignmentParser):
 *    el final de cada palabra enlaza con el tStart del espacio siguiente para eliminar micro-cortes.
 * 7. Ejecuta ffprobe sobre cada MP3 para medir actualDuration y audita ritmo (2.0-4.5 palabras/s)
 *    y silencios (leadingSilence > 200ms, trailingSilence > 500ms).
 * 8. Escribe el manifiesto maestro public/audio/info.json y public/assets/latest_alignment.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const SCENES_PATH = path.join(ROOT_DIR, 'src', 'data', 'scenes.json');
const AUDIO_DIR = path.join(ROOT_DIR, 'public', 'audio');
const ASSETS_DIR = path.join(ROOT_DIR, 'public', 'assets');
const INFO_JSON_PATH = path.join(AUDIO_DIR, 'info.json');
const LATEST_ALIGNMENT_PATH = path.join(ASSETS_DIR, 'latest_alignment.json');

const REMOTION_COMPOSITOR_DIR = path.join(
  ROOT_DIR,
  'node_modules',
  '@remotion',
  'compositor-win32-x64-msvc'
);
const FFMPEG_BIN = fs.existsSync(path.join(REMOTION_COMPOSITOR_DIR, 'ffmpeg.exe'))
  ? path.join(REMOTION_COMPOSITOR_DIR, 'ffmpeg.exe')
  : 'ffmpeg';
const FFPROBE_BIN = fs.existsSync(path.join(REMOTION_COMPOSITOR_DIR, 'ffprobe.exe'))
  ? path.join(REMOTION_COMPOSITOR_DIR, 'ffprobe.exe')
  : 'ffprobe';

/**
 * Voz Canónica de Leo: Gabriel Blanco (Voz Canónica de Leo)
 */
export const CANONICAL_VOICE_ID = 'RwzBDEn5f6FIgpAjH9YN';

/**
 * Catálogo curado de perfiles de voz de Leo (core/tts.py)
 */
export const CURATED_VOICE_PROFILES = {
  RwzBDEn5f6FIgpAjH9YN: {
    name: 'Gabriel Blanco (Voz Canónica de Leo)',
    description:
      'Voz oficial de Leo. Afinación calibrada: Tono con cuerpo, dicción técnica y aplomo',
    stability: 0.70,
    similarity_boost: 0.75,
    style: 0.05,
    use_speaker_boost: true,
  },
  pNInz6obpgDQGcFmaJgB: {
    name: 'Leo Didáctico (Adam — Barítono Cálido y Claro)',
    description:
      'Voz masculina con cuerpo, dicción limpia y tono cercano de mentor técnico',
    stability: 0.50,
    similarity_boost: 0.75,
    style: 0.05,
    use_speaker_boost: true,
  },
  ErXwobaYiN019PkySvjV: {
    name: 'Leo Dinámico (Antoni — Entusiasta y Ágil)',
    description:
      'Cadencia ágil, ideal para tutoriales rápidos de automatización y código',
    stability: 0.45,
    similarity_boost: 0.80,
    style: 0.10,
    use_speaker_boost: true,
  },
  onwK4e9ZLuTAKqWW03F9: {
    name: 'Leo Analista (Daniel — Profundo y Sereno)',
    description:
      'Timbre grave y pausado, excelente para arquitectura de software y desmitificación',
    stability: 0.60,
    similarity_boost: 0.75,
    style: 0.00,
    use_speaker_boost: true,
  },
  VR6AewLTigWG4xSOukaG: {
    name: 'Leo Conversacional (Arnold — Directo y Confiable)',
    description: 'Tono firme y natural con gran presencia en formato vertical Short',
    stability: 0.52,
    similarity_boost: 0.70,
    style: 0.05,
    use_speaker_boost: true,
  },
};

/**
 * Mapa oficial de Presets de Carácter -> voice_settings calibrados sobre la Voz Canónica de Leo
 */
export const CHARACTER_PRESETS = {
  narrator: {
    stability: 0.70,
    similarity_boost: 0.75,
    style: 0.05,
    use_speaker_boost: true,
  },
  expert: {
    stability: 0.70,
    similarity_boost: 0.78,
    style: 0.05,
    use_speaker_boost: true,
  },
  dramatic: {
    stability: 0.55,
    similarity_boost: 0.80,
    style: 0.12,
    use_speaker_boost: true,
  },
  conversational: {
    stability: 0.52,
    similarity_boost: 0.75,
    style: 0.06,
    use_speaker_boost: true,
  },
  calm: {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.02,
    use_speaker_boost: true,
  },
};

/**
 * Convierte marcadores [PAUSA], [PAUSA 0.4s], [PAUSA: 0.5s] en pausas prosódicas naturales (... o ,).
 */
export function cleanPauseMarkers(text, replaceWithPunctuation = true) {
  if (!text) return '';
  let cleaned = text.replace(
    /([:.,;!?])?\s*\[PAUSA(?:\s*[:=-]?\s*([0-9.,]*)\s*s?)?\]/gi,
    (_match, prevPunct, durRaw) => {
      const normalized = (durRaw || '').trim().replace(',', '.');
      const dur = normalized ? parseFloat(normalized) : 0.4;
      if (!replaceWithPunctuation) return prevPunct ? `${prevPunct} ` : ' ';
      if (prevPunct) {
        return dur >= 0.5 && prevPunct === '.' ? '... ' : `${prevPunct} `;
      }
      return dur >= 0.5 ? '... ' : ', ';
    }
  );
  cleaned = cleaned.replace(/([:.,;!?])\s*([,;])/g, '$1');
  cleaned = cleaned.replace(/\s*,\s*,+/g, ',');
  cleaned = cleaned.replace(/\s*\.{4,}/g, '...');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

/**
 * Preprocesa el texto de locución antes de enviarlo a ElevenLabs.
 */
export function preprocessForTts(text) {
  if (!text) return '';
  let cleaned = text.replace(/^\s*>[^\n]*\n?/gm, '').trim();
  cleaned = cleaned.replace(/^(?:>\s*)?Texto de locución[^\n]*\n?/i, '').trim();
  cleaned = cleaned.replace(
    /\[(?:LEO BUSTO|SCREENCAST|CORTE|ZOOM|PANTALLA|PLANO)[^\]]*\]/gi,
    ''
  );
  cleaned = cleanPauseMarkers(cleaned, true);
  cleaned = cleaned.replace(/\[[^\]]{1,60}\]/g, '');
  cleaned = cleaned.replace(/`+/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

/**
 * Convierte el objeto alignment por carácter de ElevenLabs en wordTimestamps palabra por palabra.
 */
export function buildWordTimestamps(alignment, fps, trimOffsetMs = 0) {
  if (
    !alignment ||
    !Array.isArray(alignment.characters) ||
    !Array.isArray(alignment.character_start_times_seconds) ||
    !Array.isArray(alignment.character_end_times_seconds)
  ) {
    return {
      wordTimestamps: [],
      leadingSilenceMs: 0,
      lastCharEndSec: 0,
    };
  }

  const chars = alignment.characters;
  const starts = alignment.character_start_times_seconds;
  const ends = alignment.character_end_times_seconds;

  const words = [];
  let currentWord = '';
  let wordStartSec = null;
  let wordEndSec = null;
  let firstNonSpaceStartSec = null;
  let lastNonSpaceEndSec = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const s = Number(starts[i] ?? 0);
    const e = Number(ends[i] ?? s);

    if (/\s/.test(ch)) {
      if (currentWord.length > 0 && wordStartSec !== null) {
        const spaceBridgeSec = e - s <= 0.35 ? e : s;
        const continuousEndSec = Math.max(wordEndSec ?? s, spaceBridgeSec);
        const startMs = Math.max(0, Math.round(wordStartSec * 1000 - trimOffsetMs));
        const endMs = Math.max(
          startMs + 25,
          Math.round(continuousEndSec * 1000 - trimOffsetMs)
        );
        words.push({
          word: currentWord,
          startMs,
          endMs,
          startFrame: Math.floor((startMs / 1000) * fps),
          endFrame: Math.ceil((endMs / 1000) * fps),
        });
        currentWord = '';
        wordStartSec = null;
        wordEndSec = null;
      }
    } else {
      if (firstNonSpaceStartSec === null) {
        firstNonSpaceStartSec = s;
      }
      if (wordStartSec === null) {
        wordStartSec = s;
      }
      currentWord += ch;
      wordEndSec = e;
      lastNonSpaceEndSec = e;
    }
  }

  if (currentWord.length > 0 && wordStartSec !== null && wordEndSec !== null) {
    const startMs = Math.max(0, Math.round(wordStartSec * 1000 - trimOffsetMs));
    const endMs = Math.max(startMs + 25, Math.round(wordEndSec * 1000 - trimOffsetMs));
    words.push({
      word: currentWord,
      startMs,
      endMs,
      startFrame: Math.floor((startMs / 1000) * fps),
      endFrame: Math.ceil((endMs / 1000) * fps),
    });
  }

  const leadingSilenceMs =
    firstNonSpaceStartSec !== null ? Math.round(firstNonSpaceStartSec * 1000) : 0;

  return {
    wordTimestamps: words,
    leadingSilenceMs,
    lastCharEndSec: lastNonSpaceEndSec,
  };
}

/**
 * Mide la duración exacta del archivo MP3 mediante ffprobe.
 */
function probeAudioDurationSeconds(mp3Path, fallbackSeconds) {
  try {
    const stdout = execFileSync(
      FFPROBE_BIN,
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        mp3Path,
      ],
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    const parsed = parseFloat(stdout);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  } catch {
    try {
      const stats = fs.statSync(mp3Path);
      if (stats.size > 0) {
        return Number((stats.size / 16000).toFixed(3));
      }
    } catch {
      // ignore
    }
  }
  return fallbackSeconds;
}

/**
 * Recorta silencios excesivos en el MP3 con ffmpeg.
 */
function trimSilenceIfPossible(mp3Path, leadingTrimSec, maxEndSec) {
  const tempOut = `${mp3Path}.trimmed.mp3`;
  try {
    const args = ['-y', '-i', mp3Path];
    if (leadingTrimSec > 0) {
      args.push('-ss', leadingTrimSec.toFixed(3));
    }
    if (maxEndSec > 0) {
      args.push('-to', maxEndSec.toFixed(3));
    }
    args.push('-c', 'copy', tempOut);
    execFileSync(FFMPEG_BIN, args, { stdio: 'ignore' });
    fs.renameSync(tempOut, mp3Path);
    return true;
  } catch {
    if (fs.existsSync(tempOut)) {
      fs.unlinkSync(tempOut);
    }
    return false;
  }
}

/**
 * Sintetizador acústico local de respaldo (se activa si ElevenLabs no tiene Key configurada o sin cuota)
 * calibrado a cadencia documental de resúmenes de libros (~2.8 palabras/s -> 62-65s para 5 escenas).
 */
function synthesizeLocalSpanishFallback(cleanText, scene, mp3Path) {
  const wavPath = `${mp3Path}.temp.wav`;
  const escapedText = cleanText.replace(/'/g, "''");
  // Rate = -1 + atempo=1.275 produce ~2.85 palabras/s, clavando 5 escenas (~180 palabras) en 64.5 segundos
  const rate = -1;

  try {
    const psScript = `
      Add-Type -AssemblyName System.Speech
      $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
      $esVoice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'es*' } | Select-Object -First 1
      if ($esVoice) { $synth.SelectVoice($esVoice.VoiceInfo.Name) }
      $synth.Rate = ${rate}
      $synth.SetOutputToWaveFile('${wavPath.replace(/\\/g, '\\\\')}')
      $synth.Speak('${escapedText}')
      $synth.Dispose()
    `;
    execFileSync('powershell.exe', ['-NoProfile', '-Command', psScript], {
      stdio: 'ignore',
    });

    execFileSync(
      FFMPEG_BIN,
      [
        '-y',
        '-i',
        wavPath,
        '-af',
        'atempo=1.275,apad=pad_dur=0.25',
        '-codec:a',
        'libmp3lame',
        '-b:a',
        '128k',
        '-ar',
        '44100',
        mp3Path,
      ],
      { stdio: 'ignore' }
    );
  } finally {
    if (fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
  }

  const durationSec = probeAudioDurationSeconds(mp3Path, 12.6);
  const rawWords = cleanText.trim().split(/\s+/);
  const totalWeight = rawWords.reduce((acc, w) => acc + Math.max(2, w.length), 0);
  const startPadSec = 0.06;
  const usableSec = Math.max(1.0, durationSec - startPadSec - 0.18);

  const characters = [];
  const charStarts = [];
  const charEnds = [];
  let cursorSec = startPadSec;

  rawWords.forEach((word, wIdx) => {
    const wordWeight = Math.max(2, word.length);
    const wordDurSec = (wordWeight / totalWeight) * usableSec;
    const charDur = wordDurSec / word.length;
    for (let c = 0; c < word.length; c++) {
      characters.push(word[c]);
      charStarts.push(Number(cursorSec.toFixed(4)));
      cursorSec += charDur;
      charEnds.push(Number(cursorSec.toFixed(4)));
    }
    if (wIdx < rawWords.length - 1) {
      characters.push(' ');
      charStarts.push(Number(cursorSec.toFixed(4)));
      cursorSec += 0.015;
      charEnds.push(Number(cursorSec.toFixed(4)));
    }
  });

  return {
    alignment: {
      characters,
      character_start_times_seconds: charStarts,
      character_end_times_seconds: charEnds,
    },
  };
}

async function synthesizeSceneWithTimestamps({
  apiKey,
  voiceId,
  modelId,
  cleanText,
  scene,
  previousText,
  nextText,
  previousRequestIds,
}) {
  const profileSettings = CURATED_VOICE_PROFILES[voiceId];
  const presetSettings =
    CHARACTER_PRESETS[scene.characterPreset] || CHARACTER_PRESETS.narrator;

  const voiceSettings = profileSettings
    ? {
        stability: profileSettings.stability,
        similarity_boost: profileSettings.similarity_boost,
        style: profileSettings.style,
        use_speaker_boost: profileSettings.use_speaker_boost,
      }
    : presetSettings;

  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
    voiceId
  )}/with-timestamps?output_format=mp3_44100_128`;

  const body = {
    text: cleanText,
    model_id: modelId,
    voice_settings: voiceSettings,
    previous_text: previousText || undefined,
    next_text: nextText || undefined,
    previous_request_ids:
      previousRequestIds.length > 0 ? previousRequestIds.slice(-3) : undefined,
    apply_text_normalization: 'on',
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ElevenLabs API error (${response.status}) en escena "${scene.id}": ${errorText}`
    );
  }

  const requestId =
    response.headers.get('request-id') ||
    response.headers.get('x-request-id') ||
    null;
  const payload = await response.json();

  return { payload, requestId };
}

async function main() {
  const apiKey = (process.env.ELEVENLABS_API_KEY || '').trim();
  const hasRealElevenLabsKey =
    Boolean(apiKey) && apiKey !== 'tu_api_key_aqui';
  let voiceId = (process.env.ELEVENLABS_VOICE_ID || '').trim();

  if (!voiceId || voiceId === 'random') {
    voiceId = CANONICAL_VOICE_ID;
  }

  const voiceProfileName =
    CURATED_VOICE_PROFILES[voiceId]?.name || `Custom Voice (${voiceId})`;
  console.log(
    `🎙️ [elevenlabs-sync] Voz activa: Leo (${voiceProfileName}) [${voiceId}]`
  );

  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

  if (!fs.existsSync(SCENES_PATH)) {
    throw new Error(`No se encontró el archivo de escenas en: ${SCENES_PATH}`);
  }

  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const scenesData = JSON.parse(fs.readFileSync(SCENES_PATH, 'utf-8'));
  const fps = Number(scenesData.fps || 30);
  const crossDissolveFrames = Number(scenesData.crossDissolveFrames || 10);
  const scenes = scenesData.scenes || [];

  if (!hasRealElevenLabsKey) {
    console.log(
      '🎙️ [elevenlabs-sync] Usando Motor Neural de Leo (Voz Oficial - es-ES-AlvaroNeural)...'
    );
    const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
    execFileSync(pythonBin, [path.join(ROOT_DIR, 'scripts', 'generate-leo-audio.py')], {
      stdio: 'inherit',
    });
    console.log('✅ [elevenlabs-sync] Síntesis con la voz de Leo completada con éxito.');
    return;
  }

  const sceneArgIdx = process.argv.indexOf('--scene');
  const targetSceneArg =
    sceneArgIdx !== -1 && process.argv[sceneArgIdx + 1]
      ? process.argv[sceneArgIdx + 1]
      : null;

  let existingManifest = null;
  if (fs.existsSync(INFO_JSON_PATH)) {
    try {
      existingManifest = JSON.parse(fs.readFileSync(INFO_JSON_PATH, 'utf-8'));
    } catch {}
  }

  const previousRequestIds = [];
  const manifestScenes = [];

  const globalCharacters = [];
  const globalStarts = [];
  const globalEnds = [];
  let globalTimeCursorSec = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const cleanText = preprocessForTts(scene.text);
    const previousText = i > 0 ? preprocessForTts(scenes[i - 1].text) : null;
    const nextText =
      i < scenes.length - 1 ? preprocessForTts(scenes[i + 1].text) : null;

    const mp3Filename = `${scene.id}.mp3`;
    const mp3Path = path.join(AUDIO_DIR, mp3Filename);
    const existingScene = existingManifest?.scenes?.find(
      (s) => s.id === scene.id
    );

    const shouldSynthesize =
      !targetSceneArg ||
      scene.id === targetSceneArg ||
      !fs.existsSync(mp3Path) ||
      !existingScene;

    if (!shouldSynthesize && existingScene) {
      console.log(
        `⏩ [${i + 1}/${scenes.length}] Reutilizando audio y alignment existente para "${scene.id}"...`
      );
      manifestScenes.push({
        ...existingScene,
      });
      const sceneAdvanceSec =
        Math.max(1, existingScene.durationInFrames - crossDissolveFrames) / fps;
      globalTimeCursorSec += sceneAdvanceSec;
      continue;
    }

    console.log(
      `🎙️ [${i + 1}/${scenes.length}] Sintetizando "${scene.id}" (preset: ${scene.characterPreset}, voice: ${voiceId})...`
    );

    let alignmentSource = null;

    if (hasRealElevenLabsKey) {
      try {
        const { payload, requestId } = await synthesizeSceneWithTimestamps({
          apiKey,
          voiceId,
          modelId,
          cleanText,
          scene,
          previousText,
          nextText,
          previousRequestIds,
        });

        if (requestId) {
          previousRequestIds.push(requestId);
        }

        const audioBuffer = Buffer.from(payload.audio_base64, 'base64');
        fs.writeFileSync(mp3Path, audioBuffer);
        alignmentSource = payload.alignment || payload.normalized_alignment;
      } catch (err) {
        console.warn(`⚠️ [elevenlabs-sync] Aviso de API ElevenLabs: ${err.message}`);
        console.warn(
          `   ↳ Sintetizando pista de voz en español de respaldo y calculando wordTimestamps continuos (cadencia de Leo) para "${scene.id}"...`
        );
        const fallbackResult = synthesizeLocalSpanishFallback(
          cleanText,
          scene,
          mp3Path
        );
        alignmentSource = fallbackResult.alignment;
      }
    } else {
      const fallbackResult = synthesizeLocalSpanishFallback(
        cleanText,
        scene,
        mp3Path
      );
      alignmentSource = fallbackResult.alignment;
    }

    const initialPass = buildWordTimestamps(alignmentSource, fps, 0);

    let actualDuration = probeAudioDurationSeconds(
      mp3Path,
      initialPass.lastCharEndSec + 0.15
    );
    const leadingSilenceMs = initialPass.leadingSilenceMs;
    const trailingSilenceMs = Math.max(
      0,
      Math.round((actualDuration - initialPass.lastCharEndSec) * 1000)
    );

    const warnings = [];
    let trimOffsetMs = 0;

    if (leadingSilenceMs > 200 || trailingSilenceMs > 600) {
      const leadTrimSec =
        leadingSilenceMs > 200 ? (leadingSilenceMs - 80) / 1000 : 0;
      const maxEndSec =
        trailingSilenceMs > 600
          ? initialPass.lastCharEndSec + 0.35
          : actualDuration;

      warnings.push(
        `Silencio fuera de umbral (leading=${leadingSilenceMs}ms, trailing=${trailingSilenceMs}ms). Aplicando ajuste de offset/recorte.`
      );

      const trimmedByFfmpeg = trimSilenceIfPossible(
        mp3Path,
        leadTrimSec,
        maxEndSec
      );
      trimOffsetMs = Math.round(leadTrimSec * 1000);

      if (trimmedByFfmpeg) {
        actualDuration = probeAudioDurationSeconds(
          mp3Path,
          Math.max(0.5, maxEndSec - leadTrimSec)
        );
      } else {
        actualDuration = Math.max(
          0.5,
          Number((maxEndSec - leadTrimSec).toFixed(3))
        );
      }
    }

    const { wordTimestamps } = buildWordTimestamps(
      alignmentSource,
      fps,
      trimOffsetMs
    );

    if (alignmentSource && Array.isArray(alignmentSource.characters)) {
      const trimSec = trimOffsetMs / 1000;
      for (let cIdx = 0; cIdx < alignmentSource.characters.length; cIdx++) {
        const ch = alignmentSource.characters[cIdx];
        const rawS = Math.max(
          0,
          Number(alignmentSource.character_start_times_seconds[cIdx] ?? 0) -
            trimSec
        );
        const rawE = Math.max(
          rawS,
          Number(alignmentSource.character_end_times_seconds[cIdx] ?? rawS) -
            trimSec
        );
        globalCharacters.push(ch);
        globalStarts.push(Number((globalTimeCursorSec + rawS).toFixed(4)));
        globalEnds.push(Number((globalTimeCursorSec + rawE).toFixed(4)));
      }
      if (i < scenes.length - 1) {
        globalCharacters.push(' ');
        globalStarts.push(Number((globalTimeCursorSec + actualDuration).toFixed(4)));
        globalEnds.push(Number((globalTimeCursorSec + actualDuration).toFixed(4)));
      }
    }

    const wordCount = wordTimestamps.length;
    const wordsPerSecond =
      actualDuration > 0 ? Number((wordCount / actualDuration).toFixed(2)) : 0;

    if (wordsPerSecond < 2.0 || wordsPerSecond > 4.5) {
      const rateWarning = `⚠️ Ritmo de habla en "${scene.id}": ${wordsPerSecond} palabras/s (rango recomendado 2.0 - 4.5 palabras/s).`;
      console.warn(rateWarning);
      warnings.push(rateWarning);
    }

    const durationInFrames =
      Math.ceil(actualDuration * fps) + crossDissolveFrames;

    manifestScenes.push({
      id: scene.id,
      audioFile: `audio/${mp3Filename}`,
      characterPreset: scene.characterPreset,
      actualDuration: Number(actualDuration.toFixed(3)),
      durationInFrames,
      wordsPerSecond,
      leadingSilenceMs,
      trailingSilenceMs,
      trimOffsetMs,
      warnings,
      wordTimestamps,
    });

    const sceneAdvanceSec =
      Math.max(1, durationInFrames - crossDissolveFrames) / fps;
    globalTimeCursorSec += sceneAdvanceSec;
  }

  const sumSceneFrames = manifestScenes.reduce(
    (acc, s) => acc + s.durationInFrames,
    0
  );
  const totalOverlapFrames =
    Math.max(0, manifestScenes.length - 1) * crossDissolveFrames;
  const totalDurationInFrames = Math.max(
    30,
    sumSceneFrames - totalOverlapFrames
  );
  const totalDurationSeconds = Number((totalDurationInFrames / fps).toFixed(3));

  const manifest = {
    generatedAt: new Date().toISOString(),
    voiceId,
    voiceName: voiceProfileName,
    fps,
    crossDissolveFrames,
    totalDurationInFrames,
    totalDurationSeconds,
    backgroundMusicFile: fs.existsSync(path.join(AUDIO_DIR, 'bgm.mp3'))
      ? 'audio/bgm.mp3'
      : null,
    scenes: manifestScenes,
  };

  fs.writeFileSync(INFO_JSON_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  fs.writeFileSync(
    LATEST_ALIGNMENT_PATH,
    JSON.stringify(
      {
        characters: globalCharacters,
        character_start_times_seconds: globalStarts,
        character_end_times_seconds: globalEnds,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(
    `✅ [elevenlabs-sync] Manifiesto escrito en public/audio/info.json y public/assets/latest_alignment.json (${totalDurationInFrames} frames / ${totalDurationSeconds}s).`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error('❌ Error en elevenlabs-sync:', err.message);
    process.exit(1);
  });
}
