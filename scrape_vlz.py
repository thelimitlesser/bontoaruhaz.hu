
import os
import urllib.request
import re
import ssl
import time

# VectorLogoZone Index Pages
targets = [
    {'slug': 'jaguar', 'url': 'https://www.vectorlogo.zone/logos/jaguar/index.html'},
    {'slug': 'saab', 'url': 'https://www.vectorlogo.zone/logos/saab/index.html'},
    {'slug': 'lada', 'url': 'https://www.vectorlogo.zone/logos/lada/index.html'},
    {'slug': 'land-rover', 'url': 'https://www.vectorlogo.zone/logos/landrover/index.html'},
    {'slug': 'dodge', 'url': 'https://www.vectorlogo.zone/logos/dodge/index.html'},
    {'slug': 'lexus', 'url': 'https://www.vectorlogo.zone/logos/lexus/index.html'},
    {'slug': 'alfa', 'url': 'https://www.vectorlogo.zone/logos/alfaromeo/index.html'},
    {'slug': 'lancia', 'url': 'https://www.vectorlogo.zone/logos/lancia/index.html'},
    {'slug': 'daewoo', 'url': 'https://www.vectorlogo.zone/logos/daewoo/index.html'},
    {'slug': 'subaru', 'url': 'https://www.vectorlogo.zone/logos/subaru/index.html'},
    {'slug': 'volvo', 'url': 'https://www.vectorlogo.zone/logos/volvo/index.html'},
]

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
}

def find_best_svg_url(index_url, base_url):
    try:
        print(f"Scraping {index_url}...")
        req = urllib.request.Request(index_url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            html = response.read().decode('utf-8')
            
            # Pattern: look for hrefs ending in .svg
            # We prefer 'icon.svg' or 'mark.svg' or 'symbol.svg'
            # If not, 'logo.svg'
            
            svgs = re.findall(r'href="([^"]+\.svg)"', html)
            if not svgs:
                return None
                
            # Filter and sort
            # Priority: icon > mark > symbol > simple > logo
            best_svg = None
            
            # Helper to check priority
            def score(name):
                if 'icon' in name: return 10
                if 'mark' in name: return 8
                if 'symbol' in name: return 7
                if 'simple' in name: return 6
                if 'logo' in name: return 5
                return 1
                
            svgs.sort(key=score, reverse=True)
            best_svg = svgs[0]
            
            if best_svg.startswith('/'):
                return 'https://www.vectorlogo.zone' + best_svg
            else:
                # Relative to current folder? 
                # usually /logos/slug/foo.svg
                return 'https://www.vectorlogo.zone' + best_svg if best_svg.startswith('/') else base_url.rsplit('/', 1)[0] + '/' + best_svg
                
    except Exception as e:
        print(f"Error scraping {index_url}: {e}")
    return None

for t in targets:
    slug = t['slug']
    index = t['url']
    
    markup_url = find_best_svg_url(index, index)
    
    if markup_url:
        print(f"Found SVG for {slug}: {markup_url}")
        try:
            dest = os.path.join(brands_dir, f"{slug}_zone.svg")
            req = urllib.request.Request(markup_url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                content = response.read()
                with open(dest, 'wb') as f:
                    f.write(content)
                print(f"SUCCESS: Saved {slug}_zone.svg")
        except Exception as e:
            print(f"Failed to download {markup_url}: {e}")
    else:
        print(f"No SVG found for {slug}")
    
    time.sleep(0.5)
