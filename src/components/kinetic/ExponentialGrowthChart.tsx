import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';

export interface ExponentialGrowthChartProps {
  startFrame?: number;
  width?: number;
  height?: number;
  accentColor?: string;
  showTitle?: boolean;
  multiplierMax?: number;
  peakBadgeText?: string;
  latentLabel?: string;
  unit?: string;
  xLabels?: string[];
}

/**
 * ExponentialGrowthChart — Gráfico Cinético de Crecimiento Exponencial (Interés Compuesto)
 * Estilo @nuncateloexplicaron + @eldatomanda:
 * - Dibuja en tiempo real la curva matemática del interés compuesto.
 * - Sincronizado exactamente con el audio de Leo.
 */
export const ExponentialGrowthChart: React.FC<ExponentialGrowthChartProps> = ({
  startFrame = 0,
  width = 888,
  height = 520,
  accentColor = '#D94E34',
  showTitle = false,
  multiplierMax = 37.78,
  peakBadgeText = '+37.78x MEJORA TOTAL',
  latentLabel = 'FASE LATENTE (EL CAMBIO ES INVISIBLE)',
  unit = 'x',
  xLabels,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // 1. Entrada de la tarjeta contenedora
  const containerEntrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Progreso continuo y ultra-suave de la curva (ampliado a 280 frames para máxima fluidez)
  const rawProgress = interpolate(
    localFrame,
    [35, 305],
    [0, 1],
    CLAMP_EXTRAPOLATION
  );
  // Curva de aceleración continua suave (sin saltos lineales bruscos ni parpadeos)
  const curveProgress = Math.pow(rawProgress, 1.45);

  // Coordenadas internas del área del gráfico (con márgenes técnicos)
  const padLeft = 80;
  const padRight = 50;
  const padTop = 60;
  const padBottom = 70;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // 3. Generar trayectoria matemática continua de alta resolución (200 muestras)
  const sampleCount = 200;
  const points: { x: number; y: number; val: number; day: number }[] = [];

  const maxVal = multiplierMax;
  const baseVal = 1.0;
  const growthRate = Math.pow(maxVal / baseVal, 1 / 365);

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const day = t * 365;
    const multiplier = baseVal * Math.pow(growthRate, day);
    const normY = (multiplier - baseVal) / (maxVal - baseVal);

    const px = padLeft + t * plotWidth;
    const py = padTop + plotHeight - normY * plotHeight;
    points.push({ x: px, y: py, val: multiplier, day });
  }

  // Construir el path SVG de la curva continua
  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Evolución del trazo con evolvePath
  const evolved = evolvePath(curveProgress, pathD);

  // 4. Posición EXACTA continua del círculo/spark (sin Math.floor ni saltos escalonados)
  const currentT = curveProgress;
  const currentDay = currentT * 365;
  const currentMultiplier = baseVal * Math.pow(growthRate, currentDay);
  const currentNormY = (currentMultiplier - baseVal) / (maxVal - baseVal);
  const currentPt = {
    x: padLeft + currentT * plotWidth,
    y: padTop + plotHeight - currentNormY * plotHeight,
    val: currentMultiplier,
    day: Math.round(currentDay),
  };

  // Área sombreada bajo la curva (gradiente)
  const areaD = `${pathD} L ${padLeft + plotWidth} ${padTop + plotHeight} L ${padLeft} ${padTop + plotHeight} Z`;

  // Rebote del badge al coronar el pico
  const peakBounce = spring({
    frame: Math.max(0, localFrame - 275),
    fps,
    config: SPRING_SNAPPY,
  });

  const resolvedXLabels =
    xLabels ?? ['DÍA 0', 'DÍA 100', 'DÍA 200', 'DÍA 300', 'DÍA 365'];

  const yLevels = [
    Math.round(maxVal * 0.25),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.75),
    maxVal,
  ];

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#FEF9C3',
        border: '2px solid #141413',
        borderRadius: 24,
        padding: '20px 24px',
        boxShadow: '0 16px 44px rgba(20, 20, 19, 0.06)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        opacity: containerEntrance,
        transform: `translateY(${(1 - containerEntrance) * 20}px)`,
      }}
    >
      {/* 1. Barra de título opcional (desactivada por defecto por regla Anti-Clutter) */}
      {showTitle ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1.5px solid rgba(20, 20, 19, 0.12)',
            paddingBottom: 12,
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: accentColor,
              }}
            />
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: '#141413',
                letterSpacing: '-0.01em',
              }}
            >
              Crecimiento Exponencial (1.01³⁶⁵)
            </span>
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              color: accentColor,
              backgroundColor: 'rgba(217, 78, 52, 0.08)',
              padding: '3px 10px',
              borderRadius: 6,
            }}
          >
            DÍA {currentPt.day} / 365 · {currentPt.val.toFixed(2)}x
          </div>
        </div>
      ) : null}

      {/* 2. Capa SVG: Gráfico, Rejilla, Ejes y Curva Dinámica */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          {/* Gradiente vertical para el relleno bajo la curva */}
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.30" />
            <stop offset="70%" stopColor={accentColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Patrón de puntos técnicos de fondo */}
          <pattern id="chartDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#E5E2DC" />
          </pattern>
        </defs>

        {/* Fondo con microcuadrícula técnica */}
        <rect
          x={padLeft}
          y={padTop}
          width={plotWidth}
          height={plotHeight}
          fill="url(#chartDots)"
          opacity={0.7}
        />

        {/* Líneas de guía horizontales de valor */}
        {yLevels.map((lvl) => {
          const norm = (lvl - baseVal) / (maxVal - baseVal);
          const yPos = padTop + plotHeight - norm * plotHeight;
          return (
            <g key={lvl}>
              <line
                x1={padLeft}
                y1={yPos}
                x2={padLeft + plotWidth}
                y2={yPos}
                stroke="rgba(45, 43, 40, 0.10)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <text
                x={padLeft - 12}
                y={yPos + 4}
                fontFamily="'JetBrains Mono', monospace"
                fontSize={12}
                fontWeight={700}
                fill={lvl === maxVal ? accentColor : '#94A3B8'}
                textAnchor="end"
              >
                {lvl}{unit}
              </text>
            </g>
          );
        })}

        {/* Línea base horizontal */}
        <line
          x1={padLeft}
          y1={padTop + plotHeight}
          x2={padLeft + plotWidth}
          y2={padTop + plotHeight}
          stroke="#94A3B8"
          strokeWidth={2}
        />
        <text
          x={padLeft - 12}
          y={padTop + plotHeight + 4}
          fontFamily="'JetBrains Mono', monospace"
          fontSize={12}
          fontWeight={700}
          fill="#94A3B8"
          textAnchor="end"
        >
          {baseVal}{unit}
        </text>

        {/* Etiquetas del eje X */}
        {resolvedXLabels.map((lbl, idx) => {
          const frac = idx / Math.max(1, resolvedXLabels.length - 1);
          const xPos = padLeft + frac * plotWidth;
          return (
            <text
              key={lbl}
              x={xPos}
              y={padTop + plotHeight + 24}
              fontFamily="'JetBrains Mono', monospace"
              fontSize={11}
              fontWeight={700}
              fill="#64748B"
              textAnchor={idx === 0 ? 'start' : idx === resolvedXLabels.length - 1 ? 'end' : 'middle'}
            >
              {lbl}
            </text>
          );
        })}

        {/* Relleno translúcido bajo la curva */}
        <clipPath id="progressClip">
          <rect
            x={padLeft}
            y={padTop}
            width={plotWidth * curveProgress}
            height={plotHeight}
          />
        </clipPath>
        <path
          d={areaD}
          fill="url(#curveGradient)"
          clipPath="url(#progressClip)"
        />

        {/* Línea guía atenuada de toda la trayectoria completa */}
        <path
          d={pathD}
          stroke="rgba(217, 78, 52, 0.15)"
          strokeWidth={2}
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Curva exponencial activa trazada en tiempo real */}
        <path
          d={pathD}
          stroke={accentColor}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
          fill="none"
        />

        {/* Marcador / Spark de luz en la punta de la curva */}
        {curveProgress > 0.02 && (
          <g transform={`translate(${currentPt.x}, ${currentPt.y})`}>
            <circle cx={0} cy={0} r={16} fill={accentColor} opacity={0.25} />
            <circle cx={0} cy={0} r={7} fill={accentColor} />
            <circle cx={0} cy={0} r={3} fill="#FFFFFF" />
          </g>
        )}
      </svg>

      {/* 3. Badge Pop de Victoria Exponencial al llegar a la cima */}
      {curveProgress > 0.92 && (
        <div
          style={{
            position: 'absolute',
            right: 48,
            top: 76,
            backgroundColor: accentColor,
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 12,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 0.5,
            boxShadow: '0 8px 24px rgba(217, 78, 52, 0.40)',
            opacity: peakBounce,
            transform: `scale(${peakBounce})`,
            transformOrigin: 'right top',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>🚀</span>
          <span>{peakBadgeText}</span>
        </div>
      )}

      {/* 4. Etiqueta informativa del "Valle de Potencial Latente" */}
      <div
        style={{
          position: 'absolute',
          left: 104,
          top: padTop + 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: '#94A3B8',
          letterSpacing: 0.5,
          backgroundColor: '#F8F7F4',
          padding: '2px 8px',
          borderRadius: 4,
          border: '1px solid #E5E2DC',
        }}
      >
        {latentLabel}
      </div>
    </div>
  );
};
