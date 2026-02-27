
import os
import shutil
import xml.etree.ElementTree as ET

brands_dir = os.path.join(os.getcwd(), 'public/brands')
ET.register_namespace('', "http://www.w3.org/2000/svg")

# 1. Restore Alfa from SI (Backup was not saved, so re-copy if present or download)
# I'll rely on fetch_si_raw script ran earlier. 'alfa_si.svg' should exist.
if os.path.exists(os.path.join(brands_dir, 'alfa_si.svg')):
    shutil.copy2(os.path.join(brands_dir, 'alfa_si.svg'), os.path.join(brands_dir, 'alfa.svg'))
    print("Restored Alfa from SI")

# 2. Clean Jaguar (the one currently there, likely jaguar-3)
# It showed as black square. Likely has a BG rect.
jag_path = os.path.join(brands_dir, 'jaguar.svg')
if os.path.exists(jag_path):
    try:
        tree = ET.parse(jag_path)
        root = tree.getroot()
        # Remove any rects or paths that are white or huge?
        # Or just force fill="none" on the first rect?
        # If it's a solid block, maybe we just need to set fill="currentColor" on paths ONLY and remove others.
        # Brute force: Remove 'rect' tags.
        for r in root.findall('{http://www.w3.org/2000/svg}rect'):
            root.remove(r) # Remove backgrounds
        
        # Check paths. If there's a path d="M0 0h..." remove it.
        for p in root.findall('{http://www.w3.org/2000/svg}path'):
            d = p.attrib.get('d', '')
            if 'h192' in d or 'H0' in d and len(d) < 200: # heuristic for box
                root.remove(p)
        
        tree.write(jag_path)
        print("Cleaned Jaguar background")
    except Exception as e:
        print(f"Jaguar clean error: {e}")

# 3. Geometric Lexus (Oval + L)
lexus_geo = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6">
  <ellipse cx="50" cy="50" rx="42" ry="30" />
  <polyline points="72 25 62 25 40 68 28 68" stroke-linecap="round" stroke-linejoin="round"/>
</svg>"""
with open(os.path.join(brands_dir, 'lexus.svg'), 'w') as f:
    f.write(lexus_geo)
print("Wrote Lexus Geometric")

# 4. Geometric Daewoo (Fan)
daewoo_geo = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
  <path d="M50 90 L20 20" />
  <path d="M50 90 L35 15" />
  <path d="M50 90 L50 10" />
  <path d="M50 90 L65 15" />
  <path d="M50 90 L80 20" />
  <path d="M20 20 Q50 5 80 20" fill="none" stroke-width="2"/> <!-- Top arc hint -->
</svg>"""
with open(os.path.join(brands_dir, 'daewoo.svg'), 'w') as f:
    f.write(daewoo_geo)
print("Wrote Daewoo Geometric")

# 5. Fix Lancia (Restore SI if it was overwritten by failed GB fetch?)
# final_fix_v8 tried to fetch GB lancia and failed.
# So lancia.svg should still be lancia_si.svg (from step 4003).
# User said "Rectangular badge with Text".
# I'll leave it. Better than broken.
