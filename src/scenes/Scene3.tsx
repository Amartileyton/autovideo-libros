import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

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

const LOOP_STEPS = [
  { num: '01', title: 'SEÑAL', desc: 'Disparador ambiental visual', triggerFrame: 100 },
  { num: '02', title: 'ANHELO', desc: 'Anticipación de dopamina', triggerFrame: 125 },
  { num: '03', title: 'RESPUESTA', desc: 'La acción física o mental', triggerFrame: 150 },
  { num: '04', title: 'RECOMPENSA', desc: 'Satisfacción y cierre neural', triggerFrame: 172 },
];

/**
 * Scene 3 — El Bucle del Hábito (Diseño Editorial Papel Cálido + Sincronización Exacta)
 * Timestamps reales de ElevenLabs (376 frames):
 * - 0..35: "Todo hábito opera en un bucle neuronal..." -> Entrada de cabecera
 * - 100..200: 4 Fases escalonadas exactas: Señal (100), Anhelo (125), Respuesta (150), Recompensa (172)
 * - 260..360: "No te elevas al nivel de tus metas..." -> Cita icónica con subrayador terracota
 */
export const Scene3: React.FC<Scene3Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 1980,
  enterFrame = 725,
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

  // 2. Cita central subrayada (frame 255 - "No te elevas al nivel de tus metas...")
  const quoteEntrance = spring({
    frame: Math.max(0, localFrame - 255),
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
            03 / NEUROCIENCIA CONDUCTUAL
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
          El Bucle de 4 Fases
        </h1>
      </div>

      {/* 2. Las 4 Fases del Bucle en Cascada */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 96,
          right: 96,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        {LOOP_STEPS.map((step) => {
          const stepProgress = spring({
            frame: Math.max(0, localFrame - step.triggerFrame),
            fps,
            config: SPRING_SNAPPY,
          });
          const isTriggered = localFrame >= step.triggerFrame;

          return (
            <div
              key={step.num}
              style={{
                backgroundColor: '#FFFFFF',
                border: isTriggered ? '2px solid #D94E34' : '1.5px solid #E5E2DC',
                borderRadius: 16,
                padding: '24px 20px',
                boxShadow: isTriggered
                  ? '0 8px 24px rgba(217, 78, 52, 0.10)'
                  : '0 4px 12px rgba(45, 43, 40, 0.03)',
                opacity: stepProgress,
                transform: `scale(${interpolate(stepProgress, [0, 1], [0.90, 1], CLAMP_EXTRAPOLATION)})`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 800,
                    color: isTriggered ? '#D94E34' : '#94A3B8',
                  }}
                >
                  FASE {step.num}
                </span>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: isTriggered ? '#D94E34' : '#E5E2DC',
                  }}
                />
              </div>

              <div
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: isTriggered ? '#141413' : '#64748B',
                }}
              >
                {step.title}
              </div>

              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: '#575550',
                  marginTop: 6,
                  lineHeight: 1.3,
                }}
              >
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Tarjeta Cita Célebre Subrayada (frame 255) */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          left: 96,
          right: 96,
          backgroundColor: '#FFFFFF',
          border: '2px solid #141413',
          borderLeft: '8px solid #D94E34',
          borderRadius: 18,
          padding: '36px 32px',
          boxShadow: '0 16px 40px rgba(45, 43, 40, 0.08)',
          opacity: quoteEntrance,
          transform: `translateY(${(1 - quoteEntrance) * 25}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 800,
            color: '#D94E34',
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          PASAJES SUBRAYADOS · CAPÍTULO 1
        </div>

        <blockquote
          style={{
            margin: 0,
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 34,
            fontWeight: 700,
            fontStyle: 'italic',
            lineHeight: 1.35,
            color: '#141413',
          }}
        >
          «No te elevas al nivel de tus{' '}
          <span
            style={{
              backgroundColor: 'rgba(217, 78, 52, 0.18)',
              padding: '2px 6px',
              borderRadius: 4,
              color: '#D94E34',
              fontStyle: 'normal',
            }}
          >
            metas
          </span>
          , caes al nivel de tus{' '}
          <span
            style={{
              backgroundColor: 'rgba(217, 78, 52, 0.18)',
              padding: '2px 6px',
              borderRadius: 4,
              color: '#D94E34',
              fontStyle: 'normal',
            }}
          >
            sistemas
          </span>
          .»
        </blockquote>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 32, height: 2, backgroundColor: '#D94E34' }} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: '#141413',
            }}
          >
            James Clear
          </span>
          <span style={{ color: '#E5E2DC' }}>·</span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#575550',
            }}
          >
            La frase más compartida del libro
          </span>
        </div>
      </div>
    </div>
  );
};
