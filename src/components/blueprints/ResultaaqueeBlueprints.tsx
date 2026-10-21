import React, { useMemo } from 'react';
import { evolvePath } from '@remotion/paths';
import { noise2D } from '@remotion/noise';
import { interpolate as flubberInterpolate } from 'flubber';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  BLUEPRINT_THEMES,
  type BlueprintModeId,
  CLAMP_EXTRAPOLATION,
  MOTION_EASING,
  SAFE_ZONE,
  SPRING_SNAPPY,
} from '../../theme/motion';

/* ============================================================================
 * 1. BLUEPRINT SURFACE — Los 5 Modos de Escenario Persistente (Zero-Box)
 * ========================================================================== */
export interface BlueprintSurfaceProps {
  mode?: BlueprintModeId;
  /** Desplazamiento X/Y de la cámara para paralaje sutil de la cuadrícula */
  cameraX?: number;
  cameraY?: number;
  /** Mostrar micropartículas flotantes en suspensión (ref2, ref3, ref4) */
  showParticles?: boolean;
  /** Mostrar bordes laterales de papel rasgado analógico (ref5) */
  showTornEdges?: boolean;
  children?: React.ReactNode;
}

export const BlueprintSurface: React.FC<BlueprintSurfaceProps> = ({
  mode = 'DARK_CAD_XRAY',
  cameraX = 0,
  cameraY = 0,
  showParticles = true,
  showTornEdges = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const theme = BLUEPRINT_THEMES[mode];

  // 18 micropartículas deterministas con @remotion/noise
  const particles = React.useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      baseX: ((i * 197) % 920) + 80,
      baseY: ((i * 311) % 1500) + 140,
      size: (i % 3) + 2,
      alpha: ((i % 4) + 1) * 0.08,
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.surface,
        overflow: 'hidden',
      }}
    >
      {/* Iluminación radial atmosférica detrás del objeto central */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 48%, ${theme.surfaceRadialGlow} 0%, ${theme.surface} 72%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Cuadrícula técnica milimetrada de doble nivel (Mayor 96px + Menor 24px) */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <defs>
          <pattern
            id={`minor-grid-${mode}`}
            width={24}
            height={24}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${-cameraX * 0.25}, ${-cameraY * 0.25})`}
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={theme.gridMinor}
              strokeWidth={1}
            />
          </pattern>
          <pattern
            id={`major-grid-${mode}`}
            width={96}
            height={96}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${-cameraX * 0.25}, ${-cameraY * 0.25})`}
          >
            <rect width={96} height={96} fill={`url(#minor-grid-${mode})`} />
            <path
              d="M 96 0 L 0 0 0 96"
              fill="none"
              stroke={theme.gridMajor}
              strokeWidth={1.5}
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={`url(#major-grid-${mode})`} />

        {/* Micropartículas en suspensión (Ref 2, Ref 3, Ref 4) */}
        {showParticles &&
          particles.map((p) => {
            const dx = noise2D(`px-${p.id}`, frame * 0.006, p.id) * 28;
            const dy = noise2D(`py-${p.id}`, p.id, frame * 0.006) * 28;
            return (
              <circle
                key={p.id}
                cx={p.baseX + dx}
                cy={p.baseY + dy}
                r={p.size}
                fill={theme.ink}
                opacity={p.alpha}
              />
            );
          })}

        {/* Bordes laterales de papel de laboratorio rasgado (Ref 5 — Palomas) */}
        {(showTornEdges || mode === 'CHRONO_OSCILLOSCOPE') && (
          <>
            <path
              d="M 0 0 L 22 0 L 18 180 L 26 360 L 16 540 L 25 720 L 19 900 L 27 1080 L 17 1260 L 24 1440 L 18 1620 L 25 1800 L 20 1920 L 0 1920 Z"
              fill="#0C0B0A"
            />
            <path
              d="M 1080 0 L 1058 0 L 1062 180 L 1054 360 L 1064 540 L 1055 720 L 1061 900 L 1053 1080 L 1063 1260 L 1056 1440 L 1062 1620 L 1055 1800 L 1060 1920 L 1080 1920 Z"
              fill="#0C0B0A"
            />
          </>
        )}
      </svg>

      {children}
    </AbsoluteFill>
  );
};

/* ============================================================================
 * 2. VECTOR SELECTION BOX — Marco de Selección Figma/Illustrator (Ref 2 & Ref 3)
 * ========================================================================== */
export interface VectorSelectionBoxProps {
  children: React.ReactNode;
  color?: string;
  /** Mostrar el mástil superior de rotación con nodo circular */
  showRotationStem?: boolean;
  /** Activar o desactivar el marco sin cambiar el layout interno */
  active?: boolean;
  padding?: string;
}

export const VectorSelectionBox: React.FC<VectorSelectionBoxProps> = ({
  children,
  color = '#3B82F6',
  showRotationStem = true,
  active = true,
  padding = '2px 10px',
}) => {
  const handleSize = 8;
  const half = handleSize / 2;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding,
        margin: '0 2px',
        border: active ? `2.5px solid ${color}` : '2.5px solid transparent',
        backgroundColor: active ? 'rgba(59, 130, 246, 0.10)' : 'transparent',
        boxSizing: 'border-box',
      }}
    >
      {children}

      {active && (
        <>
          {/* Mástil superior de rotación (estilo Illustrator/Figma) */}
          {showRotationStem && (
            <span
              style={{
                position: 'absolute',
                top: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${color}`,
                }}
              />
              <span
                style={{
                  width: 2,
                  height: 7,
                  backgroundColor: color,
                }}
              />
            </span>
          )}

          {/* 4 Nodos cuadrados de anclaje en las esquinas */}
          {[
            { top: -half - 1, left: -half - 1 },
            { top: -half - 1, right: -half - 1 },
            { bottom: -half - 1, left: -half - 1 },
            { bottom: -half - 1, right: -half - 1 },
          ].map((pos, idx) => (
            <span
              key={idx}
              style={{
                position: 'absolute',
                ...pos,
                width: handleSize,
                height: handleSize,
                backgroundColor: '#FFFFFF',
                border: `2px solid ${color}`,
                pointerEvents: 'none',
              }}
            />
          ))}
        </>
      )}
    </span>
  );
};

/* ============================================================================
 * 3. CORNER HUD TELEMETRY — Telemetría de Esquina Superior (Ref 1)
 * ========================================================================== */
export interface CornerHudTelemetryProps {
  leftLabel?: string;
  leftValue?: string | number;
  rightLabel?: string;
  rightValue?: string | number;
  accentColor?: string;
  textColor?: string;
}

export const CornerHudTelemetry: React.FC<CornerHudTelemetryProps> = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  accentColor = '#FBBF24',
  textColor = '#FFFFFF',
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 88,
        left: SAFE_ZONE.minSafeX,
        right: SAFE_ZONE.horizontalPaddingPx,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none',
        zIndex: 60,
        fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      }}
    >
      {leftLabel ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.68)',
              textTransform: 'uppercase',
            }}
          >
            {leftLabel}
          </span>
          <span
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: accentColor,
              lineHeight: 1.05,
            }}
          >
            {leftValue}
          </span>
        </div>
      ) : (
        <div />
      )}

      {rightLabel ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.68)',
              textTransform: 'uppercase',
            }}
          >
            {rightLabel}
          </span>
          <span
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: textColor,
              lineHeight: 1.05,
            }}
          >
            {rightValue}
          </span>
        </div>
      ) : null}
    </div>
  );
};

/* ============================================================================
 * 4. LEADER LINE CALLOUT — Cota con Línea Guía Quebrada (Ref 2, Ref 3, Ref 4)
 * ========================================================================== */
export interface LeaderLineCalloutProps {
  /** Punto de anclaje sobre el objeto (coordenadas dentro del contenedor) */
  anchorX: number;
  anchorY: number;
  /** Punto intermedio del codo de la línea guía */
  elbowX: number;
  elbowY: number;
  /** Punto final donde se apoya el texto */
  labelX: number;
  labelY: number;
  title: string;
  subtitle?: string;
  color?: string;
  enterFrame?: number;
  align?: 'left' | 'right';
}

export const LeaderLineCallout: React.FC<LeaderLineCalloutProps> = ({
  anchorX,
  anchorY,
  elbowX,
  elbowY,
  labelX,
  labelY,
  title,
  subtitle,
  color = '#F59E0B',
  enterFrame = 0,
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  const progress = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  const pathD = `M ${anchorX} ${anchorY} L ${elbowX} ${elbowY} L ${labelX} ${labelY}`;
  const evolved = evolvePath(
    interpolate(progress, [0, 1], [0, 1], CLAMP_EXTRAPOLATION),
    pathD
  );

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <circle
          cx={anchorX}
          cy={anchorY}
          r={5 * progress}
          fill={color}
        />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: align === 'left' ? labelX + 12 : labelX - 340,
          top: labelY - 22,
          width: 328,
          textAlign: align,
          opacity: progress,
          transform: `translateY(${interpolate(progress, [0, 1], [8, 0], CLAMP_EXTRAPOLATION)}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
            fontSize: 30,
            fontWeight: 700,
            color,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: 'italic',
              fontSize: 24,
              color: 'rgba(255,255,255,0.72)',
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 5. DIMENSION RULER — Regla de Acotación de Ingeniería (Ref 2 & Ref 3)
 * ========================================================================== */
export interface DimensionRulerProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  color?: string;
  enterFrame?: number;
}

export const DimensionRuler: React.FC<DimensionRulerProps> = ({
  x1,
  y1,
  x2,
  y2,
  label,
  color = '#F59E0B',
  enterFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const isHorizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
  const pillWidth = Math.max(136, label.length * 15 + 36);

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'visible',
        pointerEvents: 'none',
        opacity: progress,
      }}
    >
      {/* Topes perpendiculares en los extremos */}
      {isHorizontal ? (
        <>
          <line x1={x1} y1={y1 - 12} x2={x1} y2={y1 + 12} stroke={color} strokeWidth={2.5} />
          <line x1={x2} y1={y2 - 12} x2={x2} y2={y2 + 12} stroke={color} strokeWidth={2.5} />
        </>
      ) : (
        <>
          <line x1={x1 - 12} y1={y1} x2={x1 + 12} y2={y1} stroke={color} strokeWidth={2.5} />
          <line x1={x2 - 12} y1={y2} x2={x2 + 12} y2={y2} stroke={color} strokeWidth={2.5} />
        </>
      )}

      {/* Línea principal de cota */}
      <line
        x1={midX - (midX - x1) * progress}
        y1={midY - (midY - y1) * progress}
        x2={midX + (x2 - midX) * progress}
        y2={midY + (y2 - midY) * progress}
        stroke={color}
        strokeWidth={2.5}
      />

      {/* Etiqueta central de medición con ancho auto-adaptativo */}
      <g transform={`translate(${midX}, ${midY})`}>
        <rect
          x={-pillWidth / 2}
          y={-22}
          width={pillWidth}
          height={44}
          rx={8}
          fill="#111111"
          stroke={color}
          strokeWidth={2}
        />
        <text
          x={0}
          y={8}
          textAnchor="middle"
          fill={color}
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={22}
          fontWeight={700}
        >
          {label}
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * 6. HYPOTHESIS SCOREBOARD — Marcador Persistente de Hipótesis (Ref 4: [2][1][0])
 * ========================================================================== */
export interface HypothesisOption {
  value: string;
  status: 'unknown' | 'neutral' | 'discarded' | 'winner';
}

export interface HypothesisScoreboardProps {
  options: HypothesisOption[];
  top?: number;
}

export const HypothesisScoreboard: React.FC<HypothesisScoreboardProps> = ({
  options,
  top = 148,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        pointerEvents: 'none',
        zIndex: 70,
      }}
    >
      {options.map((opt, idx) => {
        const isWinner = opt.status === 'winner';
        const isDiscarded = opt.status === 'discarded';
        return (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: 86,
              height: 92,
              borderRadius: 14,
              backgroundColor: isWinner ? 'rgba(34, 197, 94, 0.22)' : '#1B2630',
              border: `2.5px solid ${
                isWinner ? '#22C55E' : isDiscarded ? '#475569' : '#334155'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 48,
              fontWeight: 700,
              color: isWinner
                ? '#4ADE80'
                : isDiscarded
                  ? '#94A3B8'
                  : '#F8FAFC',
            }}
          >
            {opt.status === 'unknown' ? '?' : opt.value}

            {/* Tachado diagonal rosa/coral cuando se descarta una hipótesis (Ref 4) */}
            {isDiscarded && (
              <svg
                width={86}
                height={92}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                <line
                  x1={16}
                  y1={76}
                  x2={70}
                  y2={16}
                  stroke="#EC4899"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================================
 * 7. EXPLODED LAYER STACK — Vista Explosionada 2.5D en Capas (Ref 2)
 * ========================================================================== */
export interface ExplodedLayerStackProps {
  topLayer: React.ReactNode;
  bottomLayer: React.ReactNode;
  topLabel?: string;
  bottomLabel?: string;
  /** Progreso de separación 0 (plano 2D) -> 1 (inclinado 2.5D y separado) */
  separationProgress: number;
  width?: number;
  height?: number;
}

export const ExplodedLayerStack: React.FC<ExplodedLayerStackProps> = ({
  topLayer,
  bottomLayer,
  topLabel = 'lo que ves',
  bottomLabel = 'lo que tocas',
  separationProgress,
  width = 760,
  height = 420,
}) => {
  const p = interpolate(separationProgress, [0, 1], [0, 1], CLAMP_EXTRAPOLATION);
  const tiltX = interpolate(p, [0, 1], [0, 48], CLAMP_EXTRAPOLATION);
  const rotateZ = interpolate(p, [0, 1], [0, -14], CLAMP_EXTRAPOLATION);
  const topOffsetY = interpolate(p, [0, 1], [0, -110], CLAMP_EXTRAPOLATION);
  const bottomOffsetY = interpolate(p, [0, 1], [0, 110], CLAMP_EXTRAPOLATION);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height: height + 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Líneas verticales de proyección conectando ambas capas */}
      <svg
        width={width}
        height={height + 260}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: p,
        }}
      >
        {[
          { x: 110, yTop: 150, yBot: 390 },
          { x: width - 110, yTop: 120, yBot: 360 },
          { x: 180, yTop: 310, yBot: 540 },
          { x: width - 160, yTop: 290, yBot: 520 },
        ].map((line, idx) => (
          <line
            key={idx}
            x1={line.x}
            y1={line.yTop}
            x2={line.x}
            y2={line.yBot}
            stroke="rgba(245, 158, 11, 0.55)"
            strokeWidth={2}
            strokeDasharray="6 6"
          />
        ))}
      </svg>

      {/* Capa Inferior (Lo que tocas / Regiones ocultas) */}
      <div
        style={{
          position: 'absolute',
          width,
          height,
          transform: `translateY(${bottomOffsetY}px) perspective(1400px) rotateX(${tiltX}deg) rotateZ(${rotateZ}deg)`,
          transformStyle: 'preserve-3d',
          opacity: interpolate(p, [0, 0.25, 1], [0, 0.85, 1], CLAMP_EXTRAPOLATION),
        }}
      >
        {bottomLayer}
      </div>

      {/* Capa Superior (Lo que ves / Interfaz superficial) */}
      <div
        style={{
          position: 'absolute',
          width,
          height,
          transform: `translateY(${topOffsetY}px) perspective(1400px) rotateX(${tiltX}deg) rotateZ(${rotateZ}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {topLayer}
      </div>

      {/* Etiquetas laterales de capa sin solapamiento */}
      {p > 0.2 && (
        <>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 6,
              opacity: p,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: 'italic',
              fontSize: 28,
              color: '#7DD3FC',
            }}
          >
            ← {topLabel}
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 10,
              opacity: p,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: 'italic',
              fontSize: 28,
              color: '#FDA4AF',
            }}
          >
            ← {bottomLabel}
          </div>
        </>
      )}
    </div>
  );
};

/* ============================================================================
 * 8. DATASET TERMINAL DRAWER — Cajón de Corpus / Telemetría en Vivo (Ref 2)
 * ========================================================================== */
export interface DatasetRow {
  token: string;
  countLabel: string;
  probabilityPct: number;
  highlight?: boolean;
  rejected?: boolean;
}

export interface DatasetTerminalDrawerProps {
  filename: string;
  subtitle: string;
  rows: DatasetRow[];
  enterFrame?: number;
}

export const DatasetTerminalDrawer: React.FC<DatasetTerminalDrawerProps> = ({
  filename,
  subtitle,
  rows,
  enterFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  return (
    <div
      style={{
        width: 820,
        borderRadius: 16,
        backgroundColor: '#161618',
        border: '2px solid #2C2C30',
        padding: '22px 28px',
        fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [32, 0], CLAMP_EXTRAPOLATION)}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px solid #27272A',
          paddingBottom: 12,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 700, color: '#F4F4F5' }}>
          {filename}
        </span>
        <span style={{ fontSize: 22, color: '#A1A1AA' }}>{subtitle}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((row, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderRadius: 10,
              backgroundColor: row.highlight
                ? 'rgba(245, 158, 11, 0.16)'
                : row.rejected
                  ? 'rgba(244, 63, 94, 0.12)'
                  : '#1F1F23',
              border: `1.5px solid ${
                row.highlight
                  ? '#F59E0B'
                  : row.rejected
                    ? '#F43F5E'
                    : 'transparent'
              }`,
            }}
          >
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: row.rejected ? '#FB7185' : '#FFFFFF',
                textDecoration: row.rejected ? 'line-through' : 'none',
              }}
            >
              {row.token}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ fontSize: 24, color: '#A1A1AA' }}>
                {row.countLabel}
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: row.highlight
                    ? '#FBBF24'
                    : row.rejected
                      ? '#F43F5E'
                      : '#E4E4E7',
                  minWidth: 76,
                  textAlign: 'right',
                }}
              >
                {row.probabilityPct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 9. CHRONO STROBE & LIVE TELEMETRY GRAPH — Cronofotografía y Osciloscopio (Ref 5)
 * ========================================================================== */
export interface TargetReticleProps {
  x: number;
  y: number;
  opacity?: number;
  color?: string;
  label?: string;
}

export const TargetReticle: React.FC<TargetReticleProps> = ({
  x,
  y,
  opacity = 1,
  color = '#EF4444',
  label,
}) => {
  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      <circle cx={0} cy={0} r={34} fill="none" stroke={color} strokeWidth={2.5} />
      <circle cx={0} cy={0} r={16} fill="none" stroke={color} strokeWidth={2} />
      <line x1={-48} y1={0} x2={48} y2={0} stroke={color} strokeWidth={2} />
      <line x1={0} y1={-48} x2={0} y2={48} stroke={color} strokeWidth={2} />
      {label && (
        <text
          x={0}
          y={-56}
          textAnchor="middle"
          fill={color}
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={24}
          fontWeight={700}
        >
          {label}
        </text>
      )}
    </g>
  );
};

export interface LiveTelemetryGraphProps {
  /** Progreso 0..1 del trazado de las curvas */
  progress: number;
  /** Curva primaria escalonada o discreta (ej. CABEZA en rojo) */
  steppedPathD: string;
  /** Curva secundaria continua (ej. CUERPO en amarillo) */
  continuousPathD: string;
  /** Coordenada X/Y del punto actual para bajar la línea punteada vertical */
  trackerX?: number;
  trackerTopY?: number;
  trackerBottomY?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export const LiveTelemetryGraph: React.FC<LiveTelemetryGraphProps> = ({
  progress,
  steppedPathD,
  continuousPathD,
  trackerX,
  trackerTopY,
  trackerBottomY,
  primaryLabel = 'CABEZA (ESTÁTICA A TRAMOS)',
  secondaryLabel = 'CUERPO (CONTINUO)',
}) => {
  const p = interpolate(progress, [0, 1], [0.01, 1], CLAMP_EXTRAPOLATION);
  const evolvedStepped = evolvePath(p, steppedPathD);
  const evolvedContinuous = evolvePath(p, continuousPathD);

  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
    >
      {/* Curva continua de referencia (Amarillo) */}
      <path
        d={continuousPathD}
        fill="none"
        stroke="#FACC15"
        strokeWidth={3.5}
        strokeDasharray={evolvedContinuous.strokeDasharray}
        strokeDashoffset={evolvedContinuous.strokeDashoffset}
        opacity={0.85}
      />

      {/* Curva escalonada principal (Rojo) */}
      <path
        d={steppedPathD}
        fill="none"
        stroke="#EF4444"
        strokeWidth={5}
        strokeDasharray={evolvedStepped.strokeDasharray}
        strokeDashoffset={evolvedStepped.strokeDashoffset}
      />

      {/* Línea punteada vertical que conecta el objeto superior con el escalón inferior */}
      {trackerX !== undefined &&
        trackerTopY !== undefined &&
        trackerBottomY !== undefined && (
          <>
            <line
              x1={trackerX}
              y1={trackerTopY}
              x2={trackerX}
              y2={trackerBottomY}
              stroke="#EF4444"
              strokeWidth={2.5}
              strokeDasharray="8 8"
            />
            <circle cx={trackerX} cy={trackerBottomY} r={7} fill="#EF4444" />
          </>
        )}

      {/* Leyenda de telemetría */}
      <g transform="translate(96, 1540)">
        <rect x={0} y={0} width={18} height={18} rx={4} fill="#EF4444" />
        <text
          x={28}
          y={16}
          fill="#F5F5F4"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={22}
          fontWeight={700}
        >
          {primaryLabel}
        </text>

        <rect x={440} y={0} width={18} height={18} rx={4} fill="#FACC15" />
        <text
          x={468}
          y={16}
          fill="#D6D3D1"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={22}
          fontWeight={600}
        >
          {secondaryLabel}
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * 10. HERO PROP STAGE — Art-First 3D CAD Illustration Rig + Flubber Morphing
 * ========================================================================== */
const CAD_CIRCLE_PATH =
  'M 0 -290 A 290 290 0 1 1 0 290 A 290 290 0 1 1 0 -290 Z';
const CAD_OCTAGON_PATH =
  'M -120 -290 L 120 -290 L 290 -120 L 290 120 L 120 290 L -120 290 L -290 120 L -290 -120 Z';

export interface HeroPropStageProps {
  /** Ruta dentro de public/, ej: 'assets/props/hero-scene1-finger-layers.png' */
  src: string;
  /** Centro X en el lienzo 1080x1920 */
  x?: number;
  /** Centro Y en el lienzo 1080x1920 */
  y?: number;
  /** Tamaño del prop (ancho y alto en px) */
  size?: number;
  /** Fotograma local de entrada */
  enterFrame?: number;
  /** Fotograma local actual de la escena */
  localFrame: number;
  /** Color primario de acento técnico (#38BDF8, #F59E0B, #22C55E, #F43F5E) */
  accentColor?: string;
  /** Color secundario de pulso */
  secondaryColor?: string;
  /** Mostrar barrido láser de escaneo Rayos X sobre la ilustración */
  scanBeam?: boolean;
  /** Mostrar anillos concéntricos de pulso ultrasónico tras la ilustración */
  pulseRings?: boolean;
  /** Semilla de ruido Perlin (@remotion/noise) para levitación orgánica 2.5D */
  noiseSeed?: string;
  /** Etiqueta técnica opcional en la esquina del marco CAD */
  cadTag?: string;
}

export const HeroPropStage: React.FC<HeroPropStageProps> = ({
  src,
  x = 540,
  y = 660,
  size = 660,
  enterFrame = 0,
  localFrame,
  accentColor = '#38BDF8',
  secondaryColor = '#F59E0B',
  scanBeam = true,
  pulseRings = true,
  noiseSeed = 'hero-prop',
  cadTag,
}) => {
  const { fps } = useVideoConfig();

  const entrySpring = spring({
    frame: Math.max(0, localFrame - enterFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  const entryEased = interpolate(
    localFrame - enterFrame,
    [0, 26],
    [0, 1],
    {
      ...CLAMP_EXTRAPOLATION,
      easing: MOTION_EASING.quartOut,
    },
  );

  // Levitación orgánica determinista con @remotion/noise (Regla 16/27)
  const floatY = noise2D(`${noiseSeed}-y`, localFrame * 0.018, 0) * 7;
  const floatX = noise2D(`${noiseSeed}-x`, 0, localFrame * 0.015) * 4;
  const floatRotate = noise2D(`${noiseSeed}-r`, localFrame * 0.012, 1) * 1.4;

  // Interpolador de forma vectorial con Flubber (Círculo <-> Octágono CAD)
  const morphInterpolator = useMemo(
    () => flubberInterpolate(CAD_CIRCLE_PATH, CAD_OCTAGON_PATH, { maxSegmentLength: 12 }),
    [],
  );

  const morphT = interpolate(
    Math.sin(localFrame * 0.045),
    [-1, 1],
    [0, 1],
    CLAMP_EXTRAPOLATION,
  );
  const morphedCadPath = morphInterpolator(morphT);

  const scale = interpolate(entrySpring, [0, 1], [0.86, 1], CLAMP_EXTRAPOLATION);
  const translateY =
    interpolate(entryEased, [0, 1], [36, 0], CLAMP_EXTRAPOLATION) + floatY;

  // Posición del haz de escaneo Rayos X
  const scanY = interpolate(
    (localFrame * 5) % 220,
    [0, 110, 220],
    [40, size - 40, 40],
    CLAMP_EXTRAPOLATION,
  );

  const half = size / 2;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - half,
        top: y - half,
        width: size,
        height: size,
        opacity: entrySpring,
        transform: `translate3d(${floatX}px, ${translateY}px, 0) scale(${scale}) rotate(${floatRotate}deg)`,
        pointerEvents: 'none',
        zIndex: 25,
      }}
    >
      {/* Anillos de contorno Flubber + Ondas concéntricas de fondo */}
      <svg
        width={size}
        height={size}
        viewBox={`${-half} ${-half} ${size} ${size}`}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        {/* Resplandor técnico radial sutil para integrar el objeto con la cuadrícula */}
        <defs>
          <radialGradient id={`stage-glow-${noiseSeed}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0.18} />
            <stop offset="65%" stopColor={secondaryColor} stopOpacity={0.06} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={0} cy={0} r={half * 0.92} fill={`url(#stage-glow-${noiseSeed})`} />

        {/* Contorno CAD que muta suavemente con Flubber */}
        <path
          d={morphedCadPath}
          fill="none"
          stroke={accentColor}
          strokeWidth={1.75}
          strokeDasharray="10 8"
          opacity={0.45}
        />

        {/* Anillos acústicos / CAD concéntricos animados */}
        {pulseRings &&
          [0, 1, 2].map((idx) => {
            const cycle = ((localFrame * 1.8 + idx * 36) % 108) / 108;
            const r = interpolate(cycle, [0, 1], [half * 0.38, half * 0.96], CLAMP_EXTRAPOLATION);
            const ringOpacity = interpolate(
              cycle,
              [0, 0.2, 0.85, 1],
              [0, 0.55, 0.2, 0],
              CLAMP_EXTRAPOLATION,
            );
            return (
              <circle
                key={idx}
                cx={0}
                cy={0}
                r={r}
                fill="none"
                stroke={idx % 2 === 0 ? accentColor : secondaryColor}
                strokeWidth={2}
                opacity={ringOpacity}
              />
            );
          })}

        {/* Escuadras de fijación óptica CAD en las 4 esquinas del prop */}
        {[
          { cx: -half + 28, cy: -half + 28, dx: 26, dy: 26 },
          { cx: half - 28, cy: -half + 28, dx: -26, dy: 26 },
          { cx: -half + 28, cy: half - 28, dx: 26, dy: -26 },
          { cx: half - 28, cy: half - 28, dx: -26, dy: -26 },
        ].map((corner, i) => (
          <g key={i} opacity={0.75}>
            <line
              x1={corner.cx}
              y1={corner.cy}
              x2={corner.cx + corner.dx}
              y2={corner.cy}
              stroke={accentColor}
              strokeWidth={3}
            />
            <line
              x1={corner.cx}
              y1={corner.cy}
              x2={corner.cx}
              y2={corner.cy + corner.dy}
              stroke={accentColor}
              strokeWidth={3}
            />
          </g>
        ))}
      </svg>

      {/* Ilustración Hero Prop 3D de Alta Dirección de Arte con Canal Alfa */}
      <Img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'contrast(1.06) saturate(1.08)',
        }}
      />

      {/* Haz de escaneo Rayos X / Telemetría sobre la ilustración */}
      {scanBeam && (
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
        >
          <line
            x1={48}
            y1={scanY}
            x2={size - 48}
            y2={scanY}
            stroke={accentColor}
            strokeWidth={2.5}
            strokeDasharray="14 6"
            opacity={0.72}
          />
          <circle cx={48} cy={scanY} r={4.5} fill={accentColor} />
          <circle cx={size - 48} cy={scanY} r={4.5} fill={accentColor} />
        </svg>
      )}

      {/* Etiqueta técnica opcional en la esquina superior izquierda del rig */}
      {cadTag && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 42,
            padding: '4px 12px',
            borderRadius: 6,
            backgroundColor: 'rgba(17, 17, 17, 0.82)',
            border: `1.5px solid ${accentColor}`,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 20,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: '0.06em',
          }}
        >
          {cadTag}
        </div>
      )}
    </div>
  );
};

