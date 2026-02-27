
import os
import urllib.request
import ssl

# Trying Gil Barbara's logo collection
targets = [
    {
        'slug': 'daewoo',
        'url': 'https://raw.githubusercontent.com/GilBarbara/logos/master/logos/daewoo.svg'
    },
    {
        'slug': 'lexus',
        'url': 'https://raw.githubusercontent.com/GilBarbara/logos/master/logos/lexus.svg'
    },
    {
        'slug': 'saab',
        'url': 'https://raw.githubusercontent.com/GilBarbara/logos/master/logos/saab.svg'
    },
    # Also check Alfa again just in case Gil's is better? 
    # { 'slug': 'alfa', 'url': 'https://raw.githubusercontent.com/GilBarbara/logos/master/logos/alfa-romeo.svg' }
]

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

for brand in targets:
    slug = brand['slug']
    url = brand['url']
    dest = os.path.join(brands_dir, f"{slug}.svg")
    
    try:
        print(f"Fetching {slug} from {url}...")
        req = urllib.request.Request(url, data=None, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            content = response.read()
            if len(content) > 100:
                with open(dest, 'wb') as f:
                    f.write(content)
                print(f"SUCCESS: {slug}")
            else:
                print(f"FAILED {slug}: Content too small")
    except Exception as e:
        print(f"Error {slug}: {e}")
