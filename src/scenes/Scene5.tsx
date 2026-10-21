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
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

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
 * Scene 5 — Identidad y Llamada a la Acción (CTA Final)
 * - Tarjeta de Identidad: "Cada acción es un voto por tu identidad".
 * - Panel animado de cierre: "¿Quieres más libros en 60 segundos? Síguenos y comenta".
 */
export const Scene5: React.FC<Scene5Props> = ({
  canvasOffsetX = 560,
  canvasOffsetY = 3960,
  enterFrame = 1499,
  bookMetadata,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  const coverSrc =
    bookMetadata?.coverImage ?? 'assets/books/habitos-atomicos-cover.jpg';

  // 1. Tarjeta de identidad
  const identityEntrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. CTA final (sincronizado a frame 145 - "¿Quieres ver más libros...?")
  const ctaEntrance = spring({
    frame: Math.max(0, localFrame - 145),
    fps,
    config: SPRING_SNAPPY,
  });

  // Pulso sutil en el botón de seguir
  const pulse = Math.sin(localFrame * 0.25) * 0.05 + 1.0;

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
      {/* CABECERA */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 96,
          right: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          opacity: identityEntrance,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '6px 20px',
            borderRadius: 30,
            backgroundColor: 'rgba(34, 197, 94, 0.18)',
            border: '1.5px solid #22C55E',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 22,
            fontWeight: 800,
            color: '#4ADE80',
            letterSpacing: '0.1em',
          }}
        >
          LA REGLA DE ORO
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          CAMBIO DE IDENTIDAD
        </div>
      </div>

      {/* TARJETA 1: LA FRASE DE IDENTIDAD */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 360,
          padding: '36px 40px',
          borderRadius: 24,
          backgroundColor: '#18181B',
          border: '2px solid rgba(34, 197, 94, 0.45)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
          opacity: identityEntrance,
          transform: `translateY(${interpolate(identityEntrance, [0, 1], [30, 0], CLAMP_EXTRAPOLATION)}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: 34,
            lineHeight: 1.4,
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          «Cada pequeña acción es un voto por la persona que quieres llegar a ser.»
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 22,
            fontWeight: 600,
            color: '#4ADE80',
            textAlign: 'center',
          }}
        >
          Tus hábitos no solo cambian tus resultados; cambian quién eres.
        </div>
      </div>

      {/* PANEL DE CIERRE / CTA FINAL */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 690,
          padding: '40px 36px',
          borderRadius: 26,
          backgroundColor: '#0F172A',
          border: '2.5px solid #38BDF8',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(56, 189, 248, 0.25)',
          opacity: ctaEntrance,
          transform: `scale(${ctaEntrance})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              width: 80,
              height: 120,
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}
          >
            <Img
              src={staticFile(coverSrc)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 20,
                fontWeight: 800,
                color: '#38BDF8',
                letterSpacing: '0.08em',
              }}
            >
              ¿QUIERES MÁS LIBROS EN 60s?
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 32,
                fontWeight: 900,
                color: '#FFFFFF',
              }}
            >
              ¡SÍGUENOS Y COMENTA!
            </span>
          </div>
        </div>

        {/* Botón interactivo de Seguir */}
        <div
          style={{
            padding: '16px 42px',
            borderRadius: 30,
            backgroundColor: '#DC2626',
            boxShadow: '0 12px 30px rgba(220, 38, 38, 0.5)',
            transform: `scale(${pulse})`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 26 }}>🔔</span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 26,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.08em',
            }}
          >
            SEGUIR CANAL
          </span>
        </div>

        {/* Sugerencia de comentario */}
        <div
          style={{
            padding: '14px 24px',
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 22,
            fontWeight: 600,
            color: '#E2E8F0',
            textAlign: 'center',
          }}
        >
          💬 ¿Qué libro quieres ver en el próximo vídeo?
        </div>
      </div>
    </div>
  );
};
