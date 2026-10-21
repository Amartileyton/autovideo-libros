import React, { useMemo } from 'react';
import { evolvePath } from '@remotion/paths';
import { noise2D } from '@remotion/noise';
import { interpolate as flubberInterpolate } from 'flubber';
import rough from 'roughjs';
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BookActionableLaw, BookQuoteExcerpt } from '../../data/schema';
import {
  CLAMP_EXTRAPOLATION,
  MOTION_DESIGN_27_RULES,
  MOTION_EASING,
  PALETTE,
  SAFE_ZONE,
  SPRING_SNAPPY,
} from '../../theme/motion';
import { VectorSelectionBox } from './ResultaaqueeBlueprints';

/* ============================================================================
 * 1. BOOK 3D STAGE — Aparejo Isométrico 2.5D de Libro con Portada Real + Flubber
 * ========================================================================== */
const CAD_RING_PATH_A =
  'M 0 -310 A 310 310 0 1 1 0 310 A 310 310 0 1 1 0 -310 Z';
const CAD_RING_PATH_B =
  'M -140 -310 L 140 -310 L 310 -140 L 310 140 L 140 310 L -140 310 L -310 140 L -310 -140 Z';

export interface Book3DStageProps {
  coverSrc: string;
  bookTitle: string;
  author: string;
  pages?: number;
  rating?: number;
  ratingsCount?: string;
  x?: number;
  y?: number;
  enterFrame?: number;
  localFrame: number;
  accentColor?: string;
  secondaryColor?: string;
  cadTag?: string;
}

export const Book3DStage: React.FC<Book3DStageProps> = ({
  coverSrc,
  bookTitle,
  author,
  pages = 320,
  rating = 4.38,
  ratingsCount = '1.94M',
  x = 540,
  y = 830,
  enterFrame = 0,
  localFrame,
  accentColor = '#F59E0B',
  secondaryColor = '#38BDF8',
  cadTag = 'FIG 01 · ANATOMÍA EDITORIAL 2.5D',
}) => {
  const { fps } = useVideoConfig();

  const entrySpring = spring({
    frame: Math.max(0, localFrame - enterFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  const entryEased = interpolate(
    localFrame - enterFrame,
    [0, 28],
    [0, 1],
    {
      ...CLAMP_EXTRAPOLATION,
      easing: MOTION_EASING.quartOut,
    }
  );

  // Levitación orgánica determinista (@remotion/noise)
  const floatY = noise2D('book3d-y', localFrame * 0.016, 0) * 7.5;
  const floatX = noise2D('book3d-x', 0, localFrame * 0.014) * 4.5;
  const tiltDelta = noise2D('book3d-r', localFrame * 0.012, 2) * 2.2;

  // Morphing perimetral CAD con Flubber
  const morphInterpolator = useMemo(
    () =>
      flubberInterpolate(CAD_RING_PATH_A, CAD_RING_PATH_B, {
        maxSegmentLength: 12,
      }),
    []
  );

  const morphT = interpolate(
    Math.sin(localFrame * 0.045),
    [-1, 1],
    [0, 1],
    CLAMP_EXTRAPOLATION
  );
  const morphedCadPath = morphInterpolator(morphT);

  const scale = interpolate(
    entrySpring,
    [0, 1],
    [0.84, 1],
    CLAMP_EXTRAPOLATION
  );
  const translateY =
    interpolate(entryEased, [0, 1], [42, 0], CLAMP_EXTRAPOLATION) + floatY;

  // Barrido láser de escaneo analítico
  const scanY = interpolate(
    (localFrame * 5) % 240,
    [0, 120, 240],
    [-210, 210, -210],
    CLAMP_EXTRAPOLATION
  );

  const bookWidth = 340;
  const bookHeight = 500;
  const spineThickness = Math.min(62, Math.max(36, Math.round(pages / 6.5)));

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 350,
        top: y - 350,
        width: 700,
        height: 700,
        pointerEvents: 'none',
        opacity: entryEased,
        transform: `translate3d(${floatX}px, ${translateY}px, 0) scale(${scale})`,
      }}
    >
      {/* Anillo técnico CAD con morphing Flubber */}
      <svg
        width={700}
        height={700}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <g transform="translate(350, 350)">
          <circle
            cx={0}
            cy={0}
            r={305}
            fill="rgba(17, 17, 17, 0.55)"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={1.5}
          />
          <path
            d={morphedCadPath}
            fill="none"
            stroke={accentColor}
            strokeWidth={2.5}
            strokeDasharray="14 8"
            opacity={0.78}
          />
          <line
            x1={-330}
            y1={0}
            x2={-285}
            y2={0}
            stroke={secondaryColor}
            strokeWidth={2.5}
          />
          <line
            x1={285}
            y1={0}
            x2={330}
            y2={0}
            stroke={secondaryColor}
            strokeWidth={2.5}
          />
          <line
            x1={0}
            y1={-330}
            x2={0}
            y2={-285}
            stroke={secondaryColor}
            strokeWidth={2.5}
          />
          <line
            x1={0}
            y1={285}
            x2={0}
            y2={330}
            stroke={secondaryColor}
            strokeWidth={2.5}
          />
        </g>
      </svg>

      {/* Contenedor 2.5D del Libro Físico */}
      <div
        style={{
          position: 'absolute',
          left: (700 - bookWidth) / 2,
          top: (700 - bookHeight) / 2,
          width: bookWidth,
          height: bookHeight,
          transform: `perspective(1500px) rotateY(${-22 + tiltDelta}deg) rotateX(${10 - tiltDelta * 0.5}deg) rotateZ(${-3 + tiltDelta * 0.3}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Sombra de proyección sobre el plano técnico */}
        <div
          style={{
            position: 'absolute',
            left: 18,
            top: 28,
            width: bookWidth,
            height: bookHeight,
            borderRadius: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.68)',
            filter: 'blur(22px)',
          }}
        />

        {/* Bloque de páginas lateral derecho (grosor proporcional a `pages`) */}
        <div
          style={{
            position: 'absolute',
            right: -spineThickness + 6,
            top: 10,
            width: spineThickness,
            height: bookHeight - 20,
            background:
              'repeating-linear-gradient(90deg, #F8F7F4 0px, #F8F7F4 3px, #D6D3CD 3px, #D6D3CD 5px)',
            borderTopRightRadius: 6,
            borderBottomRightRadius: 6,
            border: '1.5px solid #A8A29E',
            transform: 'skewY(8deg)',
          }}
        />

        {/* Lomo izquierdo volumétrico */}
        <div
          style={{
            position: 'absolute',
            left: -26,
            top: 6,
            width: 28,
            height: bookHeight - 12,
            backgroundColor: '#1E1D1B',
            border: `2px solid ${accentColor}`,
            borderTopLeftRadius: 6,
            borderBottomLeftRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'skewY(-8deg)',
          }}
        >
          <span
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#F8F7F4',
              whiteSpace: 'nowrap',
            }}
          >
            {author.toUpperCase()} · {pages} PÁGS
          </span>
        </div>

        {/* Portada Frontal del Libro */}
        <div
          style={{
            position: 'relative',
            width: bookWidth,
            height: bookHeight,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#F8F7F4',
            border: `3px solid ${accentColor}`,
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.55)',
          }}
        >
          <Img
            src={staticFile(coverSrc)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Cinta superior de verificación bibliográfica */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '8px 14px',
              backgroundColor: 'rgba(17, 17, 17, 0.86)',
              borderBottom: `2px solid ${accentColor}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 16,
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            <span>GOODREADS ★ {rating}</span>
            <span style={{ color: accentColor }}>{ratingsCount} VOTOS</span>
          </div>
        </div>
      </div>

      {/* Haz láser de escaneo analítico sobre el libro */}
      <svg
        width={700}
        height={700}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <g transform="translate(350, 350)">
          <line
            x1={-230}
            y1={scanY}
            x2={230}
            y2={scanY}
            stroke={secondaryColor}
            strokeWidth={2.5}
            opacity={0.75}
          />
          <circle cx={-230} cy={scanY} r={4.5} fill={secondaryColor} />
          <circle cx={230} cy={scanY} r={4.5} fill={secondaryColor} />
        </g>
      </svg>

      {/* Etiqueta técnica inferior del marco CAD */}
      {cadTag && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 18px',
            borderRadius: 8,
            backgroundColor: 'rgba(17, 17, 17, 0.92)',
            border: `1.5px solid ${accentColor}`,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: accentColor,
            whiteSpace: 'nowrap',
          }}
        >
          {cadTag} · {bookTitle.toUpperCase()}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 2. EDITORIAL EXCERPT HIGHLIGHTER — Extracto de Libro con Subrayado Físico Rough.js
 *    (Cumple estrictamente la skill `article-highlights`: papel cálido #F8F7F4,
 *    marcador físico detrás del texto y encima del papel, barrido izq->der, cero glow)
 * ========================================================================== */
export interface EditorialExcerptHighlighterProps {
  bookTitle: string;
  author: string;
  excerpt: BookQuoteExcerpt;
  secondaryExcerpt?: BookQuoteExcerpt;
  enterFrame?: number;
  localFrame: number;
  x?: number;
  y?: number;
}

export const EditorialExcerptHighlighter: React.FC<
  EditorialExcerptHighlighterProps
> = ({
  bookTitle,
  author,
  excerpt,
  secondaryExcerpt,
  enterFrame = 0,
  localFrame,
  x = SAFE_ZONE.minSafeX,
  y = 370,
}) => {
  const { fps } = useVideoConfig();
  const cardWidth = SAFE_ZONE.maxSafeX - SAFE_ZONE.minSafeX; // 888px
  const cardHeight = 640;

  const relFrame = Math.max(0, localFrame - enterFrame);
  const entrance = spring({
    frame: relFrame,
    fps,
    config: SPRING_SNAPPY,
  });

  // Desenfoque óptico breve de entrada (Regla article-highlights: blur óptico inicial sin marcador visible)
  const opticalBlurPx = interpolate(
    relFrame,
    [0, 14],
    [4.5, 0],
    CLAMP_EXTRAPOLATION
  );

  // El marcador físico se traza en riguroso directo con las frases de Leo:
  // Línea 1 ("no te elevas al nivel de tus metas"): frames 97-160
  const highlightWipe1 = interpolate(
    relFrame,
    [97, 160],
    [0, 1],
    {
      ...CLAMP_EXTRAPOLATION,
      easing: MOTION_EASING.quartOut,
    }
  );

  // Línea 2 ("caes al nivel de tus sistemas"): frames 162-218
  const highlightWipe2 = interpolate(
    relFrame,
    [162, 218],
    [0, 1],
    {
      ...CLAMP_EXTRAPOLATION,
      easing: MOTION_EASING.quartOut,
    }
  );

  // Generación determinista de los trazos de marcador físico con Rough.js
  const roughMarkers = useMemo(() => {
    const gen = rough.generator();
    const borderDrawable = gen.rectangle(4, 4, cardWidth - 8, cardHeight - 8, {
      seed: 101,
      roughness: 0.9,
      stroke: '#262523',
      strokeWidth: 2.5,
    });
    // Franja de marcador amarillo ocre físico para la primera línea del pasaje
    const marker1 = gen.rectangle(48, 162, cardWidth - 96, 56, {
      seed: 202,
      roughness: 1.4,
      fill: 'rgba(245, 196, 66, 0.52)',
      fillStyle: 'solid',
      stroke: 'rgba(217, 155, 26, 0.45)',
      strokeWidth: 1.5,
    });
    // Segunda franja de marcador para la segunda línea de la cita
    const marker2 = gen.rectangle(48, 224, cardWidth - 150, 56, {
      seed: 303,
      roughness: 1.35,
      fill: 'rgba(245, 196, 66, 0.52)',
      fillStyle: 'solid',
      stroke: 'rgba(217, 155, 26, 0.45)',
      strokeWidth: 1.5,
    });
    // Subrayado coral a mano alzada bajo la segunda cita
    const underline3 = gen.line(52, 558, cardWidth - 84, 558, {
      seed: 404,
      roughness: 1.5,
      stroke: '#D94E34',
      strokeWidth: 4.5,
    });

    return {
      borderPaths: gen.toPaths(borderDrawable),
      marker1Paths: gen.toPaths(marker1),
      marker2Paths: gen.toPaths(marker2),
      underlinePaths: gen.toPaths(underline3),
    };
  }, [cardWidth, cardHeight]);

  const translateY = interpolate(
    entrance,
    [0, 1],
    [28, 0],
    CLAMP_EXTRAPOLATION
  );
  const scale = interpolate(
    entrance,
    [0, 1],
    [0.95, 1],
    CLAMP_EXTRAPOLATION
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: cardWidth,
        height: cardHeight,
        backgroundColor: PALETTE.surface,
        borderRadius: 10,
        boxShadow: '0 18px 38px rgba(0, 0, 0, 0.28)',
        transform: `translateY(${translateY}px) scale(${scale})`,
        filter:
          opticalBlurPx > 0.1 ? `blur(${opticalBlurPx.toFixed(2)}px)` : 'none',
        overflow: 'hidden',
      }}
    >
      {/* CAPA 1 (Detrás del texto, sobre el papel): Trazos Rough.js de marcador físico con clipPath de izquierda a derecha */}
      <svg
        width={cardWidth}
        height={cardHeight}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <defs>
          <clipPath id="marker-wipe-1">
            <rect
              x={0}
              y={0}
              width={cardWidth * highlightWipe1}
              height={cardHeight}
            />
          </clipPath>
          <clipPath id="marker-wipe-2">
            <rect
              x={0}
              y={0}
              width={cardWidth * highlightWipe2}
              height={cardHeight}
            />
          </clipPath>
        </defs>

        {/* Borde editorial Rough.js */}
        {roughMarkers.borderPaths.map((p, i) => (
          <path
            key={`b-${i}`}
            d={p.d}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            fill="none"
          />
        ))}

        {/* Marcador físico línea 1 */}
        <g clipPath="url(#marker-wipe-1)">
          {roughMarkers.marker1Paths.map((p, i) => (
            <path
              key={`m1-${i}`}
              d={p.d}
              stroke={p.stroke}
              strokeWidth={p.strokeWidth}
              fill={p.fill || 'rgba(245, 196, 66, 0.52)'}
            />
          ))}
        </g>

        {/* Marcador físico línea 2 + subrayado */}
        <g clipPath="url(#marker-wipe-2)">
          {roughMarkers.marker2Paths.map((p, i) => (
            <path
              key={`m2-${i}`}
              d={p.d}
              stroke={p.stroke}
              strokeWidth={p.strokeWidth}
              fill={p.fill || 'rgba(245, 196, 66, 0.52)'}
            />
          ))}
          {roughMarkers.underlinePaths.map((p, i) => (
            <path
              key={`u-${i}`}
              d={p.d}
              stroke={p.stroke}
              strokeWidth={p.strokeWidth}
              fill="none"
            />
          ))}
        </g>
      </svg>

      {/* CAPA 2 (Encima del marcador): Tipografía Editorial en Tinta #141413 */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '40px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Cabecera de capítulo bibliográfico */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #262523',
              paddingBottom: 14,
              marginBottom: 28,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 21,
              fontWeight: 700,
              color: PALETTE.inkMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <span>
              {bookTitle} · {author}
            </span>
            <span style={{ color: PALETTE.accentPrimary }}>PÁG. 41</span>
          </div>

          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: PALETTE.accentSecondary,
              marginBottom: 18,
              letterSpacing: '0.04em',
            }}
          >
            {excerpt.chapter.toUpperCase()}
          </div>

          {/* Cita principal en Serif Editorial sobre las bandas de marcador */}
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.42,
              color: PALETTE.ink,
              letterSpacing: '-0.01em',
            }}
          >
            «{excerpt.text}»
          </div>
        </div>

        {/* Pasaje secundario al pie de la hoja */}
        {secondaryExcerpt && (
          <div
            style={{
              borderTop: '1.5px dashed #C7C2B8',
              paddingTop: 22,
              marginTop: 18,
            }}
          >
            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                fontSize: 31,
                lineHeight: 1.32,
                color: '#262523',
              }}
            >
              “{secondaryExcerpt.text}”
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 19,
                fontWeight: 600,
                color: PALETTE.inkMuted,
                marginTop: 14,
              }}
            >
              FUENTE VERIFICADA · {secondaryExcerpt.chapter.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. HABIT LOOP DIAGRAM — Bucle Neuronal de 4 Etapas (Señal -> Anhelo -> Respuesta -> Recompensa)
 * ========================================================================== */
export interface HabitLoopDiagramProps {
  localFrame: number;
  enterFrame?: number;
  y?: number;
}

export const HabitLoopDiagram: React.FC<HabitLoopDiagramProps> = ({
  localFrame,
  enterFrame = 45,
  y = 1070,
}) => {
  const { fps } = useVideoConfig();
  const stages = [
    { step: '01', name: 'SEÑAL', desc: 'Disparador visual', color: '#F59E0B' },
    { step: '02', name: 'ANHELO', desc: 'Pico de dopamina', color: '#38BDF8' },
    { step: '03', name: 'RESPUESTA', desc: 'Acción < 2 min', color: '#22C55E' },
    {
      step: '04',
      name: 'RECOMPENSA',
      desc: 'Cierra el circuito',
      color: '#D94E34',
    },
  ];

  // Determinar etapa activa sincronizada exactamente con la dicción de Leo:
  // FASE 01 (Señal): frames 296-312 | FASE 02 (Anhelo): frames 312-330
  // FASE 03 (Respuesta): frames 330-354 | FASE 04 (Recompensa): frames 354+
  const activeStageIdx =
    localFrame < 312
      ? 0
      : localFrame < 330
        ? 1
        : localFrame < 354
          ? 2
          : 3;

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_ZONE.minSafeX,
        right: SAFE_ZONE.horizontalPaddingPx,
        top: y,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
      }}
    >
      {stages.map((st, idx) => {
        const delay =
          enterFrame + idx * MOTION_DESIGN_27_RULES.staggerDelayFrames * 2;
        const p = spring({
          frame: Math.max(0, localFrame - delay),
          fps,
          config: SPRING_SNAPPY,
        });
        const isCurrent = idx === activeStageIdx && localFrame >= 290;

        return (
          <div
            key={st.step}
            style={{
              backgroundColor: '#161618',
              border: `2.5px solid ${isCurrent ? st.color : '#2C2C32'}`,
              borderRadius: 14,
              padding: '20px 24px',
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [22, 0], CLAMP_EXTRAPOLATION)}px)`,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: st.color,
              }}
            >
              <span>FASE {st.step}</span>
              <span>● ACTIVA</span>
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 32,
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              <VectorSelectionBox
                active={isCurrent}
                color={st.color}
                showRotationStem={false}
                padding="1px 8px"
              >
                {st.name}
              </VectorSelectionBox>
            </div>
            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                fontSize: 23,
                color: '#A1A1AA',
              }}
            >
              {st.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================================
 * 4. ACTIONABLE LAWS DRAWER — Las 4 Leyes del Cambio de Conducta (Escena 4)
 * ========================================================================== */
export interface ActionableLawsDrawerProps {
  laws: BookActionableLaw[];
  localFrame: number;
  enterFrame?: number;
  y?: number;
}

export const ActionableLawsDrawer: React.FC<ActionableLawsDrawerProps> = ({
  laws,
  localFrame,
  enterFrame = 10,
  y = 430,
}) => {
  const { fps } = useVideoConfig();

  // Resaltar secuencialmente cada ley en sincronía estricta con la locución de Leo:
  // Ley 01 (hazlo obvio): frames 120-216
  // Ley 02 (hazlo atractivo): frames 221-274
  // Ley 03 (regla de los dos minutos): frames 279-373
  // Ley 04 (hazlo satisfactorio): frames 377+
  const activeLawIdx =
    localFrame < 221
      ? 0
      : localFrame < 279
        ? 1
        : localFrame < 377
          ? 2
          : 3;

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_ZONE.minSafeX,
        right: SAFE_ZONE.horizontalPaddingPx,
        top: y,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      {laws.map((law, idx) => {
        const staggerFrame =
          enterFrame + idx * MOTION_DESIGN_27_RULES.staggerDelayFrames * 3;
        const progress = spring({
          frame: Math.max(0, localFrame - staggerFrame),
          fps,
          config: SPRING_SNAPPY,
        });

        const isSelected = idx === activeLawIdx;
        const barWidthPct = interpolate(
          progress,
          [0, 1],
          [0, law.impactPct],
          CLAMP_EXTRAPOLATION
        );

        return (
          <div
            key={law.index}
            style={{
              backgroundColor: isSelected
                ? 'rgba(15, 53, 94, 0.94)'
                : 'rgba(13, 37, 66, 0.86)',
              border: `2.5px solid ${isSelected ? '#FBBF24' : 'rgba(147, 197, 253, 0.28)'}`,
              borderRadius: 16,
              padding: '22px 28px',
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [-36, 0], CLAMP_EXTRAPOLATION)}px)`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    backgroundColor: isSelected ? '#FBBF24' : '#1E40AF',
                    color: isSelected ? '#111111' : '#FFFFFF',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 20,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {law.index}
                </span>
                <VectorSelectionBox
                  active={isSelected}
                  color="#FBBF24"
                  showRotationStem={false}
                  padding="2px 8px"
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {law.title}
                  </span>
                </VectorSelectionBox>
              </div>

              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 25,
                  fontWeight: 700,
                  color: isSelected ? '#FBBF24' : '#93C5FD',
                  whiteSpace: 'nowrap',
                }}
              >
                {Math.round(barWidthPct)}% EFICACIA
              </span>
            </div>

            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 25,
                lineHeight: 1.3,
                color: '#E2E8F0',
                marginBottom: 14,
              }}
            >
              {law.rule}
            </div>

            {/* Barra de telemetría de retención */}
            <div
              style={{
                width: '100%',
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${barWidthPct}%`,
                  height: '100%',
                  backgroundColor: isSelected ? '#FBBF24' : '#38BDF8',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================================
 * 5. BOOK VERDICT SCORECARD — Ficha de Identidad y Veredicto Final (Escena 5)
 * ========================================================================== */
export interface BookVerdictScorecardProps {
  identityQuote: string;
  rating: number;
  ratingsCount: string;
  readingTimeHours: number;
  pages: number;
  verdictBadge: string;
  localFrame: number;
  enterFrame?: number;
  y?: number;
}

export const BookVerdictScorecard: React.FC<BookVerdictScorecardProps> = ({
  identityQuote,
  rating,
  ratingsCount,
  readingTimeHours,
  pages,
  verdictBadge,
  localFrame,
  enterFrame = 30,
  y = 1090,
}) => {
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, localFrame - enterFrame),
    fps,
    config: SPRING_SNAPPY,
  });

  const animatedRating = interpolate(
    progress,
    [0, 1],
    [0, rating],
    CLAMP_EXTRAPOLATION
  ).toFixed(2);

  const ringPath = 'M 12 0 L 876 0 L 876 410 L 12 410 Z';
  const evolvedBorder = evolvePath(
    interpolate(progress, [0, 1], [0.05, 1], CLAMP_EXTRAPOLATION),
    ringPath
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_ZONE.minSafeX,
        right: SAFE_ZONE.horizontalPaddingPx,
        top: y,
        height: 410,
        backgroundColor: '#131C24',
        borderRadius: 16,
        padding: '30px 36px',
        boxSizing: 'border-box',
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [28, 0], CLAMP_EXTRAPOLATION)}px)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <svg
        width={888}
        height={410}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <path
          d={ringPath}
          fill="none"
          stroke="#22C55E"
          strokeWidth={3}
          strokeDasharray={evolvedBorder.strokeDasharray}
          strokeDashoffset={evolvedBorder.strokeDashoffset}
        />
      </svg>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <VectorSelectionBox
          active={true}
          color="#22C55E"
          showRotationStem={false}
          padding="4px 12px"
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: '#4ADE80',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            {verdictBadge}
          </span>
        </VectorSelectionBox>

        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 20,
            color: '#94A3B8',
            whiteSpace: 'nowrap',
          }}
        >
          IDENTIDAD CONDUCTUAL
        </span>
      </div>

      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: 'italic',
          fontSize: 34,
          lineHeight: 1.32,
          color: '#F8FAFC',
        }}
      >
        «{identityQuote}»
      </div>

      {/* Telemetría inferior en 3 columnas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 18,
          borderTop: '1.5px solid rgba(148, 163, 184, 0.22)',
          paddingTop: 18,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <div>
          <div style={{ fontSize: 19, color: '#94A3B8' }}>GOODREADS SCORE</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#FBBF24' }}>
            ★ {animatedRating} / 5.0
          </div>
        </div>
        <div>
          <div style={{ fontSize: 19, color: '#94A3B8' }}>COMUNIDAD LECTORA</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#38BDF8' }}>
            {ratingsCount} RESEÑAS
          </div>
        </div>
        <div>
          <div style={{ fontSize: 19, color: '#94A3B8' }}>INVERSIÓN LECTURA</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#4ADE80' }}>
            {readingTimeHours}h ({pages}p)
          </div>
        </div>
      </div>
    </div>
  );
};


/* ============================================================================
 * 6. CONCEPT HYPOTHESIS SCOREBOARD — Marcador de Tesis vs Mito ([METAS̸] vs [SISTEMAS])
 * ========================================================================== */
export interface ConceptPillOption {
  label: string;
  status: 'neutral' | 'discarded' | 'winner';
}

export interface ConceptHypothesisScoreboardProps {
  options: ConceptPillOption[];
  top?: number;
}

export const ConceptHypothesisScoreboard: React.FC<
  ConceptHypothesisScoreboardProps
> = ({ options, top = 355 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        pointerEvents: 'none',
        zIndex: 70,
      }}
    >
      {options.map((opt, idx) => {
        const isWinner = opt.status === 'winner';
        const isDiscarded = opt.status === 'discarded';
        return (
          <div
            key={idx}
            style={{
              position: 'relative',
              minWidth: 220,
              height: 86,
              padding: '0 28px',
              borderRadius: 14,
              backgroundColor: isWinner
                ? 'rgba(34, 197, 94, 0.22)'
                : '#1B2630',
              border: `2.5px solid ${
                isWinner ? '#22C55E' : isDiscarded ? '#475569' : '#334155'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: isWinner
                ? '#4ADE80'
                : isDiscarded
                  ? '#94A3B8'
                  : '#F8FAFC',
            }}
          >
            {opt.label}

            {isDiscarded && (
              <svg
                width="100%"
                height={86}
                viewBox="0 0 220 86"
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                }}
              >
                <line
                  x1={18}
                  y1={72}
                  x2={202}
                  y2={14}
                  stroke="#EC4899"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
