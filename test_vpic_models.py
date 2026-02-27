import json
import ssl
import urllib.request
import urllib.error

def get_models_for_brand(make):
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/{make}?format=json"
    
    # Disable SSL verification for quick test
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            models = [item['Model_Name'] for item in data['Results']]
            # Title case and sort
            models = sorted(list(set(m.title() for m in models)))
            return models
    except urllib.error.URLError as e:
        print(f"Error fetching {make}: {e}")
        return []

if __name__ == "__main__":
    test_brands = ["Audi", "BMW", "Jaguar"]
    for brand in test_brands:
        print(f"\n--- {brand} ---")
        models = get_models_for_brand(brand)
        print(f"Total entries: {len(models)}")
        # Print a sample of 20
        print(", ".join(models[:20]) + ("..." if len(models) > 20 else ""))
