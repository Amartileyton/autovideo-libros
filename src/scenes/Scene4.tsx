import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import { BIG, FS, PaleCard, SceneFrame, TriangleConnector } from '../components/big';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
import { findKeywordFrameWindow } from '../utils/wordTimingBinder';

export interface Scene4Props {
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

const CARD_H = 320;
const GAP_H = 75;
const ACCENTS = [BIG.accent, BIG.amber, BIG.green];

/**
 * Scene 4 — 3 LEYES ACCIONABLES (kit EDITORIAL PRO v4)
 * Cascada vertical de 3 tarjetas de 320px con numeral destacado, título conciso y regla de ≤ 6 palabras.
 * Conectores triangulares puros sin texto. Cada ley se enciende sincronizada a la locución.
 */
export const Scene4: React.FC<Scene4Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 0,
  enterFrame = 0,
  visualData,
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;
  const laws = (visualData?.actionableLaws ?? []).slice(0, 3);

  const starts = useMemo(() => {
    const result: number[] = [];
    laws.forEach((law, i) => {
      const fb = 100 + i * 110;
      const min = i === 0 ? 0 : result[i - 1] + 20;
      const raw = findKeywordFrameWindow(wordTimestamps, law.triggerKeyword ?? law.title, fb, fb + 40, min).startFrame;
      // La tarjeta entra ~14 fotogramas antes de la palabra clave para que llegue con la voz
      result.push(Math.max(min, raw - 14));
    });
    return result;
  }, [laws, wordTimestamps]);

  return (
    <SceneFrame canvasOffsetX={canvasOffsetX} canvasOffsetY={canvasOffsetY}>
      <div style={{ position: 'absolute', top: BIG.contentTop, left: BIG.sideMargin, right: BIG.sideMargin }}>
        {laws.map((law, i) => {
          const t = starts[i] ?? 9999;
          const nextT = starts[i + 1] ?? 99999;
          const lit = local >= t;
          const isActive = lit && local < nextT;
          const p = spring({ frame: Math.max(0, local - t), fps, config: SPRING_SNAPPY });
          const accent = ACCENTS[i % ACCENTS.length];
          const numScale = isActive ? interpolate(p, [0, 1], [1.25, 1], CLAMP_EXTRAPOLATION) : 1;

          return (
            <React.Fragment key={law.index}>
              <PaleCard
                frame={local}
                enterFrame={2 + i * 5}
                from="bottom"
                borderColor={lit ? (isActive ? accent : BIG.ink) : 'rgba(20,20,19,0.35)'}
                borderStyle={lit ? 'solid' : 'dashed'}
                restScale={isActive ? 1.02 : 1}
                style={{
                  height: CARD_H,
                  padding: '0 32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 28,
                  borderWidth: isActive ? 5 : 3,
                  opacity: lit ? 1 : 0.45,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 130,
                    height: 130,
                    borderRadius: 65,
                    backgroundColor: lit ? accent : 'transparent',
                    border: `4px solid ${lit ? BIG.ink : 'rgba(20,20,19,0.35)'}`,
                    color: lit ? BIG.cream : 'rgba(20,20,19,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: BIG.font,
                    fontWeight: 800,
                    fontSize: 80,
                    transform: `scale(${numScale})`,
                  }}
                >
                  {String(i + 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: BIG.font,
                      fontWeight: 800,
                      fontSize: 54,
                      lineHeight: 1.04,
                      letterSpacing: '-0.02em',
                      color: BIG.ink,
                    }}
                  >
                    {law.title}
                  </div>
                  <div
                    style={{
                      fontFamily: BIG.font,
                      fontWeight: 700,
                      fontSize: 32,
                      lineHeight: 1.18,
                      color: BIG.muted,
                      marginTop: 10,
                    }}
                  >
                    {law.shortRule ?? law.rule}
                  </div>
                </div>
              </PaleCard>
              {i < laws.length - 1 ? (
                <TriangleConnector
                  frame={local}
                  enterFrame={nextT - 6}
                  color={i === 0 ? BIG.accent : BIG.amber}
                  height={GAP_H}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </SceneFrame>
  );
};
