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
 *
 * Distribución vertical balanceada que ocupa toda la pantalla (80px a 1480px):
 * 1. Tarjeta Superior con LiveCounter sincronizado: top 80px a 290px
 * 2. Bloque Central (ExponentialGrowthChart): top 320px a 940px
 * 3. Tarjeta Inferior de Impacto Editorial: top 980px a 1480px (gran presencia vertical)
 */
export const Scene2: React.FC<Scene2Props> = ({
  metricValue = 99,
  metricUnit = '%',
  canvasOffsetX = 1120,
  canvasOffsetY = 0,
  enterFrame = 361,
  visualData,
  layoutPreset = 'THESIS_EXPONENTIAL_CHART',
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - enterFrame);

  // Auto-binding del contador de fases/métricas
  const counterWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        visualData?.hookTriggerKeyword ?? ['primera', 'regla', 'biologica'],
        4,
        45
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
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Tarjeta Superior con LiveCounter sincronizado (top: 80px a 290px, left: 54, right: 54) */}
      <div style={{ position: 'absolute', top: 80, left: 54, right: 54 }}>
        <KineticCard
          enterFrame={10}
          accentBorderColor="#141413"
          badgeColor="#D94E34"
          padding="28px 36px"
          style={{
            borderTop: '7px solid #D94E34',
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
              fontSize={78}
              color="#141413"
            />
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 23,
              fontWeight: 700,
              color: '#374151',
              marginTop: 12,
              lineHeight: 1.35,
            }}
          >
            {visualData?.formulaLabel ??
              'Más del 99% de la riqueza de Warren Buffett se acumuló tras cumplir cincuenta años'}
          </div>
        </KineticCard>
      </div>

      {/* 2. Bloque Central Gobernado por layoutPreset (top: 320px a 920px, Ancho Completo 972px) */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 54,
          right: 54,
        }}
      >
        {layoutPreset === 'THESIS_EXPONENTIAL_CHART' ? (
          <ExponentialGrowthChart
            startFrame={enterFrame + 20}
            width={972}
            height={580}
            accentColor="#D94E34"
            showTitle={false}
            multiplierMax={99}
            peakBadgeText="99% DE LA FORTUNA"
            latentLabel="PACIENCIA Y ACUMULACIÓN INVISIBLE"
            unit="%"
            xLabels={['20 AÑOS', '35 AÑOS', '50 AÑOS', '65 AÑOS', '80+ AÑOS']}
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
            currentFrame={localFrame}
            accentColor="#D94E34"
          />
        ) : (
          <VectorLoopCircuit
            nodes={boundNodes}
            currentFrame={localFrame}
            accentColor="#D94E34"
            width={972}
            height={540}
            showTitle={false}
          />
        )}
      </div>

      {/* 3. Tarjeta Inferior de Gran Formato y Presencia Vertical (top: 940px a 1480px) */}
      <div
        style={{
          position: 'absolute',
          top: 940,
          left: 54,
          right: 54,
          height: 520,
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: '#FEF9C3',
            border: '2.5px solid #141413',
            borderLeft: '8px solid #D94E34',
            borderRadius: 26,
            padding: '38px 44px',
            boxShadow: '0 16px 44px rgba(20, 20, 19, 0.08), 0 4px 14px rgba(0,0,0,0.04)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                backgroundColor: '#D94E34',
                color: '#FFFFFF',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 15,
                fontWeight: 900,
                padding: '5px 16px',
                borderRadius: 8,
                letterSpacing: 0.5,
              }}
            >
              {visualData?.growthMetric ?? 'PSICOLOGÍA DEL GASTO'}
            </span>

            <span
              style={{
                backgroundColor: '#141413',
                color: '#FEF9C3',
                padding: '6px 18px',
                borderRadius: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              {visualData?.formulaLabel ?? 'PARADOJA DEL ESTATUS'}
            </span>
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 34,
                fontWeight: 900,
                color: '#141413',
                lineHeight: 1.34,
                letterSpacing: '-0.02em',
                textAlign: 'center',
              }}
            >
              {visualData?.centralQuote ??
                '«Comprar cosas para impresionar a otros es la forma más rápida de quedarte sin dinero.»'}
            </div>

            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: '#374151',
                marginTop: 14,
                lineHeight: 1.45,
                textAlign: 'center',
              }}
            >
              {visualData?.formulaSublabel ??
                'La verdadera riqueza es invisible: consiste en los activos que no gastas y en la libertad que conservas.'}
            </div>
          </div>

          <div
            style={{
              alignSelf: 'center',
              backgroundColor: 'rgba(217, 78, 52, 0.12)',
              border: '1.5px solid #D94E34',
              borderRadius: 10,
              padding: '8px 22px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 15,
              fontWeight: 900,
              color: '#D94E34',
              letterSpacing: 0.5,
            }}
          >
            {visualData?.growthFormula ?? 'PARADOJA: COMPRAR ADMIRACIÓN DE EXTRAÑOS'}
          </div>
        </div>
      </div>
    </div>
  );
};
