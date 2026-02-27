
import os
import urllib.request
import re
import ssl
import time

# Refined targets based on search
targets = [
    # Jaguar: Try 2024 (might be leaper?) or guessing Leaper
    {'slug': 'jaguar', 'page': 'https://commons.wikimedia.org/wiki/File:Jaguar_2024.svg'},
    {'slug': 'jaguar_alt', 'page': 'https://commons.wikimedia.org/wiki/File:Jaguar_cars_logo.svg'}, # Wordmark?
    
    # Saab: Try "Saab 9-5 Sedan logo" (might contain badge) or "Saab Automobile logo"
    {'slug': 'saab', 'page': 'https://commons.wikimedia.org/wiki/File:Saab_9-5_Sedan_logo.svg'},
    {'slug': 'saab_alt', 'page': 'https://commons.wikimedia.org/wiki/File:Saab_Automobile_logo.svg'},
    
    # Lada: "Lada.svg" was confirmed
    {'slug': 'lada', 'page': 'https://commons.wikimedia.org/wiki/File:Lada.svg'},
    
    # Land Rover: "Land Rover 2023"
    {'slug': 'land-rover', 'page': 'https://commons.wikimedia.org/wiki/File:Land_Rover_2023.svg'},
    
    # Dodge: "Dodge black logo" sounds promising for silhouette
    {'slug': 'dodge', 'page': 'https://commons.wikimedia.org/wiki/File:Dodge_black_logo.svg'},
    
    # Lexus: "Lexus.svg"
    {'slug': 'lexus', 'page': 'https://commons.wikimedia.org/wiki/File:Lexus.svg'},
    
    # Daewoo: "Daewoo Motors logo.svg"
    {'slug': 'daewoo', 'page': 'https://commons.wikimedia.org/wiki/File:Daewoo_Motors_logo.svg'},

    # Lancia: "Lancia Logo 2023"
    {'slug': 'lancia', 'page': 'https://commons.wikimedia.org/wiki/File:Lancia_Logo_2023.svg'},
    
    # Alfa: "Alfa Romeo Badge.svg"
    {'slug': 'alfa', 'page': 'https://commons.wikimedia.org/wiki/File:Alfa_Romeo_Badge.svg'},
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
            match = re.search(r'<div class="fullImageLink" id="file"><a href="([^"]+)"', html)
            if match:
                url = match.group(1)
                if url.startswith('//'): url = 'https:' + url
                return url
            match = re.search(r'https://upload\.wikimedia\.org/wikipedia/commons/[^"]+\.svg', html)
            if match: return match.group(0)
    except Exception as e:
        print(f"Error scraping {page_url}: {e}")
    return None

for t in targets:
    slug = t['slug']
    page = t['page']
    
    original_url = get_original_url(page)
    
    if original_url:
        print(f"Found URL for {slug}: {original_url}")
        try:
            filename = slug
            if '_alt' in slug: filename = slug.replace('_alt', '')
            dest = os.path.join(brands_dir, f"{filename}_wiki.svg")
            
            # If exists and is not empty, skip? No, overwrite.
            req = urllib.request.Request(original_url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                content = response.read()
                if len(content) > 100:
                    with open(dest, 'wb') as f:
                        f.write(content)
                    print(f"SUCCESS: Saved {filename}_wiki.svg")
        except Exception as e:
            print(f"Failed to download {slug}: {e}")
    else:
        print(f"Could not find original URL for {slug}")
    
    time.sleep(1.0)
