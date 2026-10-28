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
        visualData?.hookTriggerKeyword ?? ['felicidad', 'caos', 'perdidos'],
        120,
        180
      ),
    [wordTimestamps, visualData?.hookTriggerKeyword]
  );

  const mythWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['caos', 'esperando', 'felicidad', 'mito'],
        175,
        215
      ),
    [wordTimestamps]
  );

  const strikeWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['pasiva', 'sino'],
        245,
        265
      ),
    [wordTimestamps]
  );

  const realityWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        ['asumiendo', 'responsabilidad', 'voluntaria'],
        268,
        310
      ),
    [wordTimestamps]
  );

  const battleWindow = useMemo(
    () =>
      findKeywordFrameWindow(
        wordTimestamps,
        visualData?.battleTriggerKeyword ?? ['pasiva', 'responsabilidad', 'voluntaria'],
        240,
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

  const statNumeric = visualData?.hookNumericValue ?? 100;
  const statSuffix = visualData?.hookUnit ?? '%';
  const statLabel =
    visualData?.hookLabel ?? 'De tu bienestar depende de cómo gastas, no de cuánto acumulas';
  const statSource =
    visualData?.hookSource ?? 'El Arte de Gastar Dinero · Morgan Housel';

  return (
    <div
      style={{
        position: 'absolute',
        left: canvasOffsetX,
        top: canvasOffsetY,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Ficha Estadística en Amarillo Pálido con LiveCounter sincronizado al audio */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          left: 54,
          right: 54,
          backgroundColor: '#FEF9C3',
          border: '2.5px solid #141413',
          borderLeft: '8px solid #D94E34',
          borderRadius: 20,
          padding: '24px 32px',
          boxShadow: '0 12px 36px rgba(20, 20, 19, 0.08)',
          opacity: statEntrance,
          transform: `scale(${interpolate(statEntrance, [0, 1], [0.94, 1], CLAMP_EXTRAPOLATION)})`,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <div style={{ minWidth: 160 }}>
          <LiveCounter
            from={0}
            to={statNumeric}
            startFrame={counterWindow.startFrame}
            durationFrames={35}
            suffix={statSuffix}
            fontSize={72}
            color="#D94E34"
          />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 27,
              fontWeight: 900,
              color: '#141413',
              lineHeight: 1.25,
            }}
          >
            {statLabel}
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: '#575550',
              marginTop: 5,
            }}
          >
            {statSource}
          </div>
        </div>
      </div>

      {/* 2. Portada 2.5D del Libro + 3 Parches Dinámicos Goodreads */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 54,
          right: 54,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: bookEntrance,
          transform: `translateY(${(1 - bookEntrance) * 35}px) perspective(1200px) rotateY(${bookTilt}deg)`,
        }}
      >
        <BookCover
          bookMetadata={bookMetadata}
          width={350}
          height={510}
          borderRadius={18}
          variant="hero"
        />

        {/* 3 Parches Dinámicos que se estampan progresivamente con inclinación y rebote */}
        <GoodreadsBadgeCluster
          author={bookMetadata?.author ?? 'Morgan Housel'}
          rating={bookMetadata?.rating ?? 4.38}
          ratingsCount={bookMetadata?.ratingsCount ?? '1.94M'}
          startFrame={14}
          currentFrame={localFrame}
        />
      </div>

      {/* 3. Bloque Inferior Dinámico con gran presencia visual (top: 960 a 1480, left: 54, right: 54) */}
      <div
        style={{
          position: 'absolute',
          top: 960,
          left: 54,
          right: 54,
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
                fontSize: 30,
                fontWeight: 900,
                color: '#141413',
                lineHeight: 1.35,
                textAlign: 'center',
              }}
            >
              {visualData?.provocativeQuestion ? (
                visualData.provocativeHighlight &&
                visualData.provocativeQuestion.includes(visualData.provocativeHighlight) ? (
                  <>
                    {visualData.provocativeQuestion.split(visualData.provocativeHighlight)[0]}
                    <span
                      style={{
                        backgroundColor: 'rgba(217, 78, 52, 0.16)',
                        borderBottom: '4px solid #D94E34',
                        padding: '2px 8px',
                        borderRadius: 6,
                        color: '#D94E34',
                      }}
                    >
                      {visualData.provocativeHighlight}
                    </span>
                    {visualData.provocativeQuestion.split(visualData.provocativeHighlight)[1]}
                  </>
                ) : (
                  visualData.provocativeQuestion
                )
              ) : (
                <>
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
                </>
              )}
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
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#141413',
                  }}
                >
                  {visualData?.realityLabel ?? 'Decisiones Emocionales'}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 18,
                    color: '#575550',
                    marginTop: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {visualData?.realitySubtitle ??
                    'El éxito depende de tu comportamiento, paciencia y autocontrol.'}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#141413',
                  color: '#FEF9C3',
                  padding: '14px 22px',
                  borderRadius: 14,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 26,
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                }}
              >
                {statNumeric}
                {statSuffix}
              </div>
            </div>
          </KineticCard>
        ) : (
          <ComparisonBattle
            titleA={visualData?.mythLabel ?? 'Mito: Fórmulas Matemáticas'}
            subtitleA={
              visualData?.mythSubtitle ??
              'Creer que la riqueza depende de hojas de cálculo y coeficiente intelectual'
            }
            tagA={visualData?.mythTag ?? 'ERROR TRADICIONAL'}
            titleB={visualData?.realityLabel ?? 'Realidad: Habilidad Blanda'}
            subtitleB={
              visualData?.realitySubtitle ??
              'El éxito depende de tu comportamiento, paciencia y autocontrol'
            }
            tagB={
              visualData?.realityTag ??
              `PSICOLOGÍA REAL (${statNumeric}${statSuffix})`
            }
            metricB={{ value: statNumeric, suffix: `${statSuffix} IMPACTO` }}
            enterFrameA={mythWindow.startFrame}
            enterFrameB={realityWindow.startFrame}
            battleFrame={strikeWindow.startFrame}
            currentFrame={localFrame}
            accentColor="#D94E34"
          />
        )}
      </div>
    </div>
  );
};
