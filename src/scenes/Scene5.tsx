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
import { BRAND_CONFIG, CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
import { CtaEndCard, KineticCard } from '../components/kinetic';

export interface Scene5Props {
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
 * Scene 5 — El Poder de Elegir y Call To Action Final (Kinetic UI + CTA Conversion)
 * Timestamps reales de ElevenLabs (402 frames):
 * - 0..87: "Una vez que entiendes que los hábitos se pueden rediseñar,"
 * - 86..184: "tienes la libertad y la responsabilidad de transformarlos." -> KineticCard Cita de Duhigg
 * - 207..260: "El poder de los hábitos, de Charles Duhigg." -> Mini portada y badge Goodreads
 * - 260..402: "Guarda este resumen y empieza hoy mismo." -> CtaEndCard con Hero Stopwatch
 */
export const Scene5: React.FC<Scene5Props> = ({
  canvasOffsetX = 560,
  canvasOffsetY = 3960,
  enterFrame = 1655,
  visualData,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Ficha de Mini Portada y Reconocimiento (frame 170)
  const bookPillEntrance = spring({
    frame: Math.max(0, localFrame - 170),
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
      {/* 1. Tarjeta Cita Central de Charles Duhigg (Sin cabecera de diapositiva ni título) */}
      <div style={{ position: 'absolute', top: 150, left: 96, right: 96 }}>
        <KineticCard
          enterFrame={10}
          accentBorderColor="#141413"
          badgeColor="#D94E34"
          padding="26px 32px"
          style={{
            borderTop: '6px solid #D94E34',
          }}
        >
          <blockquote
            style={{
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 27,
              fontWeight: 800,
              fontStyle: 'normal',
              lineHeight: 1.32,
              color: '#141413',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            «Una vez que entiendes que los hábitos se pueden rediseñar, tienes la{' '}
            <span
              style={{
                backgroundColor: 'rgba(217, 78, 52, 0.16)',
                padding: '2px 8px',
                borderRadius: 6,
                color: '#D94E34',
                fontWeight: 800,
              }}
            >
              libertad y la responsabilidad
            </span>{' '}
            de transformarlos.»
          </blockquote>
        </KineticCard>
      </div>

      {/* 2. Ficha Fusión Libro & Goodreads en Amarillo Pálido */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          left: 96,
          right: 96,
          opacity: bookPillEntrance,
          transform: `scale(${interpolate(bookPillEntrance, [0, 1], [0.94, 1], CLAMP_EXTRAPOLATION)})`,
          backgroundColor: '#FEF9C3',
          border: '2px solid #141413',
          borderRadius: 18,
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 6px 20px rgba(20, 20, 19, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 75,
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              border: '1px solid #E5E2DC',
            }}
          >
            <Img
              src={staticFile('assets/books/el-poder-de-los-habitos.jpg')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 18,
                fontWeight: 900,
                color: '#141413',
              }}
            >
              El poder de los hábitos
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: '#575550',
                marginTop: 2,
              }}
            >
              Charles Duhigg · 375 páginas
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 18,
              fontWeight: 900,
              color: '#D97706',
            }}
          >
            ★ 4.13
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#575550',
              fontWeight: 700,
            }}
          >
            585K REVIEWS
          </div>
        </div>
      </div>

      {/* 3. Tarjeta Final de Call To Action (CTA) de Alto Rendimiento */}
      <div style={{ position: 'absolute', top: 490, left: 96, right: 96 }}>
        <CtaEndCard
          enterFrame={260}
          handle={BRAND_CONFIG.channelHandle}
          questionText={
            visualData?.ctaPrompt ??
            '¿Cuál es el mal hábito que vas a sustituir esta semana?'
          }
        />
      </div>
    </div>
  );
};
