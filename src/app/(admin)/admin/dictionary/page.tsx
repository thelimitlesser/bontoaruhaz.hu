export const dynamic = "force-dynamic";
import { getBrands, getModels, getCategories, getSubcategories, getPartItems } from "@/app/actions/dictionary";
import { DictionaryEditor } from "./dictionary-editor";

export const metadata = {
    title: "Szótárak & Kategóriák - BONTÓÁRUHÁZ",
};

export default async function DictionaryPage() {
    // Fő adatstruktúrák kinyerése
    const brands = await getBrands();
    const categories = await getCategories();
    
    // Al-adatstruktúrák kinyerése (a kezdőállapot miatt minden modellt és alkatrészt letöltünk, 
    // mivel ez admin felület, kibírja a pár ezer sort)
    const models = await getModels();
    const subcategories = await getSubcategories();
    const partItems = await getPartItems();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Szótárak & Kategóriák</h1>
                <p className="text-gray-500 text-sm">
                    Az itt szerkesztett adatok az egész weboldalon (keresőben, termék feltöltésnél) valós időben frissülnek.
                </p>
            </div>

            <DictionaryEditor 
                initialBrands={brands}
                initialModels={models}
                initialCategories={categories}
                initialSubcategories={subcategories}
                initialPartItems={partItems}
            />
        </div>
    );
}
