import React from 'react';
import { interpolate, spring, useVideoConfig } from 'remotion';
import type { WordTimestamp } from '../../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';
import { normalizeToken } from '../../utils/wordTimingBinder';
import { BIG } from './tokens';

export interface WordToken {
  text: string;
  /** Fotograma local (de la escena) en el que el locutor pronuncia la palabra */
  start: number;
  highlight: boolean;
}

/**
 * Convierte un texto de pantalla (normalmente MÁS CORTO que la locución) en tokens con el
 * fotograma exacto en que se pronuncia cada palabra, cruzándolo de forma secuencial con
 * los wordTimestamps de ElevenLabs. Las palabras que no se encuentran heredan el tiempo
 * de la anterior (+3 fotogramas), de modo que nunca aparecen antes de tiempo.
 */
export function buildTokens(
  display: string,
  timestamps: WordTimestamp[] | undefined,
  highlight: string[] = [],
  fallbackStart = 0
): WordToken[] {
  const hl = new Set(
    highlight
      .flatMap((h) => h.split(/\s+/))
      .map(normalizeToken)
      .filter(Boolean)
  );
  const spoken = (timestamps ?? []).map((t) => ({
    n: normalizeToken(t.word),
    start: t.startFrame,
  }));
  const words = display.split(/\s+/).filter(Boolean);
  let ptr = 0;
  let last = fallbackStart - 3;

  return words.map((text) => {
    const n = normalizeToken(text);
    let start = last + 3;
    if (n) {
      const limit = Math.min(spoken.length, ptr + 10);
      for (let i = ptr; i < limit; i++) {
        const s = spoken[i];
        if (!s.n) continue;
        if (s.n === n || (n.length >= 4 && (s.n.startsWith(n) || n.startsWith(s.n)))) {
          start = s.start;
          ptr = i + 1;
          break;
        }
      }
    } else {
      start = Math.max(last, fallbackStart);
    }
    last = Math.max(last, start);
    return { text, start, highlight: hl.has(n) };
  });
}

export interface KineticWordsProps {
  tokens: WordToken[];
  /** Fotograma local de la escena */
  frame: number;
  fontSize: number;
  /**
   * 'pop': cada palabra aparece (rebote) cuando se pronuncia.
   * 'karaoke': todo el texto es visible desde el primer fotograma y se "enciende" al pronunciarse.
   */
  mode?: 'pop' | 'karaoke';
  color?: string;
  accent?: string;
  align?: 'left' | 'center';
  lineHeight?: number;
  style?: React.CSSProperties;
}

/**
 * KineticWords — Tipografía cinética grande sincronizada palabra a palabra con la voz.
 * El layout es estable (las palabras no pronunciadas reservan su sitio) → cero reflujo.
 */
export const KineticWords: React.FC<KineticWordsProps> = ({
  tokens,
  frame,
  fontSize,
  mode = 'pop',
  color = BIG.ink,
  accent = BIG.accent,
  align = 'center',
  lineHeight = 1.12,
  style,
}) => {
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        fontFamily: BIG.font,
        fontWeight: 800,
        fontSize,
        lineHeight,
        letterSpacing: '-0.02em',
        textAlign: align,
        color,
        ...style,
      }}
    >
      {tokens.map((t, i) => {
        const active = frame >= t.start;
        const p = spring({
          frame: Math.max(0, frame - t.start),
          fps,
          config: SPRING_SNAPPY,
        });
        const isPop = mode === 'pop';
        const opacity = isPop
          ? active
            ? Math.min(1, p * 1.6)
            : 0
          : active
            ? 1
            : 0.28;
        const translateY = isPop && active ? (1 - p) * 26 : 0;
        const scale = isPop
          ? active
            ? interpolate(p, [0, 1], [0.8, 1], CLAMP_EXTRAPOLATION)
            : 0.8
          : active
            ? interpolate(p, [0, 1], [1.12, 1], CLAMP_EXTRAPOLATION)
            : 1;
        const wordColor = t.highlight && (active || !isPop) ? accent : color;

        return (
          <span
            key={`${i}-${t.text}`}
            style={{
              position: 'relative',
              display: 'inline-block',
              marginRight: '0.26em',
              opacity,
              color: wordColor,
              transform: `translateY(${translateY}px) scale(${scale})`,
              transformOrigin: 'center bottom',
            }}
          >
            {t.highlight ? (
              <span
                style={{
                  position: 'absolute',
                  left: -6,
                  right: -6,
                  bottom: '0.04em',
                  height: '0.34em',
                  borderRadius: 6,
                  backgroundColor: 'rgba(217, 78, 52, 0.20)',
                  transformOrigin: 'left center',
                  transform: `scaleX(${active ? Math.min(1, p) : 0})`,
                  zIndex: -1,
                }}
              />
            ) : null}
            {t.text}
          </span>
        );
      })}
    </div>
  );
};
