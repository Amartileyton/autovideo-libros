import React from 'react';
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { BRAND_CONFIG, CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

export interface Scene5Props {
  headline?: string;
  metricValue?: number;
  metricUnit?: string;
  metricLabel?: string;
  canvasOffsetX?: number;
  canvasOffsetY?: number;
  enterFrame?: number;
  bookMetadata?: BookMetadata;
  visualData?: BookVisualData;
}

/**
 * Scene 5 — Identidad y Veredicto Final (Diseño Editorial Papel Cálido + Sincronización Exacta)
 * Timestamps reales de ElevenLabs (275 frames):
 * - 0..30: "La regla definitiva..." -> Entrada de cabecera
 * - 80..130: "cada pequeña acción es un voto por la persona que quieres ser" -> Tarjeta de Identidad
 * - 165..275: "Un libro imprescindible..." -> Gran Sello Editorial de @en60segundos y Veredicto Final
 */
export const Scene5: React.FC<Scene5Props> = ({
  canvasOffsetX = 560,
  canvasOffsetY = 3960,
  enterFrame = 1402,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Cabecera (frame 0)
  const headerEntrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Tarjeta de Identidad (frame 80 - "un voto por la persona que quieres ser")
  const identityEntrance = spring({
    frame: Math.max(0, localFrame - 80),
    fps,
    config: SPRING_SNAPPY,
  });

  // 3. Sello de Veredicto Final (frame 165 - "Un libro imprescindible...")
  const verdictEntrance = spring({
    frame: Math.max(0, localFrame - 165),
    fps,
    config: SPRING_SNAPPY,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: canvasOffsetX,
        top: canvasOffsetY,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
        padding: '0 96px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Cabecera Editorial */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 96,
          right: 96,
          opacity: headerEntrance,
          transform: `translateY(${(1 - headerEntrance) * -20}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #D94E34',
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: '#D94E34',
              letterSpacing: 1.5,
            }}
          >
            05 / VEREDICTO FINAL
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
            fontSize: 56,
            fontWeight: 800,
            color: '#141413',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Cambio de Identidad
        </h1>
      </div>

      {/* 2. Tarjeta de Identidad (frame 80) */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 96,
          right: 96,
          backgroundColor: '#FFFFFF',
          border: '2px solid #141413',
          borderTop: '6px solid #D94E34',
          borderRadius: 18,
          padding: '32px 32px',
          boxShadow: '0 12px 36px rgba(45, 43, 40, 0.08)',
          opacity: identityEntrance,
          transform: `translateY(${(1 - identityEntrance) * 20}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 800,
            color: '#D94E34',
            letterSpacing: 1.5,
            marginBottom: 10,
          }}
        >
          LA TESIS DEFINITIVA
        </div>

        <blockquote
          style={{
            margin: 0,
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 34,
            fontWeight: 700,
            fontStyle: 'italic',
            lineHeight: 1.35,
            color: '#141413',
          }}
        >
          «Cada pequeña acción es un{' '}
          <span
            style={{
              backgroundColor: 'rgba(217, 78, 52, 0.18)',
              padding: '2px 8px',
              borderRadius: 4,
              color: '#D94E34',
              fontStyle: 'normal',
            }}
          >
            voto
          </span>{' '}
          por la persona que quieres ser.»
        </blockquote>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            color: '#575550',
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          No buscas leer un libro, buscas convertirte en un lector.
        </p>
      </div>

      {/* 3. Gran Ficha de Veredicto y Sello del Canal (frame 165) */}
      <div
        style={{
          position: 'absolute',
          top: 640,
          left: 96,
          right: 96,
          backgroundColor: '#FFFFFF',
          border: '2px solid #D94E34',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(217, 78, 52, 0.12)',
          textAlign: 'center',
          opacity: verdictEntrance,
          transform: `scale(${interpolate(verdictEntrance, [0, 1], [0.90, 1], CLAMP_EXTRAPOLATION)})`,
        }}
      >
        {/* Sello Circular del Canal */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#D94E34',
            color: '#FFFFFF',
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 32,
            fontWeight: 900,
            boxShadow: '0 6px 16px rgba(217, 78, 52, 0.35)',
          }}
        >
          ✓
        </div>

        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            fontWeight: 800,
            color: '#D94E34',
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          {BRAND_CONFIG.sealText}
        </div>

        <div
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 42,
            fontWeight: 800,
            color: '#141413',
            letterSpacing: '-0.02em',
          }}
        >
          Lectura Imprescindible
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
            padding: '12px 20px',
            backgroundColor: '#F8F7F4',
            borderRadius: 12,
            border: '1px solid #E5E2DC',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: 28,
                fontWeight: 800,
                color: '#D97706',
              }}
            >
              ★ 4.38
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: '#575550',
              }}
            >
              1.94M en Goodreads
            </div>
          </div>

          <div style={{ width: 1, height: 36, backgroundColor: '#E5E2DC' }} />

          <div>
            <div
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: 28,
                fontWeight: 800,
                color: '#141413',
              }}
            >
              4.2h
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: '#575550',
              }}
            >
              Lectura completa
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: '#D94E34',
            letterSpacing: 0.5,
          }}
        >
          Síguenos en {BRAND_CONFIG.channelHandle} para más libros en 60s
        </div>
      </div>
    </div>
  );
};
