from PIL import Image

image_path = "/Users/erdelyipeter/.gemini/antigravity/brain/ab71b789-e3b4-4433-acb7-d09bb2c18e6d/6725.png"

# We'll just generate an SVG that embeds the image directly, but as a white mask.
# Since the image is just blue/white, we can use CSS filters to make it white.
# However, the user wants a flat white silhouette SVG.
# Using a base64 encoded image with a mask is the most robust way to perfectly preserve this complex shape without OpenCV.
import base64

with open(image_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode()

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <mask id="logo-mask">
      <!-- The image is blue on transparent. We want the blue parts to be white in the mask. -->
      <!-- Since it's an external raster, we can apply a filter to turn non-transparent pixels white -->
      <image href="data:image/png;base64,{encoded_string}" width="500" height="500" filter="url(#solid-white)" />
    </mask>
    <filter id="solid-white">
      <feColorMatrix type="matrix" values="
        0 0 0 0 1
        0 0 0 0 1
        0 0 0 0 1
        0 0 0 1 0" />
    </filter>
  </defs>
  <!-- Fill a white rectangle, but masked by the logo -->
  <rect width="500" height="500" fill="white" mask="url(#logo-mask)" />
</svg>"""

with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
    f.write(svg_content)

print("Created Alfa Romeo SVG with raster mask.")
