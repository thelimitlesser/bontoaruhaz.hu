import urllib.request
import base64
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    "https://cdn.iconscout.com/icon/free/png-256/alfa-romeo-202758.png",
    "https://icons.iconarchive.com/icons/alecive/flatwoken/256/Apps-Alfa-Romeo-icon.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Alfa_Romeo_Automobiles_logo.svg/256px-Alfa_Romeo_Automobiles_logo.svg.png"
]

for png_url in urls:
    try:
        req = urllib.request.Request(png_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            png_data = response.read()
            
        b64_str = base64.b64encode(png_data).decode("utf-8")
        # Ensure it works in CSS filters by changing everything to white
        svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <filter id="white-fill">
      <feColorMatrix type="matrix" values="
        0 0 0 0 1
        0 0 0 0 1
        0 0 0 0 1
        0 0 0 1 0" />
    </filter>
  </defs>
  <image href="data:image/png;base64,{b64_str}" width="256" height="256" filter="url(#white-fill)" />
</svg>"""

        with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
            f.write(svg_content)
        print(f"Success fetched from {png_url}")
        break
    except Exception as e:
        print(f"Failed {png_url}: {e}")
