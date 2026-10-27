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
 *
 * Distribución vertical balanceada que ocupa toda la pantalla (80px a 1520px):
 * 1. Cita Central Subrayada: top 80px a 290px
 * 2. ComparisonBattle (Tachado en vivo): top 320px a 880px
 * 3. Tarjeta de Fórmula Maestra de Housel: top 930px a 1520px (gran presencia vertical)
 */
export const Scene3: React.FC<Scene3Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 1980,
  enterFrame = 749,
  visualData,
  layoutPreset = 'RULE_SUBSTITUTION_DIAGRAM',
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

  const mythWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['compararte', 'exito', 'ajeno'],
        50,
        95
      ),
    [wordTimestamps]
  );

  const strikeWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['envidia', 'frustracion'],
        125,
        155
      ),
    [wordTimestamps]
  );

  const realityWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['mide', 'progreso', 'exclusivamente'],
        180,
        220
      ),
    [wordTimestamps]
  );

  const formulaWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['eras', 'ayer', 'comparandote'],
        235,
        280
      ),
    [wordTimestamps]
  );

  // 1. Cita de Oro (frame 20)
  const quoteEntrance = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Entrada de la tarjeta resumen inferior sincronizada (frame ~210)
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
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Tarjeta Cita de Gran Formato y Alta Legibilidad (top: 80px a 290px, left: 54, right: 54) */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 54,
          right: 54,
          opacity: quoteEntrance,
          transform: `scale(${interpolate(quoteEntrance, [0, 1], [0.95, 1], CLAMP_EXTRAPOLATION)})`,
        }}
      >
        <KineticCard
          enterFrame={0}
          accentBorderColor="#141413"
          badgeColor="#D94E34"
          padding="32px 40px"
        >
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: '#141413',
              lineHeight: 1.36,
              textAlign: 'center',
            }}
          >
            {visualData?.centralQuote ? (
              visualData.centralQuote.includes('con quien eras ayer') ? (
                <>
                  «Compárate con{' '}
                  <span
                    style={{
                      backgroundColor: 'rgba(217, 78, 52, 0.16)',
                      borderBottom: '4px solid #D94E34',
                      padding: '2px 10px',
                      borderRadius: 6,
                      fontWeight: 900,
                      color: '#D94E34',
                    }}
                  >
                    quien eras ayer
                  </span>
                  , no con quien es otra persona hoy.»
                </>
              ) : (
                `«${visualData.centralQuote}»`
              )
            ) : (
              '«Compárate con quien eras ayer, no con quien es otra persona hoy.»'
            )}
          </div>
        </KineticCard>
      </div>

      {/* 2. Bloque Central: ComparisonBattle sincronizada palabra por palabra (Tachado activo en envidia/frustración) */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 54,
          right: 54,
        }}
      >
        {layoutPreset === 'RULE_SUBSTITUTION_DIAGRAM' ? (
          <ComparisonBattle
            titleA={visualData?.mythLabel ?? 'Compararte con el Éxito Ajeno'}
            subtitleA={
              visualData?.mythSubtitle ??
              'Envidia y sensación de fracaso al medirte contra las vidas ajenas'
            }
            tagA={visualData?.mythTag ?? 'VENENO MENTAL'}
            titleB={visualData?.realityLabel ?? 'Compararte con Quien Eras Ayer'}
            subtitleB={
              visualData?.realitySubtitle ??
              'El único baremo constructivo: medir tu avance relativo y personal'
            }
            tagB={visualData?.realityTag ?? 'PROGRESO REAL (100%)'}
            metricB={{ value: 100, suffix: '% INTERNO' }}
            enterFrameA={mythWindow.startFrame}
            enterFrameB={realityWindow.startFrame}
            battleFrame={strikeWindow.startFrame}
            currentFrame={localFrame}
            accentColor="#D94E34"
          />
        ) : layoutPreset === 'RULE_EXPONENTIAL_EVIDENCE' ? (
          <ExponentialGrowthChart
            startFrame={enterFrame + 40}
            width={972}
            height={520}
            accentColor="#D94E34"
            showTitle={false}
          />
        ) : (
          <VectorLoopCircuit
            nodes={boundNodes}
            currentFrame={localFrame}
            accentColor="#D94E34"
            width={972}
            height={520}
            showTitle={false}
          />
        )}
      </div>

      {/* 3. Tarjeta Inferior de Fórmula con Gran Legibilidad y Presencia Vertical (top: 920 a 1520) */}
      <div
        style={{
          position: 'absolute',
          top: 920,
          left: 54,
          right: 54,
          height: 560,
          opacity: summaryEntrance,
          transform: `translateY(${(1 - summaryEntrance) * 20}px)`,
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
                fontSize: 16,
                fontWeight: 900,
                padding: '6px 18px',
                borderRadius: 8,
                letterSpacing: 0.5,
              }}
            >
              EL BAREMO DE PROGRESO
            </span>

            <span
              style={{
                backgroundColor: '#141413',
                color: '#FEF9C3',
                padding: '6px 20px',
                borderRadius: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              CONTROL INTERNO
            </span>
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 36,
                fontWeight: 900,
                color: '#141413',
                lineHeight: 1.22,
                letterSpacing: '-0.025em',
              }}
            >
              {visualData?.formulaLabel ??
                'Tu único rival = Quien eras tú ayer'}
            </div>

            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 23,
                fontWeight: 600,
                color: '#374151',
                marginTop: 14,
                lineHeight: 1.45,
              }}
            >
              {visualData?.formulaSublabel ??
                'Medir tu avance respecto a tu propio pasado elimina la ansiedad de estatus y te da tracción real.'}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#F8F7F4',
              border: '2px dashed rgba(217, 78, 52, 0.45)',
              borderRadius: 16,
              padding: '18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: '#141413',
              }}
            >
              • <strong style={{ color: '#D94E34' }}>Comparación Externa:</strong> Medirte con el éxito ajeno genera envidia y sensación destructiva de fracaso.
            </div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: '#141413',
              }}
            >
              • <strong style={{ color: '#16A34A' }}>Superación Interna:</strong> Mejorar un pequeño porcentaje respecto a quien eras ayer construye autoestima sólida.
            </div>
          </div>

          <div
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'rgba(217, 78, 52, 0.12)',
              border: '1.5px solid #D94E34',
              borderRadius: 10,
              padding: '8px 20px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 15,
              fontWeight: 900,
              color: '#D94E34',
              letterSpacing: 0.5,
            }}
          >
            REGLA DE VIDA: PROGRESO RELATIVO &gt; COMPARACIÓN SOCIAL
          </div>
        </div>
      </div>
    </div>
  );
};
