
import os
import urllib.request
import ssl

# Target brands and their potential sources
targets = [
    {
        'slug': 'alfa-romeo', 
        'sources': [
            'https://cdn.simpleicons.org/alfaromeo', 
            'https://www.vectorlogo.zone/logos/alfaromeo/alfaromeo-icon.svg',
            'https://upload.wikimedia.org/wikipedia/commons/2/24/Alfa_Romeo_Logo.svg'
        ]
    },
    {
        'slug': 'daewoo',
        'sources': [
            'https://www.vectorlogo.zone/logos/daewoo/daewoo-icon.svg',
            'https://upload.wikimedia.org/wikipedia/commons/a/ae/Daewoo_logo.svg'
        ]
    },
    {
        'slug': 'dodge',
        'sources': [
            'https://cdn.simpleicons.org/dodge',
            'https://www.vectorlogo.zone/logos/dodge/dodge-icon.svg',
            'https://upload.wikimedia.org/wikipedia/commons/b/b9/Dodge_Ram_symbol.svg'
        ]
    },
     {
        'slug': 'jaguar',
        'sources': [
            'https://cdn.simpleicons.org/jaguar',
            'https://www.vectorlogo.zone/logos/jaguar/jaguar-icon.svg',
            'https://upload.wikimedia.org/wikipedia/en/l/l2/Jaguar_Cars_logo_2012.svg'
        ]
    },
    {
        'slug': 'lada',
        'sources': [
            'https://cdn.simpleicons.org/lada',
            'https://www.vectorlogo.zone/logos/lada/lada-icon.svg',
            'https://upload.wikimedia.org/wikipedia/commons/a/a3/Lada_Logo.svg' # Often the boat
        ]
    },
    {
        'slug': 'lancia',
        'sources': [
            'https://cdn.simpleicons.org/lancia',
            'https://www.vectorlogo.zone/logos/lancia/lancia-icon.svg',
            'https://upload.wikimedia.org/wikipedia/commons/b/b0/Lancia_Logo.svg'
        ]
    },
    {
        'slug': 'land-rover',
        'sources': [
            'https://cdn.simpleicons.org/landrover',
            'https://www.vectorlogo.zone/logos/landrover/landrover-icon.svg',
             'https://upload.wikimedia.org/wikipedia/en/0/05/Land_Rover_logo.svg'
        ]
    },
    {
        'slug': 'lexus',
        'sources': [
             'https://cdn.simpleicons.org/lexus',
             'https://www.vectorlogo.zone/logos/lexus/lexus-icon.svg',
             'https://upload.wikimedia.org/wikipedia/commons/f/f1/Lexus_symbol.svg'
        ]
    },
    {
        'slug': 'subaru',
        'sources': [
            'https://cdn.simpleicons.org/subaru',
            'https://www.vectorlogo.zone/logos/subaru/subaru-icon.svg',
            'https://upload.wikimedia.org/wikipedia/commons/a/a2/Subaru_logo.svg'
        ]
    },
    {
        'slug': 'saab',
        'sources': [
            'https://cdn.simpleicons.org/saab',
            'https://www.vectorlogo.zone/logos/saab/saab-icon.svg',
             'https://upload.wikimedia.org/wikipedia/commons/6/66/Saab_Griffin.svg'
        ]
    },
    {
        'slug': 'volvo',
        'sources': [
            'https://cdn.simpleicons.org/volvo',
            'https://www.vectorlogo.zone/logos/volvo/volvo-icon.svg',
             'https://upload.wikimedia.org/wikipedia/commons/2/29/Volvo_Logo.svg'
        ]
    },
]

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
}

for brand in targets:
    slug = brand['slug']
    print(f"--- Fetching {slug} ---")
    
    # Special mapping for file names in my project
    # My vehicle-data.ts uses 'alfa.svg' not 'alfa-romeo.svg' for some reason?
    # Let's check: vehicle-data.ts says: alfa.svg, but slug is alfa-romeo? 
    # NO, in vehicle-data.ts:
    # { id: "alfa-romeo", name: "Alfa Romeo", slug: "alfa-romeo", logo: "/brands/alfa.svg?v=2" },
    # So I must save as 'alfa.svg' for that one.
    
    filename = slug
    if slug == 'alfa-romeo': filename = 'alfa'
    
    dest = os.path.join(brands_dir, f"{filename}.svg")
    
    success = False
    for url in brand['sources']:
        try:
            print(f"Trying {url}...")
            req = urllib.request.Request(url, data=None, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                content = response.read()
                # Check if 404 text or empty
                if len(content) < 100 or b'404 Not Found' in content:
                    print(f"Skipping (too small or 404)")
                    continue
                
                with open(dest, 'wb') as f:
                    f.write(content)
                print(f"SUCCESS: Saved {filename}.svg from {url}")
                success = True
                break
        except Exception as e:
            print(f"Failed {url}: {e}")
            
    if not success:
        print(f"!!! FAILED ALL SOURCES FOR {slug} !!!")

