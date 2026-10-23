import math
import os
from PIL import Image, ImageDraw, ImageFont

# Dimensiones y paleta corporativa
BG_COLOR = (248, 247, 244, 255)       # #F8F7F4 (Papel marfil cálido)
BLACK_INK = (20, 20, 19, 255)         # #141413 (Negro carbón)
TERRACOTTA = (217, 78, 52, 255)       # #D94E34 (Rojo terracota corporativo)
TERRACOTTA_LIGHT = (217, 78, 52, 60)  # Terracota translúcido para halo
WHITE = (255, 255, 255, 255)

def draw_clock_face(draw, center, radius, sweep_deg, has_initial_wedge=True, initial_wedge_deg=60, is_large=False):
    cx, cy = center
    bezel_w = 14 if is_large else 8
    
    # 1. Bisel exterior limpio y circular (SIN PITORRILLO SUPERIOR)
    # Sombra sutil
    shadow_offset = 6 if is_large else 3
    draw.ellipse(
        [cx - radius + shadow_offset, cy - radius + shadow_offset, cx + radius + shadow_offset, cy + radius + shadow_offset],
        fill=(225, 222, 215, 120)
    )
    
    # Fondo del dial
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=WHITE, outline=BLACK_INK, width=bezel_w)
    
    # Bisel interior fino
    inner_bezel_r = radius - (16 if is_large else 10)
    draw.ellipse([cx - inner_bezel_r, cy - inner_bezel_r, cx + inner_bezel_r, cy + inner_bezel_r], outline=(230, 228, 222, 255), width=2)
    
    # 2. ÁREA INTERIOR INTEGRADA / AVANZANDO
    # En PIL: angles se miden en sentido horario empezando a las 3:00 (0°).
    # Para empezar a las 12:00, el start_angle es -90°.
    # Un sector de 60° (las 2:00) va de -90° a -30°.
    pie_r = radius - (20 if is_large else 12)
    
    # Si sweep_deg > 0, dibujamos el quesito / área rellena que avanza
    if sweep_deg > 0:
        start_angle = -90
        end_angle = -90 + sweep_deg
        # Dibujamos el sector relleno
        draw.pieslice(
            [cx - pie_r, cy - pie_r, cx + pie_r, cy + pie_r],
            start=start_angle,
            end=end_angle,
            fill=TERRACOTTA,
            outline=TERRACOTTA,
            width=2
        )
    
    # Si estamos en estado de logo base con el área inicial integrada (a las 2:00 = 60°)
    if has_initial_wedge and sweep_deg <= initial_wedge_deg:
        # Aseguramos que el sector inicial de 0 a 60° esté presente
        draw.pieslice(
            [cx - pie_r, cy - pie_r, cx + pie_r, cy + pie_r],
            start=-90,
            end=-90 + initial_wedge_deg,
            fill=TERRACOTTA,
            outline=TERRACOTTA,
            width=2
        )
    
    # 3. Marcas de cuadrante (12 horas / 60 segundos)
    for hour in range(12):
        angle_rad = math.radians(hour * 30 - 90)
        is_cardinal = (hour % 3 == 0)
        is_two = (hour == 2)
        
        tick_len = (26 if is_large else 14) if is_cardinal else (18 if is_large else 10)
        r_outer = radius - (24 if is_large else 14)
        r_inner = r_outer - tick_len
        
        x1 = cx + r_outer * math.cos(angle_rad)
        y1 = cy + r_outer * math.sin(angle_rad)
        x2 = cx + r_inner * math.cos(angle_rad)
        y2 = cy + r_inner * math.sin(angle_rad)
        
        tick_color = TERRACOTTA if is_two else (BLACK_INK if is_cardinal else (140, 138, 134, 255))
        tick_w = (6 if is_large else 3) if is_cardinal or is_two else (3 if is_large else 2)
        draw.line([x1, y1, x2, y2], fill=tick_color, width=tick_w)
    
    # 4. Aguja / Manecilla de precisión
    current_angle_deg = sweep_deg if sweep_deg > 0 else initial_wedge_deg
    needle_rad = math.radians(current_angle_deg - 90)
    
    needle_len = radius - (32 if is_large else 18)
    back_len = 24 if is_large else 12
    
    nx = cx + needle_len * math.cos(needle_rad)
    ny = cy + needle_len * math.sin(needle_rad)
    
    bx = cx - back_len * math.cos(needle_rad)
    by = cy - back_len * math.sin(needle_rad)
    
    # Línea de aguja con punta afilada
    draw.line([bx, by, nx, ny], fill=BLACK_INK, width=(8 if is_large else 4))
    
    # Punta acentuada
    px = cx + (needle_len - (25 if is_large else 14)) * math.cos(needle_rad)
    py = cy + (needle_len - (25 if is_large else 14)) * math.sin(needle_rad)
    draw.line([px, py, nx, ny], fill=TERRACOTTA, width=(9 if is_large else 5))
    
    # 5. Pivote central
    pivot_r = 16 if is_large else 9
    draw.ellipse([cx - pivot_r, cy - pivot_r, cx + pivot_r, cy + pivot_r], fill=BLACK_INK)
    draw.ellipse([cx - pivot_r//2, cy - pivot_r//2, cx + pivot_r//2, cy + pivot_r//2], fill=TERRACOTTA)


def generate_images():
    os.makedirs("public/assets/branding", exist_ok=True)
    brain_dir = r"C:\Users\Admin\.gemini\antigravity\brain\8392cabf-3f3f-441f-a929-989683994fa1"
    os.makedirs(brain_dir, exist_ok=True)
    
    # ==========================================
    # IMAGEN 1: LOGOTIPO OFICIAL EN REPOSO (1200x1200)
    # ==========================================
    img_logo = Image.new("RGBA", (1200, 1200), BG_COLOR)
    draw_logo = ImageDraw.Draw(img_logo)
    
    center_logo = (600, 560)
    radius_logo = 360
    
    # Reloj limpio, SIN PITORRILLO, con el área inicial integrada a las 2:00 (60°)
    draw_clock_face(draw_logo, center_logo, radius_logo, sweep_deg=60, has_initial_wedge=True, initial_wedge_deg=60, is_large=True)
    
    # Textos institucionales debajo
    # Dibujamos tipografía geométrica
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 64)
        font_sub = ImageFont.truetype("arial.ttf", 32)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    draw_logo.text((600, 1010), "@en1minuto.es", fill=BLACK_INK, font=font_title, anchor="mm")
    draw_logo.text((600, 1070), "ISOTIPO OFICIAL · ÁREA DE 1 MINUTO INTEGRADA", fill=TERRACOTTA, font=font_sub, anchor="mm")
    
    logo_path = "public/assets/branding/logo_reloj_area_integrada.png"
    img_logo.save(logo_path)
    img_logo.save(os.path.join(brain_dir, "logo_reloj_area_integrada.png"))
    print(f"Guardado: {logo_path}")
    
    # ==========================================
    # IMAGEN 2: SECUENCIA DE AVANCE DEL ÁREA INTERIOR (1800x600)
    # ==========================================
    img_seq = Image.new("RGBA", (1920, 640), BG_COLOR)
    draw_seq = ImageDraw.Draw(img_seq)
    
    stages = [
        ("0s (Logo Base)", 60, "Área a las 2:00"),
        ("15s (25%)", 90, "Avanza a las 3:00"),
        ("30s (50%)", 180, "Media esfera"),
        ("45s (75%)", 270, "Tres cuartos"),
        ("60s (Final)", 360, "Esfera completa")
    ]
    
    spacing = 1920 // len(stages)
    r_small = 120
    
    try:
        font_stage_title = ImageFont.truetype("arialbd.ttf", 26)
        font_stage_sub = ImageFont.truetype("arial.ttf", 18)
        font_header = ImageFont.truetype("arialbd.ttf", 34)
    except:
        font_stage_title = ImageFont.load_default()
        font_stage_sub = ImageFont.load_default()
        font_header = ImageFont.load_default()
        
    draw_seq.text((960, 50), "COMPORTAMIENTO DINÁMICO: EL ÁREA INTERIOR AVANZA CON EL TIEMPO", fill=BLACK_INK, font=font_header, anchor="mm")
    
    for idx, (title, deg, desc) in enumerate(stages):
        cx = spacing * idx + spacing // 2
        cy = 280
        draw_clock_face(draw_seq, (cx, cy), r_small, sweep_deg=deg, has_initial_wedge=True, initial_wedge_deg=60, is_large=False)
        
        draw_seq.text((cx, 460), title, fill=BLACK_INK, font=font_stage_title, anchor="mm")
        draw_seq.text((cx, 495), desc, fill=TERRACOTTA, font=font_stage_sub, anchor="mm")
        
    seq_path = "public/assets/branding/reloj_area_progreso_secuencia.png"
    img_seq.save(seq_path)
    img_seq.save(os.path.join(brain_dir, "reloj_area_progreso_secuencia.png"))
    print(f"Guardado: {seq_path}")

if __name__ == "__main__":
    generate_images()
