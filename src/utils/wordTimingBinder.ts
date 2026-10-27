import type { WordTimestamp } from '../data/schema';
import type { CircuitNode } from '../components/kinetic/VectorLoopCircuit';

export interface BoundCircuitNode extends CircuitNode {
  /** Palabra(s) clave del guion que activan esta estación automáticamente desde info.json */
  triggerKeyword?: string | string[];
}

/**
 * Normaliza una cadena eliminando signos de puntuación y tildes para comparación fonética/léxica
 */
export function normalizeToken(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Busca en los wordTimestamps reales de ElevenLabs (public/audio/info.json) el fotograma
 * exacto donde se pronuncia una palabra clave o lista de sinónimos.
 */
export function findKeywordFrameWindow(
  wordTimestamps: WordTimestamp[] | undefined,
  keywords: string | string[] | undefined,
  fallbackStartFrame: number,
  fallbackEndFrame?: number,
  minSearchFrame = 0
): { startFrame: number; endFrame: number; matched: boolean } {
  const defaultEnd = fallbackEndFrame ?? fallbackStartFrame + 38;
  if (!wordTimestamps || wordTimestamps.length === 0 || !keywords) {
    return {
      startFrame: fallbackStartFrame,
      endFrame: defaultEnd,
      matched: false,
    };
  }

  const candidateList = (Array.isArray(keywords) ? keywords : [keywords])
    .map(normalizeToken)
    .filter(Boolean);

  if (candidateList.length === 0) {
    return {
      startFrame: fallbackStartFrame,
      endFrame: defaultEnd,
      matched: false,
    };
  }

  for (let i = 0; i < wordTimestamps.length; i++) {
    const item = wordTimestamps[i];
    if (item.startFrame < minSearchFrame) continue;
    const cleanWord = normalizeToken(item.word);
    if (!cleanWord) continue;

    const isMatch = candidateList.some(
      (kw) => cleanWord === kw || cleanWord.startsWith(kw)
    );

    if (isMatch) {
      //Incluir 1 palabra previa si es un determinante corto ("una señal", "la rutina")
      const prevWord = i > 0 ? wordTimestamps[i - 1] : null;
      const prevNorm = prevWord ? normalizeToken(prevWord.word) : '';
      const includePrev =
        prevWord &&
        ['una', 'un', 'la', 'el', 'misma', 'nueva'].includes(prevNorm) &&
        item.startFrame - prevWord.startFrame <= 14;

      const startFrame = includePrev ? prevWord.startFrame : item.startFrame;
      // Ventana hablada natural (~38 frames / 1.25s) salvo que se acote después por el siguiente nodo
      const endFrame = Math.max(startFrame + 32, item.endFrame + 24);
      return { startFrame, endFrame, matched: true };
    }
  }

  return {
    startFrame: fallbackStartFrame,
    endFrame: defaultEnd,
    matched: false,
  };
}

/**
 * Auto-Binder Semántico para VectorLoopCircuit:
 * Cruza cada estación del circuito con `wordTimestamps` de `public/audio/info.json`
 * para encender las luces exactamente cuando el locutor pronuncia cada concepto,
 * encadenando el apagado de una estación con el encendido de la siguiente.
 */
export function bindCircuitNodesToAudio(
  nodes: BoundCircuitNode[],
  wordTimestamps?: WordTimestamp[]
): CircuitNode[] {
  if (!wordTimestamps || wordTimestamps.length === 0) {
    return nodes;
  }

  const resolved = nodes.map((node) => {
    const keywords = node.triggerKeyword ?? [node.label];
    const match = findKeywordFrameWindow(
      wordTimestamps,
      keywords,
      node.triggerFrame,
      node.endSpokenFrame
    );
    return {
      ...node,
      triggerFrame: match.startFrame,
      endSpokenFrame: match.matched
        ? match.endFrame
        : node.endSpokenFrame ?? node.triggerFrame + 38,
      _matched: match.matched,
    };
  });

  // Ajustar endSpokenFrame cuando dos estaciones se pronuncian de forma consecutiva
  // en orden cronológico para que no queden dos luces compitiendo al mismo tiempo
  const sortedByStart = [...resolved].sort(
    (a, b) => a.triggerFrame - b.triggerFrame
  );
  for (let i = 0; i < sortedByStart.length - 1; i++) {
    const curr = sortedByStart[i];
    const next = sortedByStart[i + 1];
    if (
      curr._matched &&
      next._matched &&
      next.triggerFrame > curr.triggerFrame
    ) {
      curr.endSpokenFrame = Math.max(
        curr.triggerFrame + 18,
        next.triggerFrame - 1
      );
    }
  }

  return resolved.map(({ _matched, ...cleanNode }) => cleanNode);
}
