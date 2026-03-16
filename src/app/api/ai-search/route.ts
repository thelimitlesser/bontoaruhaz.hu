import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
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
  "sku": "specific part number if found" | null,
  "is_broad": boolean // Set to true if ONLY a series name (e.g. "Audi A6") is provided without a generation code (e.g. "C6", "4F")
}

Strict Rules:
1. If the user mentions a specific generation/chassis (e.g. "C6", "Mk4", "B8", "2012-es"), use that in 'model'.
2. If the user is broad (e.g. "Audi A6 ajtó", "VW Golf váltó"), set 'model' to ONLY the series name (e.g. "A6", "Golf") and 'is_broad' to true.
3. DO NOT guess a generation if it's not explicitly in the query. For broad queries, keep 'model' simple.`;

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

        // Rate Limiting
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "anonymous";
        const limiter = rateLimit(ip, 10, 60000); // 10 requests per minute

        if (!limiter.success) {
            return NextResponse.json(
                { error: "Túl sok kérés. Kérjük próbálja újra később." },
                { 
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": "10",
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": limiter.reset.toString()
                    }
                }
            );
        }

        console.log("AI Search API triggered for:", query);

        const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });

        console.log("Calling Gemini API...");
        const result = await generateWithRetry(model, systemInstruction + "\n\nKeresés: " + query);
        console.log("Gemini API replied:", result?.response?.text());

        if (!result) throw new Error("No response from AI");

        const parsedResult = JSON.parse(result.response.text());
        console.log("Parsed result:", parsedResult);

        // Helper for weighted matching
        function findBestMatch(list: any[], query: string) {
            if (!query) return null;
            const q = query.toLowerCase();

            let best = null;
            let bestScore = -1;

            for (const item of list) {
                let score = 0;
                const name = item.name.toLowerCase();
                const slug = item.slug.toLowerCase();
                const keywords = item.keywords?.map((k: string) => k.toLowerCase()) || [];

                if (name === q || slug === q) score = 100;
                else if (name.startsWith(q)) score = 80;
                else if (name.includes(q)) score = 60;
                else if (keywords.includes(q)) score = 40;
                else if (keywords.some((k: string) => k.includes(q))) score = 20;

                if (score > bestScore) {
                    bestScore = score;
                    best = item;
                }
            }
            return bestScore > 0 ? best : null;
        }

        // 1. BRAND MATCHING
        const matchedBrand = findBestMatch(brands.filter(b => !b.hidden), parsedResult.brand);
        let finalBrand = matchedBrand?.slug || null;

        // 2. MODEL MATCHING (Specific to Brand)
        let finalModel = null;
        let isBroad = parsedResult.is_broad || false;

        if (parsedResult.model && finalBrand) {
            const bId = brands.find(b => b.slug === finalBrand)?.id;
            const availableModels = models.filter(m => m.brandId === bId);
            const matchedModel = findBestMatch(availableModels, parsedResult.model);
            finalModel = matchedModel?.slug || null;

            // Double check for broadness if matched part of a series
            if (matchedModel) {
                const sameSeries = availableModels.filter(m => m.series === matchedModel.series);

                // If it's a series with multiple generations, and the user's model query 
                // doesn't contain the generation-specific identifiers from the matched name
                const matchedNameClean = matchedModel.name.toLowerCase().replace(/[()]/g, '');
                const aiModelClean = parsedResult.model.toLowerCase();

                if (sameSeries.length > 1) {
                    // If AI returned a very short model (like "A6", "Golf") it's definitely broad
                    if (aiModelClean.length <= matchedModel.series.length + 2) {
                        isBroad = true;
                    }
                    // Or if AI returned a specific one but original query was generic
                    else if (!aiModelClean.includes(matchedNameClean) && !query.toLowerCase().includes(matchedNameClean)) {
                        isBroad = true;
                    }
                }
            }
        }

        // 3. HIERARCHICAL PART MATCHING (Look for best overall fit)
        let finalCategory = null;
        let finalSubcategory = null;
        let finalItem = null;

        const matchedItemObj = findBestMatch(partItems, parsedResult.item);
        const matchedSubObj = findBestMatch(subcategories, parsedResult.subcategory || parsedResult.item); // Fallback to item if subcat missing
        const matchedCatObj = findBestMatch(categories, parsedResult.category || parsedResult.subcategory || parsedResult.item);

        if (matchedItemObj) {
            finalItem = matchedItemObj.slug;
            const sub = subcategories.find(s => s.id === matchedItemObj.subcategoryId);
            if (sub) {
                finalSubcategory = sub.slug;
                const cat = categories.find(c => c.id === sub.categoryId);
                if (cat) finalCategory = cat.slug;
            }
        } else if (matchedSubObj) {
            finalSubcategory = matchedSubObj.slug;
            const cat = categories.find(c => c.id === matchedSubObj.categoryId);
            if (cat) finalCategory = cat.slug;
        } else if (matchedCatObj) {
            finalCategory = matchedCatObj.slug;
        }

        // Special case: Search query might lead to a category/subcat directly if AI missed it
        if (!finalCategory && !finalSubcategory && parsedResult.query) {
            const matchedSub = findBestMatch(subcategories, parsedResult.query);
            if (matchedSub) {
                finalSubcategory = matchedSub.slug;
                const cat = categories.find(c => c.id === matchedSub.categoryId);
                if (cat) finalCategory = cat.slug;
            }
        }

        return NextResponse.json({
            ...parsedResult,
            isBroad,
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
