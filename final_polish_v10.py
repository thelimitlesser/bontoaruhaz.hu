
import os
import xml.etree.ElementTree as ET

brands_dir = os.path.join(os.getcwd(), 'public/brands')
ET.register_namespace('', "http://www.w3.org/2000/svg")

# 1. Fix Jaguar (Remove M0 0h... path)
jag_path = os.path.join(brands_dir, 'jaguar.svg')
if os.path.exists(jag_path):
    try:
        tree = ET.parse(jag_path)
        root = tree.getroot()
        # Find paths
        paths = list(root.findall('{http://www.w3.org/2000/svg}path'))
        for p in paths:
            d = p.attrib.get('d', '')
            # The box path is M0 0h192...
            if d.startswith('M0 0h') or d.startswith('M0 0H'):
                root.remove(p)
                print("Removed Jaguar BG path")
        tree.write(jag_path)
    except Exception as e:
        print(f"Jaguar fix error: {e}")

# 2. Fix Lexus (Explicit fill/stroke)
lexus_geo = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <ellipse cx="50" cy="50" rx="42" ry="30" fill="none" stroke="currentColor" stroke-width="6"/>
  <polyline points="72 25 62 25 40 68 28 68" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>"""
with open(os.path.join(brands_dir, 'lexus.svg'), 'w') as f:
    f.write(lexus_geo)
print("Wrote Lexus V10")

# 3. Alfa check? 
# Leave it.
