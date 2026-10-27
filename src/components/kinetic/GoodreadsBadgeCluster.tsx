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
  author = 'Morgan Housel',
  rating = 4.38,
  ratingsCount = '1.94M',
  startFrame = 14,
  currentFrame,
  style,
}) => {
  const globalFrame = useCurrentFrame();
  const frame = currentFrame ?? globalFrame;
  const { fps } = useVideoConfig();

  // Entrada tipo "estampado de parche / sticker" con impacto y rebote elástico progresivo
  // Parche 1 (Autor): entra muy temprano (frame 14)
  const patch1Spring = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  // Parche 2 (Goodreads Oficial): se estampa en frame 42
  const patch2Spring = spring({
    frame: Math.max(0, frame - (startFrame + 28)),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  // Parche 3 (Comunidad de Lectores): se estampa en frame 70
  const patch3Spring = spring({
    frame: Math.max(0, frame - (startFrame + 56)),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  // Escalas de impacto: caen desde 1.45x y rebotan a 1.0x como un sello físico
  const scale1 = interpolate(patch1Spring, [0, 1], [1.45, 1], CLAMP_EXTRAPOLATION);
  const scale2 = interpolate(patch2Spring, [0, 1], [1.5, 1], CLAMP_EXTRAPOLATION);
  const scale3 = interpolate(patch3Spring, [0, 1], [1.4, 1], CLAMP_EXTRAPOLATION);

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
        gap: 14,
        marginTop: 22,
        width: '100%',
        ...style,
      }}
    >
      {/* PARCHE 1: Sello Autor del Libro con inclinación sticker */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 22px',
          backgroundColor: '#FEF9C3',
          border: '2.5px solid #141413',
          borderBottom: '5px solid #141413',
          borderRadius: 16,
          boxShadow: '0 10px 24px rgba(20, 20, 19, 0.12)',
          opacity: patch1Spring,
          transform: `translateY(${(1 - patch1Spring) * -30}px) scale(${scale1}) rotate(-2.5deg)`,
          transformOrigin: 'center center',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#D94E34',
            flexShrink: 0,
            boxShadow: '0 0 0 2px rgba(217, 78, 52, 0.25)',
          }}
        />
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: '#141413',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {author}
        </span>
      </div>

      {/* PARCHE 2: Parche Oficial Goodreads con estrella dorada */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 22px',
          backgroundColor: '#FEF9C3',
          border: '2.5px solid #141413',
          borderBottom: '5px solid #D97706',
          borderRadius: 16,
          boxShadow:
            '0 14px 30px rgba(217, 119, 6, 0.20), 0 4px 12px rgba(20, 20, 19, 0.08)',
          opacity: patch2Spring,
          transform: `translateY(${(1 - patch2Spring) * -35}px) scale(${scale2}) rotate(3.2deg)`,
          transformOrigin: 'center center',
          zIndex: 2,
        }}
      >
        <Img
          src={staticFile('assets/branding/goodreads-logo.png')}
          style={{
            height: 22,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <span
          style={{
            width: 2,
            height: 20,
            backgroundColor: 'rgba(20, 20, 19, 0.22)',
          }}
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#141413',
            color: '#FEF9C3',
            padding: '4px 12px',
            borderRadius: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          }}
        >
          <span style={{ color: '#F59E0B', fontSize: 16, lineHeight: 1 }}>
            ★
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 17,
              fontWeight: 900,
              color: '#FEF9C3',
              letterSpacing: '-0.01em',
            }}
          >
            {rating}
          </span>
        </div>
      </div>

      {/* PARCHE 3: Parche Comunidad de Lectores */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          backgroundColor: '#FEF9C3',
          border: '2.5px solid #141413',
          borderBottom: '5px solid #D94E34',
          borderRadius: 16,
          boxShadow: '0 10px 24px rgba(20, 20, 19, 0.12)',
          opacity: patch3Spring,
          transform: `translateY(${(1 - patch3Spring) * -30}px) scale(${scale3}) rotate(-2deg)`,
          transformOrigin: 'center center',
        }}
      >
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 18,
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
            fontSize: 16,
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
