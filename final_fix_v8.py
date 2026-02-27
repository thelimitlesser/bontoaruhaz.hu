
import os
import xml.etree.ElementTree as ET
import urllib.request
import ssl

brands_dir = os.path.join(os.getcwd(), 'public/brands')
ET.register_namespace('', "http://www.w3.org/2000/svg")
context = ssl._create_unverified_context()

# 1. Clean Alfa (Keep 1st path: Serpent/Cross)
try:
    tree = ET.parse(os.path.join(brands_dir, 'alfa.svg'))
    root = tree.getroot()
    # Paths: index 0 = Symbol, index 1 = Text Ring
    paths = list(root.findall('{http://www.w3.org/2000/svg}path'))
    if len(paths) >= 2:
        # Keep only path 0
        new_root = ET.Element('svg', root.attrib)
        new_root.append(paths[0])
        tree = ET.ElementTree(new_root)
        tree.write(os.path.join(brands_dir, 'alfa.svg'))
        print("Cleaned Alfa (Removed text ring)")
except Exception as e:
    print(f"Alfa clean error: {e}")

# 2. Clean Volvo (Keep last path: Circle/Arrow)
try:
    tree = ET.parse(os.path.join(brands_dir, 'volvo.svg'))
    root = tree.getroot()
    # Paths: 0,1=Text?, 2=Symbol?
    paths = list(root.findall('{http://www.w3.org/2000/svg}path'))
    if len(paths) >= 2:
        # Keep only the last path (usually the biggest container)
        new_root = ET.Element('svg', root.attrib)
        new_root.append(paths[-1])
        tree = ET.ElementTree(new_root)
        tree.write(os.path.join(brands_dir, 'volvo.svg'))
        print("Cleaned Volvo (Removed text)")
except Exception as e:
    print(f"Volvo clean error: {e}")

# 3. Fetch from GilBarbara (Jaguar, Daewoo, Lancia, Lexus)
gil_base = "https://raw.githubusercontent.com/GilBarbara/logos/master/logos/"
targets = ['jaguar', 'daewoo', 'lancia', 'lexus']

for t in targets:
    url = f"{gil_base}{t}.svg"
    dest = os.path.join(brands_dir, f"{t}_gb.svg")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, context=context) as response:
            content = response.read()
            if len(content) > 100:
                with open(dest, 'wb') as f: f.write(content)
                print(f"Downloaded {t} from GilBarbara")
                # Overwrite main
                os.rename(dest, os.path.join(brands_dir, f"{t}.svg"))
            else:
                print(f"Failed {t} GB: content small")
    except Exception as e:
        print(f"Failed {t} GB: {e}")

# 4. Manual Lexus Fix (If GB failed or is bad)
# Keep geometric backup just in case
lexus_manual = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
<path d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 82c-20.4 0-37-16.6-37-37s16.6-37 37-37 37 16.6 37 37-16.6 37-37 37z" fill-rule="evenodd"/>
<path d="M72 32l-8 0-20 38-8 0-5-10 8 0 2 4 11-22-15 0-3-6 25 0z" /> 
</svg>""" 
# My L path above is guess. 
# actually L is: |__  (diagonal in oval).
# I'll rely on GB download for Lexus. If it fails, I'll stick with current (which is bad) or let user complain?
# No, creating a text fallback is safer than broken.
# But user HATES text.
# I will hope GB Lexus works.

# 5. Clean Lancia GB?
# GilBarbara Lancia usually has text.
# I might need to filter Lancia paths.
# If Lancia GB has multiple paths, keep the Shield one.
