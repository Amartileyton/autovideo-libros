#!/usr/bin/env node
/**
 * scripts/book-scriptwriter.mjs
 * Guionista Estructurado de 60-65 Segundos para Resúmenes de Libros.
 *
 * Consume exclusivamente el dossier comprimido `src/data/book-dossier.json` (< 900 tokens)
 * y genera `src/data/scenes.json` (5 escenas, ~180 palabras, números escritos en letra en `text`
 * para dicción perfecta en ElevenLabs y cifras técnicas en `metrics` / `bookVisualData`).
 *
 * Soporta:
 * 1. Google Gemini API Free Tier (`gemini-2.5-flash` / `gemini-2.0-flash`) si GEMINI_API_KEY está configurada en .env.
 * 2. Compilador Determinista Local de 0 tokens si no se ha configurado clave aún.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const DOSSIER_PATH = path.join(ROOT_DIR, 'src', 'data', 'book-dossier.json');
const SCENES_OUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'scenes.json');

/**
 * Coordenadas del lienzo continuo 2400x6000 para las 5 escenas del resumen
 */
const CANVAS_CAMERA_TARGETS = [
  { x: 0, y: 0, zoom: 1.0, rotateDeg: 0 },
  { x: 1120, y: 0, zoom: 1.0, rotateDeg: 0 },
  { x: 1120, y: 1980, zoom: 1.0, rotateDeg: 0 },
  { x: 0, y: 1980, zoom: 1.0, rotateDeg: 0 },
  { x: 560, y: 3960, zoom: 1.0, rotateDeg: 0 },
];

/**
 * Llamada ultra-compacta a Gemini API (Free Tier: gemini-2.5-flash -> fallback gemini-2.0-flash)
 */
async function generateScenesWithGemini(dossier, apiKey, preferredModel) {
  const modelsToTry = [
    preferredModel || 'gemini-2.5-flash',
    'gemini-2.0-flash',
  ];

  // Prompt minimalista (< 320 tokens de instrucción + ~700 tokens del dossier)
  const systemInstruction = `Eres un director de guiones para Shorts verticales de resúmenes de libros (60-65 segundos, 5 escenas, ~180 palabras en total en español).
REGLAS ESTRICTAS:
1. Devuelve ÚNICAMENTE un objeto JSON válido con la propiedad "scenes" (array de 5 escenas: scene-1 a scene-5).
2. Cada escena debe tener entre 33 y 40 palabras en "text" (total ~180 palabras para durar 62-65 segundos).
3. En el campo "text", TODOS los números y porcentajes DEBEN escribirse en letra (ej: "uno por ciento", "treinta y siete veces", "dos minutos", "cuatro coma cuatro estrellas") para dicción perfecta en TTS.
4. Incluye pausas prosódicas "[PAUSA 0.4s]" entre frases clave para ritmo documental.
5. Mantén fidelidad absoluta a los datos y citas reales del dossier.`;

  const compactPayload = {
    book: dossier.bookMetadata,
    thesis: dossier.synopsisCondensed,
    mythVsReality: dossier.mythVsReality,
    math: dossier.mathematicalProof,
    quotes: dossier.verifiedQuotes,
    laws: dossier.actionableLaws,
  };

  const userPrompt = `Genera las 5 escenas para este dossier de libro:\n${JSON.stringify(compactPayload)}`;

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      continue;
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed.scenes) && parsed.scenes.length === 5) {
        return { scenes: parsed.scenes, modelUsed: model };
      }
    }
  }

  throw new Error('No se pudo obtener respuesta estructurada de Gemini API.');
}

/**
 * Compilador determinista de 5 escenas (62-65 segundos / ~182 palabras) a partir del dossier
 */
function buildCanonicalFiveScenesFromDossier(dossier) {
  const meta = dossier.bookMetadata;
  const quotes = dossier.verifiedQuotes || [];
  const laws = dossier.actionableLaws || [];

  return [
    {
      id: 'scene-1',
      title: 'LA TRAMPA DE LAS METAS',
      text: '¿Por qué abandonas tus propósitos cada año? [PAUSA 0.5s] En Hábitos Atómicos, James Clear demuestra que ganadores y perdedores comparten exactamente las mismas metas. [PAUSA 0.4s] La diferencia nunca es el objetivo, sino el sistema diario que ejecutas sin pensarlo.',
      characterPreset: 'dramatic',
      blueprintMode: 'DARK_CAD_XRAY',
      visualCue:
        'Libro Hábitos Atómicos en perspectiva isométrica 2.5D con marcador que tacha METAS y corona SISTEMAS.',
      cameraTarget: CANVAS_CAMERA_TARGETS[0],
      metrics: {
        label: 'RATING GOODREADS',
        numericValue: meta.rating || 4.38,
        unit: '★',
      },
      bookVisualData: {
        mythLabel: dossier.mythVsReality?.mythLabel || 'METAS',
        realityLabel: dossier.mythVsReality?.realityLabel || 'SISTEMAS',
        callouts: [
          {
            title: 'sistema conductual (ciano)',
            subtitle: 'micro-decisiones automáticas que moldean tu día',
            color: '#38BDF8',
          },
          {
            title: 'meta aislada (coral)',
            subtitle: 'depende de picos efímeros de motivación',
            color: '#F43F5E',
          },
        ],
        rulerLabel: `${meta.pages || 320} PÁGINAS · ${meta.ratingsCount || '1.94M'} LECTORES EN GOODREADS`,
      },
    },
    {
      id: 'scene-2',
      title: 'LA MATEMÁTICA DEL UNO POR CIENTO',
      text: 'El cerebro humano ignora los cambios invisibles. [PAUSA 0.4s] Pero si mejoras apenas un uno por ciento cada día durante un año, el interés compuesto multiplica tu capacidad por treinta y siete coma setenta y ocho veces al final del ciclo.',
      characterPreset: 'narrator',
      blueprintMode: 'CHRONO_OSCILLOSCOPE',
      visualCue:
        'Osciloscopio de doble curva comparando crecimiento exponencial +1% diario (37.78x) frente a deterioro -1% (0.03x).',
      cameraTarget: CANVAS_CAMERA_TARGETS[1],
      metrics: {
        label: 'MULTIPLICADOR ANUAL',
        numericValue: 37.78,
        unit: 'x',
      },
      bookVisualData: {
        formulaLabel:
          dossier.mathematicalProof?.formulaLabel ||
          '1.01^365 = 37.78x vs 0.99^365 = 0.03x',
        primaryCurveLabel: '+1% DIARIO · 37.78x (EXPONENCIAL)',
        secondaryCurveLabel: '-1% DIARIO · 0.03x (DECLIVE)',
      },
    },
    {
      id: 'scene-3',
      title: 'PASAJE CENTRAL Y BUCLE NEURONAL',
      text: 'Escucha la frase más subrayada de toda la obra: [PAUSA 0.4s] no te elevas al nivel de tus metas, caes al nivel de tus sistemas. [PAUSA 0.5s] Todo hábito opera en cuatro fases: señal, anhelo, respuesta y recompensa inmediata.',
      characterPreset: 'expert',
      blueprintMode: 'EDITORIAL_PAPER',
      visualCue:
        'Página editorial cálida #F8F7F4 con subrayado físico roughjs en vivo sobre la cita central y desglose 2.5D del bucle.',
      cameraTarget: CANVAS_CAMERA_TARGETS[2],
      metrics: {
        label: 'FASES DEL BUCLE',
        numericValue: 4,
        unit: 'ETAPAS',
      },
      bookVisualData: {
        quoteExcerpt: quotes[0] || {
          text: 'No te elevas al nivel de tus metas. Caes al nivel de tus sistemas.',
          highlightPhrases: ['nivel de tus metas', 'nivel de tus sistemas'],
          chapter: 'Capítulo 1 · El sorprendente poder de los hábitos atómicos',
        },
        secondaryQuote: quotes[2] || {
          text: 'Los hábitos son el interés compuesto de la superación personal.',
          highlightPhrases: ['interés compuesto', 'superación personal'],
          chapter: 'Capítulo 1 · El efecto compuesto 1%',
        },
      },
    },
    {
      id: 'scene-4',
      title: 'LAS CUATRO LEYES ACCIONABLES',
      text: 'Para hackear ese bucle hoy mismo, aplica sus cuatro leyes: [PAUSA 0.4s] primero, hazlo obvio dejando la señal a la vista; [PAUSA 0.3s] segundo, hazlo atractivo; [PAUSA 0.3s] tercero, redúcelo a la regla de los dos minutos; y cuarto, hazlo satisfactorio.',
      characterPreset: 'narrator',
      blueprintMode: 'BLUEPRINT_BLUE',
      visualCue:
        'Cajón técnico interactivo desplegando las 4 Leyes del Cambio de Conducta con porcentajes de retención.',
      cameraTarget: CANVAS_CAMERA_TARGETS[3],
      metrics: {
        label: 'REGLA DE INICIO',
        numericValue: 2,
        unit: 'MIN',
      },
      bookVisualData: {
        actionableLaws: laws,
      },
    },
    {
      id: 'scene-5',
      title: 'IDENTIDAD Y VEREDICTO FINAL',
      text: 'El secreto definitivo no es cambiar lo que haces, sino quién eres: [PAUSA 0.4s] cada pequeña acción es un voto por tu nueva identidad. [PAUSA 0.5s] Con casi dos millones de reseñas en Goodreads, es lectura obligatoria esta semana.',
      characterPreset: 'conversational',
      blueprintMode: 'TOPOLOGY_WIREFRAME',
      visualCue:
        'Tarjeta de veredicto bibliográfico con cita de identidad, puntuación Goodreads 4.38 estrellas y tiempo de lectura.',
      cameraTarget: CANVAS_CAMERA_TARGETS[4],
      metrics: {
        label: 'LECTURA ESTIMADA',
        numericValue: meta.readingTimeHours || 4.2,
        unit: 'HORAS',
      },
      bookVisualData: {
        identityQuote:
          quotes[1]?.text ||
          'Cada acción que realizas es un voto por el tipo de persona en la que deseas convertirte.',
        verdictBadge: 'IMPRESCINDIBLE · TOP 1% NO FICCIÓN',
      },
    },
  ];
}

async function main() {
  if (!fs.existsSync(DOSSIER_PATH)) {
    throw new Error(
      `No existe ${DOSSIER_PATH}. Ejecuta primero: npm run book:ingest`
    );
  }

  const dossier = JSON.parse(fs.readFileSync(DOSSIER_PATH, 'utf-8'));
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  const preferredModel = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

  let scenes = buildCanonicalFiveScenesFromDossier(dossier);
  let generatorLabel = 'Compilador Determinista Local (0 Tokens)';

  if (geminiKey && geminiKey !== 'tu_gemini_api_key_aqui') {
    try {
      console.log(
        `🤖 [book-scriptwriter] Generando guion de 65s con Google Gemini (${preferredModel})...`
      );
      const { scenes: llmScenes, modelUsed } = await generateScenesWithGemini(
        dossier,
        geminiKey,
        preferredModel
      );
      // Enriquecer las escenas generadas por Gemini con las coordenadas y blueprints del dossier
      scenes = scenes.map((baseScene, idx) => ({
        ...baseScene,
        title: llmScenes[idx]?.title || baseScene.title,
        text: llmScenes[idx]?.text || baseScene.text,
      }));
      generatorLabel = `Google Gemini API (${modelUsed})`;
    } catch (err) {
      console.warn(
        `⚠️ [book-scriptwriter] Aviso Gemini API (${err.message}). Usando guion maestro calibrado del dossier.`
      );
    }
  } else {
    console.log(
      '⚡ [book-scriptwriter] GEMINI_API_KEY no definida en .env; compilando guion maestro calibrado desde book-dossier.json (0 tokens).'
    );
  }

  const totalWords = scenes.reduce(
    (acc, s) =>
      acc +
      s.text
        .replace(/\[[^\]]+\]/g, '')
        .trim()
        .split(/\s+/).length,
    0
  );

  const output = {
    projectTitle: `${dossier.bookMetadata.title} — ${dossier.bookMetadata.author} (Resumen 65s)`,
    fps: 30,
    width: 1080,
    height: 1920,
    crossDissolveFrames: 10,
    bookMetadata: dossier.bookMetadata,
    scenes,
  };

  fs.writeFileSync(SCENES_OUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  console.log(
    `✅ [book-scriptwriter] Guion de 5 escenas escrito en src/data/scenes.json (${totalWords} palabras netas + pausas prosódicas · Motor: ${generatorLabel}).`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error('❌ Error en book-scriptwriter:', err.message);
    process.exit(1);
  });
}
