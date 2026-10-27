import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';
import { LiveCounter } from './LiveCounter';

export interface ComparisonBattleProps {
  titleA: string;
  subtitleA: string;
  metricA?: { value: number; suffix?: string; prefix?: string; decimals?: number };
  tagA?: string;

  titleB: string;
  subtitleB: string;
  metricB?: { value: number; suffix?: string; prefix?: string; decimals?: number };
  tagB?: string;

  /** Fotograma local en el que entra la tarjeta A */
  enterFrameA?: number;
  /** Fotograma local en el que entra la tarjeta B */
  enterFrameB?: number;
  /** Fotograma local en el que se produce la 'batalla' (A pierde, B gana) */
  battleFrame?: number;

  accentColor?: string;
  /** Fotograma local opcional para evitar desfases cuando la escena se renderiza con offset global */
  currentFrame?: number;
}

/**
 * ComparisonBattle — Tarjeta Dinámica de Confrontación A vs B (Estilo @eldatomanda)
 * Compara dos estados o conceptos. Al llegar a `battleFrame`, la opción A se atenúa y se tacha
 * de manera dinámica sincronizada con el audio, y la opción B se expande elásticamente.
 */
export const ComparisonBattle: React.FC<ComparisonBattleProps> = ({
  titleA,
  subtitleA,
  metricA,
  tagA = 'FORMA TRADICIONAL',
  titleB,
  subtitleB,
  metricB,
  tagB = 'MÉTODO DE IMPACTO',
  enterFrameA = 0,
  enterFrameB = 30,
  battleFrame = 90,
  accentColor = '#D94E34',
  currentFrame,
}) => {
  const videoFrame = useCurrentFrame();
  const frame = currentFrame ?? videoFrame;
  const { fps } = useVideoConfig();

  // Entradas escalonadas con spring
  const springA = spring({
    frame: Math.max(0, frame - enterFrameA),
    fps,
    config: SPRING_SNAPPY,
  });

  const springB = spring({
    frame: Math.max(0, frame - enterFrameB),
    fps,
    config: SPRING_SNAPPY,
  });

  // Estado de la batalla (resolución activa vinculada a la voz)
  const isBattled = frame >= battleFrame;
  const battleSpring = spring({
    frame: Math.max(0, frame - battleFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  // Progreso del trazo dinámico de tachado rojo
  const strikeProgress = interpolate(
    frame,
    [battleFrame, battleFrame + 14],
    [0, 1],
    CLAMP_EXTRAPOLATION
  );

  // Animación de la barra de progreso de B
  const progressB = spring({
    frame: Math.max(0, frame - battleFrame - 10),
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.8 },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        width: '100%',
        perspective: 1200,
      }}
    >
      {/* 1. Opción A (Perdedora / Error común) */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#FFFBEB',
          border: isBattled
            ? '2px solid #CBD5E1'
            : '2px solid #141413',
          borderRadius: 20,
          padding: '24px 28px',
          boxShadow: isBattled
            ? '0 4px 12px rgba(0, 0, 0, 0.02)'
            : '0 10px 30px rgba(20, 20, 19, 0.06)',
          opacity: interpolate(
            battleSpring,
            [0, 1],
            [springA, 0.52],
            CLAMP_EXTRAPOLATION
          ),
          transform: `scale(${interpolate(
            battleSpring,
            [0, 1],
            [springA, 0.97],
            CLAMP_EXTRAPOLATION
          )}) translateY(${(1 - springA) * 30}px)`,
          transformOrigin: 'center center',
          overflow: 'hidden',
        }}
      >
        {/* Trazo rojo dinámico de tachado activo (se dibuja en vivo al descartar) */}
        {strikeProgress > 0 && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <line
              x1="24"
              y1="56%"
              x2={`${24 + strikeProgress * 88}%`}
              y2="54%"
              stroke="#DC2626"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="58%"
              x2={`${28 + strikeProgress * 84}%`}
              y2="57%"
              stroke="rgba(220, 38, 38, 0.45)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>
        )}

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
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 800,
              color: isBattled ? '#94A3B8' : '#DC2626',
              letterSpacing: 0.5,
            }}
          >
            {tagA}
          </span>
          {isBattled && (
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 900,
                color: '#DC2626',
                backgroundColor: 'rgba(220, 38, 38, 0.12)',
                border: '1.5px solid #DC2626',
                padding: '4px 10px',
                borderRadius: 6,
                transform: `scale(${battleSpring}) rotate(-2deg)`,
                transformOrigin: 'right center',
              }}
            >
              DESCARTADO ✗
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 34,
                fontWeight: 800,
                color: isBattled ? '#64748B' : '#141413',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {titleA}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 18,
                color: '#64748B',
                marginTop: 6,
                lineHeight: 1.35,
              }}
            >
              {subtitleA}
            </div>
          </div>

          {metricA && (
            <div style={{ textAlign: 'right' }}>
              <LiveCounter
                from={0}
                to={metricA.value}
                startFrame={enterFrameA}
                decimals={metricA.decimals ?? 0}
                prefix={metricA.prefix ?? ''}
                suffix={metricA.suffix ?? ''}
                fontSize={34}
                color={isBattled ? '#94A3B8' : '#141413'}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Opción B (Ganadora / Solución de Alto Rendimiento en Amarillo Pálido) */}
      <div
        style={{
          backgroundColor: '#FEF9C3',
          border: isBattled
            ? `2.5px solid ${accentColor}`
            : '2px solid #141413',
          borderRadius: 22,
          padding: '28px 32px',
          boxShadow: isBattled
            ? `0 20px 45px rgba(217, 78, 52, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)`
            : '0 10px 30px rgba(20, 20, 19, 0.06)',
          opacity: springB,
          transform: `scale(${interpolate(
            battleSpring,
            [0, 1],
            [springB, 1.03],
            CLAMP_EXTRAPOLATION
          )}) translateY(${(1 - springB) * 35}px)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 800,
              color: accentColor,
              letterSpacing: 0.5,
            }}
          >
            {tagB}
          </span>
          {isBattled && (
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 900,
                color: '#FFFFFF',
                backgroundColor: accentColor,
                padding: '4px 12px',
                borderRadius: 6,
                boxShadow: '0 4px 14px rgba(217, 78, 52, 0.35)',
              }}
            >
              EFECTO VERIFICADO ✓
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 40,
                fontWeight: 900,
                color: '#141413',
                letterSpacing: '-0.03em',
                lineHeight: 1.18,
              }}
            >
              {titleB}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 19,
                color: '#575550',
                marginTop: 6,
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {subtitleB}
            </div>
          </div>

          {metricB && (
            <div style={{ textAlign: 'right', paddingLeft: 12 }}>
              <LiveCounter
                from={1}
                to={metricB.value}
                startFrame={battleFrame + 5}
                decimals={metricB.decimals ?? 0}
                prefix={metricB.prefix ?? ''}
                suffix={metricB.suffix ?? ''}
                fontSize={54}
                color={accentColor}
              />
            </div>
          )}
        </div>

        {/* Barra de progreso / aceleración reactiva */}
        <div
          style={{
            marginTop: 20,
            width: '100%',
            height: 10,
            backgroundColor: 'rgba(217, 78, 52, 0.12)',
            borderRadius: 5,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${interpolate(progressB, [0, 1], [15, 100], CLAMP_EXTRAPOLATION)}%`,
              height: '100%',
              backgroundColor: accentColor,
              borderRadius: 5,
            }}
          />
        </div>
      </div>
    </div>
  );
};
