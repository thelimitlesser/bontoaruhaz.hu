
import os
import shutil

brands_dir = os.path.join(os.getcwd(), 'public/brands')

# Formatting: source_file -> target_file
moves = {
    'alfa-romeo_heuristic.svg': 'alfa.svg',
    'daewoo_heuristic.svg': 'daewoo.svg',
    'dodge_heuristic.svg': 'dodge.svg',
    'jaguar_heuristic.svg': 'jaguar.svg',
    'lada_heuristic.svg': 'lada.svg',
    'land-rover_heuristic.svg': 'land-rover.svg',
    'lancia_heuristic.svg': 'lancia.svg',
    'lexus_heuristic.svg': 'lexus.svg',
    'saab_heuristic.svg': 'saab.svg',
    'subaru_wiki.svg': 'subaru.svg',
    'volvo_wiki.svg': 'volvo.svg'
}

for src, dst in moves.items():
    s_path = os.path.join(brands_dir, src)
    d_path = os.path.join(brands_dir, dst)
    
    if os.path.exists(s_path):
        # Override
        shutil.copy2(s_path, d_path)
        print(f"Updated {dst} using {src}")
    else:
        print(f"WARNING: Source {src} not found!")

# Cleanup heuristic files
for f in os.listdir(brands_dir):
    if '_heuristic' in f or '_wiki' in f:
        # os.remove(os.path.join(brands_dir, f)) # Keep for debugging if user complains again
        pass
