/**
 * src/components/big/tokens.ts
 * Kit "BIG" v3 — tokens de diseño para tarjetas grandes, pocas palabras y mucha animación.
 *
 * Reglas del kit (auditoría v2, Sección 3.2):
 * - Texto mínimo legible en móvil: lienzo 1080px se ve a ~x0.36 → cuerpo >= 38px, secundario >= 30px.
 * - Zona de contenido: top 70px → bottom 1390px (los subtítulos viven en top 1442px).
 * - Tarjetas a ancho completo útil (972px = 1080 - 2 * 54px).
 */

export const BIG = {
  ink: '#141413',
  paper: '#F8F7F4',
  card: '#FEF9C3',
  cream: '#FFFBEB',
  accent: '#D94E34',
  amber: '#D97706',
  green: '#15803D',
  danger: '#DC2626',
  muted: '#575550',
  dim: 'rgba(20, 20, 19, 0.28)',
  font: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  /** Márgenes y zona útil del lienzo 1080x1920 */
  sideMargin: 54,
  width: 972,
  contentTop: 70,
  contentBottom: 1390,
} as const;

/** Tamaños tipográficos mínimos (px sobre lienzo 1080) */
export const FS = {
  hero: 104,
  title: 72,
  body: 44,
  small: 34,
} as const;

/**
 * Geometría compartida del CTA final: la tarjeta del CTA y el vuelo del reloj (Video.tsx)
 * leen las mismas constantes para que el reloj aterrice siempre en la ranura de la tarjeta.
 */
export const CTA_LAYOUT = {
  cardTop: 600,
  cardBottom: 1390,
  clockTop: 636,
  clockSize: 110,
} as const;
