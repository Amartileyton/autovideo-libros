---
name: broll-motion-aesthetic
description: Sistema de diseño y animación de blueprints vectoriales @resultaaquee + TrendForge (BlueprintSurface, VectorSelectionBox, ExplodedLayerStack, LeaderLineCallout, DimensionRuler, HypothesisScoreboard, ChronoStrobe, LiveTelemetryGraph) sincronizado con subtítulos en directo sin vibraciones.
---

# B-Roll Motion Aesthetic & @resultaaquee Visual Blueprints

Esta skill codifica la gramática visual, física de cámara y mecánicas causales extraídas fotograma a fotograma de los 5 vídeos de referencia de `@resultaaquee` (`DeqsgFWIXwU`, `DekLxHqxen5`, `Dege5ORIPxv`, `Den2-R8oUNQ`, `DemzJqioZTv`), combinada con la voz canónica y la sincronización palabra por palabra de `TrendForge`.

---

## 1. Regla de Oro: Escenario Persistente "Zero-Box" (Prohibido Encerrar en Tarjetas)

1. **Prohibido encerrar las ilustraciones en cajas `RoughCard` genéricas**:
   - En `@resultaaquee`, el objeto técnico o experimento flota directamente sobre la cuadrícula milimetrada ocupando el centro del lienzo (`1080x1920`) con al menos un **45% de espacio negativo limpio**.
2. **Continuidad de Objeto (Stateful Object Transformation)**:
   - En lugar de cambiar de diapositiva, **el mismo objeto se transforma en vivo** al compás de la voz:
     - Se inclina en perspectiva 2.5D y se separa en capas (`ExplodedLayerStack`).
     - Se vuelve translúcido en modo Rayos X para mostrar piezas internas (`xrayFill` + `xrayStroke`).
     - Hace zoom fractal de $1 \rightarrow 1.000 \rightarrow 1.048.576$ unidades.
     - Se deforma topológicamente o deja una estela estroboscópica (*onion-skinning*) mientras traza una gráfica en tiempo real.

---

## 2. Los 5 Modos de Superficie (`BLUEPRINT_THEMES` en `src/theme/motion.ts`)

Cada vídeo selecciona un modo de laboratorio visual mediante `<BlueprintSurface mode="..." />`:

1. **`BLUEPRINT_BLUE` (Ref 1 — *1.000 botellas y 10 catadores*)**:
   - Fondo azul ingeniería (`#15457A`) con halo radial (`#1E5A9C`) y cuadrícula milimetrada de doble nivel (`96px` mayor / `24px` menor).
   - Telemetría de esquina (`CornerHudTelemetry`: `BOTELLAS 1.000`, `FIESTA EN 24 H`), matrices binarias de estado (`○ -> ●`) y acentos amarillo ocre (`#FBBF24`).
2. **`DARK_CAD_XRAY` (Ref 2 — *Teclado invisible del iPhone* & Ref 3 — *Gancho del metro*)**:
   - Fondo gris carbón mate (`#111111`) con cuadrícula técnica oscura, halo cálido (`#24201C`) y micropartículas flotantes (`@remotion/noise`).
   - Vista explosionada en capas (`ExplodedLayerStack`: *«lo que ves»* vs *«lo que tocas»*), modo Rayos X cian (`#38BDF8`), cotas de ingeniería ámbar (`DimensionRuler`, `LeaderLineCallout`) y cajón monoespaciado de corpus (`DatasetTerminalDrawer`).
3. **`TOPOLOGY_WIREFRAME` (Ref 4 — *¿Cuántos agujeros tiene una pajita?*)**:
   - Fondo negro petróleo (`#0A0E12`) con marcador persistente de hipótesis arriba (`HypothesisScoreboard`: `[2] [1] [0]`) donde las opciones falsas se tachan en rosa (`#EC4899`) y la ganadora se ilumina en verde (`#22C55E`).
   - Mallas translúcidas con bocas iluminadas y ecuaciones construidas en vivo (`bocas - 1 = ?`).
4. **`CHRONO_OSCILLOSCOPE` (Ref 5 — *Por qué las palomas cabecean*)**:
   - Fondo papel carbón (`#1E1D1B`) con bordes laterales de papel rasgado y cuadrícula rojiza.
   - Mitad superior: estroboscopio con copias fantasma (`opacity: 0.18, 0.35, 0.55`), dianas de puntería rojas (`TargetReticle`) y cronómetro analógico.
   - Mitad inferior: gráfica posición-tiempo en vivo (`LiveTelemetryGraph` con `evolvePath` de `@remotion/paths`) unida al objeto mediante una línea punteada vertical roja.
5. **`EDITORIAL_PAPER` (`#F8F7F4`)**:
   - Papel técnico cálido para piezas editoriales claras o recortes de hemeroteca.

---

## 3. Los 4 Modos de Subtítulos Sin Vibración (`src/components/DynamicCaptions.tsx`)

- **`variant="vector-box"` (Ref 2 & Ref 3)**:
  - Frase progresiva de 5 palabras en el tercio superior (`placement="upper"`) o inferior.
  - Palabras de contexto en gris (`#8E8E93`), palabra activa en blanco (`#FFFFFF`) y palabras clave enmarcadas por `<VectorSelectionBox />` (rectángulo azul `#3B82F6` con 4 nodos cuadrados blancos en las esquinas y mástil superior de rotación).
- **`variant="ochre-blueprint"` (Ref 1)**:
  - Texto blanco sobre azul ingeniería con palabras clave iluminadas en amarillo ocre (`#FBBF24`).
- **`variant="red-pill"` (Ref 5)**:
  - Línea compacta bajo el raíl divisorio (`placement="middle"`) con la palabra activa envuelta en pastilla roja (`#DC2626`) con borde `#FCA5A5`.
- **`variant="editorial-clean"`**:
  - Texto oscuro `#141413` con acento terracota `#D94E34` sobre papel `#F8F7F4`.
- **Garantía Cero Vibración**: Todas las palabras (activas e inactivas) mantienen exactamente el mismo `padding`, `border` (`transparent` cuando está inactivo) y `fontWeight: 700` para impedir cualquier reflujo horizontal.

---

## 4. Procedimiento "Art-First" Obligatorio para los Dibujos (`HeroPropStage` + `flubber` + 15 Blueprints + 27 Reglas)

1. **Separación Estricta entre Ilustración ("El Dibujo") y Telemetría ("El Código")**:
   - **Prohibido dibujar objetos físicos complejos a mano con `<rect>` y `<ellipse>` crudos**.
   - Los objetos protagonistas de cada escena se generan primero con `image-generator` como **Hero Props 3D CAD de alta dirección de arte** (vistas explosionadas 2.5D, cortes Rayos X cian/ámbar, secciones macro científicas, chips de hardware) sin texto incrustado y sobre fondo uniforme `#111111`.
2. **Extracción de Canal Alfa Limpio (`public/assets/props/*.png`)**:
   - Mediante Python (`Pillow` + `numpy`), se convierte el fondo `#111111` en transparencia alfa suave con viñeteado radial, permitiendo que la cuadrícula milimetrada de `BlueprintSurface` se vea a través del objeto sin bordes rectangulares.
3. **Rigging en `<HeroPropStage />` (`src/components/blueprints/ResultaaqueeBlueprints.tsx`)**:
   - Anima la entrada con `SPRING_SNAPPY` + `MOTION_EASING.quartOut` (`LottieFiles/motion-design-skill`).
   - Aplica levitación orgánica determinista (`noise2D` de `@remotion/noise`), contorno CAD que muta continuamente con `flubber`, anillos acústicos concéntricos y barrido láser de Rayos X (`scanBeam`).
   - Alrededor del `HeroPropStage` se conectan las primitivas vectoriales en vivo: `LeaderLineCallout`, `DimensionRuler`, `HypothesisScoreboard`, `TargetReticle`, `LiveTelemetryGraph` y `DatasetTerminalDrawer`.

