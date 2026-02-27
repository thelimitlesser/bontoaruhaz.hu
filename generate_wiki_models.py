import json
import urllib.request
import urllib.parse
import ssl
import re
import time

brands = [
    "Alfa Romeo", "Audi", "BMW", "Chevrolet", "Citroen", "Dacia", "Daewoo", 
    "Dodge", "Fiat", "Ford", "Honda", "Hyundai", "Infiniti", "Isuzu", "Iveco", 
    "Jaguar", "Jeep", "Kia", "Lada", "Lancia", "Land Rover", "Lexus", "Mazda", 
    "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche", 
    "Renault", "Rover", "Saab", "Seat", "Skoda", "Smart", "Ssangyong", "Subaru", 
    "Suzuki", "Toyota", "Volkswagen", "Volvo"
]

def slugify(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text

def get_wiki_models(brand):
    # Some brands have specific category names
    cat_brand = brand
    if brand == "Mercedes-Benz": cat_brand = "Mercedes-Benz"
    elif brand == "Citroen": cat_brand = "Citroën"
    elif brand == "Skoda": cat_brand = "Škoda"
    
    cat_name = f"Category:{cat_brand}_vehicles"
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle={urllib.parse.quote(cat_name)}&cmlimit=500&format=json"
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    models = []
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            data = json.loads(response.read().decode())
            if 'query' in data and 'categorymembers' in data['query']:
                for item in data['query']['categorymembers']:
                    title = item['title']
                    # Filter out subcategories and templates
                    if title.startswith("Category:") or title.startswith("Template:") or title.startswith("List of"):
                        continue
                    
                    # Clean up the title (remove "Audi ", remove "(car)", etc)
                    clean_name = title.replace(f"{brand} ", "").replace(f"{cat_brand} ", "")
                    clean_name = re.sub(r'\s*\(.*?\)\s*', '', clean_name) # Remove parentheticals
                    
                    # Skip generic concepts or concepts cars if possible, but keep it simple
                    if "concept" in clean_name.lower(): continue
                    if "engine" in clean_name.lower(): continue
                    if "platform" in clean_name.lower(): continue
                    
                    models.append(clean_name.strip())
                    
        return sorted(list(set(models)))
    except Exception as e:
        print(f"Error fetching {brand}: {e}")
        return []

if __name__ == "__main__":
    output_ts = "export const generatedModels: any[] = [\n"
    total = 0
    
    print("Scraping Wikipedia Categories for 42 brands...")
    for brand in brands:
        # Use Mercedes instead of Mercedes-Benz for the internal ID
        brand_slug = slugify(brand.replace("-Benz", ""))
        
        models = get_wiki_models(brand)
        print(f"[{brand}] fecthed {len(models)} models.")
        total += len(models)
        
        output_ts += f"    // --- {brand.upper()} ---\n"
        for model in models:
            if len(model) < 2: continue
            model_slug = slugify(model)
            
            series = model.split()[0].upper()
            if len(model.split()) > 1 and model.split()[1].lower() == "series":
                 series = f"{model.split()[0]} SERIES".upper()
                 
            id_str = f"{brand_slug}-{model_slug}"
            line = f'    {{ id: "{id_str}", brandId: "{brand_slug}", name: "{model}", slug: "{model_slug}", series: "{series}" }},'
            output_ts += line + "\n"
            
        time.sleep(0.1) # Be nice to Wiki API
        
    output_ts += "];\n"
    
    with open("generated_wiki_models.txt", "w") as f:
        f.write(output_ts)
        
    print(f"\nDone! Extracted {total} models from Wikipedia.")
