import React from 'react';
import { interpolate, spring, useVideoConfig } from 'remotion';
import { CLAMP_EXTRAPOLATION, SPRING_SNAPPY } from '../../theme/motion';
import { LeoAvatar, type LeoEmotion, type LeoLookAt } from './LeoAvatar';
import type { EmotionKeyframe } from '../../engine/characterAnimationEngine';

export interface LeoHostBadgeProps {
  frame: number;
  enterFrame?: number;
  isSpeaking?: boolean;
  emotion?: LeoEmotion;
  emotionSchedule?: EmotionKeyframe[];
  lookAt?: LeoLookAt;
  /** Título o etiqueta editorial que acompaña a Leo (p. ej. "@en1minuto.es" o "LEO • RESÚMENES") */
  label?: string;
  /** Subtítulo breve (p. ej. "1 LIBRO AL DÍA") */
  sublabel?: string;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * LeoHostBadge — Badge editorial del anfitrión Leo para situar en cabecera o esquina
 *
 * Combina el busto animado de Leo con una pastilla de identidad de marca que da rostro
 * y calidez humana al canal sin invadir la zona central de los gráficos.
 */
export const LeoHostBadge: React.FC<LeoHostBadgeProps> = ({
  frame,
  enterFrame = 0,
  isSpeaking = false,
  emotion = 'explaining',
  emotionSchedule,
  lookAt = 'center',
  label = 'LEO',
  sublabel = '@en1minuto.es',
  size = 110,
  style,
}) => {
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const p = spring({
    frame: Math.max(0, local),
    fps,
    config: SPRING_SNAPPY,
  });

  const scale = interpolate(p, [0, 1], [0.8, 1], CLAMP_EXTRAPOLATION);
  const opacity = interpolate(p, [0, 1], [0, 1], CLAMP_EXTRAPOLATION);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '6px 18px 6px 6px',
        backgroundColor: '#FFFBEB',
        border: '3px solid #141413',
        borderRadius: 999,
        boxShadow: '0 8px 20px rgba(20, 20, 19, 0.10)',
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        ...style,
      }}
    >
      {/* Avatar de Leo */}
      <LeoAvatar
        frame={frame}
        isSpeaking={isSpeaking}
        emotion={emotion}
        emotionSchedule={emotionSchedule}
        lookAt={lookAt}
        size={size}
        variant="badge"
      />

      {/* Identidad textual */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: '#141413',
            lineHeight: 1.1,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{label}</span>
          {isSpeaking && (
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#D94E34',
                opacity: 0.55 + 0.45 * Math.sin((frame / fps) * 8),
              }}
            />
          )}
        </div>
        {sublabel && (
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: '#D94E34',
              lineHeight: 1.1,
              marginTop: 2,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};
