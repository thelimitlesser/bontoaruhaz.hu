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
    "ecu": ["ABLAKEMELŐ", "AJTÓKAPCSOLÓ", "BIZTOSÍTÉKTÁBLA", "CSATLAKOZÓ", "DPF", "ÉRZÉKELŐ", "FÉNYSZÓRÓ", "GATEWAY", "GYÚJTÁSSZÖG", "INDÍTÁSGÁTLÓ", "JELADÓ", "KILINCS ÉRZÉKELŐ", "KLÍMA", "KORMÁNYOSZLOP", "LAMBDASZONDA", "LÉGZSÁK INDÍTÓ", "NAVIGÁCIÓ", "PARKOLÁSSEGÍTŐ", "RELÉ", "ABLAKMOSÓ", "AUTÓGÁZ", "BLUETOOTH", "CSOMAGTÉR", "ECU", "FEDÉLZETI SZÁMÍTÓGÉP", "FOJTÓSZELEP", "GÁZPEDÁL", "HOLTPONT", "INJEKTOR", "KERET", "KILOMÉTERÓRA", "KOMFORT", "KORMÁNYSZÖG JELADÓ", "LÁMPA", "LPG", "NYOMÁSÉRZÉKELŐ", "PDC", "RIASZTÓ", "ABS", "BEFECSKENDEZŐ", "CANBUS", "CSOMAGTÉRAJTÓ", "ELEKTRONIKA", "FESZÜLTSÉG", "FORDULATSZÁM", "GENERÁTOR", "HŐMÉRSÉKLET ÉRZÉKELŐ", "INVERTER", "KÉZIFÉK", "KIPÖRGÉSGÁTLÓ", "KORMÁNY", "KÖZÉPKONZOL", "LÉGTÖMEGMÉRŐ", "MENETSTABILIZÁTOR", "OLAJNYOMÁS", "PORLASZTÓ", "SCU", "AJTÓ", "BENZINPUMPA", "CIM", "DIFFERENCIÁLMŰ", "ESP", "FÉNYÉRZÉKELŐ", "FŰTÉS BOX", "GPS", "IMMOBILIZER", "IZZÍTÓ", "KIEGYENLÍTŐ TARTÁLY", "KIPUFOGÓ", "KORMÁNYMŰ", "KÖZPONTIZÁR", "LÉGZSÁK ELEKTRONIKA", "MOTORVEZÉRLŐ", "ÓRA", "POZÍCIÓ", "SPIRÁL", "SZENZOR", "TÁVIRÁNYÍTÓ", "TOLATÓRADAR", "VENTILÁTOR", "XENON", "SZINTSZABÁLYZÓ", "TCU", "ÜLÉS", "VEZÉRLÉS", "SZÍVÓSOR", "TEMPOMAT", "ÜZEMANYAGSZIVATTYÚ", "VEZÉRLŐ", "TARTÁLY", "TETŐABLAK", "VÁLTÓ", "VÍZHŐGOMBA"],
    "wiring": ["ABLAKEMELŐ", "ABS", "ASR", "CSOMAGTÉRAJTÓ", "FESZÜLTSÉG", "FOGLALAT", "GYERTYAKÁBELEK", "IMMOBILIZER", "IRÁNYJELZŐ", "KÁBELCSATORNA", "KORMÁNY", "KÖDLÁMPA", "LÁMPA", "MAGASSÁG ÁLLÍTÓ", "MŰSZERFAL", "OKOS GUMISZELEP", "PEDÁL KAPCSOLÓ", "RIASZTÓ", "ABLAKFŰTÉS", "AJTÓ", "BEFECSKENDEZŐ", "ELAKADÁSJELZŐ", "FÉNYERŐ SZABÁLYZÓ", "FŰTÉS ÁLLÍTÓ", "GYÚJTÁSELOSZTÓ KÁBEL", "INDÍTÁSGÁTLÓ", "IZZÍTÓ", "KERET", "KORMÁNYKAPCSOLÓ", "KÖDZÁRÓFÉNY", "LÉGZSÁK ÁTVEZETŐ", "MENETSTABILIZÁTOR", "NEGATÍV KÁBEL", "ÖNINDÍTÓ", "PORLASZTÓ", "SRS", "ABLAKMOSÓ", "AJTÓKAPCSOLÓ", "CSATLAKOZÓ", "ELEKTRONIKA", "FÉNYSZÓRÓ", "GENERÁTOR", "GYÚJTÁSKAPCSOLÓ", "INJEKTOR", "KAPCSOLÓ (EGYÉB)", "KIPÖRGÉSGÁTLÓ", "KORMÁNYMŰ", "KÖZÉPKONZOL", "LÉGZSÁK KAPCSOLÓ", "MOTOR KÁBELKÖTEG", "NFU", "PARKOLÁSSEGÍTÓ", "POZITÍV KÁBEL", "SZALAGKÁBEL", "ABLAKTÖRLŐ", "AKKUMULÁTOR", "CSOMAGTÉR", "ESP", "FÉNYSZÓRÓMAGASSÁG", "GENERÁTOR KÁBELKÖTEG", "GYÚJTÁSKAPCSOLÓ HÁZ", "INVERTER", "KAROSSZÉRIA KÁBELKÖTEG", "KLÍMA", "KÖDFÉNYSZÓRÓ", "KÖZPONTIZÁR", "LÖKHÁRÍTÓ KÁBELKÖTEG", "MULTIKORMÁNY", "NYOMÁSÉRZÉKELŐ", "PDC KÁBEL", "RELÉ", "SZELLŐZŐ", "SZÉLVÉDŐ FŰTÉS", "TETŐABLAK", "TÜKÖR KAPCSOLÓ", "VILÁGÍTÁS", "SZÍVÓSOR KÁBELKÖTEG", "TOLATÓLÁMPA", "ÜLÉS", "TANKAJTÓ", "TOLATÓRADAR", "VEZÉRLŐ", "TEMPOMAT", "TPMS", "VÉSZVILLOGÓ"],
    "safety": ["ABS", "BURKOLAT", "DUDA", "ESP", "HANGSZÓRÓ", "INDÍTÁSGÁTLÓ", "KIEGÉSZÍTŐK", "KÜRT", "LÉGZSÁK ELEKTRONIKA", "MENETSTABILIZÁTOR", "PARKOLÁSSEGÍTÓ", "SZALAGKÁBEL", "TOLATÓRADAR", "VEZÉRLŐ", "ASR", "CSAT", "ELAKADÁSJELZŐ", "ÉRZÉKELŐ", "HÁROMSZÖG", "ISOFIX", "KIPÖRGÉSGÁTLÓ", "LÉGZSÁK", "LÉGZSÁK INDÍTÓ", "MOTORHÁZTETŐ", "PDC", "SZENZOR", "TPMS", "VISSZAJELZŐ", "BIZTONSÁGI ÖV", "CSATLAKOZÓ", "ELEKTRONIKA", "FEDÉL", "HŐVÉDŐ LEMEZ", "JELADÓ", "KORMÁNY", "LÉGZSÁK ÁTVEZETŐ", "LÉGZSÁK KAPCSOLÓ", "OKOS GUMISZELEP", "RIASZTÓ", "TANKAJTÓ", "ÜLÉSFOGLALTSÁG ÉRZÉKELŐ", "VONTATÁS", "BIZTOSÍTÉKTÁBLA", "CSOMAGTÉR", "EMELŐ", "GATEWAY", "IMMOBILIZER", "KÉZIFÉK", "KULCS", "LÉGZSÁK CSATLAKOZÓ", "MAGASSÁG ÁLLÍTÓ", "ÖVFESZÍTŐ", "SRS", "TARTÓ", "ÜTKÖZÉSCSIILLAPÍTÓ", "ZÁRSZERKEZET"]
}

lines = []
idx = 3000 # Keep keys isolated
for cat_id, names in cats.items():
    cleaned_names = [n for n in names if n != "NEM TALÁLOD? KERESD ITT!"]
    unique_names = sorted(list(set(cleaned_names)))
    for name in unique_names:
        lines.append(f'    {{ id: "subcat-{cat_id}-{idx}", categoryId: "{cat_id}", name: "{name}", slug: "{slugify(name)}", productCount: 0 }},')
        idx += 1

print("\n".join(lines))
