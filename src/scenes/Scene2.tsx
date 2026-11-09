import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import {
  BIG,
  FS,
  KineticWords,
  PaleCard,
  SceneFrame,
  TriangleConnector,
  buildTokens,
} from '../components/big';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
import { findKeywordFrameWindow } from '../utils/wordTimingBinder';

export interface Scene2Props {
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

const STATION_H = 175;
const GAP_H = 64;
const STACK_TOP = 340;

/**
 * Scene 2 — TESIS / CIRCUITO (kit EDITORIAL PRO v4)
 * Titular corto en tarjeta + 4 estaciones que se encienden al ritmo de la voz,
 * unidas por conectores triangulares limpios. Sin subtítulos internos.
 */
export const Scene2: React.FC<Scene2Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 0,
  enterFrame = 0,
  visualData,
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const nodes = visualData?.circuitNodes ?? [];
  const headline = visualData?.thesisHeadline ?? visualData?.growthMetric ?? 'LA TESIS';
  const headTokens = useMemo(
    () => buildTokens(headline, wordTimestamps, visualData?.thesisHighlight ?? [], 4),
    [headline, wordTimestamps, visualData?.thesisHighlight]
  );

  // Fotograma de encendido de cada estación (auto-binder con las palabras de la voz)
  const starts = useMemo(() => {
    const result: number[] = [];
    nodes.forEach((n, i) => {
      const fallback = 70 + i * 55;
      const min = i === 0 ? 0 : result[i - 1] + 10;
      result.push(
        findKeywordFrameWindow(wordTimestamps, n.triggerKeyword ?? n.label, fallback, fallback + 40, min)
          .startFrame
      );
    });
    return result;
  }, [nodes, wordTimestamps]);

  return (
    <SceneFrame canvasOffsetX={canvasOffsetX} canvasOffsetY={canvasOffsetY}>
      <div style={{ position: 'absolute', top: BIG.contentTop, left: BIG.sideMargin, right: BIG.sideMargin }}>
        <PaleCard frame={local} enterFrame={-4} from="top" style={{ padding: '26px 40px' }}>
          <KineticWords tokens={headTokens} frame={local} fontSize={FS.title} lineHeight={1.06} />
        </PaleCard>
      </div>

      <div style={{ position: 'absolute', top: STACK_TOP, left: BIG.sideMargin, right: BIG.sideMargin }}>
        {nodes.map((n, i) => {
          const t = starts[i] ?? 9999;
          const nextT = starts[i + 1] ?? 99999;
          const isActive = local >= t && local < nextT;
          const isDone = local >= nextT;
          const isLast = i === nodes.length - 1;
          const p = spring({ frame: Math.max(0, local - t), fps, config: SPRING_SNAPPY });
          const lit = local >= t;

          const fill = isActive ? (isLast ? BIG.ink : BIG.accent) : lit ? BIG.card : BIG.cream;
          const textColor = isActive ? BIG.cream : lit ? BIG.ink : 'rgba(20, 20, 19, 0.42)';
          const scale = isActive ? interpolate(p, [0, 1], [1, 1.03], CLAMP_EXTRAPOLATION) : 1;

          return (
            <React.Fragment key={n.id}>
              <PaleCard
                frame={local}
                enterFrame={4 + i * 4}
                from="bottom"
                fill={fill}
                borderStyle={lit ? 'solid' : 'dashed'}
                borderColor={lit ? BIG.ink : 'rgba(20, 20, 19, 0.35)'}
                restScale={scale}
                style={{
                  height: STATION_H,
                  padding: '0 32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 26,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 92,
                    height: 92,
                    borderRadius: 46,
                    border: `3px solid ${isActive ? BIG.cream : lit ? BIG.ink : 'rgba(20,20,19,0.35)'}`,
                    backgroundColor: isActive ? 'rgba(255,251,235,0.16)' : isDone ? BIG.ink : 'transparent',
                    color: isDone ? BIG.card : textColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: BIG.font,
                    fontWeight: 800,
                    fontSize: 44,
                  }}
                >
                  {isDone ? '✓' : n.num}
                </div>
                <div
                  style={{
                    fontFamily: BIG.font,
                    fontWeight: 800,
                    fontSize: 52,
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    color: textColor,
                  }}
                >
                  {n.label}
                </div>
              </PaleCard>
              {i < nodes.length - 1 ? (
                <TriangleConnector
                  frame={local}
                  enterFrame={nextT - 4}
                  color={i === 1 ? BIG.amber : BIG.accent}
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
