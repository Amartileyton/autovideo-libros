import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';

export interface LiveCounterProps {
  /** Valor inicial del contador (ej: 0 o 1.0) */
  from?: number;
  /** Valor final objetivo (ej: 37.78 o 92) */
  to: number;
  /** Fotograma local en el que arranca la animación de conteo */
  startFrame?: number;
  /** Duración en fotogramas del conteo (por defecto 30 fotogramas ~ 1s) */
  durationFrames?: number;
  /** Número de decimales a mostrar (0 para enteros, 1 o 2 para métricas) */
  decimals?: number;
  /** Prefijo (ej: "+", "★ ", "€") */
  prefix?: string;
  /** Sufijo (ej: "x", "%", " €/mes", "M") */
  suffix?: string;
  /** Estilos tipográficos adicionales */
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  fontFamily?: string;
  /** Si debe tener un rebote elástico al terminar */
  elasticBounce?: boolean;
}

/**
 * LiveCounter — Contador Cinético en Vivo (Inspirado en @eldatomanda)
 * Muestra el número corriendo a alta velocidad con aceleración spring
 * y un salto elástico al alcanzar la cifra definitiva.
 */
export const LiveCounter: React.FC<LiveCounterProps> = ({
  from = 0,
  to,
  startFrame = 0,
  durationFrames = 35,
  decimals = 0,
  prefix = '',
  suffix = '',
  fontSize = 64,
  fontWeight = 800,
  color = '#141413',
  fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  elasticBounce = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // 1. Progreso suave del conteo usando curva de resorte snappy
  const counterSpring = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 18,
      stiffness: 140,
      mass: 0.9,
    },
    durationInFrames: durationFrames,
  });

  const rawValue = interpolate(
    counterSpring,
    [0, 1],
    [from, to],
    CLAMP_EXTRAPOLATION
  );

  const formattedNumber =
    decimals > 0
      ? rawValue.toLocaleString('es-ES', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(rawValue).toLocaleString('es-ES');

  // 2. Micro-rebote de impacto al llegar a la cifra final
  const popSpring = elasticBounce
    ? spring({
        frame: Math.max(0, localFrame - durationFrames + 4),
        fps,
        config: SPRING_SNAPPY,
      })
    : 1;

  const scale = elasticBounce
    ? interpolate(popSpring, [0, 0.4, 1], [1, 1.12, 1], CLAMP_EXTRAPOLATION)
    : 1;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily,
        fontSize,
        fontWeight,
        color,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.03em',
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        lineHeight: 1,
      }}
    >
      {prefix && <span>{prefix}</span>}
      <span>{formattedNumber}</span>
      {suffix && (
        <span style={{ fontSize: fontSize * 0.72, marginLeft: 4 }}>
          {suffix}
        </span>
      )}
    </span>
  );
};
