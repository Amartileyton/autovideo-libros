import React from 'react';
import { Composition } from 'remotion';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';
import audioManifestJson from '../public/audio/info.json';
import scenesJson from './data/scenes.json';
import { VideoPropsSchema, type AudioManifest } from './data/schema';
import { BLUEPRINT_THEMES, VIDEO_CONFIG } from './theme/motion';
import { Video } from './Video';

// Cargar fuentes oficiales con pesos optimizados
loadPlusJakartaSans('normal', {
  weights: ['700', '800'],
  subsets: ['latin'],
  ignoreTooManyRequestsWarning: true,
});
loadInter('normal', {
  weights: ['500', '700', '800'],
  subsets: ['latin'],
  ignoreTooManyRequestsWarning: true,
});
loadNunito('normal', {
  weights: ['700', '800'],
  subsets: ['latin'],
  ignoreTooManyRequestsWarning: true,
});

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
  return Math.max(30, rawSum - totalOverlap);
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
            'El poder de los hábitos — Charles Duhigg (Resumen 65s)',
          surfaceColor: BLUEPRINT_THEMES.EDITORIAL_PAPER.surface,
          enableCaptions: true,
          enableBackgroundMusic: false,
        }}
      />
    </>
  );
};
