import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import {
  KineticCard,
  LiveCounter,
  VectorLoopCircuit,
  type CircuitNode,
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

const DUHIGG_NODES: CircuitNode[] = [
  {
    id: 'signal',
    num: '01',
    label: 'SEÑAL',
    sublabel: 'Disparador ambiental o emocional',
    x: 170,
    y: 130,
    triggerFrame: 235,
    endSpokenFrame: 278,
  },
  {
    id: 'routine',
    num: '02',
    label: 'RUTINA',
    sublabel: 'Conducta física, mental o emocional',
    x: 718,
    y: 130,
    triggerFrame: 278,
    endSpokenFrame: 317,
  },
  {
    id: 'reward',
    num: '03',
    label: 'RECOMPENSA',
    sublabel: 'Descarga neuroquímica de dopamina',
    x: 718,
    y: 350,
    triggerFrame: 317,
    endSpokenFrame: 357,
  },
  {
    id: 'craving',
    num: '04',
    label: 'ANHELO',
    sublabel: 'Combustible biológico del bucle',
    x: 170,
    y: 350,
    triggerFrame: 357,
    endSpokenFrame: 396,
  },
];

/**
 * Scene 2 — El Bucle Neurológico del MIT (Kinetic UI + Vector Loop Circuit)
 * Timestamps reales de ElevenLabs (406 frames):
 * - 0..49: "En los laboratorios del MIT" -> Entrada de tarjeta de ganglios basales
 * - 79..130: "cerebro ahorra energía" -> LiveCounter sube a 3 FASES
 * - 235..278: "Una señal que lo activa," -> Estación 01 (SEÑAL) ACTIVA
 * - 278..317: "una rutina automática" -> Estación 02 (RUTINA) ACTIVA
 * - 317..357: "y una recompensa química" -> Estación 03 (RECOMPENSA) ACTIVA
 * - 357..396: "que libera dopamina." -> Estación 04 (ANHELO) ACTIVA
 */
export const Scene2: React.FC<Scene2Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 0,
  enterFrame = 428,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

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
      {/* 1. Tarjeta Ganglios Basales (Sin título de fondo ni barra redundante) */}
      <div style={{ position: 'absolute', top: 150, left: 96, right: 96 }}>
        <KineticCard
          enterFrame={10}
          accentBorderColor="#141413"
          badgeColor="#D94E34"
          padding="24px 30px"
          style={{
            borderTop: '6px solid #D94E34',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'baseline',
              lineHeight: 1,
            }}
          >
            <LiveCounter
              from={0}
              to={3}
              startFrame={170}
              durationFrames={25}
              suffix=" FASES"
              fontSize={60}
              color="#141413"
            />
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: '#575550',
              marginTop: 10,
              lineHeight: 1.4,
            }}
          >
            El cerebro automatiza el bucle para ahorrar energía y liberar la corteza prefrontal
          </div>
        </KineticCard>
      </div>

      {/* 2. Circuito Vectorial Animado del Bucle del Hábito Sincronizado a la Voz */}
      <div
        style={{
          position: 'absolute',
          top: 380,
          left: 96,
          right: 96,
        }}
      >
        <VectorLoopCircuit
          nodes={DUHIGG_NODES}
          currentFrame={localFrame}
          accentColor="#D94E34"
          width={888}
          height={480}
          showTitle={false}
        />
      </div>

      {/* 3. Tarjeta Inferior con Cita Neurocientífica (Sin barra de título redundante) */}
      <div
        style={{
          position: 'absolute',
          top: 895,
          left: 96,
          right: 96,
        }}
      >
        <KineticCard
          enterFrame={200}
          accentBorderColor="#141413"
          badgeColor="#D94E34"
          padding="22px 28px"
        >
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: '#141413',
              lineHeight: 1.38,
              textAlign: 'center',
            }}
          >
            «El anhelo es el combustible silencioso que mantiene girando el bucle en tu cerebro.»
          </div>
        </KineticCard>
      </div>
    </div>
  );
};
