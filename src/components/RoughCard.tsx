import React, { useMemo } from 'react';
import rough from 'roughjs';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CLAMP_EXTRAPOLATION,
  PALETTE,
  SPRING_SNAPPY,
} from '../theme/motion';

export interface RoughCardProps {
  width: number;
  height: number;
  enterFrame?: number;
  strokeColor?: string;
  fillColor?: string;
  accentColor?: string;
  seed?: number;
  roughness?: number;
  children?: React.ReactNode;
}

/**
 * RoughCard — Contenedor vectorial editorial con trazos generados determinísticamente por roughjs
 * y física de entrada SPRING_SNAPPY.
 */
export const RoughCard: React.FC<RoughCardProps> = ({
  width,
  height,
  enterFrame = 0,
  strokeColor = PALETTE.border,
  fillColor = PALETTE.surfaceElevated,
  accentColor = PALETTE.accentPrimary,
  seed = 42,
  roughness = 1.15,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  const scale = interpolate(entrance, [0, 1], [0.92, 1], CLAMP_EXTRAPOLATION);
  const opacity = interpolate(entrance, [0, 0.5, 1], [0, 1, 1], CLAMP_EXTRAPOLATION);
  const translateY = interpolate(entrance, [0, 1], [28, 0], CLAMP_EXTRAPOLATION);

  const roughPaths = useMemo(() => {
    const generator = rough.generator();
    const drawable = generator.rectangle(6, 6, width - 12, height - 12, {
      seed,
      roughness,
      bowing: 0.9,
      stroke: strokeColor,
      strokeWidth: 3.5,
      fill: fillColor,
      fillStyle: 'solid',
    });
    const accentBar = generator.line(18, 18, width - 18, 18, {
      seed: seed + 7,
      roughness: 0.8,
      stroke: accentColor,
      strokeWidth: 5,
    });
    return {
      rectPaths: generator.toPaths(drawable),
      accentPaths: generator.toPaths(accentBar),
    };
  }, [width, height, seed, roughness, strokeColor, fillColor, accentColor]);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
        }}
      >
        {roughPaths.rectPaths.map((p, idx) => (
          <path
            key={`rect-${idx}`}
            d={p.d}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            fill={p.fill || 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {roughPaths.accentPaths.map((p, idx) => (
          <path
            key={`accent-${idx}`}
            d={p.d}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '38px 36px 32px 36px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {children}
      </div>
    </div>
  );
};
