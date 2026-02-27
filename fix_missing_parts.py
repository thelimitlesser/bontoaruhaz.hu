import re

file_path = "src/lib/parts-data.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Parse subcategories
subcat_pattern = re.compile(r'\{\s*id:\s*"([^"]+)",\s*categoryId:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)"\s*\}')
subcategories = subcat_pattern.findall(content)

# Parse existing partItems
partitem_pattern = re.compile(r'\{\s*id:\s*"([^"]+)",\s*subcategoryId:\s*"([^"]+)"')
existing_partitems = partitem_pattern.findall(content)
existing_subcat_ids = set(p[1] for p in existing_partitems)

new_part_items = []

for sub_id, cat_id, name, slug in subcategories:
    if sub_id not in existing_subcat_ids:
        # Create a generic part item
        pi_id = f"pi-{sub_id.replace('sc-', '')}-gen"
        pi_name = f"{name} (Általános)"
        pi_slug = f"{slug}-altalanos"
        
        # also maybe just name it exactly the same as the subcategory but lowercase with some exceptions?
        # A generic one is okay, or exactly the same name.
        pi_name = f"{name}"
        pi_slug = f"{slug}"
        
        new_item = f'    {{ id: "{pi_id}", subcategoryId: "{sub_id}", name: "{pi_name.capitalize()}", slug: "{pi_slug}" }},'
        new_part_items.append(new_item)

if new_part_items:
    # Find the end of partItems array
    # It ends with }
    # ];
    
    parts_end_idx = content.rfind("];")
    if parts_end_idx != -1:
        insert_str = "\n    // --- Generated missing part items ---\n" + "\n".join(new_part_items) + "\n"
        new_content = content[:parts_end_idx] + insert_str + content[parts_end_idx:]
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Added {len(new_part_items)} new part items.")
    else:
        print("Could not find end of partItems array.")
else:
    print("No missing part items found.")
