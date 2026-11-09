/**
 * src/components/big/tokens.ts
 * Kit "EDITORIAL PRO" v4 — tokens de diseño con Safe Zone Instagram/Reels
 * y escala tipográfica armónica con presencia de la mascota Leo.
 *
 * Mejoras aplicadas:
 * - Margen lateral aumentado de 54px a 84px (ancho útil 912px): protección total frente
 *   a los botones nativos de Instagram Reels a la derecha (Like, Comentarios, Compartir).
 * - Tipografía recalibrada (FS.hero: 78, FS.title: 62): elimina la saturación visual,
 *   evita saltos de línea antiestéticos y deja respirar los diagramas.
 * - Coordenadas CTA_LAYOUT calibradas para acomodar a Leo en la escena final.
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
  /** Márgenes y zona útil del lienzo 1080x1920 (Safe Zone Instagram/TikTok/Shorts) */
  sideMargin: 84,
  width: 912,
  contentTop: 80,
  contentBottom: 1390,
} as const;

/** Tamaños tipográficos calibrados (px sobre lienzo 1080) */
export const FS = {
  hero: 78,
  title: 62,
  body: 38,
  small: 30,
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
