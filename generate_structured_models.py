import re

# Comprehensive list of structured models for the 38 active brands.
# Format: {"Brand Slug": [{"series": "Category/Series", "models": [{"name": "Display Name", "slug": "slug", "years": "optional"}]}]}

models_data = {
    "alfa-romeo": [
        {"series": "Kompakt & Ferdehátú (Hatchback)", "models": [
            {"name": "145", "slug": "145"}, {"name": "146", "slug": "146"}, {"name": "147", "slug": "147"}, 
            {"name": "MiTo", "slug": "mito"}, {"name": "Giulietta", "slug": "giulietta"}
        ]},
        {"series": "Szedán & Kombi (Sedan/Estate)", "models": [
            {"name": "155", "slug": "155"}, {"name": "156", "slug": "156"}, {"name": "159", "slug": "159"}, 
            {"name": "164", "slug": "164"}, {"name": "166", "slug": "166"}, {"name": "Giulia", "slug": "giulia"}
        ]},
        {"series": "Sport & Coupé/Cabrio", "models": [
            {"name": "GT", "slug": "gt"}, {"name": "GTV", "slug": "gtv"}, {"name": "Brera", "slug": "brera"}, 
            {"name": "Spider", "slug": "spider"}, {"name": "4C", "slug": "4c"}
        ]},
        {"series": "SUV & Crossover", "models": [
            {"name": "Stelvio", "slug": "stelvio"}, {"name": "Tonale", "slug": "tonale"}
        ]},
        {"series": "Klasszikus (Classic)", "models": [
            {"name": "33", "slug": "33"}, {"name": "75", "slug": "75"}, {"name": "90", "slug": "90"}, 
            {"name": "Alfasud", "slug": "alfasud"}, {"name": "Alfetta", "slug": "alfetta"}
        ]}
    ],
    "audi": [
        {"series": "Kompakt (A1, A2, A3)", "models": [
            {"name": "A1", "slug": "a1"}, {"name": "A2", "slug": "a2"}, 
            {"name": "A3 (8L)", "slug": "a3-8l"}, {"name": "A3 (8P)", "slug": "a3-8p"}, {"name": "A3 (8V)", "slug": "a3-8v"}, {"name": "A3 (8Y)", "slug": "a3-8y"}
        ]},
        {"series": "Középkategória (A4, A5)", "models": [
            {"name": "80", "slug": "80"}, {"name": "90", "slug": "90"},
            {"name": "A4 (B5)", "slug": "a4-b5"}, {"name": "A4 (B6)", "slug": "a4-b6"}, {"name": "A4 (B7)", "slug": "a4-b7"}, {"name": "A4 (B8)", "slug": "a4-b8"}, {"name": "A4 (B9)", "slug": "a4-b9"},
            {"name": "A5", "slug": "a5"}
        ]},
        {"series": "Felső-Középkategória (A6, A7)", "models": [
            {"name": "100", "slug": "100"}, {"name": "200", "slug": "200"},
            {"name": "A6 (C4)", "slug": "a6-c4"}, {"name": "A6 (C5)", "slug": "a6-c5"}, {"name": "A6 (C6)", "slug": "a6-c6"}, {"name": "A6 (C7)", "slug": "a6-c7"}, {"name": "A6 (C8)", "slug": "a6-c8"},
            {"name": "A7", "slug": "a7"}
        ]},
        {"series": "Luxus (A8)", "models": [
            {"name": "V8", "slug": "v8"}, {"name": "A8 (D2)", "slug": "a8-d2"}, {"name": "A8 (D3)", "slug": "a8-d3"}, {"name": "A8 (D4)", "slug": "a8-d4"}, {"name": "A8 (D5)", "slug": "a8-d5"}
        ]},
        {"series": "SUV (Q széria)", "models": [
            {"name": "Q2", "slug": "q2"}, {"name": "Q3", "slug": "q3"}, {"name": "Q5", "slug": "q5"}, {"name": "Q7", "slug": "q7"}, {"name": "Q8", "slug": "q8"}
        ]},
        {"series": "Elektromos (e-tron)", "models": [
            {"name": "Q4 e-tron", "slug": "q4-etron"}, {"name": "Q8 e-tron", "slug": "q8-etron"}, {"name": "e-tron GT", "slug": "etron-gt"}
        ]},
        {"series": "Sport & Coupé (TT, R8)", "models": [
            {"name": "TT (8N)", "slug": "tt-8n"}, {"name": "TT (8J)", "slug": "tt-8j"}, {"name": "TT (8S)", "slug": "tt-8s"}, {"name": "R8", "slug": "r8"}
        ]}
    ],
    "bmw": [
        {"series": "1-es és 2-es sorozat", "models": [
            {"name": "1 (E81/E82/E87/E88)", "slug": "1-e8x"}, {"name": "1 (F20/F21)", "slug": "1-f2x"}, {"name": "1 (F40)", "slug": "1-f40"},
            {"name": "2 (F22/F23/F44)", "slug": "2-f2x"}
        ]},
        {"series": "3-as sorozat", "models": [
            {"name": "3 (E30)", "slug": "3-e30"}, {"name": "3 (E36)", "slug": "3-e36"}, {"name": "3 (E46)", "slug": "3-e46"}, {"name": "3 (E46 Compact)", "slug": "3-e46-compact"},
            {"name": "3 (E90/E91/E92/E93)", "slug": "3-e9x"}, {"name": "3 (F30/F31/F34 GT)", "slug": "3-f3x"}, {"name": "3 (G20/G21)", "slug": "3-g2x"}
        ]},
        {"series": "4-es sorozat", "models": [
            {"name": "4 (F32/F33/F36)", "slug": "4-f3x"}, {"name": "4 (G22/G23/G26)", "slug": "4-g2x"}
        ]},
        {"series": "5-ös sorozat", "models": [
            {"name": "5 (E34)", "slug": "5-e34"}, {"name": "5 (E39)", "slug": "5-e39"}, {"name": "5 (E60/E61)", "slug": "5-e6x"},
            {"name": "5 (F10/F11/F07 GT)", "slug": "5-f1x"}, {"name": "5 (G30/G31)", "slug": "5-g3x"}
        ]},
        {"series": "6-os és 7-es sorozat", "models": [
            {"name": "6 (E63/E64)", "slug": "6-e6x"}, {"name": "6 (F06/F12/F13)", "slug": "6-f1x"}, {"name": "6 (G32 GT)", "slug": "6-g32"},
            {"name": "7 (E38)", "slug": "7-e38"}, {"name": "7 (E65/E66)", "slug": "7-e6x"}, {"name": "7 (F01/F02)", "slug": "7-f0x"}, {"name": "7 (G11/G12)", "slug": "7-g1x"}
        ]},
        {"series": "X széria (SUV/SAV)", "models": [
            {"name": "X1 (E84)", "slug": "x1-e84"}, {"name": "X1 (F48)", "slug": "x1-f48"}, {"name": "X3 (E83)", "slug": "x3-e83"}, {"name": "X3 (F25)", "slug": "x3-f25"},
            {"name": "X5 (E53)", "slug": "x5-e53"}, {"name": "X5 (E70)", "slug": "x5-e70"}, {"name": "X5 (F15)", "slug": "x5-f15"}, {"name": "X6 (E71)", "slug": "x6-e71"}
        ]},
        {"series": "Z és i széria (Sport & EV)", "models": [
            {"name": "Z3", "slug": "z3"}, {"name": "Z4 (E85/E86)", "slug": "z4-e85"}, {"name": "Z4 (E89)", "slug": "z4-e89"},
            {"name": "i3", "slug": "i3"}, {"name": "i8", "slug": "i8"}
        ]}
    ],
    "chevrolet": [
        {"series": "Kompakt és Kisautó", "models": [
            {"name": "Spark", "slug": "spark"}, {"name": "Matiz", "slug": "matiz"}, {"name": "Aveo", "slug": "aveo"}, {"name": "Cruze", "slug": "cruze"}, {"name": "Kalos", "slug": "kalos"}
        ]},
        {"series": "Szedán és Középkategória", "models": [
            {"name": "Lacetti", "slug": "lacetti"}, {"name": "Epica", "slug": "epica"}, {"name": "Evanda", "slug": "evanda"}, {"name": "Malibu", "slug": "malibu"}
        ]},
        {"series": "SUV & Egyterű", "models": [
            {"name": "Captiva", "slug": "captiva"}, {"name": "Orlando", "slug": "orlando"}, {"name": "Trax", "slug": "trax"}, {"name": "Trans Sport", "slug": "trans-sport"}
        ]},
        {"series": "Sport & USA Model", "models": [
            {"name": "Camaro", "slug": "camaro"}, {"name": "Corvette", "slug": "corvette"}, {"name": "Tahoe/Suburban", "slug": "tahoe"}
        ]}
    ],
    "citroen": [
        {"series": "Kisautó & Kompakt (C1-C2-C3-C4)", "models": [
            {"name": "C1", "slug": "c1"}, {"name": "C2", "slug": "c2"}, {"name": "C3", "slug": "c3"}, {"name": "C3 Picasso", "slug": "c3-picasso"}, 
            {"name": "C4", "slug": "c4"}, {"name": "C4 Picasso", "slug": "c4-picasso"}, {"name": "C4 Cactus", "slug": "c4-cactus"}
        ]},
        {"series": "Közép- és Felső kategória (C5-C6-C8)", "models": [
            {"name": "C5", "slug": "c5"}, {"name": "C5 Aircross", "slug": "c5-aircross"}, {"name": "C6", "slug": "c6"}, {"name": "C8", "slug": "c8"}
        ]},
        {"series": "DS Prémium Modellcsalád", "models": [
            {"name": "DS3", "slug": "ds3"}, {"name": "DS4", "slug": "ds4"}, {"name": "DS5", "slug": "ds5"}
        ]},
        {"series": "Régebbi Modellek", "models": [
            {"name": "Saxo", "slug": "saxo"}, {"name": "Xsara", "slug": "xsara"}, {"name": "Xantia", "slug": "xantia"}, {"name": "ZX", "slug": "zx"}, {"name": "XM", "slug": "xm"}
        ]},
        {"series": "Kishaszongépjármű & Dobozos", "models": [
            {"name": "Berlingo", "slug": "berlingo"}, {"name": "Nemo", "slug": "nemo"}, {"name": "Jumpy", "slug": "jumpy"}, {"name": "Jumper", "slug": "jumper"}
        ]}
    ],
    "dacia": [
        {"series": "Személyautó (Passanger)", "models": [
            {"name": "Logan", "slug": "logan"}, {"name": "Sandero", "slug": "sandero"}, {"name": "Jogger", "slug": "jogger"}, {"name": "Lodgy", "slug": "lodgy"}
        ]},
        {"series": "SUV & Haszongépjármű (Utility/SUV)", "models": [
            {"name": "Duster", "slug": "duster"}, {"name": "Dokker", "slug": "dokker"}, {"name": "Pick Up", "slug": "pick-up"}
        ]},
        {"series": "Klasszikus & Retró (Classic)", "models": [
            {"name": "1300 / 1310", "slug": "1300"}, {"name": "Nova / SupeRNova", "slug": "nova"}
        ]},
        {"series": "Elektromos (EV)", "models": [
            {"name": "Spring", "slug": "spring"}
        ]}
    ],
    "daewoo": [
        {"series": "Személyautó", "models": [
            {"name": "Matiz", "slug": "matiz"}, {"name": "Tico", "slug": "tico"}, {"name": "Lanos", "slug": "lanos"}, {"name": "Kalos", "slug": "kalos"}, 
            {"name": "Nubira", "slug": "nubira"}, {"name": "Lacetti", "slug": "lacetti"}, {"name": "Espero", "slug": "espero"}, {"name": "Leganza", "slug": "leganza"}
        ]},
        {"series": "Egyéb", "models": [
            {"name": "Tacuma / Rezzo", "slug": "tacuma"}, {"name": "Lublin", "slug": "lublin"}
        ]}
    ],
    "dodge": [
        {"series": "SUV & MPV", "models": [
            {"name": "Journey", "slug": "journey"}, {"name": "Nitro", "slug": "nitro"}, {"name": "Caravan", "slug": "caravan"}
        ]},
        {"series": "Személyautó & Sport", "models": [
            {"name": "Caliber", "slug": "caliber"}, {"name": "Avenger", "slug": "avenger"}, {"name": "Charger", "slug": "charger"}, {"name": "Challenger", "slug": "challenger"}
        ]}
    ],
    "fiat": [
        {"series": "Városi Kisautó (City)", "models": [
            {"name": "500", "slug": "500"}, {"name": "Panda", "slug": "panda"}, {"name": "Punto (Classic)", "slug": "punto-classic"}, 
            {"name": "Grande Punto / Evo", "slug": "grande-punto"}, {"name": "Seicento", "slug": "seicento"}, {"name": "Cinquecento", "slug": "cinquecento"}
        ]},
        {"series": "Kompakt & Családi (Family)", "models": [
            {"name": "Bravo / Brava", "slug": "bravo"}, {"name": "Stilo", "slug": "stilo"}, {"name": "Tipo", "slug": "tipo"}, 
            {"name": "Linea", "slug": "linea"}, {"name": "Multipla", "slug": "multipla"}, {"name": "Croma", "slug": "croma"}
        ]},
        {"series": "Kishaszongépjármű (Commercial)", "models": [
            {"name": "Ducato", "slug": "ducato"}, {"name": "Doblo", "slug": "doblo"}, {"name": "Fiorino", "slug": "fiorino"}, 
            {"name": "Scudo", "slug": "scudo"}, {"name": "Qubo", "slug": "qubo"}
        ]}
    ],
    "ford": [
        {"series": "Kisautó (Small)", "models": [
            {"name": "Ka / Ka+", "slug": "ka"}, {"name": "Fiesta", "slug": "fiesta"}, {"name": "Puma (Retro/Új)", "slug": "puma"}
        ]},
        {"series": "Kompakt (Compact)", "models": [
            {"name": "Focus I (Mk1)", "slug": "focus-1"}, {"name": "Focus II (Mk2)", "slug": "focus-2"}, 
            {"name": "Focus III (Mk3)", "slug": "focus-3"}, {"name": "Focus IV (Mk4)", "slug": "focus-4"}, {"name": "Escort", "slug": "escort"}
        ]},
        {"series": "Középkategória & Családi (Mid-size & MPV)", "models": [
            {"name": "Mondeo I-III", "slug": "mondeo-13"}, {"name": "Mondeo IV-V", "slug": "mondeo-45"},
            {"name": "C-MAX", "slug": "c-max"}, {"name": "S-MAX", "slug": "s-max"}, {"name": "Galaxy", "slug": "galaxy"}
        ]},
        {"series": "SUV & Pick-up", "models": [
            {"name": "Kuga", "slug": "kuga"}, {"name": "EcoSport", "slug": "ecosport"}, {"name": "Ranger", "slug": "ranger"}, {"name": "Edge", "slug": "edge"}
        ]},
        {"series": "Haszongépjármű (Commercial)", "models": [
            {"name": "Transit", "slug": "transit"}, {"name": "Transit Custom", "slug": "transit-custom"}, {"name": "Transit Connect", "slug": "transit-connect"}
        ]}
    ],
    "honda": [
        {"series": "Hatchback & Sedan", "models": [
            {"name": "Civic (Mk6-Mk7)", "slug": "civic-67"}, {"name": "Civic (Mk8 UFO)", "slug": "civic-8"}, {"name": "Civic (Mk9-Mk11)", "slug": "civic-911"},
            {"name": "Accord", "slug": "accord"}, {"name": "Jazz", "slug": "jazz"}, {"name": "City", "slug": "city"}
        ]},
        {"series": "SUV & MPV & Sport", "models": [
            {"name": "CR-V", "slug": "cr-v"}, {"name": "HR-V", "slug": "hr-v"}, {"name": "FR-V", "slug": "fr-v"}, {"name": "CRX / S2000", "slug": "sport"}
        ]}
    ],
    "hyundai": [
        {"series": "i-sorozat (i-Series)", "models": [
            {"name": "i10", "slug": "i10"}, {"name": "i20", "slug": "i20"}, {"name": "i30", "slug": "i30"}, {"name": "i40", "slug": "i40"}, {"name": "ix20", "slug": "ix20"}, {"name": "ix35", "slug": "ix35"}
        ]},
        {"series": "SUV", "models": [
            {"name": "Tucson", "slug": "tucson"}, {"name": "Santa Fe", "slug": "santa-fe"}, {"name": "Kona", "slug": "kona"}
        ]},
        {"series": "Korábbi & Egyéb Modellek (Legacy)", "models": [
            {"name": "Getz", "slug": "getz"}, {"name": "Accent", "slug": "accent"}, {"name": "Matrix", "slug": "matrix"}, {"name": "Sonata", "slug": "sonata"}, {"name": "H-1 / H200", "slug": "h1"}
        ]}
    ],
    "kia": [
        {"series": "Személyautó (Passanger)", "models": [
            {"name": "Picanto", "slug": "picanto"}, {"name": "Rio", "slug": "rio"}, {"name": "Ceed / ProCeed", "slug": "ceed"}, 
            {"name": "Cerato / Forte", "slug": "cerato"}, {"name": "Optima / Magentis", "slug": "optima"}
        ]},
        {"series": "SUV & MPV", "models": [
            {"name": "Sportage", "slug": "sportage"}, {"name": "Sorento", "slug": "sorento"}, {"name": "Niro", "slug": "niro"}, 
            {"name": "XCeed", "slug": "xceed"}, {"name": "Carens", "slug": "carens"}, {"name": "Carnival", "slug": "carnival"}
        ]}
    ],
    "lada": [
        {"series": "Klasszikus", "models": [
            {"name": "Niva / 4x4", "slug": "niva"}, {"name": "2101-2107 (Zsiguli)", "slug": "classic"}, {"name": "Samara", "slug": "samara"}
        ]},
        {"series": "Modern", "models": [
            {"name": "Kalina", "slug": "kalina"}, {"name": "Granta", "slug": "granta"}, {"name": "Vesta", "slug": "vesta"}
        ]}
    ],
    "mazda": [
        {"series": "Személyautó (Passanger)", "models": [
            {"name": "Mazda 2 / Demio", "slug": "mazda2"}, {"name": "Mazda 3 (BK, BL, BM)", "slug": "mazda3"}, {"name": "Mazda 6 (GG, GH, GJ)", "slug": "mazda6"},
            {"name": "323 / 323F", "slug": "323"}, {"name": "626", "slug": "626"}
        ]},
        {"series": "SUV & Sport", "models": [
            {"name": "CX-3", "slug": "cx3"}, {"name": "CX-5", "slug": "cx5"}, {"name": "CX-7", "slug": "cx7"}, {"name": "MX-5 (Miata)", "slug": "mx5"}, {"name": "RX-8", "slug": "rx8"}
        ]}
    ],
    "mercedes": [
        {"series": "Kompakt (A, B, CLA)", "models": [
            {"name": "A-Osztály (W168/W169)", "slug": "a-class-old"}, {"name": "A-Osztály (W176/W177)", "slug": "a-class-new"}, 
            {"name": "B-Osztály (W245/W246)", "slug": "b-class"}, {"name": "CLA (C117/C118)", "slug": "cla"}
        ]},
        {"series": "Közép & Luxus (C, E, S)", "models": [
            {"name": "C-Osztály (W202/W203/W204)", "slug": "c-class-old"}, {"name": "C-Osztály (W205/W206)", "slug": "c-class-new"},
            {"name": "E-Osztály (W210/W211/W212/W213)", "slug": "e-class"}, {"name": "S-Osztály (W220/W221/W222)", "slug": "s-class"}
        ]},
        {"series": "SUV kategória (GLA, GLC, ML/GLE)", "models": [
            {"name": "GLA / GLB", "slug": "gla-glb"}, {"name": "GLC / GLK", "slug": "glc-glk"}, {"name": "ML / GLE (W163/W164/W166)", "slug": "ml-gle"}
        ]},
        {"series": "Haszongépjármű (Commercial)", "models": [
            {"name": "Vito / Viano", "slug": "vito"}, {"name": "Sprinter", "slug": "sprinter"}
        ]}
    ],
    "nissan": [
        {"series": "Kompakt & Városi", "models": [
            {"name": "Micra (K11/K12/K13/K14)", "slug": "micra"}, {"name": "Almera", "slug": "almera"}, {"name": "Note", "slug": "note"}, {"name": "Leaf", "slug": "leaf"}
        ]},
        {"series": "SUV & Crossover", "models": [
            {"name": "Qashqai / Qashqai+2", "slug": "qashqai"}, {"name": "Juke", "slug": "juke"}, {"name": "X-Trail", "slug": "x-trail"}, {"name": "Navara", "slug": "navara"}
        ]}
    ],
    "opel": [
        {"series": "Kompakt & Kisautó", "models": [
            {"name": "Corsa (B, C, D, E)", "slug": "corsa"}, {"name": "Astra (F, G, H, J, K)", "slug": "astra"}, {"name": "Agila", "slug": "agila"}, {"name": "Adam", "slug": "adam"}
        ]},
        {"series": "Középkategória", "models": [
            {"name": "Vectra (A, B, C)", "slug": "vectra"}, {"name": "Insignia", "slug": "insignia"}, {"name": "Omega", "slug": "omega"}
        ]},
        {"series": "Egyterű & SUV", "models": [
            {"name": "Zafira (A, B, C)", "slug": "zafira"}, {"name": "Meriva", "slug": "meriva"}, {"name": "Mokka", "slug": "mokka"}, {"name": "Antara", "slug": "antara"}
        ]},
        {"series": "Haszongépjármű", "models": [
            {"name": "Vivaro", "slug": "vivaro"}, {"name": "Combo", "slug": "combo"}, {"name": "Movano", "slug": "movano"}
        ]}
    ],
    "peugeot": [
        {"series": "Személyautók (Hatchback/Sedan)", "models": [
            {"name": "206", "slug": "206"}, {"name": "207", "slug": "207"}, {"name": "208", "slug": "208"}, 
            {"name": "307", "slug": "307"}, {"name": "308", "slug": "308"}, {"name": "407", "slug": "407"}, {"name": "508", "slug": "508"}
        ]},
        {"series": "SUV & Crossover", "models": [
            {"name": "2008", "slug": "2008"}, {"name": "3008", "slug": "3008"}, {"name": "5008", "slug": "5008"}
        ]},
        {"series": "Haszongépjármű", "models": [
            {"name": "Partner", "slug": "partner"}, {"name": "Boxer", "slug": "boxer"}, {"name": "Expert", "slug": "expert"}
        ]}
    ],
    "renault": [
        {"series": "Hatchback & Sedan", "models": [
            {"name": "Clio (I-IV)", "slug": "clio"}, {"name": "Megane (I-IV)", "slug": "megane"}, {"name": "Twingo", "slug": "twingo"}, 
            {"name": "Laguna", "slug": "laguna"}, {"name": "Thalia", "slug": "thalia"}, {"name": "Fluence", "slug": "fluence"}
        ]},
        {"series": "SUV & Egyterű", "models": [
            {"name": "Scenic / Grand Scenic", "slug": "scenic"}, {"name": "Espace", "slug": "espace"}, {"name": "Captur", "slug": "captur"}, {"name": "Kadjar", "slug": "kadjar"}
        ]},
        {"series": "Haszongépjármű", "models": [
            {"name": "Kangoo", "slug": "kangoo"}, {"name": "Master", "slug": "master"}, {"name": "Trafic", "slug": "trafic"}
        ]}
    ],
    "seat": [
        {"series": "Hatchback & Sedan", "models": [
            {"name": "Ibiza", "slug": "ibiza"}, {"name": "Leon", "slug": "leon"}, {"name": "Toledo", "slug": "toledo"}, {"name": "Cordoba", "slug": "cordoba"}
        ]},
        {"series": "Egyterű & SUV", "models": [
            {"name": "Altea / Altea XL", "slug": "altea"}, {"name": "Alhambra", "slug": "alhambra"}, {"name": "Ateca", "slug": "ateca"}, {"name": "Arona", "slug": "arona"}
        ]}
    ],
    "skoda": [
        {"series": "Személyautó (Kompakt/Szedán)", "models": [
            {"name": "Octavia (I-III)", "slug": "octavia-old"}, {"name": "Octavia (IV)", "slug": "octavia-new"}, 
            {"name": "Fabia (I-III)", "slug": "fabia"}, {"name": "Superb (I-III)", "slug": "superb"}, 
            {"name": "Rapid", "slug": "rapid"}, {"name": "Felicia", "slug": "felicia"}, {"name": "Scala", "slug": "scala"}
        ]},
        {"series": "SUV & Crossover", "models": [
            {"name": "Yeti", "slug": "yeti"}, {"name": "Kodiaq", "slug": "kodiaq"}, {"name": "Karoq", "slug": "karoq"}, {"name": "Kamiq", "slug": "kamiq"}
        ]}
    ],
    "suzuki": [
        {"series": "Városi & Kompakt", "models": [
            {"name": "Swift", "slug": "swift"}, {"name": "Ignis", "slug": "ignis"}, {"name": "Splash", "slug": "splash"}, {"name": "Alto", "slug": "alto"}, {"name": "Wagon R+", "slug": "wagonr"}
        ]},
        {"series": "SUV & Crossover", "models": [
            {"name": "Vitara", "slug": "vitara"}, {"name": "SX4 / SX4 S-Cross", "slug": "sx4"}, {"name": "Jimny", "slug": "jimny"}
        ]}
    ],
    "toyota": [
        {"series": "Hatchback & Sedan", "models": [
            {"name": "Yaris", "slug": "yaris"}, {"name": "Corolla", "slug": "corolla"}, {"name": "Auris", "slug": "auris"}, {"name": "Avensis", "slug": "avensis"}, {"name": "Aygo", "slug": "aygo"}
        ]},
        {"series": "Hybrid & EV", "models": [
            {"name": "Prius", "slug": "prius"}, {"name": "C-HR", "slug": "chr"}
        ]},
        {"series": "SUV & Pick-up", "models": [
            {"name": "RAV4", "slug": "rav4"}, {"name": "Hilux", "slug": "hilux"}, {"name": "Land Cruiser", "slug": "landcruiser"}
        ]}
    ],
    "volkswagen": [
        {"series": "Hatchback & Kompakt", "models": [
            {"name": "Golf I-IV", "slug": "golf14"}, {"name": "Golf V-VIII", "slug": "golf58"}, {"name": "Polo", "slug": "polo"}, {"name": "Lupo / Up!", "slug": "lupo-up"}
        ]},
        {"series": "Szedán & Kombi", "models": [
            {"name": "Passat B3-B5", "slug": "passat-old"}, {"name": "Passat B6-B8", "slug": "passat-new"}, {"name": "Jetta / Bora / Vento", "slug": "jetta-bora"}
        ]},
        {"series": "Egyterű (MPV)", "models": [
            {"name": "Touran", "slug": "touran"}, {"name": "Sharan", "slug": "sharan"}
        ]},
        {"series": "SUV & Crossover", "models": [
            {"name": "Tiguan", "slug": "tiguan"}, {"name": "Touareg", "slug": "touareg"}, {"name": "T-Roc / T-Cross", "slug": "t-roc"}
        ]},
        {"series": "Haszongépjármű", "models": [
            {"name": "Transporter (T4, T5, T6)", "slug": "transporter"}, {"name": "Caddy", "slug": "caddy"}, {"name": "Crafter / LT", "slug": "crafter"}
        ]}
    ],
    "volvo": [
        {"series": "Személyautó (S/V/C)", "models": [
            {"name": "S40 / V40", "slug": "s40-v40"}, {"name": "S60 / V60", "slug": "s60-v60"}, {"name": "V70 / XC70", "slug": "v70"}, {"name": "S80", "slug": "s80"}, {"name": "C30", "slug": "c30"}
        ]},
        {"series": "SUV (XC)", "models": [
            {"name": "XC60", "slug": "xc60"}, {"name": "XC90", "slug": "xc90"}
        ]}
    ],
    # Generic fill for missing brands
    "infiniti": [{"series": "Általános (Minden Modell)", "models": [{"name": "FX", "slug": "fx"}, {"name": "Q50", "slug": "q50"}]}],
    "isuzu": [{"series": "Általános (Minden Modell)", "models": [{"name": "D-Max", "slug": "d-max"}]}],
    "iveco": [{"series": "Általános (Minden Modell)", "models": [{"name": "Daily", "slug": "daily"}, {"name": "EuroCargo", "slug": "eurocargo"}]}],
    "jaguar": [{"series": "Általános (Minden Modell)", "models": [{"name": "X-Type", "slug": "x-type"}, {"name": "XF", "slug": "xf"}, {"name": "F-Pace", "slug": "f-pace"}]}],
    "jeep": [{"series": "Általános (Minden Modell)", "models": [{"name": "Grand Cherokee", "slug": "grand-cherokee"}, {"name": "Renegade", "slug": "renegade"}]}],
    "lancia": [{"series": "Általános (Minden Modell)", "models": [{"name": "Ypsilon", "slug": "ypsilon"}, {"name": "Lybra", "slug": "lybra"}, {"name": "Delta", "slug": "delta"}]}],
    "land-rover": [{"series": "Általános (Minden Modell)", "models": [{"name": "Freelander", "slug": "freelander"}, {"name": "Range Rover / Sport", "slug": "rangerover"}, {"name": "Discovery", "slug": "discovery"}]}],
    "lexus": [{"series": "Általános (Minden Modell)", "models": [{"name": "IS", "slug": "is"}, {"name": "GS", "slug": "gs"}, {"name": "RX", "slug": "rx"}, {"name": "NX", "slug": "nx"}]}],
    "mini": [{"series": "Általános (Minden Modell)", "models": [{"name": "Cooper (Hatch)", "slug": "cooper"}, {"name": "Countryman", "slug": "countryman"}]}],
    "mitsubishi": [{"series": "Általános (Minden Modell)", "models": [{"name": "Outlander", "slug": "outlander"}, {"name": "L200", "slug": "l200"}, {"name": "Pajero", "slug": "pajero"}, {"name": "Lancer", "slug": "lancer"}, {"name": "Colt", "slug": "colt"}]}],
    "saab": [{"series": "Általános (Minden Modell)", "models": [{"name": "9-3", "slug": "9-3"}, {"name": "9-5", "slug": "9-5"}]}],
    "scania": [{"series": "Általános (Minden Modell)", "models": [{"name": "R-Series", "slug": "r-series"}]}],
    "smart": [{"series": "Általános (Minden Modell)", "models": [{"name": "Fortwo", "slug": "fortwo"}, {"name": "Forfour", "slug": "forfour"}]}],
    "subaru": [{"series": "Általános (Minden Modell)", "models": [{"name": "Impreza", "slug": "impreza"}, {"name": "Legacy / Outback", "slug": "legacy"}, {"name": "Forester", "slug": "forester"}]}]
}

def generate_typescript_array():
    lines = ["export const models: Model[] = ["]
    
    # Sort brands alphabetically
    sorted_brands = sorted(models_data.keys())
    
    for brand_slug in sorted_brands:
        lines.append(f"    // {brand_slug.upper()}")
        categories = models_data[brand_slug]
        
        for category in categories:
            series_name = category["series"]
            for model in category["models"]:
                uuid_str = f"{brand_slug}-{model['slug']}"
                lines.append(f'    {{ id: "{uuid_str}", brandId: "{brand_slug}", name: "{model["name"]}", slug: "{model["slug"]}", series: "{series_name}" }},')
        lines.append("") # Empty line between brands
            
    lines.append("];")
    return "\n".join(lines)

with open('src/lib/vehicle-data.ts', 'r') as file:
    content = file.read()

# Replace everything from export const models: Model[] = [ to export const categories: Category[] = [
start_marker = "export const models: Model[] = ["
end_marker = "export const categories: Category[] = ["

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_array = generate_typescript_array()
    
    # We want to keep the "export const categories" intact, so we replace up to just before it
    new_content = content[:start_idx] + new_array + "\n\n" + content[end_idx:]
    
    with open('src/lib/vehicle-data.ts', 'w') as file:
        file.write(new_content)
    print("Successfully replaced models array with categorized structure.")
else:
    print("Error: Could not find markers.")
