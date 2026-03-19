import { getShippingPrice } from "./pxp-rates";
import crypto from "crypto";

// Pannon XP API Credentials (TEST)
const PXP_CONFIG = {
    ugyfelkod: process.env.PXP_UGYFELKOD || "KSTA",
    technikai_felhasznalo: process.env.PXP_USER || "UgFxa0n4fxGnzfeU",
    jelszo: process.env.PXP_PASSWORD || "a8Q374fgx8nQgnf4",
    cserekulcs: process.env.PXP_CSEREKULCS || "XfoqXnfoq3fqyeWc",
};

function hashPassword(password: string): string {
    return crypto.createHash('sha512').update(password).digest('hex').toUpperCase();
}

function encryptData(data: any, key: string): string {
    const json = JSON.stringify(data);
    const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(key), null);
    // @ts-ignore - ECB doesn't use IV
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(json, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
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

    try {
        const shippingAddr = JSON.parse(order.shippingAddress);
        
        // Prepare the shipment data
        const shipmentData = [{
            tipus: 0, // 0 = Csomagfeladás
            cimzett: {
                nev: shippingAddr.name,
                telefon: shippingAddr.phone,
                emailcim: shippingAddr.email,
                ceg_nev: shippingAddr.name, // If individual, use name
                cim_telepules: shippingAddr.city,
                cim_iranyito: shippingAddr.postalCode,
                cim_kozterulet: shippingAddr.address,
                cim_megjegyzes: order.id
            },
            szolgaltatas: "24H",
            sms: true,
            csomagok: order.items.map((item: any) => ({
                db: item.quantity,
                suly: item.part.weight || 2,
                hosszusag: item.part.length || 30,
                szelesseg: item.part.width || 20,
                magassag: item.part.height || 10,
                tipus: (item.part.weight > 40 || item.part.length > 200) ? "raklap" : "doboz"
            })),
            utanvet: order.paymentMethod === 'COD' ? order.totalAmount : 0
        }];

        const encryptedRequest = encryptData(shipmentData, PXP_CONFIG.cserekulcs);

        const body = new URLSearchParams();
        body.append('ugyfelkod', PXP_CONFIG.ugyfelkod);
        body.append('technikai_felhasznalo', PXP_CONFIG.technikai_felhasznalo);
        body.append('jelszo', hashPassword(PXP_CONFIG.jelszo));
        body.append('keres', encryptedRequest);

        const response = await fetch(`${baseUrl}/mentes/`, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const result = await response.json();

        if (result.kapcsolat?.statusz === 'OK' && result.mentes?.["0"]?.kuldemenyszam) {
            return {
                success: true,
                trackingNumber: result.mentes["0"].kuldemenyszam,
                status: 'CREATED'
            };
        } else {
            console.error("PannonXP API Error:", result);
            const errorMsg = result.ervenytelen_adat?.["0"]?.uzenet || result.kapcsolat?.uzenet || "Ismeretlen API hiba";
            return {
                success: false,
                error: errorMsg,
                trackingNumber: `PXP-ERR-${Date.now()}`
            };
        }
    } catch (error) {
        console.error("PannonXP Integration Error:", error);
        return {
            success: false,
            error: "Hiba a PannonXP kommunikáció során",
            trackingNumber: `PXP-FAILED-${Date.now()}`
        };
    }
}
