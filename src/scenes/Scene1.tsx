import React, { useMemo } from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {
  BookMetadata,
  BookVisualData,
  SceneLayoutPreset,
  WordTimestamp,
} from '../data/schema';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../theme/motion';
import {
  BookCover,
  ComparisonBattle,
  GoodreadsBadgeCluster,
  KineticCard,
  LiveCounter,
} from '../components/kinetic';
import { findKeywordFrameWindow } from '../utils/wordTimingBinder';

export interface Scene1Props {
  headline?: string;
  metricValue?: number;
  metricUnit?: string;
  metricLabel?: string;
  canvasOffsetX?: number;
  canvasOffsetY?: number;
  enterFrame?: number;
  bookMetadata?: BookMetadata;
  visualData?: BookVisualData;
  layoutPreset?: SceneLayoutPreset;
  wordTimestamps?: WordTimestamp[];
}

/**
 * Scene 1 — El Gancho + Portada 2.5D + Píldoras Diferenciadas Goodreads (Motor Híbrido Inteligente)
 * Soporta los 3 presets del cuestionario interactivo:
 * - HOOK_COVER_BATTLE (Default): Portada 2.5D + GoodreadsBadgeCluster + LiveCounter + ComparisonBattle
 * - HOOK_COVER_STAT: Portada 2.5D + GoodreadsBadgeCluster + Tarjeta Estadística Ampliada
 * - HOOK_COVER_QUESTION: Portada 2.5D + GoodreadsBadgeCluster + Pregunta Provocadora Subrayada Editorial
 */
export const Scene1: React.FC<Scene1Props> = ({
  canvasOffsetX = 0,
  canvasOffsetY = 0,
  enterFrame = 0,
  bookMetadata,
  visualData,
  layoutPreset = 'HOOK_COVER_BATTLE',
  wordTimestamps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - enterFrame);

  // Auto-binding semántico desde public/audio/info.json
  const counterWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        visualData?.hookTriggerKeyword ?? ['cuarenta', 'porcentaje', 'estudio'],
        160,
        198
      ),
    [wordTimestamps, visualData?.hookTriggerKeyword]
  );

  const battleWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        visualData?.battleTriggerKeyword ?? ['elecciones', 'automaticos'],
        220,
        295,
        counterWindow.startFrame + 15
      ),
    [wordTimestamps, visualData?.battleTriggerKeyword, counterWindow.startFrame]
  );

  // 1. Ficha estadística del gancho (frame 20)
  const statEntrance = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: SPRING_SNAPPY,
  });

  // 2. Portada 2.5D del libro (frame 55)
  const bookEntrance = spring({
    frame: Math.max(0, localFrame - 55),
    fps,
    config: SPRING_SNAPPY,
  });

  // Inclinación 2.5D sutil del libro
  const bookTilt = interpolate(
    localFrame,
    [55, 160, 320],
    [-4, 3, 0],
    CLAMP_EXTRAPOLATION
  );

  const statNumeric = visualData?.hookNumericValue ?? 40;
  const statSuffix = visualData?.hookUnit ?? '%';
  const statLabel =
    visualData?.hookLabel ?? 'De tus acciones son hábitos automáticos';
  const statSource =
    visualData?.hookSource ?? 'Estudio de la Universidad de Duke';

  return (
    <div
      style={{
        position: 'absolute',
        left: canvasOffsetX,
        top: canvasOffsetY,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
        padding: '0 96px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Ficha Estadística en Amarillo Pálido con LiveCounter sincronizado al audio */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 96,
          right: 96,
          backgroundColor: '#FEF9C3',
          border: '2px solid #141413',
          borderLeft: '6px solid #D94E34',
          borderRadius: 16,
          padding: '20px 28px',
          boxShadow: '0 10px 30px rgba(20, 20, 19, 0.06)',
          opacity: statEntrance,
          transform: `scale(${interpolate(statEntrance, [0, 1], [0.94, 1], CLAMP_EXTRAPOLATION)})`,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={{ minWidth: 140 }}>
          <LiveCounter
            from={0}
            to={statNumeric}
            startFrame={counterWindow.startFrame}
            durationFrames={35}
            suffix={statSuffix}
            fontSize={52}
            color="#D94E34"
          />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: '#141413',
            }}
          >
            {statLabel}
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: '#575550',
              marginTop: 3,
            }}
          >
            {statSource}
          </div>
        </div>
      </div>

      {/* 2. Portada 2.5D del Libro + 3 Píldoras/Cajas Diferenciadas con Logo Oficial de Goodreads */}
      <div
        style={{
          position: 'absolute',
          top: 290,
          left: 96,
          right: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: bookEntrance,
          transform: `translateY(${(1 - bookEntrance) * 35}px) perspective(1200px) rotateY(${bookTilt}deg)`,
        }}
      >
        <BookCover
          bookMetadata={bookMetadata}
          width={340}
          height={506}
          borderRadius={16}
          variant="hero"
        />

        {/* REGLA INQUEBRANTABLE #5: 3 Píldoras/Cajas diferenciadas con Logo Oficial de Goodreads */}
        <GoodreadsBadgeCluster
          author={bookMetadata?.author ?? 'Charles Duhigg'}
          rating={bookMetadata?.rating ?? 4.13}
          ratingsCount={bookMetadata?.ratingsCount ?? '585K'}
          startFrame={65}
          currentFrame={localFrame}
        />
      </div>

      {/* 3. Bloque Inferior Dinámico gobernado por layoutPreset (Motor Híbrido Inteligente) */}
      <div
        style={{
          position: 'absolute',
          top: 925,
          left: 96,
          right: 96,
        }}
      >
        {layoutPreset === 'HOOK_COVER_QUESTION' ? (
          <KineticCard
            enterFrame={battleWindow.startFrame}
            accentBorderColor="#141413"
            badgeColor="#D94E34"
            padding="28px 32px"
          >
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 28,
                fontWeight: 800,
                color: '#141413',
                lineHeight: 1.35,
                textAlign: 'center',
              }}
            >
              ¿Tomas decisiones conscientes o vives en{' '}
              <span
                style={{
                  backgroundColor: 'rgba(217, 78, 52, 0.16)',
                  borderBottom: '3px solid #D94E34',
                  padding: '2px 8px',
                  borderRadius: 4,
                  color: '#D94E34',
                }}
              >
                piloto automático
              </span>{' '}
              el {statNumeric}% del día?
            </div>
          </KineticCard>
        ) : layoutPreset === 'HOOK_COVER_STAT' ? (
          <KineticCard
            enterFrame={battleWindow.startFrame}
            accentBorderColor="#141413"
            badgeColor="#D94E34"
            padding="26px 30px"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 23,
                    fontWeight: 800,
                    color: '#141413',
                  }}
                >
                  {visualData?.realityLabel ?? 'Ganglios Basales en Control'}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 15,
                    color: '#575550',
                    marginTop: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {visualData?.realitySubtitle ??
                    'Tu cerebro archiva secuencias completas para ahorrar esfuerzo mental.'}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#141413',
                  color: '#FEF9C3',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 22,
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                }}
              >
                {statNumeric}
                {statSuffix} HÁBITOS
              </div>
            </div>
          </KineticCard>
        ) : (
          <ComparisonBattle
            titleA={visualData?.mythLabel ?? 'Elección Consciente'}
            subtitleA={
              visualData?.mythSubtitle ??
              'Creemos que decidimos cada acción con la mente'
            }
            tagA={visualData?.mythTag ?? 'ILUSIÓN DE CONTROL'}
            titleB={visualData?.realityLabel ?? 'Piloto Automático'}
            subtitleB={
              visualData?.realitySubtitle ??
              'Los ganglios basales ejecutan la conducta sin pensar'
            }
            tagB={
              visualData?.realityTag ??
              `REALIDAD NEUROLÓGICA (${statNumeric}${statSuffix})`
            }
            metricB={{ value: statNumeric, suffix: `${statSuffix} DÍA` }}
            enterFrameA={battleWindow.startFrame}
            enterFrameB={battleWindow.startFrame + 32}
            battleFrame={battleWindow.startFrame + 62}
            accentColor="#D94E34"
          />
        )}
      </div>
    </div>
  );
};
