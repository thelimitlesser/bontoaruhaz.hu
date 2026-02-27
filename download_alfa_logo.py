import urllib.request
import urllib.error
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# We will try a few known good svg URLs for alfa romeo monochrome
urls = [
    "https://upload.wikimedia.org/wikipedia/commons/2/24/Alfa_Romeo_Automobiles_logo.svg",
    "https://www.carlogos.org/logo/Alfa-Romeo-logo-2015-1920x1080.png"
]

def fetch_svg():
    req = urllib.request.Request("https://upload.wikimedia.org/wikipedia/commons/2/24/Alfa_Romeo_Automobiles_logo.svg", headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print("Failed to download:", e)
        return None

svg_content = fetch_svg()
if svg_content:
    with open("alfa_wiki_color.svg", "w") as f:
        f.write(svg_content)
    print("Downloaded wiki SVG.")
