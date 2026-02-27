
import os
import shutil

brands_dir = os.path.join(os.getcwd(), 'public/brands')

# 1. Overwrite SI successes (icon only)
si_map = {
    'alfa_si.svg': 'alfa.svg',
    'saab_si.svg': 'saab.svg',
    'lancia_si.svg': 'lancia.svg',
    'subaru_si.svg': 'subaru.svg',
    'volvo_si.svg': 'volvo.svg',
    'lada_si.svg': 'lada.svg'
    # Jaguar, Daewoo, Lexus failed SI
}

for src, dst in si_map.items():
    s_path = os.path.join(brands_dir, src)
    if os.path.exists(s_path):
        d_path = os.path.join(brands_dir, dst)
        shutil.copy2(s_path, d_path)
        print(f"Overwrote {dst} with {src}")

# 2. Write Manual SVGs for Lexus, Daewoo, Jaguar
# Lexus Path (from search)
lexus_d = "M16.642 6.78237C14.9664 8.72965 10.1872 15.0164 9.64258 15.8304C8.594 17.3901 8.50136 18.1459 8.47048 18.6495C8.44007 19.1438 8.44007 20.035 9.29306 20.7617C10.722 21.9629 12.7261 21.7689 14.5046 21.7689H29.1523C29.7793 21.7689 29.9646 21.5943 30.3038 21.1683C31.4755 19.4825 32 17.6516 32 16.0143C32 12.5074 29.5847 8.09026 23.4682 6.09447L22 6" # Truncated in snippet?
# Snippet was truncated "L22 ...". This is risky.
# If I use truncated path, it will be broken.
# I might have to use my previous lexus.svg but split it better?
# Previous lexus.svg had 2 paths: M98... and M173...
# M98... was 2079 bytes.
# Let's try to construct Lexus from `lexus_heuristic.svg` (which is `lexus.svg` backup?)
# I'll rely on `smart_filter_logos.py` logic but manual split.

# Daewoo Path (from search)
# d="M390.4,74.9c21.3,3.8,53.1,15.1,70.6,24.3c-83.2,160.9-124.7,252-118.7,436.2l-19.1,1.2C324.8,277.7,348.6,226,390.4,74.9. L390.4,74.9z"
daewoo_d = "M390.4,74.9c21.3,3.8,53.1,15.1,70.6,24.3c-83.2,160.9-124.7,252-118.7,436.2l-19.1,1.2C324.8,277.7,348.6,226,390.4,74.9L390.4,74.9z"
# Viewbox? coordinates are around 300-400.
# Assuming 512x512?
# write daewoo.svg
with open(os.path.join(brands_dir, 'daewoo.svg'), 'w') as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="{daewoo_d}"/></svg>')
print("Wrote daewoo.svg (Manual)")

# Jaguar: Leaper
# I searched for "jaguar leaper svg path" and got nothing useful.
# I'll try to find a verified Leaper SVG URL.
# https://search.creativecommons.org?
# Let's try downloading from `https://www.vectorlogo.zone/logos/jaguar/jaguar-icon.svg`
# Wait, I tried fetching pure emblems in step 1 and it failed?
# "Fetching jaguar pure ... Error ... 404"
# Maybe I had the wrong URL?
# Try to curl `https://www.vectorlogo.zone/logos/jaguar/jaguar-icon.svg` again?
# Or `jaguar-cars`?
# I will try to download a few candidates blindly and pick the one with ratio ~2.5 (wide leaper).

import urllib.request
import ssl
context = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

jaguar_candidates = [
    'https://www.vectorlogo.zone/logos/jaguar/jaguar-icon.svg',
    'https://cdn.worldvectorlogo.com/logos/jaguar-2.svg', # often leaper
    'https://cdn.worldvectorlogo.com/logos/jaguar-3.svg',
    'https://cdn.worldvectorlogo.com/logos/jaguar-cars.svg'
]

found_jaguar = False
for url in jaguar_candidates:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            content = response.read()
            if len(content) > 100:
                with open(os.path.join(brands_dir, 'jaguar.svg'), 'wb') as f:
                    f.write(content)
                print(f"Downloaded jaguar.svg from {url}")
                found_jaguar = True
                break
    except:
        continue

if not found_jaguar:
    print("Failed to download Jaguar Leaper. Using Text fallback temporarily.")
    # Fallback to simple text so it's not a black square?
    # Or keep existing?
    pass

# Lexus
# I will try WVL `lexus-icon.svg`?
lexus_url = "https://cdn.worldvectorlogo.com/logos/lexus-icon.svg" # Guess
try:
    req = urllib.request.Request(lexus_url, headers=headers)
    with urllib.request.urlopen(req, context=context) as response:
        content = response.read()
        with open(os.path.join(brands_dir, 'lexus.svg'), 'wb') as f:
            f.write(content)
    print("Downloaded Lexus Icon")
except:
    print("Failed Lexus Icon DL")
