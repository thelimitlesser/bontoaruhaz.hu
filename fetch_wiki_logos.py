
import os
import urllib.request
import re
import ssl
import time

# Dictionary of brands + best guess Wikimedia File pages
targets = [
    # Jaguar: Try to find the Leaper
    {'slug': 'jaguar', 'page': 'https://commons.wikimedia.org/wiki/File:Jaguar_cars_logo.svg'}, # Classic
    {'slug': 'jaguar_alt', 'page': 'https://commons.wikimedia.org/wiki/File:Jaguar-Logo.svg'},
    
    # Saab: Griffin
    {'slug': 'saab', 'page': 'https://commons.wikimedia.org/wiki/File:Saab_logo.svg'}, # Usually the badge
    {'slug': 'saab_griffin', 'page': 'https://commons.wikimedia.org/wiki/File:Saab_Griffin.svg'},
    
    # Volvo: Iron Mark
    {'slug': 'volvo', 'page': 'https://commons.wikimedia.org/wiki/File:Volvo-Iron-Mark-Black.svg'},
    
    # Lada: Boat
    {'slug': 'lada', 'page': 'https://commons.wikimedia.org/wiki/File:Lada_logo.svg'},
    
    # Land Rover: Oval
    {'slug': 'land-rover', 'page': 'https://commons.wikimedia.org/wiki/File:Land_Rover_logo.svg'},
    
    # Dodge: Ram
    {'slug': 'dodge', 'page': 'https://commons.wikimedia.org/wiki/File:Dodge_Ram_symbol.svg'},
    
    # Lexus: L symbol
    {'slug': 'lexus', 'page': 'https://commons.wikimedia.org/wiki/File:Lexus_symbol.svg'},
    
    # Subaru: Stars
    {'slug': 'subaru', 'page': 'https://commons.wikimedia.org/wiki/File:Subaru_logo.svg'},
    
    # Alfa: 
    {'slug': 'alfa', 'page': 'https://commons.wikimedia.org/wiki/File:Alfa_Romeo_Logo.svg'},
    
    # Lancia:
    {'slug': 'lancia', 'page': 'https://commons.wikimedia.org/wiki/File:Lancia_Logo.svg'},
    
    # Daewoo:
    {'slug': 'daewoo', 'page': 'https://commons.wikimedia.org/wiki/File:Daewoo_logo.svg'}
]

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
}

def get_original_url(page_url):
    try:
        print(f"Scraping {page_url}...")
        req = urllib.request.Request(page_url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            html = response.read().decode('utf-8')
            
            # Look for "Original file" link
            # Usually: <a href="https://upload.wikimedia.org/wikipedia/commons/..." class="internal" ...>Original file</a>
            # Or just the main image: <div class="fullImageLink" id="file"><a href="...">
            
            match = re.search(r'<div class="fullImageLink" id="file"><a href="([^"]+)"', html)
            if match:
                url = match.group(1)
                # Ensure protocol
                if url.startswith('//'):
                    url = 'https:' + url
                return url
            
            # Fallback: look for any upload.wikimedia.org link ending in .svg
            match = re.search(r'https://upload\.wikimedia\.org/wikipedia/commons/[^"]+\.svg', html)
            if match:
                return match.group(0)
                
    except Exception as e:
        print(f"Error scraping {page_url}: {e}")
    return None

for t in targets:
    slug = t['slug']
    page = t['page']
    
    original_url = get_original_url(page)
    
    if original_url:
        print(f"Found URL for {slug}: {original_url}")
        # Download
        try:
            filename = slug
            if '_alt' in slug: filename = slug.replace('_alt', '') # Use simpler name or handle overwrite
            if 'saab_griffin' in slug: filename = 'saab' # overwrite saab
            
            dest = os.path.join(brands_dir, f"{filename}_wiki.svg")
            
            req = urllib.request.Request(original_url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                content = response.read()
                with open(dest, 'wb') as f:
                    f.write(content)
                print(f"SUCCESS: Saved {filename}_wiki.svg")
        except Exception as e:
            print(f"Failed to download {slug}: {e}")
    else:
        print(f"Could not find original URL for {slug}")
    
    time.sleep(0.5) # Be nice
