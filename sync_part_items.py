
import re

# Load subcategories from merged file
with open('subcategories_merged.txt', 'r') as f:
    merged_content = f.read()

# Pattern to extract { id: "...", categoryId: "...", name: "...", slug: "...", productCount: 0 }
subcat_pattern = re.compile(r'\{ id: "(subcat-[^"]+)", categoryId: "([^"]+)", name: "([^"]+)", slug: "[^"]+", productCount: 0 \}')
subcats = []
for match in subcat_pattern.finditer(merged_content):
    subcats.append({
        'id': match.group(1),
        'categoryId': match.group(2),
        'name': match.group(3)
    })

# Define a mapping from old subcategory names in parts-data.ts to new IDs
# Mapping is based on (categoryId, name) uniqueness in merged data
def find_new_id(cat_id, subcat_name):
    # Normalize subcat_name to upper case for matching as in subcategories_merged.txt
    search_name = subcat_name.upper()
    
    # Special cases for names that might differ slightly
    if search_name == "MOTORVEZÉRLŐ (ECU)": search_name = "MOTORVEZÉRLŐ"
    if search_name == "KOMFORT ELEKTRONIKA": search_name = "KOMFORT"
    if search_name == "ÉRZÉKELŐ / SZENZOR": search_name = "SZENZOR"
    if search_name == "LÉGZSÁK INDÍTÓ / ELEKTRONIKA": search_name = "LÉGZSÁK ELEKTRONIKA"
    if search_name == "VÁLTÓ (SEBESSÉGVÁLTÓ)": search_name = "VÁLTÓ"
    if search_name == "ABS EGYSÉG": search_name = "ABS"
    if search_name == "CSONKÁLLVÁNY / KERÉKAGY": search_name = "CSONKÁLLVÁNY"
    if search_name == "ADAGOLÓ / NAGYNYOMÁSÚ PUMPA": search_name = "ADAGOLÓ"
    if search_name == "TURBÓFELTÖLTŐ": search_name = "TURBÓ"
    if search_name == "KORMÁNYKERÉK": search_name = "KORMÁNY"
    
    for s in subcats:
        if s['categoryId'] == cat_id and s['name'] == search_name:
            return s['id']
    return None

# Old part items from parts-data.ts with their category contexts
old_items = [
    # Category: body-exterior, Subcategory: AJTÓ
    ("body-exterior", "AJTÓ", "pi-door-1", "Bal első Ajtó (Üres lemez)", "bal-elso-ajto-ures"),
    ("body-exterior", "AJTÓ", "pi-door-2", "Bal első Ajtó (Részeivel)", "bal-elso-ajto-komplett"),
    ("body-exterior", "AJTÓ", "pi-door-3", "Bal hátsó Ajtó (Üres lemez)", "bal-hatso-ajto-ures"),
    ("body-exterior", "AJTÓ", "pi-door-4", "Bal hátsó Ajtó (Részeivel)", "bal-hatso-ajto-komplett"),
    ("body-exterior", "AJTÓ", "pi-door-5", "Jobb első Ajtó (Üres lemez)", "jobb-elso-ajto-ures"),
    ("body-exterior", "AJTÓ", "pi-door-6", "Jobb első Ajtó (Részeivel)", "jobb-elso-ajto-komplett"),
    ("body-exterior", "AJTÓ", "pi-door-7", "Jobb hátsó Ajtó (Üres lemez)", "jobb-hatso-ajto-ures"),
    ("body-exterior", "AJTÓ", "pi-door-8", "Jobb hátsó Ajtó (Részeivel)", "jobb-hatso-ajto-komplett"),
    
    # Category: body-exterior, Subcategory: LÖKHÁRÍTÓ
    ("body-exterior", "LÖKHÁRÍTÓ", "pi-bump-1", "Első Lökhárító (Üresen)", "elso-lokharito-ures"),
    ("body-exterior", "LÖKHÁRÍTÓ", "pi-bump-2", "Első Lökhárító (Részeivel)", "elso-lokharito-komplett"),
    ("body-exterior", "LÖKHÁRÍTÓ", "pi-bump-3", "Hátsó Lökhárító (Üresen)", "hatso-lokharito-ures"),
    ("body-exterior", "LÖKHÁRÍTÓ", "pi-bump-4", "Hátsó Lökhárító (Részeivel)", "hatso-lokharito-komplett"),
    
    # Category: lights, Subcategory: FÉNYSZÓRÓ
    ("lights", "FÉNYSZÓRÓ", "pi-light-1", "Bal fényszóró", "bal-fenyszoro"),
    ("lights", "FÉNYSZÓRÓ", "pi-light-2", "Jobb fényszóró", "jobb-fenyszoro"),
    ("lights", "FÉNYSZÓRÓ", "pi-light-3", "Fényszóró Pár", "fenyszoro-par"),
    ("lights", "FÉNYSZÓRÓ", "pi-light-4", "Bal Xenon fényszóró", "bal-xenon-fenyszoro"),
    ("lights", "FÉNYSZÓRÓ", "pi-light-5", "Jobb Xenon fényszóró", "jobb-xenon-fenyszoro"),
    
    # Category: glass, Subcategory: VISSZAPILLANTÓ TÜKÖR
    ("glass", "VISSZAPILLANTÓ TÜKÖR", "pi-mir-1", "Bal visszapillantó tükör (komplett)", "bal-visszapillanto-komplett"),
    ("glass", "VISSZAPILLANTÓ TÜKÖR", "pi-mir-2", "Jobb visszapillantó tükör (komplett)", "jobb-visszapillanto-komplett"),
    ("glass", "VISSZAPILLANTÓ TÜKÖR", "pi-mir-3", "Belső visszapillantó tükör", "belso-visszapillanto"),
    
    # Category: interior, Subcategory: ÜLÉS
    ("interior", "ÜLÉS", "pi-seat-1", "Bal első ülés (Vezető)", "bal-elso-ules"),
    ("interior", "ÜLÉS", "pi-seat-2", "Jobb első ülés (Utas)", "jobb-elso-ules"),
    ("interior", "ÜLÉS", "pi-seat-3", "Hátsó üléssor / szett", "hatso-ulesset"),
    
    # Category: interior, Subcategory: BIZTONSÁGI ÖV
    ("interior", "BIZTONSÁGI ÖV", "pi-belt-1", "Bal első biztonsági öv", "bal-elso-ov"),
    ("interior", "BIZTONSÁGI ÖV", "pi-belt-2", "Jobb első biztonsági öv", "jobb-elso-ov"),
    ("interior", "BIZTONSÁGI ÖV", "pi-belt-3", "Hátsó biztonsági öv készlet", "hatso-ov-szett"),
    
    # Category: safety, Subcategory: LÉGZSÁK
    ("safety", "LÉGZSÁK", "pi-air-1", "Kormánylégzsák", "kormanylegzsak"),
    ("safety", "LÉGZSÁK", "pi-air-2", "Utasoldali légzsák", "utas-legzsak"),
    ("safety", "LÉGZSÁK", "pi-air-3", "Függönylégzsák (Bal)", "bal-fuggony-legzsak"),
    ("safety", "LÉGZSÁK", "pi-air-4", "Függönylégzsák (Jobb)", "jobb-fuggony-legzsak"),
    
    # Category: steering, Subcategory: LENGŐKAR
    ("steering", "LENGŐKAR", "pi-arm-1", "Bal első alsó első lengőkar", "bal-elso-also-elso"),
    ("steering", "LENGŐKAR", "pi-arm-2", "Bal első alsó hátsó lengőkar", "bal-elso-also-hatso"),
    ("steering", "LENGŐKAR", "pi-arm-3", "Jobb első alsó első lengőkar", "jobb-elso-also-elso"),
    ("steering", "LENGŐKAR", "pi-arm-4", "Jobb első alsó hátsó lengőkar", "jobb-elso-also-hatso"),
    
    # Category: engine, Subcategory: HENGERFEJ ÉS RÉSZEI
    ("engine", "HENGERFEJ ÉS RÉSZEI", "pi-head-1", "Hengerfej (Fűzve/Komplett)", "hengerfej-komplett"),
    ("engine", "HENGERFEJ ÉS RÉSZEI", "pi-head-2", "Szelepfedél", "szelepfedel"),
    ("engine", "HENGERFEJ ÉS RÉSZEI", "pi-head-3", "Vezérműtengely", "vezermutengely"),
    
    # Category: transmission, Subcategory: VÁLTÓ
    ("transmission", "VÁLTÓ", "pi-gear-1", "Mechanikus váltó", "kezi-valto"),
    ("transmission", "VÁLTÓ", "pi-gear-2", "Automata váltó", "automata-valto"),
]

new_part_items = []
for cat_id, subcat_name, item_id, item_name, item_slug in old_items:
    new_subcat_id = find_new_id(cat_id, subcat_name)
    if new_subcat_id:
        new_part_items.append({
            'id': item_id,
            'subcategoryId': new_subcat_id,
            'name': item_name,
            'slug': item_slug
        })
    else:
        print(f"Warning: Could not find new subcat ID for {cat_id} -> {subcat_name}")

with open('part_items_snippet.txt', 'w') as f:
    f.write("export const partItems: PartItem[] = [\n")
    for item in new_part_items:
        f.write(f'    {{ id: "{item["id"]}", subcategoryId: "{item["subcategoryId"]}", name: "{item["name"]}", slug: "{item["slug"]}" }},\n')
    f.write("];\n")

print(f"Generated {len(new_part_items)} part items.")
