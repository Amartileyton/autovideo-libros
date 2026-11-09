import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import { BookCover } from '../components/BookCover';
import {
  BIG,
  FS,
  BadgeStickers,
  KineticWords,
  PaleCard,
  SceneFrame,
  buildTokens,
} from '../components/big';
import { CLAMP_EXTRAPOLATION } from '../theme/motion';
import { findKeywordFrameWindow } from '../utils/wordTimingBinder';

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
  layoutPreset?: SceneLayoutPreset;
  wordTimestamps?: WordTimestamp[];
}

/**
 * Scene 1 — GANCHO + Leo Host (kit EDITORIAL PRO v4)
 *  0 → ~3 s : frase gancho con Leo animado visible desde el fotograma 0 (modo karaoke).
 *  ~3 → 6 s : la frase se compacta y entra la portada grande + 3 stickers (autor • valoración • lectores).
 *  ~6 → 12 s: duelo A vs B a pantalla completa con etiquetas de 2-3 palabras calibradas para Safe Zone.
 * Zona de contenido: top 80 → bottom 1390 (subtítulos en top 1442).
 */
export const Scene1: React.FC<Scene1Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 0,
  enterFrame = 0,
  bookMetadata,
  visualData,
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  // Fotograma local de escena; negativo durante el pre-roll de audio (12 fotogramas)
  const local = frame - enterFrame;

  const hookText =
    visualData?.hookText ??
    visualData?.provocativeQuestion ??
    '¿Por qué esto no funciona como crees?';

  const hookTokens = useMemo(
    () =>
      buildTokens(
        hookText,
        wordTimestamps,
        visualData?.hookHighlight ?? (visualData?.provocativeHighlight ? [visualData.provocativeHighlight] : []),
        0
      ),
    [hookText, wordTimestamps, visualData?.hookHighlight, visualData?.provocativeHighlight]
  );

  // Instante en que termina de pronunciarse la frase gancho → arranca la fase 2
  const hookEnd = useMemo(() => {
    const last = hookTokens[hookTokens.length - 1];
    return last ? last.start + 26 : 90;
  }, [hookTokens]);

  const coverStart = hookEnd + 8;

  const duelAStart = useMemo(
    () =>
      findKeywordFrameWindow(wordTimestamps, visualData?.duelATrigger ?? 'habilidad', 184, 220, coverStart)
        .startFrame,
    [wordTimestamps, visualData?.duelATrigger, coverStart]
  );
  const duelBStart = useMemo(
    () =>
      findKeywordFrameWindow(wordTimestamps, visualData?.duelBTrigger ?? 'arte', 270, 300, duelAStart + 10)
        .startFrame,
    [wordTimestamps, visualData?.duelBTrigger, duelAStart]
  );
  const tagStart = useMemo(
    () =>
      findKeywordFrameWindow(wordTimestamps, visualData?.duelTagTrigger ?? 'casi', duelBStart + 30, duelBStart + 50, duelBStart)
        .startFrame,
    [wordTimestamps, visualData?.duelTagTrigger, duelBStart]
  );

  // El gancho se compacta al terminar de hablarse (reflujo controlado, determinista)
  const hookFont = interpolate(local, [hookEnd, hookEnd + 20], [FS.hero, FS.title], CLAMP_EXTRAPOLATION);

  const coverExit = duelAStart - 6;

  return (
    <SceneFrame canvasOffsetX={canvasOffsetX} canvasOffsetY={canvasOffsetY}>
      {/* 1. GANCHO: visible desde el primer fotograma (tarjeta ya asentada, texto en karaoke) */}
      <div style={{ position: 'absolute', top: BIG.contentTop, left: BIG.sideMargin, right: BIG.sideMargin }}>
        <PaleCard frame={local} enterFrame={-30} style={{ padding: '34px 40px' }}>
          <KineticWords
            tokens={hookTokens}
            frame={local}
            fontSize={hookFont}
            mode="karaoke"
            lineHeight={1.08}
          />
        </PaleCard>
      </div>

      {/* 2. PORTADA + 3 stickers */}
      <div
        style={{
          position: 'absolute',
          top: 450,
          left: BIG.sideMargin,
          right: BIG.sideMargin,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          opacity: interpolate(local, [coverExit, coverExit + 10], [1, 0], CLAMP_EXTRAPOLATION),
        }}
      >
        <PaleCard
          frame={local}
          enterFrame={coverStart}
          from="scale"
          tiltDeg={interpolate(local, [coverStart, coverStart + 60], [-4, 2], CLAMP_EXTRAPOLATION)}
          fill="transparent"
          borderColor="transparent"
          style={{ padding: 0, boxShadow: 'none', borderRadius: 0 }}
        >
          <BookCover bookMetadata={bookMetadata} width={380} height={560} borderRadius={18} variant="hero" />
        </PaleCard>
        <BadgeStickers
          frame={local}
          startFrame={coverStart + 12}
          author={bookMetadata?.author ?? ''}
          rating={bookMetadata?.rating ?? ''}
          ratingsCount={bookMetadata?.ratingsCount ?? ''}
          ratingSource={bookMetadata?.ratingSource}
          ratingDate={bookMetadata?.ratingDate}
        />
      </div>

      {/* 3. DUELO A vs B a pantalla completa */}
      <div
        style={{
          position: 'absolute',
          top: 470,
          left: BIG.sideMargin,
          right: BIG.sideMargin,
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        <PaleCard frame={local} enterFrame={duelAStart} from="left" style={{ padding: '30px 40px' }}>
          <div style={{ fontFamily: BIG.font, fontWeight: 800, fontSize: FS.small, color: BIG.muted }}>
            {visualData?.duelALabel ?? 'LO FÁCIL'}
          </div>
          <div
            style={{
              fontFamily: BIG.font,
              fontWeight: 800,
              fontSize: FS.title,
              lineHeight: 1.05,
              color: BIG.ink,
              marginTop: 6,
            }}
          >
            {visualData?.duelAValue ?? 'HABILIDAD TÉCNICA'}
          </div>
        </PaleCard>

        <PaleCard
          frame={local}
          enterFrame={duelBStart}
          from="right"
          borderColor={BIG.accent}
          style={{ padding: '30px 40px', borderWidth: 5 }}
        >
          <div style={{ fontFamily: BIG.font, fontWeight: 800, fontSize: FS.small, color: BIG.accent }}>
            {visualData?.duelBLabel ?? 'LO DIFÍCIL'}
          </div>
          <div
            style={{
              fontFamily: BIG.font,
              fontWeight: 800,
              fontSize: FS.title,
              lineHeight: 1.05,
              color: BIG.accent,
              marginTop: 6,
            }}
          >
            {visualData?.duelBValue ?? 'ARTE EMOCIONAL'}
          </div>
          {visualData?.duelBTag ? (
            <div style={{ marginTop: 18, opacity: local >= tagStart ? 1 : 0 }}>
              <DiscardStampSlot frame={local} start={tagStart} text={visualData.duelBTag} />
            </div>
          ) : null}
        </PaleCard>
      </div>
    </SceneFrame>
  );
};

/** Etiqueta de remate (sello) que entra con rebote cuando la voz dice la palabra clave. */
const DiscardStampSlot: React.FC<{ frame: number; start: number; text: string }> = ({
  frame,
  start,
  text,
}) => {
  const scale = interpolate(frame, [start, start + 8], [1.4, 1], CLAMP_EXTRAPOLATION);
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: BIG.font,
        fontWeight: 800,
        fontSize: 32,
        color: BIG.cream,
        backgroundColor: BIG.ink,
        padding: '6px 22px',
        borderRadius: 14,
        transform: `scale(${scale}) rotate(-2deg)`,
      }}
    >
      {text}
    </span>
  );
};
