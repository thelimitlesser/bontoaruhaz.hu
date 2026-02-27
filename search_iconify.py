import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://api.iconify.design/search?query=alfa%20romeo')
try:
    with urllib.request.urlopen(req, context=ctx) as r:
        data = json.loads(r.read().decode())
        icons = data.get('icons', [])
        print("Found icons:", icons)
        for icon in icons[:3]:
            prefix, name = icon.split(':')
            icon_url = f"https://api.iconify.design/{prefix}/{name}.svg"
            req2 = urllib.request.Request(icon_url)
            with urllib.request.urlopen(req2, context=ctx) as r2:
                print(r2.read().decode())
except Exception as e:
    print(e)
