
import os
import re
import xml.etree.ElementTree as ET

brands_dir = os.path.join(os.getcwd(), 'public/brands')

def remove_first_path(filename):
    src = os.path.join(brands_dir, f"{filename}_raw.svg")
    dest = os.path.join(brands_dir, f"{filename}.svg")
    
    if not os.path.exists(src):
        print(f"Skipping {filename} (no raw)")
        return

    try:
        # Read file
        with open(src, 'r') as f:
            content = f.read()
            
        # Regex to remove first <path ... fill="#fff" ... />
        # This is the WorldVectorLogo signature: <path fill="#fff" d="M0 0h192.756v192.756H0V0z"/>
        # We can just replace that specific string since it's standard 192.756 size.
        
        # Try exact string replacement for safety
        scan_str = '<path fill="#fff" d="M0 0h192.756v192.756H0V0z"/>'
        if scan_str in content:
            new_content = content.replace(scan_str, '')
        else:
            # Fallback regex if attributes reordered
            new_content = re.sub(r'<path[^>]*d="M0 0h192\.756v192\.756H0V0z"[^>]*/>', '', content)
            
        # Also ensure remaining fills are simple
        # Convert fill="#1e71b8" (Daewoo blue) to currentColor?
        # Or just remove fill attributes so it defaults to black/current?
        new_content = re.sub(r'fill="#[0-9a-fA-F]{6}"', 'fill="currentColor"', new_content)
        
        with open(dest, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filename}")
        
    except Exception as e:
        print(f"Error fixing {filename}: {e}")

# Fix Daewoo and Lexus
remove_first_path('daewoo')
remove_first_path('lexus')

# Create Saab text logo
saab_dest = os.path.join(brands_dir, 'saab.svg')
with open(saab_dest, 'w') as f:
    f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><text x="50" y="60" font-family="Arial, sans-serif" font-weight="900" font-size="30" text-anchor="middle">SAAB</text></svg>')
print("Generated Saab text logo")
