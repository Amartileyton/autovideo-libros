import React from 'react';
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookMetadata, BookVisualData } from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
import { ComparisonBattle, LiveCounter } from '../components/kinetic';

export interface Scene1Props {
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
 * Scene 1 — La Trampa de las Metas (Kinetic UI + @eldatomanda Style)
 * Timestamps reales de ElevenLabs (403 frames):
 * - 0..38: "El 92% de las personas" -> LiveCounter cuenta de 0 a 92%
 * - 175..240: "En Hábitos Atómicos, James Clear" -> Portada 2.5D con rebote elástico
 * - 285..340: "no fueron tus metas, sino los sistemas" -> ComparisonBattle en vivo
 */
export const Scene1: React.FC<Scene1Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 0,
  enterFrame = 0,
  bookMetadata,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Cabecera editorial (frame 0)
  const headerEntrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Ficha estadística del gancho 92% (frame 6)
  const statEntrance = spring({
    frame: Math.max(0, localFrame - 6),
    fps,
    config: SPRING_SNAPPY,
  });

  // 3. Portada 2.5D del libro (frame 175 - cuando dice "En Hábitos Atómicos, James Clear")
  const bookEntrance = spring({
    frame: Math.max(0, localFrame - 175),
    fps,
    config: SPRING_SNAPPY,
  });

  // Inclinación 2.5D sutil del libro
  const bookTilt = interpolate(
    localFrame,
    [175, 230, 350],
    [-4, 3, 0],
    CLAMP_EXTRAPOLATION
  );

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
            boxShadow: '0 2px 6px rgba(217, 78, 52, 0.10)',
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 800,
              color: '#D94E34',
              letterSpacing: 1.5,
            }}
          >
            01 / PARADOJA DEL ÉXITO
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            fontSize: 56,
            fontWeight: 900,
            color: '#141413',
            margin: 0,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
          }}
        >
          ¿Por qué fallan tus metas?
        </h1>
      </div>

      {/* 2. Ficha Estadística con LiveCounter (92% Abandono) */}
      <div
        style={{
          position: 'absolute',
          top: 310,
          left: 96,
          right: 96,
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #E5E2DC',
          borderLeft: '6px solid #D94E34',
          borderRadius: 16,
          padding: '20px 28px',
          boxShadow: '0 10px 30px rgba(45, 43, 40, 0.06)',
          opacity: statEntrance,
          transform: `scale(${interpolate(statEntrance, [0, 1], [0.94, 1], CLAMP_EXTRAPOLATION)})`,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={{ minWidth: 140 }}>
          <LiveCounter
            from={0}
            to={92}
            startFrame={6}
            durationFrames={28}
            suffix="%"
            fontSize={52}
            color="#D94E34"
          />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: '#141413',
            }}
          >
            Abandona sus metas en enero
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#575550',
              marginTop: 3,
            }}
          >
            Datos confirmados por la investigación de James Clear
          </div>
        </div>
      </div>

      {/* 3. Portada 2.5D del Libro con Rebote e Inclinación */}
      <div
        style={{
          position: 'absolute',
          top: 450,
          left: 96,
          right: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: bookEntrance,
          transform: `translateY(${(1 - bookEntrance) * 35}px) perspective(1200px) rotateY(${bookTilt}deg)`,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 360,
            height: 540,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow:
              '0 30px 60px rgba(45, 43, 40, 0.18), 0 6px 16px rgba(45, 43, 40, 0.08)',
            border: '2px solid rgba(45, 43, 40, 0.12)',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Img
            src={staticFile('assets/books/habitos-atomicos-cover.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Ficha técnica tipo badge debajo del libro */}
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '10px 22px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E5E2DC',
            borderRadius: 30,
            boxShadow: '0 4px 16px rgba(45, 43, 40, 0.05)',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: '#141413',
            }}
          >
            James Clear
          </span>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 800,
              color: '#D97706',
            }}
          >
            ★ 4.38 Goodreads
          </span>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#575550',
            }}
          >
            +15M lectores
          </span>
        </div>
      </div>

      {/* 4. Confrontación Cinética: Metas vs Sistemas (ComparisonBattle) */}
      <div
        style={{
          position: 'absolute',
          top: 1130,
          left: 96,
          right: 96,
        }}
      >
        <ComparisonBattle
          titleA="Las Metas"
          subtitleA="Ganadores y perdedores tienen los mismos objetivos"
          tagA="ENFOQUE TRADICIONAL"
          titleB="Los Sistemas"
          subtitleB="Las micro-decisiones que ejecutas a diario"
          tagB="ENFOQUE DE ALTO RENDIMIENTO"
          metricB={{ value: 100, suffix: '% IMPACTO' }}
          enterFrameA={285}
          enterFrameB={310}
          battleFrame={325}
          accentColor="#D94E34"
        />
      </div>
    </div>
  );
};
