import { getShippingPrice } from "./pxp-rates";
import crypto from "crypto";

// Pannon XP API Credentials (TEST)
const PXP_CONFIG = {
    ugyfelkod: process.env.PXP_UGYFELKOD || "KSTA",
    technikai_felhasznalo: process.env.PXP_USER || "UgFxaOn4fxGnzfeU",
    jelszo: process.env.PXP_PASSWORD || "a8Q374fgx8nQgnf4",
    cserekulcs: process.env.PXP_CSEREKULCS || "XfoqXnfoq3fqyeWc",
};

function hashPassword(password: string): string {
    return crypto.createHash('sha512').update(password).digest('hex').toUpperCase();
}

export function extractPxpError(result: any): string {
    if (result.kapcsolat?.uzenet) return result.kapcsolat.uzenet;
    if (result.ervenytelen_adat) {
        const invalidData = Array.isArray(result.ervenytelen_adat) ? result.ervenytelen_adat[0] : (result.ervenytelen_adat?.["0"] || result.ervenytelen_adat);
        if (invalidData) {
            for (const key of Object.keys(invalidData)) {
                if (invalidData[key]?.uzenet) return invalidData[key].uzenet;
            }
            if (invalidData.uzenet) return invalidData.uzenet;
        }
    }
    return "Ismeretlen API hiba";
}

function encryptData(data: any, key: string): string {
    const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(key.padEnd(16, '\0').slice(0, 16)), null);
    const buf1 = cipher.update(JSON.stringify(data), 'utf8');
    const buf2 = cipher.final();
    return Buffer.concat([buf1, buf2]).toString('base64');
}

// Real Pannon XP API v3 Shipment Creation
export async function createPxpShipment(order: any) {
    const isTest = process.env.PXP_MODE !== 'production';
    const baseUrl = isTest ? 'https://mypxp-test.pannonxp.hu/api/v3' : 'https://mypxp.pannonxp.hu/api/v3';

    // Safely get and trim config
    const ugyfelkod = (process.env.PXP_UGYFELKOD || PXP_CONFIG.ugyfelkod).trim();
    const techUser = (process.env.PXP_USER || PXP_CONFIG.technikai_felhasznalo).trim();
    const password = (process.env.PXP_PASSWORD || PXP_CONFIG.jelszo).trim();
    const cserekulcs = (process.env.PXP_CSEREKULCS || PXP_CONFIG.cserekulcs).trim();

    try {
        const shippingAddr = JSON.parse(order.shippingAddress);
        
        // Helper to format phone number: must start with +36 and contain only numbers and spaces
        const formatPxpPhone = (phone: string) => {
            const digits = phone.replace(/\D/g, '');
            if (digits.startsWith('36')) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
            if (digits.startsWith('06')) return `+36 ${digits.slice(2)}`;
            return `+36 ${digits}`; // Fallback
        };

        // Helper to strip forbidden characters: ' " \ < > ? $ ;
        const cleanPxpText = (text: string | undefined | null) => {
            if (!text) return "";
            return text.replace(/['"\\<>?$;]/g, "").trim();
        };

        const cleanName = cleanPxpText(shippingAddr.name);
        // PXP requires ceg_nev for individuals too, and it must be min 4 chars
        const rawCompany = cleanPxpText(shippingAddr.companyName);
        const finalCompanyName = (rawCompany.length >= 4 ? rawCompany : cleanName).slice(0, 50);

        const isCOD = order.paymentMethod === 'COD';
        const utanvetAmount = isCOD ? Number(Math.round(order.totalAmount)) : 0;
        
        // Address validation
        const hasHouseNumber = /\d/.test(shippingAddr.address);
        const isValidPostalCode = /^\d{4}$/.test(shippingAddr.postalCode.toString().replace(/\D/g, ''));
        
        if (!hasHouseNumber || !isValidPostalCode) {
            return {
                success: false,
                error: !isValidPostalCode ? "Hiba: Az irányítószám 4 számjegy kell legyen!" : "Hiba: A címből hiányzik a házszám!",
                trackingNumber: `PXP-VAL-ERR-${Date.now()}`
            };
        }

        // Extract product details for the label and manifest
        const productSummaries = order.items.map((i: any) => `${i.part.sku ? `[${i.part.sku}] ` : ''}${i.part.name || 'Alkatrész'}`);
        const fullSummary = order.items.length > 1 
            ? `${order.items.length} db autóalkatrész` 
            : productSummaries.join(' + ');
            
        const packageTypeLabel = (order.items[0]?.part as any).packageType || 'doboz';
        const formattedType = packageTypeLabel.toUpperCase().replace('_', ' ');
        
        // PXP has strict character limits: Tartalom (~40), Megjegyzés (~100)
        // Forbidden chars: ' " \ < > ? $ ;
        const tartalomText = fullSummary.replace(/['"\\<>?$;\[\]\+]/g, '').slice(0, 39);
        const megjegyzesText = ("#" + order.id.slice(0, 8).toUpperCase() + " | " + fullSummary).replace(/['"\\<>?$;\[\]\+]/g, '').slice(0, 99);
        const refText = ("#" + order.id.slice(0, 8).toUpperCase() + " | " + fullSummary).replace(/['"\\<>?$;\[\]\+]/g, '').slice(0, 29); // Max 30 chars for ref

        // Prepare the shipment data
        const shipmentRequest: any = {
            "0": {
                tipus: 0, // 0 = Csomagfeladás
                cimzett: {
                    nev: cleanName.slice(0, 30),
                    telefon: formatPxpPhone(shippingAddr.phone).slice(0, 20),
                    emailcim: cleanPxpText(shippingAddr.email).slice(0, 50),
                    ceg_nev: finalCompanyName,
                    cim_telepules: cleanPxpText(shippingAddr.city).slice(0, 40),
                    cim_iranyito: shippingAddr.postalCode.toString().replace(/\D/g, '').padStart(4, '0').slice(0, 4),
                    cim_kozterulet: cleanPxpText(shippingAddr.address).slice(0, 60),
                    cim_megjegyzes: megjegyzesText
                },
                szolgaltatas: "24H",
                sms: true,
                csomagok: order.items.reduce((acc: any, item: any, idx: number) => {
                    const dims = [
                        item.part?.length || 30,
                        item.part?.width || 20,
                        item.part?.height || 10
                    ]; // Raw order (Length, Width, Height)
                    
                    const internalPackageType = (item.part as any)?.packageType || 'doboz';
                    
                    // Specific mapping for KSTA account as per PXP email
                    let pxpType = 'doboz';
                    
                    if (internalPackageType === 'lokharito') {
                        pxpType = 'lokharito_szemelyauto';
                    } else if (internalPackageType === 'lokharito_teher') {
                        pxpType = 'lokharito_teherauto';
                    } else if (['csomagterajto', 'motor', 'motorhazteto', 'oldalajto', 'valto'].includes(internalPackageType)) {
                        pxpType = internalPackageType; // Matches exactly
                    }

                    const shipmentPackage: any = {
                        db: (item as any).quantityInCart || item.quantity || 1,
                        suly: Math.max(0.1, item.part?.weight || 0.1),
                        hosszusag: Math.min(420, Math.max(1, Math.round(dims[0]))),
                        szelesseg: Math.min(150, Math.max(1, Math.round(dims[1]))),
                        magassag: Math.min(160, Math.max(1, Math.round(dims[2]))),
                        tipus: pxpType
                    };
                    acc[idx.toString()] = shipmentPackage;
                    return acc;
                }, {}),
                tartalom: tartalomText,
                referenciaszam: refText,
                utanvet: utanvetAmount
            }
        };

        const encryptedRequest = encryptData(shipmentRequest, cserekulcs);

        const body = new URLSearchParams();
        body.append('ugyfelkod', ugyfelkod);
        body.append('technikai_felhasznalo', techUser);
        body.append('jelszo', hashPassword(password));
        body.append('keres', encryptedRequest);

        if (isTest) {
            console.log("PXP REQUEST DATA (unescaped):", JSON.stringify(shipmentRequest, null, 2));
            try { 
                if (typeof window === 'undefined') {
                    require('fs').writeFileSync('/tmp/pxp-request.json', JSON.stringify(shipmentRequest, null, 2)); 
                }
            } catch(e){}
        }

        const response = await fetch(`${baseUrl}/mentes/`, { 
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const result = await response.json();
        
        if (isTest) {
            console.log("PXP API FULL RESPONSE:", JSON.stringify(result, null, 2));
        }

        if (result.kapcsolat?.statusz === 'OK' && result.mentes?.["0"]?.kuldemenyszam) {
            return {
                success: true,
                trackingNumber: result.mentes["0"].kuldemenyszam,
                status: 'CREATED'
            };
        } else {
            console.error("PannonXP API Error Detail:", JSON.stringify(result, null, 2));
            return {
                success: false,
                error: extractPxpError(result),
                trackingNumber: `PXP-ERR-${Date.now()}`
            };
        }
    } catch (error: any) {
        console.error("PannonXP Integration Error:", error);
        return {
            success: false,
            error: error.message || "Hiba a PannonXP kommunikáció során",
            trackingNumber: `PXP-FAILED-${Date.now()}`
        };
    }
}

// Query Pannon XP Shipment Status
export async function trackShipment(trackingNumber: string) {
    const isTest = process.env.PXP_MODE !== 'production';
    const baseUrl = isTest ? 'https://mypxp-test.pannonxp.hu/api/v3' : 'https://mypxp.pannonxp.hu/api/v3';

    const ugyfelkod = (process.env.PXP_UGYFELKOD || PXP_CONFIG.ugyfelkod).trim();
    const techUser = (process.env.PXP_USER || PXP_CONFIG.technikai_felhasznalo).trim();
    const password = (process.env.PXP_PASSWORD || PXP_CONFIG.jelszo).trim();
    const cserekulcs = (process.env.PXP_CSEREKULCS || PXP_CONFIG.cserekulcs).trim();

    try {
        const queryRequest: any = {
            "0": {
                kuldemenyszam: trackingNumber
            }
        };

        const encryptedRequest = encryptData(queryRequest, cserekulcs);

        const body = new URLSearchParams();
        body.append('ugyfelkod', ugyfelkod);
        body.append('technikai_felhasznalo', techUser);
        body.append('jelszo', hashPassword(password));
        body.append('keres', encryptedRequest);

        const response = await fetch(`${baseUrl}/lekerdezes/`, { 
            method: 'POST',
            body: body.toString(),
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'BontoaruhazXP/1.0',
                'Accept': 'application/json'
            }
        });

        const result = await response.json();
        
        if (isTest) {
            console.log("PXP STATUS RESPONSE for", trackingNumber, ":", JSON.stringify(result, null, 2));
        }

        if (result.kapcsolat?.statusz === 'OK' && result.lekerdezes?.["0"]) {
            const data = result.lekerdezes["0"];
            // PXP Status codes (typical): 
            // - 1: Felvéve
            // - 4: Kiszállítás alatt
            // - 5: Kézbesítve
            // - 6: Sikertelen kézbesítés
            return {
                success: true,
                statusId: data.statusz,
                statusText: data.statusz_szöveges,
                isDelivered: data.statusz === 5,
                isPaid: (data.statusz === 5 && data.utanvet_beszedve === 1) || data.statusz === 5, // Custom logic: if delivered, usually paid soon
                deliveredAt: data.kezbesites_idopontja,
                raw: data
            };
        }
        
        return { success: false, error: result.kapcsolat?.uzenet || "Sikertelen lekérdezés" };
    } catch (error: any) {
        console.error("PXP Tracking Error:", error);
        return { success: false, error: error.message };
    }
}

// Download/Print Pannon XP Shipping Label
export async function getPxpLabelPdf(trackingNumber: string) {
    const isTest = process.env.PXP_MODE !== 'production';
    const baseUrl = isTest ? 'https://mypxp-test.pannonxp.hu/api/v3' : 'https://mypxp.pannonxp.hu/api/v3';

    const ugyfelkod = (process.env.PXP_UGYFELKOD || PXP_CONFIG.ugyfelkod).trim();
    const techUser = (process.env.PXP_USER || PXP_CONFIG.technikai_felhasznalo).trim();
    const password = (process.env.PXP_PASSWORD || PXP_CONFIG.jelszo).trim();
    const cserekulcs = (process.env.PXP_CSEREKULCS || PXP_CONFIG.cserekulcs).trim();

    try {
        const printRequest: any = {
            cimketipus: "1c101,6x152,4", // Default label size
            cimkek: {
                "0": {
                    nyomtatas: trackingNumber
                }
            }
        };

        const encryptedRequest = encryptData(printRequest, cserekulcs);

        const body = new URLSearchParams();
        body.append('ugyfelkod', ugyfelkod);
        body.append('technikai_felhasznalo', techUser);
        body.append('jelszo', hashPassword(password));
        body.append('keres', encryptedRequest);

        const response = await fetch(`${baseUrl}/nyomtatas/`, { 
            method: 'POST',
            body: body.toString(),
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'BontoaruhazXP/1.0',
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (result.kapcsolat?.statusz === 'OK' && result.pdf) {
            return {
                success: true,
                pdfBase64: result.pdf,
                trackingNumber
            };
        }
        
        return { success: false, error: result.kapcsolat?.uzenet || result.ervenytelen_adat?.["0"]?.uzenet || "Sikertelen címke letöltés" };
    } catch (error: any) {
        console.error("PXP Label Print Error:", error);
        return { success: false, error: error.message };
    }
}

// Bulk Print Shipping Labels
export async function getBulkPxpLabels(trackingNumbers: string[]) {
    const isTest = process.env.PXP_MODE !== 'production';
    const baseUrl = isTest ? 'https://mypxp-test.pannonxp.hu/api/v3' : 'https://mypxp.pannonxp.hu/api/v3';

    const ugyfelkod = (process.env.PXP_UGYFELKOD || PXP_CONFIG.ugyfelkod).trim();
    const techUser = (process.env.PXP_USER || PXP_CONFIG.technikai_felhasznalo).trim();
    const password = (process.env.PXP_PASSWORD || PXP_CONFIG.jelszo).trim();
    const cserekulcs = (process.env.PXP_CSEREKULCS || PXP_CONFIG.cserekulcs).trim();

    try {
        const printRequest: any = {
            cimketipus: "1c101,6x152,4",
            cimkek: {}
        };
        
        trackingNumbers.forEach((tn, index) => {
            printRequest.cimkek[index.toString()] = {
                nyomtatas: tn
            };
        });

        const encryptedRequest = encryptData(printRequest, cserekulcs);

        const body = new URLSearchParams();
        body.append('ugyfelkod', ugyfelkod);
        body.append('technikai_felhasznalo', techUser);
        body.append('jelszo', hashPassword(password));
        body.append('keres', encryptedRequest);

        const response = await fetch(`${baseUrl}/nyomtatas/`, { 
            method: 'POST',
            body: body.toString(),
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'BontoaruhazXP/1.0',
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (result.kapcsolat?.statusz === 'OK' && result.pdf) {
            return {
                success: true,
                pdfBase64: result.pdf
            };
        }
        
        return { success: false, error: result.kapcsolat?.uzenet || "Sikertelen tömeges címke letöltés" };
    } catch (error: any) {
        console.error("PXP Bulk Label Print Error:", error);
        return { success: false, error: error.message };
    }
}

// Perform Daily Manifest (Napi Zárás)
export async function performPxpManifest(trackingNumbers?: string[]) {
    const isTest = process.env.PXP_MODE !== 'production';
    const baseUrl = isTest ? 'https://mypxp-test.pannonxp.hu/api/v3' : 'https://mypxp.pannonxp.hu/api/v3';

    const ugyfelkod = (process.env.PXP_UGYFELKOD || PXP_CONFIG.ugyfelkod).trim();
    const techUser = (process.env.PXP_USER || PXP_CONFIG.technikai_felhasznalo).trim();
    const password = (process.env.PXP_PASSWORD || PXP_CONFIG.jelszo).trim();
    const cserekulcs = (process.env.PXP_CSEREKULCS || PXP_CONFIG.cserekulcs).trim();

    try {
        if (!trackingNumbers || trackingNumbers.length === 0) {
            return { success: false, error: "Nincs lezárható követési szám megadva." };
        }

        let manifestRequest: any = {
            ugyfelkod: ugyfelkod,
            napizaras: {}
        };

        trackingNumbers.forEach((tn, index) => {
            manifestRequest.napizaras[index.toString()] = {
                kuldemenyszam: tn,
                ugyfelkod: ugyfelkod
            };
        });

        console.log(`Sending PXP Manifest Request for ${trackingNumbers.length} items...`);

        const encryptedRequest = encryptData(manifestRequest, cserekulcs);

        const body = new URLSearchParams();
        body.append('ugyfelkod', ugyfelkod);
        body.append('technikai_felhasznalo', techUser);
        body.append('jelszo', hashPassword(password));
        body.append('keres', encryptedRequest);

        const response = await fetch(`${baseUrl}/napizaras/`, { 
            method: 'POST',
            body: body.toString(),
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'BontoaruhazXP/1.0',
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (result.kapcsolat?.statusz === 'OK' && result.pdf) {
            return {
                success: true,
                pdfBase64: result.pdf,
                manifestedIds: result.napizaras ? Object.values(result.napizaras).map((n: any) => n.kuldemenyszam) : []
            };
        }

        return { 
            success: false, 
            error: result.kapcsolat?.uzenet || result.ervenytelen_adat?.uzenet || "Sikertelen napi zárás" 
        };
    } catch (error: any) {
        console.error("PXP Manifest Error:", error);
        return { success: false, error: error.message };
    }
}

// Cancel (Delete) Pannon XP Shipment
export async function cancelPxpShipment(trackingNumber: string) {
    const isTest = process.env.PXP_MODE !== 'production';
    const baseUrl = isTest ? 'https://mypxp-test.pannonxp.hu/api/v3' : 'https://mypxp.pannonxp.hu/api/v3';

    const ugyfelkod = (process.env.PXP_UGYFELKOD || PXP_CONFIG.ugyfelkod).trim();
    const techUser = (process.env.PXP_USER || PXP_CONFIG.technikai_felhasznalo).trim();
    const password = (process.env.PXP_PASSWORD || PXP_CONFIG.jelszo).trim();
    const cserekulcs = (process.env.PXP_CSEREKULCS || PXP_CONFIG.cserekulcs).trim();

    try {
        const deleteRequest: any = {
            torles: {
                "0": {
                    kuldemenyszam: trackingNumber
                }
            }
        };

        const encryptedRequest = encryptData(deleteRequest, cserekulcs);

        const body = new URLSearchParams();
        body.append('ugyfelkod', ugyfelkod);
        body.append('technikai_felhasznalo', techUser);
        body.append('jelszo', hashPassword(password));
        body.append('keres', encryptedRequest);

        const response = await fetch(`${baseUrl}/torles/`, { 
            method: 'POST',
            body: body.toString(),
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'BontoaruhazXP/1.0',
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (result.kapcsolat?.statusz === 'OK' && result.torles) {
            return {
                success: true,
                trackingNumber
            };
        }
        
        return { success: false, error: result.kapcsolat?.uzenet || result.ervenytelen_adat?.["0"]?.uzenet || "Sikertelen törlés" };
    } catch (error: any) {
        console.error("PXP Cancel Error:", error);
        return { success: false, error: error.message };
    }
}
