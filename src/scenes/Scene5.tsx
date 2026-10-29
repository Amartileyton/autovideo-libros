import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import { BookCover } from '../components/BookCover';
import {
  BIG,
  CTA_LAYOUT,
  KineticWords,
  PaleCard,
  SceneFrame,
  buildTokens,
} from '../components/big';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
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
 * Scene 5 — MANIFIESTO + CTA (kit BIG v3)
 *  Arriba: cita manifiesto en tipografía cinética grande (se queda toda la escena).
 *  Medio (hasta el CTA): ficha del libro grande; al entrar el CTA se retira.
 *  Abajo: tarjeta CTA con ranura para el reloj hero (CTA_LAYOUT.clockTop, volado desde Video.tsx).
 *  Fórmula CTA: anclaje de guardado + promesa de marca + una sola pregunta comunitaria corta.
 */
export const Scene5: React.FC<Scene5Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 0,
  enterFrame = 0,
  bookMetadata,
  visualData,
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const quote = visualData?.identityQuote ?? '';
  const ctaHeadline = visualData?.ctaHeadline ?? visualData?.ctaActionText ?? 'GUARDA ESTE RESUMEN';
  const handle = (visualData?.ctaHandle ?? '@en1minuto.es').toUpperCase();

  const quoteTokens = useMemo(
    () => buildTokens(quote, wordTimestamps, visualData?.highlightWords ?? [], 0),
    [quote, wordTimestamps, visualData?.highlightWords]
  );

  const t = useMemo(() => {
    const f = (kw: string | string[], fb: number, min = 0) =>
      findKeywordFrameWindow(wordTimestamps, kw, fb, fb + 30, min).startFrame;
    const bookT = Math.max(0, f(['arte'], 150, 100) - 8);
    const ctaT = f(['guarda'], 250, bookT + 20);
    const followT = f(['sigue'], 365, ctaT + 40);
    const promiseT = f(['minuto'], 390, followT);
    const questionT = f(['dominar'], 436, promiseT);
    return { bookT, ctaT, followT, promiseT, questionT };
  }, [wordTimestamps]);

  const headTokens = useMemo(
    () => buildTokens(ctaHeadline, wordTimestamps, ['guarda'], t.ctaT),
    [ctaHeadline, wordTimestamps, t.ctaT]
  );

  const popAt = (start: number) =>
    spring({ frame: Math.max(0, local - start), fps, config: SPRING_SNAPPY });

  const followP = popAt(t.followT);
  const promiseP = popAt(t.promiseT);
  const questionP = popAt(t.questionT);
  const saveP = popAt(Math.max(t.ctaT + 40, t.followT - 20));

  const rating = bookMetadata?.rating;

  return (
    <SceneFrame canvasOffsetX={canvasOffsetX} canvasOffsetY={canvasOffsetY}>
      {/* Manifiesto */}
      <div style={{ position: 'absolute', top: BIG.contentTop, left: BIG.sideMargin, right: BIG.sideMargin }}>
        <PaleCard frame={local} enterFrame={-4} from="top" style={{ padding: '38px 44px' }}>
          <KineticWords tokens={quoteTokens} frame={local} fontSize={74} lineHeight={1.1} />
        </PaleCard>
      </div>

      {/* Ficha del libro (se retira al entrar el CTA) */}
      <div style={{ position: 'absolute', top: 610, left: BIG.sideMargin, right: BIG.sideMargin }}>
        <PaleCard
          frame={local}
          enterFrame={t.bookT}
          exitFrame={t.ctaT - 6}
          from="left"
          style={{ padding: '30px 36px', display: 'flex', gap: 34, alignItems: 'center' }}
        >
          <BookCover bookMetadata={bookMetadata} width={250} height={370} borderRadius={14} variant="hero" />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: BIG.font,
                fontWeight: 800,
                fontSize: 62,
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                color: BIG.ink,
              }}
            >
              {bookMetadata?.title}
            </div>
            <div
              style={{
                fontFamily: BIG.font,
                fontWeight: 700,
                fontSize: 44,
                color: BIG.muted,
                marginTop: 14,
              }}
            >
              {bookMetadata?.author}
            </div>
            {rating ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 22,
                  backgroundColor: BIG.ink,
                  color: BIG.card,
                  borderRadius: 16,
                  padding: '6px 22px',
                  fontFamily: BIG.font,
                  fontWeight: 800,
                  fontSize: 46,
                }}
              >
                <span style={{ color: '#F59E0B' }}>★</span>
                {rating}
              </div>
            ) : null}
          </div>
        </PaleCard>
      </div>

      {/* CTA con ranura de reloj */}
      <div
        style={{
          position: 'absolute',
          top: CTA_LAYOUT.cardTop,
          left: BIG.sideMargin,
          right: BIG.sideMargin,
        }}
      >
        <PaleCard
          frame={local}
          enterFrame={t.ctaT - 4}
          from="bottom"
          borderColor={BIG.accent}
          style={{
            borderWidth: 5,
            padding: '30px 40px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          }}
        >
          {/* Ranura del reloj (el reloj vuela aquí desde Video.tsx) */}
          <div style={{ height: CTA_LAYOUT.clockSize + 6 }} />

          <KineticWords tokens={headTokens} frame={local} fontSize={56} lineHeight={1.08} />

          <div
            style={{
              opacity: Math.min(1, saveP * 1.6),
              transform: `scale(${interpolate(saveP, [0, 1], [0.8, 1], CLAMP_EXTRAPOLATION)})`,
              fontFamily: BIG.font,
              fontWeight: 800,
              fontSize: 38,
              color: BIG.ink,
              backgroundColor: BIG.cream,
              border: `3px solid ${BIG.ink}`,
              borderRadius: 999,
              padding: '8px 30px',
            }}
          >
            🔖 GUARDA EL RESUMEN
          </div>

          <div
            style={{
              opacity: Math.min(1, followP * 1.6),
              transform: `scale(${interpolate(followP, [0, 1], [0.8, 1], CLAMP_EXTRAPOLATION)})`,
              fontFamily: BIG.font,
              fontWeight: 800,
              fontSize: 48,
              color: BIG.cream,
              backgroundColor: BIG.accent,
              border: `3px solid ${BIG.ink}`,
              borderRadius: 28,
              padding: '20px 36px',
              boxShadow: '0 14px 30px rgba(217, 78, 52, 0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            🔔 SÍGUENOS · {handle}
          </div>

          <div
            style={{
              opacity: Math.min(1, promiseP * 1.6),
              fontFamily: BIG.font,
              fontWeight: 800,
              fontSize: 38,
              color: BIG.ink,
            }}
          >
            {visualData?.brandPromise ?? '1 libro clave cada día en 60 s'}
          </div>

          {visualData?.communityQuestion ? (
            <div
              style={{
                opacity: Math.min(1, questionP * 1.6),
                transform: `translateY(${(1 - questionP) * 20}px)`,
                fontFamily: BIG.font,
                fontWeight: 700,
                fontSize: 36,
                color: BIG.muted,
                textAlign: 'center',
              }}
            >
              💬 {visualData.communityQuestion}
            </div>
          ) : null}
        </PaleCard>
      </div>
    </SceneFrame>
  );
};
