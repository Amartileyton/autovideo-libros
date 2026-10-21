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
    triggerFrame: 115,
  },
  {
    num: '02',
    title: 'HAZLO ATRACTIVO',
    desc: 'Anticipa la dopamina agrupando hábitos',
    triggerFrame: 142,
  },
  {
    num: '03',
    title: 'HAZLO FÁCIL',
    desc: 'Regla de los 2 minutos: empieza en menos de 120s',
    highlightBadge: 'REGLA 2 MIN',
    triggerFrame: 178,
  },
  {
    num: '04',
    title: 'HAZLO SATISFACTORIO',
    desc: 'Recompensa inmediata para sellar el bucle neural',
    triggerFrame: 248,
  },
];

/**
 * Scene 4 — Las 4 Leyes del Cambio (Diseño Editorial Papel Cálido + Sincronización Exacta)
 * Timestamps reales de ElevenLabs (321 frames):
 * - 0..65: "Para reprogramar tu conducta, aplica las cuatro leyes..." -> Cabecera
 * - 115: "hazlo obvio" -> Ley 1
 * - 142: "hazlo atractivo" -> Ley 2
 * - 178: "hazlo fácil con la regla de dos minutos" -> Ley 3 + Badge
 * - 248: "hazlo satisfactorio de inmediato" -> Ley 4
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
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: '#D94E34',
              letterSpacing: 1.5,
            }}
          >
            04 / PLAN ACCIONABLE
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
            fontSize: 56,
            fontWeight: 800,
            color: '#141413',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Las 4 Leyes del Hábito
        </h1>
      </div>

      {/* 2. Cajón de las 4 Fichas Desplegadas en Cascada */}
      <div
        style={{
          position: 'absolute',
          top: 310,
          left: 96,
          right: 96,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {LAWS.map((law) => {
          const lawProgress = spring({
            frame: Math.max(0, localFrame - law.triggerFrame),
            fps,
            config: SPRING_SNAPPY,
          });
          const isTriggered = localFrame >= law.triggerFrame;

          return (
            <div
              key={law.num}
              style={{
                backgroundColor: '#FFFFFF',
                border: isTriggered ? '2px solid #D94E34' : '1.5px solid #E5E2DC',
                borderLeft: isTriggered ? '6px solid #D94E34' : '1.5px solid #E5E2DC',
                borderRadius: 14,
                padding: '20px 24px',
                boxShadow: isTriggered
                  ? '0 10px 24px rgba(217, 78, 52, 0.08)'
                  : '0 4px 12px rgba(45, 43, 40, 0.03)',
                opacity: lawProgress,
                transform: `translateX(${(1 - lawProgress) * 40}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 800,
                    color: isTriggered ? '#D94E34' : '#94A3B8',
                    minWidth: 36,
                  }}
                >
                  {law.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Newsreader', serif",
                      fontSize: 26,
                      fontWeight: 800,
                      color: isTriggered ? '#141413' : '#64748B',
                    }}
                  >
                    {law.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 15,
                      color: '#575550',
                      marginTop: 3,
                    }}
                  >
                    {law.desc}
                  </div>
                </div>
              </div>

              {law.highlightBadge && isTriggered && (
                <div
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#D94E34',
                    borderRadius: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: 0.5,
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
