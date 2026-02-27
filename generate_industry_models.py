import re

models_data = {
    "alfa-romeo": [
        {"series": "145", "models": [{"name": "145", "slug": "145"}]},
        {"series": "146", "models": [{"name": "146", "slug": "146"}]},
        {"series": "147", "models": [{"name": "147", "slug": "147"}]},
        {"series": "155", "models": [{"name": "155", "slug": "155"}]},
        {"series": "156", "models": [{"name": "156", "slug": "156"}]},
        {"series": "159", "models": [{"name": "159", "slug": "159"}]},
        {"series": "164", "models": [{"name": "164", "slug": "164"}]},
        {"series": "166", "models": [{"name": "166", "slug": "166"}]},
        {"series": "33", "models": [{"name": "33", "slug": "33"}]},
        {"series": "75", "models": [{"name": "75", "slug": "75"}]},
        {"series": "90", "models": [{"name": "90", "slug": "90"}]},
        {"series": "4C", "models": [{"name": "4C", "slug": "4c"}]},
        {"series": "ALFASUD", "models": [{"name": "Alfasud", "slug": "alfasud"}]},
        {"series": "ALFETTA", "models": [{"name": "Alfetta", "slug": "alfetta"}]},
        {"series": "BRERA", "models": [{"name": "Brera", "slug": "brera"}]},
        {"series": "GIULIA", "models": [{"name": "Giulia", "slug": "giulia"}]},
        {"series": "GIULIETTA", "models": [{"name": "Giulietta", "slug": "giulietta"}]},
        {"series": "GT", "models": [{"name": "GT", "slug": "gt"}]},
        {"series": "GTV", "models": [{"name": "GTV", "slug": "gtv"}]},
        {"series": "MITO", "models": [{"name": "MiTo", "slug": "mito"}]},
        {"series": "SPIDER", "models": [{"name": "Spider", "slug": "spider"}]},
        {"series": "STELVIO", "models": [{"name": "Stelvio", "slug": "stelvio"}]},
        {"series": "TONALE", "models": [{"name": "Tonale", "slug": "tonale"}]}
    ],
    "audi": [
        {"series": "100", "models": [{"name": "100", "slug": "100"}]},
        {"series": "200", "models": [{"name": "200", "slug": "200"}]},
        {"series": "80", "models": [{"name": "80", "slug": "80"}]},
        {"series": "90", "models": [{"name": "90", "slug": "90"}]},
        {"series": "A1", "models": [{"name": "A1", "slug": "a1"}]},
        {"series": "A2", "models": [{"name": "A2", "slug": "a2"}]},
        {"series": "A3", "models": [
            {"name": "A3 (8L)", "slug": "a3-8l"}, {"name": "A3 (8P)", "slug": "a3-8p"}, {"name": "A3 (8V)", "slug": "a3-8v"}, {"name": "A3 (8Y)", "slug": "a3-8y"}
        ]},
        {"series": "A4", "models": [
            {"name": "A4 (B5)", "slug": "a4-b5"}, {"name": "A4 (B6)", "slug": "a4-b6"}, {"name": "A4 (B7)", "slug": "a4-b7"}, {"name": "A4 (B8)", "slug": "a4-b8"}, {"name": "A4 (B9)", "slug": "a4-b9"}
        ]},
        {"series": "A5", "models": [{"name": "A5", "slug": "a5"}]},
        {"series": "A6", "models": [
            {"name": "A6 (C4)", "slug": "a6-c4"}, {"name": "A6 (C5)", "slug": "a6-c5"}, {"name": "A6 (C6)", "slug": "a6-c6"}, {"name": "A6 (C7)", "slug": "a6-c7"}, {"name": "A6 (C8)", "slug": "a6-c8"}
        ]},
        {"series": "A7", "models": [{"name": "A7", "slug": "a7"}]},
        {"series": "A8", "models": [
            {"name": "A8 (D2)", "slug": "a8-d2"}, {"name": "A8 (D3)", "slug": "a8-d3"}, {"name": "A8 (D4)", "slug": "a8-d4"}, {"name": "A8 (D5)", "slug": "a8-d5"}
        ]},
        {"series": "Q2", "models": [{"name": "Q2", "slug": "q2"}]},
        {"series": "Q3", "models": [{"name": "Q3", "slug": "q3"}]},
        {"series": "Q5", "models": [{"name": "Q5", "slug": "q5"}]},
        {"series": "Q7", "models": [{"name": "Q7", "slug": "q7"}]},
        {"series": "Q8", "models": [{"name": "Q8", "slug": "q8"}]},
        {"series": "E-TRON", "models": [{"name": "Q4 e-tron", "slug": "q4-etron"}, {"name": "Q8 e-tron", "slug": "q8-etron"}, {"name": "e-tron GT", "slug": "etron-gt"}]},
        {"series": "TT", "models": [{"name": "TT (8N)", "slug": "tt-8n"}, {"name": "TT (8J)", "slug": "tt-8j"}, {"name": "TT (8S)", "slug": "tt-8s"}]},
        {"series": "R8", "models": [{"name": "R8", "slug": "r8"}]},
        {"series": "V8", "models": [{"name": "V8", "slug": "v8"}]}
    ],
    "bmw": [
        {"series": "1-ES SOROZAT", "models": [
            {"name": "1 E81/E82/E87/E88", "slug": "1-e8x"}, {"name": "1 F20/F21", "slug": "1-f2x"}, {"name": "1 F40", "slug": "1-f40"}
        ]},
        {"series": "2-ES SOROZAT", "models": [{"name": "2 F22/F23/F44", "slug": "2-f2x"}]},
        {"series": "3-AS SOROZAT", "models": [
            {"name": "3 E30", "slug": "3-e30"}, {"name": "3 E36", "slug": "3-e36"}, {"name": "3 E46", "slug": "3-e46"}, {"name": "3 E90/E91/E92/E93", "slug": "3-e9x"}, {"name": "3 F30/F31/F34", "slug": "3-f3x"}, {"name": "3 G20/G21", "slug": "3-g2x"}
        ]},
        {"series": "4-ES SOROZAT", "models": [{"name": "4 F32/F33/F36", "slug": "4-f3x"}, {"name": "4 G22/G23/G26", "slug": "4-g2x"}]},
        {"series": "5-ÖS SOROZAT", "models": [
            {"name": "5 E34", "slug": "5-e34"}, {"name": "5 E39", "slug": "5-e39"}, {"name": "5 E60/E61", "slug": "5-e6x"}, {"name": "5 F10/F11/F07", "slug": "5-f1x"}, {"name": "5 G30/G31", "slug": "5-g3x"}
        ]},
        {"series": "6-OS SOROZAT", "models": [
            {"name": "6 E63/E64", "slug": "6-e6x"}, {"name": "6 F06/F12/F13", "slug": "6-f1x"}, {"name": "6 G32", "slug": "6-g32"}
        ]},
        {"series": "7-ES SOROZAT", "models": [
            {"name": "7 E38", "slug": "7-e38"}, {"name": "7 E65/E66", "slug": "7-e6x"}, {"name": "7 F01/F02", "slug": "7-f0x"}, {"name": "7 G11/G12", "slug": "7-g1x"}
        ]},
        {"series": "X1", "models": [{"name": "X1 E84", "slug": "x1-e84"}, {"name": "X1 F48", "slug": "x1-f48"}]},
        {"series": "X3", "models": [{"name": "X3 E83", "slug": "x3-e83"}, {"name": "X3 F25", "slug": "x3-f25"}]},
        {"series": "X5", "models": [{"name": "X5 E53", "slug": "x5-e53"}, {"name": "X5 E70", "slug": "x5-e70"}, {"name": "X5 F15", "slug": "x5-f15"}]},
        {"series": "X6", "models": [{"name": "X6 E71", "slug": "x6-e71"}]},
        {"series": "Z3", "models": [{"name": "Z3", "slug": "z3"}]},
        {"series": "Z4", "models": [{"name": "Z4 E85/E86", "slug": "z4-e85"}, {"name": "Z4 E89", "slug": "z4-e89"}]},
        {"series": "I SOROZAT", "models": [{"name": "i3", "slug": "i3"}, {"name": "i8", "slug": "i8"}]}
    ],
    "chevrolet": [
        {"series": "AVEO", "models": [{"name": "Aveo", "slug": "aveo"}]},
        {"series": "CAMARO", "models": [{"name": "Camaro", "slug": "camaro"}]},
        {"series": "CAPTIVA", "models": [{"name": "Captiva", "slug": "captiva"}]},
        {"series": "CORVETTE", "models": [{"name": "Corvette", "slug": "corvette"}]},
        {"series": "CRUZE", "models": [{"name": "Cruze", "slug": "cruze"}]},
        {"series": "EPICA", "models": [{"name": "Epica", "slug": "epica"}]},
        {"series": "EVANDA", "models": [{"name": "Evanda", "slug": "evanda"}]},
        {"series": "KALOS", "models": [{"name": "Kalos", "slug": "kalos"}]},
        {"series": "LACETTI", "models": [{"name": "Lacetti", "slug": "lacetti"}]},
        {"series": "MALIBU", "models": [{"name": "Malibu", "slug": "malibu"}]},
        {"series": "MATIZ", "models": [{"name": "Matiz", "slug": "matiz"}]},
        {"series": "ORLANDO", "models": [{"name": "Orlando", "slug": "orlando"}]},
        {"series": "SPARK", "models": [{"name": "Spark", "slug": "spark"}]},
        {"series": "TRAX", "models": [{"name": "Trax", "slug": "trax"}]}
    ],
    "citroen": [
        {"series": "BERLINGO", "models": [{"name": "Berlingo I", "slug": "berlingo-1"}, {"name": "Berlingo II", "slug": "berlingo-2"}, {"name": "Berlingo III", "slug": "berlingo-3"}]},
        {"series": "C1", "models": [{"name": "C1", "slug": "c1"}]},
        {"series": "C2", "models": [{"name": "C2", "slug": "c2"}]},
        {"series": "C3", "models": [{"name": "C3", "slug": "c3"}, {"name": "C3 Picasso", "slug": "c3-picasso"}, {"name": "C3 Aircross", "slug": "c3-aircross"}]},
        {"series": "C4", "models": [{"name": "C4", "slug": "c4"}, {"name": "C4 Picasso", "slug": "c4-picasso"}, {"name": "C4 Cactus", "slug": "c4-cactus"}]},
        {"series": "C5", "models": [{"name": "C5", "slug": "c5"}, {"name": "C5 Aircross", "slug": "c5-aircross"}]},
        {"series": "C6", "models": [{"name": "C6", "slug": "c6"}]},
        {"series": "C8", "models": [{"name": "C8", "slug": "c8"}]},
        {"series": "DS3", "models": [{"name": "DS3", "slug": "ds3"}]},
        {"series": "DS4", "models": [{"name": "DS4", "slug": "ds4"}]},
        {"series": "DS5", "models": [{"name": "DS5", "slug": "ds5"}]},
        {"series": "JUMPER", "models": [{"name": "Jumper I", "slug": "jumper-1"}, {"name": "Jumper II", "slug": "jumper-2"}, {"name": "Jumper III", "slug": "jumper-3"}]},
        {"series": "JUMPY", "models": [{"name": "Jumpy", "slug": "jumpy"}]},
        {"series": "NEMO", "models": [{"name": "Nemo", "slug": "nemo"}]},
        {"series": "SAXO", "models": [{"name": "Saxo", "slug": "saxo"}]},
        {"series": "XANTIA", "models": [{"name": "Xantia", "slug": "xantia"}]},
        {"series": "XSARA", "models": [{"name": "Xsara", "slug": "xsara"}, {"name": "Xsara Picasso", "slug": "xsara-picasso"}]},
        {"series": "ZX", "models": [{"name": "ZX", "slug": "zx"}]}
    ],
    "dacia": [
        {"series": "1300 / 1310", "models": [{"name": "1300", "slug": "1300"}, {"name": "1310", "slug": "1310"}]},
        {"series": "DOKKER", "models": [{"name": "Dokker", "slug": "dokker"}]},
        {"series": "DUSTER", "models": [{"name": "Duster I", "slug": "duster-1"}, {"name": "Duster II", "slug": "duster-2"}]},
        {"series": "JOGGER", "models": [{"name": "Jogger", "slug": "jogger"}]},
        {"series": "LODGY", "models": [{"name": "Lodgy", "slug": "lodgy"}]},
        {"series": "LOGAN", "models": [{"name": "Logan I", "slug": "logan-1"}, {"name": "Logan II", "slug": "logan-2"}]},
        {"series": "SANDERO", "models": [{"name": "Sandero I", "slug": "sandero-1"}, {"name": "Sandero II", "slug": "sandero-2"}, {"name": "Sandero III", "slug": "sandero-3"}]},
        {"series": "SPRING", "models": [{"name": "Spring", "slug": "spring"}]}
    ],
    "daewoo": [
        {"series": "ESPERO", "models": [{"name": "Espero", "slug": "espero"}]},
        {"series": "KALOS", "models": [{"name": "Kalos", "slug": "kalos"}]},
        {"series": "LACETTI", "models": [{"name": "Lacetti", "slug": "lacetti"}]},
        {"series": "LANOS", "models": [{"name": "Lanos", "slug": "lanos"}]},
        {"series": "LEGANZA", "models": [{"name": "Leganza", "slug": "leganza"}]},
        {"series": "MATIZ", "models": [{"name": "Matiz", "slug": "matiz"}]},
        {"series": "NUBIRA", "models": [{"name": "Nubira I", "slug": "nubira-1"}, {"name": "Nubira II", "slug": "nubira-2"}]},
        {"series": "TACUMA / REZZO", "models": [{"name": "Tacuma", "slug": "tacuma"}]},
        {"series": "TICO", "models": [{"name": "Tico", "slug": "tico"}]}
    ],
    "dodge": [
        {"series": "AVENGER", "models": [{"name": "Avenger", "slug": "avenger"}]},
        {"series": "CALIBER", "models": [{"name": "Caliber", "slug": "caliber"}]},
        {"series": "CARAVAN", "models": [{"name": "Caravan", "slug": "caravan"}]},
        {"series": "CHALLENGER", "models": [{"name": "Challenger", "slug": "challenger"}]},
        {"series": "CHARGER", "models": [{"name": "Charger", "slug": "charger"}]},
        {"series": "JOURNEY", "models": [{"name": "Journey", "slug": "journey"}]},
        {"series": "NITRO", "models": [{"name": "Nitro", "slug": "nitro"}]}
    ],
    "fiat": [
        {"series": "500", "models": [{"name": "500", "slug": "500"}, {"name": "500L", "slug": "500l"}, {"name": "500X", "slug": "500x"}]},
        {"series": "BRAVO / BRAVA", "models": [{"name": "Bravo / Brava", "slug": "bravo"}]},
        {"series": "CINQUECENTO", "models": [{"name": "Cinquecento", "slug": "cinquecento"}]},
        {"series": "CROMA", "models": [{"name": "Croma", "slug": "croma"}]},
        {"series": "DOBLO", "models": [{"name": "Doblo I", "slug": "doblo-1"}, {"name": "Doblo II", "slug": "doblo-2"}]},
        {"series": "DUCATO", "models": [{"name": "Ducato I", "slug": "ducato-1"}, {"name": "Ducato II", "slug": "ducato-2"}, {"name": "Ducato III", "slug": "ducato-3"}]},
        {"series": "FIORINO", "models": [{"name": "Fiorino", "slug": "fiorino"}]},
        {"series": "LINEA", "models": [{"name": "Linea", "slug": "linea"}]},
        {"series": "MULTIPLA", "models": [{"name": "Multipla", "slug": "multipla"}]},
        {"series": "PANDA", "models": [{"name": "Panda I", "slug": "panda-1"}, {"name": "Panda II", "slug": "panda-2"}, {"name": "Panda III", "slug": "panda-3"}]},
        {"series": "PUNTO", "models": [{"name": "Punto I", "slug": "punto-1"}, {"name": "Punto II", "slug": "punto-2"}, {"name": "Punto III / Grande Punto / Evo", "slug": "punto-3"}]},
        {"series": "QUBO", "models": [{"name": "Qubo", "slug": "qubo"}]},
        {"series": "SCUDO", "models": [{"name": "Scudo", "slug": "scudo"}]},
        {"series": "SEICENTO", "models": [{"name": "Seicento", "slug": "seicento"}]},
        {"series": "STILO", "models": [{"name": "Stilo", "slug": "stilo"}]},
        {"series": "TIPO", "models": [{"name": "Tipo", "slug": "tipo"}]}
    ],
    "ford": [
        {"series": "B-MAX", "models": [{"name": "B-MAX", "slug": "b-max"}]},
        {"series": "C-MAX", "models": [{"name": "C-MAX I", "slug": "c-max-1"}, {"name": "C-MAX II", "slug": "c-max-2"}]},
        {"series": "ECOSPORT", "models": [{"name": "EcoSport", "slug": "ecosport"}]},
        {"series": "EDGE", "models": [{"name": "Edge", "slug": "edge"}]},
        {"series": "ESCORT", "models": [{"name": "Escort", "slug": "escort"}]},
        {"series": "FIESTA", "models": [{"name": "Fiesta III", "slug": "fiesta-3"}, {"name": "Fiesta IV", "slug": "fiesta-4"}, {"name": "Fiesta V", "slug": "fiesta-5"}, {"name": "Fiesta VI", "slug": "fiesta-6"}, {"name": "Fiesta VII", "slug": "fiesta-7"}]},
        {"series": "FOCUS", "models": [{"name": "Focus I", "slug": "focus-1"}, {"name": "Focus II", "slug": "focus-2"}, {"name": "Focus III", "slug": "focus-3"}, {"name": "Focus IV", "slug": "focus-4"}]},
        {"series": "FUSION", "models": [{"name": "Fusion", "slug": "fusion"}]},
        {"series": "GALAXY", "models": [{"name": "Galaxy I", "slug": "galaxy-1"}, {"name": "Galaxy II", "slug": "galaxy-2"}, {"name": "Galaxy III", "slug": "galaxy-3"}]},
        {"series": "KA", "models": [{"name": "Ka", "slug": "ka"}, {"name": "Ka+", "slug": "ka-plus"}]},
        {"series": "KUGA", "models": [{"name": "Kuga I", "slug": "kuga-1"}, {"name": "Kuga II", "slug": "kuga-2"}, {"name": "Kuga III", "slug": "kuga-3"}]},
        {"series": "MONDEO", "models": [{"name": "Mondeo I-II", "slug": "mondeo-12"}, {"name": "Mondeo III", "slug": "mondeo-3"}, {"name": "Mondeo IV", "slug": "mondeo-4"}, {"name": "Mondeo V", "slug": "mondeo-5"}]},
        {"series": "PUMA", "models": [{"name": "Puma", "slug": "puma"}]},
        {"series": "RANGER", "models": [{"name": "Ranger", "slug": "ranger"}]},
        {"series": "S-MAX", "models": [{"name": "S-MAX I", "slug": "s-max-1"}, {"name": "S-MAX II", "slug": "s-max-2"}]},
        {"series": "TRANSIT", "models": [{"name": "Transit", "slug": "transit"}, {"name": "Transit Connect", "slug": "transit-connect"}, {"name": "Transit Custom", "slug": "transit-custom"}, {"name": "Transit Courier", "slug": "transit-courier"}]}
    ],
    "honda": [
        {"series": "ACCORD", "models": [{"name": "Accord VI", "slug": "accord-6"}, {"name": "Accord VII", "slug": "accord-7"}, {"name": "Accord VIII", "slug": "accord-8"}]},
        {"series": "CITY", "models": [{"name": "City", "slug": "city"}]},
        {"series": "CIVIC", "models": [{"name": "Civic V", "slug": "civic-5"}, {"name": "Civic VI", "slug": "civic-6"}, {"name": "Civic VII", "slug": "civic-7"}, {"name": "Civic VIII (UFO)", "slug": "civic-8"}, {"name": "Civic IX", "slug": "civic-9"}, {"name": "Civic X", "slug": "civic-10"}]},
        {"series": "CR-V", "models": [{"name": "CR-V I", "slug": "crv-1"}, {"name": "CR-V II", "slug": "crv-2"}, {"name": "CR-V III", "slug": "crv-3"}, {"name": "CR-V IV", "slug": "crv-4"}]},
        {"series": "CR-Z", "models": [{"name": "CR-Z", "slug": "crz"}]},
        {"series": "FR-V", "models": [{"name": "FR-V", "slug": "frv"}]},
        {"series": "HR-V", "models": [{"name": "HR-V", "slug": "hrv"}]},
        {"series": "JAZZ", "models": [{"name": "Jazz II", "slug": "jazz-2"}, {"name": "Jazz III", "slug": "jazz-3"}, {"name": "Jazz IV", "slug": "jazz-4"}]}
    ],
    "hyundai": [
        {"series": "ACCENT", "models": [{"name": "Accent", "slug": "accent"}]},
        {"series": "GETZ", "models": [{"name": "Getz", "slug": "getz"}]},
        {"series": "H-1", "models": [{"name": "H-1 / Starex", "slug": "h1"}]},
        {"series": "I10", "models": [{"name": "i10", "slug": "i10"}]},
        {"series": "I20", "models": [{"name": "i20 I", "slug": "i20-1"}, {"name": "i20 II", "slug": "i20-2"}, {"name": "i20 III", "slug": "i20-3"}]},
        {"series": "I30", "models": [{"name": "i30 I", "slug": "i30-1"}, {"name": "i30 II", "slug": "i30-2"}, {"name": "i30 III", "slug": "i30-3"}]},
        {"series": "I40", "models": [{"name": "i40", "slug": "i40"}]},
        {"series": "IONIQ", "models": [{"name": "Ioniq", "slug": "ioniq"}, {"name": "Ioniq 5", "slug": "ioniq-5"}, {"name": "Ioniq 6", "slug": "ioniq-6"}]},
        {"series": "IX20", "models": [{"name": "ix20", "slug": "ix20"}]},
        {"series": "IX35", "models": [{"name": "ix35", "slug": "ix35"}]},
        {"series": "KONA", "models": [{"name": "Kona", "slug": "kona"}]},
        {"series": "MATRIX", "models": [{"name": "Matrix", "slug": "matrix"}]},
        {"series": "SANTA FE", "models": [{"name": "Santa Fe I", "slug": "santafe-1"}, {"name": "Santa Fe II", "slug": "santafe-2"}, {"name": "Santa Fe III", "slug": "santafe-3"}]},
        {"series": "SONATA", "models": [{"name": "Sonata", "slug": "sonata"}]},
        {"series": "TUCSON", "models": [{"name": "Tucson I", "slug": "tucson-1"}, {"name": "Tucson II", "slug": "tucson-2"}, {"name": "Tucson III", "slug": "tucson-3"}, {"name": "Tucson IV", "slug": "tucson-4"}]}
    ],
    "kia": [
        {"series": "CARENS", "models": [{"name": "Carens I-II", "slug": "carens-12"}, {"name": "Carens III", "slug": "carens-3"}, {"name": "Carens IV", "slug": "carens-4"}]},
        {"series": "CARNIVAL", "models": [{"name": "Carnival", "slug": "carnival"}]},
        {"series": "CEED", "models": [{"name": "Ceed I", "slug": "ceed-1"}, {"name": "Ceed II", "slug": "ceed-2"}, {"name": "Ceed III", "slug": "ceed-3"}]},
        {"series": "CERATO", "models": [{"name": "Cerato", "slug": "cerato"}]},
        {"series": "NIRO", "models": [{"name": "Niro", "slug": "niro"}]},
        {"series": "OPTIMA", "models": [{"name": "Optima", "slug": "optima"}]},
        {"series": "PICANTO", "models": [{"name": "Picanto I", "slug": "picanto-1"}, {"name": "Picanto II", "slug": "picanto-2"}, {"name": "Picanto III", "slug": "picanto-3"}]},
        {"series": "RIO", "models": [{"name": "Rio I", "slug": "rio-1"}, {"name": "Rio II", "slug": "rio-2"}, {"name": "Rio III", "slug": "rio-3"}, {"name": "Rio IV", "slug": "rio-4"}]},
        {"series": "SORENTO", "models": [{"name": "Sorento I", "slug": "sorento-1"}, {"name": "Sorento II", "slug": "sorento-2"}, {"name": "Sorento III", "slug": "sorento-3"}]},
        {"series": "SOUL", "models": [{"name": "Soul", "slug": "soul"}]},
        {"series": "SPORTAGE", "models": [{"name": "Sportage I", "slug": "sportage-1"}, {"name": "Sportage II", "slug": "sportage-2"}, {"name": "Sportage III", "slug": "sportage-3"}, {"name": "Sportage IV", "slug": "sportage-4"}]},
        {"series": "STONIC", "models": [{"name": "Stonic", "slug": "stonic"}]},
        {"series": "VENGA", "models": [{"name": "Venga", "slug": "venga"}]},
        {"series": "XCEED", "models": [{"name": "XCeed", "slug": "xceed"}]}
    ],
    "lada": [
        {"series": "1200-1500 (ZSIGULI)", "models": [{"name": "2101-2107", "slug": "classic"}]},
        {"series": "GRANTA", "models": [{"name": "Granta", "slug": "granta"}]},
        {"series": "KALINA", "models": [{"name": "Kalina", "slug": "kalina"}]},
        {"series": "NIVA", "models": [{"name": "Niva / 4x4", "slug": "niva"}]},
        {"series": "SAMARA", "models": [{"name": "Samara", "slug": "samara"}]},
        {"series": "VESTA", "models": [{"name": "Vesta", "slug": "vesta"}]}
    ],
    "mazda": [
        {"series": "2", "models": [{"name": "Mazda 2 (DY)", "slug": "2-dy"}, {"name": "Mazda 2 (DE)", "slug": "2-de"}, {"name": "Mazda 2 (DJ)", "slug": "2-dj"}]},
        {"series": "3", "models": [{"name": "Mazda 3 (BK)", "slug": "3-bk"}, {"name": "Mazda 3 (BL)", "slug": "3-bl"}, {"name": "Mazda 3 (BM/BN)", "slug": "3-bm"}, {"name": "Mazda 3 (BP)", "slug": "3-bp"}]},
        {"series": "6", "models": [{"name": "Mazda 6 (GG/GY)", "slug": "6-gg"}, {"name": "Mazda 6 (GH)", "slug": "6-gh"}, {"name": "Mazda 6 (GJ/GL)", "slug": "6-gj"}]},
        {"series": "323", "models": [{"name": "323 / 323F", "slug": "323"}]},
        {"series": "626", "models": [{"name": "626", "slug": "626"}]},
        {"series": "CX-3", "models": [{"name": "CX-3", "slug": "cx-3"}]},
        {"series": "CX-5", "models": [{"name": "CX-5", "slug": "cx-5"}]},
        {"series": "CX-7", "models": [{"name": "CX-7", "slug": "cx-7"}]},
        {"series": "MX-5", "models": [{"name": "MX-5 (Miata)", "slug": "mx-5"}]},
        {"series": "RX-8", "models": [{"name": "RX-8", "slug": "rx-8"}]}
    ],
    "mercedes": [
        {"series": "A-OSZTÁLY", "models": [{"name": "A-Osztály (W168)", "slug": "a-w168"}, {"name": "A-Osztály (W169)", "slug": "a-w169"}, {"name": "A-Osztály (W176)", "slug": "a-w176"}, {"name": "A-Osztály (W177)", "slug": "a-w177"}]},
        {"series": "B-OSZTÁLY", "models": [{"name": "B-Osztály (W245)", "slug": "b-w245"}, {"name": "B-Osztály (W246)", "slug": "b-w246"}]},
        {"series": "C-OSZTÁLY", "models": [{"name": "C-Osztály (W202)", "slug": "c-w202"}, {"name": "C-Osztály (W203)", "slug": "c-w203"}, {"name": "C-Osztály (W204)", "slug": "c-w204"}, {"name": "C-Osztály (W205)", "slug": "c-w205"}]},
        {"series": "CLA", "models": [{"name": "CLA (C117)", "slug": "cla-c117"}, {"name": "CLA (C118)", "slug": "cla-c118"}]},
        {"series": "E-OSZTÁLY", "models": [{"name": "E-Osztály (W210)", "slug": "e-w210"}, {"name": "E-Osztály (W211)", "slug": "e-w211"}, {"name": "E-Osztály (W212)", "slug": "e-w212"}, {"name": "E-Osztály (W213)", "slug": "e-w213"}]},
        {"series": "S-OSZTÁLY", "models": [{"name": "S-Osztály (W220)", "slug": "s-w220"}, {"name": "S-Osztály (W221)", "slug": "s-w221"}, {"name": "S-Osztály (W222)", "slug": "s-w222"}]},
        {"series": "GLA / GLB", "models": [{"name": "GLA", "slug": "gla"}, {"name": "GLB", "slug": "glb"}]},
        {"series": "GLC / GLK", "models": [{"name": "GLK", "slug": "glk"}, {"name": "GLC", "slug": "glc"}]},
        {"series": "ML / GLE", "models": [{"name": "ML (W163)", "slug": "ml-w163"}, {"name": "ML (W164)", "slug": "ml-w164"}, {"name": "ML (W166)", "slug": "ml-w166"}, {"name": "GLE", "slug": "gle"}]},
        {"series": "VITO / VIANO", "models": [{"name": "Vito / V-Osztály", "slug": "vito"}]},
        {"series": "SPRINTER", "models": [{"name": "Sprinter", "slug": "sprinter"}]}
    ],
    "nissan": [
        {"series": "ALMERA", "models": [{"name": "Almera", "slug": "almera"}]},
        {"series": "JUKE", "models": [{"name": "Juke", "slug": "juke"}]},
        {"series": "LEAF", "models": [{"name": "Leaf", "slug": "leaf"}]},
        {"series": "MICRA", "models": [{"name": "Micra K11", "slug": "micra-k11"}, {"name": "Micra K12", "slug": "micra-k12"}, {"name": "Micra K13", "slug": "micra-k13"}, {"name": "Micra K14", "slug": "micra-k14"}]},
        {"series": "NAVARA", "models": [{"name": "Navara", "slug": "navara"}]},
        {"series": "NOTE", "models": [{"name": "Note", "slug": "note"}]},
        {"series": "QASHQAI", "models": [{"name": "Qashqai J10", "slug": "qashqai-j10"}, {"name": "Qashqai J11", "slug": "qashqai-j11"}, {"name": "Qashqai J12", "slug": "qashqai-j12"}]},
        {"series": "X-TRAIL", "models": [{"name": "X-Trail", "slug": "x-trail"}]}
    ],
    "opel": [
        {"series": "ASTRA", "models": [{"name": "Astra F", "slug": "astra-f"}, {"name": "Astra G", "slug": "astra-g"}, {"name": "Astra H", "slug": "astra-h"}, {"name": "Astra J", "slug": "astra-j"}, {"name": "Astra K", "slug": "astra-k"}]},
        {"series": "CORSA", "models": [{"name": "Corsa B", "slug": "corsa-b"}, {"name": "Corsa C", "slug": "corsa-c"}, {"name": "Corsa D", "slug": "corsa-d"}, {"name": "Corsa E", "slug": "corsa-e"}]},
        {"series": "VECTRA", "models": [{"name": "Vectra B", "slug": "vectra-b"}, {"name": "Vectra C", "slug": "vectra-c"}]},
        {"series": "INSIGNIA", "models": [{"name": "Insignia A", "slug": "insignia-a"}, {"name": "Insignia B", "slug": "insignia-b"}]},
        {"series": "ZAFIRA", "models": [{"name": "Zafira A", "slug": "zafira-a"}, {"name": "Zafira B", "slug": "zafira-b"}, {"name": "Zafira C", "slug": "zafira-c"}]},
        {"series": "MERIVA", "models": [{"name": "Meriva A", "slug": "meriva-a"}, {"name": "Meriva B", "slug": "meriva-b"}]},
        {"series": "MOKKA", "models": [{"name": "Mokka A", "slug": "mokka-a"}, {"name": "Mokka B", "slug": "mokka-b"}]},
        {"series": "VIVARO", "models": [{"name": "Vivaro A", "slug": "vivaro-a"}, {"name": "Vivaro B", "slug": "vivaro-b"}, {"name": "Vivaro C", "slug": "vivaro-c"}]},
        {"series": "MOVANO", "models": [{"name": "Movano", "slug": "movano"}]},
        {"series": "COMBO", "models": [{"name": "Combo", "slug": "combo"}]}
    ],
    "peugeot": [
        {"series": "206", "models": [{"name": "206", "slug": "206"}]},
        {"series": "207", "models": [{"name": "207", "slug": "207"}]},
        {"series": "208", "models": [{"name": "208 I", "slug": "208-1"}, {"name": "208 II", "slug": "208-2"}]},
        {"series": "307", "models": [{"name": "307", "slug": "307"}]},
        {"series": "308", "models": [{"name": "308 I", "slug": "308-1"}, {"name": "308 II", "slug": "308-2"}, {"name": "308 III", "slug": "308-3"}]},
        {"series": "407", "models": [{"name": "407", "slug": "407"}]},
        {"series": "508", "models": [{"name": "508 I", "slug": "508-1"}, {"name": "508 II", "slug": "508-2"}]},
        {"series": "2008", "models": [{"name": "2008 I", "slug": "2008-1"}, {"name": "2008 II", "slug": "2008-2"}]},
        {"series": "3008", "models": [{"name": "3008 I", "slug": "3008-1"}, {"name": "3008 II", "slug": "3008-2"}]},
        {"series": "5008", "models": [{"name": "5008 I", "slug": "5008-1"}, {"name": "5008 II", "slug": "5008-2"}]},
        {"series": "PARTNER", "models": [{"name": "Partner I", "slug": "partner-1"}, {"name": "Partner II", "slug": "partner-2"}, {"name": "Partner III", "slug": "partner-3"}]},
        {"series": "BOXER", "models": [{"name": "Boxer I", "slug": "boxer-1"}, {"name": "Boxer II", "slug": "boxer-2"}, {"name": "Boxer III", "slug": "boxer-3"}]},
        {"series": "EXPERT", "models": [{"name": "Expert", "slug": "expert"}]}
    ],
    "renault": [
        {"series": "CLIO", "models": [{"name": "Clio II", "slug": "clio-2"}, {"name": "Clio III", "slug": "clio-3"}, {"name": "Clio IV", "slug": "clio-4"}, {"name": "Clio V", "slug": "clio-5"}]},
        {"series": "MEGANE", "models": [{"name": "Megane I", "slug": "megane-1"}, {"name": "Megane II", "slug": "megane-2"}, {"name": "Megane III", "slug": "megane-3"}, {"name": "Megane IV", "slug": "megane-4"}]},
        {"series": "LAGUNA", "models": [{"name": "Laguna I", "slug": "laguna-1"}, {"name": "Laguna II", "slug": "laguna-2"}, {"name": "Laguna III", "slug": "laguna-3"}]},
        {"series": "SCENIC", "models": [{"name": "Scenic I", "slug": "scenic-1"}, {"name": "Scenic II", "slug": "scenic-2"}, {"name": "Scenic III", "slug": "scenic-3"}, {"name": "Scenic IV", "slug": "scenic-4"}]},
        {"series": "ESPACE", "models": [{"name": "Espace III", "slug": "espace-3"}, {"name": "Espace IV", "slug": "espace-4"}, {"name": "Espace V", "slug": "espace-5"}]},
        {"series": "KANGOO", "models": [{"name": "Kangoo I", "slug": "kangoo-1"}, {"name": "Kangoo II", "slug": "kangoo-2"}]},
        {"series": "MASTER", "models": [{"name": "Master II", "slug": "master-2"}, {"name": "Master III", "slug": "master-3"}]},
        {"series": "TRAFIC", "models": [{"name": "Trafic II", "slug": "trafic-2"}, {"name": "Trafic III", "slug": "trafic-3"}]},
        {"series": "CAPTUR", "models": [{"name": "Captur I", "slug": "captur-1"}, {"name": "Captur II", "slug": "captur-2"}]},
        {"series": "THALIA", "models": [{"name": "Thalia I-II", "slug": "thalia"}]},
        {"series": "TWINGO", "models": [{"name": "Twingo I", "slug": "twingo-1"}, {"name": "Twingo II", "slug": "twingo-2"}, {"name": "Twingo III", "slug": "twingo-3"}]}
    ],
    "seat": [
        {"series": "IBIZA", "models": [{"name": "Ibiza II (6K)", "slug": "ibiza-6k"}, {"name": "Ibiza III (6L)", "slug": "ibiza-6l"}, {"name": "Ibiza IV (6J)", "slug": "ibiza-6j"}, {"name": "Ibiza V (6F)", "slug": "ibiza-6f"}]},
        {"series": "LEON", "models": [{"name": "Leon I (1M)", "slug": "leon-1m"}, {"name": "Leon II (1P)", "slug": "leon-1p"}, {"name": "Leon III (5F)", "slug": "leon-5f"}, {"name": "Leon IV (KL)", "slug": "leon-kl"}]},
        {"series": "TOLEDO", "models": [{"name": "Toledo II (1M)", "slug": "toledo-1m"}, {"name": "Toledo III", "slug": "toledo-3"}, {"name": "Toledo IV", "slug": "toledo-4"}]},
        {"series": "ALTEA", "models": [{"name": "Altea / Altea XL", "slug": "altea"}]},
        {"series": "ALHAMBRA", "models": [{"name": "Alhambra I", "slug": "alhambra-1"}, {"name": "Alhambra II", "slug": "alhambra-2"}]},
        {"series": "CORDOBA", "models": [{"name": "Cordoba I (6K)", "slug": "cordoba-6k"}, {"name": "Cordoba II (6L)", "slug": "cordoba-6l"}]},
        {"series": "ATECA", "models": [{"name": "Ateca", "slug": "ateca"}]},
        {"series": "ARONA", "models": [{"name": "Arona", "slug": "arona"}]}
    ],
    "skoda": [
        {"series": "OCTAVIA", "models": [{"name": "Octavia I", "slug": "octavia-1"}, {"name": "Octavia II", "slug": "octavia-2"}, {"name": "Octavia III", "slug": "octavia-3"}, {"name": "Octavia IV", "slug": "octavia-4"}]},
        {"series": "FABIA", "models": [{"name": "Fabia I", "slug": "fabia-1"}, {"name": "Fabia II", "slug": "fabia-2"}, {"name": "Fabia III", "slug": "fabia-3"}, {"name": "Fabia IV", "slug": "fabia-4"}]},
        {"series": "SUPERB", "models": [{"name": "Superb I", "slug": "superb-1"}, {"name": "Superb II", "slug": "superb-2"}, {"name": "Superb III", "slug": "superb-3"}]},
        {"series": "FELICIA", "models": [{"name": "Felicia", "slug": "felicia"}]},
        {"series": "RAPID", "models": [{"name": "Rapid", "slug": "rapid"}]},
        {"series": "YETI", "models": [{"name": "Yeti", "slug": "yeti"}]},
        {"series": "KODIAQ", "models": [{"name": "Kodiaq", "slug": "kodiaq"}]},
        {"series": "KAROQ", "models": [{"name": "Karoq", "slug": "karoq"}]},
        {"series": "KAMIQ", "models": [{"name": "Kamiq", "slug": "kamiq"}]},
        {"series": "SCALA", "models": [{"name": "Scala", "slug": "scala"}]}
    ],
    "suzuki": [
        {"series": "SWIFT", "models": [{"name": "Swift II", "slug": "swift-2"}, {"name": "Swift III", "slug": "swift-3"}, {"name": "Swift IV", "slug": "swift-4"}, {"name": "Swift V", "slug": "swift-5"}]},
        {"series": "VITARA", "models": [{"name": "Vitara I", "slug": "vitara-1"}, {"name": "Grand Vitara", "slug": "grand-vitara"}, {"name": "Vitara (2015-)", "slug": "vitara-2015"}]},
        {"series": "IGNIS", "models": [{"name": "Ignis I", "slug": "ignis-1"}, {"name": "Ignis II", "slug": "ignis-2"}, {"name": "Ignis III", "slug": "ignis-3"}]},
        {"series": "SX4", "models": [{"name": "SX4", "slug": "sx4"}, {"name": "SX4 S-Cross", "slug": "s-cross"}]},
        {"series": "WAGON R+", "models": [{"name": "Wagon R+", "slug": "wagon-r"}]},
        {"series": "SPLASH", "models": [{"name": "Splash", "slug": "splash"}]},
        {"series": "ALTO", "models": [{"name": "Alto", "slug": "alto"}]},
        {"series": "JIMNY", "models": [{"name": "Jimny", "slug": "jimny"}]}
    ],
    "toyota": [
        {"series": "YARIS", "models": [{"name": "Yaris I (XP10)", "slug": "yaris-1"}, {"name": "Yaris II (XP90)", "slug": "yaris-2"}, {"name": "Yaris III (XP130)", "slug": "yaris-3"}, {"name": "Yaris IV", "slug": "yaris-4"}]},
        {"series": "COROLLA", "models": [{"name": "Corolla E11", "slug": "corolla-e11"}, {"name": "Corolla E12", "slug": "corolla-e12"}, {"name": "Corolla E150", "slug": "corolla-e150"}, {"name": "Corolla (2018-)", "slug": "corolla-new"}]},
        {"series": "AURIS", "models": [{"name": "Auris I", "slug": "auris-1"}, {"name": "Auris II", "slug": "auris-2"}]},
        {"series": "AVENSIS", "models": [{"name": "Avensis I (T22)", "slug": "avensis-t22"}, {"name": "Avensis II (T25)", "slug": "avensis-t25"}, {"name": "Avensis III (T27)", "slug": "avensis-t27"}]},
        {"series": "RAV4", "models": [{"name": "RAV4 I", "slug": "rav4-1"}, {"name": "RAV4 II", "slug": "rav4-2"}, {"name": "RAV4 III", "slug": "rav4-3"}, {"name": "RAV4 IV", "slug": "rav4-4"}, {"name": "RAV4 V", "slug": "rav4-5"}]},
        {"series": "AYGO", "models": [{"name": "Aygo I", "slug": "aygo-1"}, {"name": "Aygo II", "slug": "aygo-2"}]},
        {"series": "PRIUS", "models": [{"name": "Prius II", "slug": "prius-2"}, {"name": "Prius III", "slug": "prius-3"}, {"name": "Prius IV", "slug": "prius-4"}]},
        {"series": "HILUX", "models": [{"name": "Hilux", "slug": "hilux"}]},
        {"series": "C-HR", "models": [{"name": "C-HR", "slug": "c-hr"}]}
    ],
    "volkswagen": [
        {"series": "GOLF", "models": [{"name": "Golf III", "slug": "golf-3"}, {"name": "Golf IV", "slug": "golf-4"}, {"name": "Golf V", "slug": "golf-5"}, {"name": "Golf VI", "slug": "golf-6"}, {"name": "Golf VII", "slug": "golf-7"}, {"name": "Golf VIII", "slug": "golf-8"}]},
        {"series": "PASSAT", "models": [{"name": "Passat B4", "slug": "passat-b4"}, {"name": "Passat B5", "slug": "passat-b5"}, {"name": "Passat B6", "slug": "passat-b6"}, {"name": "Passat B7", "slug": "passat-b7"}, {"name": "Passat B8", "slug": "passat-b8"}]},
        {"series": "POLO", "models": [{"name": "Polo III (6N)", "slug": "polo-3"}, {"name": "Polo IV (9N)", "slug": "polo-4"}, {"name": "Polo V (6R)", "slug": "polo-5"}, {"name": "Polo VI (AW)", "slug": "polo-6"}]},
        {"series": "TRANSPORTER", "models": [{"name": "Transporter T4", "slug": "transporter-t4"}, {"name": "Transporter T5", "slug": "transporter-t5"}, {"name": "Transporter T6", "slug": "transporter-t6"}]},
        {"series": "CADDY", "models": [{"name": "Caddy II", "slug": "caddy-2"}, {"name": "Caddy III", "slug": "caddy-3"}, {"name": "Caddy IV", "slug": "caddy-4"}]},
        {"series": "TOURAN", "models": [{"name": "Touran I", "slug": "touran-1"}, {"name": "Touran II", "slug": "touran-2"}]},
        {"series": "TIGUAN", "models": [{"name": "Tiguan I", "slug": "tiguan-1"}, {"name": "Tiguan II", "slug": "tiguan-2"}]},
        {"series": "SHARAN", "models": [{"name": "Sharan I", "slug": "sharan-1"}, {"name": "Sharan II", "slug": "sharan-2"}]},
        {"series": "TOUAREG", "models": [{"name": "Touareg I", "slug": "touareg-1"}, {"name": "Touareg II", "slug": "touareg-2"}, {"name": "Touareg III", "slug": "touareg-3"}]},
        {"series": "CRAFTER", "models": [{"name": "Crafter", "slug": "crafter"}]}
    ],
    "volvo": [
        {"series": "S40 / V40", "models": [{"name": "S40 / V40 I", "slug": "s40-1"}, {"name": "S40 / V50 II", "slug": "s40-2"}, {"name": "V40 (2012-)", "slug": "v40-new"}]},
        {"series": "S60 / V60", "models": [{"name": "S60 / V60 I", "slug": "s60-1"}, {"name": "S60 / V60 II", "slug": "s60-2"}]},
        {"series": "V70 / XC70", "models": [{"name": "V70 I", "slug": "v70-1"}, {"name": "V70 II", "slug": "v70-2"}, {"name": "V70 III", "slug": "v70-3"}]},
        {"series": "XC60", "models": [{"name": "XC60 I", "slug": "xc60-1"}, {"name": "XC60 II", "slug": "xc60-2"}]},
        {"series": "XC90", "models": [{"name": "XC90 I", "slug": "xc90-1"}, {"name": "XC90 II", "slug": "xc90-2"}]}
    ],
    "infiniti": [
        {"series": "FX", "models": [{"name": "FX", "slug": "fx"}]},
        {"series": "Q50", "models": [{"name": "Q50", "slug": "q50"}]}
    ],
    "isuzu": [
        {"series": "D-MAX", "models": [{"name": "D-Max", "slug": "d-max"}]}
    ],
    "iveco": [
        {"series": "DAILY", "models": [{"name": "Daily III", "slug": "daily-3"}, {"name": "Daily IV", "slug": "daily-4"}, {"name": "Daily V", "slug": "daily-5"}, {"name": "Daily VI", "slug": "daily-6"}]},
        {"series": "EUROCARGO", "models": [{"name": "EuroCargo", "slug": "eurocargo"}]}
    ],
    "jaguar": [
        {"series": "X-TYPE", "models": [{"name": "X-Type", "slug": "x-type"}]},
        {"series": "XF", "models": [{"name": "XF", "slug": "xf"}]},
        {"series": "F-PACE", "models": [{"name": "F-Pace", "slug": "f-pace"}]}
    ],
    "jeep": [
        {"series": "GRAND CHEROKEE", "models": [{"name": "Grand Cherokee", "slug": "grand-cherokee"}]},
        {"series": "RENEGADE", "models": [{"name": "Renegade", "slug": "renegade"}]}
    ],
    "lancia": [
        {"series": "YPSILON", "models": [{"name": "Ypsilon", "slug": "ypsilon"}]},
        {"series": "LYBRA", "models": [{"name": "Lybra", "slug": "lybra"}]},
        {"series": "DELTA", "models": [{"name": "Delta", "slug": "delta"}]}
    ],
    "land-rover": [
        {"series": "FREELANDER", "models": [{"name": "Freelander", "slug": "freelander"}]},
        {"series": "RANGE ROVER", "models": [{"name": "Range Rover / Sport", "slug": "rangerover"}]},
        {"series": "DISCOVERY", "models": [{"name": "Discovery", "slug": "discovery"}]}
    ],
    "lexus": [
        {"series": "IS", "models": [{"name": "IS", "slug": "is"}]},
        {"series": "GS", "models": [{"name": "GS", "slug": "gs"}]},
        {"series": "RX", "models": [{"name": "RX", "slug": "rx"}]},
        {"series": "NX", "models": [{"name": "NX", "slug": "nx"}]}
    ],
    "mini": [
        {"series": "COOPER", "models": [{"name": "Cooper (Hatch)", "slug": "cooper"}]},
        {"series": "COUNTRYMAN", "models": [{"name": "Countryman", "slug": "countryman"}]}
    ],
    "mitsubishi": [
        {"series": "OUTLANDER", "models": [{"name": "Outlander", "slug": "outlander"}]},
        {"series": "L200", "models": [{"name": "L200", "slug": "l200"}]},
        {"series": "PAJERO", "models": [{"name": "Pajero", "slug": "pajero"}]},
        {"series": "LANCER", "models": [{"name": "Lancer", "slug": "lancer"}]},
        {"series": "COLT", "models": [{"name": "Colt", "slug": "colt"}]}
    ],
    "saab": [
        {"series": "9-3", "models": [{"name": "9-3", "slug": "9-3"}]},
        {"series": "9-5", "models": [{"name": "9-5", "slug": "9-5"}]}
    ],
    "scania": [
        {"series": "R-SERIES", "models": [{"name": "R-Series", "slug": "r-series"}]}
    ],
    "smart": [
        {"series": "FORTWO", "models": [{"name": "Fortwo", "slug": "fortwo"}]},
        {"series": "FORFOUR", "models": [{"name": "Forfour", "slug": "forfour"}]}
    ],
    "subaru": [
        {"series": "IMPREZA", "models": [{"name": "Impreza", "slug": "impreza"}]},
        {"series": "LEGACY", "models": [{"name": "Legacy / Outback", "slug": "legacy"}]},
        {"series": "FORESTER", "models": [{"name": "Forester", "slug": "forester"}]}
    ]
}

def generate_typescript_array():
    lines = ["export const models: Model[] = ["]
    sorted_brands = sorted(models_data.keys())
    
    for brand_slug in sorted_brands:
        lines.append(f"    // {brand_slug.upper()}")
        categories = models_data[brand_slug]
        for category in categories:
            series_name = category["series"]
            for model in category["models"]:
                uuid_str = f"{brand_slug}-{model['slug']}"
                lines.append(f'    {{ id: "{uuid_str}", brandId: "{brand_slug}", name: "{model["name"]}", slug: "{model["slug"]}", series: "{series_name}" }},')
        lines.append("")
            
    lines.append("];")
    return "\n".join(lines)

with open('src/lib/vehicle-data.ts', 'r') as file:
    content = file.read()

start_marker = "export const models: Model[] = ["
end_marker = "export const categories: Category[] = ["
start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_array = generate_typescript_array()
    new_content = content[:start_idx] + new_array + "\n\n" + content[end_idx:]
    with open('src/lib/vehicle-data.ts', 'w') as file:
        file.write(new_content)
    print("Successfully rebuilt models array with Industry Standard logic.")
else:
    print("Error: Could not find markers.")
