import { getShippingPrice } from "./pxp-rates";

export function calculateShippingPriceForItems(items: any[]) {

    let hasManualShippingPrice = false;
    let manualTotalShipping = 0;
    
    // First, check if any items have a manual shipping price
    items.forEach(item => {
        if (item.shippingPrice !== undefined && item.shippingPrice !== null && item.shippingPrice > 0) {
            hasManualShippingPrice = true;
            manualTotalShipping += item.shippingPrice * (item.quantityInCart || 1);
        }
    });

    if (hasManualShippingPrice) {
        return manualTotalShipping;
    }

    // Fallback to weight-based calculation if no manual prices are set
    let totalWeight = 0;
    let maxSingleItemPrice = 0;
    let hasSpecialCategory = false;

    items.forEach(item => {
        const weight = item.weight || 2; // Default 2kg
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


// Basic Pannon XP client
export async function createPxpShipment(order: any) {
    const isTest = process.env.PXP_MODE !== 'production';
    const baseUrl = isTest ? 'https://testapi.pannonxp.hu/v3' : 'https://api.pannonxp.hu/v3';

    console.log(`Pannon XP shipment creation (${isTest ? 'test' : 'production'}):`, order.id);
    
    // In a real implementation, we would:
    // 1. Sign the request (AES/SHA)
    // 2. POST to baseUrl/csomag-feladas
    // 3. Extract tracking number
    
    // Mocking the result for now until API keys are provided
    return { 
        success: true, 
        trackingNumber: `PXP-${isTest ? 'TEST-' : ''}${Math.random().toString(36).substring(7).toUpperCase()}`,
        labelUrl: '#' // This would be the PDF label URL
    };
}
