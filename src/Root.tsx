import React from 'react';
import { Composition } from 'remotion';
import audioManifestJson from '../public/audio/info.json';
import scenesJson from './data/scenes.json';
import { VideoPropsSchema, type AudioManifest } from './data/schema';
import { BLUEPRINT_THEMES, VIDEO_CONFIG } from './theme/motion';
import { Video } from './Video';
import { LeoShowcase } from './scenes/LeoShowcase';
import { LeoAvatar } from './components/character';

const manifest = audioManifestJson as AudioManifest;

/**
 * Calcula la duración total de la <Composition> como la suma exacta de los fotogramas
 * de las escenas en public/audio/info.json descontando los fotogramas de cross-dissolve (10 frames).
 */
const calculateTotalFrames = (audioManifest: AudioManifest): number => {
  if (!audioManifest.scenes || !audioManifest.scenes.length) {
    return 1920;
  }
  const crossDissolve =
    audioManifest.crossDissolveFrames ?? VIDEO_CONFIG.crossDissolveFrames;
  const rawSum = audioManifest.scenes.reduce(
    (sum, scene) => sum + scene.durationInFrames,
    0
  );
  const totalOverlap =
    Math.max(0, audioManifest.scenes.length - 1) * crossDissolve;
  const initialLead = 12; // 12 fotogramas (400ms) de pre-roll inicial para dicción limpia sin cortes
  return Math.max(30, rawSum - totalOverlap + initialLead);
};

export const RemotionRoot: React.FC = () => {
  const totalDurationInFrames = calculateTotalFrames(manifest);
  const fps = manifest.fps || VIDEO_CONFIG.fps;

  return (
    <>
      <Composition
        id="MainVideo"
        component={Video}
        durationInFrames={totalDurationInFrames}
        fps={fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        schema={VideoPropsSchema}
        defaultProps={{
          title:
            scenesJson.projectTitle ||
            '12 reglas para vivir — Jordan B. Peterson (Resumen 65s)',
          surfaceColor: BLUEPRINT_THEMES.EDITORIAL_PAPER.surface,
          enableCaptions: true,
          enableBackgroundMusic: true,
        }}
      />

      {/* Composición de Auditoría y Verificación de la Mascota Humana "Leo" */}
      <Composition
        id="LeoShowcase"
        component={LeoShowcase}
        durationInFrames={330}
        fps={fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />

      {/* Foto de Perfil Oficial de Instagram 1:1 calibrada para recorte circular */}
      <Composition
        id="InstagramProfilePhoto"
        component={() => {
          // Instagram recorta la foto en un círculo que toca los bordes exactos del cuadrado (r = 540 a 1080x1080).
          // El medallón de leo-master.png está en r=291 sobre 640x640 (90.9% del ancho total).
          // Si dejamos un margen elegante de 48px con el borde de Instagram (r = 492),
          // el medallón de Leo se aprecia entero con su bisel y fondo sin ser cortado por el visor de la app.
          return (
            <div
              style={{
                width: 1080,
                height: 1080,
                backgroundColor: '#F8F7F4', // Lienzo editorial papel marfil
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Imagen centrada y escalada para que el círculo de Leo quede perfectamente encajado */}
              <div
                style={{
                  width: 1080,
                  height: 1080,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'scale(1.68)',
                }}
              >
                <LeoAvatar
                  frame={0}
                  size={640}
                  variant="badge"
                  emotion="neutral"
                />
              </div>

              {/* Guía visual sutil del borde circular exterior de Instagram */}
              <svg
                viewBox="0 0 1080 1080"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: 1080,
                  height: 1080,
                  pointerEvents: 'none',
                }}
              >
                {/* Borde exterior del medallón reforzado */}
                <circle
                  cx={540}
                  cy={540}
                  r={490}
                  fill="none"
                  stroke="#141413"
                  strokeWidth={10}
                />
              </svg>
            </div>
          );
        }}
        durationInFrames={30}
        fps={fps}
        width={1080}
        height={1080}
      />
    </>
  );
};
