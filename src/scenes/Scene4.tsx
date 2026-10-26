import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

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
}

const KEYSTONE_EXAMPLES = [
  {
    num: '01',
    title: 'EJERCICIO FÍSICO REGULAR',
    desc: 'Desencadena automáticamente mejor nutrición, menor impulsividad y mayor productividad.',
    tag: 'EFECTO BIOLÓGICO',
    triggerFrame: 170,
  },
  {
    num: '02',
    title: 'SEGURIDAD LABORAL (ALCOA)',
    desc: 'Paul O\'Neill se enfocó en un solo hábito y quintuplicó los beneficios de la multinacional.',
    tag: 'CASO REAL DE ÉXITO',
    highlightBadge: 'BENEFICIOS x5',
    triggerFrame: 230,
  },
  {
    num: '03',
    title: 'RUTINA MATINAL DE PHELPS',
    desc: 'Una única secuencia mental automatizada antes de cada carrera produjo 28 medallas olímpicas.',
    tag: 'ALTO RENDIMIENTO',
    triggerFrame: 290,
  },
];

/**
 * Scene 4 — Los Hábitos Angulares y el Efecto Dominó (Kinetic UI + Charles Duhigg Research)
 * Timestamps reales de ElevenLabs (434 frames):
 * - 0..70: "No todas las conductas pesan lo mismo."
 * - 80..180: "Duhigg demuestra que existen hábitos angulares:" -> Tarjeta Hero de Definición
 * - 190..315: "una sola pequeña victoria, como el ejercicio diario o la seguridad laboral," -> Entradas de casos
 * - 320..425: "desata un efecto dominó que transforma todas tus demás rutinas." -> Animación del Efecto Dominó
 */
export const Scene4: React.FC<Scene4Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 1980,
  enterFrame = 1231,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Tarjeta Definición Hábito Angular (frame 20)
  const heroCardEntrance = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Progreso del Efecto Dominó (frame 310..410)
  const dominoProgress = spring({
    frame: Math.max(0, localFrame - 310),
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.9 },
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

      {/* 2. Casos Reales del Libro (Lista Escalonada en Amarillo Pálido) */}
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
        {KEYSTONE_EXAMPLES.map((item) => {
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
        {/* 4 Fichas de Dominó Inclinándose */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {[
            { label: 'Hábito Angular', sub: 'Paso 1' },
            { label: 'Mayor Claridad', sub: 'Paso 2' },
            { label: 'Nuevos Hábitos', sub: 'Paso 3' },
            { label: 'Transformación', sub: 'Meta' },
          ].map((domino, idx) => {
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
