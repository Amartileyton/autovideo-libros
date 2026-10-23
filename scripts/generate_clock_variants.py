import math
import os
from PIL import Image, ImageDraw, ImageFont

BG_COLOR = (248, 247, 244, 255)
BLACK_INK = (20, 20, 19, 255)
TERRACOTTA = (217, 78, 52, 255)
WHITE = (255, 255, 255, 255)
GRAY_TICK = (160, 158, 152, 255)

def generate_variants():
    os.makedirs("public/assets/branding", exist_ok=True)
    brain_dir = r"C:\Users\Admin\.gemini\antigravity\brain\8392cabf-3f3f-441f-a929-989683994fa1"
    
    img = Image.new("RGBA", (2100, 800), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    try:
        font_h1 = ImageFont.truetype("arialbd.ttf", 36)
        font_name = ImageFont.truetype("arialbd.ttf", 26)
        font_desc = ImageFont.truetype("arial.ttf", 18)
        font_nums = ImageFont.truetype("arialbd.ttf", 20)
    except:
        font_h1 = ImageFont.load_default()
        font_name = ImageFont.load_default()
        font_desc = ImageFont.load_default()
        font_nums = ImageFont.load_default()
        
    draw.text((1050, 50), "PROPUESTAS DE LOGOTIPO: RELOJ LIMPIO (SIN PITORRILLO) CON ÁREA INTEGRADA A LAS 2", fill=BLACK_INK, font=font_h1, anchor="mm")
    
    centers = [(350, 360), (1050, 360), (1750, 360)]
    radius = 180
    
    # -----------------------------------------------------------------
    # VARIANTE 1: MINIMALISTA TÉCNICO (El clásico de precisión)
    # -----------------------------------------------------------------
    cx, cy = centers[0]
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=WHITE, outline=BLACK_INK, width=8)
    
    # Sector interior terracota (12:00 a 2:00 = 60 grados)
    pie_r = radius - 12
    draw.pieslice([cx - pie_r, cy - pie_r, cx + pie_r, cy + pie_r], start=-90, end=-30, fill=TERRACOTTA, outline=TERRACOTTA)
    
    # Ticks
    for h in range(12):
        rad = math.radians(h * 30 - 90)
        is_cardinal = (h % 3 == 0)
        t_len = 16 if is_cardinal else 10
        r_out = radius - 14
        r_in = r_out - t_len
        draw.line([cx + r_out*math.cos(rad), cy + r_out*math.sin(rad), cx + r_in*math.cos(rad), cy + r_in*math.sin(rad)], fill=(BLACK_INK if is_cardinal else GRAY_TICK), width=(4 if is_cardinal else 2))
    
    # Aguja
    needle_rad = math.radians(-30) # 2:00
    draw.line([cx - 16*math.cos(needle_rad), cy - 16*math.sin(needle_rad), cx + (radius-24)*math.cos(needle_rad), cy + (radius-24)*math.sin(needle_rad)], fill=BLACK_INK, width=5)
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=BLACK_INK)
    draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=TERRACOTTA)
    
    draw.text((cx, 600), "Opción 1: Minimalista de Precisión", fill=BLACK_INK, font=font_name, anchor="mm")
    draw.text((cx, 635), "Esfera limpia, ticks sutiles y aguja fija a las 2:00", fill=TERRACOTTA, font=font_desc, anchor="mm")
    draw.text((cx, 660), "El área interior terracota avanza en tiempo real", fill=(100, 98, 94, 255), font=font_desc, anchor="mm")

    # -----------------------------------------------------------------
    # VARIANTE 2: EDITORIAL NUMÉRICO (Con numeración 12 y 2 destacada)
    # -----------------------------------------------------------------
    cx, cy = centers[1]
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=WHITE, outline=BLACK_INK, width=8)
    # Doble aro de diseño suizo
    draw.ellipse([cx - radius + 12, cy - radius + 12, cx + radius - 12, cy + radius - 12], outline=(225, 222, 215, 255), width=2)
    
    # Sector interior terracota
    pie_r2 = radius - 20
    draw.pieslice([cx - pie_r2, cy - pie_r2, cx + pie_r2, cy + pie_r2], start=-90, end=-30, fill=TERRACOTTA, outline=TERRACOTTA)
    
    # Números discretos
    draw.text((cx, cy - radius + 32), "12", fill=BLACK_INK, font=font_nums, anchor="mm")
    rad2 = math.radians(60 - 90)
    draw.text((cx + (radius - 32)*math.cos(rad2), cy + (radius - 32)*math.sin(rad2)), "2", fill=WHITE, font=font_nums, anchor="mm")
    
    # Aguja estilizada
    draw.line([cx - 16*math.cos(needle_rad), cy - 16*math.sin(needle_rad), cx + (radius-30)*math.cos(needle_rad), cy + (radius-30)*math.sin(needle_rad)], fill=BLACK_INK, width=5)
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=BLACK_INK)
    draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=WHITE)
    
    draw.text((cx, 600), "Opción 2: Editorial Clásico", fill=BLACK_INK, font=font_name, anchor="mm")
    draw.text((cx, 635), "Con números '12' y '2' integrados y doble anillo", fill=TERRACOTTA, font=font_desc, anchor="mm")
    draw.text((cx, 660), "Tono culto, tipo reloj de pared de biblioteca", fill=(100, 98, 94, 255), font=font_desc, anchor="mm")

    # -----------------------------------------------------------------
    # VARIANTE 3: SÍNTESIS VECTORIAL PURA (Icono gráfico esencial)
    # -----------------------------------------------------------------
    cx, cy = centers[2]
    # Anillo exterior grueso
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=WHITE, outline=BLACK_INK, width=12)
    
    # Sector terracota de alto impacto
    pie_r3 = radius - 16
    draw.pieslice([cx - pie_r3, cy - pie_r3, cx + pie_r3, cy + pie_r3], start=-90, end=-30, fill=TERRACOTTA, outline=TERRACOTTA)
    
    # Corte fino radial en el límite de las 2:00
    draw.line([cx, cy, cx + pie_r3*math.cos(needle_rad), cy + pie_r3*math.sin(needle_rad)], fill=BLACK_INK, width=4)
    draw.line([cx, cy, cx, cy - pie_r3], fill=BLACK_INK, width=4)
    
    # Punto central sólido
    draw.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=BLACK_INK)
    
    draw.text((cx, 600), "Opción 3: Isotipo Geométrico Puro", fill=BLACK_INK, font=font_name, anchor="mm")
    draw.text((cx, 635), "Sin manecilla tradicional: el propio corte del área guía el ojo", fill=TERRACOTTA, font=font_desc, anchor="mm")
    draw.text((cx, 660), "Ultra-legible como foto de perfil circular pequeña", fill=(100, 98, 94, 255), font=font_desc, anchor="mm")

    out_path = "public/assets/branding/comparativa_reloj_sin_pitorrillo.png"
    img.save(out_path)
    img.save(os.path.join(brain_dir, "comparativa_reloj_sin_pitorrillo.png"))
    print(f"Guardado: {out_path}")

if __name__ == "__main__":
    generate_variants()
