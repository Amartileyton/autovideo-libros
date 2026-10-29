#!/usr/bin/env node
/**
 * scripts/publish.mjs
 * Despachador unificado de publicación multiplataforma (@en1minuto.es).
 * Permite coordinar subidas a YouTube Shorts e Instagram Reels con un solo comando.
 *
 * Opciones CLI:
 *   --platforms <list>     Plataformas objetivo separadas por coma: yt,ig (default: yt,ig)
 *   --video <path>         Ruta al archivo MP4 (default: out/el-arte-de-gastar-dinero-big.mp4 o out/video.mp4)
 *   --privacy <mode>       Modo de privacidad para YouTube: private | unlisted | public (default: private)
 *   --schedule <iso-date>  Programar publicación (ej: 2026-10-30T19:00:00Z)
 *   --dry-run              Simular sin enviar bytes ni crear posts reales
 *   --confirm              Obligatorio para ejecutar subidas reales
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { uploadToYoutube, buildDefaultMetadata as buildYoutubeMetadata } from './publish-youtube.mjs';
import { uploadToInstagramReels, buildDefaultCaption as buildInstagramCaption } from './publish-instagram.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        params[key] = next;
        i++;
      } else {
        params[key] = true;
      }
    }
  }
  return params;
}

async function main() {
  const params = parseArgs();

  const platformsArg = (params.platforms || 'yt,ig').toLowerCase();
  const targetPlatforms = platformsArg.split(',').map((p) => p.trim());

  const videoPath =
    params.video ??
    (fs.existsSync(path.join(ROOT_DIR, 'out', 'el-arte-de-gastar-dinero-big.mp4'))
      ? path.join(ROOT_DIR, 'out', 'el-arte-de-gastar-dinero-big.mp4')
      : path.join(ROOT_DIR, 'out', 'video.mp4'));

  if (!fs.existsSync(videoPath)) {
    console.error(`❌ No se encontró el vídeo en: ${videoPath}`);
    process.exit(1);
  }

  const fileSize = fs.statSync(videoPath).size;
  const isDryRun = Boolean(params['dry-run'] || !params.confirm);

  console.log('================================================================');
  console.log('🚀 PUBLICADOR MULTIPLATAFORMA UNIFICADO (@en1minuto.es)');
  console.log('================================================================');
  console.log(`📁 Vídeo:       ${path.basename(videoPath)} (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`🎯 Plataformas: ${targetPlatforms.join(', ').toUpperCase()}`);
  console.log(`🔒 Privacidad:  ${params.schedule ? `Programado (${params.schedule})` : (params.privacy || 'private')}`);
  console.log(`⚙️ Modo:        ${isDryRun ? 'SIMULACIÓN / DRY-RUN (requiere --confirm para ejecutar)' : 'PUBLICACIÓN REAL'}`);
  console.log('================================================================\n');

  if (isDryRun && !params['dry-run']) {
    console.log('ℹ️ Para lanzar la publicación real, añade la bandera --confirm:');
    console.log(`   node scripts/publish.mjs --platforms ${platformsArg} ${params.schedule ? `--schedule ${params.schedule} ` : ''}--confirm\n`);
  }

  const results = {};

  // 1. YouTube Shorts
  if (targetPlatforms.includes('yt') || targetPlatforms.includes('youtube')) {
    console.log('----------------------------------------------------');
    console.log('📺 [1/2] YOUTUBE SHORTS');
    console.log('----------------------------------------------------');
    const ytMeta = buildYoutubeMetadata();
    console.log(`Título: ${ytMeta.title}`);
    console.log(`Privacidad: ${params.schedule ? 'private (programado)' : (params.privacy || 'private')}`);

    if (isDryRun) {
      console.log('⚠️ [DRY-RUN] Simulación de YouTube completada.');
      results.youtube = { status: 'simulated', title: ytMeta.title };
    } else {
      try {
        const ytRes = await uploadToYoutube({
          video: videoPath,
          privacy: params.privacy || 'private',
          schedule: params.schedule,
        });
        results.youtube = { status: 'success', ...ytRes };
      } catch (err) {
        console.error(`❌ Error en YouTube:`, err.message);
        results.youtube = { status: 'error', error: err.message };
      }
    }
    console.log('');
  }

  // 2. Instagram Reels
  if (targetPlatforms.includes('ig') || targetPlatforms.includes('instagram')) {
    console.log('----------------------------------------------------');
    console.log('📱 [2/2] INSTAGRAM REELS');
    console.log('----------------------------------------------------');
    const igCaption = buildInstagramCaption();
    console.log(`Caption prevista (primeras 3 líneas):`);
    console.log(igCaption.split('\n').slice(0, 3).map(l => '  ' + l).join('\n'));

    if (isDryRun) {
      console.log('\n⚠️ [DRY-RUN] Simulación de Instagram completada.');
      results.instagram = { status: 'simulated' };
    } else {
      try {
        const igRes = await uploadToInstagramReels({
          video: videoPath,
          caption: igCaption,
        });
        results.instagram = { status: 'success', ...igRes };
      } catch (err) {
        console.error(`❌ Error en Instagram:`, err.message);
        results.instagram = { status: 'error', error: err.message };
      }
    }
    console.log('');
  }

  console.log('================================================================');
  console.log('📊 RESUMEN FINAL DE LA OPERACIÓN');
  console.log('================================================================');
  for (const [platform, data] of Object.entries(results)) {
    console.log(`- ${platform.toUpperCase()}: ${data.status.toUpperCase()}`);
    if (data.url) console.log(`  Enlace: ${data.url}`);
    if (data.shortsUrl) console.log(`  Shorts: ${data.shortsUrl}`);
    if (data.permalink) console.log(`  Reel:   ${data.permalink}`);
    if (data.error) console.log(`  Fallo:  ${data.error}`);
  }
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('\n❌ ERROR GENERAL EN EL DISPATCHER:', err.message);
  process.exit(1);
});
