import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';

export interface CtaEndCardProps {
  enterFrame?: number;
  handle?: string;
}

/**
 * CtaEndCard — Tarjeta Final de Llamada a la Acción (Call To Action)
 * Diseñada para máxima conversión de seguidores y guardados en Reels/TikTok/Shorts.
 */
export const CtaEndCard: React.FC<CtaEndCardProps> = ({
  enterFrame = 0,
  handle = '@en60segundos',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Entrada de la tarjeta con resorte snappy
  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Pulso constante en el botón de Seguir (animación en bucle)
  const pulseLoop = (localFrame % 30) / 30;
  const pulseScale = interpolate(
    pulseLoop,
    [0, 0.5, 1],
    [1.0, 1.04, 1.0],
    CLAMP_EXTRAPOLATION
  );

  return (
    <div
      style={{
        position: 'relative',
        width: 888,
        backgroundColor: '#FFFFFF',
        border: '2px solid #D94E34',
        borderRadius: 24,
        padding: '36px 36px 32px',
        boxShadow: '0 20px 50px rgba(217, 78, 52, 0.15), 0 4px 12px rgba(0,0,0,0.03)',
        boxSizing: 'border-box',
        textAlign: 'center',
        opacity: cardSpring,
        transform: `translateY(${(1 - cardSpring) * 35}px) scale(${interpolate(cardSpring, [0, 1], [0.92, 1.0], CLAMP_EXTRAPOLATION)})`,
      }}
    >
      {/* Badge superior */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 14px',
          backgroundColor: 'rgba(217, 78, 52, 0.10)',
          borderRadius: 20,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#D94E34',
          }}
        />
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 12,
            fontWeight: 800,
            color: '#D94E34',
            letterSpacing: 1.2,
          }}
        >
          COMUNIDAD DE APRENDIZAJE ACELERADO
        </span>
      </div>

      {/* Titular de Alto Impacto */}
      <h3
        style={{
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          fontSize: 38,
          fontWeight: 900,
          color: '#141413',
          margin: '0 0 10px 0',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        }}
      >
        ¿Quieres dominar 1 libro al día?
      </h3>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 17,
          color: '#575550',
          margin: '0 auto 24px',
          maxWidth: 680,
          lineHeight: 1.4,
        }}
      >
        Publicamos cada día las ideas más potentes de no ficción explicadas visualmente en 60 segundos.
      </p>

      {/* Botón Principal de Seguir con Pulso */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: '#D94E34',
          color: '#FFFFFF',
          padding: '16px 36px',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(217, 78, 52, 0.35)',
          transform: `scale(${pulseScale})`,
          transformOrigin: 'center center',
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 20 }}>🔔</span>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: 0.5,
          }}
        >
          SÍGUENOS EN {handle.toUpperCase()}
        </span>
      </div>

      {/* Fila de Micro-acciones (Guardar y Compartir) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          borderTop: '1px solid #E5E2DC',
          paddingTop: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            color: '#141413',
            backgroundColor: '#F8F7F4',
            padding: '6px 14px',
            borderRadius: 8,
          }}
        >
          <span>🔖</span>
          <span>GUARDA ESTE RESUMEN</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            color: '#141413',
            backgroundColor: '#F8F7F4',
            padding: '6px 14px',
            borderRadius: 8,
          }}
        >
          <span>↗️</span>
          <span>COMPARTE CON UN AMIGO</span>
        </div>
      </div>
    </div>
  );
};
