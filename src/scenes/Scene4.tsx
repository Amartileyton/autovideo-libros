import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

export interface Scene4Props {
  headline?: string;
  metricValue?: number;
  metricUnit?: string;
  metricLabel?: string;
  canvasOffsetX?: number;
  canvasOffsetY?: number;
  enterFrame?: number;
  bookMetadata?: BookMetadata;
  visualData?: BookVisualData;
  layoutPreset?: SceneLayoutPreset;
  wordTimestamps?: WordTimestamp[];
}

/**
 * Scene 4 — Diagrama de Flujo Vertical Descendente (Top-to-Bottom Flowchart)
 * Distribución equilibrada que ocupa toda la pantalla de arriba hacia abajo (70px a 1510px):
 * - Cabecera Técnica: top 60px a 140px
 * - Nivel 01 (Top Card, top 160px a 540px): "Nunca arriesgues lo que necesitas..." (frame ~65)
 * - Indicador de Flujo 1: Recto desde el centro inferior de Card 1 (x: 540, y: 540) hacia abajo (x: 540, y: 630) (frame ~165-195)
 * - Nivel 02 (Middle Card, top 630px a 1010px): "Define cuándo es suficiente..." (frame ~192)
 * - Indicador de Flujo 2: Recto desde el centro inferior de Card 2 (x: 540, y: 1010) hacia abajo (x: 540, y: 1100) (frame ~265-295)
 * - Nivel 03 (Bottom Card, top 1100px a 1510px): "Margen de seguridad..." (frame ~291)
 */
export const Scene4: React.FC<Scene4Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 1980,
  enterFrame = 1122,
  visualData,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Entrada de la cabecera (frame 15)
  const headerSpring = spring({
    frame: Math.max(0, localFrame - 15),
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Nivel 01 (Primera Ley): entra en frame 65
  const level1Spring = spring({
    frame: Math.max(0, localFrame - 65),
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.8 },
  });

  // 3. Indicador de Flujo 1 (Conecta Tarjeta 1 hacia Tarjeta 2): progresión de 0 a 1 de arriba hacia abajo (frames 165 a 195)
  const flow1Progress = interpolate(
    localFrame,
    [165, 195],
    [0, 1],
    CLAMP_EXTRAPOLATION
  );

  // 4. Nivel 02 (Segunda Ley): entra en frame 192
  const level2Spring = spring({
    frame: Math.max(0, localFrame - 192),
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.8 },
  });

  // 5. Indicador de Flujo 2 (Conecta Tarjeta 2 hacia Tarjeta 3): progresión de 0 a 1 de arriba hacia abajo (frames 265 a 295)
  const flow2Progress = interpolate(
    localFrame,
    [265, 295],
    [0, 1],
    CLAMP_EXTRAPOLATION
  );

  // 6. Nivel 03 (Tercera Ley): entra en frame 291
  const level3Spring = spring({
    frame: Math.max(0, localFrame - 291),
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.8 },
  });

  // Pop del sello de fortaleza final
  const shieldPop = spring({
    frame: Math.max(0, localFrame - 315),
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: canvasOffsetX,
        top: canvasOffsetY,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Cabecera Técnica y Editorial (top: 60px, left: 54, right: 54) */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 54,
          right: 54,
          backgroundColor: '#FEF9C3',
          border: '2.5px solid #141413',
          borderLeft: '8px solid #D94E34',
          borderRadius: 18,
          padding: '16px 26px',
          boxShadow: '0 10px 28px rgba(20, 20, 19, 0.06)',
          opacity: headerSpring,
          transform: `translateY(${(1 - headerSpring) * 16}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 25,
              fontWeight: 900,
              color: '#141413',
              letterSpacing: '-0.02em',
            }}
          >
            3 PRINCIPIOS CONTRA EL CAOS
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: '#575550',
              marginTop: 2,
            }}
          >
            Flujo secuencial para ordenar tu vida y fortalecer tu carácter
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#141413',
            color: '#FEF9C3',
            padding: '8px 18px',
            borderRadius: 12,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: 0.5,
            whiteSpace: 'nowrap',
          }}
        >
          PASO A PASO
        </div>
      </div>

      {/* ======================================================== */}
      {/* LEY 01 (TOP): Nunca arriesgues lo que necesitas (top 160) */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 54,
          right: 54,
          height: 380,
          backgroundColor: '#FEF9C3',
          border: '2.5px solid #141413',
          borderLeft: '8px solid #D94E34',
          borderRadius: 24,
          padding: '28px 36px',
          boxShadow: '0 14px 36px rgba(217, 78, 52, 0.10), 0 4px 12px rgba(0,0,0,0.04)',
          opacity: level1Spring,
          transform: `scale(${interpolate(level1Spring, [0, 1], [0.94, 1], CLAMP_EXTRAPOLATION)}) translateY(${(1 - level1Spring) * 20}px)`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  backgroundColor: '#D94E34',
                  color: '#FFFFFF',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 900,
                  padding: '5px 14px',
                  borderRadius: 8,
                }}
              >
                REGLA 01 · FUNDACIÓN
              </span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#D94E34',
                  letterSpacing: 0.5,
                }}
              >
                RESPONSABILIDAD PRIMERO
              </span>
            </div>

            <span style={{ fontSize: 26 }}>🏠</span>
          </div>

          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 32,
              fontWeight: 900,
              color: '#141413',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            01 · {visualData?.actionableLaws?.[0]?.title ?? 'ORDENA TU CASA PRIMERO'}
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#374151',
              marginTop: 14,
              lineHeight: 1.45,
            }}
          >
            {visualData?.actionableLaws?.[0]?.rule ??
              'Arregla tu propia habitación y asume la responsabilidad de tus actos antes de criticar al mundo.'}
          </div>
        </div>

        <div
          style={{
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(217, 78, 52, 0.12)',
            border: '1.5px solid #D94E34',
            borderRadius: 8,
            padding: '6px 16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            fontWeight: 900,
            color: '#D94E34',
            letterSpacing: 0.5,
          }}
        >
          REGLA DE ORO: LO CERCANO ES TU PRIORIDAD
        </div>
      </div>

      {/* ======================================================== */}
      {/* INDICADOR DE FLUJO 1: Del centro de Card 1 hacia Card 2 */}
      {/* ======================================================== */}
      {flow1Progress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 540,
            left: 0,
            right: 0,
            height: 90,
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg width={100} height={90} style={{ overflow: 'visible' }}>
            <defs>
              <marker
                id="flowArrowDown1"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 1 2 L 5 8 L 9 2 z" fill="#D94E34" />
              </marker>
            </defs>

            {/* Círculo origen anclado al centro inferior de Card 1 */}
            <circle cx="50" cy="2" r="5" fill="#D94E34" />

            {/* Línea vertical descendente animada de arriba hacia abajo */}
            <line
              x1="50"
              y1="4"
              x2="50"
              y2={4 + flow1Progress * 76}
              stroke="#D94E34"
              strokeWidth={4}
              strokeDasharray="6 4"
              markerEnd={flow1Progress > 0.88 ? 'url(#flowArrowDown1)' : undefined}
            />
          </svg>

          {/* Pastilla técnica de flujo */}
          <div
            style={{
              position: 'absolute',
              top: 28,
              backgroundColor: '#141413',
              color: '#FEF9C3',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              fontWeight: 900,
              padding: '3px 12px',
              borderRadius: 12,
              border: '1.5px solid #D94E34',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              opacity: flow1Progress,
              transform: `scale(${flow1Progress})`,
            }}
          >
            SIGUIENTE ▼
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LEY 02 (CENTRO): Define cuándo es suficiente (top 630)   */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 630,
          left: 54,
          right: 54,
          height: 380,
          backgroundColor: '#FEF9C3',
          border: '2.5px solid #141413',
          borderLeft: '8px solid #D97706',
          borderRadius: 24,
          padding: '28px 36px',
          boxShadow: '0 14px 36px rgba(217, 119, 6, 0.10), 0 4px 12px rgba(0,0,0,0.04)',
          opacity: level2Spring,
          transform: `scale(${interpolate(level2Spring, [0, 1], [0.94, 1], CLAMP_EXTRAPOLATION)}) translateY(${(1 - level2Spring) * 20}px)`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 900,
                  padding: '5px 14px',
                  borderRadius: 8,
                }}
              >
                REGLA 02 · INTEGRIDAD
              </span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#D97706',
                  letterSpacing: 0.5,
                }}
              >
                VERDAD RADICAL
              </span>
            </div>

            <span style={{ fontSize: 26 }}>⚖️</span>
          </div>

          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 32,
              fontWeight: 900,
              color: '#141413',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            02 · {visualData?.actionableLaws?.[1]?.title ?? 'DI LA VERDAD SIEMPRE'}
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#374151',
              marginTop: 14,
              lineHeight: 1.45,
            }}
          >
            {visualData?.actionableLaws?.[1]?.rule ??
              'La mentira deforma tu conciencia; la honestidad radical es tu ancla inamovible contra el caos.'}
          </div>
        </div>

        <div
          style={{
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(217, 119, 6, 0.12)',
            border: '1.5px solid #D97706',
            borderRadius: 8,
            padding: '6px 16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            fontWeight: 900,
            color: '#D97706',
            letterSpacing: 0.5,
          }}
        >
          PRINCIPIO: LA HONESTIDAD TE BLINDA DEL CAOS
        </div>
      </div>

      {/* ======================================================== */}
      {/* INDICADOR DE FLUJO 2: Del centro de Card 2 hacia Card 3 */}
      {/* ======================================================== */}
      {flow2Progress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 1010,
            left: 0,
            right: 0,
            height: 90,
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg width={100} height={90} style={{ overflow: 'visible' }}>
            <defs>
              <marker
                id="flowArrowDown2"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 1 2 L 5 8 L 9 2 z" fill="#16A34A" />
              </marker>
            </defs>

            {/* Círculo origen anclado al centro inferior de Card 2 */}
            <circle cx="50" cy="2" r="5" fill="#16A34A" />

            {/* Línea vertical descendente animada de arriba hacia abajo */}
            <line
              x1="50"
              y1="4"
              x2="50"
              y2={4 + flow2Progress * 76}
              stroke="#16A34A"
              strokeWidth={4}
              strokeDasharray="6 4"
              markerEnd={flow2Progress > 0.88 ? 'url(#flowArrowDown2)' : undefined}
            />
          </svg>

          {/* Pastilla técnica de flujo */}
          <div
            style={{
              position: 'absolute',
              top: 28,
              backgroundColor: '#141413',
              color: '#FEF9C3',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              fontWeight: 900,
              padding: '3px 12px',
              borderRadius: 12,
              border: '1.5px solid #16A34A',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              opacity: flow2Progress,
              transform: `scale(${flow2Progress})`,
            }}
          >
            ESCUDO ▼
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LEY 03 (BOTTOM): Margen de Seguridad (top 1100 a 1510)   */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 1100,
          left: 54,
          right: 54,
          height: 400,
          backgroundColor: '#FEF9C3',
          border: '2.5px solid #141413',
          borderLeft: '8px solid #16A34A',
          borderRadius: 24,
          padding: '28px 36px',
          boxShadow: '0 16px 40px rgba(22, 163, 74, 0.12), 0 4px 12px rgba(0,0,0,0.04)',
          opacity: level3Spring,
          transform: `scale(${interpolate(level3Spring, [0, 1], [0.94, 1], CLAMP_EXTRAPOLATION)}) translateY(${(1 - level3Spring) * 20}px)`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 3,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 900,
                  padding: '5px 14px',
                  borderRadius: 8,
                }}
              >
                REGLA 03 · PROPÓSITO
              </span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#16A34A',
                  letterSpacing: 0.5,
                }}
              >
                SENTIDO PROFUNDO
              </span>
            </div>

            <span
              style={{
                fontSize: 28,
                transform: `scale(${shieldPop})`,
                display: 'inline-block',
              }}
            >
              🧭
            </span>
          </div>

          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 32,
              fontWeight: 900,
              color: '#141413',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            03 · {visualData?.actionableLaws?.[2]?.title ?? 'BUSCA LO SIGNIFICATIVO'}
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#374151',
              marginTop: 14,
              lineHeight: 1.45,
            }}
          >
            {visualData?.actionableLaws?.[2]?.rule ??
              'Persigue lo que otorga sentido trascendente a tu vida, no el placer fácil e inmediato.'}
          </div>
        </div>

        <div
          style={{
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(22, 163, 74, 0.12)',
            border: '1.5px solid #16A34A',
            borderRadius: 8,
            padding: '6px 16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            fontWeight: 900,
            color: '#16A34A',
            letterSpacing: 0.5,
          }}
        >
          META VITAL: SENTIDO TRANSCENDENTE &gt; PLACER INMEDIATO
        </div>
      </div>
    </div>
  );
};
