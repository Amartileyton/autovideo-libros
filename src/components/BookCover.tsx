import React, { useState } from 'react';
import { Img, staticFile } from 'remotion';
import dossierRaw from '../data/book-dossier.json';
import type { BookMetadata } from '../data/schema';

export interface BookCoverProps {
  bookMetadata?: BookMetadata;
  width?: number;
  height?: number;
  borderRadius?: number;
  variant?: 'hero' | 'mini';
  style?: React.CSSProperties;
}

const defaultDossierMeta = (dossierRaw as { bookMetadata?: BookMetadata })
  .bookMetadata;

/**
 * BookCover — Componente Resiliente de Portada con Cascada de Respaldo Automática (Punto 3)
 *
 * Orden de resolución:
 * 1. Portada oficial de alta resolución (`bookMetadata.coverImage`, descargada desde Goodreads / Apple Books / Google Books / OpenLibrary).
 * 2. Portada vectorial SVG editorial generada a medida (`bookMetadata.fallbackCoverImage`).
 * 3. Cubierta tipográfica vectorial inline en React si ningún asset externo estuviera disponible.
 */
export const BookCover: React.FC<BookCoverProps> = ({
  bookMetadata,
  width = 340,
  height = 510,
  borderRadius = 16,
  variant = 'hero',
  style,
}) => {
  const meta = bookMetadata ?? defaultDossierMeta;
  const primaryCover =
    meta?.coverImage || 'assets/books/el-poder-de-los-habitos-cover.jpg';
  const fallbackSvgCover =
    meta?.fallbackCoverImage ||
    primaryCover.replace(/\.(jpe?g|png|webp)$/i, '.svg');

  const [tier, setTier] = useState<'primary' | 'svg' | 'inline'>('primary');

  const activeSrc =
    tier === 'primary'
      ? staticFile(primaryCover)
      : staticFile(fallbackSvgCover);

  const isHero = variant === 'hero';

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        boxShadow: isHero
          ? '0 30px 60px rgba(20, 20, 19, 0.18), 0 6px 16px rgba(20, 20, 19, 0.08)'
          : '0 4px 10px rgba(0, 0, 0, 0.12)',
        border: isHero ? '2px solid #141413' : '1px solid #E5E2DC',
        backgroundColor: '#FEF9C3',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {tier !== 'inline' ? (
        <Img
          src={activeSrc}
          onError={() => {
            if (tier === 'primary' && fallbackSvgCover !== primaryCover) {
              setTier('svg');
            } else {
              setTier('inline');
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        /* Respaldo vectorial React inline de emergencia (100% libre de red y archivos) */
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FEF9C3',
            padding: isHero ? 28 : 6,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
            border: isHero ? '4px double #D94E34' : 'none',
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: isHero ? 11 : 5,
              fontWeight: 800,
              color: '#D94E34',
              letterSpacing: 1.4,
            }}
          >
            {meta?.categoryTag || 'EDICIÓN EDITORIAL'}
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: isHero ? 30 : 8,
              fontWeight: 900,
              color: '#141413',
              lineHeight: 1.15,
            }}
          >
            {meta?.title || 'Resumen Editorial'}
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: isHero ? 16 : 6,
              fontWeight: 700,
              color: '#575550',
            }}
          >
            {meta?.author || '@en1minuto.es'}
          </div>
        </div>
      )}

      {/* Reflejo sutil de lomo editorial en modo Hero 2.5D */}
      {isHero && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 14,
            background:
              'linear-gradient(90deg, rgba(20,20,19,0.22) 0%, rgba(255,255,255,0.28) 45%, rgba(20,20,19,0.06) 80%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};
