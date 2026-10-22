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
  /** Badge superior flotante opcional */
  badgeText?: string;
  badgeColor?: string;
  width?: number | string;
  padding?: number | string;
  style?: React.CSSProperties;
}

/**
 * KineticCard — Tarjeta Cinética Multicapa 2.5D (Estilo @eldatomanda / Apple UI)
 * Entrada elástica con inercia, perspectiva sutil 2.5D y sombras suaves multicapa.
 */
export const KineticCard: React.FC<KineticCardProps> = ({
  children,
  enterFrame = 0,
  enterY = 40,
  tiltDeg = 0,
  accentBorderColor = '#D94E34',
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

  // Badge elástico que entra 8 frames después
  const badgeSpring = badgeText
    ? spring({
        frame: Math.max(0, localFrame - 8),
        fps,
        config: SPRING_SNAPPY,
      })
    : 0;

  return (
    <div
      style={{
        position: 'relative',
        width,
        backgroundColor: '#FFFFFF',
        border: accentBorderColor
          ? `2px solid ${accentBorderColor}`
          : '1.5px solid rgba(45, 43, 40, 0.12)',
        borderRadius: 20,
        padding,
        boxShadow:
          '0 20px 50px rgba(45, 43, 40, 0.08), 0 4px 12px rgba(45, 43, 40, 0.04)',
        boxSizing: 'border-box',
        opacity: entranceSpring,
        transform: `translateY(${translateY}px) scale(${scale}) perspective(1000px) rotateX(${tiltDeg}deg)`,
        transformOrigin: 'center center',
        ...style,
      }}
    >
      {badgeText && (
        <div
          style={{
            position: 'absolute',
            top: -14,
            right: 28,
            backgroundColor: badgeColor,
            color: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.5,
            boxShadow: '0 4px 12px rgba(217, 78, 52, 0.30)',
            opacity: badgeSpring,
            transform: `scale(${badgeSpring})`,
            transformOrigin: 'right center',
          }}
        >
          {badgeText}
        </div>
      )}
      {children}
    </div>
  );
};
