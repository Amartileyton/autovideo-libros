import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  LeoAvatar,
  LeoHostBadge,
  computeContinuousSpeechEnvelope,
  type EmotionKeyframe,
} from '../components/character';
import infoJson from '../../public/audio/info.json';

const SHOWCASE_EMOTION_SCHEDULE: EmotionKeyframe[] = [
  { startSec: 0.0, emotion: 'curious' },
  { startSec: 3.0, emotion: 'explaining' },
  { startSec: 6.0, emotion: 'thinking' },
  { startSec: 8.5, emotion: 'happy' },
];

/**
 * LeoShowcase — Composición Oficial del Motor de Animación de Personajes (`d3-delaunay`)
 *
 * Demuestra:
 * 1. Busto Hero (520px) hablando en tiempo real con:
 *    - Cero bordes en estático (`leo-master.png`).
 *    - Pelo y cráneo 100% firmes (fila `forehead_buffer` que aísla el pelo de las cejas).
 *    - Cejas de espesor rígido (0% ensanchamiento).
 *    - Interpolación emocional C1 continua (`SHOWCASE_EMOTION_SCHEDULE`) sin parpadeos en el segundo 8.
 * 2. 4 estados de deformación elástica por código: Reposo, Vocal 'A', Vocal 'O' + Giro 2.5D y Malla d3-delaunay (153 Nodos).
 */
export const LeoShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scene1 = infoJson.scenes[0];
  const wordTimestamps = scene1?.wordTimestamps ?? [];

  const speechInfo = useMemo(
    () => computeContinuousSpeechEnvelope(frame, wordTimestamps),
    [wordTimestamps, frame]
  );

  const isSpeaking = speechInfo.isSpeaking;
  const activeWord = speechInfo.activeWord;

  const currentEmotion = useMemo(() => {
    const sec = frame / fps;
    if (sec < 3.0) return 'curious';
    if (sec < 6.0) return 'explaining';
    if (sec < 8.5) return 'thinking';
    return 'happy';
  }, [frame, fps]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F6F3EC',
        padding: '56px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        color: '#181615',
      }}
    >
      {/* Audio real de locución de ElevenLabs */}
      <Audio src={staticFile('audio/scene-1.mp3')} />

      {/* Cabecera */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#C84127',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          MOTOR DE ANIMACIÓN DE PERSONAJES • D3-DELAUNAY (153 NODOS)
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginTop: 6,
          }}
        >
          Leo • Piel Continua, Cejas Rígidas y Pelo Firme
        </div>
      </div>

      {/* Tarjeta Central Hero con Leo hablando en vivo */}
      <div
        style={{
          backgroundColor: '#FFFDF9',
          borderRadius: 34,
          padding: '38px 44px',
          boxShadow: '0 18px 42px rgba(24, 22, 21, 0.08)',
          border: '2px solid rgba(24, 22, 21, 0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <LeoAvatar
          frame={frame}
          isSpeaking={isSpeaking}
          wordTimestamps={wordTimestamps}
          emotion={currentEmotion}
          emotionSchedule={SHOWCASE_EMOTION_SCHEDULE}
          size={520}
          variant="badge"
        />

        {/* Telemetría en vivo de la animación por código */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            backgroundColor: isSpeaking ? '#C84127' : '#262320',
            color: '#FFFDF9',
            padding: '12px 30px',
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          <span>
            {isSpeaking && activeWord
              ? `🎙️ PRONUNCIANDO: "${activeWord.word.toUpperCase()}"`
              : '⏸️ PAUSA RESPIRATORIA (PIEL CONTINUA SIN COSTURAS)'}
          </span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span style={{ color: '#FDE68A' }}>
            EMOCIÓN: {currentEmotion.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Fila de 4 Estados de la Malla Continua Delaunay */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        {[
          {
            label: '1. Reposo (0 Bordes)',
            open: 0,
            spread: 0,
            blink: 0,
            turnX: 0,
            wire: false,
            emo: 'neutral' as const,
          },
          {
            label: "2. Vocal Abierta 'A'",
            open: 0.92,
            spread: 0.55,
            blink: 0,
            turnX: 0,
            wire: false,
            emo: 'happy' as const,
          },
          {
            label: "3. Vocal 'O' + Giro 2.5D",
            open: 0.68,
            spread: -0.85,
            blink: 0,
            turnX: 4.5,
            wire: false,
            emo: 'explaining' as const,
          },
          {
            label: '4. Malla d3-delaunay',
            open: 0.85,
            spread: 0.35,
            blink: 0,
            turnX: -3.2,
            wire: true,
            emo: 'curious' as const,
          },
        ].map((st) => (
          <div
            key={st.label}
            style={{
              flex: 1,
              backgroundColor: '#FFFDF9',
              borderRadius: 24,
              padding: '18px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              border: '1.5px solid rgba(24, 22, 21, 0.08)',
            }}
          >
            <LeoAvatar
              frame={frame}
              size={190}
              emotion={st.emo}
              forcedOpen={st.open}
              forcedLipSpread={st.spread}
              forcedBlink={st.blink}
              forcedTurnX={st.turnX}
              showWireframe={st.wire}
            />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#262320', textAlign: 'center' }}>
              {st.label}
            </div>
          </div>
        ))}
      </div>

      {/* Fila Inferior: Badge de Cabecera + Busto Libre */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: '#EFECE4',
          borderRadius: 26,
          padding: '20px 36px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#57534E' }}>
            COMPONENTE &lt;LeoHostBadge /&gt;
          </span>
          <LeoHostBadge
            frame={frame}
            isSpeaking={isSpeaking}
            emotion={currentEmotion}
            emotionSchedule={SHOWCASE_EMOTION_SCHEDULE}
            size={105}
            label="LEO"
            sublabel="@en1minuto.es"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#57534E' }}>
            VARIANTE BUSTO LIBRE (CUTOUT)
          </span>
          <LeoAvatar
            frame={frame}
            isSpeaking={isSpeaking}
            wordTimestamps={wordTimestamps}
            emotion={currentEmotion}
            emotionSchedule={SHOWCASE_EMOTION_SCHEDULE}
            size={155}
            variant="cutout"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
