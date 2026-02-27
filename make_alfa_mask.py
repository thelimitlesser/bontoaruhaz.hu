import urllib.request
import base64
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# A known good simple monochrome PNG of alfa romeo from a car logos site
png_url = "https://www.carlogos.org/logo/Alfa-Romeo-symbol-black.png"

try:
    req = urllib.request.Request(png_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        png_data = response.read()
        
    b64_str = base64.b64encode(png_data).decode("utf-8")
    
    # SVG doing a brightness-to-alpha mask, so the black logo shape becomes a white fill
    # Actually, simpler: just embed the PNG, use `filter` to turn all non-transparent pixels white.
    # The filter makes everything white.
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <defs>
    <filter id="white-fill">
      <!-- Matrix to make RGB all 1s (white), preserving alpha -->
      <feColorMatrix type="matrix" values="
        0 0 0 0 1
        0 0 0 0 1
        0 0 0 0 1
        0 0 0 1 0" />
    </filter>
  </defs>
  <image href="data:image/png;base64,{b64_str}" width="1000" height="1000" filter="url(#white-fill)" />
</svg>"""

    with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
        f.write(svg_content)
        
    print("Masked PNG SVG saved successfully.")
except Exception as e:
    print(e)
