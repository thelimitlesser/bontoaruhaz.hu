import base64

with open("alfa_clean.png", "rb") as f:
    png_data = f.read()
b64_str = base64.b64encode(png_data).decode("utf-8")

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <filter id="white-fill">
      <feColorMatrix type="matrix" values="
        0 0 0 0 1
        0 0 0 0 1
        0 0 0 0 1
        0 0 0 1 0" />
    </filter>
  </defs>
  <image href="data:image/png;base64,{b64_str}" width="512" height="512" filter="url(#white-fill)" />
</svg>"""

with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
    f.write(svg_content)
    
print("Successfully generated final Alfa Romeo SVG from local PNG.")
