/**
 * src/components/TechIcon.tsx
 * Selector e iconos vectoriales técnicos 100% offline,
 * adaptados a la paleta editorial Zero-Neon de nuestro estudio.
 */

import React from 'react';
import { PALETTE } from '../theme/motion';

export type TechIconType =
  | 'workflow'
  | 'ai'
  | 'code'
  | 'terminal'
  | 'data'
  | 'cloud'
  | 'check'
  | 'alert'
  | 'rocket'
  | 'filter'
  | 'bot'
  | 'api';

export function resolveIconType(text: string, index: number): TechIconType {
  const lower = text.toLowerCase();
  if (/python|script|c[oó]digo|json|función|typescript|js/.test(lower))
    return 'code';
  if (/terminal|cli|comando|pip|npm|docker|bash|consola/.test(lower))
    return 'terminal';
  if (/ia|llm|gpt|claude|gemini|modelo|neuronal|prompt|ac[uú]stic|onda/.test(lower))
    return 'ai';
  if (/agente|bot|aut[oó]nomo|asistente/.test(lower)) return 'bot';
  if (/webhook|api|http|endpoint|request|conectar|sincron/.test(lower))
    return 'api';
  if (/base de datos|sql|supabase|datos|tabla|storage|vector|3d|relieve/.test(lower))
    return 'data';
  if (/n8n|make|flujo|workflow|pipeline|automatiza|nodo/.test(lower))
    return 'workflow';
  if (/filtro|limpiar|validar|verificar|error|humo|óptico|luz/.test(lower))
    return 'filter';
  if (/desplegar|producci[oó]n|lanzar|resultado|final|ahorro|ms|milisegundo/.test(lower))
    return 'rocket';
  if (/listo|completado|éxito|ok|verificado|hash/.test(lower)) return 'check';

  const cycle: TechIconType[] = [
    'workflow',
    'code',
    'ai',
    'api',
    'data',
    'rocket',
  ];
  return cycle[index % cycle.length];
}

interface TechIconProps {
  type: TechIconType;
  size?: number;
  color?: string;
}

export const TechIcon: React.FC<TechIconProps> = ({
  type,
  size = 34,
  color = PALETTE.ink,
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'code':
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      );
    case 'terminal':
      return (
        <svg {...common}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'ai':
      return (
        <svg {...common}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'bot':
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
      );
    case 'api':
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'data':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'filter':
      return (
        <svg {...common}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      );
    case 'rocket':
      return (
        <svg {...common}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'workflow':
    default:
      return (
        <svg {...common}>
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="15" y="3" width="6" height="6" rx="1" />
          <rect x="9" y="15" width="6" height="6" rx="1" />
          <path d="M6 9v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9" />
          <path d="M12 13v2" />
        </svg>
      );
  }
};
