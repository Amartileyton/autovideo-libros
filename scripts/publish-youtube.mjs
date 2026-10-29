#!/usr/bin/env node
/**
 * scripts/publish-youtube.mjs
 * Módulo de subida y publicación automática a YouTube Shorts vía YouTube Data API v3.
 *
 * Opciones CLI:
 *   --video <path>         Ruta al archivo MP4 (default: out/el-arte-de-gastar-dinero-big.mp4 o out/video.mp4)
 *   --privacy <mode>       public | private | unlisted (default: private)
 *   --schedule <iso-date>  Programar publicación (ej: 2026-10-30T17:00:00Z)
 *   --title <text>         Título del Short (debe incluir #Shorts)
 *   --description <text>   Descripción con hashtags y atribución musical
 *   --dry-run              Simular sin subir
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CLIENT_PATH = path.join(ROOT_DIR, '.secrets', 'youtube-client.json');
const TOKEN_PATH = path.join(ROOT_DIR, '.secrets', 'youtube-token.json');
const SCENES_PATH = path.join(ROOT_DIR, 'src', 'data', 'scenes.json');
const DOSSIER_PATH = path.join(ROOT_DIR, 'src', 'data', 'book-dossier.json');
const LOG_PATH = path.join(ROOT_DIR, 'out', 'publish', 'publish-log.json');

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

export async function getAuthenticatedClient() {
  if (!fs.existsSync(CLIENT_PATH)) {
    throw new Error(
      `Falta el archivo de credenciales de Google: ${CLIENT_PATH}. Descárgalo de Google Cloud.`
    );
  }
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(
      `Falta el token de autorización: ${TOKEN_PATH}. Ejecuta primero: node scripts/auth-youtube.mjs`
    );
  }

  const clientData = JSON.parse(fs.readFileSync(CLIENT_PATH, 'utf8'));
  const installed = clientData.installed || clientData.web;
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

  const oauth2Client = new google.auth.OAuth2(
    installed.client_id,
    installed.client_secret,
    'http://localhost:8989'
  );
  oauth2Client.setCredentials(tokens);

  // Escuchar cuando el token se refresque automáticamente para persistir el nuevo access_token
  oauth2Client.on('tokens', (newTokens) => {
    const updated = { ...tokens, ...newTokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2), 'utf8');
  });

  return oauth2Client;
}

export function buildDefaultMetadata() {
  const scenes = fs.existsSync(SCENES_PATH)
    ? JSON.parse(fs.readFileSync(SCENES_PATH, 'utf8'))
    : {};
  const dossier = fs.existsSync(DOSSIER_PATH)
    ? JSON.parse(fs.readFileSync(DOSSIER_PATH, 'utf8'))
    : {};

  const title = scenes.bookMetadata?.title ?? 'Resumen del Libro';
  const author = scenes.bookMetadata?.author ?? '';
  const shortTitle = `${title} (${author}) en 60 segundos #Shorts`.slice(0, 95);

  const musicAttribution =
    scenes.music?.attribution ??
    '"Vibing Over Venus" Kevin MacLeod (incompetech.com)\nLicensed under Creative Commons: By Attribution 4.0 License';

  const description = [
    `📚 Resumen en 1 minuto de "${title}" por ${author}.`,
    `Aprende las lecciones clave para dominar tu tiempo y tu dinero en 60 segundos.`,
    '',
    '🔔 Suscríbete a @en1minuto.es para descubrir un libro imprescindible cada día.',
    '',
    '🎵 Música de fondo:',
    musicAttribution,
    '',
    '#Shorts #libros #educacion #resumenes #finanzas #desarrollopersonal #en1minuto',
  ].join('\n');

  const tags = [
    'Shorts',
    'libros',
    'resumenes',
    title.toLowerCase(),
    author.toLowerCase(),
    'desarrollo personal',
    'en 1 minuto',
    'educacion',
  ];

  return { title: shortTitle, description, tags };
}

export async function uploadToYoutube(options = {}) {
  const defaults = buildDefaultMetadata();

  const videoPath =
    options.video ??
    (fs.existsSync(path.join(ROOT_DIR, 'out', 'el-arte-de-gastar-dinero-big.mp4'))
      ? path.join(ROOT_DIR, 'out', 'el-arte-de-gastar-dinero-big.mp4')
      : path.join(ROOT_DIR, 'out', 'video.mp4'));

  if (!fs.existsSync(videoPath)) {
    throw new Error(`No se encontró el archivo de vídeo para subir: ${videoPath}`);
  }

  const title = options.title ?? defaults.title;
  const description = options.description ?? defaults.description;
  const tags = options.tags ? options.tags.split(',') : defaults.tags;
  const privacy = options.privacy ?? 'private';
  const schedule = options.schedule;

  const fileSize = fs.statSync(videoPath).size;

  console.log('====================================================');
  console.log('🚀 SUBIDA A YOUTUBE SHORTS (YouTube Data API v3)');
  console.log('====================================================');
  console.log(`📁 Archivo:     ${path.basename(videoPath)} (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`📝 Título:      ${title}`);
  console.log(`🔒 Privacidad:  ${schedule ? `programado para ${schedule}` : privacy}`);
  console.log(`🏷️ Tags:        ${tags.join(', ')}`);

  if (options['dry-run']) {
    console.log('\n⚠️ [DRY-RUN] Simulación activada. Ningún byte fue enviado a YouTube.');
    return { dryRun: true };
  }

  const auth = await getAuthenticatedClient();
  const youtube = google.youtube({ version: 'v3', auth });

  console.log('\n⏳ Subiendo archivo (resumable upload)...');

  const status = {
    privacyStatus: schedule ? 'private' : privacy,
    selfDeclaredMadeForKids: false,
  };
  if (schedule) {
    status.publishAt = new Date(schedule).toISOString();
  }

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    notifySubscribers: privacy === 'public' && !schedule,
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: '27', // Educación
        defaultLanguage: 'es',
        defaultAudioLanguage: 'es',
      },
      status,
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  const videoUrl = `https://youtu.be/${videoId}`;
  const shortsUrl = `https://youtube.com/shorts/${videoId}`;

  console.log('\n🎉 ¡VÍDEO SUBIDO CON ÉXITO A YOUTUBE!');
  console.log(`🆔 ID de Vídeo:   ${videoId}`);
  console.log(`🔗 Enlace normal: ${videoUrl}`);
  console.log(`📱 Enlace Short:  ${shortsUrl}`);

  // Registrar en el log de publicaciones
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    const log = fs.existsSync(LOG_PATH)
      ? JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'))
      : [];
    log.push({
      timestamp: new Date().toISOString(),
      platform: 'youtube',
      videoId,
      videoUrl,
      shortsUrl,
      title,
      privacyStatus: status.privacyStatus,
      publishAt: status.publishAt ?? null,
      file: path.basename(videoPath),
    });
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
    console.log(`📋 Registrado en: ${path.relative(ROOT_DIR, LOG_PATH)}`);
  } catch (logErr) {
    console.warn('⚠️ No se pudo guardar en publish-log.json:', logErr.message);
  }

  return { id: videoId, url: videoUrl, shortsUrl };
}

// Ejecución directa por CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const params = parseArgs();
  uploadToYoutube(params).catch((err) => {
    console.error('\n❌ ERROR DURANTE LA SUBIDA:', err.message);
    if (err.errors) {
      console.error('Detalles API:', JSON.stringify(err.errors, null, 2));
    }
    process.exit(1);
  });
}
