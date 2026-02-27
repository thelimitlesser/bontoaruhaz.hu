import json
import ssl
import urllib.request
import urllib.error
import re
import time

brands = [
    "Alfa Romeo", "Audi", "BMW", "Chevrolet", "Citroen", "Dacia", "Daewoo", 
    "Dodge", "Fiat", "Ford", "Honda", "Hyundai", "Infiniti", "Isuzu", "Iveco", 
    "Jaguar", "Jeep", "Kia", "Lada", "Lancia", "Land Rover", "Lexus", "Mazda", 
    "Mercedes", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche", 
    "Renault", "Rover", "Saab", "Seat", "Skoda", "Smart", "Ssangyong", "Subaru", 
    "Suzuki", "Toyota", "Volkswagen", "Volvo"
]

def slugify(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text

def get_models_for_brand(make):
    api_make = "Mercedes-Benz" if make == "Mercedes" else make
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/{urllib.parse.quote(api_make)}?format=json"
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            data = json.loads(response.read().decode())
            models = [item['Model_Name'] for item in data['Results']]
            models = sorted(list(set(m.title() for m in models)))
            
            clean_models = []
            for m in models:
                if len(m) <= 1: continue 
                if "Incomplete" in m: continue
                if "Chassis" in m or "Cab" in m: continue
                if "Truck" in m or "Bus" in m or "Van" in m: continue
                if "Motorcycle" in m or "Trailer" in m: continue
                clean_models.append(m)
                
            return sorted(list(set(clean_models)))
    except Exception as e:
        print(f"Error fetching {make}: {e}")
        return []

if __name__ == "__main__":
    output_ts = "export const models: Model[] = [\n"
    total_count = 0
    
    print("Fetching models for 42 brands...")
    for brand in brands:
        brand_slug = slugify(brand.replace("-Benz", ""))
        models = get_models_for_brand(brand)
        print(f"[{brand}] fetched {len(models)} models.")
        total_count += len(models)
        
        output_ts += f"    // --- {brand.upper()} ---\n"
        
        for model in models:
            model_slug = slugify(model)
            if not model_slug: continue
            
            series = model.split()[0].upper()
            if len(model.split()) > 1 and model.split()[1].lower() == "series":
                 series = f"{model.split()[0]} SERIES".upper()
                 
            id_str = f"{brand_slug}-{model_slug}"
            line = f'    {{ id: "{id_str}", brandId: "{brand_slug}", name: "{model}", slug: "{model_slug}", series: "{series}" }},'
            output_ts += line + "\n"
            
        output_ts += "\n"
        time.sleep(0.5)
        
    output_ts += "];\n"
    
    with open("generated_models_full.txt", "w") as f:
        f.write(output_ts)
        
    print(f"\nSuccessfully generated {total_count} total models across all brands!")
    print("Saved to generated_models_full.txt")
