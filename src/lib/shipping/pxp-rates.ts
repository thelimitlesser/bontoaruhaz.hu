export const PXP_WEIGHT_RATES = [
    { max: 2.99, price: 2018 },
    { max: 4.99, price: 2232 },
    { max: 9.99, price: 2975 },
    { max: 14.99, price: 3187 },
    { max: 19.99, price: 3506 },
    { max: 29.99, price: 3826 },
    { max: 39.99, price: 4250 },
    { max: 49.99, price: 5845 },
    { max: 59.99, price: 7437 },
    { max: 69.99, price: 7969 },
    { max: 79.99, price: 9031 },
    { max: 89.99, price: 11155 },
    { max: 99.99, price: 12750 },
    { max: 149.99, price: 15936 },
    { max: 499.99, price: 21248 },
];

export const PXP_SPECIAL_RATES: Record<string, number> = {
    'csomagterajto': 7437,
    'lokharito': 6373,
    'komplett-motor': 21247,
    'motorhazteto': 6373,
    'ajto': 6373,
    'valto': 6905,
};

export function calculateVolumetricWeight(l: number, w: number, h: number): number {
    // (L * W * H) / 6000
    return (l * w * h) / 6000;
}

export function getShippingPrice(
    weight: number, 
    l?: number, 
    w?: number, 
    h?: number, 
    subcategorySlug?: string,
    isBudapest: boolean = false
): number {
    // 1. Check special category first
    if (subcategorySlug && PXP_SPECIAL_RATES[subcategorySlug]) {
        return PXP_SPECIAL_RATES[subcategorySlug];
    }

    // 2. Calculate volumetric weight if dimensions are provided
    let effectiveWeight = weight;
    if (l && w && h) {
        const volWeight = calculateVolumetricWeight(l, w, h);
        effectiveWeight = Math.max(weight, volWeight);
    }

    // 3. Find price in weight table
    const rate = PXP_WEIGHT_RATES.find(r => effectiveWeight <= r.max);
    
    if (rate) return rate.price;
    
    // 4. Heavy item logic (>500kg)
    if (effectiveWeight >= 500) {
        const basePrice = 21248;
        const extraWeight = Math.ceil(effectiveWeight - 500);
        // Bp-Bp: 49 Ft/kg, Vidék: 102 Ft/kg
        const perKgRate = isBudapest ? 49 : 102;
        return basePrice + (extraWeight * perKgRate);
    }

    return 21248;
}
