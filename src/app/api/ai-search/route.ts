import { GoogleGenerativeAI } from"@google/generative-ai";
import { NextResponse } from"next/server";
import { categories, partsSubcategories as subcategories, partItems, brands, models } from"@/lib/vehicle-data";

// Initialize Gemini Client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const systemInstruction =` Te vagy a BONTÓÁRUHÁZ intelligens okoskereső asszisztense.
Feladatod: A felhasználó által beírt szabad szöveget elemezd, és alakítsd át strukturált JSON keresési paraméterekké.

SZIGORÚAN CSAK ÉRVÉNYES JSON-T VÁLASZOLHATSSZ.

### Adatbázisunk:
Márkák: ${brands.map(b => b.slug).join(',')}
Kategóriák: ${categories.map(c => c.slug).join(',')}

### JSON SÉMA:
{"brand":"márka slug vagy null","model":"modell neve vagy null","category":"főkategória slug vagy null","subcategory":"alkategória slug vagy null","item":"egyedi alkatrész slug vagy null","sku":"cikkszám vagy null","query":"maradék szöveg vagy null","explanation":"rövid magyarázat" }`;

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        if (!query) return NextResponse.json({ error:"No query" }, { status: 400 });

        const model = ai.getGenerativeModel({ model:"gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [{ role:"user", parts: [{ text: systemInstruction +"\n\nKeresés:" + query }] }],
            generationConfig: {
                responseMimeType:"application/json",
                temperature: 0.1,
            }
        });

        const response = result.response;
        const text = response.text();
        const parsedResult = JSON.parse(text);

        // Basic matching logic
        let finalBrandSlug = null;
        if (parsedResult.brand) {
            const b = brands.find(x => x.slug.toLowerCase() === parsedResult.brand.toLowerCase() || x.name.toLowerCase() === parsedResult.brand.toLowerCase());
            if (b) finalBrandSlug = b.slug;
        }

        let finalModelSlug = null;
        if (parsedResult.model && finalBrandSlug) {
            const brandId = brands.find(b => b.slug === finalBrandSlug)?.id;
            const availableModels = models.filter(m => m.brandId === brandId);
            const m = availableModels.find(x => x.slug.toLowerCase() === String(parsedResult.model).toLowerCase() || x.name.toLowerCase() === String(parsedResult.model).toLowerCase());
            if (m) finalModelSlug = m.slug;
        }

        return NextResponse.json({
            ...parsedResult,
            brand: finalBrandSlug,
            model: finalModelSlug
        });
    } catch (error) {
        console.error("AI Search Error:", error);
        return NextResponse.json({ error:"Hiba az AI keresés során." }, { status: 500 });
    }
}
