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
    desc: 'Pon la señal visual a la vista',
    color: '#38BDF8',
    frameTrigger: 110,
  },
  {
    num: '02',
    title: 'HAZLO ATRACTIVO',
    desc: 'Dispara la anticipación de dopamina',
    color: '#F59E0B',
    frameTrigger: 170,
  },
  {
    num: '03',
    title: 'HAZLO FÁCIL',
    desc: 'Regla de 2 minutos: empieza en < 120s',
    color: '#10B981',
    frameTrigger: 210,
  },
  {
    num: '04',
    title: 'HAZLO SATISFACTORIO',
    desc: 'Recompensa inmediata para cerrar el bucle',
    color: '#EC4899',
    frameTrigger: 280,
  },
];

/**
 * Scene 4 — Punto 3: Las 4 Leyes del Cambio de Conducta
 * - 4 tarjetas limpias que se despliegan en cascada al ritmo de la locución.
 */
export const Scene4: React.FC<Scene4Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 1980,
  enterFrame = 1133,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // Cabecera
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
      {/* CABECERA */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 96,
          right: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          opacity: headerEntrance,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '6px 20px',
            borderRadius: 30,
            backgroundColor: 'rgba(245, 158, 11, 0.18)',
            border: '1.5px solid #F59E0B',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 22,
            fontWeight: 800,
            color: '#FBBF24',
            letterSpacing: '0.1em',
          }}
        >
          PUNTO 03 · PROTOCOLO PRÁCTICO
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          LAS 4 LEYES DEL HÁBITO
        </div>
      </div>

      {/* 4 TARJETAS DE LAS LEYES */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        {LAWS.map((law, idx) => {
          const entrance = spring({
            frame: Math.max(0, localFrame - law.frameTrigger),
            fps,
            config: SPRING_SNAPPY,
          });

          const isActive =
            localFrame >= law.frameTrigger &&
            (idx === LAWS.length - 1 || localFrame < LAWS[idx + 1].frameTrigger);

          return (
            <div
              key={law.num}
              style={{
                padding: '24px 30px',
                borderRadius: 20,
                backgroundColor: isActive
                  ? 'rgba(24, 24, 28, 0.96)'
                  : 'rgba(18, 18, 22, 0.85)',
                border: `2px solid ${isActive ? law.color : 'rgba(255, 255, 255, 0.12)'}`,
                boxShadow: isActive
                  ? `0 18px 45px rgba(0, 0, 0, 0.75), 0 0 30px ${law.color}33`
                  : '0 10px 30px rgba(0, 0, 0, 0.5)',
                opacity: entrance,
                transform: `translateX(${interpolate(entrance, [0, 1], [-40, 0], CLAMP_EXTRAPOLATION)}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    backgroundColor: isActive ? law.color : '#27272A',
                    color: isActive ? '#0A0A0B' : '#FFFFFF',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  {law.num}
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 30,
                      fontWeight: 900,
                      color: isActive ? '#FFFFFF' : '#A1A1AA',
                    }}
                  >
                    {law.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 22,
                      fontWeight: 600,
                      color: isActive ? law.color : '#71717A',
                      marginTop: 4,
                    }}
                  >
                    {law.desc}
                  </div>
                </div>
              </div>

              {isActive && (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: law.color,
                    boxShadow: `0 0 16px ${law.color}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
