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
 *
 * Distribución vertical balanceada que ocupa toda la pantalla de arriba hacia abajo (90px a 1580px):
 * 1. Manifiesto / Cita Editorial: top 90px a 360px
 * 2. Ficha Libro + Píldoras Diferenciadas de Goodreads: top 420px a 700px
 * 3. CtaEndCard con ranura acoplada para el Cronómetro Hero: top 760px a 1580px
 */
export const Scene5: React.FC<Scene5Props> = ({
  canvasOffsetX = 560,
  canvasOffsetY = 3960,
  enterFrame = 1548,
  bookMetadata,
  visualData,
  layoutPreset = 'CTA_MANIFESTO_GOODREADS',
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // Ventana para el bloque del libro (frame ~170-240 cuando se menciona el libro)
  const bookWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['doce', 'reglas', 'vivir', 'jordan', 'peterson'],
        170,
        250
      ),
    [wordTimestamps]
  );

  // 1. Ficha de Mini Portada y Reconocimiento con cajas diferenciadas (frame 170)
  const bookPillEntrance = spring({
    frame: Math.max(0, localFrame - (bookWindow.startFrame - 15)),
    fps,
    config: SPRING_SNAPPY,
  });

  const badgePop = spring({
    frame: Math.max(0, localFrame - (bookWindow.startFrame - 5)),
    fps,
    config: SPRING_SNAPPY,
  });

  // CTA Card entra suavemente en localFrame = 180 para preparar el aterrizaje del reloj volador
  const ctaCardEntranceFrame = 180;

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
      {/* 1. Bloque Superior: Manifiesto de Gran Formato y Legibilidad (top: 90px a 360px) */}
      <div style={{ position: 'absolute', top: 90, left: 54, right: 54 }}>
        <KineticCard
          enterFrame={10}
          accentBorderColor="#141413"
          badgeColor="#D94E34"
          padding="38px 44px"
          style={{
            borderTop: '8px solid #D94E34',
          }}
        >
          <blockquote
            style={{
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 34,
              fontWeight: 900,
              fontStyle: 'normal',
              lineHeight: 1.38,
              color: '#141413',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            {visualData?.identityQuote ? (
              visualData.identityQuote.includes('antídoto real frente al caos') ? (
                <>
                  «Asumir la carga de tu propio destino es el{' '}
                  <span
                    style={{
                      backgroundColor: 'rgba(217, 78, 52, 0.16)',
                      padding: '2px 12px',
                      borderRadius: 6,
                      color: '#D94E34',
                      fontWeight: 900,
                    }}
                  >
                    antídoto real frente al caos
                  </span>
                  .»
                </>
              ) : (
                `«${visualData.identityQuote}»`
              )
            ) : (
              '«Asumir la carga de tu propio destino es el único antídoto real frente al caos.»'
            )}
          </blockquote>
        </KineticCard>
      </div>

      {/* 2. Ficha Libro + Píldoras Diferenciadas con Logo Oficial de Goodreads (top: 420px a 700px) */}
      <div
        style={{
          position: 'absolute',
          top: 420,
          left: 54,
          right: 54,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        {/* Caja A: Mini-Portada + Título y Autor */}
        <div
          style={{
            flex: 1.15,
            opacity: bookPillEntrance,
            transform: `translateY(${(1 - bookPillEntrance) * 16}px) scale(${interpolate(
              bookPillEntrance,
              [0, 1],
              [0.94, 1],
              CLAMP_EXTRAPOLATION
            )})`,
            backgroundColor: '#FEF9C3',
            border: '2.5px solid #141413',
            borderBottom: '5px solid #141413',
            borderRadius: 24,
            padding: '22px 30px',
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            boxShadow: '0 10px 28px rgba(20, 20, 19, 0.08)',
          }}
        >
          <BookCover
            bookMetadata={bookMetadata}
            width={84}
            height={122}
            borderRadius={8}
            variant="mini"
          />
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 26,
                fontWeight: 900,
                color: '#141413',
                lineHeight: 1.2,
              }}
            >
              {bookMetadata?.title ?? '12 reglas para vivir'}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: '#575550',
                marginTop: 6,
              }}
            >
              {bookMetadata?.author ?? 'Jordan B. Peterson'} ·{' '}
              {bookMetadata?.pages ?? 512} págs.
            </div>
          </div>
        </div>

        {/* Caja B Diferenciada: Logo Oficial de Goodreads + Calificación + Lectores */}
        <div
          style={{
            flex: 0.85,
            opacity: badgePop,
            transform: `translateY(${(1 - badgePop) * 18}px) scale(${interpolate(
              badgePop,
              [0, 1],
              [0.9, 1],
              CLAMP_EXTRAPOLATION
            )})`,
            backgroundColor: '#FEF9C3',
            border: '2.5px solid #141413',
            borderBottom: '5px solid #D97706',
            borderRadius: 24,
            padding: '22px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: '0 12px 32px rgba(217, 119, 6, 0.16)',
          }}
        >
          <Img
            src={staticFile('assets/branding/goodreads-logo.png')}
            style={{
              height: 28,
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                backgroundColor: '#141413',
                color: '#FEF9C3',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 19,
                fontWeight: 900,
                padding: '6px 16px',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ color: '#F59E0B', fontSize: 19 }}>★</span>
              {bookMetadata?.rating ?? 3.90}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 17,
                color: '#D94E34',
                fontWeight: 900,
              }}
            >
              +{bookMetadata?.ratingsCount ?? '240K'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tarjeta Final de Call To Action (CTA) con ranura para el reloj volador (top: 760px a 1580px) */}
      <div style={{ position: 'absolute', top: 760, left: 54, right: 54 }}>
        <CtaEndCard
          enterFrame={ctaCardEntranceFrame}
          handle={BRAND_CONFIG.channelHandle}
          ctaText="Guarda este resumen y empieza hoy mismo"
          ctaActionLabel={visualData?.ctaActionText ?? "GUARDA ESTE RESUMEN Y EMPIEZA HOY MISMO"}
          showCommunityQuestion={visualData?.showCommunityQuestion ?? true}
          questionText={
            visualData?.ctaPrompt ??
            'Para empezar hoy mismo tras guardar el resumen: ¿cuál es el rincón de tu vida o habitación que vas a poner en orden hoy?'
          }
          showInternalStopwatch={false}
        />
      </div>
    </div>
  );
};
