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
import { ComparisonBattle } from '../components/kinetic';
import { findKeywordFrameWindow } from '../utils/wordTimingBinder';

export interface Scene4Props {
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

const DEFAULT_KEYSTONE_EXAMPLES = [
  {
    num: '01',
    title: 'EJERCICIO FÍSICO REGULAR',
    desc: 'Desencadena automáticamente mejor nutrición, menor impulsividad y mayor productividad.',
    highlightBadge: undefined as string | undefined,
    fallbackFrame: 170,
    triggerKeyword: ['victoria', 'ejercicio'],
  },
  {
    num: '02',
    title: 'SEGURIDAD LABORAL (ALCOA)',
    desc: "Paul O'Neill se enfocó en un solo hábito y quintuplicó los beneficios de la multinacional.",
    highlightBadge: 'BENEFICIOS x5',
    fallbackFrame: 230,
    triggerKeyword: ['seguridad', 'laboral'],
  },
  {
    num: '03',
    title: 'RUTINA MATINAL DE PHELPS',
    desc: 'Una única secuencia mental automatizada antes de cada carrera produjo 28 medallas olímpicas.',
    highlightBadge: undefined as string | undefined,
    fallbackFrame: 290,
    triggerKeyword: ['desata', 'transforma'],
  },
];

/**
 * Scene 4 — Las Leyes Accionables / Hábitos Angulares y Efecto Dominó (Motor Híbrido Inteligente)
 * Soporta los 3 presets del cuestionario interactivo:
 * - LAWS_DOMINO_CASCADE (Default): Cascada de 3 Casos en Tarjetas Amarillo Pálido + Reacción en Cadena (Efecto Dominó)
 * - LAWS_COMPARISON_BATTLE: Caso de fracaso vs Caso de éxito verificado + Lista de Leyes
 * - LAWS_PILLAR_MATRIX: Matriz de 4 Pilares Prácticos con Checkmarks Verdes
 */
export const Scene4: React.FC<Scene4Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 1980,
  enterFrame = 1231,
  visualData,
  layoutPreset = 'LAWS_DOMINO_CASCADE',
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // Auto-binding semántico de los casos reales y del efecto dominó
  const boundExamples = useMemo(() => {
    const baseList =
      visualData?.actionableLaws && visualData.actionableLaws.length >= 3
        ? visualData.actionableLaws.slice(0, 3).map((law, idx) => ({
            num: law.index.replace(/[^0-9]/g, '') || `0${idx + 1}`,
            title: law.title,
            desc: law.rule,
            highlightBadge: law.highlight ? 'BENEFICIOS x5' : undefined,
            fallbackFrame: 170 + idx * 60,
            triggerKeyword:
              law.triggerKeyword ??
              DEFAULT_KEYSTONE_EXAMPLES[idx]?.triggerKeyword,
          }))
        : DEFAULT_KEYSTONE_EXAMPLES;

    return baseList.map((item) => {
      const win = findKeywordFrameWindow(
        wordTimestamps,
        item.triggerKeyword,
        item.fallbackFrame
      );
      return {
        ...item,
        triggerFrame: win.startFrame,
      };
    });
  }, [visualData?.actionableLaws, wordTimestamps]);

  const dominoWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        visualData?.dominoTriggerKeyword ?? ['domino', 'efecto'],
        310,
        400
      ),
    [wordTimestamps, visualData?.dominoTriggerKeyword]
  );

  // 1. Tarjeta Definición Hábito Angular (frame 20)
  const heroCardEntrance = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Progreso del Efecto Dominó sincronizado a la voz
  const dominoProgress = spring({
    frame: Math.max(0, localFrame - dominoWindow.startFrame),
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.9 },
    durationInFrames: 50,
  });

  const dominoSteps = visualData?.dominoSteps ?? [
    { label: 'Hábito Angular', sub: 'Paso 1' },
    { label: 'Mayor Claridad', sub: 'Paso 2' },
    { label: 'Nuevos Hábitos', sub: 'Paso 3' },
    { label: 'Transformación', sub: 'Meta' },
  ];

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
      {/* 1. Tarjeta Hero: El Concepto de Hábito Angular (Sin título de diapositiva ni cabecera) */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 96,
          right: 96,
          backgroundColor: '#FEF9C3',
          border: '2px solid #141413',
          borderLeft: '6px solid #D94E34',
          borderRadius: 16,
          padding: '20px 24px',
          boxShadow: '0 8px 24px rgba(20, 20, 19, 0.05)',
          opacity: heroCardEntrance,
          transform: `translateY(${(1 - heroCardEntrance) * 15}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: '#141413',
            lineHeight: 1.3,
            textAlign: 'center',
          }}
        >
          Una sola pequeña victoria desata una cascada de cambios automáticos
        </div>
      </div>

      {/* 2. Bloque Central según layoutPreset */}
      {layoutPreset === 'LAWS_COMPARISON_BATTLE' ? (
        <div
          style={{
            position: 'absolute',
            top: 290,
            left: 96,
            right: 96,
          }}
        >
          <ComparisonBattle
            titleA="Intentar Cambiar Todo a la Vez"
            subtitleA="Dispersión de energía y abandono en la primera semana"
            tagA="ENFOQUE FALLIDO"
            titleB="Atacar 1 Hábito Angular"
            subtitleB="Caso Alcoa: 1 sola regla de seguridad quintuplicó beneficios"
            tagB="EFECTO DOMINÓ"
            metricB={{ value: 5, suffix: 'x ÉXITO' }}
            enterFrameA={130}
            enterFrameB={180}
            battleFrame={230}
            accentColor="#D94E34"
          />
        </div>
      ) : layoutPreset === 'LAWS_PILLAR_MATRIX' ? (
        <div
          style={{
            position: 'absolute',
            top: 285,
            left: 96,
            right: 96,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          {[
            {
              title: 'Aislar la Señal',
              desc: 'Detecta hora, lugar y emoción disparadora.',
            },
            {
              title: 'Definir el Anhelo',
              desc: 'Identifica qué recompensa real busca tu cerebro.',
            },
            {
              title: 'Sustituir Rutina',
              desc: 'Ejecuta una nueva acción ante la misma señal.',
            },
            {
              title: 'Hábito Angular',
              desc: 'Prioriza la victoria que arrastra a las demás.',
            },
          ].map((pillar, idx) => {
            const pSpring = spring({
              frame: Math.max(0, localFrame - (140 + idx * 40)),
              fps,
              config: SPRING_SNAPPY,
            });
            return (
              <div
                key={pillar.title}
                style={{
                  backgroundColor: '#FEF9C3',
                  border: '2px solid #141413',
                  borderRadius: 16,
                  padding: '20px 20px',
                  opacity: pSpring,
                  transform: `scale(${interpolate(pSpring, [0, 1], [0.92, 1], CLAMP_EXTRAPOLATION)})`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      color: '#141413',
                    }}
                  >
                    {pillar.title}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: '#575550',
                    lineHeight: 1.4,
                  }}
                >
                  {pillar.desc}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 275,
            left: 96,
            right: 96,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {boundExamples.map((item) => {
            const itemSpring = spring({
              frame: Math.max(0, localFrame - item.triggerFrame),
              fps,
              config: SPRING_SNAPPY,
            });

            return (
              <div
                key={item.num}
                style={{
                  backgroundColor: '#FEF9C3',
                  border: '2px solid #141413',
                  borderRadius: 16,
                  padding: '16px 22px',
                  boxShadow: '0 6px 18px rgba(20, 20, 19, 0.05)',
                  opacity: itemSpring,
                  transform: `translateX(${(1 - itemSpring) * -25}px)`,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#FFFFFF',
                        backgroundColor: '#D94E34',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {item.num}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 19,
                        fontWeight: 800,
                        color: '#141413',
                      }}
                    >
                      {item.title}
                    </span>
                  </div>

                  {item.highlightBadge && (
                    <span
                      style={{
                        backgroundColor: '#141413',
                        color: '#FEF9C3',
                        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 20,
                      }}
                    >
                      {item.highlightBadge}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: '#575550',
                    lineHeight: 1.45,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Visualización del Efecto Dominó en Cadena (Sin barra de título redundante) */}
      <div
        style={{
          position: 'absolute',
          top: 760,
          left: 96,
          right: 96,
          backgroundColor: '#FEF9C3',
          border: '2px solid #D94E34',
          borderRadius: 20,
          padding: '22px 28px',
          boxShadow: '0 12px 32px rgba(217, 78, 52, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {dominoSteps.map((domino, idx) => {
            const tilt = interpolate(
              dominoProgress,
              [idx * 0.2, (idx + 1) * 0.25],
              [0, 10],
              CLAMP_EXTRAPOLATION
            );

            return (
              <div
                key={domino.label}
                style={{
                  flex: 1,
                  backgroundColor: idx === 0 ? '#D94E34' : '#F8F7F4',
                  color: idx === 0 ? '#FFFFFF' : '#141413',
                  border: idx === 0 ? 'none' : '1.5px solid #E5E2DC',
                  borderRadius: 12,
                  padding: '16px 8px',
                  textAlign: 'center',
                  transform: `rotate(${tilt}deg) translateY(${tilt > 0 ? 4 : 0}px)`,
                  transformOrigin: 'bottom center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 800,
                    opacity: 0.8,
                    marginBottom: 4,
                  }}
                >
                  {domino.sub}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  {domino.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
