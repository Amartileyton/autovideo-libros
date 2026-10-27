# AGENTS.md — Constitución Técnica, Manual Director de Libros `@en1minuto.es` y Protocolo Multiagente (Niveles 0 a 4)

> **Carga Obligatoria en Cada Sesión**: Este documento define el **Workflow Principal de Creación de Vídeos de Libros para `@en1minuto.es`** (con bloqueo obligatorio de cuestionario visual interactivo por diapositiva), las reglas de identidad visual consolidadas (tarjetas en amarillo pálido `#FEF9C3`, títulos de tarjeta limpios, reloj animado en solitario sin banner inferior), la física de movimiento cerrada, sincronización Audio-First con ElevenLabs y el protocolo de 5 Slots.

---

## 0. Manual Director del Workflow Principal de Libros (`@en1minuto.es`) — BLOQUEO DE CUESTIONARIO VISUAL OBLIGATORIO

> [!IMPORTANT]
> **REGLA DE ORO DEL WORKFLOW DE LIBROS (PROHIBIDO SALTARSE EL CUESTIONARIO)**:
> Cuando el usuario solicite crear un vídeo de un libro (enviando el **título del libro y/o su enlace de Goodreads** `https://www.goodreads.com/book/show/...`), está **TERMINANTEMENTE PROHIBIDO** pasar directamente a programar las escenas (`Scene1..5.tsx`) o renderizar el MP4 sin antes ejecutar el **Cuestionario Visual Interactivo (`ask_question`)** para decidir con el usuario qué gráficos y componentes visuales integrar en cada diapositiva.

### 0.1 Las 5 Fases Secuenciales Obligatorias del Pipeline de Libros
Todo vídeo de resumen de libro debe seguir estrictamente este orden secuencial:

1. **FASE 1 — Ingesta Automática desde Goodreads (`scripts/book-ingest.mjs`)**:
   - Ejecutar:
     ```bash
     node scripts/book-ingest.mjs --query "<Título del Libro>" --url "<URL_Goodreads>"
     ```
   - Esto extrae metadatos verificados (autor, rating, número de votos, páginas), descarga la portada real a `public/assets/books/<slug>-cover.jpg` y genera el dossier base en `src/data/book-dossier.json`.
   - Redactar el borrador de las 5 diapositivas/escenas del guion (60–65 segundos totales, ~140–160 palabras) con todos los números escritos en letra en el campo `text`.

2. **FASE 2 — BLOQUEO INTERACTIVO OBLIGATORIO: Cuestionario de Gráficos por Diapositiva (`ask_question`)**:
   - **ANTES de sintetizar el audio en ElevenLabs o escribir código en `src/scenes/Scene1.tsx`–`Scene5.tsx`**, el agente **DEBE** invocar la herramienta `ask_question` presentando al usuario la propuesta de las 5 diapositivas y preguntándole qué componente gráfico desea integrar en cada escena (`Escena 1` a `Escena 5`).
   - **Catálogo de Gráficos Disponibles para ofrecer en el cuestionario (`ask_question`)**:
     - **Diapositiva / Escena 1 (El Gancho + Portada)**:
       - `(Recommended) Portada 2.5D + LiveCounter + ComparisonBattle (Mito vs Realidad)`
       - `Portada 2.5D + Tarjeta Estadística de Impacto (KineticCard + LiveCounter)`
       - `Portada 2.5D + Pregunta Provocadora Subrayada Editorial`
     - **Diapositiva / Escena 2 (La Tesis / El Mecanismo Científico)**:
       - `(Recommended) VectorLoopCircuit (Circuito vectorial de 4 fases con sombreado activo sincronizado a la voz) + KineticCard`
       - `ExponentialGrowthChart (Curva matemática animada en vivo con evolvePath) + LiveCounter`
       - `ComparisonBattle (Confrontación A vs B con tachado dinámico y métrica ganadora)`
     - **Diapositiva / Escena 3 (La Regla de Oro / Evidencia Central)**:
       - `(Recommended) Tarjeta de Cita Subrayada (KineticCard) + Diagrama de Sustitución (Rutina Vieja Tachada vs Nueva Rutina)`
       - `VectorLoopCircuit (Circuito interactivo de transformación) + Cita Editorial`
       - `ExponentialGrowthChart (Gráfico de progresión temporal) + Tarjeta de Evidencia`
     - **Diapositiva / Escena 4 (Las Leyes Accionables / Casos Reales)**:
       - `(Recommended) Cascada de 3 Casos / Leyes Accionables en Tarjetas Amarillo Pálido + Reacción en Cadena (Efecto Dominó)`
       - `ComparisonBattle (Caso de fracaso vs Caso de éxito verificado) + Lista de Leyes`
       - `Matriz de 4 Pilares Prácticos con Checkmarks Verdes`
     - **Diapositiva / Escena 5 (El Manifiesto Final + CTA `@en1minuto.es`)**:
       - `(Recommended) Cita Manifiesto (KineticCard) + Ficha Goodreads con Mini-Portada + CtaEndCard con Cronómetro Hero`
       - `Resumen Ejecutivo de 3 Puntos + CtaEndCard con Cronómetro Hero`
   - **Regla de parada**: El agente se detiene tras lanzar `ask_question` y espera la respuesta del usuario antes de continuar con la Fase 3.

3. **FASE 3 — Sincronización Audio-First con ElevenLabs (`scripts/elevenlabs-sync.mjs`) + Motor Híbrido Inteligente**:
   - Una vez confirmados los gráficos en el cuestionario, guardar `src/data/scenes.json` asignando en cada escena su `layoutPreset` correspondiente (`HOOK_COVER_BATTLE`, `THESIS_LOOP_CIRCUIT`, `RULE_TRANSFORM_CIRCUIT`, `LAWS_DOMINO_CASCADE`, `CTA_MANIFESTO_GOODREADS`, etc.) y las palabras clave `triggerKeyword` en `bookVisualData`.
   - Ejecutar `node scripts/elevenlabs-sync.mjs` para generar `public/audio/scene-1.mp3`..`scene-5.mp3` y los timestamps exactos palabra por palabra en `public/audio/info.json`.
   - El **Auto-Binder Semántico (`src/utils/wordTimingBinder.ts`)** cruza automáticamente `triggerKeyword` con `wordTimestamps` de `info.json` para encender las estaciones del circuito (`VectorLoopCircuit`), lanzar los contadores (`LiveCounter`) y activar las batallas (`ComparisonBattle`) en el fotograma exacto en que el locutor pronuncia cada palabra.

4. **FASE 4 — Construcción de Escenas con las Reglas Visuales Consolidadas (`Scene1.tsx`–`Scene5.tsx`)**:
   - Configurar o personalizar las 5 escenas respetando las **6 Reglas Visuales Inquebrantables de `@en1minuto.es`** (ver Sección 0.2).

5. **FASE 5 — Gate de Previsualización (`remotion still` + `qa:gate`) antes del Render MP4**:
   - Ejecutar `npm.cmd run typecheck` y `npm.cmd run qa:gate` (16/16 checks en verde).
   - Renderizar fotogramas clave (`npx.cmd remotion still`) o pedir confirmación antes de lanzar el render completo de vídeo MP4.

### 0.2 Las 6 Reglas Visuales Inquebrantables de `@en1minuto.es` (Anti-Regresión)
Estas mejoras visuales están integradas en el núcleo del proyecto y **NUNCA** deben revertirse:
1. **PROHIBIDO el Banner Inferior (`Dock Inferior`) y PROHIBIDO CUALQUIER PITIDO O ALARMA AL INICIO**:
   - **Cero Alarmas o Pitidos Iniciales**: Queda terminantemente prohibido incluir alarmas, pitidos (`alarm.mp3`) o efectos sonoros estridentes al fotograma 0. El vídeo debe comenzar en silencio limpio o música suave de fondo. Es condición indispensable para cualquier vídeo producido por este pipeline.
   - El vídeo **NO** tiene ningún banner blanco ni barra inferior con texto en la base del lienzo (`1920px`).
   - En la zona inferior (`bottom: 48px`) aparece **ÚNICAMENTE** el cronómetro circular `<OneMinuteStopwatch size={84} mode="header" />` corriendo en tiempo real (rellenando su sector terracota de $60^\circ$ a $360^\circ$) con una **animación ligera continua** de latido y balanceo suave (`gentlePulse` + `gentleSwayDeg`), hasta que inicia su vuelo hacia la tarjeta final en la Escena 5.
2. **Tarjetas en Color Amarillo Pálido (`#FEF9C3` / `#FFFBEB`)**:
   - Todas las tarjetas de contenido (`KineticCard`, `ComparisonBattle`, `VectorLoopCircuit`, `ExponentialGrowthChart`, `CtaEndCard` y fichas de escenas) usan fondo **amarillo pálido cálido (`#FEF9C3` y `#FFFBEB`)** con borde nítido (`2px solid #141413` o `#D94E34`) sobre el lienzo de papel marfil cuadriculado `#F8F7F4`. Prohibido usar tarjetas blancas puras `#FFFFFF` que pierdan contraste editorial.
3. **PROHIBIDO Títulos de Fondo de Diapositiva y Barras de Título en Tarjetas (Anti-Clutter Visual)**:
   - **Cero Títulos en el Fondo del Lienzo**: Prohibido poner cabeceras o etiquetas flotantes de escena (`01 / PILOTO AUTOMÁTICO`, `02 / NEUROCIENCIA...` y titulares `<h1>` flotantes en el papel). Ocupan entre 150px y 280px de espacio vertical crítico, roban aire y compiten visualmente con los subtítulos y los gráficos.
   - **Tarjetas Puras sin Barras de Título Superiores**: Prohibido añadir barras superiores internas con viñetas (`● Título de la tarjeta`) o etiquetas redundantes. Las tarjetas (`KineticCard`, `VectorLoopCircuit`, `ComparisonBattle`, etc.) contienen directamente el gráfico, dato visual, métrica o cita de manera limpia y directa sin barras decorativas que ensucien el diseño.
4. **Subtítulos `Nunito` ExtraBold en Cápsula Limpia sin Solapamientos**:
   - Los subtítulos dinámicos (`DynamicCaptions.tsx`) usan la fuente redondeada `Nunito` (`fontWeight: 800`, `52px`) centrados en `top: SAFE_ZONE.maxSafeY - 190` (`1442px`), justo por encima del reloj en solitario y sin chocar con las tarjetas ni con el reloj.
5. **Píldoras/Cajas Diferenciadas con Logo Oficial de Goodreads (`GoodreadsBadgeCluster` + `BookCover`)**:
   - **Prohibido usar una sola píldora plana** que mezcle autor, nota de Goodreads y lectores debajo de la portada.
   - Es obligatorio usar `<GoodreadsBadgeCluster />` (`src/components/kinetic/GoodreadsBadgeCluster.tsx`), que despliega **3 cajas independientes con entrada escalonada (`SPRING_SNAPPY`)**:
     1. **Caja 1 (Autor)**: Punto terracota `#D94E34` + nombre del autor en tipografía editorial.
     2. **Caja 2 Protagonista (Goodreads Oficial)**: Logotipo oficial `public/assets/branding/goodreads-logo.png` + divisor + cápsula oscura `#141413` con estrella dorada `★ rating` y pulso de énfasis elástico.
     3. **Caja 3 (Lectores)**: Cifra destacada en terracota (`+585K`) + `lectores`.
   - En la Escena 5 (`Scene5.tsx`), la ficha de reconocimiento del libro también separa la caja de la mini-portada y la caja oficial de Goodreads con el logo `assets/branding/goodreads-logo.png`.
6. **Coherencia Narrativa Estricta 1:1 del CTA Final y Pregunta a la Comunidad**:
   - En la última diapositiva (`Scene5.tsx` y `CtaEndCard`), el botón de acción principal **DEBE coincidir literalmente palabra por palabra con la locución de cierre de ElevenLabs** (ej. si el locutor dice *"Guarda este resumen y empieza hoy mismo"*, la micro-acción debe decir literalmente `GUARDA ESTE RESUMEN Y EMPIEZA HOY MISMO`).
   - **Prohibido incluir etiquetas meta como `"VÍNCULO CTA"`** o badges redundantes como `"TIEMPO CUMPLIDO · 1 MINUTO DESTILADO"`. La pregunta comunitaria debe ligar directamente la acción: *"Para empezar hoy mismo tras guardar el resumen: ¿cuál es el mal hábito que vas a sustituir?"*, en tipografía limpia y sin cajas de texto sobrantes.
7. **Ascenso Dinámico del Reloj Footer a la Tarjeta Final (Hero Stopwatch Docking)**:
   - El cronómetro circular del footer **NO** debe desvanecerse con un fade-out estático. En la Escena 5, el reloj inicia su vuelo con anticipación (~80-85 frames antes de concluir el vídeo) con un suave suavizado cúbico continuo, ascendiendo desde `bottom: 48px` (`Y = 1788px`) hasta acoplarse con precisión milimétrica en la ranura superior de `CtaEndCard` (`clockY = 603px`), expandiendo su tamaño de `84px` a `110px` y activando su modo `hero` (relleno al 100% de $360^\circ$) exactamente en el fotograma en que el locutor dice la primera palabra del CTA ("Guarda este resumen...").
8. **Tamaño, Anchura y Protagonismo Máximo de Tarjetas (Anti-Microtexto en Móvil)**:
   - Las tarjetas de contenido (`KineticCard`, `ComparisonBattle`, `ExponentialGrowthChart`, `CtaEndCard`) ocupan **protagonismo dominante en pantalla** con márgenes de seguridad de `left: 54px, right: 54px` (ancho neto de **972px** en el lienzo 9:16).
   - Prohibido el texto enano: los cuerpos de texto deben tener entre `20px` y `24px` con peso `600/700`, los títulos `28px` a `36px` (`fontWeight: 800/900`) y las métricas numéricas `60px` a `76px`.
9. **Sincronización Estricta del Tachado Editorial (Anti-Tachado Prematuro)**:
   - En componentes de confrontación o descarte (`ComparisonBattle`), la opción descartada debe permanecer completamente limpia y legible desde su entrada. El tachado dinámico en rojo y el sello `DESCARTADO ✗` deben activarse **única y exclusivamente en el fotograma exacto en que la voz pronuncia la palabra clave de descarte** (usando `currentFrame` relativo a la escena).
10. **Parches Dinámicos / Stickers con Rebote en la Escena 1**:
    - Para evitar aperturas estáticas en los primeros segundos del vídeo, las insignias de autor, valoración de Goodreads y comunidad de lectores se estampan como parches editoriales escalonados (con inclinaciones sutiles tipo sticker `[-2.5°, +3.2°, -2°]` y rebote de impacto `scale(1.45) ➔ scale(1.0)`).
11. **Diagramas de Flujo Verticales Descendentes para Leyes (De Arriba Hacia Abajo)**:
    - En la presentación de leyes o principios accionables (Escena 4), queda descartado el dominó horizontal y las flechas curvadas/feas; se implementa una estructura vertical descendente de arriba hacia abajo (Ley 01 Arriba ➔ Ley 02 Centro ➔ Ley 03 Abajo). Cada tarjeta se conecta a la siguiente mediante un **indicador de flujo vertical recto** que nace del centro del vértice inferior de la tarjeta y desciende recto hacia el centro de la tarjeta inferior, animado estrictamente de arriba hacia abajo con punta de flecha limpia.
12. **Llenado Vertical Equilibrado del Lienzo 9:16 (Anti-Concentración Superior)**:
    - Queda estrictamente prohibido apelotonar los elementos en el tercio o mitad superior de la pantalla dejando un vacío en la zona inferior. En todas las escenas, el contenido debe distribuirse de forma armónica desde `top: 70–90px` hasta `top: 1300–1340px`, dejando el margen de seguridad para los subtítulos dinámicos (`1442px`).
13. **Pre-Roll de Audio de 12 Fotogramas (Anti-Clipping de Audio Inicial)**:
    - Para garantizar que la primera sílaba o palabra inicial (ej. "¿Por qué...") nunca sea cercenada por retardos de buffer de audio de los motores de renderizado, el timeline maestro en `Root.tsx` y `Video.tsx` debe iniciar con un margen de pre-roll de 12 fotogramas (`initialLead = 12`), desplazando suavemente la entrada del audio y los subtítulos para una audición cristalina.

---

## 1. Reglas Inquebrantables del Estudio Vectorial (`@resultaaquee` + `TrendForge` — Nivel 2)

### 1.1 Sistema de Movimiento Cerrado y paquetes oficiales
- **Prohibido CSS `transition` o `@keyframes`**: Ningún componente puede animarse mediante hojas de estilo o clases utilitarias de transición.
- **Determinismo por Fotograma**: Todo movimiento depende exclusivamente de `useCurrentFrame()`, `@remotion/paths` (`evolvePath`, `interpolatePath`), `@remotion/noise` (`noise2D` para micropartículas en suspensión) y `d3-delaunay` (para mallas y regiones de impacto dinámicas).
- **Extrapolación Acotada**: Toda llamada a `interpolate()` debe incluir obligatoriamente `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }` (constante `CLAMP_EXTRAPOLATION` en `src/theme/motion.ts`).

### 1.2 Dos Únicas Físicas `spring()` Permitidas + Rack-Focus Óptico
Importadas exclusivamente desde `src/theme/motion.ts`:
1. **`SPRING_SNAPPY = { damping: 20, stiffness: 200, mass: 0.8 }`**
   - Uso exclusivo: Entradas de UI, marcos de selección vectorial (`VectorSelectionBox`), cotas (`DimensionRuler`, `LeaderLineCallout`), contadores numéricos y tachados de hipótesis.
2. **`SPRING_CAMERA = { damping: 30, stiffness: 90, mass: 1.2 }`**
   - Uso exclusivo: Movimientos panorámicos, zooms fractales y transiciones del `CameraRig` sobre el lienzo continuo, acompañados opcionalmente del desenfoque óptico breve de cambio de foco (`rackFocusBlur` de 10 fotogramas en `CameraRig.tsx`).

### 1.3 Regla "Zero-Box" y los 5 Modos de Superficie (`BLUEPRINT_THEMES`)
- **Prohibido encerrar las escenas en cajas `RoughCard` genéricas**: Los vectores y experimentos flotan directamente sobre la cuadrícula técnica milimetrada con amplio espacio negativo ($\ge 45\%$ del lienzo libre) y continuidad de objeto (el mismo objeto se inclina en 2.5D, se abre en capas, pasa a modo Rayos X o hace zoom fractal).
- **5 Modos de Laboratorio Visual (`src/theme/motion.ts` y `BlueprintSurface`)**:
  1. `BLUEPRINT_BLUE` (*Ref 1 — 1.000 botellas*): Azul ingeniería `#15457A`, cuadrícula milimetrada doble, telemetría en esquinas (`CornerHudTelemetry`) y acentos ocre `#FBBF24`.
  2. `DARK_CAD_XRAY` (*Ref 2 Teclado iPhone & Ref 3 Gancho del Metro*): Gris carbón `#111111`, vista explosionada 2.5D (`ExplodedLayerStack`), corte Rayos X cian `#38BDF8`, cotas ámbar `#F59E0B` (`DimensionRuler`, `LeaderLineCallout`), cajón de dataset (`DatasetTerminalDrawer`) y marco de selección vectorial azul `#3B82F6` (`VectorSelectionBox`).
  3. `TOPOLOGY_WIREFRAME` (*Ref 4 — Topología de la pajita*): Negro petróleo `#0A0E12`, marcador superior de hipótesis (`HypothesisScoreboard`: `[2] [1] [0]`), mallas translúcidas con bocas en verde `#22C55E` y huecos/tachados en rosa `#EC4899`.
  4. `CHRONO_OSCILLOSCOPE` (*Ref 5 — Cronofotografía de las palomas*): Papel carbón `#1E1D1B` con bordes laterales de papel rasgado, estroboscopio (*onion-skinning*) con dianas rojas (`TargetReticle`) arriba y gráfica posición-tiempo en vivo (`LiveTelemetryGraph`) abajo conectada por línea punteada vertical.
  5. `EDITORIAL_PAPER` (`#F8F7F4`): Papel técnico cálido con tarjetas en amarillo pálido (`#FEF9C3`) para resúmenes de libros `@en1minuto.es`.

### 1.4 Zona Segura Vertical (9:16 — 1080x1920 @ 30fps)
- **85% Superior Activo**: Todo texto, subtítulo y vector clave debe situarse por encima de `y = 1632px`.
- **Reserva Inferior de 288px**: Los `288px` inferiores (`1632px` a `1920px`) están estrictamente reservados para la interfaz nativa de Reels / TikTok / Shorts (con el reloj `<OneMinuteStopwatch />` corriendo en solitario en `bottom: 48px`).
- **Padding Lateral**: Mínimo `96px` a izquierda y derecha (`x` dentro del rango `[96, 984]`).

### 1.5 Regla de Locución, Voz Canónica y Subtítulos (`DynamicCaptions.tsx`)
- **Voz Canónica Reciclada de TrendForge**: `ELEVENLABS_VOICE_ID = "RwzBDEn5f6FIgpAjH9YN"` (*"Gabriel Blanco — Voz Canónica de Leo"*), calibrada con `stability: 0.70`, `similarity_boost: 0.75`, `style: 0.05`, `use_speaker_boost: true`, modelo `eleven_multilingual_v2` y preprocesador `preprocessForTts`.
- **4 Variantes de Subtítulos Sin Vibración (`DynamicCaptions.tsx`)**:
  - `variant="editorial-clean"` (**Predeterminado para Libros `@en1minuto.es`**): Fuente `Nunito` ExtraBold (`52px`), texto oscuro `#141413` y palabra activa en Terracota `#D94E34` sobre papel `#F8F7F4`.
  - `variant="vector-box"` (*Ref 2 & Ref 3*): Ventana progresiva de 5 palabras en el tercio superior (`placement="upper"`) o inferior; palabras de contexto en gris `#8E8E93`, activas en blanco `#FFFFFF` y palabras clave enmarcadas con `VectorSelectionBox` (`#3B82F6` con 4 nodos cuadrados en las esquinas y mástil superior).
  - `variant="ochre-blueprint"` (*Ref 1*): Texto blanco con palabras clave en amarillo ocre `#FBBF24`.
  - `variant="red-pill"` (*Ref 5*): Ventana de 3 palabras bajo el raíl central (`placement="middle"`) con pastilla roja `#DC2626` en la palabra activa.
  - **Cero vibración / cero reflujo**: Prohibido cambiar `padding`, `borderWidth` o `fontWeight` entre la palabra activa y las inactivas; retención de `450ms` en pausas naturales.
- **Dicción en ElevenLabs**: En `src/data/scenes.json`, los números dentro del campo `text` se escriben en letra (p. ej., `"cuarenta por ciento"`) mientras que en el gráfico vectorial se renderiza el valor numérico (`"40%"`).

### 1.6 Procedimiento "Art-First" Obligatorio para los Dibujos (`HeroPropStage` + 15 Blueprints + 27 Reglas)
- **Prohibido dibujar objetos físicos complejos a mano con `<rect>` y `<ellipse>` crudos**: El código React/SVG se usa exclusivamente para **telemetría, cotas (`DimensionRuler`, `LeaderLineCallout`), gráficas en vivo (`LiveTelemetryGraph`), selección vectorial (`VectorSelectionBox`), morphing con `flubber` y cámara**.

---

## 2. Protocolo Multiagente de 5 Slots (`invoke_subagent` — Niveles 3 y 4)

> [!IMPORTANT]
> **Prevención de Colisiones de Escritura**: Google Antigravity no ejecuta *auto-merge* entre agentes que editan el mismo archivo simultáneamente; la última escritura sobrescribe en silencio. Cada Slot tiene **propiedad exclusiva de escritura** sobre su partición de archivos.

| Slot | Tipo de Subagente | Modo Workspace | Responsabilidad Principal | Archivos con Permiso de Escritura Exclusivo |
| :--- | :--- | :--- | :--- | :--- |
| **SLOT 1** | `research` | `inherit` | Ejecuta `scripts/book-ingest.mjs` con el enlace de Goodreads, verifica datos del libro y prepara el cuestionario visual de las 5 escenas. | `public/assets/*`<br>`src/data/book-dossier.json`<br>`src/data/scenes.json` |
| **SLOT 2** | `video-director` (`self`) | `inherit` | Lanza el cuestionario `ask_question` para elegir gráficos por diapositiva, ejecuta `node scripts/elevenlabs-sync.mjs`, calcula el *Frame Budget* real desde `public/audio/info.json` y ensambla el timeline maestro. | `public/audio/*`<br>`public/audio/info.json`<br>`src/Root.tsx`<br>`src/Video.tsx` |
| **SLOT 3** | `self` (*Builder Impar*) | `share` | Programa exclusivamente las escenas impares usando tarjetas en amarillo pálido `#FEF9C3` y los componentes elegidos en el cuestionario. | `src/scenes/Scene1.tsx`<br>`src/scenes/Scene3.tsx`<br>`src/scenes/Scene5.tsx`<br>`src/components/RoughCard.tsx` |
| **SLOT 4** | `self` (*Builder Par*) | `share` | Programa exclusivamente las escenas pares, el aparejo de cámara continua y los subtítulos dinámicos. | `src/scenes/Scene2.tsx`<br>`src/scenes/Scene4.tsx`<br>`src/components/CameraRig.tsx`<br>`src/components/DynamicCaptions.tsx`<br>`src/components/blueprints/ResultaaqueeBlueprints.tsx` |
| **SLOT 5** | `browser` | `/browser` | Abre `http://localhost:3000` o inspecciona fotogramas con `remotion still`, audita los 16 puntos de calidad y ejecuta el **Critic Gate** ($\ge 8.0$ por dimensión, $\ge 8.5$ de media antes de emitir `DELIVERY AUTHORIZED`). | `references/LESSONS.md`<br>Artefactos de QA / Capturas |
