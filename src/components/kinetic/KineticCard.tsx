import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';

export interface KineticCardProps {
  children: React.ReactNode;
  /** Fotograma local en el que entra la tarjeta */
  enterFrame?: number;
  /** Desplazamiento inicial Y (en píxeles, por defecto 40) */
  enterY?: number;
  /** Inclinación en 2.5D (en grados) */
  tiltDeg?: number;
  /** Color de acento de la tarjeta o del borde */
  accentBorderColor?: string;
  /** Color de fondo de la tarjeta (por defecto amarillo pálido #FEF9C3) */
  backgroundColor?: string;
  /** Título limpio integrado en la cabecera de la tarjeta */
  title?: string;
  /** Badge o título superior opcional */
  badgeText?: string;
  badgeColor?: string;
  width?: number | string;
  padding?: number | string;
  style?: React.CSSProperties;
}

/**
 * KineticCard — Tarjeta Cinética Multicapa 2.5D en Amarillo Pálido (#FEF9C3)
 * Entrada elástica con inercia, título limpio integrado y sombras suaves multicapa.
 */
export const KineticCard: React.FC<KineticCardProps> = ({
  children,
  enterFrame = 0,
  enterY = 40,
  tiltDeg = 0,
  accentBorderColor = '#141413',
  backgroundColor = '#FEF9C3',
  title,
  badgeText,
  badgeColor = '#D94E34',
  width = '100%',
  padding = '28px 32px',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // Entrada con spring ultra-suave
  const entranceSpring = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  const translateY = interpolate(
    entranceSpring,
    [0, 1],
    [enterY, 0],
    CLAMP_EXTRAPOLATION
  );

  const scale = interpolate(
    entranceSpring,
    [0, 1],
    [0.92, 1],
    CLAMP_EXTRAPOLATION
  );

  const headerTitle = title || badgeText;

  return (
    <div
      style={{
        position: 'relative',
        width,
        backgroundColor,
        border: accentBorderColor
          ? `2px solid ${accentBorderColor}`
          : '2px solid #141413',
        borderRadius: 20,
        padding,
        boxShadow:
          '0 20px 50px rgba(20, 20, 19, 0.08), 0 4px 12px rgba(20, 20, 19, 0.04)',
        boxSizing: 'border-box',
        opacity: entranceSpring,
        transform: `translateY(${translateY}px) scale(${scale}) perspective(1000px) rotateX(${tiltDeg}deg)`,
        transformOrigin: 'center center',
        ...style,
      }}
    >
      {headerTitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: '1.5px solid rgba(20, 20, 19, 0.12)',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: badgeColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: '#141413',
              letterSpacing: '-0.01em',
            }}
          >
            {headerTitle}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};
