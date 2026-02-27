import urllib.request
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    "https://raw.githubusercontent.com/shunjid/car-logos/master/svg/alfa-romeo.svg",
    "https://raw.githubusercontent.com/freetimelearning/car-logos/master/logos/alfa-romeo.svg",
    "https://cdn.jsdelivr.net/npm/@cardog-icons/svg/mono/alfa-romeo.svg"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            content = response.read().decode('utf-8')
            print(f"Success for {url} - {len(content)} bytes")
            if "cdn.jsdelivr.net" in url:
                with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
                    f.write(content.replace('currentColor', 'white').replace('<svg', '<svg fill="white" width="100%" height="100%"'))
                print("Saved cardog mono vector!")
                break
    except Exception as e:
        print(f"Failed {url}: {e}")
