
import os
import urllib.request
import ssl

# Target: Pure Emblems (No Text)
targets = [
    # Jaguar: Leaper (animal)
    {'slug': 'jaguar', 'url': 'https://www.vectorlogo.zone/logos/jaguar/jaguar-icon.svg'}, 
    # If 404, we need another source. simple-icons is usually text? No, simple-icons jaguar is the face?
    # Let's try wikimedia for the leaper
    
    # Saab: Griffin head only
    {'slug': 'saab', 'url': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Saab_Griffin.svg'}, # Hope this exists or similar
    
    # Volvo: Iron mark symbol
    {'slug': 'volvo', 'url': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Volvo_Logo.svg'}, # Check content, remove text later if needed
    
    # Lada: Boat only
    {'slug': 'lada', 'url': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Lada_Logo.svg'}, 
    
    # Daewoo: Shell
    {'slug': 'daewoo', 'url': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Daewoo_logo.svg'},
    
    # Dodge: Ram head
    {'slug': 'dodge', 'url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Dodge_Ram_symbol.svg/512px-Dodge_Ram_symbol.svg.png'}, # No PNG!
    # SVG link:
    {'slug': 'dodge', 'url': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Dodge_Ram_symbol.svg'},
    
    # Lexus: L symbol
    {'slug': 'lexus', 'url': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Lexus_symbol.svg'},
    
    # Subaru: Stars
    {'slug': 'subaru', 'url': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Subaru_logo.svg'},

    # Alfa Romeo: Badge
    {'slug': 'alfa', 'url': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Alfa_Romeo_Logo.svg'},
    
    # Lancia: Shield
    {'slug': 'lancia', 'url': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Lancia_Logo.svg'},
    
    # Land Rover: Oval (Empty?) Or just the shape. Land Rover is validly text-in-oval. 
    # Maybe user wants the simple green oval?
    {'slug': 'land-rover', 'url': 'https://www.vectorlogo.zone/logos/landrover/landrover-icon.svg'},
]

brands_dir = os.path.join(os.getcwd(), 'public/brands')
context = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
}

for brand in targets:
    slug = brand['slug']
    url = brand['url']
    dest = os.path.join(brands_dir, f"{slug}_pure.svg")
    
    try:
        print(f"Fetching {slug} pure from {url}...")
        req = urllib.request.Request(url, data=None, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            content = response.read()
            if len(content) > 100:
                with open(dest, 'wb') as f:
                    f.write(content)
                print(f"Saved {slug}_pure.svg")
            else:
                print(f"Failed {slug}: Too small")
    except Exception as e:
        print(f"Error {slug}: {e}")
