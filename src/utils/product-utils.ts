/**
 * Parses raw form data into a structured product object.
 */
export function parseProductFormData(formData: FormData) {
    const getNum = (key: string) => {
        const val = formData.get(key);
        if (!val || val === '') return null;
        // Normalize: replace comma with dot and remove anything that's not a digit or dot
        const normalized = (val as string).replace(',', '.').replace(/[^-0-9.]/g, '');
        const num = parseFloat(normalized);
        return isNaN(num) ? null : num;
    };

    const getInt = (key: string) => {
        const val = formData.get(key);
        if (!val || val === '') return 0;
        // Strip non-numeric except minus sign
        const normalized = (val as string).replace(/[^-0-9]/g, '');
        const num = parseInt(normalized);
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
        bodyType: formData.get('bodyType') as string || "",
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
