
import os
import urllib.request
import ssl
import time

# Simple Icons uses specific slugs.
# We need to map our slugs to theirs.
# Search: https://simpleicons.org/

targets = {
    'alfa-romeo': 'alfa.svg',
    'saab': 'saab.svg',
    'lancia': 'lancia.svg',
    'subaru': 'subaru.svg',
    'volvo': 'volvo.svg',
    'daewoo': 'daewoo.svg',
    'lexus': 'lexus.svg',
    'jaguar': 'jaguar.svg',
    'land-rover': 'land-rover.svg',
    'dodge': 'dodge.svg',
    'lada': 'lada.svg'
}

# Base URL
base_url = "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/"

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()

for slug, filename in targets.items():
    # Simple Icons slugs are usually lowercase, spaces removed or replaced?
    # Actually checking their repo:
    # Alfa Romeo -> alfaromeo.svg
    # Land Rover -> landrover.svg
    # Lada -> lada.svg
    
    # Adjust slugs
    si_slug = slug.replace('-', '') # alfaromeo, landrover
    
    url = f"{base_url}{si_slug}.svg"
    dest = os.path.join(brands_dir, f"{filename.replace('.svg', '_si.svg')}")
    
    try:
        print(f"Fetching {si_slug} from {url}...")
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, context=context) as response:
            content = response.read()
            if len(content) > 50:
                with open(dest, 'wb') as f:
                    f.write(content)
                print(f"SUCCESS: Saved {os.path.basename(dest)}")
            else:
                print(f"Failed {si_slug}: Content too short")
                
    except Exception as e:
        print(f"Error fetching {si_slug}: {e}")
        # Try alternative slug?
        if '-' in slug:
            # Try with hyphen? simple-icons usually removes it?
            # actually they use Title Case encoded? No, raw files are usually `slug.svg`
            pass
            
    time.sleep(0.5)
