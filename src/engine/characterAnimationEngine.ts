import { Delaunay } from 'd3-delaunay';
import type { WordTimestamp } from '../data/schema';

export type CharacterEmotion =
  | 'neutral'
  | 'explaining'
  | 'curious'
  | 'happy'
  | 'thinking';

export type CharacterLookAt = 'center' | 'left' | 'right' | 'down' | 'up';

export type CharacterVertexGroup =
  | 'anchor'          // Borde del medallón o lienzo (fijo: 0 movimiento)
  | 'torso'           // Hombros y pecho (respiración suave)
  | 'neck_lower'      // Base del cuello (transición torso -> cuello)
  | 'neck_upper'      // Cuello superior bajo mentón (absorbe descenso mandibular)
  | 'cranium'         // Cráneo, sienes y frente superior (solidario al cráneo, 0 tirón de cejas)
  | 'forehead_buffer' // Fila amortiguadora de frente media (aísla el pelo del movimiento de cejas)
  | 'hair_wave'       // Cabello (solidario al cráneo sin rebote vertical parásito)
  | 'ear_left'        // Oreja izquierda (parallax 2.5D inverso)
  | 'ear_right'       // Oreja derecha (parallax 2.5D inverso)
  | 'brow_left'       // Ceja izquierda de espesor rígido (borde sup + inf se mueven idénticos)
  | 'brow_right'      // Ceja derecha de espesor rígido (borde sup + inf se mueven idénticos)
  | 'lid_crease_l'    // Pliegue tarsal superior izquierdo
  | 'lid_up_l'        // Borde de pestañas superior izquierdo (desciende al parpadear)
  | 'lid_low_l'       // Párpado inferior izquierdo
  | 'lid_crease_r'    // Pliegue tarsal superior derecho
  | 'lid_up_r'        // Borde de pestañas superior derecho (desciende al parpadear)
  | 'lid_low_r'       // Párpado inferior derecho
  | 'nose_bridge'     // Puente nasal
  | 'nose_tip'        // Punta nasal (máximo parallax 2.5D)
  | 'cheek_upper'     // Pómulos superiores
  | 'cheek_lower'     // Mejillas medias/bajas (acompañan elásticamente la mandíbula)
  | 'lip_upper_top'   // Borde superior del labio superior (Arco de Cupido)
  | 'lip_seam_up'     // Labio superior — borde interno de apertura (Split-Seam)
  | 'lip_corner_l'    // Comisura labial izquierda
  | 'lip_corner_r'    // Comisura labial derecha
  | 'lip_seam_low'    // Labio inferior — borde interno de apertura (Split-Seam)
  | 'lip_lower_bot'   // Borde inferior del labio inferior
  | 'chin_crease'     // Pliegue mentolabial
  | 'chin_tip'        // Punta de la barbilla
  | 'jaw_mid'         // Línea mandibular media
  | 'jaw_angle';      // Ángulo goníaco de la mandíbula

export interface CharacterMeshVertex {
  u: number;
  v: number;
  group: CharacterVertexGroup;
  /** Peso de influencia mandibular (0.0 a 1.0) */
  jawWeight: number;
  /** Profundidad 2.5D para parallax al girar la cabeza (-0.25 en orejas a +1.34 en nariz) */
  zDepth: number;
  /** Peso de rotación craneal (1.0 en cabeza, 0.35..0.75 en cuello, 0.0 en hombros/fondo) */
  headWeight: number;
}

export interface CharacterMeshDefinition {
  id: string;
  width: number;
  height: number;
  cervicalPivot: { x: number; y: number };
  mouthCenterU: number;
  medallionClip?: { cx: number; cy: number; r: number };
  maxJawDropPx: number;
  maxEyelidDropPx: number;
  vertices: CharacterMeshVertex[];
}

export interface CharacterRigState {
  /** Apertura bucal normalizada (0.0 = cerrado, 1.0 = vocal abierta máxima) */
  openNorm: number;
  /** Factor de anchura labial (-1.0 = 'O/U' redondeado, 0 = neutro, +1.0 = 'A/E/I' abierto) */
  lipSpread: number;
  /** Cierre palpebral (0.0 = ojos abiertos, 1.0 = parpadeo cerrado) */
  blinkAmount: number;
  /** Giro horizontal 2.5D en píxeles (-5 a +5) */
  turnX: number;
  /** Cabeceo vertical suave en píxeles (-1.2 a +1.2) */
  nodY: number;
  /** Inclinación lateral de cabeza en grados (-2.2 a +2.2) */
  headTiltDeg: number;
  /** Desplazamiento vertical rígido de ceja izquierda (negativo = sube sin ensanchar) */
  browLeftY: number;
  /** Desplazamiento vertical rígido de ceja derecha (negativo = sube sin ensanchar) */
  browRightY: number;
  /** Respiración vertical de hombros y pecho */
  breathY: number;
}

export interface EmotionKeyframe {
  startSec: number;
  emotion: CharacterEmotion;
}

export interface CompiledCharacterMesh {
  triangles: Uint32Array;
  bridgeTriangleFlags: boolean[];
  lipSeamUpIndices: number[];
  lipSeamLowIndices: number[];
  lipCornerLeftIndex: number;
  lipCornerRightIndex: number;
}

const compiledMeshCache = new WeakMap<
  CharacterMeshDefinition,
  CompiledCharacterMesh
>();

/**
 * Compila y almacena en caché la triangulación de Delaunay (`d3-delaunay`) para una definición de personaje.
 */
export function compileCharacterDelaunayMesh(
  def: CharacterMeshDefinition
): CompiledCharacterMesh {
  const cached = compiledMeshCache.get(def);
  if (cached) return cached;

  const vertices = def.vertices;
  const coords = new Float64Array(vertices.length * 2);
  const lipSeamUpIndices: number[] = [];
  const lipSeamLowIndices: number[] = [];
  let lipCornerLeftIndex = 0;
  let lipCornerRightIndex = 0;

  vertices.forEach((v, idx) => {
    coords[idx * 2] = v.u;
    coords[idx * 2 + 1] = v.v;
    if (v.group === 'lip_seam_up') lipSeamUpIndices.push(idx);
    if (v.group === 'lip_seam_low') lipSeamLowIndices.push(idx);
    if (v.group === 'lip_corner_l') lipCornerLeftIndex = idx;
    if (v.group === 'lip_corner_r') lipCornerRightIndex = idx;
  });

  const delaunay = new Delaunay(coords);
  const triangles = delaunay.triangles;
  const numTris = triangles.length / 3;
  const bridgeTriangleFlags = new Array<boolean>(numTris);

  for (let t = 0; t < numTris; t++) {
    const i0 = triangles[t * 3];
    const i1 = triangles[t * 3 + 1];
    const i2 = triangles[t * 3 + 2];
    const g0 = vertices[i0].group;
    const g1 = vertices[i1].group;
    const g2 = vertices[i2].group;

    const hasUp =
      g0 === 'lip_seam_up' || g1 === 'lip_seam_up' || g2 === 'lip_seam_up';
    const hasLow =
      g0 === 'lip_seam_low' || g1 === 'lip_seam_low' || g2 === 'lip_seam_low';

    bridgeTriangleFlags[t] = hasUp && hasLow;
  }

  const compiled: CompiledCharacterMesh = {
    triangles,
    bridgeTriangleFlags,
    lipSeamUpIndices,
    lipSeamLowIndices,
    lipCornerLeftIndex,
    lipCornerRightIndex,
  };
  compiledMeshCache.set(def, compiled);
  return compiled;
}

/**
 * Calcula una envolvente continua de voz (`0.0 .. 1.0`) a partir de `wordTimestamps`,
 * evitando saltos bruscos de 1 fotograma cuando dos palabras solapan o van seguidas,
 * e ignorando signos de puntuación sueltos.
 */
export function computeContinuousSpeechEnvelope(
  frame: number,
  wordTimestamps?: WordTimestamp[]
): { isSpeaking: boolean; envelope: number; activeWord?: WordTimestamp } {
  if (!wordTimestamps || wordTimestamps.length === 0) {
    return { isSpeaking: false, envelope: 0, activeWord: undefined };
  }

  let maxEnv = 0;
  let currentWord: WordTimestamp | undefined;

  for (let i = 0; i < wordTimestamps.length; i++) {
    const w = wordTimestamps[i];
    const cleaned = w.word.replace(/[.,;!?¿¡"«»()]/g, '').trim();
    if (!cleaned) continue;

    if (frame >= w.startFrame && frame <= w.endFrame) {
      currentWord = w;
    }

    // Rampa suave C1 de ataque y relajación (3.0 fotogramas) para fundir palabras consecutivas
    const attack = (frame - (w.startFrame - 1.2)) / 3.0;
    const release = (w.endFrame + 1.2 - frame) / 3.0;
    if (attack > 0 && release > 0) {
      const u = Math.max(0, Math.min(1, Math.min(attack, release)));
      const smooth = u * u * (3 - 2 * u);
      if (smooth > maxEnv) {
        maxEnv = smooth;
      }
    }
  }

  return {
    isSpeaking: maxEnv > 0.04,
    envelope: maxEnv,
    activeWord: currentWord,
  };
}

/**
 * Tabla de poses emocionales de cejas con desplazamientos sutiles y naturales
 * (sin inclinaciones extremas ni tirones que deformen la frente).
 */
const EMOTION_BROW_TARGETS: Record<
  CharacterEmotion,
  { leftY: number; rightY: number }
> = {
  neutral: { leftY: 0.0, rightY: 0.0 },
  explaining: { leftY: -1.2, rightY: -1.2 },
  curious: { leftY: -1.8, rightY: -0.8 },
  happy: { leftY: -1.5, rightY: -1.5 },
  thinking: { leftY: -0.4, rightY: -1.6 },
};

/**
 * Interpola suavemente con curva coseno C1 (`smoothstep`) entre estados emocionales
 * para garantizar 0 parpadeos o saltos de 1 fotograma en cambios de emoción (ej. segundo 8).
 */
export function evaluateSmoothEmotionBrowPose(
  frame: number,
  fps: number,
  emotion: CharacterEmotion,
  emotionSchedule?: EmotionKeyframe[]
): { browLeftY: number; browRightY: number; activeEmotion: CharacterEmotion } {
  const sec = frame / fps;

  if (!emotionSchedule || emotionSchedule.length === 0) {
    const target = EMOTION_BROW_TARGETS[emotion] ?? EMOTION_BROW_TARGETS.neutral;
    return {
      browLeftY: target.leftY,
      browRightY: target.rightY,
      activeEmotion: emotion,
    };
  }

  // Ventana de transición suave de 0.75 segundos (22.5 fotogramas a 30fps)
  const transitionDurationSec = 0.75;
  let currentIdx = 0;
  for (let i = 0; i < emotionSchedule.length; i++) {
    if (sec >= emotionSchedule[i].startSec) {
      currentIdx = i;
    }
  }

  const currentKey = emotionSchedule[currentIdx];
  const currentTarget = EMOTION_BROW_TARGETS[currentKey.emotion];

  if (currentIdx === 0) {
    return {
      browLeftY: currentTarget.leftY,
      browRightY: currentTarget.rightY,
      activeEmotion: currentKey.emotion,
    };
  }

  const elapsedSinceSwitch = sec - currentKey.startSec;
  if (elapsedSinceSwitch < transitionDurationSec) {
    const prevKey = emotionSchedule[currentIdx - 1];
    const prevTarget = EMOTION_BROW_TARGETS[prevKey.emotion];
    const u = Math.max(0, Math.min(1, elapsedSinceSwitch / transitionDurationSec));
    const blend = 0.5 - 0.5 * Math.cos(Math.PI * u);
    return {
      browLeftY: prevTarget.leftY + (currentTarget.leftY - prevTarget.leftY) * blend,
      browRightY: prevTarget.rightY + (currentTarget.rightY - prevTarget.rightY) * blend,
      activeEmotion: currentKey.emotion,
    };
  }

  return {
    browLeftY: currentTarget.leftY,
    browRightY: currentTarget.rightY,
    activeEmotion: currentKey.emotion,
  };
}

export interface SolveCharacterRigParams {
  frame: number;
  fps: number;
  isSpeaking?: boolean;
  speechEnvelope?: number;
  speechIntensity?: number;
  emotion?: CharacterEmotion;
  emotionSchedule?: EmotionKeyframe[];
  lookAt?: CharacterLookAt;
  forcedOpen?: number;
  forcedLipSpread?: number;
  forcedBlink?: number;
  forcedTurnX?: number;
}

/**
 * Resuelve de forma 100% determinista el estado cinemático del personaje en el fotograma actual.
 * - Cero rebote vertical del pelo al hablar.
 * - Cejas desacopladas del oscilador silábico rápido (`openNorm`) para evitar aleteo y ensanchamiento.
 * - Transiciones emocionales continuas C1 sin parpadeos de 1 fotograma.
 */
export function solveCharacterRigState(
  params: SolveCharacterRigParams
): CharacterRigState {
  const {
    frame,
    fps,
    isSpeaking = false,
    speechEnvelope = isSpeaking ? 1.0 : 0.0,
    speechIntensity = 1.0,
    emotion = 'explaining',
    emotionSchedule,
    lookAt = 'center',
    forcedOpen,
    forcedLipSpread,
    forcedBlink,
    forcedTurnX,
  } = params;

  const t = frame / fps;

  // 1. Articulación Mandibular Elástica y Visemas Fonéticos (`openNorm` y `lipSpread`)
  let openNorm = 0;
  let lipSpread = 0;

  if (typeof forcedOpen === 'number') {
    openNorm = Math.max(0, Math.min(1, forcedOpen));
    lipSpread = typeof forcedLipSpread === 'number' ? forcedLipSpread : 0.25;
  } else if (speechEnvelope > 0.02) {
    // Oscilador silábico multifrecuencia (~4.4 Hz) con cierre consonántico suave
    const s1 = 0.5 + 0.5 * Math.sin(t * 27.5 + 0.9);
    const s2 = 0.5 + 0.5 * Math.cos(t * 17.2 + 0.4);
    const consonantDip = 0.32 + 0.68 * (0.5 + 0.5 * Math.sin(t * 19.2 + 1.2));

    const rawEnergy = 0.26 + 0.74 * (s1 * 0.65 + s2 * 0.35);
    openNorm = Math.min(
      1,
      rawEnergy * consonantDip * speechEnvelope * speechIntensity * 1.15
    );

    // Alternancia orgánica entre vocales redondeadas ('O/U' < 0) y abiertas ('A/E/I' > 0)
    lipSpread =
      typeof forcedLipSpread === 'number'
        ? forcedLipSpread
        : Math.sin(t * 10.8 + 0.4) * 0.82 * speechEnvelope;
  }

  // 2. Parpadeo Ocular Elástico de 2 Bandas (Cada ~3.6 segundos)
  let blinkAmount = 0;
  if (typeof forcedBlink === 'number') {
    blinkAmount = forcedBlink;
  } else {
    const cycle = (frame + 34) % 108;
    if (cycle < 5) {
      blinkAmount = Math.sin((cycle / 5) * Math.PI);
    } else if (frame % 324 >= 12 && frame % 324 < 17) {
      blinkAmount = Math.sin(((frame % 324 - 12) / 5) * Math.PI);
    }
  }

  // 3. Giro 2.5D con Parallax (`turnX`) y Cabeceo Ultra-Estable (`nodY`)
  //    Eliminado el rebote vertical rápido al hablar para que el pelo y el cráneo sean 100% firmes.
  const lookOffsetX = lookAt === 'left' ? -3.8 : lookAt === 'right' ? 3.8 : 0;
  const lookOffsetY = lookAt === 'up' ? -1.8 : lookAt === 'down' ? 1.8 : 0;

  const turnX =
    typeof forcedTurnX === 'number'
      ? forcedTurnX
      : Math.sin(t * 0.90) * 2.4 +
        Math.cos(t * 1.95) * 0.95 * speechEnvelope +
        lookOffsetX;

  const nodY =
    Math.cos(t * 1.15) * 0.75 +
    Math.sin(t * 2.10) * 0.35 * speechEnvelope +
    lookOffsetY;

  const headTiltDeg =
    Math.sin(t * 1.10) * 1.05 +
    Math.sin(t * 2.30) * 0.55 * speechEnvelope +
    turnX * 0.20;

  // 4. Expresión de Cejas Rígidas con Interpolación Temporal C1 (Cero ensanchamiento y cero saltos)
  const smoothBrow = evaluateSmoothEmotionBrowPose(
    frame,
    fps,
    emotion,
    emotionSchedule
  );
  // Cadencia expresiva lenta de frase (1.6 rad/s = 0.25 Hz, nunca acoplada a las sílabas de la boca)
  const slowPhraseAccent = Math.sin(t * 1.65) * -0.45 * speechEnvelope;
  const browLeftY = smoothBrow.browLeftY + slowPhraseAccent;
  const browRightY = smoothBrow.browRightY + slowPhraseAccent;

  // 5. Respiración Torácica Suave en Hombros
  const breathY = Math.sin(t * 1.65) * 1.6;

  return {
    openNorm,
    lipSpread,
    blinkAmount,
    turnX,
    nodY,
    headTiltDeg,
    browLeftY,
    browRightY,
    breathY,
  };
}

/**
 * Calcula las posiciones deformadas `(x, y)` de todos los vértices del personaje:
 * - Cejas de espesor rígido (top + bottom de `brow_left`/`brow_right` se desplazan idénticos: 0% ensanchamiento).
 * - Fila `forehead_buffer` fija que bloquea cualquier transmisión de movimiento de las cejas hacia el pelo.
 * - Pelo (`hair_wave`) solidario al cráneo (0 rebote vertical independiente).
 * - Mandíbula, mejillas, labios y cuello elásticos.
 */
export function deformCharacterMeshVertices(
  def: CharacterMeshDefinition,
  state: CharacterRigState
): Float32Array {
  const vertices = def.vertices;
  const n = vertices.length;
  const out = new Float32Array(n * 2);

  const maxJawDrop = state.openNorm * def.maxJawDropPx;
  const rad = (state.headTiltDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const pivotX = def.cervicalPivot.x;
  const pivotY = def.cervicalPivot.y;
  const centerU = def.mouthCenterU;

  for (let i = 0; i < n; i++) {
    const v = vertices[i];
    let dx = 0;
    let dy = 0;

    // 1. Deformación elástica de mandíbula, labios, mejillas y barbilla
    if (v.jawWeight > 0) {
      dy += maxJawDrop * v.jawWeight;

      const distFromCenter = v.u - centerU;
      if (
        v.group === 'lip_corner_l' ||
        v.group === 'lip_corner_r' ||
        v.group === 'lip_seam_up' ||
        v.group === 'lip_seam_low' ||
        v.group === 'lip_lower_bot' ||
        v.group === 'lip_upper_top'
      ) {
        dx += (distFromCenter / 42) * state.lipSpread * 3.8 * state.openNorm;
      }

      if (v.group === 'cheek_lower' || v.group === 'jaw_mid') {
        dx -= Math.sign(distFromCenter) * state.openNorm * 1.5 * v.jawWeight;
      }
    }

    // 2. Elevación sutil del labio superior al hablar
    if (v.group === 'lip_seam_up' || v.group === 'lip_upper_top') {
      dy -= state.openNorm * 1.9;
    }

    // 3. Parpadeo elástico real de 2 bandas (`lid_up` baja hacia `lid_low`)
    if (v.group === 'lid_up_l' || v.group === 'lid_up_r') {
      dy += state.blinkAmount * def.maxEyelidDropPx;
    } else if (v.group === 'lid_low_l' || v.group === 'lid_low_r') {
      if (v.v > 240) {
        dy -= state.blinkAmount * 1.3;
      }
    } else if (v.group === 'lid_crease_l') {
      // Acompaña ligeramente a la ceja y al parpadeo sin estirar la ceja
      dy += state.browLeftY * 0.45 + state.blinkAmount * 1.8;
    } else if (v.group === 'lid_crease_r') {
      dy += state.browRightY * 0.45 + state.blinkAmount * 1.8;
    }

    // 4. Cejas de espesor 100% rígido:
    //    Tanto la fila superior como la fila inferior de la ceja reciben exactamente el mismo `dy`
    //    (determinante = 1.0 dentro de la ceja -> jamás se ensancha ni deforma su grosor).
    if (v.group === 'brow_left') {
      dy += state.browLeftY;
    } else if (v.group === 'brow_right') {
      dy += state.browRightY;
    }
    // Nota: `forehead_buffer`, `cranium` y `hair_wave` tienen dy = 0 respecto a las cejas,
    // aislando al 100% el cabello del movimiento de las cejas.

    // 5. Respiración torácica suave en hombros
    if (v.group === 'torso') {
      dy += state.breathY;
      dx += ((v.u - centerU) / 180) * state.breathY * 0.42;
    }

    // 6. Giro 2.5D con Parallax (`zDepth`) e inclinación cervical (`headWeight`)
    if (v.headWeight > 0) {
      dx += state.turnX * v.zDepth * v.headWeight;
      dy += state.nodY * Math.max(0.25, v.zDepth) * v.headWeight;

      const px = v.u + dx - pivotX;
      const py = v.v + dy - pivotY;
      const rotX = px * cosA - py * sinA;
      const rotY = px * sinA + py * cosA;

      out[i * 2] = pivotX + px * (1 - v.headWeight) + rotX * v.headWeight;
      out[i * 2 + 1] = pivotY + py * (1 - v.headWeight) + rotY * v.headWeight;
    } else {
      out[i * 2] = v.u + dx;
      out[i * 2 + 1] = v.v + dy;
    }
  }

  return out;
}

/**
 * Renderiza la malla continua de Delaunay sobre un contexto HTML5 2D `<canvas>`
 * mediante transformación afín por triángulo (`ctx.transform`).
 */
export function renderCharacterMeshToCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  def: CharacterMeshDefinition,
  state: CharacterRigState,
  variant: 'badge' | 'cutout' | 'card' = 'badge',
  showWireframe = false
): void {
  const { width, height, vertices, medallionClip } = def;
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  if (medallionClip) {
    ctx.beginPath();
    ctx.arc(medallionClip.cx, medallionClip.cy, medallionClip.r, 0, Math.PI * 2);
    ctx.clip();
  }

  if (variant !== 'cutout') {
    ctx.drawImage(img, 0, 0, width, height);
  }

  const mesh = compileCharacterDelaunayMesh(def);
  const deformed = deformCharacterMeshVertices(def, state);
  const tris = mesh.triangles;
  const numTris = tris.length / 3;
  const isMouthOpen = state.openNorm > 0.025;

  // 1. Rasterización por hardware de los triángulos de Delaunay con mapeo afín exacto
  for (let t = 0; t < numTris; t++) {
    if (isMouthOpen && mesh.bridgeTriangleFlags[t]) {
      continue;
    }

    const i0 = tris[t * 3];
    const i1 = tris[t * 3 + 1];
    const i2 = tris[t * 3 + 2];

    const u0 = vertices[i0].u;
    const v0 = vertices[i0].v;
    const u1 = vertices[i1].u;
    const v1 = vertices[i1].v;
    const u2 = vertices[i2].u;
    const v2 = vertices[i2].v;

    const x0 = deformed[i0 * 2];
    const y0 = deformed[i0 * 2 + 1];
    const x1 = deformed[i1 * 2];
    const y1 = deformed[i1 * 2 + 1];
    const x2 = deformed[i2 * 2];
    const y2 = deformed[i2 * 2 + 1];

    const det = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
    if (Math.abs(det) < 1e-4) continue;
    const invDet = 1.0 / det;

    const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) * invDet;
    const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) * invDet;
    const c = ((u1 - u0) * (x2 - x0) - (u2 - u0) * (x1 - x0)) * invDet;
    const d = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) * invDet;
    const e = x0 - a * u0 - c * v0;
    const f = y0 - b * u0 - d * v0;

    // Expansión sub-píxel (0.55px) desde el baricentro para sellar cualquier junta de antialiasing
    const cx = (x0 + x1 + x2) / 3;
    const cy = (y0 + y1 + y2) / 3;
    const expand = (px: number, py: number): [number, number] => {
      const dx = px - cx;
      const dy = py - cy;
      const len = Math.hypot(dx, dy) || 1;
      return [px + (dx / len) * 0.55, py + (dy / len) * 0.55];
    };

    const [ex0, ey0] = expand(x0, y0);
    const [ex1, ey1] = expand(x1, y1);
    const [ex2, ey2] = expand(x2, y2);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ex0, ey0);
    ctx.lineTo(ex1, ey1);
    ctx.lineTo(ex2, ey2);
    ctx.closePath();
    ctx.clip();

    ctx.transform(a, b, c, d, e, f);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }

  // 2. Cavidad oral 3D y sombreado labial interno
  if (isMouthOpen) {
    drawOralCavityShader(ctx, mesh, deformed, state.openNorm);
    drawLipInnerShading(ctx, mesh, deformed, state.openNorm);
  }

  // 3. Visualización opcional de la malla de triángulos de Delaunay
  if (showWireframe) {
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 78, 52, 0.42)';
    ctx.lineWidth = 1.25;
    for (let t = 0; t < numTris; t++) {
      if (isMouthOpen && mesh.bridgeTriangleFlags[t]) continue;
      const i0 = tris[t * 3];
      const i1 = tris[t * 3 + 1];
      const i2 = tris[t * 3 + 2];
      if (
        vertices[i0].group === 'anchor' &&
        vertices[i1].group === 'anchor' &&
        vertices[i2].group === 'anchor'
      ) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(deformed[i0 * 2], deformed[i0 * 2 + 1]);
      ctx.lineTo(deformed[i1 * 2], deformed[i1 * 2 + 1]);
      ctx.lineTo(deformed[i2 * 2], deformed[i2 * 2 + 1]);
      ctx.closePath();
      ctx.stroke();
    }

    for (let i = 0; i < vertices.length; i++) {
      if (vertices[i].group === 'anchor') continue;
      const px = deformed[i * 2];
      const py = deformed[i * 2 + 1];
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fillStyle =
        vertices[i].jawWeight > 0.3 ? '#D94E34' : '#FEF9C3';
      ctx.fill();
      ctx.strokeStyle = '#141413';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }
    ctx.restore();
  }

  if (variant === 'badge' && medallionClip) {
    ctx.beginPath();
    ctx.arc(
      medallionClip.cx,
      medallionClip.cy,
      medallionClip.r - 1,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = 'rgba(20, 20, 19, 0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

function drawOralCavityShader(
  ctx: CanvasRenderingContext2D,
  mesh: CompiledCharacterMesh,
  deformed: Float32Array,
  openNorm: number
): void {
  const clIdx = mesh.lipCornerLeftIndex;
  const crIdx = mesh.lipCornerRightIndex;
  const upIdxs = mesh.lipSeamUpIndices;
  const lowIdxs = mesh.lipSeamLowIndices;

  const clX = deformed[clIdx * 2];
  const clY = deformed[clIdx * 2 + 1];
  const crX = deformed[crIdx * 2];
  const crY = deformed[crIdx * 2 + 1];

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(clX, clY);
  for (const idx of upIdxs) {
    ctx.lineTo(deformed[idx * 2], deformed[idx * 2 + 1] - 0.35);
  }
  ctx.lineTo(crX, crY);
  for (let i = lowIdxs.length - 1; i >= 0; i--) {
    const idx = lowIdxs[i];
    ctx.lineTo(deformed[idx * 2], deformed[idx * 2 + 1] + 0.35);
  }
  ctx.closePath();
  ctx.clip();

  const midUpY = deformed[upIdxs[2] * 2 + 1];
  const midLowY = deformed[lowIdxs[2] * 2 + 1];
  const midX = deformed[upIdxs[2] * 2];
  const gapH = Math.max(2, midLowY - midUpY);

  const cavGrad = ctx.createLinearGradient(midX, midUpY - 2, midX, midLowY + 2);
  cavGrad.addColorStop(0, '#220E09');
  cavGrad.addColorStop(0.65, '#381810');
  cavGrad.addColorStop(1, '#2A120C');
  ctx.fillStyle = cavGrad;
  ctx.fillRect(clX - 4, midUpY - 4, crX - clX + 8, gapH + 10);

  if (openNorm > 0.16) {
    ctx.beginPath();
    ctx.ellipse(
      midX,
      midLowY + 1.5,
      (crX - clX) * 0.30,
      gapH * 0.48,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#AD5442';
    ctx.fill();
  }

  const teethDrop = Math.min(6.0, gapH * 0.46);
  const teethGrad = ctx.createLinearGradient(clX + 8, midUpY, crX - 8, midUpY);
  teethGrad.addColorStop(0, '#B89E88');
  teethGrad.addColorStop(0.2, '#EDE2D5');
  teethGrad.addColorStop(0.5, '#F6EFE6');
  teethGrad.addColorStop(0.8, '#EDE2D5');
  teethGrad.addColorStop(1, '#B89E88');

  ctx.beginPath();
  ctx.moveTo(clX + 9, midUpY - 2);
  ctx.lineTo(crX - 9, midUpY - 2);
  ctx.quadraticCurveTo(midX, midUpY + teethDrop + 1.5, clX + 9, midUpY - 2);
  ctx.closePath();
  ctx.fillStyle = teethGrad;
  ctx.fill();

  const topShadow = ctx.createLinearGradient(midX, midUpY - 1, midX, midUpY + 3.5);
  topShadow.addColorStop(0, 'rgba(34, 14, 9, 0.55)');
  topShadow.addColorStop(1, 'rgba(34, 14, 9, 0.0)');
  ctx.fillStyle = topShadow;
  ctx.fillRect(clX, midUpY - 2, crX - clX, 6);

  ctx.restore();
}

function drawLipInnerShading(
  ctx: CanvasRenderingContext2D,
  mesh: CompiledCharacterMesh,
  deformed: Float32Array,
  openNorm: number
): void {
  const clIdx = mesh.lipCornerLeftIndex;
  const crIdx = mesh.lipCornerRightIndex;
  const upIdxs = mesh.lipSeamUpIndices;
  const lowIdxs = mesh.lipSeamLowIndices;

  const clX = deformed[clIdx * 2];
  const clY = deformed[clIdx * 2 + 1];
  const crX = deformed[crIdx * 2];
  const crY = deformed[crIdx * 2 + 1];

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(clX, clY);
  for (const idx of upIdxs) {
    ctx.lineTo(deformed[idx * 2], deformed[idx * 2 + 1]);
  }
  ctx.lineTo(crX, crY);
  ctx.strokeStyle = `rgba(92, 46, 30, ${Math.min(0.65, openNorm * 0.85)})`;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(clX, clY);
  for (const idx of lowIdxs) {
    ctx.lineTo(deformed[idx * 2], deformed[idx * 2 + 1]);
  }
  ctx.lineTo(crX, crY);
  ctx.strokeStyle = `rgba(148, 86, 62, ${Math.min(0.55, openNorm * 0.75)})`;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.restore();
}
