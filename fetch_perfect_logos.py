import os
import urllib.request
import json
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

svg_dir = "/Users/erdelyipeter/.gemini/antigravity/playground/retrograde-helix/autonexus/public/brands"

# Let's map the brands to possible iconify brand IDs
# simple-icons removes hyphens
def get_clean_name(brand):
    return brand.replace("-", "").replace(" ", "").lower()

brands = [
    "alfa-romeo", "audi", "bmw", "chevrolet", "citroen", "dacia", "daewoo", "dodge", "fiat", "ford", 
    "honda", "hyundai", "infiniti", "isuzu", "iveco", "jaguar", "jeep", "kia", "lada", "lancia", 
    "land-rover", "lexus", "mazda", "mercedes", "mini", "mitsubishi", "nissan", "opel", "peugeot", 
    "renault", "saab", "scania", "seat", "skoda", "smart", "subaru", "suzuki", "toyota", "volkswagen", "volvo"
]

def search_icon(brand):
    clean = get_clean_name(brand)
    # Priority: simple-icons (strictly brands), then mdi (material), then generic search
    queries = [
        f"simple-icons:{clean}",
        f"cib:{clean}",
        f"mdi:{clean}",
        f"fa6-brands:{clean}",
        f"arcticons:{clean}"
    ]
    
    for q in queries:
        prefix, name = q.split(":")
        url = f"https://api.iconify.design/{prefix}/{name}.svg"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx) as response:
                if response.status == 200:
                    return response.read().decode()
        except:
            continue
            
    # Generic search as fallback
    try:
        search_url = f"https://api.iconify.design/search?query={brand}&limit=3"
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            icons = data.get("icons", [])
            for icon in icons:
                # prefer simple-icons or cib
                if icon.startswith("simple-icons:") or icon.startswith("cib:"):
                    prefix, name = icon.split(":")
                    url = f"https://api.iconify.design/{prefix}/{name}.svg"
                    req2 = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req2, context=ctx) as r2:
                        return r2.read().decode()
    except:
        pass
        
    return None

def process_svg(svg):
    # Make sure it's white
    svg = svg.replace('currentColor', 'white').replace('#000000', 'white').replace('#000', 'white')
    # Remove hardcoded dimensions to let CSS scale it naturally
    svg = re.sub(r'width="[^"]+"', 'width="100%"', svg)
    svg = re.sub(r'height="[^"]+"', 'height="100%"', svg)
    # Ensure viewbox is preserved
    return svg

success_count = 0
for brand in brands:
    svg_content = search_icon(brand)
    if svg_content:
        processed = process_svg(svg_content)
        file_path = os.path.join(svg_dir, f"{brand}.svg")
        with open(file_path, "w") as f:
            f.write(processed)
        print(f"✅ Replaced {brand}.svg")
        success_count += 1
    else:
        print(f"❌ Could not find reliable flat icon for {brand}")

print(f"\nSuccessfully replaced {success_count}/{len(brands)} logos.")
