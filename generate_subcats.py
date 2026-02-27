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
    "body-exterior": ["AJTÓ", "DOBLEMEZ", "HÁTFAL", "INTERCOOLER", "LÖKHÁRÍTÓ", "NYÚLVÁNY", "SAROK", "TORONY", "BURKOLAT", "FEDÉL", "HOMLOKFAL", "KAROSSZÉRIA CSOMAG", "LÖKHÁRÍTÓ MEREVÍTŐ", "OSZLOP", "SÁRVÉDŐ", "ZÁRHÍD", "CSOMAGTÉRAJTÓ", "FENÉKLEMEZ", "HOSSZNYÚLVÁNY", "KLÍMAHŰTŐ", "MOTORHÁZTETŐ", "PÓTKERÉK", "TANKAJTÓ", "DOBBETÉT", "FÜLKE", "HŰTŐRADIÁTOR", "KÜSZÖB", "NEGYED", "RADIÁTOR", "TETŐ"],
    "lights": ["CSOMAGTÉR", "FEDÉL", "FÉNYSZÓRÓMOSÓ", "IRÁNYJELZŐ", "KERET", "KÖDZÁRÓFÉNY", "LÖKHÁRÍTÓ VAKBORÍTÁS", "PUMPA", "SZINTSZABÁLYZÓ", "TOLATÓLÁMPA", "XENON", "CSÖVEK", "FÉNYSZÓRÓ", "FOGLALAT", "IZZÍTÓ", "KESZTYŰTARTÓ", "LÁMPA", "MAGASSÁG ÁLLÍTÓ", "RELÉ", "SZIVATTYÚ", "TRAFÓ", "ELEKTRONIKA", "FÉNYSZÓRÓ TARTÓ", "FÚVÓKA", "JELADÓ", "KÖDFÉNYSZÓRÓ", "LÁMPABÚRA", "PÓTFÉKLÁMPA", "SPRICCELŐ", "TARTÓ", "VEZÉRLŐ", "ÉRZÉKELŐ", "FÉNYSZÓRÓMAGASSÁG", "HÁTSÓ LÁMPA", "KÁRPIT", "KÖDLÁMPA", "LÁMPAKERET", "PRIZMA", "SZENZOR", "TETŐABLAK", "VILÁGÍTÁS"],
    "glass": ["ABLAK", "CSOMAGTÉRAJTÓ", "FÉNYSZÓRÓMOSÓ", "LÁMPABÚRA", "SZENZOR", "TETŐ", "VISSZAPILLANTÓ MOTOR", "ABLAKMOSÓ", "DÍSZLÉC", "FIXÜVEG", "LÉGTERELŐ", "SZÉLVÉDŐ", "TETŐABLAK", "VISSZAPILLANTÓ TÜKÖR", "ABLAKTÖRLŐ", "ÉRZÉKELŐ", "JELADÓ", "OLDALABLAK ÜVEG", "SZÉLVÉDŐ TAKARÓ", "TÜKÖR MOZGATÓ MOTOR", "VISSZAPILLANTÓ TÜKÖR KERET", "BURKOLAT", "FÉNYÉRZÉKELŐ", "KÁRPIT", "PANORÁMA TETŐ", "TARTÁLY", "TÜKÖRLAP"],
    "body-other": ["ABLAK", "ABLAKTÖRLŐ", "AJTÓKAPCSOLÓ", "ANTENNA", "BIZTOSÍTÉKTÁBLA", "CSOMAGTÉR", "DÍSZRÁCS", "DUDA", "ÉRZÉKELŐ", "FÉLTENGELY", "FÉNYSZÓRÓMOSÓ", "GÁZPEDÁL", "HOMLOKFAL", "HŰTŐRÁCS", "KALAPTARTÓ", "KARTER", "KERÉK", "KILINCS", "KIPUFOGÓ", "KORMÁNYMŰ", "KÖNYÖKLŐ", "KUPLUNG ÉS RÉSZEI", "LÁMPA", "ABLAKEMELŐ", "ABLAKVEZETŐ", "AJTÓKERET", "BAK", "BOWDEN", "CSOMAGTÉRAJTÓ", "DÍSZTÁRCSA", "EMBLÉMA", "FEDÉL", "FÉNYSZÓRÓ", "FOGLALAT", "GUMIKÉDER", "HŐVÉDŐ LEMEZ", "INTERCOOLER", "KAR / GOMB", "KÁRPIT", "KESZTYŰTARTÓ", "KILINCS ÉRZÉKELŐ", "KITÁMASZTÓ", "KÖDFÉNYSZÓRÓ", "KÖZÉPKONZOL", "KÜRT", "LÁMPABÚRA", "ABLAKMOSÓ", "AJTÓ", "AKKUMULÁTOR", "BENZINCSŐ", "BÖLCSŐ", "CSÖVEK", "DOBBETÉT", "EMELŐ", "FELNI", "FÉNYSZÓRÓ SZEMÖLDÖK", "FÚVÓKA", "HÁLÓ", "HŰTŐ LÉGTERELŐ", "IZZÍTÓ", "KAROSSZÉRIA CSOMAG", "KERESZTTARTÓ", "KÉDERGUMI", "KILINCSFÉSZEK", "KLÍMAHŰTŐ", "KÖDLÁMPA", "KÖZPONTIZÁR MOTOR", "KÜSZÖB", "LÁMPAKERET", "ABLAKTEKERŐ", "AJTÓHATÁROLÓ", "AKKUMULÁTOR TARTOZÉK", "BILLENÉSGÁTLÓ", "BURKOLAT", "DÍSZLÉC", "DOBLEMEZ", "EUROTÁLCA", "FENÉKLEMEZ", "FÉNYSZÓRÓ TARTÓ", "FÜLKE", "HIDRAULIKA", "HŰTŐRADIÁTOR", "JELADÓ", "KARTÁMASZ", "KERET", "KIEGÉSZÍTŐK", "KILOMÉTERÓRA", "KOPTATÓ", "KÖDZÁRÓFÉNY", "KULISSZA", "KÜSZÖBBORÍTÁS", "LEVÉLRÁCS", "LÉGTERELŐ", "LÖKHÁRÍTÓ MEREVÍTŐ", "MOTOR", "MŰSZERFAL", "NYÚLVÁNY", "PEDÁL", "RENDSZÁMTÁBLA", "SÁRVÉDŐ GUMI", "SÍN", "SZEMÜVEGTARTÓ", "SZÉLVÉDŐ VÍZELVEZETŐ", "TANKBETÖLTŐ CSŐ", "TELESZKÓP", "TETŐSÍN", "TŰZFAL", "VÁLTÓSZOKNYA", "VISSZAPILLANTÓ TÜKÖR", "VÍZLEHÚZÓ", "ZÁRSZERKEZET", "LÉGZSÁK", "LÖKHÁRÍTÓ TARTÓ", "MOTORBURKOLAT", "NAPELLENZŐ", "PANORÁMA TETŐ", "PÓTKERÉK", "RÉSOLAJCSŐ", "SÁRVÉDŐ OLDALTARTÓ", "SPRICCELŐ", "SZENZOR", "SZIGETELÉS", "TARTÁLY", "TETŐ", "TÉRELVÁLASZTÓ", "ÜTKÖZÉSCSILLAPÍTÓ", "VÉDŐLEMEZ", "VISSZAPILLANTÓ TÜKÖR KERET", "VONTATÁS", "ZSANÉR", "LÉGZSÁK INDÍTÓ", "LÖKHÁRÍTÓ ÜTKÖZÉS ELNYELŐ", "MOTORFELFÜGGESZTÉS", "NAPELLENZŐ TARTÓ", "PARKOLÁSSEGÍTÓ", "PRIZMA", "ROLÓ", "SÁRVÉDŐ SZÉLESÍTŐ", "SZÁRNY", "SZERSZÁMTARTÓ", "TANK", "TARTÓ", "TETŐABLAK", "TOLATÓRADAR", "ÜTKÖZŐ", "VILÁGÍTÁS", "VÍZCSŐ", "ZAJSZIGETELÉS", "LÖKHÁRÍTÓ", "LÖKHÁRÍTÓ VAKBORÍTÁS", "MOTORHÁZTETŐ", "NYITÓ", "PÁNT", "RADIÁTOR", "SAROK", "SÁRVÉDŐ SZIGETELÉS", "SZELLŐZŐ", "SZÉLVÉDŐ TAKARÓ", "TANKAJTÓ", "TÁROLÓ REKESZ", "TETŐCSOMAGTARTÓ", "TORONYMEREVÍTŐ", "VÁLTÓKAR", "VISSZAJELZŐ", "VÍZELVEZETŐ", "ZÁRHÍD"]
}

lines = ["\nexport const subcategories: Subcategory[] = ["]
idx = 1
for cat_id, names in cats.items():
    unique_names = sorted(list(set(names)))
    for name in unique_names:
        lines.append(f'    {{ id: "subcat-{idx}", categoryId: "{cat_id}", name: "{name}", slug: "{slugify(name)}", productCount: 0 }},')
        idx += 1

other_cats = [
    "interior", "displays", "cooling", "engine", "electric-motor", "ignition", "ecu", "wiring", 
    "safety", "locks", "transmission", "brakes", "steering", "fuel", "exhaust", "other"
]
for cat_id in other_cats:
    lines.append(f'    {{ id: "subcat-{idx}", categoryId: "{cat_id}", name: "ÁLTALÁNOS ALKATRÉSZ 1", slug: "altalanos-alkatresz-1", productCount: 0 }},')
    idx += 1
    lines.append(f'    {{ id: "subcat-{idx}", categoryId: "{cat_id}", name: "ÁLTALÁNOS ALKATRÉSZ 2", slug: "altalanos-alkatresz-2", productCount: 0 }},')
    idx += 1

lines.append("];")
lines.append("\nexport const getSubcategoriesByCategory = (categoryId: string) => {")
lines.append("    return subcategories.filter(s => s.categoryId === categoryId);")
lines.append("};\n")

with open("src/lib/vehicle-data.ts", "a") as f:
    f.write("\n".join(lines))

print("Generated subcategories!")
