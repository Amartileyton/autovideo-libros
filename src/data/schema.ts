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
  rating: z.number(),
  ratingsCount: z.string(),
  coverImage: z.string(),
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
});

export type BookActionableLaw = z.infer<typeof BookActionableLawSchema>;

export const BookVisualDataSchema = z
  .object({
    mythLabel: z.string().optional(),
    realityLabel: z.string().optional(),
    rulerLabel: z.string().optional(),
    formulaLabel: z.string().optional(),
    primaryCurveLabel: z.string().optional(),
    secondaryCurveLabel: z.string().optional(),
    quoteExcerpt: BookQuoteExcerptSchema.optional(),
    secondaryQuote: BookQuoteExcerptSchema.optional(),
    actionableLaws: z.array(BookActionableLawSchema).optional(),
    identityQuote: z.string().optional(),
    verdictBadge: z.string().optional(),
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
