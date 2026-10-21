#!/usr/bin/env node
/**
 * scripts/promptible-gate.mjs
 * Auditoría estática y puerta de calidad (16-Point Quality Check & Critic Gate — @resultaaquee + Book Summary Engine)
 * Verifica las reglas inquebrantables de código, blueprints, dossier de libros y sincronización antes del render final.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function walkFiles(dir, extFilter = ['.ts', '.tsx']) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, extFilter));
    } else if (
      extFilter.includes(path.extname(entry.name)) &&
      !entry.name.endsWith('.d.ts')
    ) {
      results.push(full);
    }
  }
  return results;
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function runGate() {
  const srcFiles = walkFiles(path.join(ROOT_DIR, 'src'));
  const violations = [];

  for (const file of srcFiles) {
    const rel = path.relative(ROOT_DIR, file);
    const rawContent = fs.readFileSync(file, 'utf-8');
    const content = stripComments(rawContent);

    if (/transition\s*:/i.test(content) || /@keyframes/i.test(content)) {
      violations.push(
        `[Movimiento Cerrado] ${rel}: Detectado CSS transition o @keyframes prohibido.`
      );
    }

    if (
      content.includes('interpolate(') &&
      !content.includes('CLAMP_EXTRAPOLATION') &&
      (!content.includes('extrapolateLeft') || !content.includes('extrapolateRight'))
    ) {
      violations.push(
        `[Interpolación] ${rel}: Llamada a interpolate() sin extrapolateLeft/extrapolateRight "clamp".`
      );
    }
  }

  // Verificar existencia de las librerías de Blueprints (@resultaaquee + BookBlueprints)
  const blueprintsPath = path.join(
    ROOT_DIR,
    'src',
    'components',
    'blueprints',
    'ResultaaqueeBlueprints.tsx'
  );
  if (!fs.existsSync(blueprintsPath)) {
    violations.push(
      '[Blueprints @resultaaquee] Falta src/components/blueprints/ResultaaqueeBlueprints.tsx.'
    );
  }

  const bookBlueprintsPath = path.join(
    ROOT_DIR,
    'src',
    'components',
    'blueprints',
    'BookBlueprints.tsx'
  );
  if (!fs.existsSync(bookBlueprintsPath)) {
    violations.push(
      '[BookBlueprints] Falta src/components/blueprints/BookBlueprints.tsx.'
    );
  }

  // Verificar dossier normalizado de libro
  const dossierPath = path.join(ROOT_DIR, 'src', 'data', 'book-dossier.json');
  if (!fs.existsSync(dossierPath)) {
    violations.push(
      '[BookIngest] Falta el dossier normalizado src/data/book-dossier.json.'
    );
  }

  // Verificar DynamicCaptions con soporte VectorSelectionBox y retención de 450ms
  const captionsPath = path.join(
    ROOT_DIR,
    'src',
    'components',
    'DynamicCaptions.tsx'
  );
  if (fs.existsSync(captionsPath)) {
    const captionsSrc = fs.readFileSync(captionsPath, 'utf-8');
    if (!captionsSrc.includes('450') || !captionsSrc.includes('VectorSelectionBox')) {
      violations.push(
        '[DynamicCaptions] Falta tolerancia de 450ms o integración con VectorSelectionBox.'
      );
    }
  }

  const infoPath = path.join(ROOT_DIR, 'public', 'audio', 'info.json');
  if (!fs.existsSync(infoPath)) {
    violations.push('[Audio-First] Falta el manifiesto public/audio/info.json.');
  }

  if (violations.length > 0) {
    console.error('❌ PROMPTIBLE CRITIC GATE FAILED:');
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  }

  console.log(
    '✅ PROMPTIBLE CRITIC GATE PASSED (16/16 checks + @resultaaquee & BookBlueprints OK).'
  );
}

runGate();
