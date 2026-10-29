import React from 'react';
import { interpolate, spring, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';
import { BIG } from './tokens';

export type EnterFrom = 'bottom' | 'top' | 'left' | 'right' | 'scale';

export interface PaleCardProps {
  /** Fotograma local de la escena (puede ser negativo durante el pre-roll) */
  frame: number;
  enterFrame?: number;
  exitFrame?: number;
  from?: EnterFrom;
  fill?: string;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed';
  tiltDeg?: number;
  /** Escala de reposo (p. ej. 1.03 para estado activo) */
  restScale?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * PaleCard — Tarjeta pura en amarillo pálido (#FEF9C3), sin barra de título.
 * Entrada elástica (SPRING_SNAPPY) desde una dirección y salida opcional.
 */
export const PaleCard: React.FC<PaleCardProps> = ({
  frame,
  enterFrame = 0,
  exitFrame,
  from = 'bottom',
  fill = BIG.card,
  borderColor = BIG.ink,
  borderStyle = 'solid',
  tiltDeg = 0,
  restScale = 1,
  style,
  children,
}) => {
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: SPRING_SNAPPY,
  });
  const exit =
    exitFrame === undefined
      ? 0
      : interpolate(frame, [exitFrame, exitFrame + 10], [0, 1], CLAMP_EXTRAPOLATION);

  const dist = 110;
  const dx = from === 'left' ? -dist : from === 'right' ? dist : 0;
  const dy = from === 'bottom' ? dist : from === 'top' ? -dist : 0;
  const entryScale =
    from === 'scale'
      ? interpolate(p, [0, 1], [0.8, 1], CLAMP_EXTRAPOLATION)
      : interpolate(p, [0, 1], [0.96, 1], CLAMP_EXTRAPOLATION);

  return (
    <div
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: fill,
        border: `3px ${borderStyle} ${borderColor}`,
        borderRadius: 36,
        padding: '34px 40px',
        boxShadow:
          '0 22px 50px rgba(20, 20, 19, 0.10), 0 4px 12px rgba(20, 20, 19, 0.05)',
        opacity: Math.min(1, p * 1.5) * (1 - exit),
        transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy + exit * 40}px) scale(${
          entryScale * restScale
        }) rotate(${tiltDeg}deg)`,
        transformOrigin: 'center center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
