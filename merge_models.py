import re

def parse_models_file(filepath):
    models = {}
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line.startswith('{ id:'): continue
            
            # Extract id
            match_id = re.search(r'id:\s*"([^"]+)"', line)
            if not match_id: continue
            id_val = match_id.group(1)
            
            models[id_val] = line
    return models

if __name__ == "__main__":
    nhtsa_models = parse_models_file("generated_models_full.txt")
    wiki_models = parse_models_file("generated_wiki_models.txt")
    
    print(f"Loaded {len(nhtsa_models)} NHTSA models and {len(wiki_models)} Wiki models.")
    
    # Merge, prioritizing Wikipedia models if they exist (usually cleaner names)
    final_models = {}
    final_models.update(nhtsa_models)
    final_models.update(wiki_models) # Overwrites duplicates with Wiki versions
    
    print(f"Merged into {len(final_models)} unique models.")
    
    # Group by brand ID to write them out nicely
    brands = {}
    for line in final_models.values():
        match_brand = re.search(r'brandId:\s*"([^"]+)"', line)
        if match_brand:
            b_id = match_brand.group(1)
            if b_id not in brands:
                brands[b_id] = []
            brands[b_id].append(line)
            
    # Read the existing vehicle-data.ts up to the models array
    with open("src/lib/vehicle-data.ts", "r") as f:
        content = f.read()
        
    # Find the models array declaration
    models_start = content.find('export const models: Model[] = [')
    models_end = content.find('];', models_start)
    
    if models_start == -1 or models_end == -1:
        print("Error: Could not find models array in vehicle-data.ts")
        exit(1)
        
    # Generate the new models text
    new_models_text = "export const models: Model[] = [\n"
    for b_id in sorted(brands.keys()):
        new_models_text += f"    // --- {b_id.upper()} ---\n"
        # Sort models within brand alphabetically by name string extraction
        b_models = sorted(brands[b_id], key=lambda x: re.search(r'name:\s*"([^"]+)"', x).group(1) if re.search(r'name:\s*"([^"]+)"', x) else x)
        for line in b_models:
            new_models_text += f"    {line}\n"
        new_models_text += "\n"
        
    # Preserve everything before and after the models array
    new_content = content[:models_start] + new_models_text + content[models_end:]
    
    with open("src/lib/vehicle-data.ts", "w") as f:
        f.write(new_content)
        
    print(f"Successfully injected {len(final_models)} models into src/lib/vehicle-data.ts!")
