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
                if (editingItem.type === 'brand') {
                    res = await createBrand({ id: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-'), name: editForm.name, slug: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-'), logo: '/brands/default.svg' });
                    setBrands([...brands, res]);
                } else if (editingItem.type === 'model') {
                    res = await createModel({ id: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-'), brandId: selectedBrandId, name: editForm.name, slug: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-') });
                    setModels([...models, res]);
                } else if (editingItem.type === 'category') {
                    res = await createCategory({ id: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-'), name: editForm.name, slug: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-') });
                    setCategories([...categories, res]);
                } else if (editingItem.type === 'subcategory') {
                    res = await createSubcategory({ id: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-'), categoryId: selectedCategoryId, name: editForm.name, slug: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-') });
                    setSubcategories([...subcategories, res]);
                } else if (editingItem.type === 'partItem') {
                    res = await createPartItem({ id: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-'), subcategoryId: selectedSubcategoryId, name: editForm.name, slug: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-') });
                    setPartItems([...partItems, res]);
                }
            } else {
                // Update
                if (editingItem.type === 'brand') {
                    const res = await updateBrand(editingItem.id, { name: editForm.name });
                    setBrands(brands.map(b => b.id === res.id ? res : b));
                } else if (editingItem.type === 'model') {
                    const res = await updateModel(editingItem.id, { name: editForm.name, years: editForm.years });
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
                                    <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100" style={{ opacity: activeId === item.id ? 1 : undefined }}>
                                        <button onClick={(e) => { e.stopPropagation(); startEditing(type, item); }} className="text-gray-400 hover:text-[var(--color-primary)] p-1 rounded"><Edit2 className="w-3.5 h-3.5"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(type, item.id); }} className="text-gray-400 hover:text-red-500 p-1 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
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

            {/* Vehichles Layout */}
            {activeTab === "vehicles" && (
                <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {renderList("Autómárkák", "brand", brands, selectedBrandId, setSelectedBrandId)}
                    
                    {selectedBrandId ? (
                        renderList(
                            `${brands.find(b => b.id === selectedBrandId)?.name} Modellek`, 
                            "model", 
                            models.filter(m => m.brandId === selectedBrandId), 
                            null, 
                            () => {},
                            [{ name: 'years', label: 'Évjárat (pl: 2004-2008)' }]
                        )
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
