import {
  compileCharacterDelaunayMesh,
  deformCharacterMeshVertices,
  renderCharacterMeshToCanvas,
  type CharacterMeshDefinition,
  type CharacterMeshVertex,
  type CharacterRigState,
  type CharacterVertexGroup,
  type CompiledCharacterMesh,
} from '../../engine/characterAnimationEngine';

export type RigControlState = CharacterRigState;
export type VertexGroup = CharacterVertexGroup;
export type MeshVertexDef = CharacterMeshVertex;
export type PrecomputedMesh = CompiledCharacterMesh;

/**
 * Grafo anatómico de 153 vértices sobre el lienzo maestro 640x640 (`leo-master.png`).
 * - Incluye fila `forehead_buffer` (`v = 185..188`) que aísla al 100% el cabello del movimiento de cejas.
 * - Incluye cejas de espesor rígido (filas superior e inferior de `brow_left` y `brow_right` con igual `zDepth` y `dy`,
 *   garantizando 0.0% de ensanchamiento o deformación de grosor).
 */
export const LEO_MESH_VERTICES: CharacterMeshVertex[] = [
  // 1. ANILLOS DE ANCLAJE DEL MEDALLÓN Y FONDO (Inmóviles: garantizan 0 deformación en el marco)
  { u: 0, v: 0, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 320, v: 0, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 640, v: 0, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 0, v: 320, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 640, v: 320, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 0, v: 640, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 320, v: 640, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 640, v: 640, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },

  // Anillo interior del medallón alrededor de la cabeza (con margen amplio sobre el pelo)
  { u: 155, v: 55, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 320, v: 32, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 485, v: 55, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 145, v: 165, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 495, v: 165, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 140, v: 265, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 500, v: 265, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 155, v: 365, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 485, v: 365, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 95, v: 435, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },
  { u: 545, v: 435, group: 'anchor', jawWeight: 0, zDepth: 0, headWeight: 0 },

  // 2. CORONA DEL CABELLO WAVY QUIFF (Solidaria al cráneo con zDepth uniforme 0.85: 0 rebote vertical)
  { u: 250, v: 82, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 288, v: 68, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 332, v: 66, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 375, v: 75, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 412, v: 98, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  // Volumen medio de las ondas del pelo
  { u: 222, v: 128, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 268, v: 118, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 319, v: 115, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 370, v: 120, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 420, v: 132, group: 'hair_wave', jawWeight: 0, zDepth: 0.85, headWeight: 1 },

  // 3. CRÁNEO Y NACIMIENTO DEL PELO (Mismo zDepth = 0.85 para que pelo y frente sean un bloque sólido)
  { u: 222, v: 168, group: 'cranium', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 256, v: 162, group: 'cranium', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 319, v: 160, group: 'cranium', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 382, v: 162, group: 'cranium', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 416, v: 168, group: 'cranium', jawWeight: 0, zDepth: 0.85, headWeight: 1 },

  // 3B. FILA AMORTIGUADORA DE FRENTE MEDIA (`forehead_buffer`: bloquea el 100% del tirón de cejas hacia el pelo)
  { u: 235, v: 188, group: 'forehead_buffer', jawWeight: 0, zDepth: 0.85, headWeight: 1 },
  { u: 258, v: 185, group: 'forehead_buffer', jawWeight: 0, zDepth: 0.88, headWeight: 1 },
  { u: 285, v: 185, group: 'forehead_buffer', jawWeight: 0, zDepth: 0.90, headWeight: 1 },
  { u: 319, v: 186, group: 'forehead_buffer', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 353, v: 185, group: 'forehead_buffer', jawWeight: 0, zDepth: 0.90, headWeight: 1 },
  { u: 380, v: 185, group: 'forehead_buffer', jawWeight: 0, zDepth: 0.88, headWeight: 1 },
  { u: 403, v: 188, group: 'forehead_buffer', jawWeight: 0, zDepth: 0.85, headWeight: 1 },

  // 4. CEJAS DE ESPESOR RÍGIDO (Borde Superior + Borde Inferior con idéntico desplazamiento y zDepth = 0.92:
  //    los triángulos internos de la ceja se trasladan como cuerpo rígido sin ensancharse jamás)
  // Ceja izquierda — Borde Superior (4 nodos)
  { u: 238, v: 214.0, group: 'brow_left', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 252, v: 204.0, group: 'brow_left', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 274, v: 203.5, group: 'brow_left', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 301, v: 207.5, group: 'brow_left', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  // Ceja izquierda — Borde Inferior (4 nodos)
  { u: 241, v: 223.8, group: 'brow_left', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 255, v: 218.8, group: 'brow_left', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 274, v: 219.2, group: 'brow_left', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 301, v: 221.2, group: 'brow_left', jawWeight: 0, zDepth: 0.92, headWeight: 1 },

  // Entrecejo / Glabela (fijo al cráneo entre ambas cejas)
  { u: 319, v: 208.0, group: 'forehead_buffer', jawWeight: 0, zDepth: 0.98, headWeight: 1 },
  { u: 319, v: 221.0, group: 'forehead_buffer', jawWeight: 0, zDepth: 1.02, headWeight: 1 },

  // Ceja derecha — Borde Superior (4 nodos)
  { u: 336, v: 207.5, group: 'brow_right', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 363, v: 203.5, group: 'brow_right', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 385, v: 204.0, group: 'brow_right', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 399, v: 214.0, group: 'brow_right', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  // Ceja derecha — Borde Inferior (4 nodos)
  { u: 336, v: 221.2, group: 'brow_right', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 363, v: 219.2, group: 'brow_right', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 382, v: 218.8, group: 'brow_right', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 396, v: 223.8, group: 'brow_right', jawWeight: 0, zDepth: 0.92, headWeight: 1 },

  // 5. SISTEMA DE PÁRPADO DE 2 BANDAS (Pliegue tarsal + Borde de pestañas superior -> Párpado inferior)
  // Ojo izquierdo
  { u: 258, v: 224.6, group: 'lid_crease_l', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 273, v: 224.0, group: 'lid_crease_l', jawWeight: 0, zDepth: 0.94, headWeight: 1 },
  { u: 287, v: 224.8, group: 'lid_crease_l', jawWeight: 0, zDepth: 0.92, headWeight: 1 },

  { u: 249, v: 236.5, group: 'lid_low_l', jawWeight: 0, zDepth: 0.82, headWeight: 1 },
  { u: 259, v: 228.5, group: 'lid_up_l', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 273, v: 227.8, group: 'lid_up_l', jawWeight: 0, zDepth: 0.96, headWeight: 1 },
  { u: 286, v: 229.0, group: 'lid_up_l', jawWeight: 0, zDepth: 0.94, headWeight: 1 },
  { u: 296, v: 238.5, group: 'lid_low_l', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 259, v: 243.5, group: 'lid_low_l', jawWeight: 0, zDepth: 0.90, headWeight: 1 },
  { u: 273, v: 244.8, group: 'lid_low_l', jawWeight: 0, zDepth: 0.94, headWeight: 1 },
  { u: 286, v: 243.5, group: 'lid_low_l', jawWeight: 0, zDepth: 0.92, headWeight: 1 },

  // Ojo derecho
  { u: 350, v: 224.8, group: 'lid_crease_r', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 364, v: 224.0, group: 'lid_crease_r', jawWeight: 0, zDepth: 0.94, headWeight: 1 },
  { u: 379, v: 224.6, group: 'lid_crease_r', jawWeight: 0, zDepth: 0.92, headWeight: 1 },

  { u: 341, v: 238.5, group: 'lid_low_r', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 351, v: 229.0, group: 'lid_up_r', jawWeight: 0, zDepth: 0.94, headWeight: 1 },
  { u: 364, v: 227.8, group: 'lid_up_r', jawWeight: 0, zDepth: 0.96, headWeight: 1 },
  { u: 378, v: 228.5, group: 'lid_up_r', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 388, v: 236.5, group: 'lid_low_r', jawWeight: 0, zDepth: 0.82, headWeight: 1 },
  { u: 351, v: 243.5, group: 'lid_low_r', jawWeight: 0, zDepth: 0.92, headWeight: 1 },
  { u: 364, v: 244.8, group: 'lid_low_r', jawWeight: 0, zDepth: 0.94, headWeight: 1 },
  { u: 378, v: 243.5, group: 'lid_low_r', jawWeight: 0, zDepth: 0.90, headWeight: 1 },

  // 6. OREJAS (Parallax inverso zDepth negativo para rotación 3D de la cabeza)
  { u: 214, v: 230, group: 'ear_left', jawWeight: 0, zDepth: -0.25, headWeight: 0.95 },
  { u: 210, v: 262, group: 'ear_left', jawWeight: 0.04, zDepth: -0.25, headWeight: 0.95 },
  { u: 222, v: 294, group: 'ear_left', jawWeight: 0.08, zDepth: -0.20, headWeight: 0.95 },

  { u: 424, v: 230, group: 'ear_right', jawWeight: 0, zDepth: -0.25, headWeight: 0.95 },
  { u: 428, v: 262, group: 'ear_right', jawWeight: 0.04, zDepth: -0.25, headWeight: 0.95 },
  { u: 416, v: 294, group: 'ear_right', jawWeight: 0.08, zDepth: -0.20, headWeight: 0.95 },

  // 7. NARIZ (Puente y Punta con alto relieve zDepth = 1.34)
  { u: 319, v: 238, group: 'nose_bridge', jawWeight: 0, zDepth: 1.12, headWeight: 1 },
  { u: 306, v: 265, group: 'nose_bridge', jawWeight: 0.02, zDepth: 1.08, headWeight: 1 },
  { u: 319, v: 268, group: 'nose_tip', jawWeight: 0.03, zDepth: 1.25, headWeight: 1 },
  { u: 332, v: 265, group: 'nose_bridge', jawWeight: 0.02, zDepth: 1.08, headWeight: 1 },
  { u: 296, v: 291, group: 'nose_tip', jawWeight: 0.08, zDepth: 1.12, headWeight: 1 },
  { u: 319, v: 295, group: 'nose_tip', jawWeight: 0.08, zDepth: 1.34, headWeight: 1 },
  { u: 342, v: 291, group: 'nose_tip', jawWeight: 0.08, zDepth: 1.12, headWeight: 1 },

  // 8. PÓMULOS Y MEJILLAS (Transición elástica suave entre el cráneo fijo y la mandíbula móvil)
  { u: 236, v: 268, group: 'cheek_upper', jawWeight: 0.06, zDepth: 0.65, headWeight: 1 },
  { u: 268, v: 274, group: 'cheek_upper', jawWeight: 0.10, zDepth: 0.88, headWeight: 1 },
  { u: 370, v: 274, group: 'cheek_upper', jawWeight: 0.10, zDepth: 0.88, headWeight: 1 },
  { u: 402, v: 268, group: 'cheek_upper', jawWeight: 0.06, zDepth: 0.65, headWeight: 1 },

  { u: 240, v: 304, group: 'cheek_lower', jawWeight: 0.22, zDepth: 0.68, headWeight: 1 },
  { u: 264, v: 308, group: 'cheek_lower', jawWeight: 0.28, zDepth: 0.90, headWeight: 1 },
  { u: 374, v: 308, group: 'cheek_lower', jawWeight: 0.28, zDepth: 0.90, headWeight: 1 },
  { u: 398, v: 304, group: 'cheek_lower', jawWeight: 0.22, zDepth: 0.68, headWeight: 1 },

  // 9. ANILLO LABIAL DE APERTURA (Split-Seam)
  { u: 290, v: 316.0, group: 'lip_upper_top', jawWeight: 0.10, zDepth: 1.08, headWeight: 1 },
  { u: 304, v: 313.8, group: 'lip_upper_top', jawWeight: 0.08, zDepth: 1.14, headWeight: 1 },
  { u: 319, v: 315.0, group: 'lip_upper_top', jawWeight: 0.08, zDepth: 1.18, headWeight: 1 },
  { u: 334, v: 313.8, group: 'lip_upper_top', jawWeight: 0.08, zDepth: 1.14, headWeight: 1 },
  { u: 348, v: 316.0, group: 'lip_upper_top', jawWeight: 0.10, zDepth: 1.08, headWeight: 1 },

  { u: 277, v: 321.0, group: 'lip_corner_l', jawWeight: 0.34, zDepth: 0.98, headWeight: 1 },
  { u: 360, v: 321.0, group: 'lip_corner_r', jawWeight: 0.34, zDepth: 0.98, headWeight: 1 },

  // Labio Superior — Borde Interno (`lip_seam_up`)
  { u: 288, v: 321.8, group: 'lip_seam_up', jawWeight: 0.22, zDepth: 1.08, headWeight: 1 },
  { u: 302, v: 323.0, group: 'lip_seam_up', jawWeight: 0.14, zDepth: 1.14, headWeight: 1 },
  { u: 319, v: 323.5, group: 'lip_seam_up', jawWeight: 0.10, zDepth: 1.18, headWeight: 1 },
  { u: 336, v: 323.0, group: 'lip_seam_up', jawWeight: 0.14, zDepth: 1.14, headWeight: 1 },
  { u: 350, v: 321.8, group: 'lip_seam_up', jawWeight: 0.22, zDepth: 1.08, headWeight: 1 },

  // Labio Inferior — Borde Interno (`lip_seam_low`)
  { u: 288, v: 323.2, group: 'lip_seam_low', jawWeight: 0.68, zDepth: 1.08, headWeight: 1 },
  { u: 302, v: 324.4, group: 'lip_seam_low', jawWeight: 0.92, zDepth: 1.14, headWeight: 1 },
  { u: 319, v: 324.9, group: 'lip_seam_low', jawWeight: 1.00, zDepth: 1.18, headWeight: 1 },
  { u: 336, v: 324.4, group: 'lip_seam_low', jawWeight: 0.92, zDepth: 1.14, headWeight: 1 },
  { u: 350, v: 323.2, group: 'lip_seam_low', jawWeight: 0.68, zDepth: 1.08, headWeight: 1 },

  // Borde inferior del labio inferior
  { u: 290, v: 330.0, group: 'lip_lower_bot', jawWeight: 0.68, zDepth: 1.06, headWeight: 1 },
  { u: 304, v: 335.0, group: 'lip_lower_bot', jawWeight: 0.90, zDepth: 1.12, headWeight: 1 },
  { u: 319, v: 336.5, group: 'lip_lower_bot', jawWeight: 0.98, zDepth: 1.15, headWeight: 1 },
  { u: 334, v: 335.0, group: 'lip_lower_bot', jawWeight: 0.90, zDepth: 1.12, headWeight: 1 },
  { u: 348, v: 330.0, group: 'lip_lower_bot', jawWeight: 0.68, zDepth: 1.06, headWeight: 1 },

  // 10. PLIEGUE MENTOLABIAL, BARBILLA Y LÍNEA MANDIBULAR
  { u: 266, v: 338.0, group: 'cheek_lower', jawWeight: 0.38, zDepth: 0.85, headWeight: 1 },
  { u: 294, v: 350.0, group: 'chin_crease', jawWeight: 0.78, zDepth: 1.02, headWeight: 1 },
  { u: 319, v: 353.0, group: 'chin_crease', jawWeight: 0.88, zDepth: 1.08, headWeight: 1 },
  { u: 344, v: 350.0, group: 'chin_crease', jawWeight: 0.78, zDepth: 1.02, headWeight: 1 },
  { u: 372, v: 338.0, group: 'cheek_lower', jawWeight: 0.38, zDepth: 0.85, headWeight: 1 },

  { u: 244, v: 332.0, group: 'jaw_angle', jawWeight: 0.22, zDepth: 0.45, headWeight: 0.98 },
  { u: 256, v: 356.0, group: 'jaw_mid', jawWeight: 0.38, zDepth: 0.65, headWeight: 0.98 },
  { u: 278, v: 374.0, group: 'jaw_mid', jawWeight: 0.62, zDepth: 0.85, headWeight: 1.0 },
  { u: 300, v: 382.0, group: 'chin_tip', jawWeight: 0.80, zDepth: 0.98, headWeight: 1.0 },
  { u: 319, v: 384.5, group: 'chin_tip', jawWeight: 0.85, zDepth: 1.05, headWeight: 1.0 },
  { u: 338, v: 382.0, group: 'chin_tip', jawWeight: 0.80, zDepth: 0.98, headWeight: 1.0 },
  { u: 360, v: 374.0, group: 'jaw_mid', jawWeight: 0.62, zDepth: 0.85, headWeight: 1.0 },
  { u: 382, v: 356.0, group: 'jaw_mid', jawWeight: 0.38, zDepth: 0.65, headWeight: 0.98 },
  { u: 394, v: 332.0, group: 'jaw_angle', jawWeight: 0.22, zDepth: 0.45, headWeight: 0.98 },

  // 11. CUELLO SUPERIOR E INFERIOR
  { u: 256, v: 386.0, group: 'neck_upper', jawWeight: 0.18, zDepth: 0.25, headWeight: 0.65 },
  { u: 288, v: 398.0, group: 'neck_upper', jawWeight: 0.42, zDepth: 0.40, headWeight: 0.72 },
  { u: 319, v: 402.0, group: 'neck_upper', jawWeight: 0.48, zDepth: 0.45, headWeight: 0.75 },
  { u: 350, v: 398.0, group: 'neck_upper', jawWeight: 0.42, zDepth: 0.40, headWeight: 0.72 },
  { u: 382, v: 386.0, group: 'neck_upper', jawWeight: 0.18, zDepth: 0.25, headWeight: 0.65 },

  { u: 250, v: 422.0, group: 'neck_lower', jawWeight: 0.05, zDepth: 0.15, headWeight: 0.30 },
  { u: 286, v: 428.0, group: 'neck_lower', jawWeight: 0.12, zDepth: 0.22, headWeight: 0.35 },
  { u: 319, v: 432.0, group: 'neck_lower', jawWeight: 0.15, zDepth: 0.25, headWeight: 0.35 },
  { u: 352, v: 428.0, group: 'neck_lower', jawWeight: 0.12, zDepth: 0.22, headWeight: 0.35 },
  { u: 388, v: 422.0, group: 'neck_lower', jawWeight: 0.05, zDepth: 0.15, headWeight: 0.30 },

  // 12. CUELLO DE CAMISETA Y HOMBROS
  { u: 225, v: 455.0, group: 'torso', jawWeight: 0, zDepth: 0.10, headWeight: 0.08 },
  { u: 275, v: 468.0, group: 'torso', jawWeight: 0, zDepth: 0.15, headWeight: 0.10 },
  { u: 319, v: 474.0, group: 'torso', jawWeight: 0, zDepth: 0.18, headWeight: 0.10 },
  { u: 363, v: 468.0, group: 'torso', jawWeight: 0, zDepth: 0.15, headWeight: 0.10 },
  { u: 413, v: 455.0, group: 'torso', jawWeight: 0, zDepth: 0.10, headWeight: 0.08 },

  { u: 135, v: 525.0, group: 'torso', jawWeight: 0, zDepth: 0.05, headWeight: 0 },
  { u: 235, v: 535.0, group: 'torso', jawWeight: 0, zDepth: 0.10, headWeight: 0 },
  { u: 319, v: 540.0, group: 'torso', jawWeight: 0, zDepth: 0.12, headWeight: 0 },
  { u: 403, v: 535.0, group: 'torso', jawWeight: 0, zDepth: 0.10, headWeight: 0 },
  { u: 505, v: 525.0, group: 'torso', jawWeight: 0, zDepth: 0.05, headWeight: 0 },
];

export const LEO_CHARACTER_MESH_DEF: CharacterMeshDefinition = {
  id: 'leo-v2-relieve-tactil',
  width: 640,
  height: 640,
  cervicalPivot: { x: 319, y: 355 },
  mouthCenterU: 319,
  medallionClip: { cx: 320, cy: 320, r: 291 },
  maxJawDropPx: 16.5,
  maxEyelidDropPx: 14.8,
  vertices: LEO_MESH_VERTICES,
};

export function getLeoDelaunayMesh(): PrecomputedMesh {
  return compileCharacterDelaunayMesh(LEO_CHARACTER_MESH_DEF);
}

export function computeDeformedVertices(state: RigControlState): Float32Array {
  return deformCharacterMeshVertices(LEO_CHARACTER_MESH_DEF, state);
}

export function renderLeoMeshToCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  state: RigControlState,
  variant: 'badge' | 'cutout' | 'card' = 'badge',
  showWireframe = false
): void {
  renderCharacterMeshToCanvas(
    ctx,
    img,
    LEO_CHARACTER_MESH_DEF,
    state,
    variant,
    showWireframe
  );
}
