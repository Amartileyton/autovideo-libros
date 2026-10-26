import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';

export interface CircuitNode {
  id: string;
  num: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  triggerFrame: number;
  endSpokenFrame?: number;
}

export interface VectorLoopCircuitProps {
  nodes?: CircuitNode[];
  startFrame?: number;
  currentFrame?: number;
  accentColor?: string;
  width?: number;
  height?: number;
  title?: string;
  badge?: string;
  showTitle?: boolean;
}

const DEFAULT_NODES: CircuitNode[] = [
  { id: 'signal', num: '01', label: 'SEÑAL', sublabel: 'Disparador ambiental', x: 170, y: 130, triggerFrame: 103, endSpokenFrame: 126 },
  { id: 'craving', num: '02', label: 'ANHELO', sublabel: 'Pico de dopamina', x: 718, y: 130, triggerFrame: 127, endSpokenFrame: 151 },
  { id: 'response', num: '03', label: 'RESPUESTA', sublabel: 'La acción física', x: 718, y: 350, triggerFrame: 152, endSpokenFrame: 171 },
  { id: 'reward', num: '04', label: 'RECOMPENSA', sublabel: 'Cierre neurológico', x: 170, y: 350, triggerFrame: 172, endSpokenFrame: 215 },
];

/**
 * VectorLoopCircuit — Circuito Vectorial Dinámico (Estilo @nuncateloexplicaron)
 * Conecta nodos conceptuales mediante trazos Bézier animados con evolvePath
 * y un pulso de dopamina que viaja en tiempo real activando cada estación al ritmo de la voz.
 */
export const VectorLoopCircuit: React.FC<VectorLoopCircuitProps> = ({
  nodes = DEFAULT_NODES,
  startFrame = 0,
  currentFrame,
  accentColor = '#D94E34',
  width = 888,
  height = 480,
  title,
  badge,
  showTitle = false,
}) => {
  const remotionFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Permite gobernar el tiempo directamente con el localFrame de la escena
  const rawFrame = currentFrame !== undefined ? currentFrame : remotionFrame;
  const circuitFrame = Math.max(0, rawFrame - startFrame);

  // Ruta cerrada rectangular que conecta los 4 nodos
  const circuitPath = `M ${nodes[0].x} ${nodes[0].y} L ${nodes[1].x} ${nodes[1].y} L ${nodes[2].x} ${nodes[2].y} L ${nodes[3].x} ${nodes[3].y} Z`;

  // Progreso de dibujo del trazado (se dibuja rápidamente entre los frames 0 y 45)
  const drawProgress = spring({
    frame: circuitFrame,
    fps,
    config: { damping: 25, stiffness: 90, mass: 1 },
    durationInFrames: 45,
  });

  const pathEvolution = evolvePath(drawProgress, circuitPath);

  // Sincronización exacta de la partícula de dopamina con las estaciones y la voz
  const t0 = nodes[0]?.triggerFrame ?? 0;
  const t1 = nodes[1]?.triggerFrame ?? 60;
  const t2 = nodes[2]?.triggerFrame ?? 120;
  const t3 = nodes[3]?.triggerFrame ?? 180;
  const tEnd = (nodes[3]?.endSpokenFrame ?? t3 + 35);

  let particleX = nodes[0].x;
  let particleY = nodes[0].y;

  if (circuitFrame < t0) {
    particleX = nodes[0].x;
    particleY = nodes[0].y;
  } else if (circuitFrame < t1) {
    const t = interpolate(circuitFrame, [t0, t1], [0, 1], CLAMP_EXTRAPOLATION);
    particleX = interpolate(t, [0, 1], [nodes[0].x, nodes[1].x], CLAMP_EXTRAPOLATION);
    particleY = nodes[0].y;
  } else if (circuitFrame < t2) {
    const t = interpolate(circuitFrame, [t1, t2], [0, 1], CLAMP_EXTRAPOLATION);
    particleX = nodes[1].x;
    particleY = interpolate(t, [0, 1], [nodes[1].y, nodes[2].y], CLAMP_EXTRAPOLATION);
  } else if (circuitFrame < t3) {
    const t = interpolate(circuitFrame, [t2, t3], [0, 1], CLAMP_EXTRAPOLATION);
    particleX = interpolate(t, [0, 1], [nodes[2].x, nodes[3].x], CLAMP_EXTRAPOLATION);
    particleY = nodes[2].y;
  } else {
    const t = interpolate(circuitFrame, [t3, tEnd], [0, 1], CLAMP_EXTRAPOLATION);
    particleX = interpolate(t, [0, 1], [nodes[3].x, nodes[0].x], CLAMP_EXTRAPOLATION);
    particleY = interpolate(t, [0, 1], [nodes[3].y, nodes[0].y], CLAMP_EXTRAPOLATION);
  }

  const isParticleActive = circuitFrame >= t0;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#FEF9C3',
        border: '2px solid #141413',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 12px 40px rgba(20, 20, 19, 0.06)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Cabecera opcional (desactivada por defecto para eliminar ruido visual) */}
      {showTitle && title && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1.5px solid rgba(20, 20, 19, 0.12)',
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
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
              {title}
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: accentColor,
            }}
          >
            {badge ?? `${nodes.length} Fases`}
          </span>
        </div>
      )}

      {/* Capa SVG: Circuito y Trazos Dibujados en Vivo */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
      >
        {/* Línea guía base atenuada */}
        <path
          d={circuitPath}
          stroke="rgba(45, 43, 40, 0.08)"
          strokeWidth={3}
          strokeDasharray="6 6"
          fill="none"
        />

        {/* Trazado activo animado con evolvePath */}
        <path
          d={circuitPath}
          stroke={accentColor}
          strokeWidth={3.5}
          strokeDasharray={pathEvolution.strokeDasharray}
          strokeDashoffset={pathEvolution.strokeDashoffset}
          fill="none"
        />

        {/* Partícula / Spark de Dopamina viajando sincronizada con la voz */}
        {drawProgress > 0.4 && isParticleActive && (
          <g transform={`translate(${particleX}, ${particleY})`}>
            <circle cx={0} cy={0} r={16} fill={accentColor} opacity={0.3} />
            <circle cx={0} cy={0} r={8} fill={accentColor} />
            <circle cx={0} cy={0} r={3.5} fill="#FFFFFF" />
          </g>
        )}
      </svg>

      {/* Capa HTML: Estaciones / Nodos Cinéticos Sombreados en Vivo */}
      {nodes.map((node) => {
        const isTriggered = circuitFrame >= node.triggerFrame;
        const isCurrentlySpoken =
          circuitFrame >= node.triggerFrame &&
          circuitFrame <= (node.endSpokenFrame ?? node.triggerFrame + 25);
        const isPastSpoken =
          circuitFrame > (node.endSpokenFrame ?? node.triggerFrame + 25);

        const nodeSpring = spring({
          frame: Math.max(0, circuitFrame - node.triggerFrame),
          fps,
          config: SPRING_SNAPPY,
        });

        // Sombrear con intensidad al pronunciar la fase en cuestión (Solid Terracotta + Pale Yellow)
        const cardBg = isCurrentlySpoken
          ? accentColor
          : isPastSpoken
            ? '#FFFBEB'
            : '#FFFDF0';

        const cardBorder = isCurrentlySpoken
          ? `3px solid #141413`
          : isPastSpoken
            ? `2px solid ${accentColor}`
            : '1.5px solid rgba(20, 20, 19, 0.25)';

        const cardShadow = isCurrentlySpoken
          ? `0 22px 50px rgba(217, 78, 52, 0.45), 0 0 0 4px rgba(217, 78, 52, 0.25)`
          : isPastSpoken
            ? '0 6px 18px rgba(45, 43, 40, 0.05)'
            : '0 2px 8px rgba(0, 0, 0, 0.02)';

        const cardScale = isCurrentlySpoken
          ? 1.10
          : isPastSpoken
            ? 1.0
            : 0.94;

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: node.x - 110,
              top: node.y - 42,
              width: 220,
              backgroundColor: cardBg,
              border: cardBorder,
              borderRadius: 16,
              padding: '14px 16px',
              boxShadow: cardShadow,
              transform: `scale(${isTriggered ? interpolate(nodeSpring, [0, 1], [0.88, cardScale], CLAMP_EXTRAPOLATION) : 0.94})`,
              transformOrigin: 'center center',
              zIndex: isCurrentlySpoken ? 30 : 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 800,
                  color: isCurrentlySpoken
                    ? '#FEE2E2'
                    : isPastSpoken
                      ? accentColor
                      : '#94A3B8',
                }}
              >
                PASO {node.num}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isCurrentlySpoken && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: 0.5,
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}
                  >
                    ACTIVO
                  </span>
                )}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: isCurrentlySpoken
                      ? '#FFFFFF'
                      : isPastSpoken
                        ? accentColor
                        : '#CBD5E1',
                    boxShadow: isCurrentlySpoken
                      ? '0 0 10px #FFFFFF'
                      : 'none',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 22,
                fontWeight: 900,
                color: isCurrentlySpoken ? '#FFFFFF' : '#141413',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {node.label}
            </div>

            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: isCurrentlySpoken ? '#FEE2E2' : '#575550',
                marginTop: 4,
                lineHeight: 1.25,
                fontWeight: isCurrentlySpoken ? 600 : 500,
              }}
            >
              {node.sublabel}
            </div>
          </div>
        );
      })}
    </div>
  );
};
