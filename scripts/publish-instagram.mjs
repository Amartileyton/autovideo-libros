#!/usr/bin/env node
/**
 * scripts/publish-instagram.mjs
 * Módulo de subida y publicación automática a Instagram Reels vía Meta Graph API v21.0.
 *
 * Utiliza el protocolo oficial de "Resumable Upload" (rupload.facebook.com)
 * con optimización automática de faststart (moov atom al inicio)
 * para subir vídeos binarios locales directamente desde el disco sin requerir
 * almacenamiento en la nube ni servidores externos (100% gratuito).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const ENV_PATH = path.join(ROOT_DIR, '.env');
const SECRETS_TOKEN_PATH = path.join(ROOT_DIR, '.secrets', 'instagram-token.json');
const SCENES_PATH = path.join(ROOT_DIR, 'src', 'data', 'scenes.json');
const DOSSIER_PATH = path.join(ROOT_DIR, 'src', 'data', 'book-dossier.json');
const LOG_PATH = path.join(ROOT_DIR, 'out', 'publish', 'publish-log.json');

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Carga credenciales desde .env o .secrets/instagram-token.json
 */
export function getInstagramCredentials() {
  let userId = process.env.IG_USER_ID;
  let accessToken = process.env.IG_ACCESS_TOKEN;

  if ((!userId || !accessToken) && fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
      if (key === 'IG_USER_ID' && !userId) userId = val;
      if (key === 'IG_ACCESS_TOKEN' && !accessToken) accessToken = val;
    }
  }

  if ((!userId || !accessToken) && fs.existsSync(SECRETS_TOKEN_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(SECRETS_TOKEN_PATH, 'utf8'));
      if (!userId) userId = data.userId || data.igUserId;
      if (!accessToken) accessToken = data.accessToken || data.token;
    } catch {}
  }

  return { userId, accessToken };
}

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

export function buildDefaultCaption() {
  const scenes = fs.existsSync(SCENES_PATH)
    ? JSON.parse(fs.readFileSync(SCENES_PATH, 'utf8'))
    : {};
  const dossier = fs.existsSync(DOSSIER_PATH)
    ? JSON.parse(fs.readFileSync(DOSSIER_PATH, 'utf8'))
    : {};

  const title = scenes.bookMetadata?.title ?? 'Resumen del Libro';
  const author = scenes.bookMetadata?.author ?? '';

  const hook =
    scenes.scenes?.[0]?.bookVisualData?.hookText ??
    `¿Conoces la regla clave de "${title}"?`;

  const musicAttribution =
    scenes.music?.attribution ??
    '"Vibing Over Venus" Kevin MacLeod (incompetech.com)\nLicensed under CC BY 4.0';

  const caption = [
    `📖 ${title.toUpperCase()} — ${author}`,
    '',
    `💡 ${hook}`,
    '',
    `Aprende en 60 segundos la lección principal para dominar tu mentalidad y tus decisiones.`,
    '',
    `📌 Guarda este vídeo para cuando lo necesites.`,
    `🔔 Sigue a @en1minuto.es para dominar un libro clave cada día.`,
    '',
    `🎵 Audio: ${musicAttribution.split('\n')[0]}`,
    '',
    `#libros #resumenes #desarrollopersonal #crecimientopersonal #educacion #en1minuto #reelslibros #aprender #mentalidad #librosrecomendados`,
  ].join('\n');

  return caption;
}

/**
 * Asegura que el vídeo tenga el átomo moov al principio (faststart) para ingesta en Meta
 */
export function ensureFaststartVideo(inputPath) {
  const ext = path.extname(inputPath);
  const faststartPath = inputPath.replace(ext, `-faststart${ext}`);

  // Si ya existe el archivo faststart y es más reciente que el original, usarlo
  if (fs.existsSync(faststartPath)) {
    const origMtime = fs.statSync(inputPath).mtimeMs;
    const fastMtime = fs.statSync(faststartPath).mtimeMs;
    if (fastMtime >= origMtime) {
      return faststartPath;
    }
  }

  // Buscar ffmpeg en node_modules/@remotion
  const ffmpegCandidates = [
    path.join(ROOT_DIR, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe'),
    'ffmpeg',
  ];

  for (const bin of ffmpegCandidates) {
    try {
      execSync(`"${bin}" -i "${inputPath}" -c copy -movflags +faststart "${faststartPath}" -y`, {
        stdio: 'ignore',
      });
      if (fs.existsSync(faststartPath)) {
        return faststartPath;
      }
    } catch {}
  }

  return inputPath;
}

/**
 * Verifica la validez del token y los detalles de la cuenta de Instagram
 */
export async function checkInstagramAccount() {
  const { userId, accessToken } = getInstagramCredentials();

  if (!userId || !accessToken) {
    throw new Error(
      'Faltan credenciales de Instagram en .env o en .secrets/instagram-token.json.\n' +
        'Debes definir:\n' +
        '  IG_USER_ID=<Tu Instagram Business Account ID>\n' +
        '  IG_ACCESS_TOKEN=<Tu Access Token de Meta Graph API>'
    );
  }

  console.log('====================================================');
  console.log('🔍 VERIFICACIÓN DE CUENTA INSTAGRAM (Meta Graph API)');
  console.log('====================================================');

  const fields = 'id,username,name,biography,followers_count,media_count';
  const url = `${GRAPH_BASE}/${userId}?fields=${fields}&access_token=${accessToken}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(
      `Error de autenticación en Meta: ${data.error?.message || JSON.stringify(data)}`
    );
  }

  console.log(`✅ Conexión establecida con éxito:`);
  console.log(`   - Usuario:    @${data.username}`);
  console.log(`   - Nombre:     ${data.name || 'Sin nombre público'}`);
  console.log(`   - ID Cuenta:  ${data.id}`);
  console.log(`   - Seguidores: ${data.followers_count ?? 'N/A'}`);
  console.log(`   - Medios:     ${data.media_count ?? 0} publicaciones`);

  try {
    const limitUrl = `${GRAPH_BASE}/${userId}/content_publishing_limit?fields=quota_usage,config&access_token=${accessToken}`;
    const limitRes = await fetch(limitUrl);
    const limitData = await limitRes.json();
    if (limitRes.ok && limitData.data?.[0]) {
      const quota = limitData.data[0];
      console.log(
        `   - Cuota hoy:  ${quota.quota_usage ?? 0} de ${quota.config?.quota_total ?? 100} permitidos`
      );
    }
  } catch {}

  console.log('====================================================\n');
  return data;
}

/**
 * Sube un vídeo local a Instagram Reels utilizando Resumable Upload
 */
export async function uploadToInstagramReels(options = {}) {
  const { userId, accessToken } = getInstagramCredentials();

  let rawVideoPath =
    options.video ??
    (fs.existsSync(path.join(ROOT_DIR, 'out', 'el-arte-de-gastar-dinero-big.mp4'))
      ? path.join(ROOT_DIR, 'out', 'el-arte-de-gastar-dinero-big.mp4')
      : path.join(ROOT_DIR, 'out', 'video.mp4'));

  if (!fs.existsSync(rawVideoPath)) {
    throw new Error(`No se encontró el archivo de vídeo para subir: ${rawVideoPath}`);
  }

  // Pre-flight: Asegurar moov atom al principio del archivo (faststart)
  const videoPath = ensureFaststartVideo(rawVideoPath);

  const caption = options.caption ?? buildDefaultCaption();
  const fileSize = fs.statSync(videoPath).size;

  console.log('====================================================');
  console.log('📱 SUBIDA A INSTAGRAM REELS (Meta Graph API v21.0)');
  console.log('====================================================');
  console.log(`📁 Archivo:    ${path.basename(videoPath)} (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`👤 Cuenta ID:  ${userId || 'No configurada'}`);
  console.log(`📝 Caption:\n${caption.split('\n').map(l => '   | ' + l).join('\n')}`);

  if (options['dry-run']) {
    console.log('\n⚠️ [DRY-RUN] Simulación activada. Ningún byte fue enviado a Instagram.');
    return { dryRun: true };
  }

  if (!userId || !accessToken) {
    throw new Error(
      'Faltan credenciales de Instagram en .env.\n' +
        'Por favor, añade IG_USER_ID y IG_ACCESS_TOKEN en tu archivo .env.'
    );
  }

  // PASO 1: Iniciar sesión de subida reanudable (Crear contenedor de Reel)
  console.log('\n1️⃣ Creando contenedor de Reel en Meta (upload_type=resumable)...');
  const containerUrl = `${GRAPH_BASE}/${userId}/media`;
  const containerParams = new URLSearchParams({
    media_type: 'REELS',
    upload_type: 'resumable',
    caption,
    share_to_feed: 'true',
    access_token: accessToken,
  });

  const initRes = await fetch(containerUrl, {
    method: 'POST',
    body: containerParams,
  });
  const initData = await initRes.json();

  if (!initRes.ok || initData.error) {
    throw new Error(`Error al crear contenedor en Meta: ${initData.error?.message || JSON.stringify(initData)}`);
  }

  const containerId = initData.id;
  const uploadUri =
    initData.uri ||
    `https://rupload.facebook.com/ig-api-upload/${GRAPH_API_VERSION}/${containerId}`;

  console.log(`   ✅ Contenedor creado. ID: ${containerId}`);
  console.log(`   🔗 Endpoint de subida binaria: ${uploadUri}`);

  // PASO 2: Subir archivo binario a rupload.facebook.com vía cURL nativo
  console.log('\n2️⃣ Enviando archivo de vídeo a Meta (rupload.facebook.com)...');
  const curlCmd = `curl.exe -s -w "\\n%{http_code}" -X POST "${uploadUri}" -H "Authorization: OAuth ${accessToken}" -H "offset: 0" -H "file_size: ${fileSize}" --data-binary "@${videoPath}"`;

  try {
    execSync(curlCmd, { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
    console.log('   ✅ Bytes transferidos a los servidores de Meta.');
  } catch (curlErr) {
    console.log('   ℹ️ Transferencia de bytes enviada.');
  }

  // PASO 3: Polling de procesamiento del vídeo
  console.log('\n3️⃣ Esperando procesamiento de vídeo por Meta...');
  const pollUrl = `${GRAPH_BASE}/${containerId}?fields=status_code,status&access_token=${accessToken}`;
  let isFinished = false;
  const maxAttempts = 60;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const statusRes = await fetch(pollUrl);
    const statusData = await statusRes.json();

    const statusCode = statusData.status_code;
    process.stdout.write(`   [Intento ${attempt}/${maxAttempts}] Estado: ${statusCode}...\r`);

    if (statusCode === 'FINISHED') {
      isFinished = true;
      console.log(`\n   ✅ Procesamiento finalizado con éxito.`);
      break;
    }

    if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
      console.log('\n');
      throw new Error(`El contenedor falló en procesamiento: ${statusCode} - ${statusData.status || ''}`);
    }
  }

  if (!isFinished) {
    throw new Error('Tiempo de espera agotado mientras Meta procesaba el Reel.');
  }

  // PASO 4: Publicar el Reel
  console.log('\n4️⃣ Publicando Reel en el feed de Instagram...');
  const publishUrl = `${GRAPH_BASE}/${userId}/media_publish`;
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  });

  const pubRes = await fetch(publishUrl, {
    method: 'POST',
    body: publishParams,
  });
  const pubData = await pubRes.json();

  if (!pubRes.ok || pubData.error) {
    throw new Error(`Error al publicar Reel: ${pubData.error?.message || JSON.stringify(pubData)}`);
  }

  const mediaId = pubData.id;

  // PASO 5: Obtener permalink público
  let permalink = `https://www.instagram.com/p/${mediaId}/`;
  try {
    const metaRes = await fetch(
      `${GRAPH_BASE}/${mediaId}?fields=id,permalink&access_token=${accessToken}`
    );
    const metaData = await metaRes.json();
    if (metaData.permalink) {
      permalink = metaData.permalink;
    }
  } catch {}

  console.log('\n🎉 ¡REEL PUBLICADO CON ÉXITO EN INSTAGRAM!');
  console.log(`🆔 Media ID:   ${mediaId}`);
  console.log(`🔗 Enlace Reel: ${permalink}`);

  // PASO 6: Registrar en publish-log.json
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    const log = fs.existsSync(LOG_PATH)
      ? JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'))
      : [];
    log.push({
      timestamp: new Date().toISOString(),
      platform: 'instagram',
      mediaId,
      permalink,
      caption: caption.slice(0, 100) + '...',
      file: path.basename(videoPath),
    });
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
    console.log(`📋 Registrado en: ${path.relative(ROOT_DIR, LOG_PATH)}`);
  } catch (logErr) {
    console.warn('⚠️ No se pudo guardar en publish-log.json:', logErr.message);
  }

  return { id: mediaId, permalink };
}

// Ejecución directa por CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const params = parseArgs();

  if (params.check) {
    checkInstagramAccount().catch((err) => {
      console.error('\n❌ ERROR EN LA VERIFICACIÓN:', err.message);
      process.exit(1);
    });
  } else {
    uploadToInstagramReels(params).catch((err) => {
      console.error('\n❌ ERROR EN LA PUBLICACIÓN A INSTAGRAM:', err.message);
      process.exit(1);
    });
  }
}
