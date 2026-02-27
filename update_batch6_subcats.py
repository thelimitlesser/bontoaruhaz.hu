import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[áä]', 'a', text)
    text = re.sub(r'[éë]', 'e', text)
    text = re.sub(r'[í]', 'i', text)
    text = re.sub(r'[óöő]', 'o', text)
    text = re.sub(r'[úüű]', 'u', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

cats = {
    "fuel": ["ADAGOLÓ", "BEFECSKENDEZŐ", "COMMON RAIL", "ELEKTRONIKA", "INJEKTOR", "KÖZÖSNYOMÓCSŐ", "PD ELEMEK", "RELÉ", "SZIVATTYÚ", "TANKBETÖLTŐ CSŐ", "TURBÓ", "VEZÉRLŐ", "AKTÍVSZÉN", "BENZINCSŐ", "CSATLAKOZÓ", "ELOSZTÓ", "FOJTÓSZELEP", "IZZÍTÓ", "LÁNCKERÉK", "PILLANGÓSZELEP", "RÉSOLAJCSŐ", "SZŰRŐ", "TANKSAPKA", "ÜZEMANYAG ELOSZTÓ CSŐ", "AUTÓGÁZ", "BENZINPUMPA", "CSÖVEK", "ÉRZÉKELŐ", "GYŰRŰ", "JELADÓ", "LPG", "PORLASZTÓ", "SZELEP", "TANK", "TARTÓ", "ÜZEMANYAGHŰTŐ", "BAK", "BORDÁSKERÉK", "EGR / AGR", "FEDÉL", "HŐMÉRSÉKLET ÉRZÉKELŐ", "KIPUFOGÓ", "NYOMÁSÉRZÉKELŐ", "PUMPA", "SZENZOR", "TANKAJTÓ", "TENGELY", "ÜZEMANYAGSZIVATTYÚ"],
    "exhaust": ["CSÖVEK", "FAP", "JELADÓ", "KIPUFOGÓ DOB", "NYOMÁSÉRZÉKELŐ", "SZŰRŐ", "VÉDŐLEMEZ", "DPF", "HŐMÉRSÉKLET ÉRZÉKELŐ", "KARTER", "KOMPRESSZOR", "REZONÁTOR", "TARTÓ", "EGR / AGR", "HŐVÉDŐ LEMEZ", "KATALIZÁTOR", "LAMBDASZONDA", "SZELEP", "TÖMÍTÉS", "ÉRZÉKELŐ", "HŰTŐTARTÓ", "KIPUFOGÓ", "LEÖMLŐ", "SZENZOR", "TURBÓ"]
}

lines = []
idx = 5000 # Keep keys isolated
for cat_id, names in cats.items():
    cleaned_names = [n for n in names if n != "NEM TALÁLOD? KERESD ITT!"]
    unique_names = sorted(list(set(cleaned_names)))
    for name in unique_names:
        lines.append(f'    {{ id: "subcat-{cat_id}-{idx}", categoryId: "{cat_id}", name: "{name}", slug: "{slugify(name)}", productCount: 0 }},')
        idx += 1

print("\n".join(lines))
