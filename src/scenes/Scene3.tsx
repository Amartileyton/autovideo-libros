import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import {
  BIG,
  FS,
  DiscardStamp,
  PaleCard,
  SceneFrame,
  Strike,
  TriangleConnector,
} from '../components/big';
import { CLAMP_EXTRAPOLATION } from '../theme/motion';
import { findKeywordFrameWindow } from '../utils/wordTimingBinder';

export interface Scene3Props {
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

const bigLabel: React.CSSProperties = {
  fontFamily: BIG.font,
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.04,
};

/**
 * Scene 3 — REGLA DE ORO / SUSTITUCIÓN (kit EDITORIAL PRO v4)
 * Mitad superior: sustitución A → B (A se tacha SOLO cuando la voz dice la palabra de descarte).
 * Mitad inferior: remate "EL MAYOR DIVIDENDO → ~~LUJOS~~ → AUTONOMÍA" con barra que se llena.
 */
export const Scene3: React.FC<Scene3Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 0,
  enterFrame = 0,
  visualData,
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const local = frame - enterFrame;
  const nodes = visualData?.circuitNodes ?? [];

  const swapFrom = visualData?.swapFrom ?? nodes[0]?.label ?? 'LO VIEJO';
  const swapTo = visualData?.swapTo ?? nodes[1]?.label ?? 'LO NUEVO';
  const payoffLead = visualData?.payoffLead ?? nodes[2]?.label ?? 'EL MAYOR DIVIDENDO';
  const payoffOld = visualData?.payoffOld ?? 'LUJOS';
  const payoffNew = visualData?.payoffNew ?? nodes[3]?.label ?? 'AUTONOMÍA';
  const payoffTail = visualData?.payoffTail ?? '';

  const t = useMemo(() => {
    const f = (kw: string | string[] | undefined, fb: number, min = 0) =>
      findKeywordFrameWindow(wordTimestamps, kw, fb, fb + 30, min).startFrame;
    const fromT = f(visualData?.swapFromTrigger ?? nodes[0]?.triggerKeyword ?? 'marcador', 60);
    const toT = f(visualData?.swapToTrigger ?? nodes[1]?.triggerKeyword ?? 'baremo', fromT + 30, fromT + 8);
    const leadT = f(visualData?.payoffLeadTrigger ?? 'dividendo', toT + 60, toT + 20);
    const oldT = f(visualData?.payoffOldTrigger ?? 'lujos', leadT + 50, leadT + 10);
    const newT = f(visualData?.payoffNewTrigger ?? 'autonomia', oldT + 20, oldT + 5);
    const tailT = f(visualData?.payoffTailTrigger ?? 'tiempo', newT + 30, newT + 5);
    return { fromT, toT, leadT, oldT, newT, tailT };
  }, [wordTimestamps, visualData, nodes]);

  const barFill = interpolate(local, [t.tailT - 20, t.tailT + 20], [0, 100], CLAMP_EXTRAPOLATION);
  const newVisible = local >= t.newT;

  return (
    <SceneFrame canvasOffsetX={canvasOffsetX} canvasOffsetY={canvasOffsetY}>
      {/* A → B */}
      <div
        style={{
          position: 'absolute',
          top: BIG.contentTop,
          left: BIG.sideMargin,
          right: BIG.sideMargin,
        }}
      >
        <PaleCard
          frame={local}
          enterFrame={-4}
          from="left"
          style={{ height: 180, padding: '0 38px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}
        >
          <div style={{ ...bigLabel, fontSize: 58, color: BIG.ink }}>
            <Strike frame={local} strikeFrame={t.toT - 4} thickness={8}>
              {swapFrom}
            </Strike>
          </div>
          <div style={{ opacity: local >= t.toT - 4 ? 1 : 0 }}>
            <DiscardStamp frame={local} strikeFrame={t.toT - 4} />
          </div>
        </PaleCard>

        <TriangleConnector frame={local} enterFrame={t.toT - 8} height={80} />

        <PaleCard
          frame={local}
          enterFrame={t.toT - 2}
          from="right"
          borderColor={BIG.accent}
          style={{ height: 180, padding: '0 38px', display: 'flex', alignItems: 'center', borderWidth: 5 }}
        >
          <div style={{ ...bigLabel, fontSize: 64, color: BIG.accent }}>{swapTo}</div>
        </PaleCard>
      </div>

      {/* REMATE */}
      <div
        style={{
          position: 'absolute',
          top: 620,
          left: BIG.sideMargin,
          right: BIG.sideMargin,
        }}
      >
        <PaleCard frame={local} enterFrame={t.leadT - 10} from="bottom" style={{ minHeight: 620, padding: '36px 40px' }}>
          <div style={{ ...bigLabel, fontSize: 44, color: BIG.muted, textAlign: 'center' }}>
            {payoffLead}
          </div>

          <div style={{ ...bigLabel, fontSize: 92, textAlign: 'center', marginTop: 22, color: BIG.ink, minHeight: 105 }}>
            <span style={{ opacity: local >= t.oldT - 30 ? 1 : 0 }}>
              <Strike frame={local} strikeFrame={t.oldT} thickness={10}>
                {payoffOld}
              </Strike>
            </span>
          </div>

          <div
            style={{
              ...bigLabel,
              fontSize: 88,
              textAlign: 'center',
              marginTop: 16,
              color: BIG.accent,
              minHeight: 100,
              opacity: newVisible ? 1 : 0,
              transform: `scale(${interpolate(local, [t.newT, t.newT + 8], [0.75, 1], CLAMP_EXTRAPOLATION)})`,
            }}
          >
            {payoffNew}
          </div>

          {payoffTail ? (
            <div
              style={{
                ...bigLabel,
                fontSize: 40,
                textAlign: 'center',
                marginTop: 14,
                color: BIG.ink,
                opacity: local >= t.tailT - 20 ? 1 : 0,
              }}
            >
              {payoffTail}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 30,
              height: 32,
              borderRadius: 16,
              border: `3px solid ${BIG.ink}`,
              backgroundColor: BIG.cream,
              overflow: 'hidden',
            }}
          >
            <div style={{ width: `${barFill}%`, height: '100%', backgroundColor: BIG.accent }} />
          </div>
        </PaleCard>
      </div>
    </SceneFrame>
  );
};
