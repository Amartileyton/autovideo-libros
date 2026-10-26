# BRANDING.md — Manual de Identidad Visual Corporativa y Workflow de Gráficos (Canal @en1minuto.es)

> **Constitución Visual del Canal**: Este documento define las directrices estéticas consolidadas, paleta cromática (con tarjetas en amarillo pálido `#FEF9C3`), tipografías (`Plus Jakarta Sans` + `Nunito`), el reloj animado en solitario sin banner inferior y el cuestionario obligatorio de gráficos por diapositiva para todos los vídeos generados por AutoVideo Studio.

---

## 1. Atmósfera, Superficie Base y Tarjetas Amarillo Pálido
- **Modo Predeterminado**: `EDITORIAL_PAPER`
- **Color de Fondo del Lienzo**: `#F8F7F4` (papel cálido de biblioteca / marfil técnico con micro-cuadrícula `#E5E2DC`).
- **Color Oficial de las Tarjetas (`surfaceElevated`)**: **`#FEF9C3` (Amarillo Pálido Editorial)** y **`#FFFBEB` (Crema Amarillo Suave)** para tarjetas secundarias.
  - Todas las tarjetas (`KineticCard`, `ComparisonBattle`, `VectorLoopCircuit`, `ExponentialGrowthChart`, `CtaEndCard` y fichas de escena) llevan fondo amarillo pálido `#FEF9C3` con borde nítido (`2px solid #141413` o `#D94E34`).
- **Tinta Principal**: `#141413` (negro carbón cálido de máxima legibilidad).
- **Tinta Secundaria**: `#575550` (gris editorial para metadatos, autor y descripciones).

---

## 2. Paleta Cromática de Marca
- **Acento Primario (Brand Signature)**: `#D94E34` (Rojo Terracota / Coral Editorial).
  - Usos: Área interior del cronómetro (`OneMinuteStopwatch`), subrayador de citas, barra de progreso superior, palabra activa en subtítulos y llamadas a la acción.
- **Acento Secundario (Datos / Rating)**: `#D97706` (Ámbar cálido para estrellas de Goodreads).
- **Acento Positivo**: `#15803D` / `#16A34A` (Verde esmeralda sobrio para pilares conservados y victorias de hábitos).

---

## 3. Prohibición de Títulos de Fondo de Diapositiva y Barras de Título en Tarjetas (Anti-Clutter)
- **Cero Títulos en el Fondo del Lienzo**: Prohibido colocar bloques de cabecera de escena (`01 / PILOTO AUTOMÁTICO`, `02 / NEUROCIENCIA...` y títulos `<h1>` flotantes en el papel). El lienzo debe permanecer limpio, permitiendo que las tarjetas y gráficos respiren con amplio espacio negativo vertical.
- **Tarjetas Puras sin Barras de Título Superiores**: Prohibido añadir barras superiores internas con viñetas de punto (`● Título de la tarjeta`) o etiquetas redundantes. Cada tarjeta contiene directamente el gráfico, dato visual o cita sin marcos administrativos ni divisores innecesarios.
- **Subtítulos Dinámicos en Pantalla (`DynamicCaptions.tsx`)**: `'Nunito', 'Plus Jakarta Sans', sans-serif` (peso `800` ExtraBold, `52px`).
  - Redondeada, cálida y sin saltos de línea ni vibraciones (*zero-jitter*), situada en `top: 1442px` (`SAFE_ZONE.maxSafeY - 190`).

---

## 4. Reloj Animado en Solitario (`OneMinuteStopwatch`) — Prohibido el Banner Inferior
1. **Eliminación Total del Banner Inferior (`Dock Inferior`)**:
   - El vídeo **NO** incluye ningún banner blanco ni barra de texto en la parte inferior (`bottom: 0`).
2. **Únicamente el Reloj Corriendo con Animación Ligera**:
   - En la zona inferior (`bottom: 48px`) flota **en solitario** el isotipo circular `<OneMinuteStopwatch size={84} mode="header" />` (Opción 1, sin pitorrillo superior).
   - Su área interior terracota (`#D94E34`) avanza radialmente desde las 2:00 ($60^\circ$) hasta completar los $360^\circ$ en tiempo real a lo largo del vídeo, acompañado de una **animación ligera continua** de latido y balanceo (`gentlePulse` + `gentleSwayDeg`).
   - Al entrar la tarjeta final `CtaEndCard` en la Escena 5, el reloj inferior se desvanece suavemente para ceder el protagonismo al reloj Hero central (`size={110}`, `mode="hero"`).
3. **Barra de Progreso Superior (`Top Bar`)**:
   - Línea horizontal de `6px` en la parte superior (`top: 0`, color `#D94E34`), que avanza de `0%` a `100%` durante el vídeo.

---

## 5. Workflow Obligatorio con Cuestionario de Gráficos por Diapositiva (`ask_question`)
Cuando el usuario envía el **título de un libro y su enlace de Goodreads**:
1. Ejecutar `node scripts/book-ingest.mjs --query "<Título>" --url "<URL_Goodreads>"`.
2. **Lanzar obligatoriamente `ask_question`** antes de sintetizar audio o programar escenas para que el usuario elija qué gráfico interactivo quiere en cada una de las 5 diapositivas (`ComparisonBattle`, `VectorLoopCircuit`, `ExponentialGrowthChart`, `KineticCard`, `Efecto Dominó`, `CtaEndCard`).
3. Una vez respondido el cuestionario, ejecutar `node scripts/elevenlabs-sync.mjs` y construir `Scene1.tsx`–`Scene5.tsx`.
