import React from 'react';
import { Img, interpolate, spring, staticFile, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';
import { BIG } from './tokens';

/**
 * SceneFrame — Contenedor 1080x1920 posicionado en el lienzo continuo del CameraRig.
 */
export const SceneFrame: React.FC<{
  canvasOffsetX?: number;
  canvasOffsetY?: number;
  children?: React.ReactNode;
}> = ({ canvasOffsetX = 0, canvasOffsetY = 0, children }) => (
  <div
    style={{
      position: 'absolute',
      left: canvasOffsetX,
      top: canvasOffsetY,
      width: 1080,
      height: 1920,
      pointerEvents: 'none',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

/**
 * TriangleConnector — Conector geométrico triangular descendente SIN texto (regla 11):
 * guía vertical punteada + triángulo exterior amarillo pálido con borde carbón + triángulo interior de color.
 */
export const TriangleConnector: React.FC<{
  frame: number;
  enterFrame: number;
  color?: string;
  height?: number;
}> = ({ frame, enterFrame, color = BIG.accent, height = 110 }) => {
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: SPRING_SNAPPY,
  });
  const scale = interpolate(p, [0, 1], [0.75, 1], CLAMP_EXTRAPOLATION);
  const opacity = interpolate(p, [0, 1], [0.3, 1], CLAMP_EXTRAPOLATION);
  return (
    <div
      style={{
        height,
        display: 'flex',
        justifyContent: 'center',
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center top',
      }}
    >
      <svg
        width={170}
        height={height}
        viewBox="0 0 170 110"
        style={{ filter: 'drop-shadow(0 6px 14px rgba(20, 20, 19, 0.12))' }}
      >
        <line
          x1={85}
          y1={0}
          x2={85}
          y2={22}
          stroke={BIG.ink}
          strokeWidth={3}
          strokeDasharray="5 3"
        />
        <polygon
          points="25,22 145,22 85,102"
          fill={BIG.card}
          stroke={BIG.ink}
          strokeWidth={2.8}
          strokeLinejoin="round"
        />
        <polygon points="50,38 120,38 85,80" fill={color} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/**
 * Strike — Tachado rojo que se activa en un fotograma exacto (regla 9: solo cuando la voz lo dice).
 */
export const Strike: React.FC<{
  frame: number;
  strikeFrame: number;
  children: React.ReactNode;
  thickness?: number;
}> = ({ frame, strikeFrame, children, thickness = 8 }) => {
  const progress = interpolate(frame, [strikeFrame, strikeFrame + 8], [0, 1], CLAMP_EXTRAPOLATION);
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        color: progress > 0.5 ? BIG.muted : undefined,
        opacity: interpolate(progress, [0, 1], [1, 0.7], CLAMP_EXTRAPOLATION),
      }}
    >
      {children}
      <span
        style={{
          position: 'absolute',
          left: -10,
          right: -10,
          top: '54%',
          height: thickness,
          borderRadius: thickness,
          backgroundColor: BIG.danger,
          transformOrigin: 'left center',
          transform: `scaleX(${progress})`,
        }}
      />
    </span>
  );
};

/** Sello "DESCARTADO ✗" que aparece junto con el tachado */
export const DiscardStamp: React.FC<{ frame: number; strikeFrame: number }> = ({
  frame,
  strikeFrame,
}) => {
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - strikeFrame),
    fps,
    config: SPRING_SNAPPY,
  });
  const scale = interpolate(p, [0, 1], [1.5, 1], CLAMP_EXTRAPOLATION);
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: BIG.font,
        fontWeight: 800,
        fontSize: 32,
        color: BIG.danger,
        border: `3px solid ${BIG.danger}`,
        borderRadius: 12,
        padding: '4px 16px',
        backgroundColor: BIG.cream,
        opacity: Math.min(1, p * 1.6),
        transform: `scale(${scale}) rotate(-4deg)`,
        letterSpacing: '0.02em',
      }}
    >
      DESCARTADO ✗
    </div>
  );
};

const stampSpring = (frame: number, start: number, fps: number) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: SPRING_SNAPPY,
  });

const stickerBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 28px',
  backgroundColor: BIG.card,
  border: `3px solid ${BIG.ink}`,
  borderBottom: `7px solid ${BIG.ink}`,
  borderRadius: 24,
  boxShadow: '0 12px 28px rgba(20, 20, 19, 0.14)',
  fontFamily: BIG.font,
  whiteSpace: 'nowrap',
};

/**
 * BadgeStickers — 3 cajas independientes (autor · valoración · lectores), texto >= 40px,
 * entrada escalonada tipo sticker (scale 1.45 → 1.0 con inclinación sutil).
 * El logotipo de Goodreads solo se muestra cuando la fuente del dato ES Goodreads.
 */
export const BadgeStickers: React.FC<{
  frame: number;
  startFrame?: number;
  author: string;
  rating: number | string;
  ratingsCount: string;
  /** Fuente real del dato: 'Goodreads' | 'Google Books' | 'Open Library' ... */
  ratingSource?: string;
  /** Fecha de captura del dato, p. ej. '2026-10' */
  ratingDate?: string;
}> = ({ frame, startFrame = 0, author, rating, ratingsCount, ratingSource, ratingDate }) => {
  const { fps } = useVideoConfig();
  const p1 = stampSpring(frame, startFrame, fps);
  const p2 = stampSpring(frame, startFrame + 10, fps);
  const p3 = stampSpring(frame, startFrame + 20, fps);
  const count = String(ratingsCount).startsWith('+') ? String(ratingsCount) : `+${ratingsCount}`;
  const showLogo = /goodreads/i.test(ratingSource ?? '');
  const sc = (p: number, from: number) => interpolate(p, [0, 1], [from, 1], CLAMP_EXTRAPOLATION);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <div
        style={{
          ...stickerBase,
          opacity: Math.min(1, p1 * 1.6),
          transform: `scale(${sc(p1, 1.45)}) rotate(-2.5deg)`,
        }}
      >
        <span
          style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: BIG.accent }}
        />
        <span style={{ fontSize: 42, fontWeight: 800, color: BIG.ink }}>{author}</span>
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <div
          style={{
            ...stickerBase,
            borderBottom: `7px solid ${BIG.amber}`,
            opacity: Math.min(1, p2 * 1.6),
            transform: `scale(${sc(p2, 1.5)}) rotate(3.2deg)`,
          }}
        >
          {showLogo ? (
            <Img
              src={staticFile('assets/branding/goodreads-logo.png')}
              style={{ height: 38, width: 'auto' }}
            />
          ) : null}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: BIG.ink,
              color: BIG.card,
              padding: '4px 18px',
              borderRadius: 14,
              fontSize: 42,
              fontWeight: 800,
            }}
          >
            <span style={{ color: '#F59E0B' }}>★</span>
            {rating}
          </span>
        </div>

        <div
          style={{
            ...stickerBase,
            borderBottom: `7px solid ${BIG.accent}`,
            opacity: Math.min(1, p3 * 1.6),
            transform: `scale(${sc(p3, 1.4)}) rotate(-2deg)`,
          }}
        >
          <span style={{ fontSize: 42, fontWeight: 800, color: BIG.accent }}>{count}</span>
          <span style={{ fontSize: 34, fontWeight: 700, color: BIG.muted }}>lectores</span>
        </div>
      </div>

      {ratingSource ? (
        <div
          style={{
            fontFamily: BIG.font,
            fontSize: 26,
            fontWeight: 700,
            color: BIG.muted,
            opacity: Math.min(1, p3 * 1.6),
          }}
        >
          Valoración de lectores · {ratingSource}
          {ratingDate ? ` · ${ratingDate}` : ''}
        </div>
      ) : null}
    </div>
  );
};
