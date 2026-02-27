from PIL import Image
import os

image_path = "/Users/erdelyipeter/.gemini/antigravity/brain/ab71b789-e3b4-4433-acb7-d09bb2c18e6d/6725.png"
img = Image.open(image_path).convert("RGBA")

mask = Image.new("L", img.size, 255) # white background
pixels = img.load()
mask_pixels = mask.load()

# The image is dark blue marks on a white/transparent background.
for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pixels[x, y]
        # Dark pixels stand for the logo. White pixels or transparent pixels are background.
        # Average brightness:
        brightness = (r + g + b) / 3
        # If it's solid (a > 100) and dark (brightness < 128), it's the logo.
        if a > 100 and brightness < 128:
            mask_pixels[x, y] = 0 # paint the logo black for potrace

mask.save("alfa_mask_fixed.bmp")

os.system("./potrace-1.16.mac-x86_64/potrace alfa_mask_fixed.bmp -s -o alfa_raw2.svg")

with open("alfa_raw2.svg", "r") as f:
    svg_data = f.read()

svg_data = svg_data.replace('fill="#000000"', 'fill="#ffffff"')
svg_data = svg_data.replace('width="', 'data-width="').replace('height="', 'data-height="')
svg_data = svg_data.replace('<svg ', '<svg width="100%" height="100%" ')

with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
    f.write(svg_data)

print("Tracing fixed and saved to public/brands/alfa-romeo.svg!")
