import { brands, getModelsByBrand } from "@/lib/vehicle-data";

/**
 * Generates the structured product description with header and footer.
 */
export function generateProductDescription({
    brandId,
    modelId,
    partName,
    yearFrom,
    yearTo,
    manualDescription,
    autoRef
}: {
    brandId: string;
    modelId: string;
    partName: string;
    yearFrom?: string | number | null;
    yearTo?: string | number | null;
    manualDescription: string;
    autoRef: string;
}) {
    const brandName = brands.find(b => b.id === brandId)?.name || "";
    const modelName = getModelsByBrand(brandId).find(m => m.id === modelId)?.name || "";
    const years = yearFrom || yearTo ? `(${yearFrom || '?'}-${yearTo || '?'})` : "";

    const finalDescriptionParts = [];
    
    if (brandName && modelName && partName) {
        finalDescriptionParts.push(`Eladó gyári ${brandName} ${modelName} ${partName} ${years}.`);
    }
    
    if (manualDescription?.trim()) {
        finalDescriptionParts.push(manualDescription.trim());
    }
    
    finalDescriptionParts.push(`A hivatkozási számra hivatkozzon, hogyha bármi kérdése van a termékkel kapcsolatban!\nHivatkozási szám: (${autoRef})`);

    return finalDescriptionParts.join('\n\n');
}

/**
 * Parses raw form data into a structured product object.
 */
export function parseProductFormData(formData: FormData) {
    const getNum = (key: string) => {
        const val = formData.get(key);
        if (!val || val === '') return null;
        const num = parseFloat(val as string);
        return isNaN(num) ? null : num;
    };

    const getInt = (key: string) => {
        const val = formData.get(key);
        if (!val || val === '') return 0;
        const num = parseInt(val as string);
        return isNaN(num) ? 0 : num;
    };

    return {
        name: formData.get('name') as string,
        sku: formData.get('sku') as string,
        productCode: formData.get('productCode') as string,
        priceGross: getInt('priceGross'),
        priceNet: Math.round(getInt('priceGross') / 1.27),
        description: formData.get('description') as string,
        oemNumbers: formData.get('oemNumbers') as string || "",
        engineCode: formData.get('engineCode') as string || "",
        condition: formData.get('condition') as string || "USED",
        stock: getInt('stock') || 1,
        brandId: formData.get('brandId') as string,
        modelId: formData.get('modelId') as string,
        categoryId: formData.get('categoryId') as string,
        subcategoryId: formData.get('subcategoryId') as string,
        partItemId: formData.get('partItemId') as string,
        yearFrom: getNum('yearFrom'),
        yearTo: getNum('yearTo'),
        isUniversal: formData.get('isUniversal') === 'true',
        compatibilitiesData: formData.get('compatibilitiesData') as string,
        weight: getNum('weight'),
        height: getNum('height'),
        width: getNum('width'),
        length: getNum('length'),
        packageType: formData.get('packageType') as string || "doboz",
        shippingPrice: getInt('shippingPrice'), // Sync with form field name
        existingImages: formData.get('existingImages') as string || "",
    };
}
