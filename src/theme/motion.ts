/**
 * src/theme/motion.ts
 * Sistema de Movimiento Cerrado, Físicas Spring, 5 Modos de Superficie @resultaaquee,
 * 15 Blueprints de OPENMONTAGE y las 27 Reglas de LottieFiles/motion-design-skill.
 *
 * REGLAS INQUEBRANTABLES:
 * 1. Prohibido CSS transition o @keyframes. Todo movimiento usa useCurrentFrame().
 * 2. Todo interpolate() debe incluir CLAMP_EXTRAPOLATION.
 * 3. Únicamente se permiten dos físicas spring(): SPRING_SNAPPY y SPRING_CAMERA.
 * 4. Art-First Pipeline: Prohibido improvisar dibujos complejos con <rect> planos;
 *    usar Hero Props ilustrados por capas (image-generator + alfa) o mallas 3D (@remotion/three),
 *    suavizados con @remotion/motion-blur, @remotion/paths, @remotion/noise y flubber.
 * 5. Zona Segura Vertical (9:16): Todo texto y vector clave en el 85% superior (288px inferiores reservados).
 */

import { Easing, type SpringConfig } from 'remotion';

/**
 * Física Spring #1: Entradas de UI, cajas de selección vectorial, contadores numéricos y trazos.
 */
export const SPRING_SNAPPY: SpringConfig = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
  overshootClamping: false,
} as const;

/**
 * Física Spring #2: Movimientos panorámicos, zooms fractales y transiciones del CameraRig.
 */
export const SPRING_CAMERA: SpringConfig = {
  damping: 30,
  stiffness: 90,
  mass: 1.2,
  overshootClamping: false,
} as const;

/**
 * Configuración obligatoria para todas las llamadas a interpolate().
 */
export const CLAMP_EXTRAPOLATION = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/**
 * Curvas de suavidad cinemática (LottieFiles / motion-design-skill)
 */
export const MOTION_EASING = {
  /** Desaceleración suave para entradas de objetos pesados */
  quartOut: Easing.bezier(0.25, 1, 0.5, 1),
  /** Desaceleración exponencial para barridos de escáner y rayos X */
  expoOut: Easing.bezier(0.16, 1, 0.3, 1),
  /** Curva simétrica para cambios de estado y morphing con flubber */
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
  /** Ligera anticipación antes de un movimiento rápido */
  anticipate: Easing.bezier(0.36, 0, 0.66, -0.56),
} as const;

/**
 * Constantes de las 27 Reglas de OPENMONTAGE + LottieFiles/motion-design-skill
 */
export const MOTION_DESIGN_27_RULES = {
  /** Reglas 1-5: Temporización y Cadencia (30fps) */
  staggerDelayFrames: 4,
  overlapFollowThroughFrames: 6,
  holdAfterRevealFrames: 18,
  rackFocusTransitionFrames: 10,
  microPauseRetentionMs: 450,
  /** Reglas 6-10: Obturador y Suavidad (@remotion/motion-blur) */
  defaultShutterAngle: 180,
  strobeTrailSamples: 4,
  strobeTrailLagInFrames: 2.5,
  /** Reglas 11-15: Respiración Orgánica (@remotion/noise) */
  idleNoiseFrequency: 0.008,
  idleNoiseAmplitudePx: 5.5,
  idleTiltAmplitudeDeg: 1.4,
  /** Reglas 16-21: Proporción Espacial y Contraste (Zero-Box) */
  minNegativeSpaceRatio: 0.45,
  heroObjectScaleRatio: 0.62,
  maxSimultaneousSelectionBoxes: 1,
  /** Reglas 22-27: Dirección de Arte (Art-First Gate) */
  requireHeroAssetOr3DMesh: true,
  forbidRawRectPlaceholders: true,
} as const;

/**
 * Catálogo Oficial de los 15 Blueprints de OPENMONTAGE + @resultaaquee
 */
export const OPENMONTAGE_15_BLUEPRINTS = [
  'BP_01_EXPLODED_25D_STACK',
  'BP_02_XRAY_CAD_CUTAWAY',
  'BP_03_FRACTAL_MATRIX_ZOOM',
  'BP_04_TOPOLOGY_MORPH_STAGE',
  'BP_05_CHRONO_STROBE_OSCILLOSCOPE',
  'BP_06_VORONOI_HIT_REGIONS',
  'BP_07_DATASET_TERMINAL_DRAWER',
  'BP_08_DIMENSION_CAD_RULER',
  'BP_09_LEADER_LINE_CALLOUT',
  'BP_10_VECTOR_SELECTION_HANDLE',
  'BP_11_BINARY_TRUTH_TABLE',
  'BP_12_SUBJECTIVE_VISION_SPLIT',
  'BP_13_EDITORIAL_ATTRIBUTION_CARD',
  'BP_14_HERO_PUPPET_RIG',
  'BP_15_NATIVE_SHARE_SHEET_OUTRO',
] as const;

export type OpenMontageBlueprintId = (typeof OPENMONTAGE_15_BLUEPRINTS)[number];

/**
 * Dimensiones y Zona Segura Vertical (9:16 — Reels / TikTok / Shorts)
 */
export const VIDEO_CONFIG = {
  fps: 30,
  width: 1080,
  height: 1920,
  crossDissolveFrames: 10,
} as const;

export const SAFE_ZONE = {
  /** 85% superior del lienzo disponible para titulares, subtítulos y vectores clave */
  maxSafeY: 1632, // 1920 - 288
  /** 288px inferiores reservados estrictamente para la UI de Reels/TikTok/Shorts */
  bottomReservedPx: 288,
  /** Padding lateral mínimo obligatorio a cada lado */
  horizontalPaddingPx: 96,
  /** Coordenada X mínima y máxima segura */
  minSafeX: 96,
  maxSafeX: 984, // 1080 - 96
  /** Coordenada Y recomendada para subtítulos en tercio superior (estilo ref2/ref3) */
  upperThirdCaptionY: 200,
  /** Coordenada Y recomendada para subtítulos en tercio inferior (estilo ref1/ref5) */
  lowerThirdCaptionY: 1440,
  /** Reglas tipográficas mínimas */
  minHeadlinePx: 64,
  maxHeadlineWords: 7,
  minLabelPx: 28,
  maxLabelWords: 20,
} as const;

/**
 * 5 Modos de Superficie extraídos de los vídeos de referencia de @resultaaquee
 */
export type BlueprintModeId =
  | 'BLUEPRINT_BLUE'
  | 'DARK_CAD_XRAY'
  | 'TOPOLOGY_WIREFRAME'
  | 'CHRONO_OSCILLOSCOPE'
  | 'EDITORIAL_PAPER';

export interface BlueprintTheme {
  id: BlueprintModeId;
  name: string;
  surface: string;
  surfaceRadialGlow: string;
  surfaceElevated: string;
  gridMajor: string;
  gridMinor: string;
  ink: string;
  inkMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  accentSuccess: string;
  accentWarning: string;
  accentDanger: string;
  selectionBoxColor: string;
  xrayFill: string;
  xrayStroke: string;
}

export const BLUEPRINT_THEMES: Record<BlueprintModeId, BlueprintTheme> = {
  BLUEPRINT_BLUE: {
    id: 'BLUEPRINT_BLUE',
    name: 'Blueprint Ingeniería Azul (Ref 1)',
    surface: '#15457A',
    surfaceRadialGlow: '#1E5A9C',
    surfaceElevated: '#0F355E',
    gridMajor: 'rgba(255, 255, 255, 0.14)',
    gridMinor: 'rgba(255, 255, 255, 0.05)',
    ink: '#FFFFFF',
    inkMuted: '#93C5FD',
    accentPrimary: '#FBBF24',
    accentSecondary: '#38BDF8',
    accentSuccess: '#34D399',
    accentWarning: '#F59E0B',
    accentDanger: '#FB7185',
    selectionBoxColor: '#FBBF24',
    xrayFill: 'rgba(56, 189, 248, 0.18)',
    xrayStroke: '#7DD3FC',
  },
  DARK_CAD_XRAY: {
    id: 'DARK_CAD_XRAY',
    name: 'Dark CAD & X-Ray Cutaway (Ref 2 & Ref 3)',
    surface: '#111111',
    surfaceRadialGlow: '#24201C',
    surfaceElevated: '#1A1A1A',
    gridMajor: 'rgba(255, 255, 255, 0.07)',
    gridMinor: 'rgba(255, 255, 255, 0.025)',
    ink: '#FFFFFF',
    inkMuted: '#8E8E93',
    accentPrimary: '#F59E0B',
    accentSecondary: '#3B82F6',
    accentSuccess: '#22C55E',
    accentWarning: '#F59E0B',
    accentDanger: '#F43F5E',
    selectionBoxColor: '#3B82F6',
    xrayFill: 'rgba(56, 189, 248, 0.20)',
    xrayStroke: '#38BDF8',
  },
  TOPOLOGY_WIREFRAME: {
    id: 'TOPOLOGY_WIREFRAME',
    name: 'Estudio Topológico & Wireframe (Ref 4)',
    surface: '#0A0E12',
    surfaceRadialGlow: '#13252E',
    surfaceElevated: '#162129',
    gridMajor: 'rgba(255, 255, 255, 0.05)',
    gridMinor: 'rgba(255, 255, 255, 0.015)',
    ink: '#F8FAFC',
    inkMuted: '#64748B',
    accentPrimary: '#22C55E',
    accentSecondary: '#EC4899',
    accentSuccess: '#22C55E',
    accentWarning: '#FBBF24',
    accentDanger: '#EC4899',
    selectionBoxColor: '#22C55E',
    xrayFill: 'rgba(148, 163, 184, 0.16)',
    xrayStroke: '#94A3B8',
  },
  CHRONO_OSCILLOSCOPE: {
    id: 'CHRONO_OSCILLOSCOPE',
    name: 'Laboratorio Cronofotográfico & Osciloscopio (Ref 5)',
    surface: '#1E1D1B',
    surfaceRadialGlow: '#2A2825',
    surfaceElevated: '#292724',
    gridMajor: 'rgba(239, 68, 68, 0.11)',
    gridMinor: 'rgba(255, 255, 255, 0.035)',
    ink: '#F5F5F4',
    inkMuted: '#A8A29E',
    accentPrimary: '#EF4444',
    accentSecondary: '#FACC15',
    accentSuccess: '#22C55E',
    accentWarning: '#F59E0B',
    accentDanger: '#DC2626',
    selectionBoxColor: '#DC2626',
    xrayFill: 'rgba(239, 68, 68, 0.15)',
    xrayStroke: '#EF4444',
  },
  EDITORIAL_PAPER: {
    id: 'EDITORIAL_PAPER',
    name: 'Papel Técnico Editorial',
    surface: '#F8F7F4',
    surfaceRadialGlow: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    gridMajor: '#E5E2DC',
    gridMinor: '#EFECE6',
    ink: '#141413',
    inkMuted: '#575550',
    accentPrimary: '#D94E34',
    accentSecondary: '#1D4ED8',
    accentSuccess: '#15803D',
    accentWarning: '#B45309',
    accentDanger: '#DC2626',
    selectionBoxColor: '#1D4ED8',
    xrayFill: 'rgba(29, 78, 216, 0.12)',
    xrayStroke: '#1D4ED8',
  },
} as const;

/**
 * Paleta por defecto compatible con escenas existentes
 */
export const PALETTE = {
  surface: '#F8F7F4',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#EFECE6',
  gridLine: '#E5E2DC',
  ink: '#141413',
  inkMuted: '#575550',
  accentPrimary: '#D94E34',
  accentSecondary: '#1D4ED8',
  accentSuccess: '#15803D',
  accentWarning: '#B45309',
  border: '#262523',
} as const;


/**
 * Configuración de Marca Corporativa para el Canal de Resúmenes en 60s
 */
export const BRAND_CONFIG = {
  channelHandle: '@en1minuto.es',
  tagline: 'IDEAS CLAVE EN 1 MINUTO',
  sealText: 'SELECCIÓN EDITORIAL · RECOMENDADO POR @EN1MINUTO.ES',
  defaultTheme: 'EDITORIAL_PAPER' as BlueprintModeId,
  showProgressBar: true,
  progressBarHeight: 6,
  progressBarColor: '#D94E34',
  fontDisplay: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  fontSerif: "'Plus Jakarta Sans', 'Inter', Georgia, serif",
  fontSans: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', 'IBM Plex Mono', monospace",
} as const;
