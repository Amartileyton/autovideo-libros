import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';
import { OneMinuteStopwatch } from '../OneMinuteStopwatch';

export interface CtaEndCardProps {
  enterFrame?: number;
  handle?: string;
  questionText?: string;
}

/**
 * CtaEndCard — Tarjeta Final de Llamada a la Acción y Comunidad (@en1minuto.es)
 *
 * Incluye:
 * 1. Logotipo Cronómetro Hero que se hace grande al llegar al CTA.
 * 2. Invitación a seguir a @en1minuto.es con botón de alto contraste y pulso.
 * 3. Caja de debate que incita a comentar sobre el libro para viralizar el algoritmo.
 */
export const CtaEndCard: React.FC<CtaEndCardProps> = ({
  enterFrame = 0,
  handle = '@en1minuto.es',
  questionText = '¿Cuál es el primer hábito que vas a construir hoy?',
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
    [1.0, 1.03, 1.0],
    CLAMP_EXTRAPOLATION
  );

  // 3. Efecto de aparición del cronómetro central
  const stopwatchEntrance = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    config: SPRING_SNAPPY,
  });

  return (
    <div
      style={{
        position: 'relative',
        width: 888,
        backgroundColor: '#FEF9C3',
        border: '2px solid #D94E34',
        borderRadius: 24,
        padding: '32px 36px 28px',
        boxShadow:
          '0 24px 60px rgba(217, 78, 52, 0.16), 0 4px 14px rgba(0,0,0,0.04)',
        boxSizing: 'border-box',
        textAlign: 'center',
        opacity: cardSpring,
        transform: `translateY(${(1 - cardSpring) * 35}px) scale(${interpolate(
          cardSpring,
          [0, 1],
          [0.92, 1.0],
          CLAMP_EXTRAPOLATION
        )})`,
      }}
    >
      {/* 1. Cronómetro de 1 Minuto Central Hero (Se hace grande aquí) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          transform: `scale(${stopwatchEntrance})`,
        }}
      >
        <OneMinuteStopwatch
          size={110}
          mode="hero"
          currentFrame={localFrame}
          style={{
            filter: 'drop-shadow(0 8px 20px rgba(217, 78, 52, 0.25))',
          }}
        />
      </div>

      {/* Badge superior */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 14px',
          backgroundColor: 'rgba(217, 78, 52, 0.10)',
          borderRadius: 20,
          marginBottom: 12,
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
          TIEMPO CUMPLIDO · 1 MINUTO DESTILADO
        </span>
      </div>

      {/* Titular de Alto Impacto */}
      <h3
        style={{
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          fontSize: 34,
          fontWeight: 900,
          color: '#141413',
          margin: '0 0 8px 0',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        }}
      >
        Aprende 1 libro al día en 60 segundos
      </h3>

      {/* Botón Principal de Seguir a @en1minuto.es con Pulso */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: '#D94E34',
          color: '#FFFFFF',
          padding: '14px 34px',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(217, 78, 52, 0.35)',
          transform: `scale(${pulseScale})`,
          transformOrigin: 'center center',
          margin: '12px auto 18px',
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

      {/* Caja Interactiva de Pregunta para Comentarios */}
      <div
        style={{
          backgroundColor: '#F8F7F4',
          border: '1.5px dashed rgba(217, 78, 52, 0.40)',
          borderRadius: 14,
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 26, flexShrink: 0 }}>💬</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              color: '#D94E34',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            Pregunta a la comunidad
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: '#141413',
              lineHeight: 1.25,
            }}
          >
            {questionText}
          </div>
        </div>
      </div>

      {/* Fila de Micro-acciones (Guardar y Compartir) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          borderTop: '1px solid #E5E2DC',
          paddingTop: 14,
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
