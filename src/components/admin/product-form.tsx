"use client";

import { useState, useEffect } from "react";
import { createProduct, updateProduct, getNextReferenceNumber, checkDuplicateSku } from "@/app/actions/product";
import { Save, Upload, X as CloseIcon, Image as ImageIcon, Plus, Trash2, Loader2 } from "lucide-react";

import { categories, partsSubcategories as subcategories, brands, getModelsByBrand, partItems } from "@/lib/vehicle-data";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ProductFormProps {
    initialData?: any;
    onSuccess?: () => void;
    className?: string;
}

export function ProductForm({ initialData, onSuccess, className }: ProductFormProps) {
    const [selectedBrand, setSelectedBrand] = useState(initialData?.brandId || "");
    const [selectedModel, setSelectedModel] = useState(initialData?.modelId || "");

    // Universal Switch
    const [isUniversal, setIsUniversal] = useState(initialData?.isUniversal || false);

    // Multi-vehicle compatibility state
    type CompType = { brandId: string; modelId: string; yearFrom?: string; yearTo?: string };
    const [compatibilities, setCompatibilities] = useState<CompType[]>(initialData?.compatibilities || []);

    // State for the"Add New" compatibility row
    const [addBrand, setAddBrand] = useState("");
    const [addModel, setAddModel] = useState("");
    const [addYearFrom, setAddYearFrom] = useState("");
    const [addYearTo, setAddYearTo] = useState("");

    const handleAddComp = () => {
        if (!addBrand || !addModel) return;
        setCompatibilities([...compatibilities, { brandId: addBrand, modelId: addModel, yearFrom: addYearFrom, yearTo: addYearTo }]);
        setAddBrand("");
        setAddModel("");
        setAddYearFrom("");
        setAddYearTo("");
    };

    const handleRemoveComp = (index: number) => {
        setCompatibilities(compatibilities.filter((_, i) => i !== index));
    };


    // Unified selector state
    const [selectedPartItem, setSelectedPartItem] = useState(initialData?.partItemId || "");

    // Derived parent categories from selectedPartItem
    const selectedPartItemObj = partItems.find(p => p.id === selectedPartItem);
    const inferredSubcategory = subcategories.find(s => s.id === selectedPartItemObj?.subcategoryId);
    const inferredCategory = categories.find(c => c.id === inferredSubcategory?.categoryId);

    const [images, setImages] = useState<{ file?: File; preview: string; isExisting?: boolean }[]>(
        initialData?.images ? initialData.images.split(',').filter(Boolean).map((url: string) => ({ preview: url, isExisting: true })) : []
    );

    const [autoRef, setAutoRef] = useState(initialData?.productCode || "");
    const [productName, setProductName] = useState(initialData?.name || "");
    const [sku, setSku] = useState(initialData?.sku || "");
    const [duplicateWarnings, setDuplicateWarnings] = useState<any[]>([]);
    const [isCheckingSku, setIsCheckingSku] = useState(false);
    const [manualDescription, setManualDescription] = useState(() => {
        if (!initialData?.description) return "";
        let content = initialData.description;
        
        // 1. Strip the auto-footer
        const footerStart = content.indexOf("\n\nA hivatkozási számra hivatkozzon");
        if (footerStart !== -1) {
            content = content.substring(0, footerStart);
        }

        // 2. Strip the auto-header ("Eladó gyári ... .")
        const blocks = content.split('\n\n');
        if (blocks.length > 0 && blocks[0].trim().startsWith('Eladó gyári')) {
            blocks.shift(); // Remove the auto-generated header
        }

        return blocks.join('\n\n').trim();
    });

    const [yearFrom, setYearFrom] = useState(initialData?.yearFrom?.toString() || "");
    const [yearTo, setYearTo] = useState(initialData?.yearTo?.toString() || "");

    useEffect(() => {
        if (!initialData) {
            getNextReferenceNumber().then(setAutoRef);
        }
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

        const timer = setTimeout(checkSku, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [sku, initialData?.id]);

    // Automation Logic
    useEffect(() => {
        const brandName = brands.find(b => b.id === selectedBrand)?.name || "";
        const modelName = getModelsByBrand(selectedBrand).find(m => m.id === selectedModel)?.name || "";
        const partName = selectedPartItemObj?.name || "";
        const years = yearFrom || yearTo ? `(${yearFrom || '?'}-${yearTo || '?'})` : "";

        const nameParts = [brandName, modelName, partName].filter(Boolean);

        // Update name if we have at least one piece of info
        if (nameParts.length > 0) {
            const generatedName = `${nameParts.join(' ')}${years ? ` ${years}` : ''}`.trim();
            setProductName(generatedName);
        }

    }, [selectedBrand, selectedModel, selectedPartItem, yearFrom, yearTo]);

    const availableModels = selectedBrand ? getModelsByBrand(selectedBrand) : [];
    const addAvailableModels = addBrand ? getModelsByBrand(addBrand) : [];

    const brandOptions = brands
        .filter(b => !b.hidden)
        .map(b => ({ value: b.id, label: b.name }));
    const modelOptions = availableModels.map(m => ({
        value: m.id,
        label: m.years ? `${m.name} (${m.years})` : m.name,
        group: m.series
    }));
    const addModelOptions = addAvailableModels.map(m => ({
        value: m.id,
        label: m.years ? `${m.name} (${m.years})` : m.name,
        group: m.series
    }));

    // Sort all part items alphabetically for the unified dropdown
    const allPartItemOptions = [...partItems]
        .sort((a, b) => a.name.localeCompare(b.name, 'hu'))
        .map(p => ({ value: p.id, label: p.name }));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const totalImages = images.length + newFiles.length;

            if (totalImages > 5) {
                alert("Maximum 5 képet tölthet fel!");
                return;
            }

            const newImageData = newFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                isExisting: false
            }));

            setImages([...images, ...newImageData]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        if (!newImages[index].isExisting) {
            URL.revokeObjectURL(newImages[index].preview);
        }
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSubmit = async (formData: FormData) => {
        // Build existing image string from current state
        const existingImages = images
            .filter(img => img.isExisting)
            .map(img => img.preview)
            .join(',');

        formData.append('existingImages', existingImages);

        // Manually append all new files from state, overriding the native input
        formData.delete('imageFiles');
        images.forEach(img => {
            if (!img.isExisting && img.file) {
                formData.append('imageFiles', img.file);
            }
        });

        // 2. Automated Structured Description
        const brandName = brands.find(b => b.id === selectedBrand)?.name || "";
        const modelName = getModelsByBrand(selectedBrand).find(m => m.id === selectedModel)?.name || "";
        const partName = selectedPartItemObj?.name || "";
        const years = yearFrom || yearTo ? `(${yearFrom || '?'}-${yearTo || '?'})` : "";

        const header = (brandName && modelName && partName)
            ? `Eladó gyári ${brandName} ${modelName} ${partName} ${years}.`
            : "";

        const footer = `\n\nA hivatkozási számra hivatkozzon, hogyha bármi kérdése van a termékkel kapcsolatban!\nHivatkozási szám: (${autoRef})`;

        const finalDescription = `${header}${manualDescription ? `\n\n${manualDescription}` : ""}${footer}`;
        formData.set('description', finalDescription);
        formData.set('name', productName); // Ensure generated name is sent

        try {
            if (initialData?.id) {
                await updateProduct(initialData.id, formData);
            } else {
                await createProduct(formData);
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            if (error.message === 'NEXT_REDIRECT') throw error;
            alert(error.message || "Hiba történt a mentés során!");
        }
    };

    return (
        <form action={handleSubmit} spellCheck={true} className={`spellcheck-force space-y-8 max-w-4xl pb-12 ${className || ""}`}>

            <input type="hidden" name="isUniversal" value={isUniversal.toString()} />
            <input type="hidden" name="compatibilitiesData" value={JSON.stringify(compatibilities)} />

            {/* Jármű szekció összetett (Univerzális + Donor + Extrák) */}
            <div className={`bg-white border rounded-xl p-6 space-y-6 transition-all ${isUniversal ? 'border-orange-500 shadow-md shadow-orange-500/10' : 'border-gray-200 shadow-sm'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Jármű Kompatibilitás</h2>

                    <label className="flex items-center gap-3 cursor-pointer group bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={isUniversal} onChange={(e) => setIsUniversal(e.target.checked)} />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${isUniversal ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isUniversal ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm font-bold text-orange-900">Univerzális alkatrész (Minden autóhoz)</span>
                    </label>
                </div>

                {!isUniversal ? (
                    <>
                        {/* Donor Autó */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Elsődleges Jármű (Donor)</h3>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="w-full">
                                    <SearchableSelect
                                        name="brandId" label="Márka *" options={brandOptions}
                                        value={selectedBrand}
                                        onChange={(val) => {
                                            setSelectedBrand(val);
                                            setSelectedModel(""); // Reset model when brand changes
                                        }}
                                        placeholder="Válassz márkát..." theme="light" />
                                </div>

                                <div className="w-full">
                                    <SearchableSelect
                                        name="modelId" label="Modell *" options={modelOptions}
                                        value={selectedModel}
                                        onChange={setSelectedModel}
                                        placeholder="Válassz modellt..." disabled={!selectedBrand}
                                        theme="light" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Évjárat (mettől)</label>
                                    <input
                                        name="yearFrom" type="number"
                                        value={yearFrom} onChange={(e) => setYearFrom(e.target.value)}
                                        placeholder="pl. 2012" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Évjárat (meddig)</label>
                                    <input
                                        name="yearTo" type="number"
                                        value={yearTo} onChange={(e) => setYearTo(e.target.value)}
                                        placeholder="pl. 2020" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* További kompatibilis autók listája */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">További Kompatibilis Modellek</h3>

                            {compatibilities.length > 0 && (
                                <div className="space-y-2">
                                    {compatibilities.map((comp, idx) => {
                                        const bName = brands.find(b => b.id === comp.brandId)?.name || comp.brandId;
                                        const mName = getModelsByBrand(comp.brandId).find(m => m.id === comp.modelId)?.name || comp.modelId;
                                        return (
                                            <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{bName} {mName}</span>
                                                    {(comp.yearFrom || comp.yearTo) && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">
                                                            {comp.yearFrom || '...'} - {comp.yearTo || '...'}
                                                        </span>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => handleRemoveComp(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Hozzáadás Sáv */}
                            <div className="bg-green-50/50 border border-green-100 p-4 rounded-lg space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-3">
                                        <SearchableSelect
                                            name="addBrandId" label="Márka" options={brandOptions}
                                            value={addBrand}
                                            onChange={(val) => { setAddBrand(val); setAddModel(""); }}
                                            placeholder="Márka..." theme="light" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <SearchableSelect
                                            name="addModelId" label="Modell" options={addModelOptions}
                                            value={addModel}
                                            onChange={setAddModel}
                                            placeholder="Modell..." disabled={!addBrand}
                                            theme="light" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Mettől</label>
                                        <input type="number" placeholder="Év" value={addYearFrom} onChange={e => setAddYearFrom(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Meddig</label>
                                        <input type="number" placeholder="Év" value={addYearTo} onChange={e => setAddYearTo(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                                    </div>
                                    <div className="md:col-span-2 flex items-end">
                                        <button
                                            type="button" onClick={handleAddComp}
                                            disabled={!addBrand || !addModel}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" >
                                            <Plus className="w-4 h-4" />
                                            Hozzáad
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-orange-800 bg-orange-50 rounded-lg border border-orange-100">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-bold">Ez az alkatrész Univerzálisnak lett jelölve.</p>
                        <p className="text-sm mt-1 opacity-80">Nem szükséges külön autómárkákhoz rendelni, minden keresésben releváns lesz.</p>
                    </div>
                )}
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Alapadatok</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Megnevezés *</label>
                        <input name="name" type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="pl. Volkswagen Golf VII Generátor" spellCheck={true} className="w-full bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-bold" />
                        <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Automatikusan generált cím</p>
                    </div>

                    <div className="w-full">
                        <SearchableSelect
                            name="partItemId" label="Pontos Alkatrész Kereső *" options={allPartItemOptions}
                            value={selectedPartItem}
                            onChange={(val) => {
                                setSelectedPartItem(val);
                            }}
                            placeholder="Keresés (pl. első lökhárító, generátor)..." theme="light" />
                        <p className="text-xs text-gray-500 mt-1">Az alkatrész kiválasztásával a fő- és alkategóriák automatikusan kitöltődnek.</p>

                        {/* Hidden inputs to pass inferred categories to the backend action */}
                        {inferredCategory && <input type="hidden" name="categoryId" value={inferredCategory.id} />}
                        {inferredSubcategory && <input type="hidden" name="subcategoryId" value={inferredSubcategory.id} />}
                    </div>
                </div>

                {/* Categorization Preview */}
                {(inferredCategory || inferredSubcategory || selectedPartItemObj) && (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400">Automatikus Kategorizálás</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-orange-900">
                            {inferredCategory && (
                                <span className="bg-orange-200/50 px-2 py-1 rounded shadow-sm">
                                    {inferredCategory.name}
                                </span>
                            )}
                            {inferredSubcategory && (
                                <>
                                    <span className="text-orange-300">/</span>
                                    <span className="bg-orange-200/50 px-2 py-1 rounded shadow-sm">
                                        {inferredSubcategory.name}
                                    </span>
                                </>
                            )}
                            {selectedPartItemObj && (
                                <>
                                    <span className="text-orange-300">/</span>
                                    <span className="bg-orange-600 text-white px-2 py-1 rounded shadow-sm">
                                        {selectedPartItemObj.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium text-gray-700">Cikkszám (Gyári szám) *</label>
                        <div className="relative">
                            <input name="sku" type="text" required value={sku} onChange={(e) => setSku(e.target.value)} placeholder="pl. 5G1941005" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-mono uppercase" />
                            {isCheckingSku && <div className="absolute right-3 top-3.5"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hivatalos gyári azonosító kód.</p>
                        
                        {duplicateWarnings.length > 0 && (
                            <div className="mt-3 bg-orange-50 border border-orange-200 p-3 rounded-lg animate-in fade-in slide-in-from-top-2 absolute w-full md:w-[250%] z-10 shadow-xl">
                                <p className="text-xs font-bold text-orange-800 flex items-center gap-1.5 mb-2">
                                    ⚠️ Figyelem! Létező termék(ek):
                                </p>
                                <ul className="space-y-1.5">
                                    {duplicateWarnings.map(dup => (
                                        <li key={dup.id} className="text-[10px] text-orange-900 bg-white/60 px-2 py-1.5 rounded flex justify-between items-center border border-orange-100">
                                            <span className="font-semibold truncate mr-2" title={dup.name}>{dup.name}</span>
                                            <span className="whitespace-nowrap"><span className="font-mono bg-orange-200 px-1.5 py-0.5 rounded text-orange-900 font-bold">{dup.stock} db</span> készleten</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-[10px] text-orange-700 mt-2 font-medium">Javaslat: Ha ugyanezt töltöd fel, inkább nyisd meg a meglévőt és növeld a készletét!</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Motorkód</label>
                        <input name="engineCode" type="text" defaultValue={initialData?.engineCode || ""} placeholder="pl. ASZ" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-mono uppercase" />
                        <p className="text-xs text-gray-500 mt-1">Pl. ASZ, BRE, AVF</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Hivatkozási szám *</label>
                        <input name="productCode" type="text" required value={autoRef} onChange={(e) => setAutoRef(e.target.value)} placeholder="pl. 1000" className="w-full bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-mono uppercase font-bold" />
                        <p className="text-xs text-orange-700 mt-1">Automatikusan generált hivatkozási szám.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Egyedi Leírás (középső szöveg)</label>
                        <span className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider">Helyesírás-ellenőrző aktív</span>
                    </div>
                    <textarea
                        id="manualDescription"
                        name="manualDescription" rows={4}
                        value={manualDescription}
                        onChange={(e) => setManualDescription(e.target.value)}
                        placeholder="Írd ide az alkatrész specifikus adatait (pl. szín, állapot, extra infók)..."
                        spellCheck={true}
                        autoCorrect="on"
                        autoComplete="on"
                        autoCapitalize="sentences"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[var(--color-primary)] text-gray-900 transition-colors resize-none" ></textarea>

                    <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Véglegesített Leírás betekintő:</h4>
                        <div className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed italic">
                            {(selectedBrand && selectedModel && selectedPartItemObj) ? `Eladó gyári ${brands.find(b => b.id === selectedBrand)?.name} ${getModelsByBrand(selectedBrand).find(m => m.id === selectedModel)?.name} ${selectedPartItemObj?.name} ${yearFrom || yearTo ? `(${yearFrom || '?'}-${yearTo || '?'})` : ""}.` : "[Automatikus leírás fejléc...]"}
                            {"\n\n"}
                            {manualDescription || "[Köztes egyedi szöveg helye...]"}
                            {"\n\n"}
                            A hivatkozási számra hivatkozzon, hogyha bármi kérdése van a termékkel kapcsolatban!{"\n"}
                            Hivatkozási szám: ({autoRef})
                        </div>
                    </div>
                </div>


            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Árazás & Szállítás</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Eladási Ár (Ft) *</label>
                        <div className="relative">
                            <input name="priceGross" type="number" required defaultValue={initialData?.priceGross || ""} placeholder="pl. 15000" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-bold text-lg" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Ft</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Állapot</label>
                        <select name="condition" defaultValue={initialData?.condition || "USED"} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors">
                            <option value="USED">Használt</option>
                            <option value="NEW">Új</option>
                            <option value="REFURBISHED">Felújított</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Készlet (db)</label>
                        <input name="stock" type="number" defaultValue={initialData?.stock ?? 1} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Súly (kg) *</label>
                        <div className="relative">
                            <input name="weight" type="number" step="0.01" required defaultValue={initialData?.weight || ""} placeholder="pl. 2.5" className="w-full bg-orange-50/50 border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-bold" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">kg</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Hosszúság (cm) *</label>
                        <div className="relative">
                            <input name="length" type="number" required defaultValue={initialData?.length || ""} placeholder="pl. 40" className="w-full bg-orange-50/50 border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-bold" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">cm</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Szélesség (cm) *</label>
                        <div className="relative">
                            <input name="width" type="number" required defaultValue={initialData?.width || ""} placeholder="pl. 30" className="w-full bg-orange-50/50 border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-bold" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">cm</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Magasság (cm) *</label>
                        <div className="relative">
                            <input name="height" type="number" required defaultValue={initialData?.height || ""} placeholder="pl. 20" className="w-full bg-orange-50/50 border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-bold" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">cm</div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 space-y-4">
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Egyedi Szállítási Ár</h3>
                                <p className="text-xs text-gray-500">Add meg az alkatrész fix szállítási díját</p>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Szállítási díj (Ft)</label>
                            <div className="relative max-w-xs">
                                <input
                                    type="number"
                                    name="shippingPrice"
                                    required
                                    defaultValue={initialData?.shippingPrice || ""}
                                    placeholder="pl. 2500"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 text-gray-900 font-bold transition-all"
                                />

                                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">Ft</div>
                            </div>
                            <p className="text-[10px] text-blue-600 italic mt-1">Ez az ár jelenik meg a pénztárnál, ha a vásárló házhozszállítást kér.</p>
                        </div>
                    </div>
                </div>

            </div>



            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">Termék Képei (Max 5)</h2>
                    <span className="text-sm font-medium text-gray-500">{images.length} / 5</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            <img src={img.preview} alt={`preview-${index}`} className="w-full h-full object-cover rounded-lg" />
                            <button
                                type="button" onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-orange-600 text-white text-[10px] font-bold text-center py-1">
                                    ELSŐDLEGES
                                </div>
                            )}
                        </div>
                    ))}

                    {images.length < 5 && (
                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-[var(--color-primary)] hover:bg-orange-50 transition-all cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500 mt-2">KÉP HOZZÁADÁSA</span>
                            <input
                                type="file" name="imageFiles" multiple
                                accept="image/*" className="hidden" onChange={handleImageChange}
                            />
                        </label>
                    )}
                </div>
                <p className="text-xs text-gray-500 italic">Az első kép lesz a termék fő képe. Kérjük válasszon éles, tiszta képeket!</p>
            </div>

            <div className="flex justify-end gap-4">
                <button type="submit" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-orange-900/20">
                    <Save className="w-5 h-5" />
                    {initialData?.id ? "Módosítások Mentése" : "Termék Mentése"}
                </button>
            </div>
        </form>
    );
}
