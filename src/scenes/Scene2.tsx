import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';

export interface Scene2Props {
  headline?: string;
  metricValue?: number;
  metricUnit?: string;
  metricLabel?: string;
  canvasOffsetX?: number;
  canvasOffsetY?: number;
  enterFrame?: number;
  bookMetadata?: BookMetadata;
  visualData?: BookVisualData;
}

/**
 * Scene 2 — La Matemática del 1% (Diseño Editorial Papel Cálido + Sincronización Exacta)
 * Timestamps reales de ElevenLabs (342 frames):
 * - 0..26: "La matemática del uno por ciento" -> Entrada de la cabecera
 * - 26..60: "uno por ciento" -> Tarjeta con la fórmula 1.01³⁶⁵ = 37.78x
 * - 97..140: "cada día parece invisible..." -> Tarjeta de contraste 0.99³⁶⁵ = 0.03x
 * - 260..300: "treinta y siete veces mejor" -> Gran badge central "37.78x" con explosión elástica
 */
export const Scene2: React.FC<Scene2Props> = ({
  canvasOffsetX = 1120,
  canvasOffsetY = 0,
  enterFrame = 393,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Cabecera (frame 0)
  const headerEntrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Tarjeta de la Fórmula Principal 1.01³⁶⁵ (frame 24)
  const formulaEntrance = spring({
    frame: Math.max(0, localFrame - 24),
    fps,
    config: SPRING_SNAPPY,
  });

  // 3. Tarjeta de Contraste 0.99³⁶⁵ (frame 95)
  const contrastEntrance = spring({
    frame: Math.max(0, localFrame - 95),
    fps,
    config: SPRING_SNAPPY,
  });

  // 4. Gran Contador Multiplicador 37.78x (frame 255 - "treinta y siete veces mejor")
  const multiplierEntrance = spring({
    frame: Math.max(0, localFrame - 255),
    fps,
    config: SPRING_SNAPPY,
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
        padding: '0 96px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Cabecera Editorial */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 96,
          right: 96,
          opacity: headerEntrance,
          transform: `translateY(${(1 - headerEntrance) * -20}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #D94E34',
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: '#D94E34',
              letterSpacing: 1.5,
            }}
          >
            02 / INTERÉS COMPUESTO
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
            fontSize: 56,
            fontWeight: 800,
            color: '#141413',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          La Regla del 1% Diario
        </h1>
      </div>

      {/* 2. Tarjeta Editorial de la Fórmula 1.01³⁶⁵ */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 96,
          right: 96,
          backgroundColor: '#FFFFFF',
          border: '2px solid #D94E34',
          borderRadius: 16,
          padding: '28px 32px',
          boxShadow: '0 12px 36px rgba(217, 78, 52, 0.08)',
          opacity: formulaEntrance,
          transform: `scale(${interpolate(formulaEntrance, [0, 1], [0.92, 1], CLAMP_EXTRAPOLATION)})`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: '#D94E34',
              letterSpacing: 1,
            }}
          >
            FÓRMULA CONDUCTUAL DE JAMES CLEAR
          </span>
          <span
            style={{
              padding: '4px 10px',
              backgroundColor: 'rgba(217, 78, 52, 0.10)',
              borderRadius: 6,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: '#D94E34',
            }}
          >
            365 DÍAS
          </span>
        </div>

        <div
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 48,
            fontWeight: 800,
            color: '#141413',
            letterSpacing: '-0.02em',
          }}
        >
          1.01³⁶⁵ = <span style={{ color: '#D94E34' }}>37.78x</span>
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            color: '#575550',
            marginTop: 12,
            marginBottom: 0,
            lineHeight: 1.4,
          }}
        >
          Mejorar solo un 1% cada día te convierte en 37 veces mejor al cabo de un año.
        </p>
      </div>

      {/* 3. Tarjeta de Contraste Negativo (0.99³⁶⁵) */}
      <div
        style={{
          position: 'absolute',
          top: 560,
          left: 96,
          right: 96,
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #E5E2DC',
          borderRadius: 16,
          padding: '24px 32px',
          boxShadow: '0 6px 20px rgba(45, 43, 40, 0.04)',
          opacity: contrastEntrance,
          transform: `translateY(${(1 - contrastEntrance) * 20}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: '#64748B',
            }}
          >
            EL EFECTO CONTRARIO (DECLIVE)
          </span>
          <span
            style={{
              padding: '3px 8px',
              backgroundColor: '#F1F5F9',
              borderRadius: 6,
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: '#64748B',
            }}
          >
            -1% DIARIO
          </span>
        </div>

        <div
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 34,
            fontWeight: 700,
            color: '#64748B',
          }}
        >
          0.99³⁶⁵ = 0.03x
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            color: '#94A3B8',
            marginTop: 6,
            marginBottom: 0,
          }}
        >
          Empeorar un 1% diario reduce tu habilidad casi a cero absoluto.
        </p>
      </div>

      {/* 4. Gran Tarjeta de Síntesis del Multiplicador 37.78x (frame 255) */}
      <div
        style={{
          position: 'absolute',
          top: 760,
          left: 96,
          right: 96,
          backgroundColor: '#FFFFFF',
          border: '2px solid #141413',
          borderTop: '6px solid #D94E34',
          borderRadius: 20,
          padding: '40px 32px',
          boxShadow: '0 20px 50px rgba(45, 43, 40, 0.12)',
          textAlign: 'center',
          opacity: multiplierEntrance,
          transform: `scale(${interpolate(multiplierEntrance, [0, 1], [0.85, 1], CLAMP_EXTRAPOLATION)})`,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 800,
            color: '#D94E34',
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          POTENCIA ACUMULADA
        </div>
        <div
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 110,
            fontWeight: 900,
            color: '#141413',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          37.78<span style={{ color: '#D94E34', fontSize: 60 }}>x</span>
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#141413',
            marginTop: 16,
          }}
        >
          Más competente al final del año
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            color: '#575550',
            marginTop: 4,
          }}
        >
          «Los hábitos son el interés compuesto de la superación personal»
        </div>
      </div>
    </div>
  );
};
