import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

export interface OneMinuteStopwatchProps {
  /**
   * Diámetro del reloj en píxeles
   */
  size?: number;
  /**
   * Fotograma global de la composición (si no se pasa, usa useCurrentFrame())
   */
  currentFrame?: number;
  /**
   * Duración total de la composición en fotogramas
   */
  totalDurationInFrames?: number;
  /**
   * Modo: 'header' (pill inferior continuo) o 'hero' (versión ampliada de CTA)
   */
  mode?: 'header' | 'hero';
  /**
   * Estilo CSS opcional
   */
  style?: React.CSSProperties;
}

/**
 * OneMinuteStopwatch — Isotipo Oficial Opción 1 (Minimalista de Precisión):
 * 1. Forma circular pura: SIN PITORRILLO SUPERIOR, sin coronas ni salientes.
 * 2. Área interior (quesito) integrada desde las 12:00 a las 2:00 (60°) en estado inicial.
 * 3. En movimiento: El área interior terracota se expande radialmente en tiempo real
 *    barriendo de 60° a 360° hasta completar la esfera al 100%.
 * 4. La aguja central acompaña con exactitud el borde de avance del área.
 */
export const OneMinuteStopwatch: React.FC<OneMinuteStopwatchProps> = ({
  size = 52,
  currentFrame,
  totalDurationInFrames = 1765,
  mode = 'header',
  style,
}) => {
  const videoFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = currentFrame ?? videoFrame;

  // 1. Entrada elástica con rebote snappy
  const entrance = spring({
    frame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 1b. Animación ligera continua de latido y balanceo orgánico mientras corre el reloj
  const gentlePulse = mode === 'header' ? 1 + 0.035 * Math.sin(frame * 0.22) : 1;
  const gentleSwayDeg = mode === 'header' ? 2.2 * Math.sin(frame * 0.14) : 0;

  // 2. Ángulo del área interior terracota (sweepDeg)
  // - En reposo/logo base: 60° (marca de las 2:00).
  // - Frames 0..25: Calibración rápida (salto de 60° a 360° y reset a 60° con flash).
  // - Frames 30..final: El área interior avanza de 60° a 360° en tiempo real a lo largo del vídeo.
  let sweepDeg = 60;
  let flashOpacity = 0;

  if (mode === 'hero') {
    // En el CTA final, el área interior llena la esfera entera (360°)
    sweepDeg = 360;
  } else if (frame < 22) {
    // Salto inicial y barrido de prueba
    sweepDeg = interpolate(frame, [4, 18], [60, 360], CLAMP_EXTRAPOLATION);
  } else if (frame >= 22 && frame < 32) {
    // Reset a blanco / retorno a la posición base de las 2:00
    sweepDeg = interpolate(frame, [22, 30], [360, 60], CLAMP_EXTRAPOLATION);
    flashOpacity = interpolate(frame, [22, 26, 31], [0, 0.4, 0], CLAMP_EXTRAPOLATION);
  } else {
    // Avance continuo del área interior desde las 2:00 (60°) hasta las 12:00 (360°)
    sweepDeg = interpolate(
      frame,
      [32, totalDurationInFrames - 30],
      [60, 360],
      CLAMP_EXTRAPOLATION
    );
  }

  // Geometría del dial
  const center = size / 2;
  const radius = size * 0.44; // Maximizado al eliminar el pitorrillo superior
  const pieRadius = radius - Math.max(2, size * 0.035);

  // Construcción del path del quesito / área interior
  // En ángulo 0° = 12:00 (arriba). Ángulo sweepDeg avanza en sentido horario.
  const isFullCircle = sweepDeg >= 359.5;
  const startX = center;
  const startY = center - pieRadius;
  const rad = ((sweepDeg - 90) * Math.PI) / 180;
  const endX = center + pieRadius * mathCos(rad);
  const endY = center + pieRadius * mathSin(rad);
  const largeArcFlag = sweepDeg > 180 ? 1 : 0;

  const wedgePath = isFullCircle
    ? null
    : `M ${center} ${center} L ${startX} ${startY} A ${pieRadius} ${pieRadius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${entrance * gentlePulse}) rotate(${gentleSwayDeg}deg)`,
        transformOrigin: 'center center',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id={`clock-shadow-${mode}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy={mode === 'hero' ? 6 : 2}
              stdDeviation={mode === 'hero' ? 10 : 2.5}
              floodColor="rgba(20, 20, 19, 0.12)"
            />
          </filter>
        </defs>

        {/* 1. Bisel Exterior Limpio (SIN PITORRILLO SUPERIOR) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#FFFFFF"
          stroke="#141413"
          strokeWidth={Math.max(2, size * 0.05)}
          filter={`url(#clock-shadow-${mode})`}
        />

        {/* 2. ÁREA INTERIOR INTEGRADA QUE AVANZA EN TIEMPO REAL */}
        {isFullCircle ? (
          <circle
            cx={center}
            cy={center}
            r={pieRadius}
            fill="#D94E34"
          />
        ) : (
          <path
            d={wedgePath || ''}
            fill="#D94E34"
            stroke="#D94E34"
            strokeWidth={1}
            strokeLinejoin="round"
          />
        )}

        {/* Destello sutil de calibración inicial */}
        {flashOpacity > 0 && (
          <circle
            cx={center}
            cy={center}
            r={pieRadius}
            fill="#FFFFFF"
            opacity={flashOpacity}
          />
        )}

        {/* 3. Marcas Horarias (12 divisiones) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const isCardinal = deg % 90 === 0;
          const isTwoOClock = deg === 60;
          const tickLen = isCardinal
            ? size * 0.075
            : isTwoOClock
            ? size * 0.065
            : size * 0.045;
          const tickStroke = isTwoOClock
            ? '#D94E34'
            : isCardinal
            ? '#141413'
            : 'rgba(20, 20, 19, 0.35)';
          const strokeW = isCardinal || isTwoOClock ? Math.max(1.5, size * 0.035) : Math.max(1, size * 0.02);

          const r1 = radius - size * 0.01;
          const r2 = r1 - tickLen;
          const angleRad = (deg * Math.PI) / 180;

          const x1 = center + r1 * mathSin(angleRad);
          const y1 = center - r1 * mathCos(angleRad);
          const x2 = center + r2 * mathSin(angleRad);
          const y2 = center - r2 * mathCos(angleRad);

          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={tickStroke}
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          );
        })}

        {/* 4. Aguja Central de Precisión (Sigue el avance del área) */}
        <g transform={`rotate(${sweepDeg} ${center} ${center})`}>
          <line
            x1={center}
            y1={center + size * 0.06}
            x2={center}
            y2={center - pieRadius + size * 0.03}
            stroke="#141413"
            strokeWidth={Math.max(1.8, size * 0.042)}
            strokeLinecap="round"
          />
          {/* Remate de la aguja */}
          <line
            x1={center}
            y1={center - pieRadius * 0.6}
            x2={center}
            y2={center - pieRadius + size * 0.02}
            stroke="#141413"
            strokeWidth={Math.max(2, size * 0.048)}
            strokeLinecap="round"
          />
        </g>

        {/* 5. Pivote Central */}
        <circle cx={center} cy={center} r={Math.max(2.5, size * 0.055)} fill="#141413" />
        <circle cx={center} cy={center} r={Math.max(1.2, size * 0.024)} fill="#D94E34" />
      </svg>
    </div>
  );
};

function mathSin(rad: number): number {
  return Math.sin(rad);
}

function mathCos(rad: number): number {
  return Math.cos(rad);
}
