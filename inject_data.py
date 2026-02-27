
import os

# Paths
vehicle_data_path = 'src/lib/vehicle-data.ts'
subcats_path = 'subcategories_merged.txt'
part_items_path = 'part_items_snippet.txt'

# Load data
with open(subcats_path, 'r') as f:
    subcats_content = f.read().strip()
    # Remove leading/trailing brackets if present or extract just the items
    if subcats_content.startswith('export const subcategories: Subcategory[] = ['):
        subcats_items = subcats_content.replace('export const subcategories: Subcategory[] = [', '').rstrip('];').strip()
    else:
        # If it's just the items list
        subcats_items = subcats_content

with open(part_items_path, 'r') as f:
    part_items_content = f.read().strip()
    # Extract items
    if part_items_content.startswith('export const partItems: PartItem[] = ['):
        part_items_items = part_items_content.replace('export const partItems: PartItem[] = [', '').rstrip('];').strip()
    else:
        part_items_items = part_items_content

# Read vehicle-data.ts
with open(vehicle_data_path, 'r') as f:
    lines = f.readlines()

new_lines = []
in_subcats = False
in_part_items = False
subcats_replaced = False
part_items_replaced = False

for line in lines:
    # Handle subcategories
    if 'export const subcategories: Subcategory[] = [' in line:
        in_subcats = True
        new_lines.append('export const subcategories: Subcategory[] = [\n')
        new_lines.append(subcats_items + '\n')
        new_lines.append('];\n')
        subcats_replaced = True
        continue
    
    if in_subcats:
        if '];' in line:
            in_subcats = False
        continue
    
    # Handle partItems
    if 'export const partItems: PartItem[] = ' in line:
        in_part_items = True
        new_lines.append('export const partItems: PartItem[] = [\n')
        new_lines.append(part_items_items + '\n')
        new_lines.append('];\n')
        part_items_replaced = True
        continue
    
    # If the file had partItems = partsPartItems (previous state)
    if not part_items_replaced and 'export const partItems: PartItem[] = partsPartItems;' in line:
        new_lines.append('export const partItems: PartItem[] = [\n')
        new_lines.append(part_items_items + '\n')
        new_lines.append('];\n')
        part_items_replaced = True
        continue

    if in_part_items:
        if '];' in line:
            in_part_items = False
        continue
        
    new_lines.append(line)

# Verify if replacements happened
if not subcats_replaced:
    print("Warning: subcategories array not found/replaced")
if not part_items_replaced:
    print("Warning: partItems array not found/replaced")

# Write back
with open(vehicle_data_path, 'w') as f:
    f.writelines(new_lines)

print(f"Successfully updated {vehicle_data_path} with {len(subcats_items.splitlines())} subcategories and {len(part_items_items.splitlines())} part items.")
