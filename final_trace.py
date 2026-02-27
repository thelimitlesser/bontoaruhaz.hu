from PIL import Image
import os

img = Image.open("alfa_clean.png").convert("RGBA")
mask = Image.new("L", img.size, 255)
pixels = img.load()
mask_pixels = mask.load()

# This png has a black logo on transparent background
for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pixels[x, y]
        if a > 100 and r < 128:
            mask_pixels[x, y] = 0

mask.save("mask.bmp")

os.system("./potrace-1.16.mac-x86_64/potrace mask.bmp -s -o alfa_traced.svg")

with open("alfa_traced.svg", "r") as f:
    svg = f.read()

svg = svg.replace('fill="#000000"', 'fill="white"')
svg = svg.replace('width="', 'data-width="').replace('height="', 'data-height="')
svg = svg.replace('<svg ', '<svg width="100%" height="100%" ')

with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
    f.write(svg)

print("Traced to pure vector successfully.")
