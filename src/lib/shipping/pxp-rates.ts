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
    'lokharito_teher': 7969,
    'motor': 21247,
    'komplett-motor': 21247,
    'motorhazteto': 6373,
    'oldalajto': 6373,
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
    isBudapest: boolean = false,
    packageType?: string
): number {
    // 1. Check special package type first
    if (packageType && PXP_SPECIAL_RATES[packageType]) {
        return PXP_SPECIAL_RATES[packageType];
    }

    // 2. Check special category as fallback
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

export interface ShippingCalculationResult {
    finalCost: number;
    originalTotal: number;
    savings: number;
    totalQuantity: number;
}

export function calculateShippingPriceForItems(items: any[]): ShippingCalculationResult {
    if (!items || items.length === 0) {
        return { finalCost: 0, originalTotal: 0, savings: 0, totalQuantity: 0 };
    }

    const itemIndividualPrices: number[] = [];
    let totalQuantity = 0;
    let originalTotal = 0;

    items.forEach(item => {
        const qty = Number(item.quantityInCart || 1);
        totalQuantity += qty;

        let unitPrice = 0;
        // 1. Determine the unit shipping price for this item
        if (item.shippingPrice !== undefined && item.shippingPrice !== null && item.shippingPrice > 0) {
            unitPrice = item.shippingPrice;
        } else {
            const weight = item.weight || 2; 
            const l = item.length || 30;
            const w = item.width || 20;
            const h = item.height || 10;
            const subcategorySlug = item.subcategorySlug;
            unitPrice = getShippingPrice(weight, l, w, h, subcategorySlug);
        }
        
        // Add to original total (what it would cost without consolidation)
        originalTotal += unitPrice * qty;

        // Keep track of all individual unit prices to find the absolute maximum
        for (let i = 0; i < qty; i++) {
            itemIndividualPrices.push(unitPrice);
        }
    });

    if (itemIndividualPrices.length === 0) {
        return { finalCost: 0, originalTotal: 0, savings: 0, totalQuantity: 0 };
    }

    // 2. Find the highest single unit price among all items in the cart
    const maxBasePrice = Math.max(...itemIndividualPrices);
    
    // 3. Consolidated calculation: Base Price + 1000 Ft for every additional unit
    const additionalUnitsCount = totalQuantity - 1;
    const finalCost = maxBasePrice + (additionalUnitsCount * 1000);

    // 4. Calculate savings
    const savings = originalTotal - finalCost;

    return {
        finalCost,
        originalTotal,
        savings: Math.max(0, savings), // Savings shouldn't be negative
        totalQuantity
    };
}
