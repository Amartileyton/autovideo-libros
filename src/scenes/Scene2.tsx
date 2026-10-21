import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

export interface Scene2Props {
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
 * Scene 2 — Punto 1: Olvídate de las Metas (Metas vs Sistemas)
 * - Tarjeta comparativa limpia entre la trampa de la meta aislada y el poder del sistema diario.
 * - Cita icónica de James Clear que refuerza la lección al final de la escena.
 */
export const Scene2: React.FC<Scene2Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 0,
  enterFrame = 344,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Entrada de la cabecera
  const headerEntrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Tarjeta 1: Las Metas (frame 40 - "olvídate de las metas")
  const goalsEntrance = spring({
    frame: Math.max(0, localFrame - 40),
    fps,
    config: SPRING_SNAPPY,
  });

  // 3. Tarjeta 2: Los Sistemas (frame 230 - "la verdadera diferencia...")
  const systemsEntrance = spring({
    frame: Math.max(0, localFrame - 230),
    fps,
    config: SPRING_SNAPPY,
  });

  // 4. Cita de James Clear (frame 290 - "...el sistema diario que construyes")
  const quoteEntrance = spring({
    frame: Math.max(0, localFrame - 290),
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
          opacity: headerEntrance,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '6px 20px',
            borderRadius: 30,
            backgroundColor: 'rgba(245, 158, 11, 0.18)',
            border: '1.5px solid #F59E0B',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 22,
            fontWeight: 800,
            color: '#FBBF24',
            letterSpacing: '0.1em',
          }}
        >
          PUNTO 01 · LA GRAN PARADOJA
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
          OLVÍDATE DE LAS METAS
        </div>
      </div>

      {/* TARJETA 1: LA ILUSIÓN DE LAS METAS */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 380,
          padding: '28px 34px',
          borderRadius: 20,
          backgroundColor: '#1C1917',
          border: '2px solid rgba(239, 68, 68, 0.45)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
          opacity: goalsEntrance,
          transform: `translateY(${interpolate(goalsEntrance, [0, 1], [30, 0], CLAMP_EXTRAPOLATION)}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 20,
            }}
          >
            ✕
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 24,
              fontWeight: 800,
              color: '#F87171',
              letterSpacing: '0.06em',
            }}
          >
            LA META AISLADA
          </span>
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: '#D6D3CD',
            lineHeight: 1.35,
          }}
        >
          Ganadores y perdedores tienen{' '}
          <strong style={{ color: '#FFFFFF' }}>exactamente la misma meta</strong>.
          Tener una meta no te hace ganar.
        </div>
      </div>

      {/* TARJETA 2: EL PODER DE LOS SISTEMAS */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 660,
          padding: '28px 34px',
          borderRadius: 20,
          backgroundColor: '#0F1F1D',
          border: '2px solid #10B981',
          boxShadow: '0 20px 50px rgba(16, 185, 129, 0.20)',
          opacity: systemsEntrance,
          transform: `translateY(${interpolate(systemsEntrance, [0, 1], [30, 0], CLAMP_EXTRAPOLATION)}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 20,
            }}
          >
            ✓
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 24,
              fontWeight: 800,
              color: '#34D399',
              letterSpacing: '0.06em',
            }}
          >
            EL SISTEMA DIARIO
          </span>
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: '#ECFDF5',
            lineHeight: 1.35,
          }}
        >
          La verdadera diferencia es el{' '}
          <strong style={{ color: '#34D399' }}>sistema diario</strong> que
          construyes y ejecutas sin pensarlo.
        </div>
      </div>

      {/* CITA ICÓNICA DE JAMES CLEAR */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 960,
          padding: '32px 36px',
          borderRadius: 22,
          backgroundColor: '#18181B',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
          opacity: quoteEntrance,
          transform: `scale(${quoteEntrance})`,
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
            lineHeight: 1.35,
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          «No te elevas al nivel de tus metas, caes al nivel de tus sistemas.»
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 20,
            fontWeight: 700,
            color: '#F59E0B',
            textAlign: 'center',
            letterSpacing: '0.08em',
          }}
        >
          — JAMES CLEAR
        </div>
      </div>
    </div>
  );
};
