import urllib.request
import json

brands = ["alfa-romeo", "daewoo", "dodge", "saab", "bmw", "fiat", "ford", "lancia", "land-rover", "mini", "peugeot", "scania", "skoda", "subaru", "volvo", "chevrolet"]

for b in brands:
    try:
        url = f"https://api.iconify.design/search?query={b}&limit=5"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            icons = data.get("icons", [])
            print(f"{b}: Found {len(icons)} icons -> {icons}")
    except Exception as e:
        print(f"{b}: Error {e}")
