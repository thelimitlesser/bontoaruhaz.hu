import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# The easiest way to get the exact perfect alfa romeo silhouette is to download one of the many available free vector icon sheets.
url = "https://cdn.iconscout.com/icon/free/png-512/alfa-romeo-2-202758.png"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        with open("alfa_clean.png", "wb") as f:
            f.write(response.read())
        print("Downloaded clean PNG")
except Exception as e:
    print(e)
