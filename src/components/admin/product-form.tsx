"use client";

import { useState } from "react";
import { createProduct } from "@/app/actions/product";
import { Save, Upload, X as CloseIcon, Image as ImageIcon } from "lucide-react";
import { categories, getSubcategoriesByCategory, brands, getModelsByBrand, getPartItemsBySubcategory } from "@/lib/vehicle-data";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function ProductForm() {
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [selectedPartItem, setSelectedPartItem] = useState("");
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const availableSubcategories = selectedCategory ? getSubcategoriesByCategory(selectedCategory) : [];
    const availableModels = selectedBrand ? getModelsByBrand(selectedBrand) : [];

    // For Level 3: Get items based on subcategory id
    const currentSubcategoryObj = availableSubcategories.find(s => s.id === selectedSubcategory);
    const availablePartItems = currentSubcategoryObj ? getPartItemsBySubcategory(currentSubcategoryObj.id) : [];

    const brandOptions = brands.map(b => ({ value: b.id, label: b.name }));
    const modelOptions = availableModels.map(m => ({ value: m.id, label: m.years ? `${m.name} (${m.years})` : m.name }));
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
    const subcategoryOptions = availableSubcategories.map(s => ({ value: s.id, label: s.name }));
    const partItemOptions = availablePartItems.map(p => ({ value: p.id, label: p.name }));

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
                preview: URL.createObjectURL(file)
            }));

            setImages([...images, ...newImageData]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        setImages(newImages);
    };

    return (
        <form action={createProduct} className="space-y-8 max-w-4xl">

            {/* Removed Származás & Hely - Replced by Márka & Modell within Alapadatok or its own block */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Jármű (Márka & Modell)</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <SearchableSelect
                            name="brandId"
                            label="Márka *"
                            options={brandOptions}
                            value={selectedBrand}
                            onChange={(val) => {
                                setSelectedBrand(val);
                                setSelectedModel(""); // Reset model when brand changes
                            }}
                            placeholder="Válassz márkát..."
                            theme="light"
                        />
                    </div>

                    <div className="w-full">
                        <SearchableSelect
                            name="modelId"
                            label="Modell *"
                            options={modelOptions}
                            value={selectedModel}
                            onChange={setSelectedModel}
                            placeholder="Válassz modellt..."
                            disabled={!selectedBrand}
                            theme="light"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Alapadatok</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Megnevezés *</label>
                        <input name="name" type="text" required placeholder="pl. Volkswagen Golf VII Generátor" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Cikkszám / Termékszám *</label>
                        <input name="sku" type="text" required placeholder="pl. GEN-VW-001" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-mono" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Évjárat (mettől)</label>
                        <input name="yearFrom" type="number" placeholder="pl. 2012" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Évjárat (meddig)</label>
                        <input name="yearTo" type="number" placeholder="pl. 2020" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <SearchableSelect
                            name="categoryId"
                            label="Főkategória *"
                            options={categoryOptions}
                            value={selectedCategory}
                            onChange={(val) => {
                                setSelectedCategory(val);
                                setSelectedSubcategory(""); // Reset subcategory when category changes
                            }}
                            placeholder="Válassz főkategóriát..."
                            theme="light"
                        />
                    </div>

                    <div className="w-full">
                        <SearchableSelect
                            name="subcategoryId"
                            label="Alkategória *"
                            options={subcategoryOptions}
                            value={selectedSubcategory}
                            onChange={(val) => {
                                setSelectedSubcategory(val);
                                setSelectedPartItem(""); // Reset part item when subcategory changes
                            }}
                            disabled={!selectedCategory}
                            placeholder="Válassz alkategóriát..."
                            theme="light"
                        />
                    </div>
                </div>

                {availablePartItems.length > 0 && (
                    <div className="w-full max-w-md">
                        <SearchableSelect
                            name="partItemId"
                            label="Specifikus alkatrész (Level 3)"
                            options={partItemOptions}
                            value={selectedPartItem}
                            onChange={setSelectedPartItem}
                            placeholder="Válassz pontos alkatrész típust..."
                            theme="light"
                        />
                        <p className="text-xs text-orange-600 font-medium mt-1">
                            A kiválasztott alkategória tovább bontható. Kérjük válassza ki a pontos típust!
                        </p>
                    </div>
                )}

                {/* Categorization Preview */}
                {(selectedCategory || selectedSubcategory) && (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 space-y-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400">Megjelenés a katalógusban</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-orange-900">
                            {selectedCategory && (
                                <span className="bg-orange-200/50 px-2 py-1 rounded">
                                    {categories.find(c => c.id === selectedCategory)?.name}
                                </span>
                            )}
                            {selectedSubcategory && (
                                <>
                                    <span className="text-orange-300">/</span>
                                    <span className="bg-orange-200/50 px-2 py-1 rounded">
                                        {availableSubcategories.find(s => s.id === selectedSubcategory)?.name}
                                    </span>
                                </>
                            )}
                            {selectedPartItem && (
                                <>
                                    <span className="text-orange-300">/</span>
                                    <span className="bg-orange-600 text-white px-2 py-1 rounded shadow-sm">
                                        {availablePartItems.find(p => p.id === selectedPartItem)?.name}
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] text-orange-700/70 italic">
                            {selectedPartItem
                                ? "Ezzel a beállítással a termék mindhárom szinten (Főkategória, Alkategória és Specifikus típus) megtalálható lesz."
                                : "A termék a főkategóriában és a választott alkategóriában lesz elérhető."}
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Leírás</label>
                    <textarea name="description" rows={4} placeholder="Részletes leírás az alkatrészről..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors"></textarea>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Kompatibilis Modellek (További autók)</label>
                    <textarea name="tecdocKTypes" rows={2} placeholder="pl. VW Golf VII 1.6 TDI, Audi A3 8V... (K-Type kódok vagy szöveges felsorolás)" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors"></textarea>
                    <p className="text-xs text-gray-500">Itt sorolhatja fel, hogy a donoron kívül mihez jó még az alkatrész.</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Árazás & Készlet</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Bruttó Ár (HUF) *</label>
                        <input name="priceGross" type="number" required placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" />
                        <p className="text-xs text-gray-500">A nettó ár automatikusan számolódik (27% ÁFA).</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Állapot</label>
                        <select name="condition" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors">
                            <option value="USED">Használt</option>
                            <option value="NEW">Új</option>
                            <option value="REFURBISHED">Felújított</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Készlet (db)</label>
                        <input name="stock" type="number" defaultValue="1" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Technikai Adatok</h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Gyári számok (OEM)</label>
                    <input name="oemNumbers" type="text" placeholder="pl. 1K0903023, 03L903023F (vesszővel elválasztva)" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-mono" />
                    <p className="text-xs text-gray-500">Kereséshez elengedhetetlen!</p>
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
                            <img src={img.preview} alt={`preview-${index}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
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
                                type="file"
                                name="imageFiles"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    )}
                </div>
                <p className="text-xs text-gray-500 italic">Az első kép lesz a termék fő képe. Kérjük válasszon éles, tiszta képeket!</p>
            </div>

            <div className="flex justify-end gap-4">
                <button type="submit" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-orange-900/20">
                    <ImageIcon className="w-5 h-5" />
                    Termék Mentése
                </button>
            </div>
        </form>
    );
}
