import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';
import { OneMinuteStopwatch } from '../OneMinuteStopwatch';

export interface CtaEndCardProps {
  enterFrame?: number;
  handle?: string;
  questionText?: string;
  /** Llamada a la acción del final del vídeo hablada por el locutor */
  ctaText?: string;
  /** Acción principal destacada que coincide literalmente con el audio */
  ctaActionLabel?: string;
  /** Si se muestra o no la tarjeta interactiva de pregunta a la comunidad */
  showCommunityQuestion?: boolean;
  /** Si la tarjeta dibuja su propio reloj interno (false cuando Video.tsx orquesta el reloj volador) */
  showInternalStopwatch?: boolean;
}

/**
 * CtaEndCard — Tarjeta Final de Llamada a la Acción y Comunidad (@en1minuto.es)
 *
 * Características consolidadas:
 * 1. Espacio superior reservado (120px) para el aterrizaje del reloj volador desde el bottom.
 * 2. Cero badges redundantes de "TIEMPO CUMPLIDO".
 * 3. Titular contundente alineado al audio.
 * 4. Botón de alto contraste con pulso en Terracota.
 * 5. Caja de pregunta limpia sin la etiqueta "Vínculo CTA".
 * 6. Acción principal destacada que coincide exactamente con la locución del audio.
 * 7. Ocupación vertical dominante en el tercio inferior del lienzo (hasta Y = 1540px).
 */
export const CtaEndCard: React.FC<CtaEndCardProps> = ({
  enterFrame = 0,
  handle = '@en1minuto.es',
  questionText = 'Para empezar hoy mismo tras guardar el resumen: ¿cuál es el gasto de apariencia que vas a eliminar?',
  ctaText = 'Guarda este resumen y empieza hoy mismo',
  ctaActionLabel = 'GUARDA ESTE RESUMEN Y EMPIEZA HOY MISMO',
  showCommunityQuestion = true,
  showInternalStopwatch = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Entrada de la tarjeta con resorte elástico
  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 140, mass: 0.9 },
  });

  // 2. Pulso constante en el botón de Seguir (animación en bucle)
  const pulseLoop = (localFrame % 30) / 30;
  const pulseScale = interpolate(
    pulseLoop,
    [0, 0.5, 1],
    [1.0, 1.03, 1.0],
    CLAMP_EXTRAPOLATION
  );

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#FEF9C3',
        border: '3px solid #D94E34',
        borderRadius: 28,
        padding: '36px 40px 38px',
        boxShadow:
          '0 28px 70px rgba(217, 78, 52, 0.20), 0 4px 16px rgba(0,0,0,0.04)',
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
      {/* 1. Ranura reservada para el Cronómetro Hero (el reloj del bottom sube y se acopla aquí) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 120,
          marginBottom: 18,
        }}
      >
        {showInternalStopwatch && (
          <OneMinuteStopwatch
            size={115}
            mode="hero"
            currentFrame={localFrame}
            style={{
              filter: 'drop-shadow(0 8px 24px rgba(217, 78, 52, 0.30))',
            }}
          />
        )}
      </div>

      {/* Titular de Alto Impacto vinculado al CTA */}
      <h3
        style={{
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          fontSize: 38,
          fontWeight: 900,
          color: '#141413',
          margin: '0 0 16px 0',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        }}
      >
        {ctaText}
      </h3>

      {/* Botón Principal de Seguir a @en1minuto.es con Pulso */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          backgroundColor: '#D94E34',
          color: '#FFFFFF',
          padding: '18px 46px',
          borderRadius: 20,
          boxShadow: '0 10px 28px rgba(217, 78, 52, 0.38)',
          transform: `scale(${pulseScale})`,
          transformOrigin: 'center center',
          margin: '10px auto 22px',
        }}
      >
        <span style={{ fontSize: 26 }}>🔔</span>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 23,
            fontWeight: 900,
            letterSpacing: 0.5,
          }}
        >
          SÍGUENOS EN {handle.toUpperCase()}
        </span>
      </div>

      {/* Caja Interactiva de Pregunta a la Comunidad limpia (sin Vínculo CTA) */}
      {showCommunityQuestion && questionText ? (
        <div
          style={{
            backgroundColor: '#F8F7F4',
            border: '2px dashed rgba(217, 78, 52, 0.45)',
            borderRadius: 20,
            padding: '20px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 34, flexShrink: 0 }}>💬</span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 900,
                color: '#D94E34',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              Pregunta a la comunidad
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 21,
                fontWeight: 700,
                color: '#141413',
                lineHeight: 1.35,
                marginTop: 4,
              }}
            >
              {questionText}
            </div>
          </div>
        </div>
      ) : null}

      {/* Fila de Micro-acciones con el CTA textual coincidente al 100% con el audio */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 18,
          borderTop: '1.5px solid #E5E2DC',
          paddingTop: 22,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 17,
            fontWeight: 900,
            color: '#FFFFFF',
            backgroundColor: '#D94E34',
            padding: '14px 28px',
            borderRadius: 14,
            boxShadow: '0 6px 18px rgba(217, 78, 52, 0.30)',
            letterSpacing: 0.3,
          }}
        >
          <span>🔖</span>
          <span>{ctaActionLabel}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 16,
            fontWeight: 800,
            color: '#141413',
            backgroundColor: '#F8F7F4',
            padding: '14px 22px',
            borderRadius: 14,
            border: '1.5px solid #141413',
          }}
        >
          <span>↗️</span>
          <span>COMPARTIR</span>
        </div>
      </div>
    </div>
  );
};
