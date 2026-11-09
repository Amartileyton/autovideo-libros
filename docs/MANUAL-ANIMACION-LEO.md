# MANUAL TÉCNICO DEL MOTOR DE ANIMACIÓN DE PERSONAJES (`src/engine/characterAnimationEngine.ts`) Y AVATAR "LEO"

> **Propósito de este Manual**: Permitir que **cualquier modelo de lenguaje (incluidos modelos ligeros o rápidos como Flash / Flash-Lite)** pueda instanciar, animar, ajustar o crear nuevos personajes 2.5D en `@en1minuto.es` utilizando el **Motor de Animación de Personajes (`src/engine/characterAnimationEngine.ts`)** basado en **100% código determinista en Remotion (0% IA en la animación)** y la librería matemática open-source **`d3-delaunay`**.

---

## 1. Arquitectura del Motor de Animación de Personajes (`src/engine/characterAnimationEngine.ts`)

El motor está desacoplado en dos niveles limpios:
1. **Núcleo Genérico del Motor (`src/engine/characterAnimationEngine.ts`)**:
   - `compileCharacterDelaunayMesh(def)`: Compila y cachea la triangulación de Delaunay (`d3-delaunay`) a partir de cualquier `CharacterMeshDefinition`.
   - `computeContinuousSpeechEnvelope(frame, wordTimestamps)`: Genera una envolvente de voz $C^1$-continua con rampas *smoothstep* de 3 fotogramas que funde palabras consecutivas o solapadas sin saltos de 1 fotograma e ignora signos de puntuación sueltos.
   - `evaluateSmoothEmotionBrowPose(frame, fps, emotion, emotionSchedule)`: Interpola cambios de emoción (`curious`, `explaining`, `thinking`, `happy`, `neutral`) mediante una ventana coseno de `0.75s` (`22.5 fotogramas`), eliminando parpadeos o saltos bruscos de cejas en cambios de estado.
   - `solveCharacterRigState(params)`: Calcula de forma determinista el vector cinemático `CharacterRigState` en el fotograma `frame`.
   - `deformCharacterMeshVertices(def, state)`: Deforma el grafo de vértices aplicando las **3 Leyes de Estabilidad Anatómica** (ver Sección 2).
   - `renderCharacterMeshToCanvas(ctx, img, def, state, variant, showWireframe)`: Rasteriza los triángulos por hardware (`ctx.transform`) con expansión baricéntrica de `0.55px` y dibuja el shader 3D de cavidad oral.
2. **Definición Específica de Leo (`src/components/character/leoMeshEngine.ts` + `LeoAvatar.tsx`)**:
   - Define `LEO_CHARACTER_MESH_DEF` con **158 vértices anatómicos** y **306 triángulos de Delaunay** sobre la textura maestra sin cortes `public/assets/character/leo-v2/leo-master.png` (`640×640`).

---

## 2. Las 3 Leyes de Estabilidad Anatómica (Anti-Artefactos)

> [!IMPORTANT]
> **REGLA INQUEBRANTABLE PARA MODELOS LIGEROS**: Nunca modifiques estas 3 leyes en `characterAnimationEngine.ts` ni en `leoMeshEngine.ts`:

1. **Aislamiento Total entre Pelo y Cejas (`forehead_buffer` + Pelo Solidario)**:
   - Entre la línea de nacimiento del pelo (`cranium`, `v = 160..168`) y las cejas (`v = 203..223`) existe una fila amortiguadora fija **`forehead_buffer` (`v = 185..188`)** cuyo desplazamiento respecto a las cejas es exactamente **`0.0px`**.
   - Todos los nodos de `hair_wave` y `cranium` comparten un `zDepth = 0.85` uniforme y `hairLag = 0`, moviéndose solidariamente con el cráneo sin rebotar verticalmente al hablar ni sufrir tirones desde las cejas.
2. **Cejas de Espesor 100% Rígido (Cero Ensanchamiento)**:
   - Cada ceja (`brow_left` y `brow_right`) se modela como una **cinta rígida de 2 filas**: 4 nodos en el borde superior (`v = 203.5..214`) y 4 nodos en el borde inferior (`v = 218.8..223.8`).
   - Ambas filas reciben **exactamente el mismo desplazamiento vertical `dy` y el mismo `zDepth = 0.92`**. Como resultado, todos los triángulos internos de la ceja se trasladan con determinante `1.0` y **jamás se ensanchan ni cambian de grosor**.
   - Además, las cejas están **100% desacopladas de `openNorm`** (no aletean al ritmo de las sílabas de la boca).
3. **Continuidad Temporal $C^1$ en Palabras y Emociones (Cero Parpadeos)**:
   - Ninguna transición de emoción o cambio de palabra en `wordTimestamps` puede producir un salto de 1 fotograma. Utiliza siempre `emotionSchedule` o `evaluateSmoothEmotionBrowPose()` y `computeContinuousSpeechEnvelope()`.

---

## 3. Topología de la Malla de Leo (`LEO_CHARACTER_MESH_DEF` — 158 Nodos / 306 Triángulos)

| Grupo de Vértices (`CharacterVertexGroup`) | Coordenadas UV Clave (`640×640`) | Pesos (`jawWeight` / `zDepth`) | Función en el Motor |
| :--- | :---: | :---: | :--- |
| **`anchor`** | Borde del medallón (`r = 291px`) | `jaw: 0.00`, `z: 0.00` | Ancla el plato marfil exterior |
| **`hair_wave` / `cranium`** | `u: 222..420`, `v: 66..168` | `jaw: 0.00`, `z: 0.85` (uniforme) | Bloque craneal sólido sin rebote vertical |
| **`forehead_buffer`** | `u: 235..403`, `v: 185..188` | `jaw: 0.00`, `z: 0.85..0.92` | Barrera que impide que las cejas tiren del pelo |
| **`brow_left` / `brow_right`** | Top `v: 203.5`, Bot `v: 219.2` | `jaw: 0.00`, `z: 0.92` (uniforme) | Cintas rígidas de ceja (0% ensanchamiento) |
| **`lid_crease` + `lid_up` + `lid_low`** | Ojo Izq `(273, 224..245)`, Der `(364, 224..245)` | `jaw: 0.00`, `z: 0.92..0.96` | Parpadeo elástico de 2 bandas |
| **`lip_seam_up` / `lip_seam_low`** | `u: 288..350`, `v: 321.8 / 323.2` | `jaw: 0.14` (up) / `1.00` (low) | *Split-Seam* labial que descubre la cavidad oral 3D |
| **`cheek_lower` / `chin_tip` / `jaw_mid`** | `u: 240..398`, `v: 304..384.5` | `jaw: 0.22..0.88`, `z: 0.65..1.05` | Piel elástica continua de mejillas y mentón |

---

## 4. Recetario Rápido de Uso (Copy-Paste para Modelos Ligeros)

### Caso A: Busto Protagonista con Cronograma de Emociones Suave (`emotionSchedule`)
```tsx
import { LeoAvatar, type EmotionKeyframe } from '../components/character';

const EMOTION_TIMELINE: EmotionKeyframe[] = [
  { startSec: 0.0, emotion: 'curious' },
  { startSec: 3.0, emotion: 'explaining' },
  { startSec: 6.0, emotion: 'thinking' },
  { startSec: 8.5, emotion: 'happy' },
];

<LeoAvatar
  frame={localFrame}
  wordTimestamps={wordTimestamps}
  emotionSchedule={EMOTION_TIMELINE}
  size={260}
  variant="badge" // 'badge' (con medallón marfil) | 'cutout' (busto recortado sin fondo)
/>
```

### Caso B: Pastilla de Presentador en Cabecera (`<LeoHostBadge />`)
```tsx
import { LeoHostBadge } from '../components/character';

<LeoHostBadge
  frame={localFrame}
  isSpeaking={isSpeaking}
  emotion="explaining"
  emotionSchedule={EMOTION_TIMELINE}
  size={72}
  label="LEO"
  sublabel="@en1minuto.es"
/>
```
