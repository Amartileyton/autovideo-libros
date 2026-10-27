import React, { useMemo } from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
import {
  ComparisonBattle,
  ExponentialGrowthChart,
  KineticCard,
  VectorLoopCircuit,
} from '../components/kinetic';
import {
  bindCircuitNodesToAudio,
  findKeywordFrameWindow,
  type BoundCircuitNode,
} from '../utils/wordTimingBinder';

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
  layoutPreset?: SceneLayoutPreset;
  wordTimestamps?: WordTimestamp[];
}

const DEFAULT_TRANSFORMATION_NODES: BoundCircuitNode[] = [
  {
    id: 'signal_fixed',
    num: '01',
    label: 'MISMA SEÑAL',
    sublabel: 'Mantener disparador ambiental',
    x: 170,
    y: 130,
    triggerFrame: 230,
    endSpokenFrame: 275,
    triggerKeyword: ['señal', 'senal'],
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
    triggerKeyword: ['rutina', 'cambiando'],
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
    triggerKeyword: ['recompensa'],
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
    triggerKeyword: ['ejecutas'],
  },
];

/**
 * Scene 3 — La Regla de Oro del Cambio (Motor Híbrido Inteligente + Auto-Binder Semántico)
 * Soporta los 3 presets del cuestionario interactivo:
 * - RULE_TRANSFORM_CIRCUIT (Default): Circuito interactivo de transformación sincronizado a la voz + Cita Editorial
 * - RULE_SUBSTITUTION_DIAGRAM: Diagrama de Sustitución (Rutina Vieja Tachada vs Nueva Rutina) + Cita Editorial
 * - RULE_EXPONENTIAL_EVIDENCE: Gráfico de Progresión Temporal + Tarjeta de Evidencia
 */
export const Scene3: React.FC<Scene3Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 1980,
  enterFrame = 824,
  visualData,
  layoutPreset = 'RULE_TRANSFORM_CIRCUIT',
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // Auto-binding semántico de los 4 nodos del circuito de transformación
  const boundNodes = useMemo(() => {
    const coords = [
      { x: 170, y: 130, fallbackStart: 230, fallbackEnd: 275 },
      { x: 718, y: 130, fallbackStart: 318, fallbackEnd: 375 },
      { x: 718, y: 350, fallbackStart: 280, fallbackEnd: 319 },
      { x: 170, y: 350, fallbackStart: 375, fallbackEnd: 410 },
    ];

    const rawNodes: BoundCircuitNode[] =
      visualData?.circuitNodes && visualData.circuitNodes.length === 4
        ? visualData.circuitNodes.map((n, idx) => ({
            id: n.id,
            num: n.num,
            label: n.label,
            sublabel: n.sublabel,
            x: coords[idx].x,
            y: coords[idx].y,
            triggerFrame: n.triggerFrame ?? coords[idx].fallbackStart,
            endSpokenFrame: n.endSpokenFrame ?? coords[idx].fallbackEnd,
            triggerKeyword: n.triggerKeyword ?? [n.label],
          }))
        : DEFAULT_TRANSFORMATION_NODES;

    return bindCircuitNodesToAudio(rawNodes, wordTimestamps);
  }, [visualData?.circuitNodes, wordTimestamps]);

  const formulaWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['recompensa', 'rutina'],
        280,
        350
      ),
    [wordTimestamps]
  );

  // 1. Cita de Oro de Charles Duhigg (frame 30)
  const quoteEntrance = spring({
    frame: Math.max(0, localFrame - 30),
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Entrada de la tarjeta resumen inferior sincronizada
  const summaryEntrance = spring({
    frame: Math.max(0, localFrame - formulaWindow.startFrame),
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

      {/* 2. Bloque Central Gobernado por layoutPreset (Motor Híbrido Inteligente) */}
      <div
        style={{
          position: 'absolute',
          top: 380,
          left: 96,
          right: 96,
        }}
      >
        {layoutPreset === 'RULE_SUBSTITUTION_DIAGRAM' ? (
          <ComparisonBattle
            titleA="Intentar Suprimir el Hábito"
            subtitleA="Luchar contra la señal y el anhelo agota la fuerza de voluntad"
            tagA="FRACASO RECURRENTE"
            titleB="Sustituir Solo la Rutina"
            subtitleB="Misma señal + Nueva conducta constructiva = Mismo alivio"
            tagB="REGLA DE ORO (DUHIGG)"
            metricB={{ value: 100, suffix: '% EFICAZ' }}
            enterFrameA={130}
            enterFrameB={185}
            battleFrame={240}
            accentColor="#D94E34"
          />
        ) : layoutPreset === 'RULE_EXPONENTIAL_EVIDENCE' ? (
          <ExponentialGrowthChart
            startFrame={enterFrame + 40}
            width={888}
            height={480}
            accentColor="#D94E34"
            showTitle={false}
          />
        ) : (
          <VectorLoopCircuit
            nodes={boundNodes}
            currentFrame={localFrame}
            accentColor="#D94E34"
            width={888}
            height={480}
            showTitle={false}
          />
        )}
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
              {visualData?.formulaLabel ??
                'Misma Señal + Nueva Rutina = Misma Recompensa'}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: '#575550',
                marginTop: 3,
              }}
            >
              {visualData?.formulaSublabel ??
                'El principio científico demostrado por Charles Duhigg'}
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
