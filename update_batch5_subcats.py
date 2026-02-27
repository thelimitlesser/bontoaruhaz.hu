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
    "locks": ["ABLAKEMELŐ", "AJTÓ", "CSOMAGTÉR", "ELEKTRONIKA", "FOGASKERÉK", "KAR / GOMB", "KILINCSFÉSZEK", "KÖZPONTIZÁR MOTOR", "MŰSZERFAL", "SÍN", "TARTÁLY", "VÍZCSŐ", "ZSANÉR", "ABLAKMOSÓ", "AJTÓHATÁROLÓ", "CSOMAGTÉRAJTÓ", "EMELŐ", "FOGLALAT", "KESZTYŰTARTÓ", "KITÁMASZTÓ", "KULCS", "NAPELLENZŐ", "SZELEP", "TARTÓ", "VONTATÁS", "ABLAKTÖRLŐ", "AJTÓZÁR MOTOR", "DIFFERENCIÁLMŰ", "FEDÉL", "IZZÍTÓ", "KÉZIFÉK", "KÖNYÖKLŐ", "KUPLUNG ÉS RÉSZEI", "NAPELLENZŐ TARTÓ", "SZERSZÁMTARTÓ", "TELESZKÓP", "ZÁRBETÉT", "ABLAKVEZETŐ", "BOWDEN", "EGR / AGR", "FÉNYSZÓRÓ", "KAPASZKODÓ (FELSŐ)", "KIEGÉSZÍTŐK", "KÖZPONTIZÁR", "MOTOR", "PEDÁL", "SZŰRŐ", "VÁLTÓ", "ZÁRSZERKEZET"],
    "transmission": ["AGY", "CSOMAGTÉR", "ÉRZÉKELŐ", "FOGASKERÉK", "JELADÓ", "KINYOMÓ CSAPÁGY", "LENDKERÉK", "PEDÁL KAPCSOLÓ", "SZINKRON", "TOLATÓLÁMPA", "VÁLTÓSZOKNYA", "BAK", "CSÖVEK", "FEDÉL", "FOGASKOSZORÚ", "KARDÁN", "KITÁMASZTÓ", "OLAJHŰTŐ", "SPIRÁL", "TARTÓ", "VÁLTÓ", "VEZÉRLŐ", "BOWDEN", "DIFFERENCIÁLMŰ", "FÉLTENGELY", "GYŰRŰ", "KÉZIFÉK", "KULISSZA", "OSZTÓMŰ", "SZELEP", "TCU", "VÁLTÓGOMB", "VONTATÁS", "CITROM", "ELEKTRONIKA", "FÉLTENGELY TARTÓ", "HŐVÉDŐ LEMEZ", "KILOMÉTERÓRA", "KUPLUNG ÉS RÉSZEI", "PEDÁL", "SZENZOR", "TENGELY", "VÁLTÓKAR"],
    "brakes": ["ABS", "DOBFÉK", "FÉK MUNKAHENGER", "FÉKDOB", "FÉKRÁSEGÍTŐ", "FŐFÉKHENGER", "KIPÖRGÉSGÁTLÓ", "PORVÉDŐ LEMEZ", "SZIVATTYÚ", "ASR", "ELEKTRONIKA", "FÉK SZETT (NYEREG, TÁRCSA,...", "FÉKERŐSZABÁLYZÓ", "FÉKSZELEP", "JELADÓ", "MENETSTABILIZÁTOR", "PUMPA", "TARTÁLY", "BOWDEN", "ESP", "FÉKBETÉT", "FÉKKENGYEL", "FÉKTAKARÓ", "KAR / GOMB", "PEDÁL", "SZENZOR", "TARTÓ", "CSÖVEK", "ÉRZÉKELŐ", "FÉKCSŐ", "FÉKNYEREG", "FÉKTÁRCSA", "KÉZIFÉK", "PEDÁL KAPCSOLÓ", "SZERVÓ", "VÉDŐLEMEZ"],
    "steering": ["ACÉLFELNI", "CIM", "DIFFERENCIÁLMŰ", "FELNI", "FÉLTENGELY TARTÓ", "GUMIABRONCS", "HŐVÉDŐ LEMEZ", "KERÉK", "KITÁMASZTÓ", "KORMÁNYKÖZÉP", "KORMÁNYSZÖG JELADÓ", "OSZTÓMŰ", "RUGÓ", "SZENZOR", "SZIVATTYÚ", "TENGELY", "VEZÉRLŐ", "ALUFELNI", "CSAPÁGY", "DÍSZTÁRCSA", "FELNI GUMIVAL", "FUTÓMŰ", "HÁTSÓ HÍD", "JELADÓ", "KERÉKAGY", "KORMÁNY", "KORMÁNYMŰ", "LENGÉSCSILLAPÍTÓ", "PORVÉDŐ LEMEZ", "RUGÓTÁNYÉR", "SZERSZÁMTARTÓ", "TARTÁLY", "TENGELYCSONK", "VÉDŐLEMEZ", "BÖLCSŐ", "CSAVAR", "ELEKTRONIKA", "FÉKTAKARÓ", "FUTÓMŰ KITÁMASZTÓ", "HIDRAULIKA", "KARDÁN", "KERÉKCSAPÁGY", "KORMÁNYCSUKLÓ", "KORMÁNYOSZLOP", "LENGŐKAR", "PÓTKERÉK", "STABILIZÁTOR", "SZERVÓ", "TARTÓ", "TORONYCSAPÁGY", "VONTATÁS", "BURKOLAT", "CSONKÁLLVÁNY", "ÉRZÉKELŐ", "FÉLTENGELY", "GÓLYALÁB", "HOSSZLENGŐKAR", "KERESZTLENGŐKAR", "KIEGÉSZÍTŐK", "KORMÁNYKARDÁN", "KORMÁNYSZÁR", "OLAJHŰTŐ", "PUMPA", "SZELEP", "SZILENT", "TELESZKÓP", "TORZIÓS RÚD"]
}

lines = []
idx = 4000 # Keep keys isolated
for cat_id, names in cats.items():
    cleaned_names = [n for n in names if n != "NEM TALÁLOD? KERESD ITT!"]
    unique_names = sorted(list(set(cleaned_names)))
    for name in unique_names:
        lines.append(f'    {{ id: "subcat-{cat_id}-{idx}", categoryId: "{cat_id}", name: "{name}", slug: "{slugify(name)}", productCount: 0 }},')
        idx += 1

print("\n".join(lines))
