import sys

def main():
    file_path = 'src/lib/parts-data.ts'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print("Error reading file:", e)
        sys.exit(1)

    print(f"Read file, length: {len(content)}")

    # 1. Remove generic parts
    start_str = '    { id: "pi-door-gen-1"'
    end_str = '    // --- NEW: LENGÉSCSILLAPÍTÓ ÉS RUGÓ ---'
    
    start_index = content.find(start_str)
    end_index = content.find(end_str)
    
    if start_index != -1 and end_index != -1:
        content = content[:start_index] + content[end_index:]
        print("Successfully removed auto-generated parts.")
    else:
        print(f"Error finding indices for removal. start: {start_index}, end: {end_index}")
        sys.exit(1)

    # 2. Add new subcategories
    new_subcategories = """    // --- LATEST NEW SUBCATEGORIES ---
    { id: "sc-body-7", categoryId: "body-exterior", name: "KÜSZÖB, TETŐ ÉS PADLÓLEMEZ", slug: "kuszob-teto-padlo" },
    { id: "sc-body-other-4", categoryId: "body-other", name: "VONÓHOROG ÉS TARTOZÉKA", slug: "vonohorog" },
    { id: "sc-lights-5", categoryId: "lights", name: "BELSŐ VILÁGÍTÁS ÉS EGYÉB LÁMPA", slug: "belso-vilagitas" },
    { id: "sc-glass-4", categoryId: "glass", name: "TETŐABLAK ÉS PANORÁMATETŐ", slug: "tetoablak" },
    { id: "sc-displays-4", categoryId: "displays", name: "ERŐSÍTŐ ÉS HANGRENDSZER", slug: "erosito-hangrendszer" },
    { id: "sc-electric-4", categoryId: "electric-motor", name: "EGYÉB ELEKTROMOS MOTOROK", slug: "egyeb-elektromos-motorok" },
    { id: "sc-fuel-3", categoryId: "fuel", name: "HIBRID ÉS EV ALKATRÉSZEK", slug: "hibrid-ev-alkatreszek" },
    { id: "sc-engine-8", categoryId: "engine", name: "KOMPLETT MOTOR", slug: "komplett-motor" },
    { id: "sc-locks-3", categoryId: "locks", name: "EGYÉB SZERKEZETEK ÉS MECHANIKÁK", slug: "egyeb-szerkezetek" },
"""

    marker1 = '    { id: "sc-other-1", categoryId: "other", name: "EGYÉB ALKATRÉSZ", slug: "egyeb-alkatresz" },'
    subcat_end_index = content.find(marker1)
    if subcat_end_index != -1:
        list_end = content.find('];', subcat_end_index)
        content = content[:list_end] + new_subcategories + content[list_end:]
        print("Successfully added new subcategories.")
    else:
        print("Could not find marker for subcategories.")
        sys.exit(1)

    # 3. Add new parts
    new_parts = """
    // --- LATEST NEW PARTS ---
    // 1. KÜSZÖB, TETŐ ÉS PADLÓLEMEZ
    { id: "pi-body-7-1", subcategoryId: "sc-body-7", name: "Küszöblemez / Javítóív", slug: "kuszoblemez-javitoiv" },
    { id: "pi-body-7-2", subcategoryId: "sc-body-7", name: "Tetőlemez", slug: "tetolemez" },
    { id: "pi-body-7-3", subcategoryId: "sc-body-7", name: "Padlólemez", slug: "padlolemez" },
    { id: "pi-body-7-4", subcategoryId: "sc-body-7", name: "B-Oszlop / C-Oszlop lemez", slug: "b-oszlop-lemez" },
    
    // 2. VONÓHOROG ÉS TARTOZÉKA
    { id: "pi-body-other-4-1", subcategoryId: "sc-body-other-4", name: "Vonóhorog (Komplett)", slug: "vonohorog-komplett" },
    { id: "pi-body-other-4-2", subcategoryId: "sc-body-other-4", name: "Levehető vonófej", slug: "leveheto-vonofej" },
    { id: "pi-body-other-4-3", subcategoryId: "sc-body-other-4", name: "Vonóhorog elektronika / Modul", slug: "vonohorog-elektronika" },

    // 3. BELSŐ VILÁGÍTÁS ÉS EGYÉB LÁMPA
    { id: "pi-lights-5-1", subcategoryId: "sc-lights-5", name: "Belső tér lámpa / Olvasólámpa", slug: "belso-ter-lampa" },
    { id: "pi-lights-5-2", subcategoryId: "sc-lights-5", name: "Kesztyűtartó világítás", slug: "kesztyutarto-vilagitas" },
    { id: "pi-lights-5-3", subcategoryId: "sc-lights-5", name: "Ajtó kilépőfény", slug: "ajto-kilepofeny" },

    // 4. TETŐABLAK ÉS PANORÁMATETŐ
    { id: "pi-glass-4-1", subcategoryId: "sc-glass-4", name: "Tetőablak üveg", slug: "tetoablak-uveg" },
    { id: "pi-glass-4-2", subcategoryId: "sc-glass-4", name: "Tetőablak mozgató motor", slug: "tetoablak-motor" },
    { id: "pi-glass-4-3", subcategoryId: "sc-glass-4", name: "Tetőablak kapcsoló", slug: "tetoablak-kapcsolo" },
    { id: "pi-glass-4-4", subcategoryId: "sc-glass-4", name: "Tetőablak roló", slug: "tetoablak-rolo" },

    // 5. ERŐSÍTŐ ÉS HANGRENDSZER
    { id: "pi-displays-4-1", subcategoryId: "sc-displays-4", name: "Központi Erősítő (Gyári)", slug: "kozponti-erosito" },
    { id: "pi-displays-4-2", subcategoryId: "sc-displays-4", name: "Mélynyomó / Subwoofer", slug: "melynyomo" },
    { id: "pi-displays-4-3", subcategoryId: "sc-displays-4", name: "CD/DVD Váltó", slug: "cd-valto" },
    { id: "pi-displays-4-4", subcategoryId: "sc-displays-4", name: "Bluetooth / Telefon modul", slug: "bluetooth-modul" },

    // 6. EGYÉB ELEKTROMOS MOTOROK
    { id: "pi-electric-4-1", subcategoryId: "sc-electric-4", name: "Csomagtérajtó mozgató motor", slug: "csomagter-motor" },
    { id: "pi-electric-4-2", subcategoryId: "sc-electric-4", name: "Tolóajtó mozgató motor", slug: "toloajto-motor" },
    { id: "pi-electric-4-3", subcategoryId: "sc-electric-4", name: "Napfénytető motor", slug: "napfenyteto-motor" },

    // 7. HIBRID ÉS EV ALKATRÉSZEK
    { id: "pi-fuel-3-1", subcategoryId: "sc-fuel-3", name: "Nagyfeszültségű akkumulátor pakk", slug: "hv-akkumulator" },
    { id: "pi-fuel-3-2", subcategoryId: "sc-fuel-3", name: "Inverter / Konverter", slug: "inverter-konverter" },
    { id: "pi-fuel-3-3", subcategoryId: "sc-fuel-3", name: "Fedélzeti töltő (OBC)", slug: "fedelzeti-tolto" },
    { id: "pi-fuel-3-4", subcategoryId: "sc-fuel-3", name: "Töltőkábel csatlakozó aljzat", slug: "toltokabel-csatlakozo" },

    // 8. KOMPLETT MOTOR
    { id: "pi-engine-8-1", subcategoryId: "sc-engine-8", name: "Komplett fűzött motor (Hengerfejjel)", slug: "komplett-motor-fuzott" },
    { id: "pi-engine-8-2", subcategoryId: "sc-engine-8", name: "Motor (Agregáttal / Minden tartozékkal)", slug: "motor-komplett" },

    // 9. EGYÉB SZERKEZETEK ÉS MECHANIKÁK
    { id: "pi-locks-3-1", subcategoryId: "sc-locks-3", name: "Pedálsor (Gáz, Fék, Kuplung)", slug: "pedalsor" },
    { id: "pi-locks-3-2", subcategoryId: "sc-locks-3", name: "Ajtóhatároló mechanika", slug: "ajtohatarolo-mechanika" },
    { id: "pi-locks-3-3", subcategoryId: "sc-locks-3", name: "Kormánymű kardán (Mechanikus rész)", slug: "kormanymu-kardan" },
    { id: "pi-locks-3-4", subcategoryId: "sc-locks-3", name: "Kézifék mechanika (Kar nélkül)", slug: "kezifek-mechanika" },

    // 10. PLUSZ ALKATRÉSZEK A MEGLÉVŐKBE
    { id: "pi-cool-1-9", subcategoryId: "sc-cooling-1", name: "Hűtővíz cső készlet", slug: "hutoviz-cso-keszlet" },
    { id: "pi-cool-1-10", subcategoryId: "sc-cooling-1", name: "Kiegyenlítő tartály sapka", slug: "kiegyenlito-tartaly-sapka" },
    { id: "pi-fuel-1-5", subcategoryId: "sc-fuel-1", name: "Üzemanyag szűrő ház", slug: "uzemanyag-szuro-haz" },
    { id: "pi-block-4", subcategoryId: "sc-engine-5", name: "Olajszivattyú / Olajpumpa", slug: "olajpumpa" },
    { id: "pi-block-5", subcategoryId: "sc-engine-5", name: "Olajhűtő / Hőcserélő", slug: "olajhuto" },
    { id: "pi-block-6", subcategoryId: "sc-engine-5", name: "Olajszűrő ház (Műanyag/Fém)", slug: "olajszuro-haz" },
"""

    parts_end_index = content.rfind('];')
    if parts_end_index != -1:
        content = content[:parts_end_index] + new_parts + '];\n'
        print("Successfully added new parts.")
    else:
        print("Could not find end of parts array.")
        sys.exit(1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("All updates applied!")

if __name__ == '__main__':
    main()
