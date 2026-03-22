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

function encryptData(data: any, key: string): string {
    const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(key.padEnd(16, '\0').slice(0, 16)), null);
    const buf1 = cipher.update(JSON.stringify(data), 'utf8');
    const buf2 = cipher.final();
    return Buffer.concat([buf1, buf2]).toString('base64');
}

export function calculateShippingPriceForItems(items: any[]) {
    let hasManualShippingPrice = false;
    let manualTotalShipping = 0;
    
    items.forEach(item => {
        if (item.shippingPrice !== undefined && item.shippingPrice !== null && item.shippingPrice > 0) {
            hasManualShippingPrice = true;
            manualTotalShipping += item.shippingPrice * (item.quantityInCart || 1);
        }
    });

    if (hasManualShippingPrice) {
        return manualTotalShipping;
    }

    let totalWeight = 0;
    let maxSingleItemPrice = 0;
    let hasSpecialCategory = false;

    items.forEach(item => {
        const weight = item.weight || 2; 
        const l = item.length || 30;
        const w = item.width || 20;
        const h = item.height || 10;
        const subcategorySlug = item.subcategorySlug;

        const price = getShippingPrice(weight, l, w, h, subcategorySlug);
        
        if (subcategorySlug && ['csomagterajto', 'lokharito', 'komplett-motor', 'motorhazteto', 'ajto', 'valto'].includes(subcategorySlug)) {
            hasSpecialCategory = true;
            maxSingleItemPrice = Math.max(maxSingleItemPrice, price);
        }

        totalWeight += weight;
    });

    if (hasSpecialCategory) {
        return maxSingleItemPrice;
    }

    return getShippingPrice(totalWeight);
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

        const isCOD = order.paymentMethod === 'COD';
        const utanvetAmount = isCOD ? Number(Math.round(order.totalAmount)) : 0;
        
        // Prepare the shipment data - Using object with string keys for "numeric" indexes
        // as PHP's json_encode often produces this for associative arrays, 
        // and PXP's documentation shows this format in responses.
        const shipmentRequest: any = {
            "0": {
                tipus: 0, // 0 = Csomagfeladás
                cimzett: {
                    nev: shippingAddr.name.slice(0, 30),
                    telefon: formatPxpPhone(shippingAddr.phone).slice(0, 20),
                    emailcim: shippingAddr.email.slice(0, 50),
                    ceg_nev: (shippingAddr.companyName || shippingAddr.name).slice(0, 50),
                    cim_telepules: shippingAddr.city.slice(0, 40),
                    cim_iranyito: shippingAddr.postalCode.toString().replace(/\D/g, '').padStart(4, '0').slice(0, 4),
                    cim_kozterulet: shippingAddr.address.slice(0, 60),
                    cim_megjegyzes: `Order #${order.id.slice(-6)}`.slice(0, 100)
                },
                szolgaltatas: "24H",
                csomagok: order.items.reduce((acc: any, item: any, idx: number) => {
                    acc[idx.toString()] = {
                        db: Number(Math.min(item.quantity, 99)),
                        suly: Number((item.part.weight || 2).toFixed(2)), // API allows max 2 decimals
                        hosszusag: Number(Math.round(item.part.length || 30)),
                        szelesseg: Number(Math.round(item.part.width || 20)),
                        magassag: Number(Math.round(item.part.height || 10)),
                        tipus: (item.part.weight > 40 || item.part.length > 200) ? "raklap" : "doboz"
                    };
                    return acc;
                }, {}),
                ...(utanvetAmount > 0 ? { utanvet: utanvetAmount } : {})
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
            try { require('fs').writeFileSync('/tmp/pxp-request.json', JSON.stringify(shipmentRequest, null, 2)); } catch(e){}
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
            const errorMsg = result.kapcsolat?.uzenet || result.ervenytelen_adat?.["0"]?.uzenet || "Ismeretlen API hiba";
            return {
                success: false,
                error: errorMsg,
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
export async function getShipmentStatus(trackingNumber: string) {
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
            body: body,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const result = await response.json();

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
            body: body,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
