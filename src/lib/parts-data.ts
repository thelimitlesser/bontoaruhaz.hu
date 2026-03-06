import {
    IconCarDoor,
    IconHeadlight,
    IconWindshield,
    IconSideMirror,
    IconCarSeat,
    IconDashboard,
    IconRadiator,
    IconEngine,
    IconAlternator,
    IconSparkPlug,
    IconECU,
    IconSwitch,
    IconAirbag,
    IconKey,
    IconGearShifter,
    IconBrakeDisc,
    IconSteeringWheel,
    IconFuel,
    IconExhaust
} from"@/components/icons/AutoIcons";
import { PlusCircle } from"lucide-react";

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: any;
}

export interface Subcategory {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
}

export interface PartItem {
    id: string;
    subcategoryId: string;
    name: string;
    slug: string;
}

export const categories: Category[] = [
    { id:"body-exterior", name:"Karosszéria elem (lemez)", slug:"karosszeria-elem", icon: IconCarDoor },
    { id:"lights", name:"Lámpa, index, világítás", slug:"lampa-vilagitas", icon: IconHeadlight },
    { id:"glass", name:"Üveg/ablak/tükör", slug:"uveg-ablak-tukor", icon: IconWindshield },
    { id:"body-other", name:"Karosszéria egyéb", slug:"karosszeria-egyeb", icon: IconSideMirror },
    { id:"interior", name:"Utastér", slug:"utaster", icon: IconCarSeat },
    { id:"displays", name:"Kijelzők, Hifi, GPS, telefon", slug:"kijelzok-hifi", icon: IconDashboard },
    { id:"cooling", name:"Hűtés-Fűtés, Levegő-Víz", slug:"hutes-futes", icon: IconRadiator },
    { id:"engine", name:"Motor, motorikus alkatrész", slug:"motor", icon: IconEngine },
    { id:"electric-motor", name:"Elektro-motor, pumpa, generátor", slug:"elektro-motor", icon: IconAlternator },
    { id:"ignition", name:"Gyújtás, Izzítás", slug:"gyujtas-izzitas", icon: IconSparkPlug },
    { id:"ecu", name:"Vezérlő modul, érzékelő, jeladó", slug:"vezerlo-modul", icon: IconECU },
    { id:"wiring", name:"Kapcsoló, kábel", slug:"kapcsolo-kabel", icon: IconSwitch },
    { id:"safety", name:"Biztonsági berendezés", slug:"biztonsag", icon: IconAirbag },
    { id:"locks", name:"Mechanika/Zár/Szerkezet", slug:"mechanika-zar", icon: IconKey },
    { id:"transmission", name:"Erőátvitel, váltó, bowden", slug:"valto", icon: IconGearShifter },
    { id:"brakes", name:"Fék, ABS/ASR/ESP", slug:"fekrendszer", icon: IconBrakeDisc },
    { id:"steering", name:"Futómű, kormányzás, felni", slug:"kormanyzas", icon: IconSteeringWheel },
    { id:"fuel", name:"Üzemanyag, hybrid", slug:"uzemanyagrendszer", icon: IconFuel },
    { id:"exhaust", name:"Kipufogó rendszer", slug:"kipufogo", icon: IconExhaust },
    { id:"other", name:"Egyéb alkatrészek", slug:"egyeb", icon: PlusCircle },
];

export const subcategories: Subcategory[] = [
    // 1. Karosszéria elem (lemez)
    { id:"subcat-body-exterior-1000", categoryId:"body-exterior", name:"AJTÓ", slug:"ajto" },
    { id:"sc-body-2", categoryId:"body-exterior", name:"LÖKHÁRÍTÓ", slug:"lokharito" },
    { id:"sc-body-3", categoryId:"body-exterior", name:"MOTORHÁZTETŐ", slug:"motorhazteto" },
    { id:"sc-body-4", categoryId:"body-exterior", name:"SÁRVÉDŐ", slug:"sarvedo" },
    { id:"sc-body-5", categoryId:"body-exterior", name:"CSOMAGTÉRAJTÓ", slug:"csomagterajto" },
    { id:"sc-body-6", categoryId:"body-exterior", name:"ZÁRHÍD", slug:"zarhid" },

    // 2. Lámpa, index, világítás
    { id:"sc-lights-1", categoryId:"lights", name:"FÉNYSZÓRÓ", slug:"fenyszoro" },
    { id:"sc-lights-2", categoryId:"lights", name:"HÁTSÓ LÁMPA", slug:"hatso-lampa" },
    { id:"sc-lights-3", categoryId:"lights", name:"KÖDLÁMPA", slug:"kodlampa" },
    { id:"sc-lights-4", categoryId:"lights", name:"IRÁNYJELZŐ", slug:"iranyjelzo" },

    // 3. Üveg/ablak/tükör
    { id:"sc-glass-1", categoryId:"glass", name:"SZÉLVÉDŐ", slug:"szelvedo" },
    { id:"sc-glass-2", categoryId:"glass", name:"OLDALABLAK ÜVEG", slug:"oldalablak" },
    { id:"sc-glass-3", categoryId:"glass", name:"VISSZAPILLANTÓ TÜKÖR", slug:"visszapillanto" },

    // 5. Utastér
    { id:"sc-interior-1", categoryId:"interior", name:"ÜLÉS", slug:"ules" },
    { id:"sc-interior-3", categoryId:"interior", name:"ABLAKEMELŐ", slug:"ablakemelo" },
    { id:"sc-interior-4", categoryId:"interior", name:"KORMÁNYKERÉK", slug:"kormanykerek" },
    { id:"sc-interior-5", categoryId:"interior", name:"KÁRPITOK ÉS MŰANYAGOK", slug:"karpitok-es-muanyagok" },

    // 8. Motor, motorikus alkatrész
    { id:"sc-engine-1", categoryId:"engine", name:"HENGERFEJ ÉS RÉSZEI", slug:"hengerfej" },
    { id:"sc-engine-2", categoryId:"engine", name:"FŐTENGELY ÉS RÉSZEI", slug:"fotengely" },
    { id:"sc-engine-3", categoryId:"engine", name:"ADAGOLÓ / NAGYNYOMÁSÚ PUMPA", slug:"adagolo" },
    { id:"turbo", categoryId:"engine", name:"TURBÓFELTÖLTŐ", slug:"turbo" },
    { id:"sc-engine-5", categoryId:"engine", name:"MOTORBLOKK", slug:"motorblokk" },
    { id:"ekszij", categoryId:"engine", name:"ÉKSZÍJ ÉS TARTOZÉKOK", slug:"ekszij" },
    { id:"sc-engine-6", categoryId:"engine", name:"SZÍVÓSOR ÉS LEVEGŐELLÁTÁS", slug:"szivosor" },
    { id:"sc-engine-7", categoryId:"engine", name:"MOTORRÖGZÍTÉS ÉS BURKOLATOK", slug:"motorrogzites" },

    // 11. Vezérlő modul, érzékelő, jeladó
    { id:"sc-ecu-1", categoryId:"ecu", name:"MOTORVEZÉRLŐ (ECU)", slug:"motorvezerlo" },
    { id:"sc-ecu-2", categoryId:"ecu", name:"KOMFORT ELEKTRONIKA", slug:"komfort-elektronika" },
    { id:"sc-ecu-3", categoryId:"ecu", name:"ÉRZÉKELŐ / SZENZOR", slug:"erzekelo" },

    // 13. Biztonsági berendezés
    { id:"sc-safety-1", categoryId:"safety", name:"LÉGZSÁK", slug:"legzsak" },
    { id:"sc-safety-2", categoryId:"safety", name:"LÉGZSÁK INDÍTÓ / ELEKTRONIKA", slug:"legzsak-vezerlo" },
    { id:"sc-safety-3", categoryId:"safety", name:"BIZTONSÁGI ÖV", slug:"biztonsagi-ov" },

    // 15. Erőátvitel, váltó, bowden
    { id:"sc-trans-1", categoryId:"transmission", name:"VÁLTÓ (SEBESSÉGVÁLTÓ)", slug:"valto" },
    { id:"sc-trans-2", categoryId:"transmission", name:"FÉLTENGELY", slug:"feltengely" },
    { id:"sc-trans-3", categoryId:"transmission", name:"KUPLUNG ÉS RÉSZEI", slug:"kuplung" },
    { id:"sc-trans-4", categoryId:"transmission", name:"HAJTÁSLÁNC ÉS DIFFERENCIÁLMŰ", slug:"hajtaslanc-difi" },

    // 16. Fék, ABS
    { id:"sc-brakes-1", categoryId:"brakes", name:"ABS EGYSÉG", slug:"abs" },
    { id:"sc-brakes-2", categoryId:"brakes", name:"FÉKNYEREG", slug:"feknyereg" },
    { id:"sc-brakes-3", categoryId:"brakes", name:"FÉKTÁRCSA ÉS FÉKBETÉT", slug:"fektarcsa-es-betet" },
    { id:"sc-brakes-4", categoryId:"brakes", name:"FÉKRÁSEGÍTŐ / SZERVÓDOB", slug:"fekrasegito" },

    // 17. Futómű
    { id:"sc-steering-1", categoryId:"steering", name:"LENGŐKAR", slug:"lengokar" },
    { id:"sc-steering-2", categoryId:"steering", name:"KORMÁNYMŰ", slug:"kormanymu" },
    { id:"sc-steering-3", categoryId:"steering", name:"CSONKÁLLVÁNY / KERÉKAGY", slug:"csonkallvany" },
    { id:"sc-steering-4", categoryId:"steering", name:"LENGÉSCSILLAPÍTÓ ÉS RUGÓ", slug:"lengescsillapito" },
    { id:"sc-steering-5", categoryId:"steering", name:"FELNI / KERÉK / GUMI", slug:"felni-kerek" },

    // --- Newly added subcategories ---
    // 4. Karosszéria egyéb
    { id:"sc-body-other-1", categoryId:"body-other", name:"DÍSZLÉC", slug:"diszlec" },
    { id:"sc-body-other-2", categoryId:"body-other", name:"ABLAKTÖRLŐ MECHANIKA", slug:"ablaktorlo-mechanika" },
    { id:"sc-body-other-3", categoryId:"body-other", name:"GÁZTELESZKÓP", slug:"gazteleszkop" },

    // 6. Kijelzők, Hifi, GPS, telefon
    { id:"sc-displays-1", categoryId:"displays", name:"RÁDIÓ / FEJEGYSÉG", slug:"radio" },
    { id:"sc-displays-2", categoryId:"displays", name:"NAVIGÁCIÓ (GPS)", slug:"navigacio" },
    { id:"sc-displays-3", categoryId:"displays", name:"KIJELZŐ", slug:"kijelzo" },

    // 7. Hűtés-Fűtés, Levegő-Víz
    { id:"sc-cooling-1", categoryId:"cooling", name:"VÍZRADIÁTOR", slug:"vizradiator" },
    { id:"sc-cooling-2", categoryId:"cooling", name:"KLÍMAHŰTŐ", slug:"klimahuto" },
    { id:"sc-cooling-3", categoryId:"cooling", name:"FŰTŐMOTOR / VENTILÁTOR", slug:"futomotor" },
    { id:"sc-cooling-4", categoryId:"cooling", name:"KLÍMA KOMPRESSZOR", slug:"klima-kompresszor" },

    // 9. Elektro-motor, pumpa, generátor
    { id:"sc-electric-1", categoryId:"electric-motor", name:"GENERÁTOR", slug:"generator" },
    { id:"sc-electric-2", categoryId:"electric-motor", name:"ÖNINDÍTÓ", slug:"onindito" },
    { id:"sc-electric-3", categoryId:"electric-motor", name:"ABLAKTÖRLŐ MOTOR", slug:"ablaktorlo-motor" },

    // 10. Gyújtás, Izzítás
    { id:"sc-ignition-1", categoryId:"ignition", name:"GYÚJTÓTRAFÓ", slug:"gyujtotrafo" },
    { id:"sc-ignition-2", categoryId:"ignition", name:"IZZÍTÓGYERTYA", slug:"izzitogyertya" },

    // 12. Kapcsoló, kábel
    { id:"sc-wiring-1", categoryId:"wiring", name:"KORMÁNYKAPCSOLÓ", slug:"kormanykapcsolo" },
    { id:"sc-wiring-2", categoryId:"wiring", name:"BELSŐ KAPCSOLÓK ÉS KEZELŐSZERVEK", slug:"belso-kapcsolok" },
    { id:"sc-wiring-3", categoryId:"wiring", name:"KÁBELKÖTEG", slug:"kabelkoteg" },

    // 14. Mechanika/Zár/Szerkezet
    { id:"sc-locks-1", categoryId:"locks", name:"AJTÓZÁR", slug:"ajtozar" },
    { id:"sc-locks-2", categoryId:"locks", name:"GYÚJTÁSKAPCSOLÓ", slug:"gyujtaskapcsolo" },

    // 18. Üzemanyag, hybrid
    { id:"sc-fuel-1", categoryId:"fuel", name:"ÜZEMANYAGSZIVATTYÚ (AC PUMPA)", slug:"uzemanyagszivattyu" },
    { id:"sc-fuel-2", categoryId:"fuel", name:"INJEKTOR", slug:"injektor" },

    // 19. Kipufogó rendszer
    { id:"sc-exhaust-1", categoryId:"exhaust", name:"KIPUFOGÓ DOB", slug:"kipufogo-dob" },
    { id:"sc-exhaust-2", categoryId:"exhaust", name:"KATALIZÁTOR", slug:"katalizator" },
    { id:"sc-exhaust-3", categoryId:"exhaust", name:"RÉSZECSKESZŰRŐ (DPF)", slug:"reszecskeszuro" },

    // 20. Egyéb alkatrészek
    { id:"sc-other-1", categoryId:"other", name:"EGYÉB ALKATRÉSZ", slug:"egyeb-alkatresz" },

    // --- LATEST NEW SUBCATEGORIES ---
    { id:"sc-body-7", categoryId:"body-exterior", name:"KÜSZÖB, TETŐ ÉS PADLÓLEMEZ", slug:"kuszob-teto-padlo" },
    { id:"sc-body-other-4", categoryId:"body-other", name:"VONÓHOROG ÉS TARTOZÉKA", slug:"vonohorog" },
    { id:"sc-lights-5", categoryId:"lights", name:"BELSŐ VILÁGÍTÁS ÉS EGYÉB LÁMPA", slug:"belso-vilagitas" },
    { id:"sc-glass-4", categoryId:"glass", name:"TETŐABLAK ÉS PANORÁMATETŐ", slug:"tetoablak" },
    { id:"sc-displays-4", categoryId:"displays", name:"ERŐSÍTŐ ÉS HANGRENDSZER", slug:"erosito-hangrendszer" },
    { id:"sc-electric-4", categoryId:"electric-motor", name:"EGYÉB ELEKTROMOS MOTOROK", slug:"egyeb-elektromos-motorok" },
    { id:"sc-fuel-3", categoryId:"fuel", name:"HIBRID ÉS EV ALKATRÉSZEK", slug:"hibrid-ev-alkatreszek" },
    { id:"sc-engine-8", categoryId:"engine", name:"KOMPLETT MOTOR", slug:"komplett-motor" },
    { id:"sc-locks-3", categoryId:"locks", name:"EGYÉB SZERKEZETEK ÉS MECHANIKÁK", slug:"egyeb-szerkezetek" },
    { id:"sc-electric-5", categoryId:"electric-motor", name:"AKKUMULÁTOR (12V) ÉS TARTOZÉKAI", slug:"akkumulator-12v" },
    { id:"sc-wiring-4", categoryId:"wiring", name:"BIZTOSÍTÉKTÁBLA ÉS RELÉDOBOZ", slug:"biztositektabla" },
];

export const partItems: PartItem[] = [
    // Level 3 - AJTÓ
    { id:"pi-door-1", subcategoryId:"subcat-body-exterior-1000", name:"Bal első Ajtó (Üres lemez)", slug:"bal-elso-ajto-ures" },
    { id:"pi-door-2", subcategoryId:"subcat-body-exterior-1000", name:"Bal első Ajtó (Részeivel)", slug:"bal-elso-ajto-komplett" },
    { id:"pi-door-3", subcategoryId:"subcat-body-exterior-1000", name:"Bal hátsó Ajtó (Üres lemez)", slug:"bal-hatso-ajto-ures" },
    { id:"pi-door-4", subcategoryId:"subcat-body-exterior-1000", name:"Bal hátsó Ajtó (Részeivel)", slug:"bal-hatso-ajto-komplett" },
    { id:"pi-door-5", subcategoryId:"subcat-body-exterior-1000", name:"Jobb első Ajtó (Üres lemez)", slug:"jobb-elso-ajto-ures" },
    { id:"pi-door-6", subcategoryId:"subcat-body-exterior-1000", name:"Jobb első Ajtó (Részeivel)", slug:"jobb-elso-ajto-komplett" },
    { id:"pi-door-7", subcategoryId:"subcat-body-exterior-1000", name:"Jobb hátsó Ajtó (Üres lemez)", slug:"jobb-hatso-ajto-ures" },
    { id:"pi-door-8", subcategoryId:"subcat-body-exterior-1000", name:"Jobb hátsó Ajtó (Részeivel)", slug:"jobb-hatso-ajto-komplett" },
    { id:"pi-door-9", subcategoryId:"subcat-body-exterior-1000", name:"Ajtó zsanér (Felső)", slug:"ajto-zsaner-felso" },
    { id:"pi-door-10", subcategoryId:"subcat-body-exterior-1000", name:"Ajtó zsanér (Alsó)", slug:"ajto-zsaner-also" },
    { id:"pi-door-11", subcategoryId:"subcat-body-exterior-1000", name:"Ajtó határoló", slug:"ajto-hatarolo" },
    { id:"pi-door-12", subcategoryId:"subcat-body-exterior-1000", name:"Ajtó gumi / tömítés", slug:"ajto-gumi" },
    { id:"pi-door-13", subcategoryId:"subcat-body-exterior-1000", name:"Ajtó belső nyitó bowden", slug:"ajto-nyito-bowden" },
    { id:"pi-door-14", subcategoryId:"subcat-body-exterior-1000", name:"Ajtó díszléc / koptató", slug:"ajto-diszlec-body" },
    { id:"pi-door-15", subcategoryId:"subcat-body-exterior-1000", name:"Ajtó belső merevítő", slug:"ajto-merevito" },




    // Level 3 - LÖKHÁRÍTÓ
    { id:"pi-bump-1", subcategoryId:"sc-body-2", name:"Első Lökhárító (Üresen)", slug:"elso-lokharito-ures" },
    { id:"pi-bump-2", subcategoryId:"sc-body-2", name:"Első Lökhárító (Részeivel)", slug:"elso-lokharito-komplett" },
    { id:"pi-bump-3", subcategoryId:"sc-body-2", name:"Hátsó Lökhárító (Üresen)", slug:"hatso-lokharito-ures" },
    { id:"pi-bump-4", subcategoryId:"sc-body-2", name:"Hátsó Lökhárító (Részeivel)", slug:"hatso-lokharito-komplett" },
    { id:"pi-bump-5", subcategoryId:"sc-body-2", name:"Lökhárító rács (középső)", slug:"lokharito-racs-kozepso" },
    { id:"pi-bump-6", subcategoryId:"sc-body-2", name:"Lökhárító rács (oldalsó - ködlámpánál)", slug:"lokharito-racs-oldalso" },
    { id:"pi-bump-7", subcategoryId:"sc-body-2", name:"Lökhárító koptató / spoiler", slug:"lokharito-koptato" },
    { id:"pi-bump-8", subcategoryId:"sc-body-2", name:"Lökhárító tartó / merevítő", slug:"lokharito-tarto-merevito" },
    { id:"pi-bump-9", subcategoryId:"sc-body-2", name:"Lökhárító tartó konzol (Bal oldali)", slug:"lokharito-konzol-bal" },
    { id:"pi-bump-10", subcategoryId:"sc-body-2", name:"Lökhárító tartó konzol (Jobb oldali)", slug:"lokharito-konzol-jobb" },
    { id:"pi-bump-11", subcategoryId:"sc-body-2", name:"Lökhárító díszléc (króm/fekete)", slug:"lokharito-diszlec" },
    { id:"pi-bump-12", subcategoryId:"sc-body-2", name:"Lökhárító vonószem takaró", slug:"lokharito-vonoszem-takaro" },
    { id:"pi-bump-13", subcategoryId:"sc-body-2", name:"Lökhárító belső energiaelnyelő", slug:"lokharito-energiaelnyelo" },


    // Level 3 - MOTORHÁZTETŐ
    { id:"pi-hood-1", subcategoryId:"sc-body-3", name:"Motorháztető lemez", slug:"motorhazteto-lemez" },
    { id:"pi-hood-2", subcategoryId:"sc-body-3", name:"Motorháztető zsanér (Bal)", slug:"motorhazteto-zsaner-bal" },
    { id:"pi-hood-3", subcategoryId:"sc-body-3", name:"Motorháztető zsanér (Jobb)", slug:"motorhazteto-zsaner-jobb" },
    { id:"pi-hood-4", subcategoryId:"sc-body-3", name:"Motorháztető zár / zárszerkezet", slug:"motorhazteto-zar" },
    { id:"pi-hood-5", subcategoryId:"sc-body-3", name:"Motorháztető szigetelés", slug:"motorhazteto-szigeteles" },
    { id:"pi-hood-6", subcategoryId:"sc-body-3", name:"Motorháztető nyitó bowden", slug:"motorhazteto-nyito-bowden" },
    { id:"pi-hood-8", subcategoryId:"sc-body-3", name:"Hűtőrács / Grill", slug:"hutoracs" },


    // Level 3 - SÁRVÉDŐ
    { id:"pi-fend-1", subcategoryId:"sc-body-4", name:"Bal első sárvédő", slug:"bal-elso-sarvedo" },
    { id:"pi-fend-2", subcategoryId:"sc-body-4", name:"Jobb első sárvédő", slug:"jobb-elso-sarvedo" },
    { id:"pi-fend-3", subcategoryId:"sc-body-4", name:"Bal hátsó sárvédő (negyed)", slug:"bal-hatso-sarvedo" },
    { id:"pi-fend-4", subcategoryId:"sc-body-4", name:"Jobb hátsó sárvédő (negyed)", slug:"jobb-hatso-sarvedo" },
    { id:"pi-fend-5", subcategoryId:"sc-body-4", name:"Sárvédő dobbetét (Első - Bal)", slug:"sarvedo-dobbetet-elso-bal" },
    { id:"pi-fend-6", subcategoryId:"sc-body-4", name:"Sárvédő dobbetét (Első - Jobb)", slug:"sarvedo-dobbetet-elso-jobb" },
    { id:"pi-fend-7", subcategoryId:"sc-body-4", name:"Sárvédő dobbetét (Hátsó - Bal)", slug:"sarvedo-dobbetet-hatso-bal" },
    { id:"pi-fend-8", subcategoryId:"sc-body-4", name:"Sárvédő dobbetét (Hátsó - Jobb)", slug:"sarvedo-dobbetet-hatso-jobb" },
    { id:"pi-fend-9", subcategoryId:"sc-body-4", name:"Sárvédő díszléc / szélesítés", slug:"sarvedo-szelesites" },


    // Level 3 - CSOMAGTÉRAJTÓ
    { id:"pi-trunk-1", subcategoryId:"sc-body-5", name:"Csomagtérajtó (komplett)", slug:"csomagterajto-komplett" },
    { id:"pi-trunk-2", subcategoryId:"sc-body-5", name:"Csomagtérajtó (üres lemez)", slug:"csomagterajto-ures" },
    { id:"pi-trunk-3", subcategoryId:"sc-body-5", name:"Csomagtérajtó üveg", slug:"csomagterajto-uveg" },
    { id:"pi-trunk-4", subcategoryId:"sc-body-5", name:"Csomagtér zár / motor / szerkezet", slug:"csomagter-zar" },
    { id:"pi-trunk-5", subcategoryId:"sc-body-5", name:"Csomagtérajtó zsanér készlet", slug:"csomagterajto-zsaner" },
    { id:"pi-trunk-7", subcategoryId:"sc-body-5", name:"Rendszámtábla világítás panel", slug:"rendszamtabla-vilagitas" },
    { id:"pi-trunk-8", subcategoryId:"sc-body-5", name:"Pótkeréktartó / rögzítő", slug:"potkerektarto" },


    // Level 3 - ZÁRHÍD
    { id:"pi-lockh-1", subcategoryId:"sc-body-6", name:"Komplett zárhíd / homlokfal", slug:"zarhid-komplett" },
    { id:"pi-lockh-2", subcategoryId:"sc-body-6", name:"Zárhíd felső elem", slug:"zarhid-felso" },
    { id:"pi-lockh-3", subcategoryId:"sc-body-6", name:"Hűtőtartó keret / műanyag", slug:"hutotarto-keret" },
    { id:"pi-lockh-4", subcategoryId:"sc-body-6", name:"Első kereszttartó (vas/alumínium)", slug:"elso-kereszttarto" },
    { id:"pi-lockh-5", subcategoryId:"sc-body-6", name:"Zárhíd oldalsó tartó", slug:"zarhid-oldalso-tarto" },


    // Level 3 - FÉNYSZÓRÓ
    { id:"pi-light-1", subcategoryId:"sc-lights-1", name:"Bal első fényszóró (Halogén)", slug:"bal-fenyszoro-halogen" },
    { id:"pi-light-2", subcategoryId:"sc-lights-1", name:"Jobb első fényszóró (Halogén)", slug:"jobb-fenyszoro-halogen" },
    { id:"pi-light-4", subcategoryId:"sc-lights-1", name:"Bal első fényszóró (Xenon/LED)", slug:"bal-fenyszoro-xenon" },
    { id:"pi-light-5", subcategoryId:"sc-lights-1", name:"Jobb első fényszóró (Xenon/LED)", slug:"jobb-fenyszoro-xenon" },
    { id:"pi-light-6", subcategoryId:"sc-lights-1", name:"Fényszóró magasságállító motor", slug:"fenyszoro-allito-motor" },
    { id:"pi-light-7", subcategoryId:"sc-lights-1", name:"Xenon trafó / vezérlő egység", slug:"xenon-trafo" },
    { id:"pi-light-8", subcategoryId:"sc-lights-1", name:"D1S/D2S/D3S Xenon izzó", slug:"xenon-izzo" },
    { id:"pi-light-9", subcategoryId:"sc-lights-1", name:"Fényszóró mosó fúvóka", slug:"fenyszoro-moso-fuvoka" },
    { id:"pi-light-10", subcategoryId:"sc-lights-1", name:"Fényszóró mosó motor", slug:"fenyszoro-moso-motor" },
    { id:"pi-light-11", subcategoryId:"sc-lights-1", name:"Fényszóró hátsó takaró fedél", slug:"fenyszoro-takaro" },
    { id:"pi-light-12", subcategoryId:"sc-lights-1", name:"LED nappali menetfény modul", slug:"led-drl-modul" },


    // Level 3 - HÁTSÓ LÁMPA
    { id:"pi-hlight-1", subcategoryId:"sc-lights-2", name:"Bal hátsó lámpa (külső/sárvédőbe)", slug:"bal-hatso-lampa-kulso" },
    { id:"pi-hlight-2", subcategoryId:"sc-lights-2", name:"Jobb hátsó lámpa (külső/sárvédőbe)", slug:"jobb-hatso-lampa-kulso" },
    { id:"pi-hlight-3", subcategoryId:"sc-lights-2", name:"Bal hátsó lámpa (belső/csomagtér)", slug:"bal-hatso-lampa-belso" },
    { id:"pi-hlight-4", subcategoryId:"sc-lights-2", name:"Jobb hátsó lámpa (belső/csomagtér)", slug:"jobb-hatso-lampa-belso" },
    { id:"pi-hlight-5", subcategoryId:"sc-lights-2", name:"Harmadik féklámpa (pótféklámpa)", slug:"potfeklampa" },
    { id:"pi-hlight-6", subcategoryId:"sc-lights-2", name:"Hátsó lámpa izzófoglalat", slug:"hatso-lampa-foglalat" },


    // Level 3 - KÖDLÁMPA
    { id:"pi-fog-1", subcategoryId:"sc-lights-3", name:"Bal első ködlámpa", slug:"bal-elso-kodlampa" },
    { id:"pi-fog-2", subcategoryId:"sc-lights-3", name:"Jobb első ködlámpa", slug:"jobb-elso-kodlampa" },
    { id:"pi-fog-3", subcategoryId:"sc-lights-3", name:"Hátsó ködlámpa készlet", slug:"hatso-kodlampa" },

    // Level 3 - IRÁNYJELZŐ
    { id:"pi-ind-1", subcategoryId:"sc-lights-4", name:"Első irányjelző (Bal)", slug:"elso-index-bal" },
    { id:"pi-ind-2", subcategoryId:"sc-lights-4", name:"Első irányjelző (Jobb)", slug:"elso-index-jobb" },
    { id:"pi-ind-3", subcategoryId:"sc-lights-4", name:"Oldal irányjelző (Sárvédőbe)", slug:"oldal-index" },
    { id:"pi-ind-4", subcategoryId:"sc-lights-4", name:"Visszapillantó tükör index", slug:"tukor-index" },

    // Level 3 - SZÉLVÉDŐ
    { id:"pi-glass-1", subcategoryId:"sc-glass-1", name:"Első szélvédő üveg", slug:"elso-szelvedo" },
    { id:"pi-glass-2", subcategoryId:"sc-glass-1", name:"Hátsó szélvédő üveg", slug:"hatso-szelvedo" },

    // Level 3 - OLDALABLAK
    { id:"pi-glass-3", subcategoryId:"sc-glass-2", name:"Bal első oldalüveg", slug:"bal-elso-oldaluveg" },
    { id:"pi-glass-4", subcategoryId:"sc-glass-2", name:"Jobb első oldalüveg", slug:"jobb-elso-oldaluveg" },
    { id:"pi-glass-5", subcategoryId:"sc-glass-2", name:"Bal hátsó oldalüveg", slug:"bal-hatso-oldaluveg" },
    { id:"pi-glass-6", subcategoryId:"sc-glass-2", name:"Jobb hátsó oldalüveg", slug:"jobb-hatso-oldaluveg" },
    { id:"pi-glass-7", subcategoryId:"sc-glass-2", name:"Hátsó fix oldalüveg (háromszög)", slug:"hatso-fix-oldaluveg" },

    // Level 3 - VISSZAPILLANTÓ
    { id:"pi-mir-1", subcategoryId:"sc-glass-3", name:"Bal visszapillantó tükör (komplett, elektromos)", slug:"bal-visszapillanto-komplett" },
    { id:"pi-mir-2", subcategoryId:"sc-glass-3", name:"Jobb visszapillantó tükör (komplett, elektromos)", slug:"jobb-visszapillanto-komplett" },
    { id:"pi-mir-3", subcategoryId:"sc-glass-3", name:"Visszapillantó tükörlap (fűthető)", slug:"visszapillanto-tukorlap" },
    { id:"pi-mir-4", subcategoryId:"sc-glass-3", name:"Visszapillantó búra / ház (színre fújt)", slug:"visszapillanto-bura" },
    { id:"pi-mir-5", subcategoryId:"sc-glass-3", name:"Visszapillantó tükör állító motor", slug:"visszapillanto-motor" },
    { id:"pi-mir-6", subcategoryId:"sc-glass-3", name:"Visszapillantó tükör belső takaró", slug:"visszapillanto-belso-takaro" },
    { id:"pi-mir-7", subcategoryId:"sc-glass-3", name:"Belső visszapillantó tükör (fényre sötétedő)", slug:"belso-visszapillanto" },


    // Level 3 - ÜLÉS
    { id:"pi-seat-1", subcategoryId:"sc-interior-1", name:"Vezetőülés (Bal első)", slug:"bal-elso-ules" },
    { id:"pi-seat-2", subcategoryId:"sc-interior-1", name:"Utasülés (Jobb első)", slug:"jobb-elso-ules" },
    { id:"pi-seat-3", subcategoryId:"sc-interior-1", name:"Hátsó üléssor (komplett set)", slug:"hatso-ulesset" },
    { id:"pi-seat-4", subcategoryId:"sc-interior-1", name:"Fejtámla", slug:"fejtamla" },

    // Level 3 - BIZTONSÁGI ÖV
    { id:"pi-belt-1", subcategoryId:"sc-safety-3", name:"Bal első biztonsági öv", slug:"bal-elso-ov" },
    { id:"pi-belt-2", subcategoryId:"sc-safety-3", name:"Jobb első biztonsági öv", slug:"jobb-elso-ov" },
    { id:"pi-belt-3", subcategoryId:"sc-safety-3", name:"Hátsó biztonsági öv készlet", slug:"hatso-ov-szett" },
    { id:"pi-belt-4", subcategoryId:"sc-safety-3", name:"Övfeszítő patron", slug:"ovfeszito" },

    // Level 3 - ABLAKEMELŐ
    { id:"pi-winm-1", subcategoryId:"sc-interior-3", name:"Bal első ablakemelő (szerkezet+motor)", slug:"bal-elso-ablakemelo" },
    { id:"pi-winm-2", subcategoryId:"sc-interior-3", name:"Jobb első ablakemelő (szerkezet+motor)", slug:"jobb-elso-ablakemelo" },
    { id:"pi-winm-3", subcategoryId:"sc-interior-3", name:"Bal hátsó ablakemelő (szerkezet+motor)", slug:"bal-hatso-ablakemelo" },
    { id:"pi-winm-4", subcategoryId:"sc-interior-3", name:"Jobb hátsó ablakemelő (szerkezet+motor)", slug:"jobb-hatso-ablakemelo" },
    { id:"pi-winm-7", subcategoryId:"sc-interior-3", name:"Ablakemelő motor (külön)", slug:"单独-ablakemelo-motor" },
    { id:"pi-winm-8", subcategoryId:"sc-interior-3", name:"Ablakemelő csúszka / javító szett", slug:"ablakemelo-javito" },


    // Level 3 - KORMÁNYKERÉK
    { id:"pi-steer-1", subcategoryId:"sc-interior-4", name:"Bőrkormány (Multifunkciós)", slug:"borkormany-multi" },
    { id:"pi-steer-2", subcategoryId:"sc-interior-4", name:"Sima gumikormány", slug:"kormany-sima" },

    // Level 3 - HENGERFEJ
    { id:"pi-head-1", subcategoryId:"sc-engine-1", name:"Hengerfej (Fűzve/Komplett)", slug:"hengerfej-komplett" },
    { id:"pi-head-2", subcategoryId:"sc-engine-1", name:"Szelepfedél (műanyag/fém)", slug:"szelepfedel" },
    { id:"pi-head-3", subcategoryId:"sc-engine-1", name:"Vezérműtengely (Szívó)", slug:"vezermutengely-szivo" },
    { id:"pi-head-4", subcategoryId:"sc-engine-1", name:"Vezérműtengely (Kipufogó)", slug:"vezermutengely-kipufogo" },
    { id:"pi-head-5", subcategoryId:"sc-engine-1", name:"Hengerfej tömítés", slug:"hengerfej-tomites" },
    { id:"pi-head-6", subcategoryId:"sc-engine-1", name:"Vezérműtengely ház", slug:"vezermutengely-haz" },
    { id:"pi-head-7", subcategoryId:"sc-engine-1", name:"Szelepemelő tőke (Hidrotőke)", slug:"hidrotoke" },
    { id:"pi-head-8", subcategoryId:"sc-engine-1", name:"Hengerfej csavar készlet", slug:"hengerfej-csavar" },
    { id:"pi-head-9", subcategoryId:"sc-engine-1", name:"Befecskendező szelep fészek", slug:"befecskendezo-feszek" },


    // Level 3 - FŐTENGELY
    { id:"pi-crank-1", subcategoryId:"sc-engine-2", name:"Főtengely (szabvány méret)", slug:"fotengely-alap" },
    { id:"pi-crank-2", subcategoryId:"sc-engine-2", name:"Hajtókar (1 db)", slug:"hajtokar" },
    { id:"pi-crank-3", subcategoryId:"sc-engine-2", name:"Dugattyú (gyűrűkkel, csapszeggel)", slug:"dugattyu" },
    { id:"pi-crank-4", subcategoryId:"sc-engine-2", name:"Főtengely szíjtárcsa (Rezgéscsillapító)", slug:"fotengely-szijtarcsa" },
    { id:"pi-crank-5", subcategoryId:"sc-engine-2", name:"Főtengely csapágy készlet", slug:"fotengely-csapagy" },
    { id:"pi-crank-6", subcategoryId:"sc-engine-2", name:"Lendkerék (Kéttömegű)", slug:"lendkerek-kettomegu" },
    { id:"pi-crank-7", subcategoryId:"sc-engine-2", name:"Lendkerék (Sima)", slug:"lendkerek-sima" },
    { id:"pi-crank-8", subcategoryId:"sc-engine-2", name:"Szimering ház (hátsó)", slug:"szimering-haz" },


    // Level 3 - ADAGOLÓ / NAGYNYOMÁSÚ PUMPA
    { id:"pi-pump-1", subcategoryId:"sc-engine-3", name:"Diesel Nagynyomású pumpa", slug:"diesel-nagynyomasu" },
    { id:"pi-pump-2", subcategoryId:"sc-engine-3", name:"Benzin Nagynyomású pumpa (TSI/GDI)", slug:"benzin-nagynyomasu" },
    { id:"pi-pump-3", subcategoryId:"sc-engine-3", name:"AD-Blue szivattyú / egység", slug:"adblue-pumpa" },

    // Level 3 - TURBÓFELTÖLTŐ
    { id:"pi-turbo-1", subcategoryId:"turbo", name:"Komplett Turbófeltöltő", slug:"turbo-komplett" },
    { id:"pi-turbo-2", subcategoryId:"turbo", name:"Turbó vákuumdob / geometria állító", slug:"turbo-allito" },
    { id:"pi-turbo-3", subcategoryId:"turbo", name:"Turbócső készlet / Intercooler cső", slug:"turbocso" },
    { id:"pi-turbo-4", subcategoryId:"turbo", name:"Intercooler hűtő egység", slug:"intercooler" },
    { id:"pi-turbo-5", subcategoryId:"turbo", name:"Turbó olajcső (nyomó/visszafolyó)", slug:"turbo-olajcso" },

    // Level 3 - ÉKSZÍJ
    { id:"pi-belt-gen-1", subcategoryId:"ekszij", name:"Hosszbordás szíj / Ékszíj", slug:"ekszij-szij" },
    { id:"pi-belt-gen-2", subcategoryId:"ekszij", name:"Szíjfeszítő görgő", slug:"szijfeszito" },
    { id:"pi-belt-gen-3", subcategoryId:"ekszij", name:"Vezetőgörgő", slug:"vezetogorgo" },
    { id:"pi-belt-gen-4", subcategoryId:"ekszij", name:"Szabadonfutó (Generátornál)", slug:"szabadonfuto" },


    // Level 3 - MOTORBLOKK
    { id:"pi-block-1", subcategoryId:"sc-engine-5", name:"Üres motorblokk", slug:"motorblokk-ures" },
    { id:"pi-block-2", subcategoryId:"sc-engine-5", name:"Fűzött motorblokk (főtengellyel/dugattyúval)", slug:"motorblokk-fuzott" },

    // Level 3 - MOTORVEZÉRLŐ (ECU)
    // Level 3 - MOTORVEZÉRLŐ (ECU)
    { id:"pi-ecu-1", subcategoryId:"sc-ecu-1", name:"Motorvezérlő egység (ECU)", slug:"ecu-motor-vezerlo" },
    { id:"pi-ecu-2", subcategoryId:"sc-ecu-1", name:"ECU + Immo + Kulcs szett", slug:"ecu-szett" },
    { id:"pi-ecu-3", subcategoryId:"sc-ecu-1", name:"Motorvezérlő tartó konzol", slug:"ecu-tarto" },

    // Level 3 - KOMFORT ELEKTRONIKA
    { id:"pi-comp-1", subcategoryId:"sc-ecu-2", name:"BSI / Body Control Module", slug:"bsi-modul" },
    { id:"pi-comp-2", subcategoryId:"sc-ecu-2", name:"Ajtó vezérlő modul", slug:"ajto-vezerlo" },
    { id:"pi-comp-3", subcategoryId:"sc-ecu-2", name:"PDC (Parkolóradar) vezérlő", slug:"pdc-vezerlo" },
    { id:"pi-comp-4", subcategoryId:"sc-ecu-2", name:"Világítás modul (LCM/FRM)", slug:"vilagitas-modul" },
    { id:"pi-comp-5", subcategoryId:"sc-ecu-2", name:"Központi zár vezérlő", slug:"kozponti-zar-vezerlo" },


    // Level 3 - ÉRZÉKELŐ
    { id:"pi-sens-1", subcategoryId:"sc-ecu-3", name:"Légtömegmérő (MAF szenzor)", slug:"legtoimegmero" },
    { id:"pi-sens-2", subcategoryId:"sc-ecu-3", name:"Lambda szonda (Szabályzó)", slug:"lambda-szonda-szabalyzo" },
    { id:"pi-sens-3", subcategoryId:"sc-ecu-3", name:"Lambda szonda (Diagnosztikai)", slug:"lambda-szonda-diag" },
    { id:"pi-sens-4", subcategoryId:"sc-ecu-3", name:"Főtengely jeladó (RPM szenzor)", slug:"fotengely-jelado" },
    { id:"pi-sens-5", subcategoryId:"sc-ecu-3", name:"Vezérműtengely jeladó", slug:"vezermutengely-jelado" },
    { id:"pi-sens-10", subcategoryId:"sc-ecu-3", name:"Hűtővíz hőmérséklet jeladó", slug:"viz-homero" },
    { id:"pi-sens-11", subcategoryId:"sc-ecu-3", name:"Olajnyomás kapcsoló / szenzor", slug:"olajnyomas-jelado" },
    { id:"pi-sens-12", subcategoryId:"sc-ecu-3", name:"Kopogásérzékelő szenzor", slug:"kopogas-erzekelo" },
    { id:"pi-sens-13", subcategoryId:"sc-ecu-3", name:"Külső hőmérséklet jeladó", slug:"kulso-homero" },
    { id:"pi-sens-14", subcategoryId:"sc-ecu-3", name:"Turbónyomás mérő szenzor (MAP)", slug:"map-szenzor" },
    { id:"pi-sens-15", subcategoryId:"sc-ecu-3", name:"Gázpedál állás érzékelő (Potméter)", slug:"gazpedal-erzekelo" },
    { id:"pi-sens-16", subcategoryId:"sc-ecu-3", name:"Parkolóradar szenzor (1 db)", slug:"pdc-szenzor-darab" },
    { id:"pi-sens-17", subcategoryId:"sc-ecu-3", name:"Esőszenzor / Fényszenzor", slug:"eso-szenzor" },
    { id:"pi-sens-18", subcategoryId:"sc-ecu-3", name:"Olajszint jeladó", slug:"olajszint-jelado" },
    { id:"pi-sens-19", subcategoryId:"sc-ecu-3", name:"Üzemanyag nyomás érzékelő (Rail)", slug:"rail-nyomas-szenzor" },
    { id:"pi-sens-20", subcategoryId:"sc-ecu-3", name:"DPF nyomáskülönbség szenzor", slug:"dpf-nyomas-szenzor" },
    { id:"pi-sens-21", subcategoryId:"sc-ecu-3", name:"Nitrogén-oxid (NOx) szenzor", slug:"nox-szenzor" },
    { id:"pi-sens-23", subcategoryId:"sc-ecu-3", name:"Holttérfigyelő radar szenzor", slug:"holtter-szenzor" },
    { id:"pi-sens-25", subcategoryId:"sc-ecu-3", name:"Hűtőközeg nyomásérzékelő (Klíma)", slug:"klima-nyomasszenzor" },
    { id:"pi-sens-26", subcategoryId:"sc-ecu-3", name:"Kormányoszlop szögelfordulás jeladó", slug:"kormany-szogjelado" },
    { id:"pi-sens-27", subcategoryId:"sc-ecu-3", name:"Beszívott levegő hőmérséklet jeladó", slug:"beszivott-levego-homero" },
    { id:"pi-sens-29", subcategoryId:"sc-ecu-3", name:"Fordulatszám jeladó (Váltó)", slug:"valto-fordulat-jelado" },
    { id:"pi-sens-30", subcategoryId:"sc-ecu-3", name:"Hűtőventilátor kapcsoló gomba", slug:"ventilator-kapcsolo" },



    // Level 3 - LÉGZSÁK
    { id:"pi-air-1", subcategoryId:"sc-safety-1", name:"Kormánylégzsák", slug:"kormanylegzsak" },
    { id:"pi-air-2", subcategoryId:"sc-safety-1", name:"Utasoldali légzsák", slug:"utas-legzsak" },
    { id:"pi-air-3", subcategoryId:"sc-safety-1", name:"Bal függönylégzsák", slug:"bal-fuggony-legzsak" },
    { id:"pi-air-4", subcategoryId:"sc-safety-1", name:"Jobb függönylégzsák", slug:"jobb-fuggony-legzsak" },
    { id:"pi-air-5", subcategoryId:"sc-safety-1", name:"Térdlégzsák (Vezető/Utas)", slug:"terd-legzsak" },
    { id:"pi-air-6", subcategoryId:"sc-safety-1", name:"Üléslégzsák (Bal első)", slug:"bal-ules-legzsak" },
    { id:"pi-air-7", subcategoryId:"sc-safety-1", name:"Üléslégzsák (Jobb első)", slug:"jobb-ules-legzsak" },
    { id:"pi-air-8", subcategoryId:"sc-safety-1", name:"Oldallégzsák (B-oszlop)", slug:"oldal-legzsak" },

    // Level 3 - LÉGZSÁK VEZÉRLŐ
    { id:"pi-airc-1", subcategoryId:"sc-safety-2", name:"Légzsák vezérlő elektronika (Főmodul)", slug:"legzsak-vezerlo" },
    { id:"pi-airc-2", subcategoryId:"sc-safety-2", name:"Légzsák ütközés szenzor (Frontális)", slug:"utkozes-szenzor-front" },
    { id:"pi-airc-3", subcategoryId:"sc-safety-2", name:"Légzsák ütközés szenzor (Oldalsó)", slug:"utkozes-szenzor-oldal" },
    { id:"pi-airc-4", subcategoryId:"sc-safety-2", name:"Légzsák átvezető szalag (Kormányba)", slug:"legzsak-atvezeto" },


    // Level 3 - VÁLTÓ
    { id:"pi-gear-1", subcategoryId:"sc-trans-1", name:"Mechanikus sebességváltó (5 sebességes)", slug:"kezi-valto-5" },
    { id:"pi-gear-2", subcategoryId:"sc-trans-1", name:"Mechanikus sebességváltó (6 sebességes)", slug:"kezi-valto-6" },
    { id:"pi-gear-3", subcategoryId:"sc-trans-1", name:"Automata sebességváltó (Komplett)", slug:"automata-valto-komplett" },
    { id:"pi-gear-4", subcategoryId:"sc-trans-1", name:"Váltó vezérlő elektronika / ECU", slug:"valto-vezerlo" },
    { id:"pi-gear-5", subcategoryId:"sc-trans-1", name:"Váltókulissza / Kar (Automata)", slug:"valtokulissza-auto" },
    { id:"pi-gear-6", subcategoryId:"sc-trans-1", name:"Váltókulissza / Kar (Mechanikus)", slug:"valtokulissza-kezi" },
    { id:"pi-gear-7", subcategoryId:"sc-trans-1", name:"Sebességváltó tartó bak", slug:"valto-tarto-bak" },
    { id:"pi-gear-8", subcategoryId:"sc-trans-1", name:"Váltóolaj hűtő", slug:"valto-huto" },

    // Level 3 - FÉLTENGELY
    { id:"pi-axle-1", subcategoryId:"sc-trans-2", name:"Bal első féltengely", slug:"bal-elso-feltengely" },
    { id:"pi-axle-2", subcategoryId:"sc-trans-2", name:"Jobb első féltengely", slug:"jobb-elso-feltengely" },
    { id:"pi-axle-3", subcategoryId:"sc-trans-2", name:"Bal hátsó féltengely", slug:"bal-hatso-feltengely" },
    { id:"pi-axle-4", subcategoryId:"sc-trans-2", name:"Jobb hátsó féltengely", slug:"jobb-hatso-feltengely" },
    { id:"pi-axle-5", subcategoryId:"sc-trans-2", name:"Féltengely csukló (Külső)", slug:"feltengely-csuklo-kulso" },
    { id:"pi-axle-6", subcategoryId:"sc-trans-2", name:"Féltengely csukló (Belső)", slug:"feltengely-csuklo-belso" },
    { id:"pi-axle-7", subcategoryId:"sc-trans-2", name:"Féltengely gumiharang készlet", slug:"feltengely-gumiharang" },

    // Level 3 - KUPLUNG
    { id:"pi-clutch-1", subcategoryId:"sc-trans-3", name:"Kuplung szett (Tárcsa + Szerkezet)", slug:"kuplung-szett" },
    { id:"pi-clutch-2", subcategoryId:"sc-trans-3", name:"Kettőstömegű lendkerék (LUK/SACHS)", slug:"kettostomegu-lendkerek-brand" },
    { id:"pi-clutch-3", subcategoryId:"sc-trans-3", name:"Kinyomócsapágy (Hidraulikus)", slug:"kinyomocsapagy-hidro" },
    { id:"pi-clutch-4", subcategoryId:"sc-trans-3", name:"Kuplung főmunkahenger", slug:"kuplung-fomunkahenger" },
    { id:"pi-clutch-5", subcategoryId:"sc-trans-3", name:"Kuplung alsó munkahenger", slug:"kuplung-also-munkahenger" },
    { id:"pi-clutch-6", subcategoryId:"sc-trans-3", name:"Kuplung pedál / kapcsoló", slug:"kuplung-pedal" },


    // Level 3 - ABS EGYSÉG
    { id:"pi-abs-1", subcategoryId:"sc-brakes-1", name:"ABS kocka / ABS tömb", slug:"abs-kocka" },
    { id:"pi-abs-2", subcategoryId:"sc-brakes-1", name:"ABS vezérlő elektronika", slug:"abs-vezerlo" },
    { id:"pi-abs-3", subcategoryId:"sc-brakes-1", name:"ABS szivattyú motor", slug:"abs-szivattyu-motor" },

    // Level 3 - FÉKNYEREG
    { id:"pi-bc-1", subcategoryId:"sc-brakes-2", name:"Bal első féknyereg", slug:"bal-elso-feknyereg" },
    { id:"pi-bc-2", subcategoryId:"sc-brakes-2", name:"Jobb első féknyereg", slug:"jobb-elso-feknyereg" },
    { id:"pi-bc-3", subcategoryId:"sc-brakes-2", name:"Bal hátsó féknyereg", slug:"bal-hatso-feknyereg" },
    { id:"pi-bc-4", subcategoryId:"sc-brakes-2", name:"Jobb hátsó féknyereg", slug:"jobb-hatso-feknyereg" },
    { id:"pi-bc-5", subcategoryId:"sc-brakes-2", name:"Elektromos féknyereg motor (Kézifék)", slug:"elektromos-kezifek-motor" },
    { id:"pi-bc-6", subcategoryId:"sc-brakes-2", name:"Féknyereg tartó konzol", slug:"feknyereg-konzol" },
    { id:"pi-bc-7", subcategoryId:"sc-brakes-2", name:"Főfékhenger", slug:"fofekhenger" },
    { id:"pi-bc-8", subcategoryId:"sc-brakes-2", name:"Fékrásegítő (Vákuumdob)", slug:"fekrasegito-dob" },
    { id:"pi-bc-9", subcategoryId:"sc-brakes-2", name:"Vákuumszivattyú (Fékhez)", slug:"vakuumszivattyu-fek" },
    { id:"pi-bc-10", subcategoryId:"sc-brakes-2", name:"Kézifék kar / elektronika", slug:"kezifek-kar" },


    // Level 3 - LENGŐKAR
    { id:"pi-arm-1", subcategoryId:"sc-steering-1", name:"Alsó lengőkar (Bal)", slug:"bal-also-lengokar" },
    { id:"pi-arm-2", subcategoryId:"sc-steering-1", name:"Alsó lengőkar (Jobb)", slug:"jobb-also-lengokar" },
    { id:"pi-arm-3", subcategoryId:"sc-steering-1", name:"Felső lengőkar szett", slug:"felso-lengokar" },
    { id:"pi-arm-4", subcategoryId:"sc-steering-1", name:"Stabilizátor pálca", slug:"stabi-palca" },

    // Level 3 - KORMÁNYMŰ
    { id:"pi-sw-1", subcategoryId:"sc-steering-2", name:"Kormánymű (Hidraulikus szervóval)", slug:"szervos-kormanymu" },
    { id:"pi-sw-2", subcategoryId:"sc-steering-2", name:"Elektromos kormánymű (EPS)", slug:"elektromos-kormanymu" },
    { id:"pi-sw-3", subcategoryId:"sc-steering-2", name:"Szervószivattyú (Mechanikus)", slug:"szervoszivattyu-mech" },
    { id:"pi-sw-4", subcategoryId:"sc-steering-2", name:"Elektromos szervószivattyú", slug:"elektromos-szervoszivattyu" },
    { id:"pi-sw-5", subcategoryId:"sc-steering-2", name:"Kormányösszekötő rúd készlet", slug:"kormanyosszekoto-rud" },
    { id:"pi-sw-6", subcategoryId:"sc-steering-2", name:"Kormány gömbfej (Bal/Jobb)", slug:"kormany-gombfej" },
    { id:"pi-sw-7", subcategoryId:"sc-steering-2", name:"Kormányoszlop (állítható)", slug:"kormanyoszlop" },
    { id:"pi-sw-8", subcategoryId:"sc-steering-2", name:"Kormány kardáncsukló", slug:"kormany-kardancsuklo" },

    // Level 3 - CSONKÁLLVÁNY
    { id:"pi-hub-1", subcategoryId:"sc-steering-3", name:"Bal első csonkállvány (komplett)", slug:"bal-elso-csonkallvany" },
    { id:"pi-hub-2", subcategoryId:"sc-steering-3", name:"Jobb első csonkállvány (komplett)", slug:"jobb-elso-csonkallvany" },
    { id:"pi-hub-3", subcategoryId:"sc-steering-3", name:"Bal hátsó csonkállvány", slug:"bal-hatso-csonkallvany" },
    { id:"pi-hub-4", subcategoryId:"sc-steering-3", name:"Jobb hátsó csonkállvány", slug:"jobb-hatso-csonkallvany" },
    { id:"pi-hub-5", subcategoryId:"sc-steering-3", name:"Kerékagy + Kerékcsapágy készlet", slug:"kerekagy-csapagy" },
    { id:"pi-hub-6", subcategoryId:"sc-steering-3", name:"Kerékcsavar készlet", slug:"kerekcsavar" },


    // Level 3 - DÍSZLÉC
    { id:"pi-trim-1", subcategoryId:"sc-body-other-1", name:"Első ajtó díszléc (Bal/Jobb)", slug:"elso-ajto-diszlec" },
    { id:"pi-trim-2", subcategoryId:"sc-body-other-1", name:"Hátsó ajtó díszléc (Bal/Jobb)", slug:"hatso-ajto-diszlec" },
    { id:"pi-trim-3", subcategoryId:"sc-body-other-1", name:"Tetősín készlet (Combi/SUV)", slug:"tetosin" },
    { id:"pi-trim-4", subcategoryId:"sc-body-other-1", name:"Küszöb díszléc / fellépő", slug:"kuszob-diszlec" },
    { id:"pi-trim-5", subcategoryId:"sc-body-other-1", name:"Sárvédő szélesítés / ív", slug:"sarvedo-szelesites" },
    { id:"pi-trim-6", subcategoryId:"sc-body-other-1", name:"B-oszlop takaró elem", slug:"poszlop-takaro" },
    { id:"pi-trim-7", subcategoryId:"sc-body-other-1", name:"Márkajelzés / Embléma / Felirat", slug:"emblema-felirat" },

    // Level 3 - ABLAKTÖRLŐ MECHANIKA
    { id:"pi-wiper-1", subcategoryId:"sc-body-other-2", name:"Első ablaktörlő mechanika (szerkezet)", slug:"elso-ablaktorlo-szerkezet" },
    { id:"pi-wiper-4", subcategoryId:"sc-body-other-2", name:"Ablaktörlő kar (Első - Bal/Jobb)", slug:"ablaktorlo-kar-elso" },
    { id:"pi-wiper-5", subcategoryId:"sc-body-other-2", name:"Ablaktörlő kar (Hátsó)", slug:"ablaktorlo-kar-hatso" },
    { id:"pi-wiper-6", subcategoryId:"sc-body-other-2", name:"Ablakmosó tartály (komplett)", slug:"ablakmoso-tartaly" },
    { id:"pi-wiper-7", subcategoryId:"sc-body-other-2", name:"Ablakmosó motor / szivattyú", slug:"ablakmoso-szivattyu" },

    // Level 3 - GÁZTELESZKÓP
    { id:"pi-strut-1", subcategoryId:"sc-body-other-3", name:"Csomagtérajtó gázrugó / teleszkóp", slug:"csomagter-teleszkop" },
    { id:"pi-strut-2", subcategoryId:"sc-body-other-3", name:"Motorháztető gázrugó / teleszkóp", slug:"motorhazteto-teleszkop" },
    { id:"pi-strut-3", subcategoryId:"sc-body-other-3", name:"Kesztyűtartó teleszkóp", slug:"kesztyutarto-teleszkop" },


    // Level 3 - RÁDIÓ / FEJEGYSÉG
    { id:"pi-radio-1", subcategoryId:"sc-displays-1", name:"Gyári CD-s rádió / fejegység", slug:"gyari-radio" },
    { id:"pi-radio-2", subcategoryId:"sc-displays-1", name:"Android / Multimédia érintőképernyős fejegység", slug:"multimedia-fejegyseg" },
    { id:"pi-radio-3", subcategoryId:"sc-displays-1", name:"Rádió beépítő keret", slug:"radio-keret" },
    { id:"pi-radio-4", subcategoryId:"sc-displays-1", name:"Rádióerősítő modul / Hi-Fi rendszer", slug:"hifi-erosito" },
    { id:"pi-radio-5", subcategoryId:"sc-displays-1", name:"Hangszóró készlet (Bal/Jobb)", slug:"hangszoro-szett" },

    // Level 3 - NAVIGÁCIÓ
    { id:"pi-nav-1", subcategoryId:"sc-displays-2", name:"Navigációs modul / DVD Meghajtó", slug:"navigacios-modul" },
    { id:"pi-nav-2", subcategoryId:"sc-displays-2", name:"GPS antenna (Cápauszony/Belső)", slug:"gps-antenna" },
    { id:"pi-nav-3", subcategoryId:"sc-displays-2", name:"Navigációs térkép SD kártya", slug:"nav-sd-kartya" },

    // Level 3 - KIJELZŐ
    { id:"pi-disp-1", subcategoryId:"sc-displays-3", name:"Középső információs kijelző / Monitor", slug:"kozepso-kijelzo" },
    { id:"pi-disp-2", subcategoryId:"sc-displays-3", name:"Műszeregység / Óracsoport (Analóg)", slug:"oracsoport-analog" },
    { id:"pi-disp-3", subcategoryId:"sc-displays-3", name:"Műszeregység / Óracsoport (Digitális/Virtual Cockpit)", slug:"oracsoport-digital" },
    { id:"pi-disp-4", subcategoryId:"sc-displays-3", name:"Head-up Display (HUD) projektor", slug:"hud-kijelzo" },


    // Level 3 - VÍZRADIÁTOR
    { id:"pi-cool-1", subcategoryId:"sc-cooling-1", name:"Vízradiátor (Motorhűtő hűtő)", slug:"vizradiator" },
    { id:"pi-cool-2", subcategoryId:"sc-cooling-1", name:"Hűtőventilátor (Kerettel és elektronikával)", slug:"hutoventilator" },
    { id:"pi-cool-3", subcategoryId:"sc-cooling-1", name:"Hűtővíz tágulási tartály", slug:"tagulasi-tartaly" },
    { id:"pi-cool-4", subcategoryId:"sc-cooling-1", name:"Felső vízcső", slug:"vizcso-felso" },
    { id:"pi-cool-5", subcategoryId:"sc-cooling-1", name:"Alsó vízcső", slug:"vizcso-also" },
    { id:"pi-cool-6", subcategoryId:"sc-cooling-1", name:"Vízpumpa (Mechanikus)", slug:"vizpumpa-mech" },
    { id:"pi-cool-7", subcategoryId:"sc-cooling-1", name:"Vízpumpa (Elektromos segédszivattyú)", slug:"vizpumpa-elek" },
    { id:"pi-cool-8", subcategoryId:"sc-cooling-1", name:"Termosztát házzal", slug:"termosztat" },

    // Level 3 - KLÍMAHŰTŐ
    { id:"pi-ac-1", subcategoryId:"sc-cooling-2", name:"Klímahűtő (Kondenzátor)", slug:"klimahuto" },
    { id:"pi-ac-2", subcategoryId:"sc-cooling-2", name:"Klímaszárító szűrő patron", slug:"klimaszarito" },
    { id:"pi-ac-3", subcategoryId:"sc-cooling-2", name:"Klíma nyomáskapcsoló szelep", slug:"klimaszelep" },

    // Level 3 - FŰTŐMOTOR
    { id:"pi-heat-1", subcategoryId:"sc-cooling-3", name:"Fűtőmotor / Utastéri ventilátor", slug:"futomotor" },
    { id:"pi-heat-2", subcategoryId:"sc-cooling-3", name:"Fűtőradiátor (Radiátor)", slug:"futoradiator" },
    { id:"pi-heat-3", subcategoryId:"sc-cooling-3", name:"Fűtéscsap (Elektromos/Vákuumos)", slug:"futescsap" },
    { id:"pi-heat-4", subcategoryId:"sc-cooling-3", name:"Fűtés ellenállás / sün", slug:"futes-ellenallas" },

    // Level 3 - KLÍMA KOMPRESSZOR
    { id:"pi-acc-1", subcategoryId:"sc-cooling-4", name:"Klíma kompresszor (komplett)", slug:"klima-kompresszor" },
    { id:"pi-acc-2", subcategoryId:"sc-cooling-4", name:"Klíma nyomócső", slug:"klima-nyomocso" },
    { id:"pi-acc-3", subcategoryId:"sc-cooling-4", name:"Klíma szívócső", slug:"klima-szivocso" },
    { id:"pi-acc-4", subcategoryId:"sc-cooling-4", name:"Klíma párologtató", slug:"klima-parologtato" },


    // Level 3 - GENERÁTOR
    { id:"pi-alt-1", subcategoryId:"sc-electric-1", name:"Generátor (szabványos)", slug:"generator-std" },
    { id:"pi-alt-2", subcategoryId:"sc-electric-1", name:"Generátor (vízhűtéses)", slug:"generator-vizhutes" },
    { id:"pi-alt-3", subcategoryId:"sc-electric-1", name:"Generátor szabadonfutó szíjtárcsa", slug:"generator-szijtarcsa" },
    { id:"pi-alt-4", subcategoryId:"sc-electric-1", name:"Feszültségszabályzó (beépített)", slug:"feszultsegszabalyzo" },
    { id:"pi-alt-5", subcategoryId:"sc-electric-1", name:"Generátor tartó konzol", slug:"generator-tarto" },
    { id:"pi-alt-6", subcategoryId:"sc-electric-1", name:"Hibrid inverter / konverter", slug:"inverter" },
    { id:"pi-alt-7", subcategoryId:"sc-electric-1", name:"Nagyfeszültségű akkumulátor kábel", slug:"hv-kabel" },

    // Level 3 - ÖNINDÍTÓ
    { id:"pi-start-1", subcategoryId:"sc-electric-2", name:"Önindító motor (komplett)", slug:"onindito-komplett" },
    { id:"pi-start-2", subcategoryId:"sc-electric-2", name:"Önindító bendix / fogaskerék", slug:"onindito-bendix" },
    { id:"pi-start-3", subcategoryId:"sc-electric-2", name:"Önindító behúzó mágnes", slug:"onindito-behuzo" },
    { id:"pi-start-4", subcategoryId:"sc-electric-2", name:"Önindító tartó bak", slug:"onindito-tarto" },

    // Level 3 - ABLAKTÖRLŐ MOTOR
    { id:"pi-wm-1", subcategoryId:"sc-electric-3", name:"Első ablaktörlő motor (Bal)", slug:"bal-elso-ablaktorlo-motor" },
    { id:"pi-wm-2", subcategoryId:"sc-electric-3", name:"Első ablaktörlő motor (Jobb)", slug:"jobb-elso-ablaktorlo-motor" },
    { id:"pi-wm-3", subcategoryId:"sc-electric-3", name:"Hátsó ablaktörlő motor (komplett)", slug:"hatso-ablaktorlo-motor" },
    { id:"pi-wm-4", subcategoryId:"sc-electric-3", name:"Fényszóró törlő motor", slug:"fenyszoro-torlo-motor" },

    // Level 3 - GYÚJTÓTRAFÓ
    { id:"pi-ign-1", subcategoryId:"sc-ignition-1", name:"Gyújtótrafó (hengerekkénti)", slug:"gyujtotrafo-egyes" },
    { id:"pi-ign-2", subcategoryId:"sc-ignition-1", name:"Gyújtótrafó híd / sor (4-es/6-os)", slug:"gyujtotrafo-sor" },
    { id:"pi-ign-3", subcategoryId:"sc-ignition-1", name:"Gyújtáselosztó fedél + rotor", slug:"gyujtaseloszto" },
    { id:"pi-ign-4", subcategoryId:"sc-ignition-1", name:"Gyújtáskábel készlet", slug:"gyujtaskabel-szett" },
    { id:"pi-ign-5", subcategoryId:"sc-ignition-1", name:"Gyújtásmodul / Elektronika", slug:"gyujtasmodul" },

    // Level 3 - IZZÍTÓGYERTYA
    { id:"pi-glow-1", subcategoryId:"sc-ignition-2", name:"Izzítógyertya (1 db)", slug:"izzitogyertya" },
    { id:"pi-glow-2", subcategoryId:"sc-ignition-2", name:"Izzítógyertya relé / vezérlő modul", slug:"izzitorele" },
    { id:"pi-glow-3", subcategoryId:"sc-ignition-2", name:"Izzítás biztosíték / kábel", slug:"izzitas-bizti" },



    // Level 3 - KORMÁNYKAPCSOLÓ
    { id:"pi-swi-1", subcategoryId:"sc-wiring-1", name:"Kormánykapcsoló (Bajuszkapcsoló, komplett)", slug:"bajuszkapcsolo-komplett" },
    { id:"pi-swi-2", subcategoryId:"sc-wiring-1", name:"Tempomat kapcsoló kar", slug:"tempomat-kapcsolo" },
    { id:"pi-swi-3", subcategoryId:"sc-wiring-1", name:"Fénykürt / Index kapcsoló", slug:"index-kapcsolo" },
    { id:"pi-swi-4", subcategoryId:"sc-wiring-1", name:"Ablaktörlő kapcsoló kar", slug:"ablaktorlo-kapcsolo" },

    // Level 3 - ABLAKEMELŐ KAPCSOLÓ
    { id:"pi-wins-1", subcategoryId:"sc-wiring-2", name:"Ablakemelő kapcsoló (Bal első / Főpanel)", slug:"ablakemelo-kapcsolo-be" },
    { id:"pi-wins-2", subcategoryId:"sc-wiring-2", name:"Ablakemelő kapcsoló (Jobb első)", slug:"ablakemelo-kapcsolo-je" },
    { id:"pi-wins-3", subcategoryId:"sc-wiring-2", name:"Ablakemelő kapcsoló (Hátsó, Bal)", slug:"ablakemelo-kapcsolo-hb" },
    { id:"pi-wins-4", subcategoryId:"sc-wiring-2", name:"Ablakemelő kapcsoló (Hátsó, Jobb)", slug:"ablakemelo-kapcsolo-hj" },
    { id:"pi-wins-5", subcategoryId:"sc-wiring-2", name:"Tükörállító kapcsoló", slug:"tukorallito-kapcsolo" },
    { id:"pi-wins-6", subcategoryId:"sc-wiring-2", name:"Ülésfűtés kapcsoló / modul", slug:"ulesfutes-modul" },
    { id:"pi-wins-7", subcategoryId:"sc-wiring-2", name:"Tetőablak kapcsoló", slug:"tetoablak-kapcsolo" },
    { id:"pi-wins-8", subcategoryId:"sc-wiring-2", name:"Vészvillogó kapcsoló", slug:"veszvillogo-kapcsolo" },
    { id:"pi-wins-9", subcategoryId:"sc-wiring-2", name:"Fényszóró magasságállító kapcsoló", slug:"fényszoro-magassag-kapcsolo" },

    // Level 3 - KÁBELKÖTEG
    { id:"pi-wire-1", subcategoryId:"sc-wiring-3", name:"Motor kábelköteg (komplett)", slug:"motor-kabelkoteg" },
    { id:"pi-wire-2", subcategoryId:"sc-wiring-3", name:"Ajtó kábelköteg (Bal első)", slug:"ajto-kabelkoteg-be" },
    { id:"pi-wire-3", subcategoryId:"sc-wiring-3", name:"Csomagtérajtó kábelköteg", slug:"csomagter-kabelkoteg" },


    // Level 3 - AJTÓZÁR
    { id:"pi-lock-1", subcategoryId:"sc-locks-1", name:"Ajtózár szerkezet (Bal első)", slug:"bal-elso-zar" },
    { id:"pi-lock-2", subcategoryId:"sc-locks-1", name:"Ajtózár szerkezet (Jobb első)", slug:"jobb-elso-zar" },
    { id:"pi-lock-3", subcategoryId:"sc-locks-1", name:"Ajtózár szerkezet (Bal hátsó)", slug:"bal-hatso-zar" },
    { id:"pi-lock-4", subcategoryId:"sc-locks-1", name:"Ajtózár szerkezet (Jobb hátsó)", slug:"jobb-hatso-zar" },
    { id:"pi-lock-5", subcategoryId:"sc-locks-1", name:"Külső kilincs (színre fújt)", slug:"kulso-kilincs" },
    { id:"pi-lock-6", subcategoryId:"sc-locks-1", name:"Belső kilincs (króm/műanyag)", slug:"belso-kilincs" },

    // Level 3 - GYÚJTÁSKAPCSOLÓ
    { id:"pi-ignit-1", subcategoryId:"sc-locks-2", name:"Gyújtáskapcsoló zárhengerrel és betéttel", slug:"gyujtaskapcsolo-komplett" },
    { id:"pi-ignit-2", subcategoryId:"sc-locks-2", name:"Gyújtáskapcsoló betét (elektromos rész)", slug:"gyujtaskapcsolo-betet" },
    { id:"pi-ignit-3", subcategoryId:"sc-locks-2", name:"Indítókulcs / Slusszkulcs (Távirányítóval)", slug:"inditokulcs" },
    { id:"pi-ignit-4", subcategoryId:"sc-locks-2", name:"Zárgarnitúra (Csomagtér+Ajtók)", slug:"zargarnitura" },

    // Level 3 - ÜZEMANYAGSZIVATTYÚ
    { id:"pi-fuel-1", subcategoryId:"sc-fuel-1", name:"Benzinpumpa / Ac pumpa (Tankbeli hordozóval)", slug:"benzinpumpa" },
    { id:"pi-fuel-2", subcategoryId:"sc-fuel-1", name:"Üzemanyag szintjelző (külön)", slug:"szintjelzo" },
    { id:"pi-fuel-3", subcategoryId:"sc-fuel-1", name:"Üzemanyag tank / tartály", slug:"uzemanyag-tank" },
    { id:"pi-fuel-4", subcategoryId:"sc-fuel-1", name:"Üzemanyag betöltő nyílás / fedél", slug:"tankajto" },

    // Level 3 - INJEKTOR
    { id:"pi-inj-1", subcategoryId:"sc-fuel-2", name:"Injektor készlet (4 db)", slug:"injektor-szett" },
    { id:"pi-inj-2", subcategoryId:"sc-fuel-2", name:"Injektor (1 db)", slug:"injektor-darab" },
    { id:"pi-inj-3", subcategoryId:"sc-fuel-2", name:"Common Rail nyomócső (Elosztó)", slug:"common-rail-cso" },
    { id:"pi-inj-4", subcategoryId:"sc-fuel-2", name:"Nagynyomású üzemanyag cső", slug:"nagynyomasu-cso" },

    // Level 3 - KIPUFOGÓ DOB
    { id:"pi-exh-1", subcategoryId:"sc-exhaust-1", name:"Középső kipufogó dob (Sima/Sport)", slug:"kozepso-dob" },
    { id:"pi-exh-2", subcategoryId:"sc-exhaust-1", name:"Hátsó kipufogó dob (Végdob)", slug:"hatso-dob" },
    { id:"pi-exh-3", subcategoryId:"sc-exhaust-1", name:"Kipufogó leömlő / Csonk", slug:"kipufogo-leomlo" },

    // Level 3 - KATALIZÁTOR
    { id:"pi-cat-1", subcategoryId:"sc-exhaust-2", name:"Katalizátor egység (Eredeti/Után gyártott)", slug:"katalizator" },
    { id:"pi-cat-2", subcategoryId:"sc-exhaust-2", name:"Katalizátor hővédő lemez", slug:"hovedo-lemez" },

    // Level 3 - RÉSZECSKESZŰRŐ
    { id:"pi-dpf-1", subcategoryId:"sc-exhaust-3", name:"DPF szűrő / Részecskeszűrő", slug:"dpf-szuro" },
    { id:"pi-dpf-2", subcategoryId:"sc-exhaust-3", name:"DPF nyomásmérő szenzor", slug:"dpf-szenzor" },
    { id:"pi-dpf-3", subcategoryId:"sc-exhaust-3", name:"AdBlue befecskendező szelep", slug:"adblue-injektor" },


    // Level 3 - EGYÉB
    { id:"pi-oth-1", subcategoryId:"sc-other-1", name:"Egyéb kiegészítő alkatrész", slug:"egyeb-kiegeszito" },


    { id:"pi-air-gen-3", subcategoryId:"sc-safety-1", name:"Ülésfoglaltság érzékelő emulátor (Légzsák)", slug:"lgzsk-lsfoglaltsg-rzkel-emultor-3" },
    { id:"pi-air-gen-4", subcategoryId:"sc-safety-1", name:"Légzsák kikapcsoló (Légzsák)", slug:"lgzsk-lgzsk-kikapcsol-4" },
    { id:"pi-air-gen-5", subcategoryId:"sc-safety-1", name:"Légzsák takaró panel (Légzsák)", slug:"lgzsk-lgzsk-takar-panel-5" },
    { id:"pi-air-gen-6", subcategoryId:"sc-safety-1", name:"Fejlégzsák (Légzsák)", slug:"lgzsk-fejlgzsk-6" },
    { id:"pi-air-gen-7", subcategoryId:"sc-safety-1", name:"Hátsó légzsák (Légzsák)", slug:"lgzsk-hts-lgzsk-7" },
    { id:"pi-air-gen-8", subcategoryId:"sc-safety-1", name:"Légzsák indító patron (Légzsák)", slug:"lgzsk-lgzsk-indt-patron-8" },
    { id:"pi-air-gen-9", subcategoryId:"sc-safety-1", name:"Légzsák rögzítő patent (Légzsák)", slug:"lgzsk-lgzsk-rgzt-patent-9" },
    { id:"pi-air-gen-10", subcategoryId:"sc-safety-1", name:"Légzsák figyelmeztető lámpa (Légzsák)", slug:"lgzsk-lgzsk-figyelmeztet-lmpa-10" },

    { id:"pi-lock-gen-4", subcategoryId:"sc-locks-1", name:"Zárrögzítő (Ajtózár)", slug:"ajtzr-zrrgzt-4" },
    { id:"pi-lock-gen-5", subcategoryId:"sc-locks-1", name:"Zárbowden (Ajtózár)", slug:"ajtzr-zrbowden-5" },
    { id:"pi-lock-gen-6", subcategoryId:"sc-locks-1", name:"Zár motor (Ajtózár)", slug:"ajtzr-zr-motor-6" },
    { id:"pi-lock-gen-7", subcategoryId:"sc-locks-1", name:"Kilincs rugó (Ajtózár)", slug:"ajtzr-kilincs-rug-7" },
    { id:"pi-lock-gen-8", subcategoryId:"sc-locks-1", name:"Kilincs tengely (Ajtózár)", slug:"ajtzr-kilincs-tengely-8" },
    { id:"pi-lock-gen-9", subcategoryId:"sc-locks-1", name:"Kilincs burkolat (Ajtózár)", slug:"ajtzr-kilincs-burkolat-9" },
    { id:"pi-lock-gen-10", subcategoryId:"sc-locks-1", name:"Zárburkolat (Ajtózár)", slug:"ajtzr-zrburkolat-10" },
    { id:"pi-ignit-gen-1", subcategoryId:"sc-locks-2", name:"Kapcsolóbetét (Gyújtáskapcsoló)", slug:"gyjtskapcsol-kapcsolbett-1" },
    { id:"pi-ignit-gen-2", subcategoryId:"sc-locks-2", name:"Zárhenger (Gyújtáskapcsoló)", slug:"gyjtskapcsol-zrhenger-2" },
    { id:"pi-ignit-gen-3", subcategoryId:"sc-locks-2", name:"Kulcs szár (Gyújtáskapcsoló)", slug:"gyjtskapcsol-kulcs-szr-3" },
    { id:"pi-ignit-gen-4", subcategoryId:"sc-locks-2", name:"Távirányító ház (Gyújtáskapcsoló)", slug:"gyjtskapcsol-tvirnyt-hz-4" },
    { id:"pi-ignit-gen-5", subcategoryId:"sc-locks-2", name:"Immobolizer gyűrű (Gyújtáskapcsoló)", slug:"gyjtskapcsol-immobolizer-gyr-5" },
    { id:"pi-ignit-gen-6", subcategoryId:"sc-locks-2", name:"Antenna (Gyújtáskapcsoló)", slug:"gyjtskapcsol-antenna-6" },
    { id:"pi-ignit-gen-7", subcategoryId:"sc-locks-2", name:"Kulcsmásolás chip (Gyújtáskapcsoló)", slug:"gyjtskapcsol-kulcsmsols-chip-7" },
    { id:"pi-ignit-gen-8", subcategoryId:"sc-locks-2", name:"Gyújtáskapcsoló rugó (Gyújtáskapcsoló)", slug:"gyjtskapcsol-gyjtskapcsol-rug-8" },
    { id:"pi-ignit-gen-9", subcategoryId:"sc-locks-2", name:"Gyújtáskapcsoló ház (Gyújtáskapcsoló)", slug:"gyjtskapcsol-gyjtskapcsol-hz-9" },
    { id:"pi-ignit-gen-10", subcategoryId:"sc-locks-2", name:"Zárretesz (Gyújtáskapcsoló)", slug:"gyjtskapcsol-zrretesz-10" },
    { id:"pi-fuel-gen-1", subcategoryId:"sc-fuel-1", name:"Üzemanyag tank (Üzemanyag)", slug:"zemanyag-zemanyag-tank-1" },
    { id:"pi-fuel-gen-2", subcategoryId:"sc-fuel-1", name:"Tankbeöntő cső (Üzemanyag)", slug:"zemanyag-tankbent-cs-2" },
    { id:"pi-fuel-gen-3", subcategoryId:"sc-fuel-1", name:"Tankajtó (Üzemanyag)", slug:"zemanyag-tankajt-3" },
    { id:"pi-fuel-gen-4", subcategoryId:"sc-fuel-1", name:"Üzemanyag szűrő (Üzemanyag)", slug:"zemanyag-zemanyag-szr-4" },
    { id:"pi-fuel-gen-5", subcategoryId:"sc-fuel-1", name:"Üzemanyag cső (Üzemanyag)", slug:"zemanyag-zemanyag-cs-5" },
    { id:"pi-fuel-gen-6", subcategoryId:"sc-fuel-1", name:"Benzinpumpa relé (Üzemanyag)", slug:"zemanyag-benzinpumpa-rel-6" },
    { id:"pi-fuel-gen-7", subcategoryId:"sc-fuel-1", name:"Üzemanyag szintjelző (Üzemanyag)", slug:"zemanyag-zemanyag-szintjelz-7" },
    { id:"pi-fuel-gen-8", subcategoryId:"sc-fuel-1", name:"Tank szellőztető szelep (Üzemanyag)", slug:"zemanyag-tank-szellztet-szelep-8" },
    { id:"pi-fuel-gen-9", subcategoryId:"sc-fuel-1", name:"Üzemanyag tartály tartó (Üzemanyag)", slug:"zemanyag-zemanyag-tartly-tart-9" },
    { id:"pi-fuel-gen-10", subcategoryId:"sc-fuel-1", name:"Tank sapka (Üzemanyag)", slug:"zemanyag-tank-sapka-10" },
    { id:"pi-inj-gen-1", subcategoryId:"sc-fuel-2", name:"Befecskendező szelep (Injektor)", slug:"injektor-befecskendez-szelep-1" },
    { id:"pi-inj-gen-2", subcategoryId:"sc-fuel-2", name:"Injektor tömítés (Injektor)", slug:"injektor-injektor-tmts-2" },
    { id:"pi-inj-gen-3", subcategoryId:"sc-fuel-2", name:"Rail cső szelep (Injektor)", slug:"injektor-rail-cs-szelep-3" },
    { id:"pi-inj-gen-4", subcategoryId:"sc-fuel-2", name:"Nyomásszabályzó (Injektor)", slug:"injektor-nyomsszablyz-4" },
    { id:"pi-inj-gen-5", subcategoryId:"sc-fuel-2", name:"Injektor kábel (Injektor)", slug:"injektor-injektor-kbel-5" },
    { id:"pi-inj-gen-6", subcategoryId:"sc-fuel-2", name:"Injektor tartó (Injektor)", slug:"injektor-injektor-tart-6" },
    { id:"pi-inj-gen-7", subcategoryId:"sc-fuel-2", name:"Befecskendező fej (Injektor)", slug:"injektor-befecskendez-fej-7" },
    { id:"pi-inj-gen-8", subcategoryId:"sc-fuel-2", name:"Üzemanyag elosztó (Injektor)", slug:"injektor-zemanyag-eloszt-8" },
    { id:"pi-inj-gen-9", subcategoryId:"sc-fuel-2", name:"Résolaj cső készlet (Injektor)", slug:"injektor-rsolaj-cs-kszlet-9" },
    { id:"pi-inj-gen-10", subcategoryId:"sc-fuel-2", name:"Injektor rögzítő köröm (Injektor)", slug:"injektor-injektor-rgzt-krm-10" },
    { id:"pi-exh-gen-1", subcategoryId:"sc-exhaust-1", name:"Kipufogó dob (Kipufogó)", slug:"kipufog-kipufog-dob-1" },
    { id:"pi-exh-gen-2", subcategoryId:"sc-exhaust-1", name:"Kipufogó cső (Kipufogó)", slug:"kipufog-kipufog-cs-2" },
    { id:"pi-exh-gen-3", subcategoryId:"sc-exhaust-1", name:"Kipufogó bilincs (Kipufogó)", slug:"kipufog-kipufog-bilincs-3" },
    { id:"pi-exh-gen-4", subcategoryId:"sc-exhaust-1", name:"Kipufogó gumi függesztő (Kipufogó)", slug:"kipufog-kipufog-gumi-fggeszt-4" },
    { id:"pi-exh-gen-5", subcategoryId:"sc-exhaust-1", name:"Kipufogó tömítés (Kipufogó)", slug:"kipufog-kipufog-tmts-5" },
    { id:"pi-exh-gen-6", subcategoryId:"sc-exhaust-1", name:"Kipufogó vég (Kipufogó)", slug:"kipufog-kipufog-vg-6" },
    { id:"pi-exh-gen-7", subcategoryId:"sc-exhaust-1", name:"Rezonátorcső (Kipufogó)", slug:"kipufog-rezontorcs-7" },
    { id:"pi-exh-gen-8", subcategoryId:"sc-exhaust-1", name:"Kipufogó leömlő (Kipufogó)", slug:"kipufog-kipufog-leml-8" },
    { id:"pi-exh-gen-9", subcategoryId:"sc-exhaust-1", name:"Hővédő lemez (Kipufogó)", slug:"kipufog-hvd-lemez-9" },
    { id:"pi-exh-gen-10", subcategoryId:"sc-exhaust-1", name:"Kipufogó tartó (Kipufogó)", slug:"kipufog-kipufog-tart-10" },
    { id:"pi-cat-gen-1", subcategoryId:"sc-exhaust-2", name:"Katalizátor betét (Katalizátor)", slug:"kataliztor-kataliztor-bett-1" },
    { id:"pi-cat-gen-2", subcategoryId:"sc-exhaust-2", name:"Katalizátor ház (Katalizátor)", slug:"kataliztor-kataliztor-hz-2" },
    { id:"pi-cat-gen-3", subcategoryId:"sc-exhaust-2", name:"Lambda szonda menet (Katalizátor)", slug:"kataliztor-lambda-szonda-menet-3" },
    { id:"pi-cat-gen-4", subcategoryId:"sc-exhaust-2", name:"Katalizátor tőcsavar (Katalizátor)", slug:"kataliztor-kataliztor-tcsavar-4" },
    { id:"pi-cat-gen-5", subcategoryId:"sc-exhaust-2", name:"Katalizátor tömítés (Katalizátor)", slug:"kataliztor-kataliztor-tmts-5" },
    { id:"pi-cat-gen-6", subcategoryId:"sc-exhaust-2", name:"Katalizátor tartó (Katalizátor)", slug:"kataliztor-kataliztor-tart-6" },
    { id:"pi-cat-gen-7", subcategoryId:"sc-exhaust-2", name:"Oxidációs katalizátor (Katalizátor)", slug:"kataliztor-oxidcis-kataliztor-7" },
    { id:"pi-cat-gen-8", subcategoryId:"sc-exhaust-2", name:"Katalizátor védőburkolat (Katalizátor)", slug:"kataliztor-kataliztor-vdburkolat-8" },
    { id:"pi-cat-gen-9", subcategoryId:"sc-exhaust-2", name:"Hővédő pajzs (Katalizátor)", slug:"kataliztor-hvd-pajzs-9" },
    { id:"pi-cat-gen-10", subcategoryId:"sc-exhaust-2", name:"Katalizátor bilincs (Katalizátor)", slug:"kataliztor-kataliztor-bilincs-10" },
    { id:"pi-dpf-gen-1", subcategoryId:"sc-exhaust-3", name:"Részecskeszűrő betét (DPF)", slug:"dpf-rszecskeszr-bett-1" },
    { id:"pi-dpf-gen-2", subcategoryId:"sc-exhaust-3", name:"Nyomáskülönbség szenzor cső (DPF)", slug:"dpf-nyomsklnbsg-szenzor-cs-2" },
    { id:"pi-dpf-gen-3", subcategoryId:"sc-exhaust-3", name:"Hőmérséklet jeladó (DPF) (DPF)", slug:"dpf-hmrsklet-jelad-dpf-3" },
    { id:"pi-dpf-gen-4", subcategoryId:"sc-exhaust-3", name:"AdBlue befecskendező (DPF)", slug:"dpf-adblue-befecskendez-4" },
    { id:"pi-dpf-gen-5", subcategoryId:"sc-exhaust-3", name:"DPF tisztító csatlakozó (DPF)", slug:"dpf-dpf-tisztt-csatlakoz-5" },
    { id:"pi-dpf-gen-6", subcategoryId:"sc-exhaust-3", name:"Részecskeszűrő ház (DPF)", slug:"dpf-rszecskeszr-hz-6" },
    { id:"pi-dpf-gen-7", subcategoryId:"sc-exhaust-3", name:"DPF rögzítő (DPF)", slug:"dpf-dpf-rgzt-7" },
    { id:"pi-dpf-gen-8", subcategoryId:"sc-exhaust-3", name:"DPF tömítés (DPF)", slug:"dpf-dpf-tmts-8" },
    { id:"pi-dpf-gen-9", subcategoryId:"sc-exhaust-3", name:"Differenciál nyomás távadó (DPF)", slug:"dpf-differencil-nyoms-tvad-9" },
    { id:"pi-dpf-gen-10", subcategoryId:"sc-exhaust-3", name:"Regeneráló szelep (DPF)", slug:"dpf-regenerl-szelep-10" },
    { id:"pi-oth-gen-1", subcategoryId:"sc-other-1", name:"Motorelem (Egyéb)", slug:"egyb-motorelem-1" },
    { id:"pi-oth-gen-2", subcategoryId:"sc-other-1", name:"Alváz elem (Egyéb)", slug:"egyb-alvz-elem-2" },
    { id:"pi-oth-gen-3", subcategoryId:"sc-other-1", name:"Patent (Egyéb)", slug:"egyb-patent-3" },
    { id:"pi-oth-gen-4", subcategoryId:"sc-other-1", name:"Csavar készlet (Egyéb)", slug:"egyb-csavar-kszlet-4" },
    { id:"pi-oth-gen-5", subcategoryId:"sc-other-1", name:"Tömítés készlet (Egyéb)", slug:"egyb-tmts-kszlet-5" },
    { id:"pi-oth-gen-6", subcategoryId:"sc-other-1", name:"Rugó (Egyéb)", slug:"egyb-rug-6" },
    { id:"pi-oth-gen-7", subcategoryId:"sc-other-1", name:"Bilincs (Egyéb)", slug:"egyb-bilincs-7" },
    { id:"pi-oth-gen-8", subcategoryId:"sc-other-1", name:"Takaró fedél (Egyéb)", slug:"egyb-takar-fedl-8" },
    { id:"pi-oth-gen-9", subcategoryId:"sc-other-1", name:"Dugó (Egyéb)", slug:"egyb-dug-9" },
    { id:"pi-oth-gen-10", subcategoryId:"sc-other-1", name:"Konzol (Egyéb)", slug:"egyb-konzol-10" },

    // --- NEW: LENGÉSCSILLAPÍTÓ ÉS RUGÓ ---
    { id:"pi-steer-n-1", subcategoryId:"sc-steering-4", name:"Első lengéscsillapító", slug:"elso-lengescsillapito" },
    { id:"pi-steer-n-2", subcategoryId:"sc-steering-4", name:"Hátsó lengéscsillapító", slug:"hatso-lengescsillapito" },
    { id:"pi-steer-n-3", subcategoryId:"sc-steering-4", name:"Spirálrugó (Első)", slug:"elso-spiralrugo" },
    { id:"pi-steer-n-4", subcategoryId:"sc-steering-4", name:"Spirálrugó (Hátsó)", slug:"hatso-spiralrugo" },
    { id:"pi-steer-n-5", subcategoryId:"sc-steering-4", name:"Toronycsapágy", slug:"toronycsapagy" },
    { id:"pi-steer-n-6", subcategoryId:"sc-steering-4", name:"Porvédő gumi / Felütközésgátló", slug:"porvedo-gumi-felutkozesgatlo" },
    { id:"pi-steer-n-7", subcategoryId:"sc-steering-4", name:"Laprugó", slug:"laprugo" },
    { id:"pi-steer-n-8", subcategoryId:"sc-steering-4", name:"Légrugó / Szintszabályzó", slug:"legrugo" },

    // --- NEW: FELNI / KERÉK / GUMI ---
    { id:"pi-wheel-n-1", subcategoryId:"sc-steering-5", name:"Alufelni (Könnyűfém tárcsa)", slug:"alufelni" },
    { id:"pi-wheel-n-2", subcategoryId:"sc-steering-5", name:"Lemezfelni (Acéltárcsa)", slug:"lemezfelni" },
    { id:"pi-wheel-n-3", subcategoryId:"sc-steering-5", name:"Nyári gumiabroncs", slug:"nyari-gumi" },
    { id:"pi-wheel-n-4", subcategoryId:"sc-steering-5", name:"Téli gumiabroncs", slug:"teli-gumi" },
    { id:"pi-wheel-n-5", subcategoryId:"sc-steering-5", name:"Négyévszakos gumiabroncs", slug:"negyevszakos-gumi" },
    { id:"pi-wheel-n-6", subcategoryId:"sc-steering-5", name:"Mankókerék / Pótkerék", slug:"mankokerek-potkerek" },
    { id:"pi-wheel-n-7", subcategoryId:"sc-steering-5", name:"Dísztárcsa", slug:"disztarcsa" },
    { id:"pi-wheel-n-8", subcategoryId:"sc-steering-5", name:"Kerékcsavar / Kerékanya", slug:"kerekcsavar" },
    { id:"pi-wheel-n-9", subcategoryId:"sc-steering-5", name:"Csomagtér emelő / Kerékkulcs szett", slug:"emelo-kerekkulcs" },

    // --- NEW: FÉKTÁRCSA ÉS FÉKBETÉT ---
    { id:"pi-brake-n-1", subcategoryId:"sc-brakes-3", name:"Első féktárcsa", slug:"elso-fektarcsa" },
    { id:"pi-brake-n-2", subcategoryId:"sc-brakes-3", name:"Hátsó féktárcsa", slug:"hatso-fektarcsa" },
    { id:"pi-brake-n-3", subcategoryId:"sc-brakes-3", name:"Első fékbetét garnitúra", slug:"elso-fekbetet" },
    { id:"pi-brake-n-4", subcategoryId:"sc-brakes-3", name:"Hátsó fékbetét garnitúra", slug:"hatso-fekbetet" },
    { id:"pi-brake-n-5", subcategoryId:"sc-brakes-3", name:"Fékdob", slug:"fekdob" },
    { id:"pi-brake-n-6", subcategoryId:"sc-brakes-3", name:"Fékpofa garnitúra (Dobfék / Kézifék)", slug:"fekpofa" },
    { id:"pi-brake-n-7", subcategoryId:"sc-brakes-3", name:"Fékkopás jelző", slug:"fekkopas-jelzo" },

    // --- NEW: FÉK ELEKTRONIKA ÉS HIDRAULIKA ---
    { id:"pi-brake-n-8", subcategoryId:"sc-brakes-4", name:"Főfékhenger", slug:"fofekhenger" },
    { id:"pi-brake-n-9", subcategoryId:"sc-brakes-4", name:"Fékrásegítő (Szervódob)", slug:"fekrasegito-szervodob" },
    { id:"pi-brake-n-10", subcategoryId:"sc-brakes-4", name:"Kézifék bowden", slug:"kezifek-bowden" },
    { id:"pi-brake-n-11", subcategoryId:"sc-brakes-4", name:"ABS / Kerékfordulatszám jeladó (Bal első)", slug:"abs-jelado-be" },
    { id:"pi-brake-n-14", subcategoryId:"sc-brakes-4", name:"ABS / Kerékfordulatszám jeladó (Jobb első)", slug:"abs-jelado-je" },
    { id:"pi-brake-n-15", subcategoryId:"sc-brakes-4", name:"ABS / Kerékfordulatszám jeladó (Bal hátsó)", slug:"abs-jelado-bh" },
    { id:"pi-brake-n-16", subcategoryId:"sc-brakes-4", name:"ABS / Kerékfordulatszám jeladó (Jobb hátsó)", slug:"abs-jelado-jh" },
    { id:"pi-brake-n-12", subcategoryId:"sc-brakes-4", name:"Fékcső (Gumi / Fém)", slug:"fekcso" },
    { id:"pi-brake-n-13", subcategoryId:"sc-brakes-4", name:"Vákuumpumpa (Fék)", slug:"vakuumpumpa-fek" },

    // --- NEW: SZÍVÓSOR ÉS LEVEGŐELLÁTÁS ---
    { id:"pi-eng-n-1", subcategoryId:"sc-engine-6", name:"Szívósor / Szívócső", slug:"szivosor" },
    { id:"pi-eng-n-2", subcategoryId:"sc-engine-6", name:"Fojtószelep (Ház)", slug:"fojtoszelep" },
    { id:"pi-eng-n-3", subcategoryId:"sc-engine-6", name:"EGR szelep", slug:"egr-szelep" },
    { id:"pi-eng-n-4", subcategoryId:"sc-engine-6", name:"Légtömegmérő (MAF)", slug:"legtomegmero" },
    { id:"pi-eng-n-5", subcategoryId:"sc-engine-6", name:"Légszűrő ház", slug:"legszuro-haz" },
    { id:"pi-eng-n-6", subcategoryId:"sc-engine-6", name:"Szívócső nyomásérzékelő (MAP)", slug:"map-szenzor" },
    { id:"pi-eng-n-7", subcategoryId:"sc-engine-6", name:"Levegőcső / Turbócső", slug:"levegocso" },

    // --- NEW: MOTORRÖGZÍTÉS ÉS BURKOLATOK ---
    { id:"pi-eng-n-8", subcategoryId:"sc-engine-7", name:"Motortartó bak", slug:"motortarto-bak" },
    { id:"pi-eng-n-9", subcategoryId:"sc-engine-7", name:"Váltótartó bak", slug:"valtotarto-bak" },
    { id:"pi-eng-n-10", subcategoryId:"sc-engine-7", name:"Alsó motorvédő burkolat", slug:"also-motorvedo" },
    { id:"pi-eng-n-11", subcategoryId:"sc-engine-7", name:"Felső motorburkolat (Műanyag)", slug:"felso-motorburkolat" },
    { id:"pi-eng-n-12", subcategoryId:"sc-engine-7", name:"Olajteknő (Karter)", slug:"olajtekno" },
    { id:"pi-eng-n-13", subcategoryId:"sc-engine-7", name:"Nívópálca és tölcsér", slug:"nivopalca" },

    // --- NEW: HAJTÁSLÁNC ÉS DIFFERENCIÁLMŰ ---
    { id:"pi-trans-n-1", subcategoryId:"sc-trans-4", name:"Differenciálmű (Hátsó híd)", slug:"differencialmu" },
    { id:"pi-trans-n-2", subcategoryId:"sc-trans-4", name:"Kardántengely", slug:"kardantengely" },
    { id:"pi-trans-n-3", subcategoryId:"sc-trans-4", name:"Hardytárcsa / Kardáncsapágy", slug:"hardytarcsa" },
    { id:"pi-trans-n-4", subcategoryId:"sc-trans-4", name:"Osztómű (4x4)", slug:"osztomu" },
    { id:"pi-trans-n-5", subcategoryId:"sc-trans-4", name:"Kettőstömegű lendkerék", slug:"kettostomegu-lendkerek" },
    { id:"pi-trans-n-6", subcategoryId:"sc-trans-4", name:"Haldex kuplung / Vezérlő", slug:"haldex-kuplung" },

    // --- NEW: KÁRPITOK ÉS MŰANYAGOK ---
    { id:"pi-int-n-1", subcategoryId:"sc-interior-5", name:"Tetőkárpit", slug:"tetokarpit" },
    { id:"pi-int-n-2", subcategoryId:"sc-interior-5", name:"Ajtókárpit (Bal első)", slug:"ajtokarpit-be" },
    { id:"pi-int-n-3", subcategoryId:"sc-interior-5", name:"Ajtókárpit (Jobb első)", slug:"ajtokarpit-je" },
    { id:"pi-int-n-4", subcategoryId:"sc-interior-5", name:"Ajtókárpit (Hátsó)", slug:"ajtokarpit-hatso" },
    { id:"pi-int-n-5", subcategoryId:"sc-interior-5", name:"Csomagtér kárpit / Roló / Kalaptartó", slug:"csomagter-karpit" },
    { id:"pi-int-n-6", subcategoryId:"sc-interior-5", name:"Padlószőnyeg", slug:"padloszonyeg" },
    { id:"pi-int-n-7", subcategoryId:"sc-interior-5", name:"Műszerfal / Műszerfal párna", slug:"muszerfal-parna" },
    { id:"pi-int-n-8", subcategoryId:"sc-interior-5", name:"Középkonzol / Könyöklő", slug:"kozepkonzol-konyoklo" },
    { id:"pi-int-n-9", subcategoryId:"sc-interior-5", name:"Hamutartó / Pohártartó", slug:"hamutarto-pohartarto" },
    { id:"pi-int-n-10", subcategoryId:"sc-interior-5", name:"Napellenző (Belső)", slug:"napellenzo" },
    { id:"pi-int-n-11", subcategoryId:"sc-interior-5", name:"Kesztyűtartó", slug:"kesztyutarto" },

    // --- NEW: KÜSZÖB, TETŐ ÉS PADLÓLEMEZ ---
    { id:"pi-body-7-1", subcategoryId:"sc-body-7", name:"Küszöb (Bal)", slug:"kuszob-bal" },
    { id:"pi-body-7-2", subcategoryId:"sc-body-7", name:"Küszöb (Jobb)", slug:"kuszob-jobb" },
    { id:"pi-body-7-3", subcategoryId:"sc-body-7", name:"Tetőlemez", slug:"tetolemez" },
    { id:"pi-body-7-4", subcategoryId:"sc-body-7", name:"Padlólemez", slug:"padlolemez" },
    { id:"pi-body-7-5", subcategoryId:"sc-body-7", name:"A-oszlop (Bal/Jobb)", slug:"aoszlop" },
    { id:"pi-body-7-6", subcategoryId:"sc-body-7", name:"C-oszlop (Bal/Jobb)", slug:"coszlop" },

    // --- NEW: VONÓHOROG ÉS TARTOZÉKA ---
    { id:"pi-tow-1", subcategoryId:"sc-body-other-4", name:"Vonóhorog (Fix)", slug:"vonohorog-fix" },
    { id:"pi-tow-2", subcategoryId:"sc-body-other-4", name:"Vonóhorog (Levehető)", slug:"vonohorog-leveheto" },
    { id:"pi-tow-3", subcategoryId:"sc-body-other-4", name:"Vonóhorog elektronika / kábel", slug:"vonohorog-elektronika" },

    // --- NEW: BELSŐ VILÁGÍTÁS ÉS EGYÉB LÁMPA ---
    { id:"pi-inlight-1", subcategoryId:"sc-lights-5", name:"Utastér világítás (Tetőlampa)", slug:"utaster-teto-lampa" },
    { id:"pi-inlight-2", subcategoryId:"sc-lights-5", name:"Olvasólámpa", slug:"olvasolampa" },
    { id:"pi-inlight-3", subcategoryId:"sc-lights-5", name:"Ajtókilépő fény / Ajtóvilágítás", slug:"ajtokilepo-feny" },
    { id:"pi-inlight-4", subcategoryId:"sc-lights-5", name:"Műszerfal izzó / LED", slug:"muszerfal-izzo" },
    { id:"pi-inlight-5", subcategoryId:"sc-lights-5", name:"Csomagtér világítás", slug:"csomagter-vilagitas" },

    // --- NEW: TETŐABLAK ÉS PANORÁMATETŐ ---
    { id:"pi-sun-1", subcategoryId:"sc-glass-4", name:"Tetőablak (Mechanikus)", slug:"tetoablak-mech" },
    { id:"pi-sun-2", subcategoryId:"sc-glass-4", name:"Tetőablak (Elektromos komplett)", slug:"tetoablak-elek" },
    { id:"pi-sun-3", subcategoryId:"sc-glass-4", name:"Panorámatető üveg", slug:"panoramateto-uveg" },
    { id:"pi-sun-4", subcategoryId:"sc-glass-4", name:"Tetőablak mozgató motor", slug:"tetoablak-motor" },

    // --- NEW: ERŐSÍTŐ ÉS HANGRENDSZER ---
    { id:"pi-amp-1", subcategoryId:"sc-displays-4", name:"Gyári erősítő (DSP/Bose/Harman stb.)", slug:"gyari-erosito" },
    { id:"pi-amp-2", subcategoryId:"sc-displays-4", name:"Mélynyomó / Subwoofer", slug:"melynyomo" },
    { id:"pi-amp-3", subcategoryId:"sc-displays-4", name:"CD/DVD váltó (Tár)", slug:"cd-valto" },
    { id:"pi-amp-4", subcategoryId:"sc-displays-4", name:"Bluetooth modul", slug:"bluetooth-modul" },

    // --- NEW: EGYÉB ELEKTROMOS MOTOROK ---
    { id:"pi-emot-1", subcategoryId:"sc-electric-4", name:"Napfénytető motor", slug:"napfenyteto-motor" },
    { id:"pi-emot-2", subcategoryId:"sc-electric-4", name:"Ülésállító motor", slug:"ulesallito-motor" },
    { id:"pi-emot-3", subcategoryId:"sc-electric-4", name:"Csomagtérajtó nyitó motor (Elektronikus teló)", slug:"csomagter-nyito-motor" },

    // --- NEW: HIBRID ÉS EV ALKATRÉSZEK ---
    { id:"pi-hev-1", subcategoryId:"sc-fuel-3", name:"Nagyfeszültségű akkumulátor (HV)", slug:"hv-akkumulator" },
    { id:"pi-hev-2", subcategoryId:"sc-fuel-3", name:"Akkumulátor cella / modul", slug:"akku-cella" },
    { id:"pi-hev-3", subcategoryId:"sc-fuel-3", name:"Töltő kábel / Type 2, CCS", slug:"tolto-kabel" },
    { id:"pi-hev-4", subcategoryId:"sc-fuel-3", name:"Töltő csatlakozó aljzat (Autón)", slug:"tolto-aljzat" },
    { id:"pi-hev-5", subcategoryId:"sc-fuel-3", name:"Fedélzeti töltő (OBC)", slug:"fedelzeti-tolto" },

    // --- NEW: KOMPLETT MOTOR ---
    { id:"pi-compeng-1", subcategoryId:"sc-engine-8", name:"Komplett motor (Minden kiegészítővel)", slug:"komplett-motor-kiegeszitokkel" },
    { id:"pi-compeng-2", subcategoryId:"sc-engine-8", name:"Komplett motor (Kiegészítők nélkül / Bontott)", slug:"komplett-motor-ures" },

    // --- NEW: EGYÉB SZERKEZETEK ÉS MECHANIKÁK ---
    { id:"pi-om-1", subcategoryId:"sc-locks-3", name:"Pedálsor / Fék-Kuplung pedál konzol", slug:"pedalsor" },
    { id:"pi-om-2", subcategoryId:"sc-locks-3", name:"Gázpedál (Mechanikus bowdenes)", slug:"gazpedal-mechanikus" },
    { id:"pi-om-3", subcategoryId:"sc-locks-3", name:"Kézifék bowden, mechanika", slug:"kezifek-mechanika" },
    { id:"pi-om-4", subcategoryId:"sc-locks-3", name:"Kormányzár (Mechanikus / Elektromos)", slug:"kormanyzar" },

    // --- NEW: BIZTOSÍTÉKTÁBLA ÉS RELÉDOBOZ ---
    { id:"pi-fuse-1", subcategoryId:"sc-wiring-4", name:"Fő biztosítéktábla (Utastéri)", slug:"utasteri-biztositektabla" },
    { id:"pi-fuse-2", subcategoryId:"sc-wiring-4", name:"Motortéri biztosítéktábla / Relédoboz", slug:"motorteri-reledoboz" },
    { id:"pi-fuse-3", subcategoryId:"sc-wiring-4", name:"Főrelé / Izzítórelé / Egyéb relé", slug:"relek" },

    // --- NEW: AKKUMULÁTOR (12V) ÉS TARTOZÉKAI ---
    { id:"pi-batt-1", subcategoryId:"sc-electric-5", name:"Indítóakkumulátor (12V)", slug:"inditoakkumulator" },
    { id:"pi-batt-2", subcategoryId:"sc-electric-5", name:"Akkumulátor tartó tálca", slug:"akku-talca" },
    { id:"pi-batt-3", subcategoryId:"sc-electric-5", name:"Akkumulátor kábel / Saru", slug:"akku-kabel-saru" }
];

