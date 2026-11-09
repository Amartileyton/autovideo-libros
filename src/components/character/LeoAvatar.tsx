import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { WordTimestamp } from '../../data/schema';
import {
  computeContinuousSpeechEnvelope,
  solveCharacterRigState,
  type CharacterEmotion,
  type CharacterLookAt,
  type CharacterRigState,
  type EmotionKeyframe,
} from '../../engine/characterAnimationEngine';
import { renderLeoMeshToCanvas } from './leoMeshEngine';

export type LeoEmotion = CharacterEmotion;
export type LeoLookAt = CharacterLookAt;

export interface LeoAvatarProps {
  /** Fotograma actual (por defecto useCurrentFrame()) */
  frame?: number;
  /** Indica si la locución está activa en este fotograma */
  isSpeaking?: boolean;
  /** Lista opcional de wordTimestamps para modular sílabas automáticamente con envolvente C1 */
  wordTimestamps?: WordTimestamp[];
  /** Intensidad de habla (0.0 a 1.0) para modular la amplitud mandibular */
  speechIntensity?: number;
  /** Expresión emocional */
  emotion?: LeoEmotion;
  /** Cronograma opcional de emociones para transiciones C1 suaves sin saltos */
  emotionSchedule?: EmotionKeyframe[];
  /** Dirección de mirada / giro sutil */
  lookAt?: LeoLookAt;
  /** Diámetro / tamaño en píxeles */
  size?: number;
  /** 'badge' incluye el medallón marfil hundido; 'cutout' recorta solo el busto */
  variant?: 'badge' | 'cutout' | 'card';
  /** Parámetros de auditoría para forzar estados en láminas estáticas */
  forcedOpen?: number;
  forcedLipSpread?: number;
  forcedBlink?: number;
  forcedTurnX?: number;
  /** Muestra la malla de triángulos de Delaunay superpuesta para diagnóstico técnico */
  showWireframe?: boolean;
  /** Activa el perfil temporizador circular perimetral alrededor del medallón */
  showProgressRing?: boolean;
  /** Progreso normalizado (0.0 a 1.0) de la duración total del vídeo */
  progress?: number;
  /** Estilo visual del anillo temporizador ('chrono-dot' Estilo 1 por defecto) */
  ringStyle?: 'chrono-dot' | 'minimal' | 'bezel-ticks';
  /** Color activo del perfil temporizador (por defecto Terracota #D94E34) */
  ringColor?: string;
  style?: React.CSSProperties;
}

// Caché de módulo por URL para no recargar `leo-master.png` ni `leo-master-cutout.png` entre fotogramas
const cachedImages = new Map<string, HTMLImageElement>();
const imagePromises = new Map<string, Promise<HTMLImageElement>>();

function ensureMasterImageLoaded(src: string): Promise<HTMLImageElement> {
  const existing = cachedImages.get(src);
  if (existing) {
    return Promise.resolve(existing);
  }
  const pending = imagePromises.get(src);
  if (pending) {
    return pending;
  }
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedImages.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => {
      imagePromises.delete(src);
      reject(err);
    };
    img.src = src;
  });
  imagePromises.set(src, promise);
  return promise;
}

/**
 * LeoAvatar — Conectado al Motor de Animación de Personajes (`src/engine/characterAnimationEngine.ts`)
 *
 * GARANTÍA 100% CÓDIGO DETERMINISTA (CERO IA, CERO BORDES, CEJAS RÍGIDAS Y PELO ESTABLE):
 * - Utiliza una única imagen maestra intacta sin cortes (`leo-master.png`).
 * - Conecta 153 nodos anatómicos con `d3-delaunay`:
 *   - Fila `forehead_buffer` fija que aísla el 100% del cabello del movimiento de cejas.
 *   - Cejas de espesor rígido (borde superior e inferior se desplazan idénticos -> 0% ensanchamiento).
 *   - Interpolación emocional C1 continua y envolvente de voz sin saltos entre palabras.
 */
export const LeoAvatar: React.FC<LeoAvatarProps> = ({
  frame: propFrame,
  isSpeaking: propIsSpeaking,
  wordTimestamps,
  speechIntensity = 1.0,
  emotion = 'explaining',
  emotionSchedule,
  lookAt = 'center',
  size = 280,
  variant = 'badge',
  forcedOpen,
  forcedLipSpread,
  forcedBlink,
  forcedTurnX,
  showWireframe = false,
  showProgressRing = false,
  progress = 0,
  ringStyle = 'chrono-dot',
  ringColor = '#D94E34',
  style,
}) => {
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = propFrame ?? currentFrame;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const masterSrc = useMemo(
    () =>
      staticFile(
        variant === 'cutout'
          ? 'assets/character/leo-v2/leo-master-cutout.png'
          : 'assets/character/leo-v2/leo-master.png'
      ),
    [variant]
  );

  const [masterImg, setMasterImg] = useState<HTMLImageElement | null>(
    () => cachedImages.get(masterSrc) ?? null
  );

  useEffect(() => {
    const existing = cachedImages.get(masterSrc);
    if (existing) {
      setMasterImg(existing);
      return;
    }
    const handle = delayRender(`Loading ${masterSrc} for Delaunay mesh`);
    ensureMasterImageLoaded(masterSrc)
      .then((img) => {
        setMasterImg(img);
        continueRender(handle);
      })
      .catch((err) => {
        console.error('Error loading master image:', err);
        continueRender(handle);
      });
  }, [masterSrc]);

  // Envolvente continua de voz (sin caídas bruscas entre palabras adyacentes ni signos de puntuación)
  const speechInfo = useMemo(
    () => computeContinuousSpeechEnvelope(frame, wordTimestamps),
    [frame, wordTimestamps]
  );

  const isSpeaking = propIsSpeaking ?? speechInfo.isSpeaking;
  const speechEnvelope =
    wordTimestamps && wordTimestamps.length > 0
      ? speechInfo.envelope
      : isSpeaking
      ? 1.0
      : 0.0;

  // Resolución determinista del estado del rig mediante el Motor de Animación de Personajes
  const rigState: CharacterRigState = useMemo(
    () =>
      solveCharacterRigState({
        frame,
        fps,
        isSpeaking,
        speechEnvelope,
        speechIntensity,
        emotion,
        emotionSchedule,
        lookAt,
        forcedOpen,
        forcedLipSpread,
        forcedBlink,
        forcedTurnX,
      }),
    [
      frame,
      fps,
      isSpeaking,
      speechEnvelope,
      speechIntensity,
      emotion,
      emotionSchedule,
      lookAt,
      forcedOpen,
      forcedLipSpread,
      forcedBlink,
      forcedTurnX,
    ]
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !masterImg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderLeoMeshToCanvas(ctx, masterImg, rigState, variant, showWireframe);
  }, [masterImg, rigState, variant, showWireframe]);

  const clampedProgress = Math.max(0, Math.min(1, progress));
  // El bisel circular del medallón en leo-master.png ocupa de r=266 a r=291 (centro r=278.5, grosor 25px)
  const ringRadius = 278.5;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashLen = ringCircumference * clampedProgress;
  const ringAngleRad = -Math.PI / 2 + clampedProgress * Math.PI * 2;
  const dotX = 320 + ringRadius * Math.cos(ringAngleRad);
  const dotY = 320 + ringRadius * Math.sin(ringAngleRad);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        style={{
          width: size,
          height: size,
          display: 'block',
          filter:
            variant === 'badge'
              ? 'drop-shadow(0 12px 26px rgba(20, 20, 19, 0.14))'
              : undefined,
        }}
      />
      {showProgressRing && variant === 'badge' ? (
        <svg
          viewBox="0 0 640 640"
          style={{
            position: 'absolute',
            inset: 0,
            width: size,
            height: size,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {/* Perfil temporizador activo directamente sobre el bisel que delimita al avatar (0° a 360°) */}
          {clampedProgress > 0.001 ? (
            <circle
              cx={320}
              cy={320}
              r={ringRadius}
              fill="none"
              stroke={ringColor}
              strokeWidth={24}
              strokeLinecap="round"
              strokeDasharray={`${ringDashLen} ${ringCircumference}`}
              transform="rotate(-90 320 320)"
            />
          ) : null}
          {/* Bordes interior y exterior nítidos que enmarcan el perfil temporizador */}
          <circle
            cx={320}
            cy={320}
            r={266}
            fill="none"
            stroke="#141413"
            strokeWidth={4.5}
          />
          <circle
            cx={320}
            cy={320}
            r={291}
            fill="none"
            stroke="#141413"
            strokeWidth={5}
          />
          {/* Estilo 1: Punto Guía (Chrono-Dot) en la cabeza de avance del arco */}
          {ringStyle === 'chrono-dot' ? (
            <g>
              <circle
                cx={dotX}
                cy={dotY}
                r={15}
                fill="#FFFBEB"
                stroke="#141413"
                strokeWidth={6}
              />
              <circle cx={dotX} cy={dotY} r={6} fill={ringColor} />
            </g>
          ) : null}
        </svg>
      ) : null}
    </div>
  );
};
