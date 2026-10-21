# BRANDING.md — Manual de Identidad Visual Corporativa (Canal @en60segundos)

> **Constitución Visual del Canal**: Este documento define las directrices estéticas, paleta cromática, tipografías y componentes fijos acordados para todos los vídeos generados por AutoVideo Studio.

---

## 1. Atmósfera y Superficie Base
- **Modo Predeterminado**: `EDITORIAL_PAPER`
- **Color de Fondo**: `#F8F7F4` (papel cálido de biblioteca / marfil técnico).
- **Textura**: Papel técnico con micro-cuadrícula de ingeniería sutil (`#E6E4DD`) que transmite rigor literario y cercanía física.
- **Tinta Principal**: `#141413` (negro carbón cálido de alta legibilidad).
- **Tinta Secundaria**: `#575550` (gris editorial para metadatos, autor y subtítulos de apoyo).

---

## 2. Paleta Cromática de Marca
- **Acento Primario (Brand Signature)**: `#D94E34` (Rojo Terracota / Coral Editorial — estilo Penguin Classics / Harvard University Press).
  - Usos: Subrayador físico de citas, barra de progreso superior, lomo y ribete del libro 3D, nodos de selección y sellos de veredicto.
- **Acento Secundario (Datos / Rating)**: `#D97706` (Ámbar cálido para estrellas de Goodreads y cifras analíticas).
- **Acento Positivo**: `#15803D` (Verde esmeralda sobrio para leyes aprobadas y victorias de hábitos).

---

## 3. Tipografía y Jerarquía Visual
- **Títulos de Libro, Portadas y Citas Célebres**: `'Newsreader', 'Playfair Display', Georgia, serif`
  - Tono literario clásico, elegante y solemne.
- **Subtítulos en Pantalla y Métricas**: `'Inter', 'IBM Plex Sans', system-ui, sans-serif`
  - Sin serifa, peso `700` (Bold) para lectura instantánea sin fatiga en dispositivos móviles.
- **Datos Técnicos y Cifras de Impacto**: `'JetBrains Mono', 'IBM Plex Mono', monospace`
  - Para porcentajes, tiempos de lectura y telemetría (`+1% diario`, `37.78x`, `25 ms`).

---

## 4. Tarjetas y Contenedores («Fichas Editoriales Artesanales»)
- **Estilo Base**: Recortes tipo ficha de biblioteca sobre el papel cálido.
- **Bordes y Trazos**: Dibujados con trazo orgánico `roughjs` (`roughness: 0.8`, `bowing: 1.2`) y relleno `#FFFFFF` con ligera transparencia.
- **Contraste**: Borde terracota de 2px o gris grafito suave, sin sombras duras ni efectos artificiales de neón.

---

## 5. Subtítulos Dinámicos («Marcador Físico Terracota»)
- **Comportamiento**: Ventana fluida de 3 palabras sin saltos de maquetación (*zero-jitter*).
- **Resaltado de Palabra Activa**: Trazado translúcido estilo rotulador fluorescente terracota (`rgba(217, 78, 52, 0.22)`) situado por detrás de la palabra clave activa.
- **Retención Respiratoria**: Tolerancia de 450 ms para mantener el subtítulo visible durante pausas naturales.

---

## 6. Elementos Fijos de Retención y Branding
1. **Barra de Progreso de Lectura (Top Bar)**:
   - Línea horizontal de 4px en la parte superior activa (`#D94E34`), que avanza progresivamente de 0% a 100% a lo largo de los 60–65 segundos.
2. **Pastilla de Canal (Top Left Header)**:
   - Handle: `@en60segundos` (configurable desde `src/theme/motion.ts` y `scenes.json`).
   - Lema / Badge: `IDEAS CLAVE EN 1 MINUTO`.
3. **Sello de Veredicto (Outro / Escena 5)**:
   - Insignia circular en terracota con la leyenda: `SELECCIÓN EDITORIAL · RECOMENDADO POR @EN60SEGUNDOS`.
