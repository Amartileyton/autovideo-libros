import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

export interface Scene3Props {
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
 * Scene 3 — Punto 2: La Matemática del 1% Diario (Efecto Compuesto)
 * - Tarjeta matemática moderna: 1.01^365 = 37.78x frente a 0.99^365 = 0.03x.
 * - Contador dinámico sincronizado a la locución "treinta y siete veces mejor".
 */
export const Scene3: React.FC<Scene3Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 1980,
  enterFrame = 733,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Cabecera
  const headerEntrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Tarjeta de fórmula (+1% diario)
  const formulaEntrance = spring({
    frame: Math.max(0, localFrame - 30),
    fps,
    config: SPRING_SNAPPY,
  });

  // 3. Contador exponencial animado entre frames 240 y 365 ("treinta y siete veces mejor")
  const counterValue = interpolate(
    localFrame,
    [240, 365],
    [1.0, 37.78],
    CLAMP_EXTRAPOLATION
  ).toFixed(2);

  const progressPct = interpolate(
    localFrame,
    [240, 365],
    [3, 100],
    CLAMP_EXTRAPOLATION
  );

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
            backgroundColor: 'rgba(56, 189, 248, 0.18)',
            border: '1.5px solid #38BDF8',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 22,
            fontWeight: 800,
            color: '#38BDF8',
            letterSpacing: '0.1em',
          }}
        >
          PUNTO 02 · EFECTO COMPUESTO
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
          LA MATEMÁTICA DEL 1%
        </div>
      </div>

      {/* TARJETA PRINCIPAL DE LA FÓRMULA EXPONENCIAL */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 380,
          padding: '36px 40px',
          borderRadius: 24,
          backgroundColor: '#0F1F1D',
          border: '2.5px solid #10B981',
          boxShadow: '0 24px 70px rgba(16, 185, 129, 0.25)',
          opacity: formulaEntrance,
          transform: `translateY(${interpolate(formulaEntrance, [0, 1], [40, 0], CLAMP_EXTRAPOLATION)}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 24,
              fontWeight: 800,
              color: '#34D399',
            }}
          >
            +1% CADA DÍA
          </span>
          <span
            style={{
              padding: '4px 14px',
              borderRadius: 20,
              backgroundColor: '#10B981',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 20,
              fontWeight: 800,
              color: '#06281E',
            }}
          >
            365 DÍAS
          </span>
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 68,
            fontWeight: 900,
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          {counterValue}x
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: '#A7F3D0',
            textAlign: 'center',
          }}
        >
          1.01³⁶⁵ = 37.78 veces mejor en un año
        </div>

        {/* Barra de progreso de crecimiento */}
        <div
          style={{
            width: '100%',
            height: 14,
            borderRadius: 7,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              backgroundColor: '#34D399',
              borderRadius: 7,
            }}
          />
        </div>
      </div>

      {/* TARJETA COMPARATIVA: EL DECLIVE (-1% DIARIO) */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 860,
          padding: '28px 36px',
          borderRadius: 20,
          backgroundColor: '#1C1917',
          border: '2px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
          opacity: formulaEntrance,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 22,
              fontWeight: 800,
              color: '#F87171',
            }}
          >
            -1% CADA DÍA
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#A8A29E',
              marginTop: 4,
            }}
          >
            0.99³⁶⁵ = 0.03x (Declive casi total)
          </div>
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 36,
            fontWeight: 900,
            color: '#EF4444',
          }}
        >
          0.03x
        </div>
      </div>
    </div>
  );
};
