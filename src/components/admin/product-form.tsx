"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createProduct, updateProduct, getNextReferenceNumber, checkDuplicateSku } from "@/app/actions/product";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

// Sub-components
import { BasicInfoSection } from "./product-form/basic-info-section";
import { VehicleCompatibilitySection } from "./product-form/vehicle-compatibility-section";
import { ImageUploadSection } from "./product-form/image-upload-section";
import { DescriptionSection } from "./product-form/description-section";
import { PricingSection } from "./product-form/pricing-section";

interface ProductFormProps {
    initialData?: any;
    onSuccess?: () => void;
    className?: string;
    // Dynamic data from DB
    brands: any[];
    models: any[];
    categories: any[];
    subcategories: any[];
    partItems: any[];
}

export function ProductForm({ 
    initialData, onSuccess, className,
    brands, models, categories, subcategories, partItems
}: ProductFormProps) {
    // Refs for spellcheck/focus
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // --- State ---
    const [isPending, startTransition] = useTransition();
    const [selectedBrand, setSelectedBrand] = useState(initialData?.brandId || "");
    const [selectedModel, setSelectedModel] = useState(initialData?.modelId || "");
    const [isUniversal, setIsUniversal] = useState(initialData?.isUniversal || false);
    const [compatibilities, setCompatibilities] = useState<any[]>(initialData?.compatibilities || []);
    const [selectedPartItem, setSelectedPartItem] = useState(initialData?.partItemId || "");
    const [images, setImages] = useState<{ file?: File; preview: string; isExisting?: boolean }[]>(
        initialData?.images ? initialData.images.split(',').filter(Boolean).map((url: string) => ({ preview: url, isExisting: true })) : []
    );
    const [isCompressing, setIsCompressing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoRef, setAutoRef] = useState(initialData?.productCode || "");
    const [productName, setProductName] = useState(initialData?.name || "");
    const [sku, setSku] = useState(initialData?.sku || "");
    const [duplicateWarnings, setDuplicateWarnings] = useState<any[]>([]);
    const [isCheckingSku, setIsCheckingSku] = useState(false);
    const [yearFrom, setYearFrom] = useState(initialData?.yearFrom?.toString() || "");
    const [yearTo, setYearTo] = useState(initialData?.yearTo?.toString() || "");
    const [condition, setCondition] = useState(initialData?.condition || "used");
    const [engineCode, setEngineCode] = useState(initialData?.engineCode || "");
    
    // Pricing & Dimensions states (to fix data loss and naming mismatch)
    const [priceGross, setPriceGross] = useState(initialData?.priceGross?.toString() || "");
    const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
    const [length, setLength] = useState(initialData?.length?.toString() || ""); // Sync with DB
    const [width, setWidth] = useState(initialData?.width?.toString() || "");
    const [height, setHeight] = useState(initialData?.height?.toString() || "");
    const [packageType, setPackageType] = useState(initialData?.packageType || "doboz");
    const [shippingPrice, setShippingPrice] = useState(initialData?.shippingPrice?.toString() || ""); // Sync with DB
    const [stock, setStock] = useState(initialData?.stock?.toString() || "1");

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const [manualDescription, setManualDescription] = useState(() => {
        if (!initialData?.description) return "";
        let content = initialData.description;
        
        // 1. Strip the auto-footer
        const footerPattern = "A hivatkozási számra hivatkozzon";
        const footerIndex = content.indexOf(footerPattern);
        if (footerIndex !== -1) {
            content = content.substring(0, footerIndex).trim();
        }

        // 2. Strip the auto-header (aggressive)
        // Auto-header pattern: "Eladó gyári [Márka] [Modell] [Alkatrész] ([Év])."
        // Also sometimes starts with legacy prefixes
        const patternsToStrip = ["Eladó gyári", "Eladó használt", "Gyári"];
        
        let foundHeader = false;
        for (const pattern of patternsToStrip) {
            if (content.trim().startsWith(pattern)) {
                // Find the first sentence end or double newline
                const firstDot = content.indexOf(".");
                const firstDoubleNL = content.indexOf("\n\n");
                
                let splitIndex = -1;
                if (firstDot !== -1 && (firstDoubleNL === -1 || firstDot < firstDoubleNL)) {
                    splitIndex = firstDot + 1;
                } else if (firstDoubleNL !== -1) {
                    splitIndex = firstDoubleNL;
                }

                if (splitIndex !== -1) {
                    content = content.substring(splitIndex).trim();
                    foundHeader = true;
                    break;
                }
            }
        }

        return content;
    });

    // --- Derived ---
    const selectedPartItemObj = partItems.find(p => p.id === selectedPartItem);
    const inferredSubcategory = subcategories.find(s => s.id === selectedPartItemObj?.subcategoryId);
    const inferredCategory = categories.find(c => c.id === inferredSubcategory?.categoryId);

    // --- Effects ---
    useEffect(() => {
        if (!initialData) getNextReferenceNumber().then(setAutoRef);
    }, [initialData]);

    // Real-time SKU duplicate check
    useEffect(() => {
        const checkSku = async () => {
            if (sku.trim().length >= 3) {
                setIsCheckingSku(true);
                const duplicates = await checkDuplicateSku(sku, initialData?.id);
                setDuplicateWarnings(duplicates);
                setIsCheckingSku(false);
            } else {
                setDuplicateWarnings([]);
                setIsCheckingSku(false);
            }
        };
        const timer = setTimeout(checkSku, 500);
        return () => clearTimeout(timer);
    }, [sku, initialData?.id]);

    // Intelligent Auto-Name Generation
    const [lastAutoName, setLastAutoName] = useState("");
    useEffect(() => {
        const brand = brands.find(b => b.id === selectedBrand)?.name;
        const model = models.filter(m => m.brandId === selectedBrand).find(m => m.id === selectedModel)?.name;
        const part = selectedPartItemObj?.name;
        
        if (brand && model && part) {
            const newAutoName = `${brand} ${model} ${part}`;
            // Only update if current name is empty OR matches exactly the previous auto-generated name
            if (!productName || productName === lastAutoName) {
                setProductName(newAutoName);
                setLastAutoName(newAutoName);
            }
        }
    }, [selectedBrand, selectedModel, selectedPartItem, condition, brands, models, selectedPartItemObj]);

    // Native Spellcheck Force
    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.setAttribute('spellcheck', 'true');
            descriptionRef.current.setAttribute('lang', 'hu');
        }
        if (nameRef.current) {
            nameRef.current.setAttribute('spellcheck', 'true');
            nameRef.current.setAttribute('lang', 'hu');
        }
    }, []);

    // --- Handlers ---
    const validateForm = () => {
        const errors: string[] = [];
        if (!selectedBrand && !isUniversal) errors.push("selectedBrand");
        if (!selectedModel && !isUniversal) errors.push("selectedModel");
        if (!selectedPartItem) errors.push("selectedPartItem");
        if (!sku) errors.push("sku");
        if (!autoRef) errors.push("autoRef");
        if (!productName) errors.push("productName");
        
        // Pricing & Stock
        if (!priceGross) errors.push("priceGross");
        if (!weight) errors.push("weight");
        if (!width) errors.push("width");
        if (!height) errors.push("height");
        if (!length) errors.push("length"); // Changed from depth
        if (!packageType) errors.push("packageType");
        if (!shippingPrice) errors.push("shippingPrice"); // Changed from shippingCost

        // Images
        if (images.length === 0) errors.push("images");

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSubmit = async (formData: FormData) => {
        if (!validateForm()) {
            alert("Kérjük töltse ki az összes kötelező (*) mezőt!");
            return;
        }
        
        setIsSubmitting(true);
        startTransition(async () => {
            try {
            // Build image metadata
            const existingImages = images.filter(img => img.isExisting).map(img => img.preview).join(',');
            formData.append('existingImages', existingImages);
            formData.delete('imageFiles');
            images.forEach(img => {
                if (!img.isExisting && img.file) formData.append('imageFiles', img.file);
            });

            // Reconstruct final description (same logic as before but clean)
            const finalDescriptionParts = [];
            
            const brand = brands.find(b => b.id === selectedBrand)?.name;
            const model = models.filter(m => m.brandId === selectedBrand).find(m => m.id === selectedModel)?.name;
            const part = selectedPartItemObj?.name;
            const years = yearFrom || yearTo ? `(${yearFrom || '?'}-${yearTo || '?'})` : "";
            
            if (brand && model && part) {
                finalDescriptionParts.push(`Eladó gyári ${brand} ${model} ${part} ${years}.`);
            }
            if (manualDescription.trim()) finalDescriptionParts.push(manualDescription.trim());
            finalDescriptionParts.push(`A hivatkozási számra hivatkozzon, hogyha bármi kérdése van a termékkel kapcsolatban!\nHivatkozási szám: (${autoRef})`);

            formData.set('description', finalDescriptionParts.join('\n\n'));
            formData.set('name', productName);
            formData.set('brandId', selectedBrand);
            formData.set('modelId', selectedModel);
            formData.set('partItemId', selectedPartItem);
            formData.set('yearFrom', yearFrom);
            formData.set('yearTo', yearTo);
            formData.set('categoryId', inferredCategory?.id || "");
            formData.set('subcategoryId', inferredSubcategory?.id || "");
            formData.set('isUniversal', isUniversal.toString());
            formData.set('compatibilitiesData', JSON.stringify(compatibilities));
            formData.set('productCode', autoRef);
            formData.set('sku', sku);
            formData.set('condition', condition);
            formData.set('engineCode', engineCode);
            
            if (width) formData.set('width', width);
            if (height) formData.set('height', height);
            if (length) formData.set('length', length); // Changed from depth
            if (packageType) formData.set('packageType', packageType);
            if (weight) formData.set('weight', weight);
            if (priceGross) formData.set('priceGross', priceGross);
            if (shippingPrice) formData.set('shippingPrice', shippingPrice);
            if (stock) formData.set('stock', stock);

            if (initialData?.id) {
                await updateProduct(initialData.id, formData);
            } else {
                await createProduct(formData);
            }
                if (onSuccess) onSuccess();
            } catch (error: any) {
                // Check for Next.js redirect "error"
                if (error.digest?.includes('NEXT_REDIRECT')) {
                    // Keep isSubmitting true and let the redirect happen
                    return;
                }
                console.error("Product submission error details:", error);
                alert("Hiba történt a mentés során: " + error.message);
                setIsSubmitting(false);
            }
        });
    };

    return (
        <form action={handleSubmit} className={`relative space-y-8 max-w-4xl pb-12 ${className || ""}`}>
            
            <LoadingOverlay isVisible={isSubmitting || isPending} />
            
            <ImageUploadSection 
                images={images} setImages={setImages}
                isCompressing={isCompressing} setIsCompressing={setIsCompressing}
                errors={validationErrors}
            />

            <VehicleCompatibilitySection 
                isUniversal={isUniversal} setIsUniversal={setIsUniversal}
                selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
                selectedModel={selectedModel} setSelectedModel={setSelectedModel}
                yearFrom={yearFrom} setYearFrom={setYearFrom}
                yearTo={yearTo} setYearTo={setYearTo}
                compatibilities={compatibilities} setCompatibilities={setCompatibilities}
                errors={validationErrors}
                brands={brands}
                models={models}
            />

            <BasicInfoSection 
                productName={productName} setProductName={setProductName} nameRef={nameRef}
                selectedPartItem={selectedPartItem} setSelectedPartItem={setSelectedPartItem}
                sku={sku} setSku={setSku} isCheckingSku={isCheckingSku}
                duplicateWarnings={duplicateWarnings} autoRef={autoRef} setAutoRef={setAutoRef}
                condition={condition} setCondition={setCondition}
                engineCode={engineCode} setEngineCode={setEngineCode}
                initialData={initialData}
                errors={validationErrors}
                partItems={partItems}
                categories={categories}
                subcategories={subcategories}
            />

            <DescriptionSection 
                selectedBrand={selectedBrand} selectedModel={selectedModel}
                selectedPartItemObj={selectedPartItemObj} yearFrom={yearFrom} yearTo={yearTo}
                autoRef={autoRef} manualDescription={manualDescription}
                setManualDescription={setManualDescription} descriptionRef={descriptionRef}
                condition={condition}
                errors={validationErrors}
                brands={brands}
                models={models}
            />

            <PricingSection 
                priceGross={priceGross} setPriceGross={setPriceGross}
                weight={weight} setWeight={setWeight}
                length={length} setLength={setLength}
                packageType={packageType} setPackageType={setPackageType}
                width={width} setWidth={setWidth}
                height={height} setHeight={setHeight}
                shippingPrice={shippingPrice} setShippingPrice={setShippingPrice}
                stock={stock} setStock={setStock}
                initialData={initialData} 
                isSubmitting={isSubmitting || isPending} 
                errors={validationErrors} 
            />

        </form>
    );
}
