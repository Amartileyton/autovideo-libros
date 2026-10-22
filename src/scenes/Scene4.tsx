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

const LAWS = [
  {
    num: '01',
    title: 'HAZLO OBVIO',
    desc: 'Pon la señal ambiental a la vista sin fricción',
    tag: 'SEÑAL VISUAL',
    triggerFrame: 115,
  },
  {
    num: '02',
    title: 'HAZLO ATRACTIVO',
    desc: 'Agrupa un hábito necesario con uno placentero',
    tag: 'DOPAMINA',
    triggerFrame: 142,
  },
  {
    num: '03',
    title: 'HAZLO FÁCIL',
    desc: 'Regla de los 2 minutos: empieza en menos de 120s',
    highlightBadge: 'REGLA 2 MIN',
    tag: 'CERO FRICCIÓN',
    triggerFrame: 178,
  },
  {
    num: '04',
    title: 'HAZLO SATISFACTORIO',
    desc: 'Recompensa inmediata para sellar el bucle neural',
    tag: 'REFUERZO',
    triggerFrame: 248,
  },
];

/**
 * Scene 4 — Las 4 Leyes del Cambio (Kinetic UI + @eldatomanda Style)
 * Timestamps reales de ElevenLabs (321 frames):
 * - 0..65: "Para reprogramar tu conducta, aplica las cuatro leyes..." -> Cabecera
 * - 115: "hazlo obvio" -> Ley 01
 * - 142: "hazlo atractivo" -> Ley 02
 * - 178: "hazlo fácil con la regla de dos minutos" -> Ley 03 + Badge elástico
 * - 248: "hazlo satisfactorio de inmediato" -> Ley 04
 */
export const Scene4: React.FC<Scene4Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 1980,
  enterFrame = 1091,
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
            04 / PLAN ACCIONABLE
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
          Las 4 Leyes del Hábito
        </h1>
      </div>

      {/* 2. Cajón de las 4 Fichas Cinéticas en Cascada */}
      <div
        style={{
          position: 'absolute',
          top: 310,
          left: 96,
          right: 96,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {LAWS.map((law, index) => {
          const isTriggered = localFrame >= law.triggerFrame;
          const lawProgress = spring({
            frame: Math.max(0, localFrame - law.triggerFrame),
            fps,
            config: SPRING_SNAPPY,
          });

          const badgeProgress = law.highlightBadge
            ? spring({
                frame: Math.max(0, localFrame - law.triggerFrame - 6),
                fps,
                config: SPRING_SNAPPY,
              })
            : 0;

          return (
            <div
              key={law.num}
              style={{
                position: 'relative',
                backgroundColor: '#FFFFFF',
                border: isTriggered
                  ? '2px solid #D94E34'
                  : '1.5px solid rgba(45, 43, 40, 0.12)',
                borderLeft: isTriggered
                  ? '8px solid #D94E34'
                  : '1.5px solid rgba(45, 43, 40, 0.12)',
                borderRadius: 18,
                padding: '24px 28px',
                boxShadow: isTriggered
                  ? '0 16px 40px rgba(217, 78, 52, 0.10), 0 2px 6px rgba(0, 0, 0, 0.03)'
                  : '0 6px 18px rgba(45, 43, 40, 0.04)',
                opacity: lawProgress,
                transform: `translateX(${(1 - lawProgress) * 50}px) scale(${isTriggered ? 1.02 : 0.98})`,
                transformOrigin: 'left center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 26,
                    fontWeight: 900,
                    color: isTriggered ? '#D94E34' : '#94A3B8',
                    minWidth: 44,
                  }}
                >
                  {law.num}
                </div>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                        fontSize: 27,
                        fontWeight: 900,
                        color: isTriggered ? '#141413' : '#64748B',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {law.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        fontWeight: 700,
                        color: isTriggered ? '#D94E34' : '#94A3B8',
                        backgroundColor: isTriggered
                          ? 'rgba(217, 78, 52, 0.10)'
                          : '#F1F5F9',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {law.tag}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 15,
                      color: '#575550',
                      lineHeight: 1.3,
                    }}
                  >
                    {law.desc}
                  </div>
                </div>
              </div>

              {law.highlightBadge && (
                <div
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#D94E34',
                    borderRadius: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: 0.5,
                    boxShadow: '0 4px 14px rgba(217, 78, 52, 0.35)',
                    opacity: badgeProgress,
                    transform: `scale(${badgeProgress})`,
                    transformOrigin: 'right center',
                  }}
                >
                  {law.highlightBadge}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
