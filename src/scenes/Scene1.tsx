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
 * Scene 1 — La Trampa de las Metas (Diseño Editorial Papel Cálido + Sincronización Exacta)
 * Timestamps reales de ElevenLabs:
 * - 0..38: "El 92% de las personas" -> Entrada de la ficha estadística (92% abandono en enero)
 * - 180..240: "En Hábitos Atómicos, James Clear" -> Entrada elástica de la portada 2.5D + badge de autor
 * - 295..315: "no son tus metas" -> Ficha tachada [METAS]
 * - 327..380: "sino los sistemas" -> Ficha destacada en terracota [SISTEMAS]
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

  // 1. Entrada de la cabecera editorial (frame 0)
  const headerEntrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Ficha estadística del gancho 92% (frame 10)
  const statEntrance = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: SPRING_SNAPPY,
  });

  // 3. Portada 2.5D del libro (frame 175 - cuando dice "En Hábitos Atómicos, James Clear")
  const bookEntrance = spring({
    frame: Math.max(0, localFrame - 175),
    fps,
    config: SPRING_SNAPPY,
  });

  // 4. Comparativa Metas vs Sistemas (frame 290 - cuando dice "no fueron tus metas...")
  const compareEntrance = spring({
    frame: Math.max(0, localFrame - 290),
    fps,
    config: SPRING_SNAPPY,
  });

  const systemsActive = localFrame >= 325; // "sino los sistemas..."

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
            01 / ANÁLISIS CONDUCTUAL
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
          ¿Por qué fallan tus metas?
        </h1>
      </div>

      {/* 2. Ficha Estadística del Gancho (92% Abandono) */}
      <div
        style={{
          position: 'absolute',
          top: 310,
          left: 96,
          right: 96,
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #E5E2DC',
          borderLeft: '5px solid #D94E34',
          borderRadius: 12,
          padding: '18px 24px',
          boxShadow: '0 8px 24px rgba(45, 43, 40, 0.05)',
          opacity: statEntrance,
          transform: `scale(${interpolate(statEntrance, [0, 1], [0.94, 1], CLAMP_EXTRAPOLATION)})`,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 44,
            fontWeight: 800,
            color: '#D94E34',
            lineHeight: 1,
          }}
        >
          92%
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: '#141413',
            }}
          >
            Abandona sus propósitos en enero
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#575550',
              marginTop: 2,
            }}
          >
            Fuente: Journal of Clinical Psychology & James Clear
          </div>
        </div>
      </div>

      {/* 3. Portada 2.5D del Libro con Ficha Goodreads */}
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
          transform: `translateY(${(1 - bookEntrance) * 30}px)`,
        }}
      >
        {/* Libro en perspectiva con sombra cálida */}
        <div
          style={{
            position: 'relative',
            width: 380,
            height: 570,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow:
              '0 24px 50px rgba(45, 43, 40, 0.16), 0 4px 12px rgba(45, 43, 40, 0.08)',
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

        {/* Ficha técnica del libro bajo la portada */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '10px 20px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E5E2DC',
            borderRadius: 30,
            boxShadow: '0 4px 14px rgba(45, 43, 40, 0.04)',
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
          <span style={{ color: '#E5E2DC' }}>|</span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: '#D97706',
            }}
          >
            ★ 4.38 Goodreads
          </span>
          <span style={{ color: '#E5E2DC' }}>|</span>
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

      {/* 4. Comparativa Metas vs Sistemas (frame 290) */}
      <div
        style={{
          position: 'absolute',
          top: 1140,
          left: 96,
          right: 96,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          opacity: compareEntrance,
          transform: `translateY(${(1 - compareEntrance) * 20}px)`,
        }}
      >
        {/* Tarjeta METAS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E5E2DC',
            borderRadius: 14,
            padding: '20px',
            opacity: systemsActive ? 0.45 : 1,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: '#DC2626',
              textDecoration: systemsActive ? 'line-through' : 'none',
              marginBottom: 6,
            }}
          >
            EL ERROR COMÚN
          </div>
          <div
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: 26,
              fontWeight: 700,
              color: '#141413',
              textDecoration: systemsActive ? 'line-through' : 'none',
            }}
          >
            Las Metas
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#575550',
              marginTop: 6,
              lineHeight: 1.3,
            }}
          >
            Ganadores y perdedores tienen los mismos objetivos.
          </div>
        </div>

        {/* Tarjeta SISTEMAS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: systemsActive ? '2px solid #D94E34' : '1.5px solid #E5E2DC',
            borderRadius: 14,
            padding: '20px',
            boxShadow: systemsActive
              ? '0 10px 24px rgba(217, 78, 52, 0.12)'
              : 'none',
            transform: `scale(${systemsActive ? 1.03 : 1})`,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: '#D94E34',
              marginBottom: 6,
            }}
          >
            LA SOLUCIÓN REAL
          </div>
          <div
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: 26,
              fontWeight: 700,
              color: '#D94E34',
            }}
          >
            Los Sistemas
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#141413',
              marginTop: 6,
              lineHeight: 1.3,
              fontWeight: 600,
            }}
          >
            Las micro-decisiones que ejecutas en automático.
          </div>
        </div>
      </div>
    </div>
  );
};
