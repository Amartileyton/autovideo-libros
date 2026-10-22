import React from 'react';
import {
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { SPRING_SNAPPY } from '../theme/motion';
import { KineticCard, VectorLoopCircuit } from '../components/kinetic';

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
 * Scene 3 — El Bucle del Hábito (Vectorial Mecánico + @nuncateloexplicaron Style)
 * Timestamps reales de ElevenLabs (376 frames):
 * - 0..35: "Todo hábito opera en un bucle neuronal..." -> Cabecera
 * - 35..180: VectorLoopCircuit dibuja los trazos Bézier y viaja la partícula de dopamina
 * - 100: Estación 01 (Señal)
 * - 125: Estación 02 (Anhelo)
 * - 150: Estación 03 (Respuesta)
 * - 172: Estación 04 (Recompensa)
 * - 255..360: "No te elevas al nivel de tus metas..." -> Cita icónica en KineticCard
 */
export const Scene3: React.FC<Scene3Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 1980,
  enterFrame = 725,
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
            03 / NEUROCIENCIA CONDUCTUAL
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
          El Bucle de 4 Fases
        </h1>
      </div>

      {/* 2. Circuito Vectorial Animado (VectorLoopCircuit estilo @nuncateloexplicaron) */}
      <div
        style={{
          position: 'absolute',
          top: 310,
          left: 96,
          right: 96,
        }}
      >
        <VectorLoopCircuit
          startFrame={enterFrame}
          accentColor="#D94E34"
          width={888}
          height={480}
        />
      </div>

      {/* 3. Tarjeta Cita Célebre Subrayada en KineticCard */}
      <div
        style={{
          position: 'absolute',
          top: 830,
          left: 96,
          right: 96,
        }}
      >
        <KineticCard
          enterFrame={255}
          accentBorderColor="#141413"
          badgeText="CITA DE ORO"
          badgeColor="#D94E34"
          padding="36px 36px"
          style={{
            borderLeft: '8px solid #D94E34',
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 800,
              color: '#D94E34',
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            PASAJES SUBRAYADOS · CAPÍTULO 1
          </div>

          <blockquote
            style={{
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 34,
              fontWeight: 800,
              fontStyle: 'normal',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#141413',
            }}
          >
            «No te elevas al nivel de tus{' '}
            <span
              style={{
                backgroundColor: 'rgba(217, 78, 52, 0.18)',
                padding: '2px 8px',
                borderRadius: 6,
                color: '#D94E34',
                fontWeight: 900,
              }}
            >
              metas
            </span>
            , caes al nivel de tus{' '}
            <span
              style={{
                backgroundColor: 'rgba(217, 78, 52, 0.18)',
                padding: '2px 8px',
                borderRadius: 6,
                color: '#D94E34',
                fontWeight: 900,
              }}
            >
              sistemas
            </span>
            .»
          </blockquote>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ width: 32, height: 2, backgroundColor: '#D94E34' }} />
            <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: '#141413',
            }}
            >
              James Clear
            </span>
            <span style={{ color: '#E5E2DC' }}>·</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: '#575550',
              }}
            >
              La idea más compartida del libro
            </span>
          </div>
        </KineticCard>
      </div>
    </div>
  );
};
