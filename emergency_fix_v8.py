
import os
import urllib.request
import ssl

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

# 1. Manual Lexus (Better Circle + L)
lexus_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
  <path d="M50 8C27 8 8 27 8 50s19 42 42 42 42-19 42-42S73 8 50 8zm0 78c-19.8 0-36-16.2-36-36s16.2-36 36-36 36 16.2 36 36-16.2 36-36 36z" fill-rule="evenodd"/>
  <path d="M72 30l-8 0-18 35-8 0-4-8 8 0 2 4 10-20-14 0-4-8 26 0z" />
</svg>"""
with open(os.path.join(brands_dir, 'lexus.svg'), 'w') as f:
    f.write(lexus_content)
    print("Wrote Lexus Manual V2")

# 2. Jaguar Candidates
jaguar_urls = [
    'https://cdn.worldvectorlogo.com/logos/jaguar-3.svg',
    'https://cdn.worldvectorlogo.com/logos/jaguar-cars.svg',
    'https://cdn.worldvectorlogo.com/logos/jaguar-panther.svg'
]
jaguar_done = False
for url in jaguar_urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as res:
            content = res.read()
            if len(content) > 100:
                with open(os.path.join(brands_dir, 'jaguar.svg'), 'wb') as f:
                    f.write(content)
                print(f"Downloaded Jaguar from {url}")
                jaguar_done = True
                break
    except: continue

if not jaguar_done:
    # Use simple text default
    pass 

# 3. Daewoo Candidates
daewoo_urls = [
    'https://cdn.worldvectorlogo.com/logos/daewoo-electronics.svg',
    'https://cdn.worldvectorlogo.com/logos/os-daewoo-logo.svg'
]
daewoo_done = False
for url in daewoo_urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as res:
            content = res.read()
            if len(content) > 100:
                with open(os.path.join(brands_dir, 'daewoo.svg'), 'wb') as f:
                    f.write(content)
                print(f"Downloaded Daewoo from {url}")
                daewoo_done = True
                break
    except: continue
