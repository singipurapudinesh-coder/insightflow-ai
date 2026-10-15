import os
from PIL import Image, ImageDraw

assets_dir = r"C:\Users\singi\.gemini\antigravity\scratch\insightflow-ai\mobile\assets"
os.makedirs(assets_dir, exist_ok=True)

def create_brand_icon(size, filename, bg_color=(15, 23, 42), fg_color=(59, 130, 246)):
    img = Image.new("RGBA", (size, size), bg_color + (255,))
    draw = ImageDraw.Draw(img)
    
    # Draw a stylized modern circular shield & chart bars
    padding = size * 0.15
    center = size / 2
    radius = (size - 2 * padding) / 2
    
    # Inner dark background circle
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill=(30, 41, 59, 255),
        outline=(59, 130, 246, 255),
        width=int(size * 0.03)
    )
    
    # 3 Ascending Bar Chart columns in the center
    bar_width = int(size * 0.1)
    bar_gap = int(size * 0.04)
    start_x = center - (bar_width * 1.5 + bar_gap)
    base_y = center + radius * 0.55
    
    # Heights
    heights = [radius * 0.5, radius * 0.8, radius * 1.1]
    colors = [(59, 130, 246), (99, 102, 241), (139, 92, 246)]
    
    for i, (h, c) in enumerate(zip(heights, colors)):
        bx = start_x + i * (bar_width + bar_gap)
        by = base_y - h
        draw.rounded_rectangle([bx, by, bx + bar_width, base_y], radius=int(size * 0.02), fill=c + (255,))
    
    # Accent star/sparkle at the peak of the 3rd bar
    peak_x = start_x + 2 * (bar_width + bar_gap) + bar_width / 2
    peak_y = base_y - heights[2] - size * 0.05
    sp_size = size * 0.04
    draw.ellipse([peak_x - sp_size, peak_y - sp_size, peak_x + sp_size, peak_y + sp_size], fill=(0, 212, 160, 255))
    
    out_path = os.path.join(assets_dir, filename)
    img.save(out_path, "PNG")
    print(f"Generated {filename} ({size}x{size})")

# Generate standard Expo assets
create_brand_icon(1024, "icon.png")
create_brand_icon(1024, "adaptive-icon.png", bg_color=(15, 23, 42))
create_brand_icon(1024, "splash-icon.png", bg_color=(15, 23, 42))
create_brand_icon(48, "favicon.png")

