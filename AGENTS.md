# AGENTS.md — Constitución Técnica, Manual Director de Libros `@en1minuto.es` y Protocolo Multiagente (Niveles 0 a 4)

> **Carga Obligatoria en Cada Sesión**: Este documento define el **Workflow Principal de Creación de Vídeos de Libros para `@en1minuto.es`** (con bloqueo obligatorio de cuestionario visual interactivo por diapositiva), las reglas de identidad visual consolidadas (tarjetas en amarillo pálido `#FEF9C3`, títulos de tarjeta limpios, reloj animado en solitario sin banner inferior), la física de movimiento cerrada, sincronización Audio-First con ElevenLabs y el protocolo de 5 Slots.

---

## 0. Manual Director del Workflow Principal de Libros (`@en1minuto.es`) — BLOQUEO DE CUESTIONARIO VISUAL OBLIGATORIO

> [!IMPORTANT]
> **REGLA DE ORO DEL WORKFLOW DE LIBROS (PROHIBIDO SALTARSE EL CUESTIONARIO)**:
> Cuando el usuario solicite crear un vídeo de un libro (enviando el **título del libro y/o su enlace de Goodreads** `https://www.goodreads.com/book/show/...`), está **TERMINANTEMENTE PROHIBIDO** pasar directamente a programar las escenas (`Scene1..5.tsx`) o renderizar el MP4 sin antes ejecutar el **Cuestionario Visual Interactivo (`ask_question`)** para decidir con el usuario qué gráficos y componentes visuales integrar en cada diapositiva.

### 0.1 Las 6 Fases Secuenciales Obligatorias del Pipeline de Libros (De la Ingesta a la Publicación Multiplataforma)
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

6. **FASE 6 — Publicación y Planificación Automatizada Multiplataforma (YouTube Shorts + Instagram Reels)**:
   - **Post-Render & Aprobación Humana**: Tras finalizar el render de vídeo MP4 en la Fase 5 y validar las correcciones visuales con el usuario, el agente activa el pipeline de publicación y programación.
   - **Paso 6.1 — Generación y Previsualización de Metadatos Coordinados**:
     - Ejecutar: `node scripts/publish.mjs --platforms yt,ig --dry-run`
     - Se extraen de forma automatizada desde `src/data/scenes.json`, `src/data/book-dossier.json` y `public/audio/music/music-catalog.json`:
       - **YouTube Shorts**: Título editorial ($\le 95$ caracteres con `#Shorts`), descripción estructurada con propuesta de valor de `@en1minuto.es`, etiquetas (`tags`) educativas y bloque de atribución de música oficial (Kevin MacLeod / CC BY 4.0).
       - **Instagram Reels**: Portada/caption con gancho provocador (`hookText`), síntesis de valor en puntos, anclaje psicológico de guardado, llamada a seguir a `@en1minuto.es`, créditos de audio y hashtags de alta indexación.
   - **Paso 6.2 — Protocolos de Envío 100% Locales (Sin Servidores Externos ni Costes de Infraestructura)**:
     - **YouTube Shorts (`scripts/publish-youtube.mjs`)**: API oficial YouTube Data v3 mediante flujo OAuth 2.0 local con token renovable (`.secrets/youtube-token.json`). Permite subidas privadas (`--privacy private`), ocultas (`--privacy unlisted`), públicas (`--privacy public`) o programación directa en servidores de Google (`--schedule <YYYY-MM-DDTHH:MM:SSZ>`).
     - **Instagram Reels (`scripts/publish-instagram.mjs`)**: Meta Graph API v21.0 mediante el protocolo oficial de **Resumable Upload** (`rupload.facebook.com` con `upload_type=resumable` y cabeceras `Authorization: OAuth`, `offset: 0`, `file_size`). Permite subir el archivo binario MP4 directamente desde el disco duro local a los servidores de Meta sin necesidad de contratar buckets S3/R2 ni pagar servidores intermedios. Incluye sondeo automático de procesamiento (`status_code: FINISHED`) y publicación directa en el feed.
   - **Paso 6.3 — Despacho Unificado y Planificación**:
     - Despachador: `node scripts/publish.mjs --platforms yt,ig [--schedule <ISO_DATE>] [--privacy <mode>] --confirm`
     - Horas recomendadas de publicación: Franja de máxima audiencia para formato libro/desarrollo personal: **19:00 a 21:00 CET** (o programación diferida con `--schedule`).
   - **Paso 6.4 — Trazabilidad e Idempotencia en `publish-log.json`**:
     - Cada subida exitosa se registra en `out/publish/publish-log.json` guardando: timestamp ISO, plataforma (`youtube` / `instagram`), ID de vídeo (`videoId` / `mediaId`), enlaces directos (`shortsUrl`, `videoUrl`, `permalink`) y fichero fuente, previniendo duplicidades y facilitando el seguimiento de analíticas.

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
6. **Fórmula Maestra Obligatoria del CTA Final (Opción 1 + Opción 2 Combinadas: Promesa de Marca + Anclaje Psicológico de Guardado)**:
   - **Cero CTAs genéricos o pasivos**: Queda terminantemente prohibido usar cierres débiles como *"Guarda este resumen y empieza hoy mismo"* o peticiones aisladas como *"Síguenos en..."* sin incentivo egoísta directo para el espectador.
   - **Fórmula de Locución de Cierre Obligatoria (Escena 5 en ElevenLabs)**: Toda locución final debe componerse estrictamente de dos partes coordinadas:
     1. **Anclaje Psicológico de Guardado (Opción 2)**: *"Guarda este resumen para cuando [anclaje de necesidad futura o momento de duda/caos/pereza],..."*
     2. **Promesa de Marca de Alto Valor (Opción 1)**: *"...y sigue a en un minuto punto es para dominar un libro clave cada día."*
     - *Ejemplo (12 Reglas para Vivir)*: *"Guarda este resumen para cuando el caos apriete, y sigue a en un minuto punto es para dominar un libro clave cada día."*
     - *Ejemplo (Hábitos Atómicos)*: *"Guarda este resumen para cuando la pereza aparezca, y sigue a en un minuto punto es para dominar un libro clave cada día."*
     - *Ejemplo (Psicología del Dinero)*: *"Guarda este resumen para cuando la tentación de gastar te ciegue, y sigue a en un minuto punto es para dominar un libro clave cada día."*
   - **Composición Visual Obligatoria de `CtaEndCard` (Coherencia Narrativa 1:1)**:
     - **Titular Hero H3**: Anclaje directo del beneficio o promesa: `GUARDA ESTE RESUMEN PARA CUANDO EL CAOS APRIETE` (o `UN LIBRO CLAVE CADA DÍA EN 60 SEGUNDOS`).
     - **Botón Primario de Seguimiento con Pulso Terracota (`#D94E34`)**: Despliega `🔔 SÍGUENOS EN @EN1MINUTO.ES` acompañado siempre de la propuesta de valor clara: `1 LIBRO CLAVE CADA DÍA EN 60 SEGUNDOS`.
     - **Micro-Acción de Guardado**: Coincide palabra por palabra con el anclaje de audio: `🔖 GUARDA EL RESUMEN`.
     - **Caja de Pregunta Comunitaria Limpia**: Sin etiquetas de relleno (`"VÍNCULO CTA"` ni `"TIEMPO CUMPLIDO"`), conectando directamente la tesis del libro con el espectador en tipografía limpia.
7. **Ascenso Dinámico del Reloj Footer a la Tarjeta Final (Hero Stopwatch Docking)**:
   - El cronómetro circular del footer **NO** debe desvanecerse con un fade-out estático. En la Escena 5, el reloj inicia su vuelo con anticipación (~80-85 frames antes de concluir el vídeo) con un suave suavizado cúbico continuo, ascendiendo desde `bottom: 48px` (`Y = 1788px`) hasta acoplarse con precisión milimétrica en la ranura superior de `CtaEndCard` (`clockY = 603px`), expandiendo su tamaño de `84px` a `110px` y activando su modo `hero` (relleno al 100% de $360^\circ$) exactamente en el fotograma en que el locutor dice la primera palabra del CTA ("Guarda este resumen...").
8. **Kit BIG v3: Tarjetas Grandes, Pocas Palabras, Mucha Animación y Tipografía Móvil Legible**:
   - Las tarjetas de contenido (`PaleCard`, `KineticWords`, `ComparisonBattle`, `VectorLoopCircuit`, `CtaEndCard`) ocupan el **ancho neto completo de 972px** (`left: 54px, right: 54px`).
   - **Tipografía Mínima Legible en Móvil (Kit BIG)**: En pantalla de teléfono (render 1080px escalado a ~390pt), el texto de 20-24px es ilegible. La nueva norma estricta es:
     - **Métricas numéricas y numerales**: `104px` a `124px`.
     - **Títulos y conceptos clave**: `64px` a `88px` (máximo 2 a 4 palabras por titular).
     - **Cuerpo y reglas accionables**: `38px` a `44px` (máximo 6 palabras por línea).
     - **Etiquetas y stickers secundarios**: `30px` a `34px`.
     - **TERMINANTEMENTE PROHIBIDO**: cualquier texto inferior a `30px`.
   - **Menos palabras, más dinamismo**: Eliminar párrafos explicativos en tarjetas; utilizar titulares sintéticos de impacto sincronizados palabra a palabra con la voz (`KineticWords`).
9. **Sincronización Estricta del Tachado Editorial (Anti-Tachado Prematuro)**:
   - En componentes de confrontación o descarte (`ComparisonBattle`), la opción descartada debe permanecer completamente limpia y legible desde su entrada. El tachado dinámico en rojo y el sello `DESCARTADO ✗` deben activarse **única y exclusivamente en el fotograma exacto en que la voz pronuncia la palabra clave de descarte** (usando `currentFrame` relativo a la escena).
10. **Gancho Inmediato desde el Fotograma 0 y Portada en Fase 2 (Anti-Arranque Inerte)**:
    - **Cero Fotogramas Vacíos**: Está terminantemente prohibido arrancar con el lienzo vacío o esperar 2 segundos para mostrar el valor. En el fotograma 0 (aprovechando el pre-roll de 12 frames), la **frase gancho provocadora** ya está visible en pantalla en tipografía gigante (72px-104px) sobre tarjeta `PaleCard` en modo *karaoke* (el texto se enciende con rebote a medida que el locutor pronuncia cada palabra).
    - **Transición a Fase 2 (Portada + Stickers)**: Una vez concluida la frase gancho (~fotograma 80-90), el gancho se compacta hacia la cabecera superior y despliega la portada del libro a gran formato (440x650px) junto a los 3 parches/stickers dinámicos (autor, valoración con fuente y lectores) con rebote `scale(1.45 ➔ 1.0)`.
    - **Fase 3 (Duelo A vs B a Pantalla Completa)**: Duelo de conceptos clave a pantalla completa con tarjetas de 88px sincronizadas a la locución.
11. **Diagramas de Flujo Verticales Descendentes con Conectores Triangulares Geométricos (Sin Texto) para Leyes**:
    - En la presentación de leyes o principios accionables (Escena 4), queda descartado el dominó horizontal y las flechas curvadas/feas; se implementa una estructura vertical descendente de arriba hacia abajo (Ley 01 Arriba ➔ Ley 02 Centro ➔ Ley 03 Abajo).
    - **PROHIBIDO el uso de flechas convencionales y pastillas de texto intermedias**: Queda terminantemente prohibido incluir textos como `"SIGUIENTE ▼"`, `"PASO ▼"` o `"ESCUDO ▼"`, así como puntas de flecha de trazo estándar o flechas complejas que ensucien el diseño.
    - **Conector Triangular Geométrico Obligatorio (Puro y Sin Texto)**: Cada tarjeta se conecta a la siguiente mediante un **conector geométrico triangular invertido (prisma descendente)**:
      - Trazo guía vertical fino punteado (`strokeDasharray="5 3"`, espesor `3px`) que nace del centro de la tarjeta superior y continúa hacia la inferior.
      - **Polígono triangular exterior**: fondo amarillo pálido `#FEF9C3` con borde nítido carbón `2.8px solid #141413`, esquinas redondeadas (`strokeLinejoin="round"`) y sombra suave (`drop-shadow(0 6px 14px rgba(20, 20, 19, 0.12))`).
      - **Polígono triangular interior**: relleno sólido en terracota `#D94E34` (Paso 1 ➔ 2) o ámbar `#D97706` (Paso 2 ➔ 3), apuntando limpio y verticalmente hacia abajo.
      - Animación de entrada con interpolación de escala elástica `scale(0.75 ➔ 1.0)` y opacidad `0 ➔ 1` sincronizada al momento en que la voz pasa al siguiente principio.
12. **Llenado Vertical Equilibrado del Lienzo 9:16 (Anti-Mitades Vacías)**:
    - Queda estrictamente prohibido concentrar los elementos en el 40-50% superior dejando un abismo vacío antes de los subtítulos. En todas las escenas (1 a 5), el contenido gráfico y las tarjetas se extienden de manera armónica desde `top: 70px` hasta `top: 1390px`, respetando la zona segura de subtítulos (`1442px`).
13. **Pre-Roll de Audio de 12 Fotogramas (Anti-Clipping de Audio Inicial)**:
    - Para garantizar que la primera sílaba o palabra inicial nunca sea cercenada por retardos de buffer de audio, el timeline maestro inicia con un margen de pre-roll de 12 fotogramas (`initialLead = 12`), con la tarjeta de gancho ya presente en pantalla desde el fotograma 0.
14. **Música de Fondo Oficial con Audio Ducking Automático y Atribución**:
    - **Música de fondo obligatoria y activa por defecto** (`enableBackgroundMusic = true`): Se utiliza música reconocible, elegante y de libre acceso (ej. `Vibing Over Venus` de Kevin MacLeod bajo licencia CC BY 4.0, o biblioteca de audio de YouTube).
    - **Curva de Audio Ducking Dinámica**: El volumen de la música baja suavemente a `0.06` durante la locución y asciende a `0.16` en pausas y transiciones.
    - **Atribución Transparente**: Se incluye el bloque de atribución de la licencia en la descripción de cada publicación según `public/audio/music/music-catalog.json`.
15. **Transparencia y Verificación de Fuentes en Metadatos**:
    - Toda calificación se presenta en pantalla como "Valoración de lectores" indicando la fuente real (`Goodreads`, `Google Books`, `Open Library`) y fecha de toma del dato (`ratingSource` y `ratingDate`).
    - Prohibido inventar porcentajes o estadísticas en el guion sin respaldo empírico. Las citas deben ser literales con fuente verificable o declaradas explícitamente como tesis del autor.
16. **Pipeline de Publicación Idempotente y Cero Fugas de Credenciales**:
    - **Protección Estricta de Secretos**: Queda terminantemente prohibido imprimir credenciales, tokens OAuth de Google, tokens de Meta Graph API o claves de API en las respuestas de chat o persistirlos fuera de `.secrets/` y `.env`.
    - **Idempotencia y Trazabilidad Obligatoria**: Toda publicación debe ejecutarse a través de los scripts del sistema (`publish.mjs`, `publish-youtube.mjs`, `publish-instagram.mjs`) y quedar registrada en `out/publish/publish-log.json`. Antes de subir cualquier vídeo, el sistema verifica que no haya sido publicado previamente con éxito para prevenir publicaciones duplicadas en los feeds.

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

