
import os
import urllib.request
import ssl

# Targets: Daewoo, Lexus, Saab
# Using more robust sources or GitHub raw matches
targets = [
    {
        'slug': 'daewoo',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Daewoo_logo.svg'
    },
    {
        'slug': 'lexus',
        'url': 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/lexus.svg'
    },
    {
        'slug': 'saab',
        'url': 'https://upload.wikimedia.org/wikipedia/en/9/9c/Saab_Griffin.svg' # English wiki often works
    }
]

# Alternative for Saab if Wiki fails: try WorldVector but we know it needs cleaning.
# Let's try to get a clean one first.

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
}

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

# Manual fallback for Saab if 404
# If Saab fails, I will generate a simple text fallback TEMPORARILY but the user might hate it. 
# Best to ensure we have a file.
