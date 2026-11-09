"""
scripts/build-leo-rig.py
Constructor determinista v4 (Museo / Cero Artefactos) del Rig 2.5D de Leo (Opción 1).
Mantiene 100% los píxeles originales del cuello, labio superior y medallón,
con apertura bucal lenticular anatómica (comisuras ancladas y centro móvil).
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC_IMAGE = r"C:\Users\Usuario\.gemini\antigravity\brain\34b30ed9-3881-4d85-af2a-ff3f7d612224\leo_diseno_1_relieve_tactil_1794043189385.jpg"
OUT_DIRS = [
    r"C:\Users\Usuario\OneDrive\Documentos\PROYECTOS PYTHON\Autovideo - libros\public\assets\character\leo-v2",
    r"C:\Users\Usuario\OneDrive\Documentos\PROYECTOS PYTHON\AUTOVIDEO\public\assets\character\leo-v2",
]

for d in OUT_DIRS:
    os.makedirs(d, exist_ok=True)

OFFSET_X = 23
OFFSET_Y = 61
SIZE = 640

full_img = Image.open(SRC_IMAGE).convert("RGBA")
hero = full_img.crop((OFFSET_X, OFFSET_Y, OFFSET_X + SIZE, OFFSET_Y + SIZE))
arr = np.array(hero).astype(np.float32)


def pt(x_orig, y_orig):
    return (float(x_orig - OFFSET_X), float(y_orig - OFFSET_Y))


Y_grid, X_grid = np.mgrid[:SIZE, :SIZE]
dist_center = np.sqrt((X_grid - 320.0) ** 2 + (Y_grid - 320.0) ** 2)

rgb = arr[:, :, :3]
r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
luma = 0.299 * r + 0.587 * g + 0.114 * b
warmth = r - b

# Envolvente geométrica estricta del personaje (excluye cualquier borde del medallón)
char_envelope = Image.new("L", (SIZE, SIZE), 0)
env_draw = ImageDraw.Draw(char_envelope)
# Cabeza + pelo + orejas
env_draw.ellipse([pt(218, 118)[0], pt(218, 118)[1], pt(468, 452)[0], pt(468, 452)[1]], fill=255)
# Cuello
env_draw.rectangle([pt(268, 390)[0], pt(268, 390)[1], pt(418, 495)[0], pt(418, 495)[1]], fill=255)
# Hombros y torso (dentro del medallón)
env_draw.polygon(
    [
        pt(265, 452),
        pt(420, 452),
        pt(585, 515),
        pt(585, 670),
        pt(100, 670),
        pt(100, 515),
    ],
    fill=255,
)
in_envelope = np.array(char_envelope) > 128

in_white_collar = (
    (X_grid >= (252 - OFFSET_X))
    & (X_grid <= (432 - OFFSET_X))
    & (Y_grid >= (452 - OFFSET_Y))
    & (Y_grid <= (532 - OFFSET_Y))
)
in_eyes_white = (
    (X_grid >= (262 - OFFSET_X))
    & (X_grid <= (422 - OFFSET_X))
    & (Y_grid >= (285 - OFFSET_Y))
    & (Y_grid <= (312 - OFFSET_Y))
)

is_char = (
    in_envelope
    & (dist_center <= 282.5)
    & ((warmth >= 25.0) | (luma <= 125.0) | in_white_collar | in_eyes_white)
)

char_mask_pil = Image.fromarray((is_char * 255).astype(np.uint8), mode="L")
char_mask_pil = char_mask_pil.filter(ImageFilter.MedianFilter(size=3))
char_alpha = (
    np.array(char_mask_pil.filter(ImageFilter.GaussianBlur(radius=1.0))).astype(
        np.float32
    )
    / 255.0
)

# ============================================================================
# 1. MEDALLÓN LIMPIO (`leo-medallion-bg.png`)
# ============================================================================
# Solo reemplazamos donde está el personaje + su sombra derecha inmediata, manteniendo el bisel original del medallón 100% intacto
bg_arr = arr.copy()
replace_zone = Image.new("L", (SIZE, SIZE), 0)
rz_draw = ImageDraw.Draw(replace_zone)
rz_draw.ellipse([pt(212, 115)[0], pt(212, 115)[1], pt(480, 460)[0], pt(480, 460)[1]], fill=255)
rz_draw.polygon(
    [
        pt(250, 440),
        pt(445, 440),
        pt(580, 520),
        pt(580, 668),
        pt(105, 668),
        pt(105, 520),
    ],
    fill=255,
)
# Limitar al interior del plato del medallón (dist <= 278)
rz_arr = np.array(replace_zone).astype(np.float32) / 255.0
rz_arr = rz_arr * (dist_center <= 279.0).astype(np.float32)
rz_smooth = (
    np.array(
        Image.fromarray((rz_arr * 255).astype(np.uint8), mode="L").filter(
            ImageFilter.GaussianBlur(radius=10.0)
        )
    ).astype(np.float32)
    / 255.0
)

tx = (X_grid - 60.0) / 520.0
ty = (Y_grid - 60.0) / 520.0
clean_r = 246.5 - 8.5 * tx - 3.5 * ty
clean_g = 242.5 - 8.5 * tx - 3.5 * ty
clean_b = 233.5 - 8.5 * tx - 3.5 * ty

for idx, plane in enumerate([clean_r, clean_g, clean_b]):
    bg_arr[:, :, idx] = bg_arr[:, :, idx] * (1.0 - rz_smooth) + plane * rz_smooth
bg_arr[:, :, 3] = 255.0

# ============================================================================
# 2. CEJAS INDEPENDIENTES (`leo-brow-left.png`, `leo-brow-right.png`)
# ============================================================================
left_brow_poly = [
    pt(254, 285),
    pt(263, 267),
    pt(282, 263),
    pt(324, 268),
    pt(327, 275),
    pt(324, 284),
    pt(280, 280),
]
right_brow_poly = [
    pt(357, 275),
    pt(360, 268),
    pt(402, 263),
    pt(421, 267),
    pt(430, 285),
    pt(404, 280),
    pt(360, 284),
]

brow_l_mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(brow_l_mask).polygon(left_brow_poly, fill=255)
brow_l_mask_s = brow_l_mask.filter(ImageFilter.GaussianBlur(radius=0.8))

brow_r_mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(brow_r_mask).polygon(right_brow_poly, fill=255)
brow_r_mask_s = brow_r_mask.filter(ImageFilter.GaussianBlur(radius=0.8))

brow_left_rgba = arr.copy()
brow_left_rgba[:, :, 3] = np.array(brow_l_mask_s).astype(np.float32)

brow_right_rgba = arr.copy()
brow_right_rgba[:, :, 3] = np.array(brow_r_mask_s).astype(np.float32)

# En `head_clean`, como las cejas solo se elevan hacia arriba (0..4px), solo necesitamos
# rellenar con piel de párpado superior los 5px inferiores de cada ceja (usando el color justo debajo de la ceja)
head_clean = arr.copy()
brows_union = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(brows_union).polygon(left_brow_poly, fill=255)
ImageDraw.Draw(brows_union).polygon(right_brow_poly, fill=255)
brows_erase_arr = (
    np.array(
        brows_union.filter(ImageFilter.MaxFilter(size=3)).filter(
            ImageFilter.GaussianBlur(radius=1.0)
        )
    ).astype(np.float32)
    / 255.0
)

for x in range(int(253 - OFFSET_X), int(432 - OFFSET_X)):
    col_mask = brows_erase_arr[:, x]
    ys = np.where(col_mask > 0.05)[0]
    if len(ys) > 0:
        y_min, y_max = ys[0], ys[-1]
        # Como la ceja se eleva hacia arriba, lo que queda descubierto es el arco superciliar INFERIOR (y_max + 2)
        bot_skin = arr[min(SIZE - 1, y_max + 2), x, :3]
        top_skin = arr[max(0, y_min - 2), x, :3]
        for y in range(y_min, y_max + 1):
            w_b = col_mask[y]
            t_v = (y - y_min) / float(max(1, y_max - y_min))
            skin_blend = top_skin * (1.0 - t_v) * 0.25 + bot_skin * (1.0 - (1.0 - t_v) * 0.25)
            head_clean[y, x, :3] = (
                head_clean[y, x, :3] * (1.0 - w_b) + skin_blend * w_b
            )

# ============================================================================
# 3. MANDÍBULA INFERIOR (`leo-jaw-lower.png`) Y CABEZA (`leo-head-upper.png`)
# ============================================================================
# En `head_clean`, mantenemos el labio superior 100% original (ni un solo píxel tocado por encima de y_orig=384.5).
# Solo en la zona central inferior donde se descubre la boca al bajar el labio inferior (x_orig=295..389, y_orig=383..404)
# extendemos suavemente la piel de las comisuras (295..305 y 379..389) para que no quede rastro del labio inferior fijo.
mouth_under_patch = head_clean.copy()
for x in range(int(292 - OFFSET_X), int(392 - OFFSET_X)):
    # En las esquinas exteriores (292..305 y 379..392), muestreamos piel de la mejilla en y_orig=377
    sample_y = int(377 - OFFSET_Y)
    skin_c = arr[sample_y, x, :3]
    for y in range(int(381 - OFFSET_Y), int(402 - OFFSET_Y)):
        mouth_under_patch[y, x, :3] = skin_c

# Máscara de lo que está DEBAJO de la línea de apertura labial:
# Línea labial: (293, 381) -> (318, 384) -> (342, 385) -> (366, 384) -> (391, 381)
below_upper_lip_mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(below_upper_lip_mask).polygon(
    [
        pt(292, 381.2),
        pt(306, 382.5),
        pt(320, 384.3),
        pt(342, 385.0),
        pt(364, 384.3),
        pt(378, 382.5),
        pt(392, 381.2),
        pt(392, 403.0),
        pt(292, 403.0),
    ],
    fill=255,
)
below_lip_a = (
    np.array(below_upper_lip_mask.filter(ImageFilter.GaussianBlur(radius=0.6))).astype(
        np.float32
    )
    / 255.0
)

for c_i in range(3):
    head_clean[:, :, c_i] = (
        head_clean[:, :, c_i] * (1.0 - below_lip_a)
        + mouth_under_patch[:, :, c_i] * below_lip_a
    )

# Construir `leo-jaw-lower.png`:
# Labio inferior + mentón (desde la línea de apertura labial hasta la punta de la barbilla y=445.5)
jaw_top_mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(jaw_top_mask).polygon(
    [
        pt(290, 381.0),
        pt(305, 382.2),
        pt(320, 384.1),
        pt(342, 384.8),
        pt(364, 384.1),
        pt(379, 382.2),
        pt(394, 381.0),
        pt(396, 447.0),
        pt(288, 447.0),
    ],
    fill=255,
)
jaw_top_a = (
    np.array(jaw_top_mask.filter(ImageFilter.GaussianBlur(radius=0.5))).astype(
        np.float32
    )
    / 255.0
)

jaw_side_mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(jaw_side_mask).polygon(
    [
        pt(294, 380.0),
        pt(390, 380.0),
        pt(394, 408.0),
        pt(382, 433.0),
        pt(364, 443.0),
        pt(342, 446.0),
        pt(320, 443.0),
        pt(302, 433.0),
        pt(290, 408.0),
    ],
    fill=255,
)
jaw_side_a = (
    np.array(jaw_side_mask.filter(ImageFilter.GaussianBlur(radius=2.0))).astype(
        np.float32
    )
    / 255.0
)

jaw_rgba = arr.copy()
jaw_rgba[:, :, 3] = jaw_top_a * jaw_side_a * char_alpha * 255.0

# Máscara de cabeza completa (`leo-head-upper.png`)
head_full_poly = [
    pt(210, 100),
    pt(475, 100),
    pt(470, 365),
    pt(424, 375),
    pt(412, 402),
    pt(396, 422),
    pt(374, 439),
    pt(342, 445.5),
    pt(310, 439),
    pt(288, 422),
    pt(272, 402),
    pt(260, 375),
    pt(215, 365),
]
head_region_mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(head_region_mask).polygon(head_full_poly, fill=255)
head_region_alpha = (
    np.array(head_region_mask.filter(ImageFilter.GaussianBlur(radius=1.0))).astype(
        np.float32
    )
    / 255.0
)

head_upper_rgba = head_clean.copy()
head_upper_rgba[:, :, 3] = head_region_alpha * char_alpha * 255.0

# ============================================================================
# 4. TORSO + CUELLO INTACTO (`leo-torso.png`)
# ============================================================================
torso_rgba = arr.copy()
torso_mask_pil = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(torso_mask_pil).rectangle([0, int(400 - OFFSET_Y), SIZE, SIZE], fill=255)
torso_mask_a = (
    np.array(torso_mask_pil.filter(ImageFilter.GaussianBlur(radius=2.0))).astype(
        np.float32
    )
    / 255.0
)
torso_rgba[:, :, 3] = torso_mask_a * char_alpha * 255.0

layers = {
    "leo-medallion-bg.png": bg_arr,
    "leo-torso.png": torso_rgba,
    "leo-head-upper.png": head_upper_rgba,
    "leo-jaw-lower.png": jaw_rgba,
    "leo-brow-left.png": brow_left_rgba,
    "leo-brow-right.png": brow_right_rgba,
}

for out_dir in OUT_DIRS:
    for filename, data in layers.items():
        Image.fromarray(np.clip(data, 0, 255).astype(np.uint8), mode="RGBA").save(
            os.path.join(out_dir, filename)
        )

print("Museum-grade v4 RGBA layers saved successfully.")
