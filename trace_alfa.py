import urllib.request
import os

# Download potrace binary directly for macos to avoid brew issues
url = "https://master.dl.sourceforge.net/project/potrace/1.16/potrace-1.16.mac-x86_64.tar.gz?viasf=1"
os.system(f"curl -L -o potrace.tar.gz '{url}'")
os.system("tar -xzf potrace.tar.gz")

from PIL import Image

image_path = "/Users/erdelyipeter/.gemini/antigravity/brain/ab71b789-e3b4-4433-acb7-d09bb2c18e6d/6725.png"
img = Image.open(image_path).convert("RGBA")

# Create BW mask
mask = Image.new("L", img.size, 255)
pixels = img.load()
mask_pixels = mask.load()

for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pixels[x, y]
        if a > 100 and b > 50: # The logo is dark blue
            mask_pixels[x, y] = 0

mask.save("alfa_mask.bmp")

# Run potrace
os.system("./potrace-1.16.mac-x86_64/potrace alfa_mask.bmp -s -o alfa_raw.svg ")

# Make it white
with open("alfa_raw.svg", "r") as f:
    svg_data = f.read()

svg_data = svg_data.replace('fill="#000000"', 'fill="#ffffff"')
svg_data = svg_data.replace('width="', 'data-width="').replace('height="', 'data-height="')
svg_data = svg_data.replace('<svg ', '<svg width="100%" height="100%" ')

with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
    f.write(svg_data)

print("Tracing complete! Pure vector Alfa Romeo logo generated.")
