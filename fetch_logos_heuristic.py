
import os
import urllib.request
import re
import ssl
import time
import xml.etree.ElementTree as ET

# Brands to hunt
brands = [
    'jaguar', 'dodge', 'daewoo', 'land-rover', 'alfa-romeo', 'lancia', 'lexus', 'saab', 'lada'
]

# WVL Url construction
# https://cdn.worldvectorlogo.com/logos/{slug}.svg
# https://cdn.worldvectorlogo.com/logos/{slug}-1.svg
# ... up to -5

out_dir = os.path.join(os.getcwd(), 'public/brands', 'candidates')
os.makedirs(out_dir, exist_ok=True)

context = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

def get_aspect_ratio(svg_path):
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
        viewBox = root.attrib.get('viewBox')
        width = root.attrib.get('width')
        height = root.attrib.get('height')
        
        if viewBox:
            parts = [float(x) for x in viewBox.split()]
            if len(parts) == 4:
                return parts[2] / parts[3] # w / h
        
        if width and height:
            # Handle px, %, etc? simple parsing
            w = float(re.sub(r'[^\d\.]', '', width))
            h = float(re.sub(r'[^\d\.]', '', height))
            return w / h
            
    except Exception as e:
        print(f"Error parsing {svg_path}: {e}")
    return 0

for brand in brands:
    print(f"--- Hunting {brand} ---")
    best_candidate = None
    best_score = 999 
    # Score = abs(aspect_ratio - 1.0). Closer to 1.0 is better (badge/icon). Wide > 3 is text.
    
    # Try slug, slug-1...slug-5
    variants = [brand] + [f"{brand}-{i}" for i in range(1, 6)]
    # Handle mappings
    if brand == 'land-rover': variants += ['land-rover-1', 'landrover', 'land-rover-logo']
    if brand == 'alfa-romeo': variants += ['alfa-romeo-1', 'alfa-romeo-logo', 'alfa_romeo']
    
    for v in variants:
        url = f"https://cdn.worldvectorlogo.com/logos/{v}.svg"
        local_path = os.path.join(out_dir, f"{v}.svg")
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                content = response.read()
                if len(content) > 100 and b'<svg' in content:
                    with open(local_path, 'wb') as f: f.write(content)
                    
                    ar = get_aspect_ratio(local_path)
                    print(f"  Got {v}.svg (AR: {ar:.2f})")
                    
                    # Ideal AR is around 1.0 to 1.5 (Emblem). 
                    # Jaguar leaper is roughly 2.5:1 ?
                    # Text is > 4:1
                    
                    # Heuristics:
                    # Reject crazy wide
                    if ar > 4.0:
                        print("    -> Too wide (Text)")
                        continue
                        
                    # Calculate 'badge score': how close to 1:1
                    score = abs(ar - 1.0)
                    
                    # Jaguar exception: Leaper is ~2.0
                    if brand == 'jaguar': score = abs(ar - 2.5)
                    
                    if score < best_score:
                        best_score = score
                        best_candidate = local_path
                        
        except Exception as e:
            pass # 404 expected
            
    if best_candidate:
        # Copy to final
        final_dest = os.path.join(os.getcwd(), 'public/brands', f"{brand}_heuristic.svg")
        # Rename for simplicity
        
        # Read/Write
        with open(best_candidate, 'rb') as src, open(final_dest, 'wb') as dst:
            dst.write(src.read())
        print(f"WINNER for {brand}: {os.path.basename(best_candidate)}")
    else:
        print(f"FAILED to find candidate for {brand}")

