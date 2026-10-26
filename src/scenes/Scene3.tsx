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
  KineticCard,
  VectorLoopCircuit,
  type CircuitNode,
} from '../components/kinetic';

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

const TRANSFORMATION_NODES: CircuitNode[] = [
  {
    id: 'signal_fixed',
    num: '01',
    label: 'MISMA SEÑAL',
    sublabel: 'Mantener disparador ambiental',
    x: 170,
    y: 130,
    triggerFrame: 230,
    endSpokenFrame: 275,
  },
  {
    id: 'routine_changed',
    num: '02',
    label: 'RUTINA SUSTITUIDA',
    sublabel: 'Acción destructiva ➔ constructiva',
    x: 718,
    y: 130,
    triggerFrame: 318,
    endSpokenFrame: 375,
  },
  {
    id: 'reward_fixed',
    num: '03',
    label: 'MISMA RECOMPENSA',
    sublabel: 'Satisfacer mismo anhelo químico',
    x: 718,
    y: 350,
    triggerFrame: 280,
    endSpokenFrame: 319,
  },
  {
    id: 'new_habit',
    num: '04',
    label: 'HÁBITO REPROGRAMADO',
    sublabel: 'Consolidación en ganglios basales',
    x: 170,
    y: 350,
    triggerFrame: 375,
    endSpokenFrame: 410,
  },
];

/**
 * Scene 3 — La Regla de Oro del Cambio (Circuito de Transformación + Cita Editorial)
 * Timestamps reales de ElevenLabs (417 frames):
 * - 0..50: "Aquí reside la gran revelación de Charles Duhigg:"
 * - 100..200: "no puedes destruir un mal hábito, solo puedes sustituirlo." -> Cita de Oro (KineticCard)
 * - 230..275: "Debes conservar la misma señal..." -> Estación 01 (MISMA SEÑAL)
 * - 280..319: "...y la misma recompensa," -> Estación 03 (MISMA RECOMPENSA)
 * - 318..410: "cambiando únicamente la rutina que ejecutas." -> Estación 02 (RUTINA SUSTITUIDA) y 04 (REPROGRAMADO)
 */
export const Scene3: React.FC<Scene3Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 1980,
  enterFrame = 824,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Cita de Oro de Charles Duhigg (frame 30)
  const quoteEntrance = spring({
    frame: Math.max(0, localFrame - 30),
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Entrada de la tarjeta resumen inferior (frame 280)
  const summaryEntrance = spring({
    frame: Math.max(0, localFrame - 280),
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
      {/* 1. Tarjeta Cita de Oro de Charles Duhigg (Sin barra de título redundante) */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 96,
          right: 96,
          opacity: quoteEntrance,
          transform: `scale(${interpolate(quoteEntrance, [0, 1], [0.95, 1], CLAMP_EXTRAPOLATION)})`,
        }}
      >
        <KineticCard
          enterFrame={0}
          accentBorderColor="#141413"
          badgeColor="#D94E34"
          padding="26px 32px"
        >
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 26,
              fontWeight: 700,
              color: '#141413',
              lineHeight: 1.35,
              textAlign: 'center',
            }}
          >
            «No puedes extinguir un mal hábito; la clave consiste en{' '}
            <span
              style={{
                backgroundColor: 'rgba(217, 78, 52, 0.16)',
                borderBottom: '3px solid #D94E34',
                padding: '2px 8px',
                borderRadius: 4,
                fontWeight: 800,
                color: '#D94E34',
              }}
            >
              sustituir la rutina
            </span>{' '}
            conservando la misma señal y recompensa.»
          </div>
        </KineticCard>
      </div>

      {/* 2. Circuito Vectorial Interactivo de Transformación Sincronizado a la Voz */}
      <div
        style={{
          position: 'absolute',
          top: 380,
          left: 96,
          right: 96,
        }}
      >
        <VectorLoopCircuit
          nodes={TRANSFORMATION_NODES}
          currentFrame={localFrame}
          accentColor="#D94E34"
          width={888}
          height={480}
          showTitle={false}
        />
      </div>

      {/* 3. Tarjeta Inferior de Fórmula Neuroconductual */}
      <div
        style={{
          position: 'absolute',
          top: 895,
          left: 96,
          right: 96,
          opacity: summaryEntrance,
          transform: `translateY(${(1 - summaryEntrance) * 20}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: '#FEF9C3',
            border: '2px solid #141413',
            borderLeft: '6px solid #D94E34',
            borderRadius: 16,
            padding: '18px 24px',
            boxShadow: '0 8px 24px rgba(20, 20, 19, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 19,
                fontWeight: 800,
                color: '#141413',
              }}
            >
              Misma Señal + Nueva Rutina = Misma Recompensa
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: '#575550',
                marginTop: 3,
              }}
            >
              El principio científico demostrado por Charles Duhigg
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#D94E34',
              color: '#FFFFFF',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              padding: '8px 14px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
            }}
          >
            FÓRMULA 100%
          </div>
        </div>
      </div>
    </div>
  );
};
