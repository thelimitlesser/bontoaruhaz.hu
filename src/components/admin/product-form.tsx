"use client";

import { useState, useEffect, useRef } from "react";
import { getNextReferenceNumber, checkDuplicateSku, checkDuplicateProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

// Sub-components
import { BasicInfoSection } from "./product-form/basic-info-section";
import { PartNameSearchSection } from "./product-form/part-name-search-section";
import { VehicleCompatibilitySection } from "./product-form/vehicle-compatibility-section";
import { ImageUploadSection } from "./product-form/image-upload-section";
import { DescriptionSection } from "./product-form/description-section";
import { PricingSection } from "./product-form/pricing-section";
import { DuplicateWarningModal } from "./product-form/duplicate-warning-modal";

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
    const router = useRouter();
    // Refs for spellcheck/focus
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // --- State ---
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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [autoRef, setAutoRef] = useState(initialData?.productCode || "");
    const [productName, setProductName] = useState(initialData?.name || "");
    const [sku, setSku] = useState(initialData?.sku || "");
    const [duplicateWarnings, setDuplicateWarnings] = useState<any[]>([]);
    const [nameDuplicates, setNameDuplicates] = useState<any[]>([]);
    const [isCheckingSku, setIsCheckingSku] = useState(false);
    const [isCheckingName, setIsCheckingName] = useState(false);
    
    // Warning Modal States
    const [activeWarning, setActiveWarning] = useState<{ product: any, type: 'name' | 'sku' } | null>(null);
    const [acknowledgedNameIds, setAcknowledgedNameIds] = useState<Set<string>>(new Set());
    const [acknowledgedSkuIds, setAcknowledgedSkuIds] = useState<Set<string>>(new Set());
    const [yearFrom, setYearFrom] = useState(initialData?.yearFrom?.toString() || "");
    const [yearTo, setYearTo] = useState(initialData?.yearTo?.toString() || "");
    const [condition, setCondition] = useState(initialData?.condition || "used");
    const [engineCode, setEngineCode] = useState(initialData?.engineCode || "");
    const [bodyType, setBodyType] = useState(initialData?.bodyType || "");
    const [descriptionHeader, setDescriptionHeader] = useState("");
    const [lastAutoName, setLastAutoName] = useState("");
    const [lastAutoHeader, setLastAutoHeader] = useState("");
    
    // Pricing & Dimensions states (to fix data loss and naming mismatch)
    const isSale = !!initialData?.originalPrice;
    const [priceGross, setPriceGross] = useState(
        isSale ? initialData.originalPrice.toString() : initialData?.priceGross?.toString() || ""
    );
    const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
    const [length, setLength] = useState(initialData?.length?.toString() || ""); // Sync with DB
    const [width, setWidth] = useState(initialData?.width?.toString() || "");
    const [height, setHeight] = useState(initialData?.height?.toString() || "");
    const [packageType, setPackageType] = useState(initialData?.packageType || "doboz");
    const [shippingPrice, setShippingPrice] = useState(initialData?.shippingPrice?.toString() || ""); // Sync with DB
    const [originalPrice, setOriginalPrice] = useState(
        isSale ? initialData.priceGross.toString() : initialData?.originalPrice?.toString() || ""
    );
    const [stock, setStock] = useState(initialData?.stock?.toString() || "1");

    // Flags to track if user manually edited the fields
    const [isManualName, setIsManualName] = useState(!!initialData);
    const [isManualHeader, setIsManualHeader] = useState(false); // Session-level manual flag
    const hasMountedSync = useRef(false);

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

        // 2. Extract and strip the header
        // Header pattern: "Eladó gyári [Márka] [Modell] [Alkatrész] ([Év])."
        const patternsToStrip = ["Eladó gyári", "Eladó használt", "Gyári", "Eladó"];
        
        let foundHeader = "";
        for (const pattern of patternsToStrip) {
            if (content.trim().startsWith(pattern)) {
                // Heuristic: Header is the first block separated by double newline
                const firstDoubleNL = content.indexOf("\n\n");
                let splitIndex = firstDoubleNL;

                if (splitIndex !== -1) {
                    foundHeader = content.substring(0, splitIndex).trim();
                    let remaining = content.substring(splitIndex).trim();
                    
                    // --- HEALING LOGIC ---
                    // Detect if it was split mid-number (e.g. "Facelift 2." and "0 Diesel")
                    if (foundHeader.match(/\d\.$/) && remaining.match(/^\d/)) {
                        const nextDot = remaining.indexOf(".");
                        const nextNL = remaining.indexOf("\n");
                        let subSplit = -1;
                        if (nextDot !== -1 && (nextNL === -1 || nextDot < nextNL)) subSplit = nextDot + 1;
                        else if (nextNL !== -1) subSplit = nextNL;
                        
                        if (subSplit !== -1) {
                            foundHeader += " " + remaining.substring(0, subSplit);
                            remaining = remaining.substring(subSplit).trim();
                        }
                    }
                    
                    foundHeader = foundHeader.trim();
                    content = remaining;
                    break;
                } else {
                    // Fallback to dot only if it's NOT a decimal (dot not followed by digit)
                    const dotMatch = content.match(/\.(?!\d)/);
                    if (dotMatch && dotMatch.index !== undefined) {
                        foundHeader = content.substring(0, dotMatch.index + 1).trim();
                        content = content.substring(dotMatch.index + 1).trim();
                        break;
                    }
                }
            }
        }

        // Set the extracted header and immediately identify if it's auto-generated to avoid sync lag
        if (foundHeader) {
            setTimeout(() => {
                setDescriptionHeader(foundHeader);
                
                // Pre-sync if it looks like an auto-header
                const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                const brand = brands.find(b => b.id === initialData?.brandId)?.name || "";
                const model = models.find(m => m.id === initialData?.modelId)?.name || "";
                const part = partItems.find(p => p.id === initialData?.partItemId)?.name || "";
                
                if (brand && model && part) {
                    const hClean = clean(foundHeader);
                    const bClean = clean(brand);
                    const mClean = clean(model);
                    const pClean = clean(part);
                    
                    if (hClean.includes(bClean) && hClean.includes(mClean) && hClean.includes(pClean)) {
                        setLastAutoHeader(foundHeader);
                        // Also sync name if it matches
                        const nameClean = clean(initialData.name || "");
                        if (nameClean.includes(bClean) && nameClean.includes(mClean) && nameClean.includes(pClean)) {
                            setLastAutoName(initialData.name);
                        }
                    }
                }
            }, 0);
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

    // Real-time name/trio duplicate check
    useEffect(() => {
        const checkName = async () => {
            // Check by name AND by trio (brand+model+partItem)
            const hasEnoughInfo = productName.trim().length >= 5 || (selectedBrand && selectedModel && selectedPartItem);
            
            if (hasEnoughInfo) {
                setIsCheckingName(true);
                const duplicates = await checkDuplicateProduct(productName, initialData?.id, selectedBrand, selectedModel, selectedPartItem);
                setNameDuplicates(duplicates);
                setIsCheckingName(false);
            } else {
                setNameDuplicates([]);
                setIsCheckingName(false);
            }
        };
        const timer = setTimeout(checkName, 300);
        return () => clearTimeout(timer);
    }, [productName, initialData?.id, selectedBrand, selectedModel, selectedPartItem]);

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

    // TRIGGER WARNING MODAL
    useEffect(() => {
        // 1. Priority to SKU duplicates
        if (duplicateWarnings.length > 0) {
            const match = duplicateWarnings[0];
            if (!acknowledgedSkuIds.has(match.id)) {
                setActiveWarning({ product: match, type: 'sku' });
                return;
            }
        } 
        
        // 2. Then Name/Trio duplicates
        if (nameDuplicates.length > 0) {
            const match = nameDuplicates[0];
            if (!acknowledgedNameIds.has(match.id)) {
                setActiveWarning({ product: match, type: 'name' });
                return;
            }
        }
    }, [duplicateWarnings, nameDuplicates, acknowledgedNameIds, acknowledgedSkuIds]);

    // Intelligent Auto-Name & Header Generation
    
    useEffect(() => {
        const brand = brands.find(b => b.id === selectedBrand)?.name;
        const model = models.filter(m => m.brandId === selectedBrand).find(m => m.id === selectedModel)?.name;
        const part = selectedPartItemObj?.name;
        const yearsStr = yearFrom || yearTo ? `(${yearFrom || '?'}-${yearTo || '?'})` : "";
        const condLabel = condition === 'new' ? 'gyári új' : 'gyári használt';
        
        if (brand && model && part) {
            const bodyTypeStr = bodyType ? ` ${bodyType}` : "";
            const newAutoName = `${brand} ${model}${bodyTypeStr} ${part}`;
            const newAutoHeader = `Eladó ${condLabel} ${brand} ${model}${bodyTypeStr} ${part} ${yearsStr}.`.replace(/\s+/g, ' ');

            // SYNC & UPDATE LOGIC
            
            // 1. Title Update - Sync if not manually edited or empty
            if (!isManualName || !productName) {
                if (productName !== newAutoName) {
                    setProductName(newAutoName);
                }
            }

            // 2. Header Update - Sync if not manually edited or empty
            if (!isManualHeader || !descriptionHeader) {
                if (descriptionHeader !== newAutoHeader) {
                    setDescriptionHeader(newAutoHeader);
                }
            }
        }
    }, [selectedBrand, selectedModel, selectedPartItem, condition, yearFrom, yearTo, bodyType, brands, models, selectedPartItemObj, isManualName, isManualHeader]); // Removed productName/descriptionHeader to avoid loop, focus on inputs

    // --- Manual Title to Header Synchronization ---
    useEffect(() => {
        // Skip the very first execution on mount to protect DB values
        if (!hasMountedSync.current) {
            hasMountedSync.current = true;
            return;
        }

        if (!isManualHeader && productName) {
            const condLabel = condition === 'new' ? 'gyári új' : 'gyári használt';
            const yearsStr = yearFrom || yearTo ? ` (${yearFrom || '?'}-${yearTo || '?'})` : "";
            
            // Standardize the header format: [Prefix] [Full Product Name] [Years]
            const newHeader = `Eladó ${condLabel} ${productName}${yearsStr}.`.replace(/\s+/g, ' ');
            
            if (descriptionHeader !== newHeader) {
                setDescriptionHeader(newHeader);
            }
        }
    }, [productName, condition, yearFrom, yearTo, isManualHeader]);

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
        // SKU is now optional
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
        setUploadProgress(0);

        try {
            // Build image metadata
            const existingImages = images.filter(img => img.isExisting).map(img => img.preview).join(',');
            formData.append('existingImages', existingImages);
            if (initialData?.id) formData.append('id', initialData.id);

            formData.delete('imageFiles');
            images.forEach(img => {
                if (!img.isExisting && img.file) formData.append('imageFiles', img.file);
            });

            // Reconstruct final description with direct DOM values to prevent state loss
            const domName = formData.get('name')?.toString() || productName;
            const domHeader = formData.get('descriptionHeader')?.toString() || descriptionHeader;
            const domManual = formData.get('manualDescription')?.toString() || manualDescription;

            const finalDescriptionParts = [];
            if (domHeader.trim()) finalDescriptionParts.push(domHeader.trim());
            if (domManual.trim()) finalDescriptionParts.push(domManual.trim());
            finalDescriptionParts.push(`A hivatkozási számra hivatkozzon, hogyha bármi kérdése van a termékkel kapcsolatban!\nHivatkozási szám: (${autoRef})`);

            formData.set('description', finalDescriptionParts.join('\n\n'));
            formData.set('name', domName);
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
            formData.set('bodyType', bodyType);
            
            if (width) formData.set('width', width);
            if (height) formData.set('height', height);
            if (length) formData.set('length', length);
            if (packageType) formData.set('packageType', packageType);
            if (weight) formData.set('weight', weight);
            if (priceGross) formData.set('priceGross', priceGross);
            if (shippingPrice) formData.set('shippingPrice', shippingPrice);
            if (originalPrice) formData.set('originalPrice', originalPrice);
            if (stock) formData.set('stock', stock);

            // Use XMLHttpRequest for actual upload progress tracking
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    // Scale 0-90% for upload, last 10% for processing
                    setUploadProgress(percentComplete * 0.9);
                }
            });

            const promise = new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setUploadProgress(100);
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error(xhr.responseText || 'Szerver hiba történt'));
                    }
                };
                xhr.onerror = () => reject(new Error('Hálózati hiba történt'));
                xhr.open('POST', '/api/admin/products');
                xhr.send(formData);
            });

            await promise;
            
            if (onSuccess) onSuccess();
            else router.push('/admin/inventory');
        } catch (error: any) {
            console.error("Product submission error details:", error);
            alert("Hiba történt a mentés során: " + error.message);
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit(formData);
            }} 
            className={`relative space-y-8 max-w-4xl pb-12 ${className || ""}`}
        >
            
            <LoadingOverlay isVisible={isSubmitting} progress={uploadProgress} />
            
            <ImageUploadSection 
                images={images} setImages={setImages}
                isCompressing={isCompressing} setIsCompressing={setIsCompressing}
                errors={validationErrors}
            />

            <PartNameSearchSection 
                productName={productName} 
                setProductName={(val) => {
                    setProductName(val);
                    setIsManualName(true);
                }} 
                nameRef={nameRef}
                selectedPartItem={selectedPartItem} setSelectedPartItem={setSelectedPartItem}
                isCheckingName={isCheckingName} nameDuplicates={nameDuplicates}
                errors={validationErrors}
                partItems={partItems}
                categories={categories}
                subcategories={subcategories}
            />

            <VehicleCompatibilitySection 
                isUniversal={isUniversal} setIsUniversal={setIsUniversal}
                selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
                selectedModel={selectedModel} setSelectedModel={setSelectedModel}
                yearFrom={yearFrom} setYearFrom={setYearFrom}
                yearTo={yearTo} setYearTo={setYearTo}
                bodyType={bodyType} setBodyType={setBodyType}
                compatibilities={compatibilities} setCompatibilities={setCompatibilities}
                errors={validationErrors}
                brands={brands}
                models={models}
            />

            <BasicInfoSection 
                sku={sku} setSku={setSku} isCheckingSku={isCheckingSku}
                duplicateWarnings={duplicateWarnings} autoRef={autoRef} setAutoRef={setAutoRef}
                condition={condition} setCondition={setCondition}
                engineCode={engineCode} setEngineCode={setEngineCode}
                initialData={initialData}
                errors={validationErrors}
            />

            <DescriptionSection 
                selectedBrand={selectedBrand} selectedModel={selectedModel}
                selectedPartItemObj={selectedPartItemObj} yearFrom={yearFrom} yearTo={yearTo}
                autoRef={autoRef} manualDescription={manualDescription}
                setManualDescription={setManualDescription} descriptionRef={descriptionRef}
                descriptionHeader={descriptionHeader} 
                setDescriptionHeader={(val) => {
                    setDescriptionHeader(val);
                    setIsManualHeader(true);
                }}
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
                originalPrice={originalPrice} setOriginalPrice={setOriginalPrice}
                stock={stock} setStock={setStock}
                initialData={initialData} 
                isSubmitting={isSubmitting} 
                errors={validationErrors} 
            />

            <DuplicateWarningModal 
                isOpen={!!activeWarning}
                onClose={() => {
                    if (activeWarning) {
                        const id = activeWarning.product.id;
                        if (activeWarning.type === 'sku') {
                            setAcknowledgedSkuIds(prev => new Set(prev).add(id));
                        } else {
                            setAcknowledgedNameIds(prev => new Set(prev).add(id));
                        }
                        setActiveWarning(null);
                    }
                }}
                product={{
                    id: activeWarning?.product.id || "",
                    name: activeWarning?.product.name || "",
                    productCode: activeWarning?.product.productCode,
                    sku: activeWarning?.product.sku
                }}
            />

        </form>
    );
}
