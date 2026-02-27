
import os
import urllib.request
import ssl

targets = [
    { 'slug': 'daewoo', 'url': 'https://cdn.worldvectorlogo.com/logos/daewoo.svg' },
    { 'slug': 'lexus', 'url': 'https://cdn.worldvectorlogo.com/logos/lexus.svg' },
    { 'slug': 'saab', 'url': 'https://cdn.worldvectorlogo.com/logos/saab-1.svg' }
]

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

for brand in targets:
    slug = brand['slug']
    url = brand['url']
    dest = os.path.join(brands_dir, f"{slug}_raw.svg") # Save as raw for inspection
    
    try:
        req = urllib.request.Request(url, data=None, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            content = response.read()
            with open(dest, 'wb') as f: f.write(content)
            print(f"Saved {slug}_raw.svg")
    except Exception as e:
        print(f"Error {slug}: {e}")
