import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import audioManifestJson from '../public/audio/info.json';
import scenesJsonRaw from './data/scenes.json';
import type {
  AudioManifest,
  BookMetadata,
  BookVisualData,
  ScenesFile,
  VideoProps,
  WordTimestamp,
} from './data/schema';
import { CameraRig, type CameraKeyframe } from './components/CameraRig';
import { DynamicCaptions } from './components/DynamicCaptions';
import { LeoAvatar, type EmotionKeyframe } from './components/character';
import { Scene1 } from './scenes/Scene1';
import { Scene2 } from './scenes/Scene2';
import { Scene3 } from './scenes/Scene3';
import { Scene4 } from './scenes/Scene4';
import { Scene5 } from './scenes/Scene5';
import {
  BLUEPRINT_THEMES,
  BRAND_CONFIG,
  type BlueprintModeId,
  SAFE_ZONE,
} from './theme/motion';
import { HOST_LAYOUT } from './components/big';

const manifest = audioManifestJson as AudioManifest;
const scenesJson = scenesJsonRaw as unknown as ScenesFile;

export interface ComputedSceneWindow {
  id: string;
  index: number;
  from: number;
  durationInFrames: number;
  audioFile: string;
  wordTimestamps: AudioManifest['scenes'][number]['wordTimestamps'];
}

/**
 * Calcula las ventanas de tiempo exactas por escena a partir de public/audio/info.json,
 * aplicando el solapamiento de cross-dissolve (10 fotogramas) entre escenas consecutivas.
 */
export function computeSceneTimeline(
  audioManifest: AudioManifest
): ComputedSceneWindow[] {
  const overlap = audioManifest.crossDissolveFrames || 10;
  // 12 fotogramas (400ms) de pre-roll inicial para evitar que se corte la primera sílaba
  let cursor = 12;

  return audioManifest.scenes.map((scene, index) => {
    const from = cursor;
    const durationInFrames = scene.durationInFrames;
    cursor += Math.max(1, durationInFrames - overlap);
    return {
      id: scene.id,
      index,
      from,
      durationInFrames,
      audioFile: scene.audioFile,
      wordTimestamps: scene.wordTimestamps,
    };
  });
}

export const Video: React.FC<VideoProps> = ({
  surfaceColor = BLUEPRINT_THEMES.EDITORIAL_PAPER.surface,
  enableCaptions = true,
  enableBackgroundMusic = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: totalDurationFrames } = useVideoConfig();
  const timeline = useMemo(() => computeSceneTimeline(manifest), []);
  const bookMetadata = scenesJson.bookMetadata as BookMetadata | undefined;

  /**
   * Stream unificado de palabras a nivel global (arquitectura Leo + @resultaaquee):
   * evita cortes o solapamientos de subtítulos durante las transiciones entre escenas.
   */
  const globalWordTimestamps: WordTimestamp[] = useMemo(() => {
    const merged: WordTimestamp[] = [];
    for (const sceneWin of timeline) {
      const offsetMs = Math.round((sceneWin.from / fps) * 1000);
      for (const w of sceneWin.wordTimestamps) {
        merged.push({
          word: w.word,
          startMs: w.startMs + offsetMs,
          endMs: w.endMs + offsetMs,
          startFrame: w.startFrame + sceneWin.from,
          endFrame: w.endFrame + sceneWin.from,
        });
      }
    }
    return merged;
  }, [timeline, fps]);

  /**
   * Cronograma emocional C1 continuo para Leo sincronizado con las 5 escenas
   */
  const leoEmotionSchedule: EmotionKeyframe[] = useMemo(() => {
    const emotions: Array<EmotionKeyframe['emotion']> = [
      'curious',
      'explaining',
      'thinking',
      'explaining',
      'happy',
    ];
    return timeline.map((sceneWin, idx) => ({
      startSec: idx === 0 ? 0 : sceneWin.from / fps,
      emotion: emotions[idx] ?? 'explaining',
    }));
  }, [timeline, fps]);

  /**
   * Keyframes de cámara continua sincronizados al fotograma de inicio de cada escena en info.json
   */
  const cameraKeyframes: CameraKeyframe[] = useMemo(() => {
    const defaultCoords = [
      { x: 0, y: 0, zoom: 1.0, rotateDeg: 0 },
      { x: 1120, y: 0, zoom: 1.0, rotateDeg: 0 },
      { x: 1120, y: 1980, zoom: 1.0, rotateDeg: 0 },
      { x: 0, y: 1980, zoom: 1.0, rotateDeg: 0 },
      { x: 560, y: 3960, zoom: 1.0, rotateDeg: 0 },
    ];
    return timeline.map((item, idx) => {
      const sceneMeta = scenesJson.scenes[idx];
      const fallback = defaultCoords[idx] ?? {
        x: 0,
        y: idx * 1980,
        zoom: 1,
        rotateDeg: 0,
      };
      return {
        frame: item.from,
        x: sceneMeta?.cameraTarget?.x ?? fallback.x,
        y: sceneMeta?.cameraTarget?.y ?? fallback.y,
        zoom: sceneMeta?.cameraTarget?.zoom ?? fallback.zoom,
        rotateDeg: sceneMeta?.cameraTarget?.rotateDeg ?? fallback.rotateDeg,
      };
    });
  }, [timeline]);

  /**
   * Modo de superficie editorial constante en todo el vídeo (sin cambios de color de fondo)
   */
  const activeBlueprintMode: BlueprintModeId = 'EDITORIAL_PAPER';

  /**
   * Intervalos de voz continua (agrupando palabras separadas por menos de 10 fotogramas / 0.33s).
   * Evita el efecto "bombeo" (pumping) indeseado en la música entre palabras de una misma frase.
   */
  const speechIntervals = useMemo(() => {
    if (!globalWordTimestamps || globalWordTimestamps.length === 0) return [];
    const sorted = [...globalWordTimestamps].sort((a, b) => a.startFrame - b.startFrame);
    const intervals: Array<{ startFrame: number; endFrame: number }> = [];

    let current = { startFrame: sorted[0].startFrame, endFrame: sorted[0].endFrame };
    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      if (next.startFrame - current.endFrame <= 10) {
        current.endFrame = Math.max(current.endFrame, next.endFrame);
      } else {
        intervals.push(current);
        current = { startFrame: next.startFrame, endFrame: next.endFrame };
      }
    }
    intervals.push(current);
    return intervals;
  }, [globalWordTimestamps]);

  /**
   * Curva de Audio Ducking suave con física de ataque y descompresión:
   * - Attack: 6 frames antes del inicio de la voz (bajada suave a duckedVolume)
   * - Hold: duckedVolume constante durante la locución continua
   * - Release: 10 frames después de concluir el bloque de voz (subida suave a volume)
   */
  const bgmVolume = useMemo(() => {
    const maxVol = scenesJson.music?.volume ?? 0.55;
    const duckedVol = scenesJson.music?.duckedVolume ?? 0.28;

    if (speechIntervals.length === 0) return maxVol;

    for (const block of speechIntervals) {
      if (frame >= block.startFrame && frame <= block.endFrame) {
        return duckedVol;
      }
      if (frame >= block.startFrame - 6 && frame < block.startFrame) {
        const progress = (frame - (block.startFrame - 6)) / 6;
        return maxVol - progress * (maxVol - duckedVol);
      }
      if (frame > block.endFrame && frame <= block.endFrame + 10) {
        const progress = (frame - block.endFrame) / 10;
        return duckedVol + progress * (maxVol - duckedVol);
      }
    }

    return maxVol;
  }, [speechIntervals, frame, scenesJson.music]);

  const videoProgress =
    totalDurationFrames > 1
      ? Math.min(1, Math.max(0, frame / (totalDurationFrames - 1)))
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: surfaceColor }}>
      {/* Fuentes oficiales cargadas desde almacenamiento estático local para renderizado offline */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 700 900;
  font-display: swap;
  src: url('${staticFile('fonts/plusjakartasans-800.woff2')}') format('woff2');
}
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 700 900;
  font-display: swap;
  src: url('${staticFile('fonts/nunito-800.woff2')}') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500 800;
  font-display: swap;
  src: url('${staticFile('fonts/inter-700.woff2')}') format('woff2');
}
          `,
        }}
      />
      {/* Lienzo continuo de 5 escenas gobernado por CameraRig + Rack-Focus Blur */}
      <CameraRig
        keyframes={cameraKeyframes}
        surfaceColor={surfaceColor}
        blueprintMode={activeBlueprintMode}
        rackFocusBlur={true}
      >
        {/* Conectores de ingeniería editorial entre los 5 cuadrantes del lienzo continuo */}
        <svg
          width={2400}
          height={6000}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none',
          }}
        >
          <path
            d="M 984 740 L 1216 740"
            stroke="rgba(217, 78, 52, 0.25)"
            strokeWidth={2}
            strokeDasharray="8 8"
            fill="none"
          />
          <path
            d="M 1660 1520 L 1660 2090"
            stroke="rgba(217, 78, 52, 0.25)"
            strokeWidth={2}
            strokeDasharray="8 8"
            fill="none"
          />
          <path
            d="M 1216 2700 L 984 2700"
            stroke="rgba(217, 78, 52, 0.25)"
            strokeWidth={2}
            strokeDasharray="8 8"
            fill="none"
          />
          <path
            d="M 540 3520 L 1100 4060"
            stroke="rgba(217, 78, 52, 0.25)"
            strokeWidth={2}
            strokeDasharray="8 8"
            fill="none"
          />
        </svg>

        <Scene1
          headline={scenesJson.scenes[0]?.title}
          metricValue={scenesJson.scenes[0]?.metrics?.numericValue}
          metricUnit={scenesJson.scenes[0]?.metrics?.unit}
          metricLabel={scenesJson.scenes[0]?.metrics?.label}
          canvasOffsetX={scenesJson.scenes[0]?.cameraTarget?.x ?? 0}
          canvasOffsetY={scenesJson.scenes[0]?.cameraTarget?.y ?? 0}
          enterFrame={timeline[0]?.from ?? 0}
          bookMetadata={bookMetadata}
          visualData={
            scenesJson.scenes[0]?.bookVisualData as BookVisualData | undefined
          }
          layoutPreset={scenesJson.scenes[0]?.layoutPreset}
          wordTimestamps={timeline[0]?.wordTimestamps}
        />

        <Scene2
          headline={scenesJson.scenes[1]?.title}
          metricValue={scenesJson.scenes[1]?.metrics?.numericValue}
          metricUnit={scenesJson.scenes[1]?.metrics?.unit}
          metricLabel={scenesJson.scenes[1]?.metrics?.label}
          canvasOffsetX={scenesJson.scenes[1]?.cameraTarget?.x ?? 1120}
          canvasOffsetY={scenesJson.scenes[1]?.cameraTarget?.y ?? 0}
          enterFrame={timeline[1]?.from ?? 428}
          bookMetadata={bookMetadata}
          visualData={
            scenesJson.scenes[1]?.bookVisualData as BookVisualData | undefined
          }
          layoutPreset={scenesJson.scenes[1]?.layoutPreset}
          wordTimestamps={timeline[1]?.wordTimestamps}
        />

        <Scene3
          headline={scenesJson.scenes[2]?.title}
          metricValue={scenesJson.scenes[2]?.metrics?.numericValue}
          metricUnit={scenesJson.scenes[2]?.metrics?.unit}
          metricLabel={scenesJson.scenes[2]?.metrics?.label}
          canvasOffsetX={scenesJson.scenes[2]?.cameraTarget?.x ?? 1120}
          canvasOffsetY={scenesJson.scenes[2]?.cameraTarget?.y ?? 1980}
          enterFrame={timeline[2]?.from ?? 824}
          bookMetadata={bookMetadata}
          visualData={
            scenesJson.scenes[2]?.bookVisualData as BookVisualData | undefined
          }
          layoutPreset={scenesJson.scenes[2]?.layoutPreset}
          wordTimestamps={timeline[2]?.wordTimestamps}
        />

        <Scene4
          headline={scenesJson.scenes[3]?.title}
          metricValue={scenesJson.scenes[3]?.metrics?.numericValue}
          metricUnit={scenesJson.scenes[3]?.metrics?.unit}
          metricLabel={scenesJson.scenes[3]?.metrics?.label}
          canvasOffsetX={scenesJson.scenes[3]?.cameraTarget?.x ?? 0}
          canvasOffsetY={scenesJson.scenes[3]?.cameraTarget?.y ?? 1980}
          enterFrame={timeline[3]?.from ?? 1231}
          bookMetadata={bookMetadata}
          visualData={
            scenesJson.scenes[3]?.bookVisualData as BookVisualData | undefined
          }
          layoutPreset={scenesJson.scenes[3]?.layoutPreset}
          wordTimestamps={timeline[3]?.wordTimestamps}
        />

        <Scene5
          headline={scenesJson.scenes[4]?.title}
          metricValue={scenesJson.scenes[4]?.metrics?.numericValue}
          metricUnit={scenesJson.scenes[4]?.metrics?.unit}
          metricLabel={scenesJson.scenes[4]?.metrics?.label}
          canvasOffsetX={scenesJson.scenes[4]?.cameraTarget?.x ?? 560}
          canvasOffsetY={scenesJson.scenes[4]?.cameraTarget?.y ?? 3960}
          enterFrame={timeline[4]?.from ?? 1655}
          bookMetadata={bookMetadata}
          visualData={
            scenesJson.scenes[4]?.bookVisualData as BookVisualData | undefined
          }
          layoutPreset={scenesJson.scenes[4]?.layoutPreset}
          wordTimestamps={timeline[4]?.wordTimestamps}
        />
      </CameraRig>

      {/* Secuencias de audio sincronizadas al fotograma desde public/audio/info.json */}
      {timeline.map((sceneWin) => (
        <Sequence
          key={sceneWin.id}
          from={sceneWin.from}
          durationInFrames={sceneWin.durationInFrames}
          name={`Scene-${sceneWin.id}`}
        >
          {sceneWin.audioFile ? (
            <Audio src={staticFile(sceneWin.audioFile)} />
          ) : null}
        </Sequence>
      ))}

      {/* Barra de progreso de lectura (Top 60s Bar) en Terracota */}
      {BRAND_CONFIG.showProgressBar && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${videoProgress * 100}%`,
            height: BRAND_CONFIG.progressBarHeight,
            backgroundColor: BRAND_CONFIG.progressBarColor,
            zIndex: 100,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Subtítulos encima del círculo del avatar (Opción A: Y = 1305..1410px) */}
      {enableCaptions ? (
        <DynamicCaptions
          wordTimestamps={globalWordTimestamps}
          sceneStartFrame={0}
          wordsPerWindow={5}
          variant="editorial-clean"
          placement="lower"
        />
      ) : null}

      {/* Anfitrión Leo con Perfil Temporizador Circular Estilo 1 (Chrono-Dot, Y = 1445..1685px) */}
      <div
        style={{
          position: 'absolute',
          top: HOST_LAYOUT.avatarTop,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 90,
          pointerEvents: 'none',
        }}
      >
        <LeoAvatar
          frame={frame}
          wordTimestamps={globalWordTimestamps}
          emotionSchedule={leoEmotionSchedule}
          size={HOST_LAYOUT.avatarSize}
          variant="badge"
          showProgressRing={true}
          progress={videoProgress}
          ringStyle="chrono-dot"
        />
      </div>

      {/* Pista opcional de música de fondo con curva de audio ducking automática */}
      {enableBackgroundMusic && (manifest.backgroundMusicFile || scenesJson.music?.file || true) ? (
        <Audio
          src={staticFile(manifest.backgroundMusicFile || scenesJson.music?.file || 'audio/music/vibing-over-venus.mp3')}
          volume={bgmVolume}
        />
      ) : null}

      {/* Línea guía sutil de Zona Segura Vertical (288px inferiores reservados para UI 9:16) */}
      <div
        style={{
          position: 'absolute',
          left: SAFE_ZONE.horizontalPaddingPx,
          right: SAFE_ZONE.horizontalPaddingPx,
          top: SAFE_ZONE.maxSafeY,
          borderTop: '1.5px dashed rgba(45, 43, 40, 0.12)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
