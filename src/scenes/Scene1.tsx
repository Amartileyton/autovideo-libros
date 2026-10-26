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
 * Scene 1 — El Piloto Automático Cerebral (Kinetic UI + Charles Duhigg Book Profile)
 * Timestamps reales de ElevenLabs (438 frames):
 * - 0..72: "¿Crees que controlas tus decisiones diarias?" -> Ficha estadística y portada
 * - 91..160: "Un estudio de la Universidad de Duke demostró"
 * - 160..235: "más del cuarenta por ciento..." -> LiveCounter sube de 0 a 40%
 * - 240..425: "no son elecciones reales, sino hábitos automáticos" -> ComparisonBattle en directo
 */
export const Scene1: React.FC<Scene1Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 0,
  enterFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // 1. Ficha estadística del gancho 40% (frame 20)
  const statEntrance = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Portada 2.5D del libro (frame 60)
  const bookEntrance = spring({
    frame: Math.max(0, localFrame - 60),
    fps,
    config: SPRING_SNAPPY,
  });

  // Inclinación 2.5D sutil del libro
  const bookTilt = interpolate(
    localFrame,
    [60, 160, 320],
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
      {/* 1. Ficha Estadística en Amarillo Pálido con LiveCounter (40% de hábitos automáticos) */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 96,
          right: 96,
          backgroundColor: '#FEF9C3',
          border: '2px solid #141413',
          borderLeft: '6px solid #D94E34',
          borderRadius: 16,
          padding: '20px 28px',
          boxShadow: '0 10px 30px rgba(20, 20, 19, 0.06)',
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
            to={40}
            startFrame={160}
            durationFrames={35}
            suffix="%"
            fontSize={52}
            color="#D94E34"
          />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: '#141413',
            }}
          >
            De tus acciones son hábitos automáticos
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#575550',
              marginTop: 3,
            }}
          >
            Estudio de la Universidad de Duke
          </div>
        </div>
      </div>

      {/* 2. Portada 2.5D del Libro con Rebote e Inclinación */}
      <div
        style={{
          position: 'absolute',
          top: 290,
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
            width: 340,
            height: 510,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow:
              '0 30px 60px rgba(20, 20, 19, 0.18), 0 6px 16px rgba(20, 20, 19, 0.08)',
            border: '2px solid #141413',
            backgroundColor: '#FEF9C3',
          }}
        >
          <Img
            src={staticFile('assets/books/el-poder-de-los-habitos.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Ficha técnica debajo del libro en amarillo pálido */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '10px 22px',
            backgroundColor: '#FEF9C3',
            border: '2px solid #141413',
            borderRadius: 30,
            boxShadow: '0 4px 16px rgba(20, 20, 19, 0.05)',
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
            Charles Duhigg
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
            ★ 4.13 Goodreads
          </span>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#575550',
            }}
          >
            +585K lectores
          </span>
        </div>
      </div>

      {/* 3. Confrontación Cinética: Elección Consciente vs Piloto Automático */}
      <div
        style={{
          position: 'absolute',
          top: 920,
          left: 96,
          right: 96,
        }}
      >
        <ComparisonBattle
          titleA="Elección Consciente"
          subtitleA="Creemos que decidimos cada acción con la mente"
          tagA="ILUSIÓN DE CONTROL"
          titleB="Piloto Automático"
          subtitleB="Los ganglios basales ejecutan la conducta sin pensar"
          tagB="REALIDAD NEUROLÓGICA (40%)"
          metricB={{ value: 40, suffix: '% DÍA' }}
          enterFrameA={220}
          enterFrameB={260}
          battleFrame={290}
          accentColor="#D94E34"
        />
      </div>
    </div>
  );
};
