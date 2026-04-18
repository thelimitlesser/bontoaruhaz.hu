"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, ChevronRight, Car, Layers } from "lucide-react";
import { 
    createBrand, updateBrand, deleteBrand, 
    createModel, updateModel, deleteModel,
    createCategory, updateCategory, deleteCategory,
    createSubcategory, updateSubcategory, deleteSubcategory,
    createPartItem, updatePartItem, deletePartItem 
} from "@/app/actions/dictionary";
import { slugify } from "@/utils/slug";

type DictionaryEditorProps = {
    initialBrands: any[];
    initialModels: any[];
    initialCategories: any[];
    initialSubcategories: any[];
    initialPartItems: any[];
};

export function DictionaryEditor({
    initialBrands, initialModels, initialCategories, initialSubcategories, initialPartItems
}: DictionaryEditorProps) {
    const [activeTab, setActiveTab] = useState<"vehicles" | "parts">("vehicles");
    
    // State lists
    const [brands, setBrands] = useState(initialBrands);
    const [models, setModels] = useState(initialModels);
    const [categories, setCategories] = useState(initialCategories);
    const [subcategories, setSubcategories] = useState(initialSubcategories);
    const [partItems, setPartItems] = useState(initialPartItems);

    // Selections
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

    // Edit states (Inline editing)
    const [editingItem, setEditingItem] = useState<{ type: string, id: string } | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const startEditing = (type: string, item: any) => {
        setEditingItem({ type, id: item.id });
        setEditForm({ ...item });
    };

    const cancelEditing = () => {
        setEditingItem(null);
        setEditForm({});
    };

    const handleSave = async () => {
        if (!editingItem) return;

        try {
            if (editingItem.id === 'NEW') {
                // Creation
                let res;
                const generatedId = editForm.slug || slugify(editForm.name);
                
                if (editingItem.type === 'brand') {
                    res = await createBrand({ id: generatedId, name: editForm.name, slug: generatedId, logo: '/brands/default.svg' });
                    setBrands([...brands, res]);
                } else if (editingItem.type === 'model') {
                    res = await createModel({ id: generatedId, brandId: selectedBrandId, name: editForm.name, slug: generatedId, series: editForm.series, years: editForm.years });
                    setModels([...models, res]);
                } else if (editingItem.type === 'category') {
                    res = await createCategory({ id: generatedId, name: editForm.name, slug: generatedId });
                    setCategories([...categories, res]);
                } else if (editingItem.type === 'subcategory') {
                    res = await createSubcategory({ id: generatedId, categoryId: selectedCategoryId, name: editForm.name, slug: generatedId });
                    setSubcategories([...subcategories, res]);
                } else if (editingItem.type === 'partItem') {
                    res = await createPartItem({ id: generatedId, subcategoryId: selectedSubcategoryId, name: editForm.name, slug: generatedId });
                    setPartItems([...partItems, res]);
                }
            } else {
                // Update
                if (editingItem.type === 'brand') {
                    const res = await updateBrand(editingItem.id, { name: editForm.name });
                    setBrands(brands.map(b => b.id === res.id ? res : b));
                } else if (editingItem.type === 'model') {
                    const res = await updateModel(editingItem.id, { name: editForm.name, years: editForm.years, series: editForm.series });
                    setModels(models.map(m => m.id === res.id ? res : m));
                } else if (editingItem.type === 'category') {
                    const res = await updateCategory(editingItem.id, { name: editForm.name });
                    setCategories(categories.map(c => c.id === res.id ? res : c));
                } else if (editingItem.type === 'subcategory') {
                    const res = await updateSubcategory(editingItem.id, { name: editForm.name });
                    setSubcategories(subcategories.map(s => s.id === res.id ? res : s));
                } else if (editingItem.type === 'partItem') {
                    const res = await updatePartItem(editingItem.id, { name: editForm.name });
                    setPartItems(partItems.map(p => p.id === res.id ? res : p));
                }
            }
            cancelEditing();
        } catch (e: any) {
            alert("Hiba mentés közben! " + e.message);
        }
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm("Biztosan törölni szeretnéd ezt az elemet? Ezt nem lehet visszavonni!")) return;

        try {
            if (type === 'brand') {
                await deleteBrand(id);
                setBrands(brands.filter(b => b.id !== id));
            } else if (type === 'model') {
                await deleteModel(id);
                setModels(models.filter(m => m.id !== id));
            } else if (type === 'category') {
                await deleteCategory(id);
                setCategories(categories.filter(c => c.id !== id));
            } else if (type === 'subcategory') {
                await deleteSubcategory(id);
                setSubcategories(subcategories.filter(s => s.id !== id));
            } else if (type === 'partItem') {
                await deletePartItem(id);
                setPartItems(partItems.filter(p => p.id !== id));
            }
        } catch (e: any) {
            alert("Sikertelen törlés (valószínűleg más adatok hivatkoznak még rá az adatbázisban). " + e.message);
        }
    };

    // Generic List Renderer
    const renderList = (
        title: string, type: string, 
        items: any[], 
        activeId: string | null, 
        onSelect: (id: string) => void, 
        extraFields: {name: string, label: string}[] = []
    ) => {
        return (
            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">{title} ({items.length})</h2>
                    <button 
                        onClick={() => startEditing(type, { id: 'NEW', name: '' })}
                        className="text-xs bg-[var(--color-primary)] text-white px-2 py-1 rounded-md font-bold flex items-center gap-1 hover:bg-orange-600 transition-colors"
                    >
                        <Plus className="w-3 h-3" /> Új
                    </button>
                </div>
                
                <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {editingItem?.id === 'NEW' && editingItem.type === type && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg shadow-sm space-y-2 mb-2">
                            <input autoFocus placeholder="Név..." value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
                            {extraFields.map(field => (
                                <input key={field.name} placeholder={field.label} value={editForm[field.name] || ''} onChange={e => setEditForm({...editForm, [field.name]: e.target.value})} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
                            ))}
                            <div className="flex gap-2">
                                <button onClick={handleSave} className="flex-1 bg-green-500 text-white py-1 rounded text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3 h-3"/> Mentés</button>
                                <button onClick={cancelEditing} className="flex-1 bg-gray-200 text-gray-700 py-1 rounded text-xs font-bold flex items-center justify-center gap-1"><X className="w-3 h-3"/> Mégse</button>
                            </div>
                        </div>
                    )}

                    {items.map(item => (
                        <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${activeId === item.id ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30' : 'hover:bg-gray-50 border border-transparent'}`}>
                            {editingItem?.id === item.id && editingItem?.type === type ? (
                                <div className="flex-1 flex items-center gap-2">
                                    <input autoFocus value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="flex-1 px-2 py-1 border border-[var(--color-primary)] rounded text-sm" />
                                    <button onClick={handleSave} className="text-green-600 hover:bg-green-100 p-1 rounded"><Save className="w-4 h-4"/></button>
                                    <button onClick={cancelEditing} className="text-gray-400 hover:bg-gray-100 p-1 rounded"><X className="w-4 h-4"/></button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 min-w-0 pr-2" onClick={() => onSelect(item.id)}>
                                        <p className={`text-sm truncate font-medium ${activeId === item.id ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>{item.name} {item.years && <span className="text-gray-400 font-normal text-xs ml-1">({item.years})</span>}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={(e) => { e.stopPropagation(); startEditing(type, item); }} className="text-gray-400 hover:text-[var(--color-primary)] p-1 rounded transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(type, item.id); }} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                                        <ChevronRight className={`w-4 h-4 ml-1 ${activeId === item.id ? 'text-[var(--color-primary)]' : 'text-gray-300'}`} />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-center text-sm text-gray-400 py-8 italic">Nincs adat</p>}
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-6">
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
                <button 
                    onClick={() => setActiveTab("vehicles")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "vehicles" ? "bg-[var(--color-primary)] text-white shadow-md shadow-orange-500/20" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
                >
                    <Car className="w-4 h-4" />
                    Márkák és Modellek
                </button>
                <button 
                    onClick={() => setActiveTab("parts")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "parts" ? "bg-[var(--color-primary)] text-white shadow-md shadow-orange-500/20" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
                >
                    <Layers className="w-4 h-4" />
                    Kategóriák és Alkatrészek
                </button>
            </div>

            {/* Vehicles Layout */}
            {activeTab === "vehicles" && (
                <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {renderList("Autómárkák", "brand", brands, selectedBrandId, setSelectedBrandId)}
                    
                    {selectedBrandId ? (
                        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[600px] w-full md:w-2/3">
                            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                                <h2 className="font-bold text-gray-800">{brands.find(b => b.id === selectedBrandId)?.name} Modellek ({models.filter(m => m.brandId === selectedBrandId).length})</h2>
                                <button 
                                    onClick={() => startEditing('model', { id: 'NEW', name: '', series: '', years: '' })}
                                    className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-md font-bold flex items-center gap-1 hover:bg-orange-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Új Modell
                                </button>
                            </div>
                            
                            <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {editingItem?.id === 'NEW' && editingItem.type === 'model' && (
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg shadow-sm space-y-3 mb-4">
                                        <h3 className="font-bold text-sm text-orange-900 mb-1 border-b border-orange-200 pb-1">Új Modell Létrehozása</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-orange-800 uppercase">Modell neve *</label>
                                                <input autoFocus placeholder="pl. A4" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-inner"/>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-orange-800 uppercase">Főcím / Kategória</label>
                                                <input placeholder="pl. Középkategória" value={editForm.series || ''} onChange={e => setEditForm({...editForm, series: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-inner"/>
                                            </div>
                                            <div className="space-y-1 md:col-span-2">
                                                <label className="text-[10px] font-bold text-orange-800 uppercase">Évjárat</label>
                                                <input placeholder="pl. 2004-2008" value={editForm.years || ''} onChange={e => setEditForm({...editForm, years: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-inner"/>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button onClick={handleSave} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors"><Save className="w-4 h-4"/> Mentés</button>
                                            <button onClick={cancelEditing} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors"><X className="w-4 h-4"/> Mégse</button>
                                        </div>
                                    </div>
                                )}

                                {Object.entries(
                                    models.filter(m => m.brandId === selectedBrandId).reduce((acc: any, model) => {
                                        const series = model.series || "Egyéb modellek";
                                        if (!acc[series]) acc[series] = [];
                                        acc[series].push(model);
                                        return acc;
                                    }, {})
                                ).map(([seriesName, seriesModels]: [string, any]) => (
                                    <div key={seriesName} className="border border-gray-200 rounded-xl overflow-hidden mb-4 shadow-sm">
                                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                                            <h3 className="font-bold text-gray-700 uppercase tracking-wider text-xs">{seriesName}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-white text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200">{seriesModels.length} modell</span>
                                                <button 
                                                    title={`Új modell hozzáadása ide: ${seriesName}`}
                                                    onClick={() => startEditing('model', { id: 'NEW', name: '', series: seriesName === 'Egyéb modellek' ? '' : seriesName, years: '' })}
                                                    className="text-gray-500 hover:text-[var(--color-primary)] hover:bg-orange-50 p-1 rounded transition-colors"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {seriesModels.map((item: any) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 group">
                                                    {editingItem?.id === item.id && editingItem?.type === 'model' ? (
                                                        <div className="flex-1 bg-orange-50 border border-orange-200 p-3 rounded-lg flex flex-col gap-3 my-1">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <input autoFocus placeholder="Neve" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="flex-1 px-3 py-1.5 border border-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none rounded-md text-sm shadow-inner" />
                                                                <input placeholder="Főcím/Kategória (Series)" value={editForm.series || ''} onChange={e => setEditForm({...editForm, series: e.target.value})} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-inner" />
                                                                <input placeholder="Évjárat" value={editForm.years || ''} onChange={e => setEditForm({...editForm, years: e.target.value})} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-inner md:col-span-2" />
                                                            </div>
                                                            <div className="flex gap-2 justify-end mt-1">
                                                                <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-xs font-bold flex gap-1 items-center"><Save className="w-3.5 h-3.5"/> Mentés</button>
                                                                <button onClick={cancelEditing} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-md text-xs font-bold flex gap-1 items-center"><X className="w-3.5 h-3.5"/> Mégse</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                                {item.years && <p className="text-xs text-gray-500 mt-0.5">{item.years}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                <button onClick={() => startEditing('model', item)} className="bg-white border border-gray-200 text-gray-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] p-1.5 rounded-md shadow-sm transition-all"><Edit2 className="w-4 h-4"/></button>
                                                                <button onClick={() => handleDelete('model', item.id)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-500 p-1.5 rounded-md shadow-sm transition-all"><Trash2 className="w-4 h-4"/></button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {models.filter(m => m.brandId === selectedBrandId).length === 0 && <p className="text-center text-sm text-gray-400 py-12 italic">Nincsenek modellek ehhez a márkához</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center flex-col text-gray-400 h-[600px]">
                            <Car className="w-12 h-12 mb-4 opacity-20" />
                            <p>Válassz ki egy márkát a bal oldali listából</p>
                            <p>a modellek megjelenítéséhez és szerkesztéséhez!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Parts Layout */}
            {activeTab === "parts" && (
                <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {renderList("Főkategóriák", "category", categories, selectedCategoryId, (id) => { setSelectedCategoryId(id); setSelectedSubcategoryId(null); })}
                    
                    {selectedCategoryId ? (
                        renderList(
                            "Alkategóriák", 
                            "subcategory", 
                            subcategories.filter(s => s.categoryId === selectedCategoryId), 
                            selectedSubcategoryId, 
                            setSelectedSubcategoryId
                        )
                    ) : (
                        <div className="flex-1 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 h-[600px]">
                            <p>Válassz főkategóriát...</p>
                        </div>
                    )}

                    {selectedSubcategoryId ? (
                        renderList(
                            "Konkrét Alkatrészek", 
                            "partItem", 
                            partItems.filter(p => p.subcategoryId === selectedSubcategoryId), 
                            null, 
                            () => {}
                        )
                    ) : (
                        <div className="flex-1 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 h-[600px]">
                            <p>Válassz alkategóriát...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
