import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

export interface OneMinuteStopwatchProps {
  /**
   * Diámetro del cronómetro en píxeles
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
   * Modo: 'header' (fijo arriba con animación completa) o 'hero' (versión ampliada de CTA)
   */
  mode?: 'header' | 'hero';
  /**
   * Estilo CSS opcional
   */
  style?: React.CSSProperties;
}

/**
 * OneMinuteStopwatch — Isotipo Oficial y Temporizador Dinámico de @en1minuto.es
 *
 * Características inquebrantables solicitadas:
 * 1. Forma de cronómetro clásico de ingeniería con corona y pulsadores.
 * 2. Área fija marcada aproximadamente a las 2 (sector permanente de identidad visual en terracota).
 * 3. Animación de inicio: Pequeño salto elástico con bandeo pendular, llenado rápido de calibración
 *    y reset a blanco.
 * 4. Temporizador continuo: Se va llenando progresivamente durante los 60s del vídeo.
 * 5. Versión 'hero' para el CTA final en Escena 5: Escala ampliada con pulso de llamada a la acción.
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

  // 1. Entrada con resorte elástico (Salto inicial)
  const entrance = spring({
    frame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Bandeo orgánico / Wobble pendular en la intro (frames 0..35)
  const wobbleDeg =
    mode === 'header'
      ? Math.sin(frame * 0.38) * Math.exp(-frame * 0.085) * 14
      : 0;

  // 3. Lógica del llenado (Fill Progress)
  // - Frames 0..22: Calibración rápida (0 -> 1)
  // - Frames 23..32: Reset a blanco / flash (1 -> 0)
  // - Frames 32..total: Temporizador real de 1 minuto (0 -> 1)
  let fillProgress = 0;
  let flashOpacity = 0;

  if (mode === 'hero') {
    // En modo Hero (CTA final), el temporizador culmina al 100% completando el ciclo
    fillProgress = 1;
  } else if (frame < 22) {
    fillProgress = interpolate(frame, [3, 20], [0, 1], CLAMP_EXTRAPOLATION);
  } else if (frame >= 22 && frame < 33) {
    fillProgress = interpolate(frame, [22, 32], [1, 0], CLAMP_EXTRAPOLATION);
    flashOpacity = interpolate(
      frame,
      [22, 26, 32],
      [0, 0.45, 0],
      CLAMP_EXTRAPOLATION
    );
  } else {
    // Progreso continuo del temporizador hasta el final del vídeo
    fillProgress = interpolate(
      frame,
      [33, totalDurationInFrames - 30],
      [0, 1],
      CLAMP_EXTRAPOLATION
    );
  }

  // Geometría SVG
  const center = size / 2;
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fillProgress);

  // Corona superior y proporciones
  const crownWidth = size * 0.22;
  const crownHeight = size * 0.12;
  const loopRadius = size * 0.13;

  // Ángulo de la manecilla (0 a 360 grados)
  const needleAngle = fillProgress * 360;

  // Coordenadas para el sector fijo marcado a las 2 (0° a 60° - de las 12:00 a las 2:00)
  // En SVG: 0° está a las 12:00 (arriba). Ángulo 60° está a las 2:00.
  const wedgeAngleRad = (60 * Math.PI) / 180;
  const wedgeX = center + radius * Math.sin(wedgeAngleRad);
  const wedgeY = center - radius * Math.cos(wedgeAngleRad);
  const wedgePath = `M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${wedgeX} ${wedgeY} Z`;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${entrance}) rotate(${wobbleDeg}deg)`,
        transformOrigin: 'center center',
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
          {/* Sombra sutil de precisión técnica */}
          <filter id={`stopwatch-shadow-${mode}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy={mode === 'hero' ? 8 : 2}
              stdDeviation={mode === 'hero' ? 12 : 3}
              floodColor="rgba(217, 78, 52, 0.20)"
            />
          </filter>
        </defs>

        {/* 1. Anilla y Pulsador Superior (Corona a las 12:00) */}
        <g stroke="#141413" fill="none" strokeWidth={Math.max(1.5, size * 0.038)}>
          {/* Anilla clásica de cronómetro */}
          <circle
            cx={center}
            cy={center - radius - crownHeight - loopRadius * 0.5}
            r={loopRadius}
            stroke="#141413"
          />
          {/* Pulsador central */}
          <rect
            x={center - crownWidth / 2}
            y={center - radius - crownHeight * 0.9}
            width={crownWidth}
            height={crownHeight * 0.9}
            rx={crownHeight * 0.25}
            fill="#FFFFFF"
          />
          {/* Pulsador secundario oblicuo a las 10:00 */}
          <line
            x1={center - radius * 0.65}
            y1={center - radius * 0.65}
            x2={center - radius * 0.85}
            y2={center - radius * 0.85}
            strokeLinecap="round"
            strokeWidth={Math.max(1.5, size * 0.045)}
          />
        </g>

        {/* 2. Cuerpo / Bisel Principal */}
        <circle
          cx={center}
          cy={center}
          r={radius + size * 0.04}
          fill="#FFFFFF"
          stroke="#141413"
          strokeWidth={Math.max(2, size * 0.045)}
          filter={`url(#stopwatch-shadow-${mode})`}
        />

        {/* 3. Área Fija Marcada a las 2 (Rasgo de Identidad en Terracota) */}
        {/* Sector permanente entre las 12h y las 2h (aproximadamente 60 grados) */}
        <path
          d={wedgePath}
          fill="rgba(217, 78, 52, 0.26)"
          stroke="#D94E34"
          strokeWidth={Math.max(1, size * 0.02)}
          strokeLinejoin="round"
        />

        {/* 4. Marcas de cuadrante (12 horas / 60 segundos) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
          (deg) => {
            const isCardinal = deg % 90 === 0;
            const isTwoOClock = deg === 60;
            const tickLength = isCardinal
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
            const r2 = r1 - tickLength;
            const rad = (deg * Math.PI) / 180;

            const x1 = center + r1 * Math.sin(rad);
            const y1 = center - r1 * Math.cos(rad);
            const x2 = center + r2 * Math.sin(rad);
            const y2 = center - r2 * Math.cos(rad);

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
          }
        )}

        {/* 5. Arco Dinámico del Temporizador de 1 Minuto (Progreso Terracota) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#D94E34"
          strokeWidth={Math.max(2.5, size * 0.065)}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: 'stroke-dashoffset 0.05s linear',
          }}
        />

        {/* Destello / Flash de reset a blanco tras la calibración */}
        {flashOpacity > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="#FFFFFF"
            opacity={flashOpacity}
          />
        )}

        {/* 6. Manecilla Central del Cronómetro */}
        <g transform={`rotate(${needleAngle} ${center} ${center})`}>
          {/* Cuerpo afilado de la aguja */}
          <line
            x1={center}
            y1={center + size * 0.08}
            x2={center}
            y2={center - radius + size * 0.03}
            stroke="#141413"
            strokeWidth={Math.max(1.8, size * 0.04)}
            strokeLinecap="round"
          />
          {/* Punta terracota de alta precisión */}
          <line
            x1={center}
            y1={center - radius * 0.6}
            x2={center}
            y2={center - radius + size * 0.02}
            stroke="#D94E34"
            strokeWidth={Math.max(2, size * 0.045)}
            strokeLinecap="round"
          />
        </g>

        {/* 7. Pivote central */}
        <circle
          cx={center}
          cy={center}
          r={Math.max(2.5, size * 0.06)}
          fill="#141413"
        />
        <circle
          cx={center}
          cy={center}
          r={Math.max(1.2, size * 0.025)}
          fill="#D94E34"
        />
      </svg>
    </div>
  );
};
