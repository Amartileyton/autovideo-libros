#!/usr/bin/env node
/**
 * scripts/auth-youtube.mjs
 * Script de autorización inicial OAuth 2.0 para YouTube Data API v3.
 *
 * Flujo:
 * 1. Lee .secrets/youtube-client.json.
 * 2. Levanta un servidor local temporal en http://localhost:8989.
 * 3. Abre automáticamente el navegador (o muestra la URL en consola) para que el usuario autorice el canal.
 * 4. Recibe el código de autorización, canjea el refresh_token y lo guarda en .secrets/youtube-token.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CLIENT_PATH = path.join(ROOT_DIR, '.secrets', 'youtube-client.json');
const TOKEN_PATH = path.join(ROOT_DIR, '.secrets', 'youtube-token.json');

if (!fs.existsSync(CLIENT_PATH)) {
  console.error(`❌ No se encontró el archivo de credenciales: ${CLIENT_PATH}`);
  process.exit(1);
}

const clientData = JSON.parse(fs.readFileSync(CLIENT_PATH, 'utf8'));
const installed = clientData.installed || clientData.web;

if (!installed) {
  console.error('❌ El JSON no contiene la sección "installed" o "web".');
  process.exit(1);
}

const PORT = 8989;
const REDIRECT_URI = `http://localhost:${PORT}`;

const oauth2Client = new google.auth.OAuth2(
  installed.client_id,
  installed.client_secret,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>❌ Error en la autorización: ${error}</h2>`);
      console.error(`❌ Error en la respuesta OAuth: ${error}`);
      server.close();
      process.exit(1);
    }

    if (code) {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf8');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h1 style="color: #15803D;">✅ ¡Autenticación completada con éxito!</h1>
          <p style="font-size: 18px; color: #374151;">Las credenciales se han guardado correctamente en <code>.secrets/youtube-token.json</code>.</p>
          <p style="font-size: 16px; color: #6B7280;">Ya puedes cerrar esta pestaña y volver a la terminal.</p>
        </div>
      `);

      console.log('\n✅ Tokens canjeados con éxito.');
      console.log(`📁 Guardados en: ${TOKEN_PATH}`);

      // Verificar canal conectado
      try {
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const channels = await youtube.channels.list({
          part: ['snippet'],
          mine: true,
        });
        const channel = channels.data.items?.[0];
        if (channel) {
          console.log(`📺 Canal conectado: "${channel.snippet?.title}" (ID: ${channel.id})`);
        }
      } catch (chErr) {
        console.log('ℹ️ Token guardado (no se pudo leer el nombre del canal inmediatamente).');
      }

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h2>❌ Error procesando el token: ${err.message}</h2>`);
    console.error('❌ Error canjeando token:', err);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('🔑 AUTORIZACIÓN DE YOUTUBE OAUTH 2.0');
  console.log('====================================================');
  console.log(`\n1. Abriendo navegador automáticamente...`);
  console.log(`Si no se abre solo, copia y pega este enlace en tu navegador:\n`);
  console.log(authUrl);
  console.log('\n2. Inicia sesión con la cuenta dueña del canal @en1minuto.es y pulsa "Permitir".');
  console.log(`(Esperando respuesta en ${REDIRECT_URI})...\n`);

  // Intentar abrir el navegador en Windows
  exec(`start "" "${authUrl}"`);
});
