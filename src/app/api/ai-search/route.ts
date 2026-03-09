import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { categories, partsSubcategories as subcategories, partItems, brands, models } from "@/lib/vehicle-data";

// Initialize Gemini Client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const systemInstruction = `You are an expert car parts search assistant for BONTÓÁRUHÁZ.
Your goal is to parse user queries and map them to technical metadata.

JSON Response Format:
{
  "brand": "Alfa Romeo" | null,
  "model": "147" | null,
  "category": "Motor" | null,
  "subcategory": "Turbófeltöltő" | null,
  "item": "Turbó" | null,
  "query": "search term or SKU" | null,
  "sku": "specific part number if found" | null
}`;

async function generateWithRetry(model: any, prompt: string, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                }
            });
        } catch (error: any) {
            const isServiceUnavailable = error?.message?.includes("503") || error?.status === 503;
            const isRateLimit = error?.message?.includes("429") || error?.status === 429;

            if ((isServiceUnavailable || isRateLimit) && i < retries - 1) {
                console.warn(`AI Search: Gemini busy (attempt ${i + 1}/${retries}). Retrying...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            throw error;
        }
    }
}

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        if (!query) return NextResponse.json({ error: "No query" }, { status: 400 });

        const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });

        const result = await generateWithRetry(model, systemInstruction + "\n\nKeresés: " + query);

        if (!result) throw new Error("No response from AI");

        const parsedResult = JSON.parse(result.response.text());

        // 1. BRAND MATCHING
        let finalBrand = null;
        if (parsedResult.brand) {
            const b = brands.find(x =>
                x.slug.toLowerCase() === parsedResult.brand.toLowerCase() ||
                x.name.toLowerCase() === parsedResult.brand.toLowerCase()
            );
            if (b) finalBrand = b.slug;
        }

        // 2. MODEL MATCHING
        let finalModel = null;
        if (parsedResult.model && finalBrand) {
            const brandId = brands.find(b => b.slug === finalBrand)?.id;
            const availableModels = models.filter(m => m.brandId === brandId);
            const mQuery = String(parsedResult.model).toLowerCase();

            const m = availableModels.find(x =>
                x.slug.toLowerCase() === mQuery ||
                x.name.toLowerCase().includes(mQuery) ||
                mQuery.includes(x.name.toLowerCase()) ||
                x.keywords?.some(k => k.toLowerCase() === mQuery)
            );
            if (m) finalModel = m.slug;
        }

        // 3. CATEGORY MATCHING
        let finalCategory = null;
        if (parsedResult.category) {
            const cQuery = String(parsedResult.category).toLowerCase();
            const c = categories.find(x =>
                x.slug.toLowerCase() === cQuery ||
                x.name.toLowerCase().includes(cQuery) ||
                cQuery.includes(x.name.toLowerCase()) ||
                x.keywords?.some(k => k.toLowerCase().includes(cQuery))
            );
            if (c) finalCategory = c.slug;
        }

        // 4. SUBCATEGORY MATCHING
        let finalSubcategory = null;
        if (parsedResult.subcategory && finalCategory) {
            const catId = categories.find(c => c.slug === finalCategory)?.id;
            const availableSubs = subcategories.filter(s => s.categoryId === catId);
            const sQuery = String(parsedResult.subcategory).toLowerCase();

            const s = availableSubs.find(x =>
                x.slug.toLowerCase() === sQuery ||
                x.name.toLowerCase().includes(sQuery) ||
                sQuery.includes(x.name.toLowerCase()) ||
                x.keywords?.some(k => k.toLowerCase().includes(sQuery))
            );
            if (s) finalSubcategory = s.slug;
        }

        // 5. ITEM MATCHING
        let finalItem = null;
        if (parsedResult.item && finalSubcategory) {
            const subId = subcategories.find(s => s.slug === finalSubcategory)?.id;
            const availableItems = partItems.filter(p => p.subcategoryId === subId);
            const iQuery = String(parsedResult.item).toLowerCase();

            const i = availableItems.find(x =>
                x.slug.toLowerCase() === iQuery ||
                x.name.toLowerCase().includes(iQuery) ||
                iQuery.includes(x.name.toLowerCase()) ||
                x.keywords?.some(k => k.toLowerCase().includes(iQuery))
            );
            if (i) finalItem = i.slug;
        }

        return NextResponse.json({
            ...parsedResult,
            brand: finalBrand,
            model: finalModel,
            category: finalCategory,
            subcategory: finalSubcategory,
            item: finalItem,
            query: parsedResult.query || parsedResult.searchTerm || null
        });
    } catch (error) {
        console.error("AI Search Error:", error);
        return NextResponse.json({ error: "Hiba az AI keresés során." }, { status: 500 });
    }
}
