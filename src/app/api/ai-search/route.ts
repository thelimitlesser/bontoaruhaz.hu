import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { categories, partsSubcategories as subcategories, partItems, brands, models } from "@/lib/vehicle-data";

// Initialize Gemini Client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const systemInstruction = `You are an expert car parts search assistant for BONTÓÁRUHÁZ.
Your goal is to parse user queries (typos, slang, or codes) and map them to technical metadata.

Mapping Rules:
1. **Technical IDs Recognition**:
   - If a query looks like a part number (e.g., "1K0907379") or a reference number (e.g., "HIV-24-001" or just "2345"), put it in \`searchTerm\`.
   - Mechanics often search by **Engine Code** (e.g., ASZ, M47, BKD). Match these to the provided model \`keywords\`.

2. **Platform Compatibility (Expert Suggestions)**:
   - Understand shared platforms:
     - **VAG Group**: Audi A3 (8L/8P) ≈ VW Golf IV/V ≈ Leon I/II ≈ Octavia I/II.
     - **PSA Group**: Peugeot 206/207 ≈ Citroen C2/C3.
     - **Toyota/Suzuki**: Swace ≈ Corolla, Across ≈ RAV4.
   - If one is mentioned, prefer that modelId, but keep context for potential matches across the group.

3. **Error Resilience**: Be forgiving with spellings (folksvagen, mercédesz).
4. **Output**: Hungarian terms. Always return valid JSON.

JSON Response Format:
{
  "brandId": string | null,
  "modelId": string | null,
  "categoryId": string | null,
  "subcategoryId": string | null,
  "searchTerm": string | null
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
                console.warn(`AI Search: Gemini busy/limited (attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
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

        const result = await generateWithRetry(model, systemInstruction + "\n\nKeresés:" + query);

        if (!result) throw new Error("No response from AI");

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

            // Refined matching: slug, name, or keywords
            const queryModel = String(parsedResult.model).toLowerCase();
            const m = availableModels.find(x =>
                x.slug.toLowerCase() === queryModel ||
                x.name.toLowerCase().includes(queryModel) ||
                queryModel.includes(x.name.toLowerCase()) ||
                x.keywords?.some(k => k.toLowerCase() === queryModel)
            );

            if (m) finalModelSlug = m.slug;
        }

        return NextResponse.json({
            ...parsedResult,
            brand: finalBrandSlug,
            model: finalModelSlug
        });
    } catch (error) {
        console.error("AI Search Error:", error);
        return NextResponse.json({ error: "Hiba az AI keresés során." }, { status: 500 });
    }
}
