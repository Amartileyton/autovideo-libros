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
  accentColor?: string;
  width?: number;
  height?: number;
}

const DEFAULT_NODES: CircuitNode[] = [
  { id: 'signal', num: '01', label: 'SEÑAL', sublabel: 'Disparador ambiental', x: 160, y: 150, triggerFrame: 103, endSpokenFrame: 126 },
  { id: 'craving', num: '02', label: 'ANHELO', sublabel: 'Pico de dopamina', x: 728, y: 150, triggerFrame: 127, endSpokenFrame: 151 },
  { id: 'response', num: '03', label: 'RESPUESTA', sublabel: 'La acción física', x: 728, y: 350, triggerFrame: 152, endSpokenFrame: 171 },
  { id: 'reward', num: '04', label: 'RECOMPENSA', sublabel: 'Cierre neurológico', x: 160, y: 350, triggerFrame: 172, endSpokenFrame: 215 },
];

/**
 * VectorLoopCircuit — Circuito Vectorial Dinámico (Estilo @nuncateloexplicaron)
 * Conecta nodos conceptuales mediante trazos Bézier animados con evolvePath
 * y un pulso de dopamina que viaja en tiempo real activando cada estación.
 */
export const VectorLoopCircuit: React.FC<VectorLoopCircuitProps> = ({
  nodes = DEFAULT_NODES,
  startFrame = 0,
  accentColor = '#D94E34',
  width = 888,
  height = 600,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // Ruta cerrada rectangular con curvas suaves que conecta los 4 nodos
  const circuitPath = `M ${nodes[0].x} ${nodes[0].y} L ${nodes[1].x} ${nodes[1].y} L ${nodes[2].x} ${nodes[2].y} L ${nodes[3].x} ${nodes[3].y} Z`;

  // Progreso de dibujo del trazado (se dibuja entre los frames 30 y 90)
  const drawProgress = spring({
    frame: Math.max(0, localFrame - 30),
    fps,
    config: { damping: 25, stiffness: 90, mass: 1 },
    durationInFrames: 60,
  });

  const pathEvolution = evolvePath(drawProgress, circuitPath);

  // Pulso/partícula que viaja en bucle continuo a lo largo del circuito
  const loopCycleFrames = 120;
  const loopProgress = (localFrame % loopCycleFrames) / loopCycleFrames;

  // Cálculo aproximado de la posición de la partícula a lo largo de los 4 tramos
  let particleX = nodes[0].x;
  let particleY = nodes[0].y;
  if (loopProgress < 0.25) {
    const t = loopProgress / 0.25;
    particleX = interpolate(t, [0, 1], [nodes[0].x, nodes[1].x], CLAMP_EXTRAPOLATION);
    particleY = nodes[0].y;
  } else if (loopProgress < 0.5) {
    const t = (loopProgress - 0.25) / 0.25;
    particleX = nodes[1].x;
    particleY = interpolate(t, [0, 1], [nodes[1].y, nodes[2].y], CLAMP_EXTRAPOLATION);
  } else if (loopProgress < 0.75) {
    const t = (loopProgress - 0.5) / 0.25;
    particleX = interpolate(t, [0, 1], [nodes[2].x, nodes[3].x], CLAMP_EXTRAPOLATION);
    particleY = nodes[2].y;
  } else {
    const t = (loopProgress - 0.75) / 0.25;
    particleX = nodes[3].x;
    particleY = interpolate(t, [0, 1], [nodes[3].y, nodes[0].y], CLAMP_EXTRAPOLATION);
  }

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#FFFFFF',
        border: '1.5px solid rgba(45, 43, 40, 0.12)',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 12px 40px rgba(45, 43, 40, 0.05)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Título técnico superior */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E5E2DC',
          paddingBottom: 12,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 800,
            color: accentColor,
            letterSpacing: 1.5,
          }}
        >
          CIRCUITO NEUROLÓGICO DEL HÁBITO
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#64748B',
          }}
        >
          LOOP CONTINUO 4.0 Hz
        </span>
      </div>

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

        {/* Partícula / Spark de Dopamina viajando en tiempo real */}
        {drawProgress > 0.4 && (
          <g transform={`translate(${particleX}, ${particleY})`}>
            <circle cx={0} cy={0} r={14} fill={accentColor} opacity={0.25} />
            <circle cx={0} cy={0} r={7} fill={accentColor} />
            <circle cx={0} cy={0} r={3} fill="#FFFFFF" />
          </g>
        )}
      </svg>

      {/* Capa HTML: Estaciones / Nodos Cinéticos Sombreados en Vivo */}
      {nodes.map((node) => {
        const isTriggered = localFrame >= node.triggerFrame;
        const isCurrentlySpoken =
          localFrame >= node.triggerFrame &&
          localFrame <= (node.endSpokenFrame ?? node.triggerFrame + 25);
        const isPastSpoken =
          localFrame > (node.endSpokenFrame ?? node.triggerFrame + 25);

        const nodeSpring = spring({
          frame: Math.max(0, localFrame - node.triggerFrame),
          fps,
          config: SPRING_SNAPPY,
        });

        // Sombrear con intensidad al pronunciar la fase en cuestión (Solid Terracotta + White)
        const cardBg = isCurrentlySpoken
          ? accentColor
          : isPastSpoken
            ? '#FFFFFF'
            : 'rgba(255, 255, 255, 0.85)';

        const cardBorder = isCurrentlySpoken
          ? `3px solid #B91C1C`
          : isPastSpoken
            ? `1.5px solid rgba(217, 78, 52, 0.50)`
            : '1.5px dashed #CBD5E1';

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
                      : isTriggered
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
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {node.label}
            </div>

            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: isCurrentlySpoken ? '#FEE2E2' : '#64748B',
                marginTop: 3,
                lineHeight: 1.2,
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
