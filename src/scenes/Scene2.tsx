import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import {
  ComparisonBattle,
  ExponentialGrowthChart,
  KineticCard,
  LiveCounter,
  VectorLoopCircuit,
} from '../components/kinetic';
import {
  bindCircuitNodesToAudio,
  findKeywordFrameWindow,
  type BoundCircuitNode,
} from '../utils/wordTimingBinder';

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
  layoutPreset?: SceneLayoutPreset;
  wordTimestamps?: WordTimestamp[];
}

const DEFAULT_DUHIGG_NODES: BoundCircuitNode[] = [
  {
    id: 'signal',
    num: '01',
    label: 'SEÑAL',
    sublabel: 'Disparador ambiental o emocional',
    x: 170,
    y: 130,
    triggerFrame: 235,
    endSpokenFrame: 278,
    triggerKeyword: ['señal', 'senal'],
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
    triggerKeyword: ['rutina'],
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
    triggerKeyword: ['recompensa'],
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
    triggerKeyword: ['dopamina', 'libera', 'anhelo'],
  },
];

/**
 * Scene 2 — La Tesis / Mecanismo Científico (Motor Híbrido Inteligente + Auto-Binder Semántico)
 * Soporta los 3 presets del cuestionario interactivo:
 * - THESIS_LOOP_CIRCUIT (Default): VectorLoopCircuit sincronizado a la voz + KineticCard
 * - THESIS_EXPONENTIAL_CHART: ExponentialGrowthChart + LiveCounter
 * - THESIS_COMPARISON_BATTLE: ComparisonBattle + KineticCard
 */
export const Scene2: React.FC<Scene2Props> = ({
  metricValue = 3,
  metricUnit = ' FASES',
  canvasOffsetX = 1120,
  canvasOffsetY = 0,
  enterFrame = 428,
  visualData,
  layoutPreset = 'THESIS_LOOP_CIRCUIT',
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - enterFrame);

  // Auto-binding del contador de fases
  const counterWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        visualData?.hookTriggerKeyword ?? ['tres', 'fases', 'bucle'],
        165,
        200
      ),
    [wordTimestamps, visualData?.hookTriggerKeyword]
  );

  // Auto-binding semántico de los 4 nodos del circuito a partir de scenes.json + info.json
  const boundNodes = useMemo(() => {
    const coords = [
      { x: 170, y: 130, fallbackStart: 235, fallbackEnd: 278 },
      { x: 718, y: 130, fallbackStart: 278, fallbackEnd: 317 },
      { x: 718, y: 350, fallbackStart: 317, fallbackEnd: 357 },
      { x: 170, y: 350, fallbackStart: 357, fallbackEnd: 396 },
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
        : DEFAULT_DUHIGG_NODES;

    return bindCircuitNodesToAudio(rawNodes, wordTimestamps);
  }, [visualData?.circuitNodes, wordTimestamps]);

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
      {/* 1. Tarjeta Superior con LiveCounter sincronizado (Sin título de fondo ni barra redundante) */}
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
              to={metricValue}
              startFrame={counterWindow.startFrame}
              durationFrames={25}
              suffix={metricUnit.startsWith(' ') ? metricUnit : ` ${metricUnit}`}
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

      {/* 2. Bloque Central Gobernado por layoutPreset (Motor Híbrido Inteligente) */}
      <div
        style={{
          position: 'absolute',
          top: 380,
          left: 96,
          right: 96,
        }}
      >
        {layoutPreset === 'THESIS_EXPONENTIAL_CHART' ? (
          <ExponentialGrowthChart
            startFrame={enterFrame + 30}
            width={888}
            height={480}
            accentColor="#D94E34"
            showTitle={false}
          />
        ) : layoutPreset === 'THESIS_COMPARISON_BATTLE' ? (
          <ComparisonBattle
            titleA={visualData?.mythLabel ?? 'Corteza Prefrontal'}
            subtitleA="Alto gasto metabólico en cada micro-decisión"
            tagA="ESFUERZO CONSCIENTE"
            titleB={visualData?.realityLabel ?? 'Ganglios Basales'}
            subtitleB="Ejecución automática en bucle de 3 fases"
            tagB="AHORRO NEURONAL"
            metricB={{ value: metricValue, suffix: ' FASES' }}
            enterFrameA={120}
            enterFrameB={170}
            battleFrame={220}
            accentColor="#D94E34"
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
            {visualData?.centralQuote ??
              '«El anhelo es el combustible silencioso que mantiene girando el bucle en tu cerebro.»'}
          </div>
        </KineticCard>
      </div>
    </div>
  );
};
