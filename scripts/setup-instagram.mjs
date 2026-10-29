#!/usr/bin/env node
/**
 * scripts/setup-instagram.mjs
 * Asistente inteligente para configurar Instagram Reels en .env
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

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

export function updateEnvKey(key, value) {
  let env = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(env)) {
    env = env.replace(regex, `${key}=${value}`);
  } else {
    env += (env.endsWith('\n') || env.length === 0 ? '' : '\n') + `${key}=${value}\n`;
  }
  fs.writeFileSync(ENV_PATH, env, 'utf8');
}

async function main() {
  const params = parseArgs();
  const token = params.token || process.env.TEMP_TOKEN;

  console.log('====================================================');
  console.log('🛠️ CONFIGURADOR DE INSTAGRAM GRAPH API (@en1minuto.es)');
  console.log('====================================================\n');

  if (!token) {
    console.log('Uso: node scripts/setup-instagram.mjs --token <TU_TOKEN_DE_GRAPH_API_EXPLORER>');
    process.exit(1);
  }

  let finalToken = token;

  // 1. Canjear por Long-Lived Token si se suministra app-id y app-secret
  if (params['app-id'] && params['app-secret']) {
    console.log('🔄 Canjeando por token de larga duración (60 días)...');
    try {
      const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${params['app-id']}&client_secret=${params['app-secret']}&fb_exchange_token=${token}`;
      const exRes = await fetch(exchangeUrl);
      const exData = await exRes.json();
      if (exData.access_token) {
        finalToken = exData.access_token;
        console.log('✅ Token de larga duración obtenido.');
      }
    } catch (e) {
      console.warn('⚠️ No se pudo canjear con App Secret:', e.message);
    }
  }

  // 2. Comprobar /debug_token para extraer target_ids de páginas
  console.log('🔍 Inspeccionando permisos y cuentas asociadas...');
  let targetPageIds = [];
  try {
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${finalToken}&access_token=${finalToken}`;
    const debugRes = await fetch(debugUrl);
    const debugData = await debugRes.json();
    if (debugData.data?.granular_scopes) {
      for (const gs of debugData.data.granular_scopes) {
        if (gs.target_ids) {
          for (const id of gs.target_ids) {
            if (!targetPageIds.includes(id)) targetPageIds.push(id);
          }
        }
      }
    }
  } catch {}

  // 3. Buscar páginas vía /me/accounts y vía targetPageIds
  const candidatePages = [];
  try {
    const accountsUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,followers_count}&access_token=${finalToken}`;
    const accRes = await fetch(accountsUrl);
    const accData = await accRes.json();
    if (accData.data) candidatePages.push(...accData.data);
  } catch {}

  // Consultar directamente los IDs de páginas identificados en target_ids
  for (const pageId of targetPageIds) {
    if (!candidatePages.some((p) => p.id === pageId)) {
      try {
        const pageUrl = `https://graph.facebook.com/v21.0/${pageId}?fields=id,name,access_token,instagram_business_account{id,username,name,followers_count}&access_token=${finalToken}`;
        const pRes = await fetch(pageUrl);
        const pData = await pRes.json();
        if (pData.id) candidatePages.push(pData);
      } catch {}
    }
  }

  let matchedAccount = null;
  let pageToken = null;

  for (const page of candidatePages) {
    if (page.instagram_business_account) {
      matchedAccount = page.instagram_business_account;
      pageToken = page.access_token;
      console.log(`\n🎉 ¡Cuenta de Instagram Profesional encontrada!`);
      console.log(`   - Página de Facebook: "${page.name}" (ID: ${page.id})`);
      console.log(`   - Usuario Instagram:  @${matchedAccount.username}`);
      console.log(`   - ID Instagram:       ${matchedAccount.id}`);
      if (matchedAccount.followers_count !== undefined) {
        console.log(`   - Seguidores:         ${matchedAccount.followers_count}`);
      }
      break;
    }
  }

  if (!matchedAccount) {
    console.error('\n❌ No se detectó ninguna cuenta de Instagram Profesional conectada a las páginas.');
    process.exit(1);
  }

  const tokenToSave = pageToken || finalToken;

  updateEnvKey('IG_USER_ID', matchedAccount.id);
  updateEnvKey('IG_ACCESS_TOKEN', tokenToSave);

  console.log('\n====================================================');
  console.log('✅ ¡CONFIGURACIÓN GUARDADA CON ÉXITO EN .ENV!');
  console.log('====================================================');
  console.log(`🔑 IG_USER_ID:      ${matchedAccount.id}`);
  console.log(`🔑 IG_ACCESS_TOKEN: [Guardado y protegido en .env]`);
  console.log('\nProbando conexión con npm.cmd run check:instagram...');
}

main().catch((err) => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
