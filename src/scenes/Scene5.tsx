import React from 'react';
import {
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { BRAND_CONFIG, SPRING_SNAPPY } from '../theme/motion';
import { CtaEndCard, KineticCard } from '../components/kinetic';

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
 * Scene 5 — Identidad y Call To Action Final (Kinetic UI + CTA Conversion)
 * Timestamps reales de ElevenLabs (275 frames):
 * - 0..30: "La regla definitiva..." -> Entrada de cabecera
 * - 40..130: "cada pequeña acción es un voto por la persona que quieres ser" -> KineticCard de Identidad
 * - 160..275: "Un libro imprescindible para transformar tu vida..." -> Gran CtaEndCard con llamada a la acción
 */
export const Scene5: React.FC<Scene5Props> = ({
  canvasOffsetX = 560,
  canvasOffsetY = 3960,
  enterFrame = 1402,
  visualData,
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
      {/* 1. Cabecera Editorial con tipografía moderna de alta visibilidad */}
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
            05 / VEREDICTO FINAL
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
          Cambio de Identidad
        </h1>
      </div>

      {/* 2. Tarjeta de Identidad en KineticCard (frame 40) */}
      <div style={{ position: 'absolute', top: 310, left: 96, right: 96 }}>
        <KineticCard
          enterFrame={40}
          accentBorderColor="#141413"
          badgeText="EL SECRETO DEFINITIVO"
          badgeColor="#D94E34"
          padding="32px 36px"
          style={{
            borderTop: '6px solid #D94E34',
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
            LA TESIS DE JAMES CLEAR
          </div>

          <blockquote
            style={{
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              fontStyle: 'normal',
              lineHeight: 1.3,
              color: '#141413',
              letterSpacing: '-0.02em',
            }}
          >
            «Cada pequeña acción es un{' '}
            <span
              style={{
                backgroundColor: 'rgba(217, 78, 52, 0.18)',
                padding: '2px 8px',
                borderRadius: 6,
                color: '#D94E34',
                fontWeight: 900,
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
              marginTop: 14,
              marginBottom: 0,
              fontWeight: 500,
            }}
          >
            El verdadero cambio no es de resultado, sino de identidad.
          </p>
        </KineticCard>
      </div>

      {/* 3. Tarjeta Final de Call To Action (CTA) de Alto Rendimiento (frame 155) */}
      <div style={{ position: 'absolute', top: 620, left: 96, right: 96 }}>
        <CtaEndCard
          enterFrame={155}
          handle={BRAND_CONFIG.channelHandle}
          questionText={
            visualData?.ctaPrompt ??
            '¿Cuál es el primer hábito que vas a construir hoy?'
          }
        />
      </div>
    </div>
  );
};
