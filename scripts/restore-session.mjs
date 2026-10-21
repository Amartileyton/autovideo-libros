#!/usr/bin/env node
/**
 * scripts/restore-session.mjs
 * Restaura en otro dispositivo (Windows, macOS o Linux):
 * 1. El directorio Brain de la conversación (110de767-b44a-42fb-862a-181fd31e958a) con transcript.jsonl,
 *    transcript_full.jsonl, implementation_plan.md y task.md.
 * 2. Las 18 Agent Skills globales en ~/.agents/skills y ~/.gemini/antigravity/skills.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CONVERSATION_ID = '110de767-b44a-42fb-862a-181fd31e958a';
const EXPORT_DIR = path.join(ROOT_DIR, 'references', 'antigravity-session-export');
const LOCAL_SKILLS_DIR = path.join(ROOT_DIR, '.agent', 'skills');

const homeDir = os.homedir();
const targetBrainDir = path.join(
  homeDir,
  '.gemini',
  'antigravity',
  'brain',
  CONVERSATION_ID
);
const targetLogsDir = path.join(targetBrainDir, '.system_generated', 'logs');
const globalAgentsSkillsDir = path.join(homeDir, '.agents', 'skills');
const globalAntigravitySkillsDir = path.join(
  homeDir,
  '.gemini',
  'antigravity',
  'skills'
);

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function main() {
  console.log('🔄 Restaurando sesión de Google Antigravity y Agent Skills...');

  // 1. Restaurar Brain y Transcripts JSONL
  fs.mkdirSync(targetLogsDir, { recursive: true });

  for (const artifact of ['implementation_plan.md', 'task.md']) {
    const srcFile = path.join(EXPORT_DIR, artifact);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(targetBrainDir, artifact));
    }
  }

  for (const logFile of ['transcript.jsonl', 'transcript_full.jsonl']) {
    const srcLog = path.join(EXPORT_DIR, logFile);
    if (fs.existsSync(srcLog)) {
      fs.copyFileSync(srcLog, path.join(targetLogsDir, logFile));
    }
  }
  console.log(`✅ Brain y transcripción JSONL restaurados en: ${targetBrainDir}`);

  // 2. Restaurar las 18 Agent Skills globales
  fs.mkdirSync(globalAgentsSkillsDir, { recursive: true });
  copyRecursive(LOCAL_SKILLS_DIR, globalAgentsSkillsDir);

  try {
    if (!fs.existsSync(globalAntigravitySkillsDir)) {
      const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
      fs.symlinkSync(globalAgentsSkillsDir, globalAntigravitySkillsDir, symlinkType);
    }
  } catch {
    copyRecursive(LOCAL_SKILLS_DIR, globalAntigravitySkillsDir);
  }

  console.log(`✅ 18 Agent Skills sincronizadas en: ${globalAgentsSkillsDir}`);
  console.log('🚀 Entorno listo. Ejecuta "npm run dev" para levantar Remotion Studio en http://localhost:3000.');
}

main();
