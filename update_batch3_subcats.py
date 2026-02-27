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
    "engine": ["ADAGOLÓ", "ALAPJÁRATI MOTOR", "BORDÁSKERÉK", "CSATLAKOZÓ", "DÖRZSKERÉK", "EGR / AGR", "EUROTÁLCA", "FAP", "FOGASKOSZORÚ", "FŰZÖTT BLOKK", "GYERTYAKÁBELEK", "HAJTÓKAR", "HOLTPONT", "INJEKTOR", "KAROSSZÉRIA KÁBELKÖTEG", "KLÍMAHŰTŐ", "LÁNC", "LÉGTÖMEGMÉRŐ", "MOTORFELFÜGGESZTÉS", "AGY", "BAK", "BURKOLAT", "CSÖVEK", "DPF", "ELEKTRONIKA", "ÉKSZÍJ", "FEDÉL", "FOJTÓSZELEP", "GENERÁTOR", "GYÚJTÁSELOSZTÓ", "HENGERFEJ ÉS RÉSZEI", "HŐVÉDŐ LEMEZ", "IZZÍTÓ", "KARTER", "KOMPRESSZOR", "LÁNCFESZÍTŐ GÖRGŐ", "MOTOR", "MOTORVEZÉRLŐ", "AKKUMULÁTOR", "BEFECSKENDEZŐ", "COMMON RAIL", "CSÚCS", "DUGATTYÚ", "ELOSZTÓ", "ÉKSZÍJTÁRCSA", "FÉKRÁSEGÍTŐ", "FORDULATSZÁM", "GÖRGŐ", "GYÚJTÁSELOSZTÓ KÁBEL", "HIDROTŐKE", "HŰTŐRADIÁTOR", "JELADÓ", "KIEGYENLÍTŐ TARTÁLY", "KÖZÖSNYOMÓCSŐ", "LÁNCKERÉK", "MOTORBLOKK", "NEGATÍV KÁBEL", "AKTÍVSZÉN", "BLOKK", "CSAPÁGY", "DINAMÓ", "ECU", "ELŐFŰTŐ", "ÉRZÉKELŐ", "FOGASKERÉK", "FŐTENGELY ÉS RÉSZEI", "GYERTYA", "GYÚJTÁSSZÖG", "HIMBATENGELY", "HŰTŐVÍZ ELOSZTÓ", "KARBURÁTOR", "KLÍMA", "KUPAK", "LENDKERÉK", "MOTORBURKOLAT", "NFU", "NÍVÓPÁLCA", "OLAJHŰTŐ", "PD ELEMEK", "POZÍCIÓ", "SZELEP", "SZERVÓ", "SZÍVÁS ZAJ CSÖKKENTŐ", "TARTÁLY", "TURBÓ", "VÁKUM", "VEZÉRMŰTENGELY", "NYOMÁSÉRZÉKELŐ", "OLAJNYOMÁS", "PILLANGÓSZELEP", "PUMPA", "SZELEPFEDÉL", "SZIVATTYÚ", "SZÍVÓSOR", "TARTÓ", "ÜZEMANYAG ELOSZTÓ CSŐ", "VENTILÁTOR", "VÍZCSŐ", "OKOSKERÉK", "OLAJTEKNŐ", "PORLASZTÓ", "RADIÁTOR", "SZELEPHIMBA", "SZÍJFESZÍTŐ GÖRGŐ", "SZŰRŐ", "TENGELY", "VALVETRONIC", "VEZÉRLÉS", "VÍZHŰTŐ", "OLAJBEÖNTŐ SAPKA", "ÖNINDÍTÓ", "POZITÍV KÁBEL", "RÉSOLAJCSŐ", "SZENZOR", "SZÍJTÁRCSA", "TANK", "TÖMÍTÉS", "VANOS", "VEZÉRLŐ"],
    "electric-motor": ["ABLAKEMELŐ", "AJTÓZÁR MOTOR", "CSATLAKOZÓ", "ESP", "FŰTŐMOTOR", "KORMÁNY", "MOTOR", "SZELEP", "TARTÓ", "TÜKÖR MOZGATÓ MOTOR", "ZSALUÁLLÍTÓ", "ABLAKMOSÓ", "ALAPJÁRATI MOTOR", "CSOMAGTÉRAJTÓ", "ÉKSZÍJTÁRCSA", "GENERÁTOR", "KÖZPONTIZÁR MOTOR", "ÖNINDÍTÓ", "SZERVÓ", "TEMPOMAT", "ÜZEMANYAGSZIVATTYÚ", "ABLAKTÖRLŐ", "ÁLLÓFŰTÉS", "CSÖVEK", "FÉNYSZÓRÓMOSÓ", "HIDRAULIKA", "KUPLUNG ÉS RÉSZEI", "PUMPA", "SZIVATTYÚ", "TETŐ", "VÁKUM", "ABS", "BENZINPUMPA", "DINAMÓ", "FŰTÉS ÁLLÍTÓ", "KOMPRESSZOR", "LÉGKOMPRESSZOR", "RUGÓ", "SZÍJTÁRCSA", "TETŐABLAK", "VISSZAPILLANTÓ MOTOR"],
    "ignition": ["ELEKTRONIKA", "GYÚJTÁSELOSZTÓ", "IZZÍTÓ", "FEDÉL", "GYÚJTÁSKAPCSOLÓ", "KULCS", "GYERTYA", "GYÚJTÁSKAPCSOLÓ HÁZ", "ZÁRBETÉT", "GYERTYAKÁBELEK", "GYÚJTÓTRAFÓ"]
}

lines = []
idx = 2000 # Keep keys isolated
for cat_id, names in cats.items():
    cleaned_names = [n for n in names if n != "NEM TALÁLOD? KERESD ITT!"]
    unique_names = sorted(list(set(cleaned_names)))
    for name in unique_names:
        lines.append(f'    {{ id: "subcat-{cat_id}-{idx}", categoryId: "{cat_id}", name: "{name}", slug: "{slugify(name)}", productCount: 0 }},')
        idx += 1

print("\n".join(lines))
