import React from 'react';
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';

export interface GoodreadsBadgeClusterProps {
  author?: string;
  rating?: number | string;
  ratingsCount?: string;
  /** Fotograma local en el que inicia la cascada de entrada de las 3 píldoras */
  startFrame?: number;
  /** Fotograma local opcional (cuando la escena vive en CameraRig sin Sequence) */
  currentFrame?: number;
  style?: React.CSSProperties;
}

/**
 * GoodreadsBadgeCluster — Sistema de 3 Píldoras/Cajas Diferenciadas con Logo Oficial de Goodreads
 *
 * Regla Inquebrantable de @en1minuto.es:
 * Prohibido agrupar autor, nota de Goodreads y lectores en una sola píldora plana.
 * Se presentan en 3 cajas independientes con entrada escalonada (staggered SPRING_SNAPPY),
 * destacando en el centro el logotipo oficial de Goodreads junto a su calificación verificada.
 */
export const GoodreadsBadgeCluster: React.FC<GoodreadsBadgeClusterProps> = ({
  author = 'Charles Duhigg',
  rating = 4.13,
  ratingsCount = '585K',
  startFrame = 65,
  currentFrame,
  style,
}) => {
  const globalFrame = useCurrentFrame();
  const frame = currentFrame ?? globalFrame;
  const { fps } = useVideoConfig();

  // Entrada escalonada de las 3 cajas independientes
  const pill1Spring = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  const pill2Spring = spring({
    frame: Math.max(0, frame - (startFrame + 8)),
    fps,
    config: SPRING_SNAPPY,
  });

  const pill3Spring = spring({
    frame: Math.max(0, frame - (startFrame + 16)),
    fps,
    config: SPRING_SNAPPY,
  });

  // Pulso sutil de énfasis sobre la caja central de Goodreads cuando termina de entrar
  const highlightPop = spring({
    frame: Math.max(0, frame - (startFrame + 28)),
    fps,
    config: SPRING_SNAPPY,
  });

  const centerScale = interpolate(
    highlightPop,
    [0, 0.5, 1],
    [1, 1.05, 1.02],
    CLAMP_EXTRAPOLATION
  );

  const cleanCount = String(ratingsCount).startsWith('+')
    ? String(ratingsCount)
    : `+${ratingsCount}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 18,
        width: '100%',
        ...style,
      }}
    >
      {/* CAJA 1: Autor del Libro */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          backgroundColor: '#FEF9C3',
          border: '2px solid #141413',
          borderBottom: '4px solid #141413',
          borderRadius: 14,
          boxShadow: '0 6px 16px rgba(20, 20, 19, 0.06)',
          opacity: pill1Spring,
          transform: `translateY(${(1 - pill1Spring) * 18}px) scale(${interpolate(
            pill1Spring,
            [0, 1],
            [0.9, 1],
            CLAMP_EXTRAPOLATION
          )})`,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#D94E34',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 800,
            color: '#141413',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {author}
        </span>
      </div>

      {/* CAJA 2 (PROTAGONISTA): Logo Oficial de Goodreads + Calificación Estrella */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 18px',
          backgroundColor: '#FEF9C3',
          border: '2px solid #141413',
          borderBottom: '4px solid #D97706',
          borderRadius: 14,
          boxShadow:
            '0 10px 24px rgba(217, 119, 6, 0.15), 0 3px 8px rgba(20, 20, 19, 0.06)',
          opacity: pill2Spring,
          transform: `translateY(${(1 - pill2Spring) * 20}px) scale(${
            interpolate(pill2Spring, [0, 1], [0.88, 1], CLAMP_EXTRAPOLATION) *
            centerScale
          })`,
        }}
      >
        <Img
          src={staticFile('assets/branding/goodreads-logo.png')}
          style={{
            height: 19,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <span
          style={{
            width: 1.5,
            height: 16,
            backgroundColor: 'rgba(20, 20, 19, 0.18)',
          }}
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#141413',
            color: '#FEF9C3',
            padding: '3px 9px',
            borderRadius: 8,
          }}
        >
          <span style={{ color: '#F59E0B', fontSize: 14, lineHeight: 1 }}>
            ★
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 900,
              color: '#FEF9C3',
              letterSpacing: '-0.01em',
            }}
          >
            {rating}
          </span>
        </div>
      </div>

      {/* CAJA 3: Comunidad de Lectores Verificados */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '10px 16px',
          backgroundColor: '#FEF9C3',
          border: '2px solid #141413',
          borderBottom: '4px solid #D94E34',
          borderRadius: 14,
          boxShadow: '0 6px 16px rgba(20, 20, 19, 0.06)',
          opacity: pill3Spring,
          transform: `translateY(${(1 - pill3Spring) * 18}px) scale(${interpolate(
            pill3Spring,
            [0, 1],
            [0.9, 1],
            CLAMP_EXTRAPOLATION
          )})`,
        }}
      >
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 900,
            color: '#D94E34',
            whiteSpace: 'nowrap',
          }}
        >
          {cleanCount}
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: '#575550',
            whiteSpace: 'nowrap',
          }}
        >
          lectores
        </span>
      </div>
    </div>
  );
};
