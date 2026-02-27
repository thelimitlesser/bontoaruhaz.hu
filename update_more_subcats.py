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
    "interior": ["ABLAKEMELŐ", "AJTÓBEHÚZÓ", "BLUETOOTH", "CSATLAKOZÓ", "ELEKTRONIKA", "FEJTÁMLA", "FORDULATSZÁM", "GERINCTÁMASZ", "HÁLÓ", "KALAPTARTÓ", "KAR / GOMB", "KERET", "KIHANGOSÍTÓ", "KITÁMASZTÓ", "KORMÁNYCSUKLÓ", "KORMÁNYOSZLOP", "KÖDZÁRÓFÉNY", "KULISSZA", "LÉGZSÁK ÁTVEZETŐ", "ABLAKTEKERŐ", "AJTÓZSEB", "BOWDEN", "CSOMAGTÉR", "ESP", "FESZÜLTSÉG", "FŰTÉS ÁLLÍTÓ", "GPS", "IRÁNYJELZŐ", "KALAPTARTÓ TARTÓ KONZOL", "KARDÁN", "KESZTYŰTARTÓ", "KIJELZŐ", "KLÍMA", "KORMÁNYKAPCSOLÓ", "KORMÁNYSZÁR", "KÖNYÖKLŐ", "KUPLUNG ÉS RÉSZEI", "LÉGZSÁK CSATLAKOZÓ", "ABLAKTÖRLŐ", "BIZTONSÁGI ÖV", "BURKOLAT", "CSOMAGTÉRAJTÓ", "ÉRZÉKELŐ", "FÉNYÉRZÉKELŐ", "FŰTÉS BOX", "HAMUTARTÓ", "ISOFIX", "KAPASZKODÓ (FELSŐ)", "KARTÁMASZ", "KÉZIFÉK", "KILINCS", "KLÍMABOX", "KORMÁNYKARDÁN", "KÖDFÉNYSZÓRÓ", "KÖZÉPKONZOL", "LÁMPA", "MAGASSÁG ÁLLÍTÓ", "AJTÓ", "BIZTOSÍTÉKTÁBLA", "CSAT", "DÍSZLÉC", "FEDÉL", "FÉNYSZÓRÓMAGASSÁG", "GÁZPEDÁL", "HANGSZÓRÓ", "JELADÓ", "KAPCSOLÓ (EGYÉB)", "KÁRPIT", "KIEGÉSZÍTŐK", "KILOMÉTERÓRA", "KORMÁNY", "KORMÁNYKÖZÉP", "KÖDLÁMPA", "KULCS", "LÉGZSÁK", "MÉLYNYOMÓ", "MULF", "NAPELLENZŐ TARTÓ", "ÖVFESZÍTŐ", "PEDÁL", "RÁDIÓ / CD", "SPIRÁL", "SZEMÜVEGTARTÓ", "SZOKNYA", "TEMPOMAT", "TÜKÖR KAPCSOLÓ", "ÜLÉS RÖGZÍTŐ", "ÜLÉSFŰTÉS KAPCSOLÓ", "VÁLTÓKAR", "VISSZAJELZŐ", "MULTIKORMÁNY", "NAVIGÁCIÓ", "PADLÓSZŐNYEG", "POHÁRTARTÓ", "ROLÓ", "SRS", "SZENZOR", "TARTÓ", "TETŐABLAK", "TŰZFAL", "ÜLÉS VÁZ", "ÜLÉSTARTÓ SÍN", "VÁLTÓSZOKNYA", "VISSZAPILLANTÓ TÜKÖR", "MŰSZERFAL", "NYITÓ", "PARKOLÁSSEGÍTÓ", "PÓTFÉKLÁMPA", "RUGÓ", "SZALAGKÁBEL", "SZIGETELÉS", "TÁROLÓ REKESZ", "TÉRELVÁLASZTÓ", "UHP", "ÜLÉSÁLLÍTÓ", "VÁLTÓ", "VEZÉRLŐ", "ZAJSZIGETELÉS", "NAPELLENZŐ", "ÓRA", "PDC", "PÓTKERÉK", "SÍN", "SZELLŐZŐ", "SZIVARGYÚJTÓ", "TELESZKÓP", "TOLATÓRADAR", "ÜLÉS", "ÜLÉSFOGLALTSÁG ÉRZÉKELŐ", "VÁLTÓGOMB", "VILÁGÍTÁS", "NEM TALÁLOD? KERESD ITT!"],
    "displays": ["ANTENNA", "ÉRZÉKELŐ", "HANGSZÓRÓ", "KERET", "MÉLYNYOMÓ", "NAVIGÁCIÓ", "RÁDIÓ / CD", "VÉGFOK", "BLUETOOTH", "FESZÜLTSÉG", "INVERTER", "KIHANGOSÍTÓ", "MULF", "ÓRA", "SZENZOR", "NEM TALÁLOD? KERESD ITT!", "ELEKTRONIKA", "FÉNYERŐ SZABÁLYZÓ", "JELADÓ", "KIJELZŐ", "MULTIKORMÁNY", "PARKOLÁSSEGÍTÓ", "TOLATÓRADAR", "ERŐSÍTŐ", "GPS", "KAPCSOLÓ (EGYÉB)", "KILOMÉTERÓRA", "MŰSZERFAL", "PDC", "UHP"],
    "cooling": ["ABLAKMOSÓ", "CSOMAGTÉR", "ELEKTRONIKA", "ÉKSZÍJTÁRCSA", "FÉNYSZÓRÓMOSÓ", "FŰTŐRADIÁTOR", "HŰTŐRADIÁTOR", "INTERCOOLER", "KIEGYENLÍTŐ TARTÁLY", "KOMPRESSZOR", "LÉGKOMPRESSZOR", "OLAJHŰTŐ", "RELÉ", "SZENZOR", "SZÍVÓSOR", "TÁGULÓ SZELEP", "ÜLÉS", "VEZÉRLŐ", "ZSALUÁLLÍTÓ", "ÁLLÓFŰTÉS", "CSÖVEK", "ELLENÁLLÁS", "ÉRZÉKELŐ", "FŰTÉS ÁLLÍTÓ", "HENGERFEJ ÉS RÉSZEI", "HŰTŐTARTÓ", "JELADÓ", "KLÍMA", "KONDENZÁTOR", "LÉGTERELŐ", "PÁROLOGTATÓ", "RUGÓ", "SZERVÓ", "SZŰRŐ", "TERMOSZTÁT", "ÜZEMANYAGHŰTŐ", "VISZKÓVENTILÁTOR", "NEM TALÁLOD? KERESD ITT!", "BAK", "DÖRZSKERÉK", "ELŐFŰTŐ", "FEDÉL", "FŰTÉS BOX", "HŐVÉDŐ LEMEZ", "HŰTŐVENTILÁTOR", "KAPCSOLÓ (EGYÉB)", "KLÍMABOX", "KÖZÉPKONZOL", "LÉGTÖMEGMÉRŐ", "PUMPA", "SZELEP", "SZIVATTYÚ", "TARTÁLY", "TÖMÍTÉS", "VÁLTÓ", "VÍZCSŐ", "BURKOLAT", "EGR / AGR", "ELŐTÉT ELLENÁLLÁS", "FÉLTENGELY", "FŰTŐMOTOR", "HŰTŐ LÉGTERELŐ", "HŰTŐVÍZ ELOSZTÓ", "KERET", "KLÍMAHŰTŐ", "KUPLUNG ÉS RÉSZEI", "NYOMÁSÉRZÉKELŐ", "RADIÁTOR", "SZELLŐZŐ", "SZÍJTÁRCSA", "TARTÓ", "TURBÓ", "VENTILÁTOR", "VÍZHŰTŐ"]
}

# The existing generate_subcats logic needs to be run but let's just make a new file that produces a snippet to replace the whole bottom section of vehicle-data.ts

new_cats_str = ""
idx = 1000 # start high to avoid collision just in case for this snippet output
for cat_id, names in cats.items():
    cleaned_names = [n for n in names if n != "NEM TALÁLOD? KERESD ITT!"]
    unique_names = sorted(list(set(cleaned_names)))
    for name in unique_names:
        new_cats_str += f'    {{ id: "subcat-{cat_id}-{idx}", categoryId: "{cat_id}", name: "{name}", slug: "{slugify(name)}", productCount: 0 }},\n'
        idx += 1

print(new_cats_str)
