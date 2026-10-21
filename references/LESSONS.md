# LESSONS.md — Memoria Persistente de Producción (Remotion + ElevenLabs)

> **Propósito**: Registro acumulativo de auditorías de layout, sincronización audio-first, presupuestos de fotogramas (*Frame Budget*) y correcciones del Critic Gate tras cada renderizado. Todo subagente constructor (Slots 2, 3, 4 y 5) debe consultar este archivo antes de escribir código.

---

## 1. Reglas Base de Verificación Pre-Render
- **Zona Segura Vertical (9:16 - 1080x1920)**: Ningún titular, subtítulo o vector principal puede invadir los `288px` inferiores (`y > 1632px`).
- **Padding Lateral**: Mínimo `96px` a izquierda y derecha (`x` dentro de `[96, 984]`).
- **Tipografía Mínima**: Titulares $\ge 64\text{px}$ ($\le 7$ palabras); etiquetas $\ge 28\text{px}$ ($\le 15\text{-}20$ palabras por plano).
- **Física de Movimiento**: Prohibido CSS `transition` o `@keyframes`. Solo `SPRING_SNAPPY` y `SPRING_CAMERA` con `extrapolateLeft: "clamp"` y `extrapolateRight: "clamp"`.
- **Sincronización ElevenLabs**: El `durationInFrames` de cada `<Sequence>` debe coincidir al fotograma con `public/audio/info.json`.

---

## 2. Registro Histórico de Lecciones y Correcciones

| Fecha | Escena / Componente | Categoría (`Layout` / `Timing` / `Audio` / `Camera`) | Incidencia Detectada | Causa Raíz | Solución Aplicada / Regla Derivada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-10-19 | `Setup Inicial (Nivel 0)` | `Arquitectura` | Inicialización del estudio vectorial | N/A | Se establece baseline: `FPS=30`, `1080x1920`, superficie `#F8F7F4`, cross-dissolve de `10` fotogramas y auditoría `ffprobe` obligatoria. |
| 2026-10-20 | `Producción #1: Lector Ultrasónico 3D` | `Audio / Layout` | La API de ElevenLabs devuelve `api_key_id_used_as_api_key` si se pasa el Key ID de 64 caracteres en lugar de la clave secreta `sk_...` de 51 caracteres; además `ffmpeg.exe` de Remotion no incluye el filtro `areverse`. | Diferencia entre Key ID público y Secret Key `sk_...` en ElevenLabs; compilación minimalista de `ffmpeg` en `@remotion/compositor`. | Se implementó detección diagnóstica en `elevenlabs-sync.mjs` con síntesis local en español de respaldo + codificación directa `libmp3lame` y cálculo exacto de `wordTimestamps` (`773` frames, ritmo `2.35–3.18` palabras/s). |
| 2026-10-20 | `CameraRig.tsx` | `Camera / Timing` | El bucle de keyframes activaba la transición hacia `keyframes[i]` en `prev.frame` (`keyframes[i-1].frame`) en lugar de `next.frame` (`keyframes[i].frame`), adelantando la cámara un cuadrante. | Condición `if (frame >= prev.frame)` en el acumulador de `SPRING_CAMERA`. | Corregido a `if (frame >= next.frame)` con `frame: frame - next.frame`. Verificado visualmente en los 4 fotogramas clave (`frames 90, 280, 480, 670`). |
| 2026-10-20 | `DynamicCaptions.tsx` + `elevenlabs-sync.mjs` | `Audio / Subtítulos` | En la primera versión, el cambio dinámico de `padding` (`2px 12px` vs `2px 4px`), la escala inicial `< 1.0` (`0.94`) y la traslación vertical `translateY` por página provocaban vibración en los subtítulos. | Reflujo horizontal de flexbox por cambio de `padding` en la palabra activa y micro-huecos entre palabras. | Se integró la arquitectura de `TrendForge`: Voz Canónica `RwzBDEn5f6FIgpAjH9YN` (Gabriel Blanco / Leo), enlace continuo de `endMs` con el inicio del espacio siguiente, ventana fija de 3 palabras con `450ms` de tolerancia, texto sin fondo (`transparent`), fuente editorial seria (`IBM Plex Sans` / `Inter`) y métricas de caja constantes (escala `1.0 -> 1.06` sin reflujo). |

---

## 3. Plantilla para Nuevas Entradas (Post-Render)

```markdown
### [YYYY-MM-DD] Render ID / Producción: <Nombre del Vídeo>
- **Puntuación Critic Gate**: Media X.X / 10 (Layout: X.X | Timing: X.X | Tipografía: X.X | Audio-Sync: X.X)
- **Errores de Layout Corregidos**:
  - [Escena X, Frame Y]: <Descripción del solapamiento o desborde y ajuste de coordenadas>
- **Desviaciones de Timing / ElevenLabs**:
  - [Escena X]: <Ritmo en palabras/s, leading/trailing silence detectado por ffprobe y ajuste de offset>
- **Regla Permanente Añadida**:
  - <Directriz accionable para evitar recurrencia en próximos renders>
```
