/**
 * src/utils/alignmentParser.ts
 * Parser de alineamiento carácter-a-palabra con cadencia continua.
 *
 * Características clave:
 * - Cadencia sin micro-cortes: cuando aparece un espacio en blanco, endSec de la palabra
 *   toma el tStart de ese espacio para garantizar continuidad absoluta entre palabras.
 * - Extractor automático de cambios de paso (extractStepChanges) por coincidencia semántica
 *   o distribución equitativa.
 */

import type { WordTimestamp } from '../data/schema';

export interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface WordTiming {
  word: string;
  startSec: number;
  endSec: number;
}

export function parseAlignment(alignment: ElevenLabsAlignment): WordTiming[] {
  const words: WordTiming[] = [];
  const chars = alignment?.characters || [];
  const starts = alignment?.character_start_times_seconds || [];
  const ends = alignment?.character_end_times_seconds || [];

  let currentWord = '';
  let wordStart = -1;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const tStart = starts[i] ?? 0;
    const tEnd = ends[i] ?? tStart;

    if (ch === ' ' || ch === '\n' || ch === '\t') {
      if (currentWord.trim().length > 0 && wordStart >= 0) {
        words.push({
          word: currentWord.trim(),
          startSec: wordStart,
          endSec: tStart,
        });
      }
      currentWord = '';
      wordStart = -1;
    } else {
      if (wordStart < 0) {
        wordStart = tStart;
      }
      currentWord += ch;
      if (i === chars.length - 1 && currentWord.trim().length > 0) {
        words.push({
          word: currentWord.trim(),
          startSec: wordStart,
          endSec: tEnd,
        });
      }
    }
  }

  return words;
}

/**
 * Convierte un array de WordTiming (segundos) al esquema WordTimestamp de nuestro estudio.
 */
export function wordTimingsToTimestamps(
  timings: WordTiming[],
  fps = 30
): WordTimestamp[] {
  return timings.map((w) => {
    const startMs = Math.max(0, Math.round(w.startSec * 1000));
    const endMs = Math.max(startMs + 25, Math.round(w.endSec * 1000));
    return {
      word: w.word,
      startMs,
      endMs,
      startFrame: Math.floor((startMs / 1000) * fps),
      endFrame: Math.ceil((endMs / 1000) * fps),
    };
  });
}

/**
 * Calcula los tiempos de activación de cada nodo/paso visual buscando palabras clave
 * en el stream de palabras habladas, con fallback equitativo si no hay coincidencia.
 */
export function extractStepChanges(
  words: WordTiming[],
  steps: string[],
  totalDurationSec: number
): number[] {
  if (!steps || steps.length === 0) return [];
  if (words.length === 0) {
    const interval = totalDurationSec / steps.length;
    return steps.map((_, idx) => Number((idx * interval).toFixed(2)));
  }

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const normalizedWords = words.map((w) => ({
    ...w,
    clean: normalize(w.word),
  }));

  const stepStartSeconds: number[] = [];
  let lastWordIdx = 0;

  for (let sIdx = 0; sIdx < steps.length; sIdx++) {
    if (sIdx === 0) {
      stepStartSeconds.push(0.1);
      continue;
    }

    const rawTokens = steps[sIdx]
      .replace(/^Paso\s*\d+\s*[:.-]?\s*/i, '')
      .split(/\s+/)
      .map(normalize)
      .filter((t) => t.length >= 4);

    let matchedSec: number | null = null;

    for (const token of rawTokens) {
      const foundIdx = normalizedWords.findIndex(
        (nw, idx) =>
          idx > lastWordIdx &&
          (nw.clean.includes(token) || token.includes(nw.clean))
      );
      if (foundIdx !== -1) {
        matchedSec = normalizedWords[foundIdx].startSec;
        lastWordIdx = foundIdx;
        break;
      }
    }

    if (matchedSec !== null) {
      stepStartSeconds.push(Number(matchedSec.toFixed(2)));
    } else {
      const prevSec = stepStartSeconds[sIdx - 1];
      const remainingSteps = steps.length - sIdx + 1;
      const fallbackSec = prevSec + (totalDurationSec - prevSec) / remainingSteps;
      stepStartSeconds.push(Number(fallbackSec.toFixed(2)));
    }
  }

  return stepStartSeconds;
}
