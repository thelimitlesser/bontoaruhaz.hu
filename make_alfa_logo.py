import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/alfaromeo.svg"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        content = response.read().decode('utf-8')
        content = content.replace('<svg ', '<svg fill="white" width="100%" height="100%" ')
        with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
            f.write(content)
        print("Downloaded flawless simple-icons alfa-romeo SVG")
except Exception as e:
    print(e)
