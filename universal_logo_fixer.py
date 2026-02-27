
import os
import urllib.request
import ssl
import re
import xml.etree.ElementTree as ET

# Configuration
BRANDS_DIR = os.path.join(os.getcwd(), 'public/brands')
ET.register_namespace('', "http://www.w3.org/2000/svg")
CONTEXT = ssl._create_unverified_context()
HEADERS = {'User-Agent': 'Mozilla/5.0'}

# Brand ID to Simple Icons Slug Mapping (Validated slugs)
SI_MAP = {
    "audi": "audi",
    "bmw": "bmw",
    "chevrolet": "chevrolet",
    "citroen": "citroen",
    "dacia": "dacia",
    "fiat": "fiat",
    "ford": "ford",
    "honda": "honda",
    "hyundai": "hyundai",
    "infiniti": "infiniti",
    "iveco": "iveco",
    "jeep": "jeep",
    "kia": "kia",
    "lada": "lada",
    "mazda": "mazda",
    "mini": "mini",
    "mitsubishi": "mitsubishi",
    "nissan": "nissan",
    "opel": "opel",
    "peugeot": "peugeot",
    "porsche": "porsche",
    "renault": "renault",
    "scania": "scania",
    "seat": "seat",
    "skoda": "skoda",
    "smart": "smart",
    "subaru": "subaru",
    "suzuki": "suzuki",
    "tesla": "tesla",
    "toyota": "toyota",
    "volvo": "volvo",
    "volkswagen": "volkswagen"
}

# 1. SPECIAL CASES (Missing from SI or 404)
# These are clean geometric or extracted silhouettes.
SPECIAL_CASES = {
    "alfa-romeo": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="1.5"/>
  <path d="M14 8c1 0 2 1 2 2s-1 2-2 2-2 1-2 2 1 2 2 2" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>""",
    "daewoo": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 2C9.5 2 7 3.5 5.5 5.5s-2 5-1.5 7.5c.5 2.5 2 4.5 4 6l1.5-2.5c-1.5-1-2.5-2.5-2.5-4.5s1-3.5 2.5-4.5c1.5-1 3.5-1 5 0s2.5 2.5 2.5 4.5-1 3.5-2.5 4.5l1.5 2.5c2-1.5 3.5-3.5 4-6 .5-2.5 0-5.5-1.5-7.5S14.5 2 12 2z" fill="currentColor"/>
  <path d="M11 16h2v6h-2z" fill="currentColor"/>
</svg>""",
    "dodge": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M4 18l4-12h4l-4 12zM12 18l4-12h4l-4 12z" fill="currentColor"/>
</svg>""",
    "isuzu": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M8 4h3v16H8zM13 4h3v16h-3z" fill="currentColor"/>
</svg>""",
    "jaguar": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <path d="M105.014 61.975c0-.857.613-1.266 1.838-1.266-.285-.327-.857-.449-1.674-.408-1.227-.041-1.838.572-1.838 1.919l.285 1.225 3.512 7.309-2 3.226h-3.021l-7.84-1.062-4.533.367.898 1.471-1.837 2.205-1.919-.246-1.388-2.694 1.633-2.899 4.002-.979 7.595-.164 4.654.285-1.961-.856-5.389-.98c-1.429-2.083-2.164-3.226-2.164-3.512l1.225-4.94-2.205 2.899c-.775 1.021-1.184 1.715-1.184 2.083-.041.612.613 1.715 1.96 3.348l-2.082-.081-1.429-1.266-1.51-.817-6.125-2.327 1.062-2.123 6.206 2.368 2.042-1.715c.694-.858 1.307-1.878 1.837-3.103-2 1.592-3.43 2.532-4.287 2.776l-6.86-2.572-2.45 4.491c-1.143 2.041-2.572 3.266-4.247 3.634l-.857.122-.245-.326.286-.164c1.184-.368 1.796-1.184 1.878-2.409.082-.939-.163-1.755-.694-2.409-.531-.653-1.306-1.021-2.327-1.103-2.165-.163-3.267.816-3.389 2.939h-.49c-.613-.04-.898-.53-.857-1.47l.286-.735 1.184-1.225-1.184.735-.613.042.122-.368 1.959-1.715 1.144.49 2.001-.163c1.266.081 2.287.571 2.98 1.47.041-.653-.164-1.347-.571-2.042l-.939-.898 1.062-.572 1.715.49c.939.327 1.633.449 2 .368l2.205-1.919 2.776-.857-1.51-.163c-1.511-.082-2.491.163-2.981.775-.531.572-1.062.857-1.511.817l-1.103-.123-1.144-.204-1.143.123-3.594 1.021-.326-.245c-.041-.286.571-.654 1.919-1.062l2.939-.856c2.736-.776 6.207-1.144 10.453-1.103l6.778.122c2.409.164 4.94.776 7.636 1.837l18.373 7.269c4.492 1.756 10.25 4.328 17.271 7.636l8.371 4.165c5.268 2.816 9.596 5.471 13.066 7.961l3.674 2.572c1.594.858 3.268 1.389 4.941 1.553l3.143-.123 1.145.367.408.857c-.082.858-.613 1.307-1.633 1.348l-4.41.204-1.961-2.246-1.307-.776c-1.428-.082-2.326-.285-2.654-.571l-4.939-4.369c-.939-.816-1.756-1.266-2.49-1.307l-4.207-.286c-4.205-4.124-7.35-6.452-9.35-7.023l4.002 3.675 3.021 3.715c.611.857 1.471 1.307 2.572 1.348l4.246.326 5.594 5.104c.49.449 1.104.735 1.797.898l1.959.204 2.002 2.164-1.307 1.266-3.758-.286-6.287-5.675-12.168-.653c-1.756-.123-3.143-.49-4.123-1.021-.775-.368-1.756-1.143-2.859-2.327l-5.635-6.166c-1.266-1.307-2.123-1.96-2.613-2.001l-4.898.286c-3.43.164-6.002.204-7.717.082l-5.553-.817 1.266-2.082 2.572.368 4.939-.246c1.512-.122 2.777-.489 3.799-1.102-1.348.164-3.268.164-5.717.041-2.084-.163-3.758-.49-5.104-.979l-3.961-7.514a1.438 1.438 0 0 1-.161-.655z" fill="currentColor"/></svg>""",
    "lancia": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 2L3 4v14l9 4 9-4V4l-9-2zm0 2.5l7 1.5v11.5l-7 3.1-7-3.1V6l7-1.5z" fill="currentColor"/>
  <circle cx="12" cy="11" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>""",
    "land-rover": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <ellipse cx="12" cy="12" rx="10" ry="6" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M5 12h14" stroke="currentColor" stroke-width="1"/>
</svg>""",
    "lexus": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <ellipse cx="12" cy="12" rx="10" ry="7" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M17 7.5L14 7.5L8.5 16.5L6 16.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>""",
    "mercedes": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M12 2v10l-8.66 5M12 12l8.66 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>""",
    "rover": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5l6 3.5v8l-6 3.5-6-3.5v-8l6-3.5z" fill="currentColor"/>
  <path d="M11 8h2v8h-2z" fill="currentColor"/>
</svg>""",
    "saab": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M12 6c-1.5 0-3 1.5-3 3s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3z" fill="currentColor"/>
  <path d="M11 13h2v4h-2z" fill="currentColor"/>
</svg>"""
}

def clean_svg(svg_path):
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
        
        # 1. Normalize ViewBox (if not already custom)
        if 'viewBox' not in root.attrib:
            root.attrib['viewBox'] = "0 0 24 24"
        root.attrib.pop('width', None)
        root.attrib.pop('height', None)
        
        # 2. Iterate and fix paths
        for elem in root.iter():
            # Force currentColor
            if 'fill' in elem.attrib and elem.attrib['fill'] != 'none':
                elem.attrib['fill'] = "currentColor"
            if 'stroke' in elem.attrib and elem.attrib['stroke'] != 'none':
                elem.attrib['stroke'] = "currentColor"
        
        tree.write(svg_path)
        print(f"Cleaned {os.path.basename(svg_path)}")
    except Exception as e:
        print(f"Error cleaning {svg_path}: {e}")

def download_si(brand_id, slug):
    url = f"https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/{slug}.svg"
    target = os.path.join(BRANDS_DIR, f"{brand_id}.svg")
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=CONTEXT) as response:
            with open(target, 'wb') as f:
                f.write(response.read())
        print(f"Downloaded SI for {brand_id}")
        clean_svg(target)
        return True
    except Exception as e:
        print(f"SI Download failed for {brand_id} ({slug}): {e}")
        return False

# Start process
os.makedirs(BRANDS_DIR, exist_ok=True)

# Write special cases first
for brand_id, content in SPECIAL_CASES.items():
    with open(os.path.join(BRANDS_DIR, f'{brand_id}.svg'), 'w') as f:
        f.write(content)
    print(f"Wrote {brand_id} Special")

for brand_id, slug in SI_MAP.items():
    if brand_id in SPECIAL_CASES:
        continue
    success = download_si(brand_id, slug)
    if not success:
        print(f"FINAL FAILURE: {brand_id}")

print("Fixer process completed.")
