import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
import {
  ExponentialGrowthChart,
  KineticCard,
  LiveCounter,
} from '../components/kinetic';

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
 * Scene 2 — La Matemática del 1% (Kinetic UI + Exponential Growth Chart)
 * Requisitos del usuario:
 * 1. Eliminadas las dos primeras cajas estáticas.
 * 2. Integrada la tarjeta hero con LiveCounter (1.00 -> 37.78x) y tipografía Plus Jakarta Sans.
 * 3. Gráfico vectorial animado de crecimiento exponencial por debajo, sincronizado con el audio de Leo.
 */
export const Scene2: React.FC<Scene2Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 0,
  enterFrame = 393,
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

  // 2. Progreso de llenado de la barra del 37.78x
  const fillProgress = spring({
    frame: Math.max(0, localFrame - 240),
    fps,
    config: { damping: 22, stiffness: 100, mass: 0.9 },
    durationInFrames: 50,
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
      {/* 1. Cabecera con tipografía de alta visibilidad */}
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
            boxShadow: '0 2px 6px rgba(217, 78, 52, 0.10)',
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 800,
              color: '#D94E34',
              letterSpacing: 1.5,
            }}
          >
            02 / INTERÉS COMPUESTO
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            fontSize: 56,
            fontWeight: 900,
            color: '#141413',
            margin: 0,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
          }}
        >
          La Regla del 1% Diario
        </h1>
      </div>

      {/* 2. Tarjeta Hero Integrada con LiveCounter (1.00 -> 37.78x) */}
      <div style={{ position: 'absolute', top: 300, left: 96, right: 96 }}>
        <KineticCard
          enterFrame={10}
          accentBorderColor="#141413"
          badgeText="POTENCIA COMPUESTA"
          badgeColor="#141413"
          padding="28px 36px"
          style={{
            borderTop: '6px solid #D94E34',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 800,
              color: '#D94E34',
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            CAPACIDAD FINAL MULTIPLICADA
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'baseline',
              lineHeight: 1,
            }}
          >
            <LiveCounter
              from={1.0}
              to={37.78}
              startFrame={235}
              durationFrames={45}
              decimals={2}
              suffix="x"
              fontSize={104}
              color="#141413"
              fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
            />
          </div>

          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: '#141413',
              marginTop: 14,
              letterSpacing: '-0.02em',
            }}
          >
            Mejor al final de un año
          </div>

          {/* Barra reactiva estilo @eldatomanda */}
          <div
            style={{
              marginTop: 16,
              width: '100%',
              height: 10,
              backgroundColor: 'rgba(217, 78, 52, 0.12)',
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${interpolate(fillProgress, [0, 1], [3, 100], CLAMP_EXTRAPOLATION)}%`,
                height: '100%',
                backgroundColor: '#D94E34',
                borderRadius: 5,
              }}
            />
          </div>
        </KineticCard>
      </div>

      {/* 3. Gráfico de Crecimiento Exponencial Animado (y = 1.01³⁶⁵) debajo de la tarjeta */}
      <div style={{ position: 'absolute', top: 660, left: 96, right: 96 }}>
        <ExponentialGrowthChart
          startFrame={enterFrame}
          width={888}
          height={500}
          accentColor="#D94E34"
        />
      </div>
    </div>
  );
};
