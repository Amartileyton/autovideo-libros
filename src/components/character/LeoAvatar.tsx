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
    </div>
  );
};
