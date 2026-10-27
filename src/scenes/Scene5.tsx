import React, { useMemo } from 'react';
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import { BRAND_CONFIG, CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
import { BookCover, CtaEndCard, KineticCard } from '../components/kinetic';
import { findKeywordFrameWindow } from '../utils/wordTimingBinder';

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
  layoutPreset?: SceneLayoutPreset;
  wordTimestamps?: WordTimestamp[];
}

/**
 * Scene 5 — El Manifiesto Final + Goodreads Oficial + Call To Action (Motor Híbrido Inteligente)
 * Soporta los 2 presets del cuestionario interactivo:
 * - CTA_MANIFESTO_GOODREADS (Default): Cita Manifiesto (KineticCard) + Ficha Goodreads con Logo Oficial y Cajas Diferenciadas + CtaEndCard
 * - CTA_EXECUTIVE_SUMMARY: Resumen Ejecutivo de 3 Puntos + CtaEndCard con Cronómetro Hero
 */
export const Scene5: React.FC<Scene5Props> = ({
  canvasOffsetX = 560,
  canvasOffsetY = 3960,
  enterFrame = 1655,
  bookMetadata,
  visualData,
  layoutPreset = 'CTA_MANIFESTO_GOODREADS',
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  const bookWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['poder', 'charles', 'duhigg'],
        170,
        255
      ),
    [wordTimestamps]
  );

  const ctaWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['guarda', 'resumen', 'empieza'],
        260,
        395
      ),
    [wordTimestamps]
  );

  // 1. Ficha de Mini Portada y Reconocimiento con cajas diferenciadas
  const bookPillEntrance = spring({
    frame: Math.max(0, localFrame - bookWindow.startFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  const badgePop = spring({
    frame: Math.max(0, localFrame - (bookWindow.startFrame + 12)),
    fps,
    config: SPRING_SNAPPY,
  });

  const summaryPoints = visualData?.executiveSummaryPoints ?? [
    '1. Identifica la Señal y el Anhelo que disparan tu conducta.',
    '2. Sustituye únicamente la Rutina conservando la misma Recompensa.',
    '3. Enfócate en 1 Hábito Angular para desatar el efecto dominó.',
  ];

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
      {/* 1. Bloque Superior según layoutPreset: Manifiesto o Resumen Ejecutivo de 3 Puntos */}
      <div style={{ position: 'absolute', top: 150, left: 96, right: 96 }}>
        {layoutPreset === 'CTA_EXECUTIVE_SUMMARY' ? (
          <KineticCard
            enterFrame={10}
            accentBorderColor="#141413"
            badgeColor="#D94E34"
            padding="22px 26px"
            style={{
              borderTop: '6px solid #D94E34',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {summaryPoints.map((pt) => (
                <div
                  key={pt}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#141413',
                    lineHeight: 1.32,
                  }}
                >
                  {pt}
                </div>
              ))}
            </div>
          </KineticCard>
        ) : (
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
        )}
      </div>

      {/* 2. Ficha Libro + Píldoras Diferenciadas con Logo Oficial de Goodreads */}
      <div
        style={{
          position: 'absolute',
          top: 355,
          left: 96,
          right: 96,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        {/* Caja A: Mini-Portada + Título y Autor */}
        <div
          style={{
            flex: 1,
            opacity: bookPillEntrance,
            transform: `translateY(${(1 - bookPillEntrance) * 16}px) scale(${interpolate(
              bookPillEntrance,
              [0, 1],
              [0.95, 1],
              CLAMP_EXTRAPOLATION
            )})`,
            backgroundColor: '#FEF9C3',
            border: '2px solid #141413',
            borderBottom: '4px solid #141413',
            borderRadius: 18,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 6px 20px rgba(20, 20, 19, 0.06)',
          }}
        >
          <BookCover
            bookMetadata={bookMetadata}
            width={50}
            height={75}
            borderRadius={6}
            variant="mini"
          />
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 18,
                fontWeight: 900,
                color: '#141413',
              }}
            >
              {bookMetadata?.title ?? 'El poder de los hábitos'}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: '#575550',
                marginTop: 4,
              }}
            >
              {bookMetadata?.author ?? 'Charles Duhigg'} ·{' '}
              {bookMetadata?.pages ?? 375} págs.
            </div>
          </div>
        </div>

        {/* Caja B Diferenciada: Logo Oficial de Goodreads + Calificación + Lectores */}
        <div
          style={{
            opacity: badgePop,
            transform: `translateY(${(1 - badgePop) * 18}px) scale(${interpolate(
              badgePop,
              [0, 1],
              [0.9, 1],
              CLAMP_EXTRAPOLATION
            )})`,
            backgroundColor: '#FEF9C3',
            border: '2px solid #141413',
            borderBottom: '4px solid #D97706',
            borderRadius: 18,
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 8px 22px rgba(217, 119, 6, 0.14)',
          }}
        >
          <Img
            src={staticFile('assets/branding/goodreads-logo.png')}
            style={{
              height: 17,
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                backgroundColor: '#141413',
                color: '#FEF9C3',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                fontWeight: 900,
                padding: '3px 9px',
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ color: '#F59E0B' }}>★</span>
              {bookMetadata?.rating ?? 4.13}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: '#D94E34',
                fontWeight: 800,
              }}
            >
              +{bookMetadata?.ratingsCount ?? '585K'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tarjeta Final de Call To Action (CTA) de Alto Rendimiento */}
      <div style={{ position: 'absolute', top: 490, left: 96, right: 96 }}>
        <CtaEndCard
          enterFrame={ctaWindow.startFrame}
          handle={BRAND_CONFIG.channelHandle}
          ctaText={visualData?.ctaPrompt ? 'Guarda este resumen y empieza hoy mismo' : undefined}
          ctaActionLabel={visualData?.ctaActionText ?? 'GUARDA ESTE RESUMEN'}
          showCommunityQuestion={visualData?.showCommunityQuestion ?? true}
          questionText={
            visualData?.ctaPrompt ??
            'Para empezar hoy mismo tras guardar el resumen: ¿cuál es el mal hábito que vas a sustituir?'
          }
        />
      </div>
    </div>
  );
};
