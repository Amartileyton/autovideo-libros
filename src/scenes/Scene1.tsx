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
 * Scene 1 — Intro Viral de Retención (Inicio Warning + Portada Real + Pop-ups)
 * - 0.0s – 0.8s: Señal de alarma/warning parpadeante con sonido digital.
 * - Entrada limpia y elástica de la portada real del libro dentro de una caja estética moderna.
 * - Pop-up 1: Bestseller mundial (+15M de copias vendidas).
 * - Pop-up 2: Tarjeta oficial con logo de Goodreads + ★ 4.38 (1.9M de reseñas).
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

  const title = bookMetadata?.title ?? 'Hábitos Atómicos';
  const author = bookMetadata?.author ?? 'James Clear';
  const coverSrc =
    bookMetadata?.coverImage ?? 'assets/books/habitos-atomicos-cover.jpg';
  const rating = bookMetadata?.rating ?? 4.38;
  const ratingsCount = bookMetadata?.ratingsCount ?? '1.94M';

  // 1. Fase de alarma (primeros 26 fotogramas ~ 0.8s)
  const isAlarmPhase = localFrame < 26;
  const alarmBlink = localFrame % 8 < 4;
  const alarmFadeOut = interpolate(
    localFrame,
    [20, 28],
    [1, 0],
    CLAMP_EXTRAPOLATION
  );

  // 2. Entrada de la portada real del libro
  const bookEntrance = spring({
    frame: Math.max(0, localFrame - 22),
    fps,
    config: SPRING_SNAPPY,
  });

  const bookTranslateY = interpolate(
    bookEntrance,
    [0, 1],
    [80, 0],
    CLAMP_EXTRAPOLATION
  );
  const bookScale = interpolate(
    bookEntrance,
    [0, 1],
    [0.9, 1.0],
    CLAMP_EXTRAPOLATION
  );

  // 3. Pop-up de ventas (+15M de copias) — sincronizado a frame 175 ("Más de quince millones...")
  const salesEntrance = spring({
    frame: Math.max(0, localFrame - 175),
    fps,
    config: SPRING_SNAPPY,
  });

  // 4. Pop-up de Goodreads (logo + estrellas) — sincronizado a frame 245 ("...estrellas en Goodreads")
  const goodreadsEntrance = spring({
    frame: Math.max(0, localFrame - 245),
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
      }}
    >
      {/* SEÑAL DE WARNING / ALARMA PARPADEANTE (Primer segundo) */}
      {alarmFadeOut > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            opacity: alarmFadeOut,
            backgroundColor: alarmBlink
              ? 'rgba(239, 68, 68, 0.22)'
              : 'transparent',
          }}
        >
          <div
            style={{
              padding: '18px 36px',
              borderRadius: 16,
              backgroundColor: alarmBlink ? '#EF4444' : '#1C1917',
              border: '3px solid #EF4444',
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 44 }}>⚠️</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 34,
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.12em',
              }}
            >
              ALERTA DE LECTURA · 60s
            </span>
          </div>
        </div>
      )}

      {/* CABECERA DE LA SERIE ("UN LIBRO EN 60 SEGUNDOS") */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 96,
          right: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          opacity: bookEntrance,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 22px',
            borderRadius: 30,
            backgroundColor: '#DC2626',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.45)',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 22,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.1em',
            }}
          >
            UN LIBRO EN 60 SEGUNDOS
          </span>
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          {title.toUpperCase()}
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 24,
            fontWeight: 600,
            color: '#F59E0B',
            letterSpacing: '0.08em',
          }}
        >
          POR {author.toUpperCase()}
        </div>
      </div>

      {/* CAJA ESTÉTICA CON LA PORTADA REAL DEL LIBRO */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 510,
          transform: `translateX(-50%) translateY(${bookTranslateY}px) scale(${bookScale})`,
          opacity: bookEntrance,
          width: 460,
          height: 690,
          borderRadius: 24,
          padding: 10,
          backgroundColor: 'rgba(28, 28, 32, 0.85)',
          border: '2px solid rgba(255, 255, 255, 0.20)',
          boxShadow:
            '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(245, 158, 11, 0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(coverSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 16,
          }}
        />
      </div>

      {/* POP-UP 1: VENTAS (+15M DE COPIAS VENDIDAS) */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 980,
          padding: '16px 26px',
          borderRadius: 18,
          backgroundColor: '#1C1917',
          border: '2px solid #F59E0B',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75)',
          opacity: salesEntrance,
          transform: `scale(${salesEntrance}) rotate(-4deg)`,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          zIndex: 40,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
          }}
        >
          🔥
        </div>
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 26,
              fontWeight: 900,
              color: '#FFFFFF',
            }}
          >
            +15M COPIAS
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: '#FBBF24',
            }}
          >
            Nº 1 New York Times
          </div>
        </div>
      </div>

      {/* POP-UP 2: GOODREADS (LOGO OFICIAL + ESTRELLAS Y RESEÑAS) */}
      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 1140,
          padding: '18px 26px',
          borderRadius: 20,
          backgroundColor: '#F4F1EA',
          border: '2.5px solid #382110',
          boxShadow: '0 22px 50px rgba(0, 0, 0, 0.85)',
          opacity: goodreadsEntrance,
          transform: `scale(${goodreadsEntrance}) rotate(3deg)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 8,
          zIndex: 45,
          minWidth: 280,
        }}
      >
        {/* Logo oficial de Goodreads proporcionado por el usuario */}
        <Img
          src={staticFile('assets/goodreads-logo.png')}
          style={{
            height: 38,
            objectFit: 'contain',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 32,
              fontWeight: 900,
              color: '#1C1917',
            }}
          >
            ★ {rating}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 19,
              fontWeight: 600,
              color: '#57534E',
            }}
          >
            ({ratingsCount} reseñas)
          </span>
        </div>
      </div>
    </div>
  );
};
