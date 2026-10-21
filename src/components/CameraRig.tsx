import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  type BlueprintModeId,
  CLAMP_EXTRAPOLATION,
  PALETTE,
  SPRING_CAMERA,
} from '../theme/motion';
import { BlueprintSurface } from './blueprints/ResultaaqueeBlueprints';

export interface CameraKeyframe {
  frame: number;
  x: number;
  y: number;
  zoom: number;
  rotateDeg?: number;
}

export interface CameraRigProps {
  keyframes: CameraKeyframe[];
  surfaceColor?: string;
  /** Modo de superficie @resultaaquee (BLUEPRINT_BLUE, DARK_CAD_XRAY, TOPOLOGY_WIREFRAME, CHRONO_OSCILLOSCOPE, EDITORIAL_PAPER) */
  blueprintMode?: BlueprintModeId;
  /** Activa el desenfoque óptico breve (Rack-Focus Blur) al cambiar de plano (Ref 3) */
  rackFocusBlur?: boolean;
  children: React.ReactNode;
}

/**
 * CameraRig — Aparejo de Cámara Continua sobre Lienzo Único (@resultaaquee Edition)
 * Impulsado exclusivamente por SPRING_CAMERA ({ damping: 30, stiffness: 90, mass: 1.2 })
 * y useCurrentFrame(). Incluye soporte opcional para Rack-Focus Blur en transiciones.
 */
export const CameraRig: React.FC<CameraRigProps> = ({
  keyframes,
  surfaceColor = PALETTE.surface,
  blueprintMode,
  rackFocusBlur = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  let currentX = keyframes[0]?.x ?? 0;
  let currentY = keyframes[0]?.y ?? 0;
  let currentZoom = keyframes[0]?.zoom ?? 1;
  let currentRotate = keyframes[0]?.rotateDeg ?? 0;
  let activeBlurPx = 0;

  for (let i = 1; i < keyframes.length; i++) {
    const next = keyframes[i];
    if (frame >= next.frame) {
      const elapsed = frame - next.frame;
      const progress = spring({
        frame: elapsed,
        fps,
        config: SPRING_CAMERA,
      });

      currentX = interpolate(
        progress,
        [0, 1],
        [currentX, next.x],
        CLAMP_EXTRAPOLATION
      );
      currentY = interpolate(
        progress,
        [0, 1],
        [currentY, next.y],
        CLAMP_EXTRAPOLATION
      );
      currentZoom = interpolate(
        progress,
        [0, 1],
        [currentZoom, next.zoom],
        CLAMP_EXTRAPOLATION
      );
      currentRotate = interpolate(
        progress,
        [0, 1],
        [currentRotate, next.rotateDeg ?? 0],
        CLAMP_EXTRAPOLATION
      );

      // Desenfoque óptico breve (Rack-Focus) durante los primeros 10 fotogramas del cambio de plano (Ref 3)
      if (rackFocusBlur && elapsed <= 10) {
        const blurPulse = interpolate(
          elapsed,
          [0, 4, 10],
          [0, 5.5, 0],
          CLAMP_EXTRAPOLATION
        );
        activeBlurPx = Math.max(activeBlurPx, blurPulse);
      }
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: surfaceColor,
        overflow: 'hidden',
      }}
    >
      {blueprintMode ? (
        <BlueprintSurface
          mode={blueprintMode}
          cameraX={currentX}
          cameraY={currentY}
        />
      ) : (
        /* Cuadrícula técnica por defecto cuando no se especifica blueprintMode */
        <svg
          width={width}
          height={height}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <pattern
              id="editorial-grid"
              width={72}
              height={72}
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${-currentX * 0.25}, ${-currentY * 0.25})`}
            >
              <path
                d="M 72 0 L 0 0 0 72"
                fill="none"
                stroke={PALETTE.gridLine}
                strokeWidth={1.5}
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#editorial-grid)" />
        </svg>
      )}

      {/* Lienzo continuo transformado matemáticamente con Rack-Focus óptico */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transformOrigin: `${width / 2}px ${height / 2}px`,
          transform: `translate3d(${-currentX}px, ${-currentY}px, 0) scale(${currentZoom}) rotate(${currentRotate}deg)`,
          filter: activeBlurPx > 0.1 ? `blur(${activeBlurPx.toFixed(2)}px)` : 'none',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
