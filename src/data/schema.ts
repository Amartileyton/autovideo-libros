import { z } from 'zod';

/**
 * Presets de personalidad vocal de ElevenLabs mapeados a voice_settings
 */
export const CharacterPresetSchema = z.enum([
  'narrator',
  'expert',
  'dramatic',
  'conversational',
  'calm',
]);

export type CharacterPreset = z.infer<typeof CharacterPresetSchema>;

/**
 * Marca de tiempo palabra por palabra calculada a partir del alignment de ElevenLabs
 */
export const WordTimestampSchema = z.object({
  word: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  startFrame: z.number(),
  endFrame: z.number(),
});

export type WordTimestamp = z.infer<typeof WordTimestampSchema>;

/**
 * Metadatos normalizados del libro extraídos por scripts/book-ingest.mjs
 */
export const BookMetadataSchema = z.object({
  title: z.string(),
  originalTitle: z.string().optional(),
  author: z.string(),
  publishYear: z.number(),
  pages: z.number(),
  readingTimeHours: z.number().optional(),
  salesCopies: z.string().optional(),
  rating: z.number(),
  ratingsCount: z.string(),
  coverImage: z.string(),
  fallbackCoverImage: z.string().optional(),
  coverSource: z.string().optional(),
  categoryTag: z.string(),
  goodreadsUrl: z.string().optional(),
});

export type BookMetadata = z.infer<typeof BookMetadataSchema>;

/**
 * Estructura de citas verificadas y leyes prácticas para las primitivas vectoriales
 */
export const BookQuoteExcerptSchema = z.object({
  text: z.string(),
  highlightPhrases: z.array(z.string()),
  chapter: z.string(),
});

export type BookQuoteExcerpt = z.infer<typeof BookQuoteExcerptSchema>;

export const BookActionableLawSchema = z.object({
  index: z.string(),
  title: z.string(),
  rule: z.string(),
  impactPct: z.number(),
  highlight: z.boolean().optional(),
  triggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
});

export type BookActionableLaw = z.infer<typeof BookActionableLawSchema>;

/**
 * Catálogo de Presets Visuales del Motor Híbrido Inteligente (mapeado 1:1 al cuestionario ask_question)
 */
export const SceneLayoutPresetSchema = z.enum([
  // Escena 1 — El Gancho + Portada
  'HOOK_COVER_BATTLE',
  'HOOK_COVER_STAT',
  'HOOK_COVER_QUESTION',
  // Escena 2 — La Tesis / Mecanismo Científico
  'THESIS_LOOP_CIRCUIT',
  'THESIS_EXPONENTIAL_CHART',
  'THESIS_COMPARISON_BATTLE',
  // Escena 3 — La Regla de Oro / Evidencia Central
  'RULE_TRANSFORM_CIRCUIT',
  'RULE_SUBSTITUTION_DIAGRAM',
  'RULE_EXPONENTIAL_EVIDENCE',
  // Escena 4 — Las Leyes Accionables / Casos Reales
  'LAWS_DOMINO_CASCADE',
  'LAWS_COMPARISON_BATTLE',
  'LAWS_PILLAR_MATRIX',
  // Escena 5 — El Manifiesto Final + CTA @en1minuto.es
  'CTA_MANIFESTO_GOODREADS',
  'CTA_EXECUTIVE_SUMMARY',
]);

export type SceneLayoutPreset = z.infer<typeof SceneLayoutPresetSchema>;

/**
 * Nodo declarativo del circuito vectorial con auto-binding semántico por palabra clave
 */
export const CircuitNodeInputSchema = z.object({
  id: z.string(),
  num: z.string(),
  label: z.string(),
  sublabel: z.string(),
  triggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
  triggerFrame: z.number().optional(),
  endSpokenFrame: z.number().optional(),
});

export type CircuitNodeInput = z.infer<typeof CircuitNodeInputSchema>;

/**
 * Bloque custom declarativo para overrides en el Motor Híbrido Inteligente
 */
export const SceneCustomBlockSchema = z.object({
  type: z.enum([
    'KINETIC_QUOTE',
    'LIVE_COUNTER',
    'COMPARISON_BATTLE',
    'VECTOR_LOOP',
    'EXPONENTIAL_CHART',
    'GOODREADS_BADGES',
  ]),
  triggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

export type SceneCustomBlock = z.infer<typeof SceneCustomBlockSchema>;

export const BookVisualDataSchema = z
  .object({
    provocativeQuestion: z.string().optional(),
    provocativeHighlight: z.string().optional(),
    bookKeywords: z.array(z.string()).optional(),
    growthMetric: z.string().optional(),
    growthFormula: z.string().optional(),
    mythTriggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
    strikeTriggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
    realityTriggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
    hookStat: z.string().optional(),
    hookNumericValue: z.number().optional(),
    hookUnit: z.string().optional(),
    hookLabel: z.string().optional(),
    hookSource: z.string().optional(),
    hookTriggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
    battleTriggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
    mythLabel: z.string().optional(),
    mythSubtitle: z.string().optional(),
    mythTag: z.string().optional(),
    realityLabel: z.string().optional(),
    realitySubtitle: z.string().optional(),
    realityTag: z.string().optional(),
    goodreadsRating: z.string().optional(),
    goodreadsReviews: z.string().optional(),
    rulerLabel: z.string().optional(),
    formulaLabel: z.string().optional(),
    formulaSublabel: z.string().optional(),
    primaryCurveLabel: z.string().optional(),
    secondaryCurveLabel: z.string().optional(),
    loopSteps: z.array(z.string()).optional(),
    circuitNodes: z.array(CircuitNodeInputSchema).optional(),
    centralQuote: z.string().optional(),
    highlightWords: z.array(z.string()).optional(),
    quoteExcerpt: BookQuoteExcerptSchema.optional(),
    secondaryQuote: BookQuoteExcerptSchema.optional(),
    actionableLaws: z.array(BookActionableLawSchema).optional(),
    dominoSteps: z
      .array(
        z.object({
          label: z.string(),
          sub: z.string(),
        })
      )
      .optional(),
    dominoTriggerKeyword: z.union([z.string(), z.array(z.string())]).optional(),
    identityQuote: z.string().optional(),
    verdictBadge: z.string().optional(),
    ctaPrompt: z.string().optional(),
    ctaActionText: z.string().optional(),
    brandPromise: z.string().optional(),
    showCommunityQuestion: z.boolean().optional(),
    ctaHandle: z.string().optional(),
    executiveSummaryPoints: z.array(z.string()).optional(),
    callouts: z
      .array(
        z.object({
          title: z.string(),
          subtitle: z.string(),
          color: z.string().optional(),
        })
      )
      .optional(),
  })
  .optional();

export type BookVisualData = z.infer<typeof BookVisualDataSchema>;

/**
 * Definición de escena en src/data/scenes.json
 */
export const SceneInputSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  characterPreset: CharacterPresetSchema,
  blueprintMode: z
    .enum([
      'BLUEPRINT_BLUE',
      'DARK_CAD_XRAY',
      'TOPOLOGY_WIREFRAME',
      'CHRONO_OSCILLOSCOPE',
      'EDITORIAL_PAPER',
    ])
    .optional(),
  layoutPreset: SceneLayoutPresetSchema.optional(),
  customBlocks: z.array(SceneCustomBlockSchema).optional(),
  visualCue: z.string(),
  cameraTarget: z
    .object({
      x: z.number(),
      y: z.number(),
      zoom: z.number().min(0.4).max(3.0),
      rotateDeg: z.number().optional(),
    })
    .optional(),
  metrics: z
    .object({
      label: z.string(),
      numericValue: z.number(),
      unit: z.string(),
    })
    .optional(),
  bookVisualData: BookVisualDataSchema,
});

export type SceneInput = z.infer<typeof SceneInputSchema>;

export const ScenesFileSchema = z.object({
  projectTitle: z.string(),
  fps: z.number().default(30),
  width: z.number().default(1080),
  height: z.number().default(1920),
  crossDissolveFrames: z.number().default(10),
  bookMetadata: BookMetadataSchema.optional(),
  scenes: z.array(SceneInputSchema),
});

export type ScenesFile = z.infer<typeof ScenesFileSchema>;

/**
 * Metadatos de sincronización generados por scripts/elevenlabs-sync.mjs en public/audio/info.json
 */
export const SceneAudioInfoSchema = z.object({
  id: z.string(),
  audioFile: z.string(),
  characterPreset: CharacterPresetSchema,
  actualDuration: z.number(),
  durationInFrames: z.number(),
  wordsPerSecond: z.number(),
  leadingSilenceMs: z.number(),
  trailingSilenceMs: z.number(),
  trimOffsetMs: z.number().default(0),
  warnings: z.array(z.string()).default([]),
  wordTimestamps: z.array(WordTimestampSchema),
});

export type SceneAudioInfo = z.infer<typeof SceneAudioInfoSchema>;

export const AudioManifestSchema = z.object({
  generatedAt: z.string(),
  fps: z.number(),
  crossDissolveFrames: z.number(),
  totalDurationInFrames: z.number(),
  totalDurationSeconds: z.number(),
  backgroundMusicFile: z.string().nullable().default(null),
  scenes: z.array(SceneAudioInfoSchema),
});

export type AudioManifest = z.infer<typeof AudioManifestSchema>;

/**
 * Props parametrizables del componente principal <Video />
 */
export const VideoPropsSchema = z.object({
  title: z
    .string()
    .default('Hábitos Atómicos — James Clear (Resumen Vectorial 65s)'),
  surfaceColor: z.string().default('#111111'),
  enableCaptions: z.boolean().default(true),
  enableBackgroundMusic: z.boolean().default(false),
});

export type VideoProps = z.infer<typeof VideoPropsSchema>;
