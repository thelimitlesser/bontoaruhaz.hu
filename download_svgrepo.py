import urllib.request
import json
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://www.svgrepo.com/webservice/v1/search?term=alfa+romeo", headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode())
        if data.get("vectors"):
            first_vector = data["vectors"][0]
            download_url = first_vector["download_url"]
            print("Found URL:", download_url)
            
            req2 = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req2, context=ctx) as r2:
                svg = r2.read().decode()
                
                # Make all shapes white
                svg = re.sub(r'fill="[^"]+"', 'fill="white"', svg)
                svg = svg.replace('<svg ', '<svg fill="white" width="100%" height="100%" ')
                
                with open("/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands/alfa-romeo.svg", "w") as f:
                    f.write(svg)
                print("Successfully saved svgrepo logo.")
        else:
            print("No vectors found.")
except Exception as e:
    print(e)
