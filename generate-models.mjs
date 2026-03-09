import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local to get GEMINI_API_KEY
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const brands = [
    { id: "alfa-romeo", name: "Alfa Romeo" },
    { id: "audi", name: "Audi" },
    { id: "bmw", name: "BMW" },
    { id: "chevrolet", name: "Chevrolet" },
    { id: "citroen", name: "Citroën" },
    { id: "dacia", name: "Dacia" },
    { id: "daewoo", name: "Daewoo" },
    { id: "dodge", name: "Dodge" },
    { id: "fiat", name: "Fiat" },
    { id: "ford", name: "Ford" },
    { id: "honda", name: "Honda" },
    { id: "hyundai", name: "Hyundai" },
    { id: "infiniti", name: "Infiniti" },
    { id: "isuzu", name: "Isuzu" },
    { id: "iveco", name: "Iveco" },
    { id: "jaguar", name: "Jaguar" },
    { id: "jeep", name: "Jeep" },
    { id: "kia", name: "Kia" },
    { id: "lada", name: "Lada" },
    { id: "lancia", name: "Lancia" },
    { id: "land-rover", name: "Land Rover" },
    { id: "lexus", name: "Lexus" },
    { id: "mazda", name: "Mazda" },
    { id: "mercedes", name: "Mercedes" },
    { id: "mini", name: "Mini" },
    { id: "mitsubishi", name: "Mitsubishi" },
    { id: "nissan", name: "Nissan" },
    { id: "opel", name: "Opel" },
    { id: "peugeot", name: "Peugeot" },
    { id: "renault", name: "Renault" },
    { id: "saab", name: "Saab" },
    { id: "scania", name: "Scania" },
    { id: "seat", name: "Seat" },
    { id: "skoda", name: "Skoda" },
    { id: "smart", name: "Smart" },
    { id: "subaru", name: "Subaru" },
    { id: "suzuki", name: "Suzuki" },
    { id: "toyota", name: "Toyota" },
    { id: "volvo", name: "Volvo" },
    { id: "volkswagen", name: "Volkswagen" }
];

async function generateModelsForBrand(brand) {
    console.log(`Generating models for ${brand.name}...`);

    const prompt = `
Generate a highly detailed, professional list of car models and their specific generations with production years for the brand: ${brand.name}.
Target audience: A professional European auto parts marketplace.

Requirements:
1. Format output as a STRICT JSON array of objects. NO markdown formatting, just raw JSON.
2. Structure each object exactly like this:
{
  "id": "brandslug-modelslug-generation", 
  "brandId": "${brand.id}",
  "name": "ModelName (GenerationCode) StartYear-EndYear", // e.g. "3-as sorozat (E46) 1997-2006" or "Golf IV (1J) 1997-2003"
  "slug": "modelslug-generation", // e.g. "3-e46" or "golf-4"
  "series": "Model Series Name" // e.g. "3-as sorozat", "GOLF", "A4" for grouping
}
3. ONLY include the JSON array in your response, nothing else.
4. Focus heavily on models common in the European market from 1980 to present day.
5. Provide exhaustive generations (e.g., instead of just "Golf", list Golf I, Golf II, Golf III, Golf IV, Golf V, Golf VI, etc. with their respective years).
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const responseText = response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error(`Error generating for ${brand.name}:`, error);
        return null;
    }
}

async function main() {
    const allModels = [];

    // Batch processing to avoid rate limits (5 at a time)
    const batchSize = 5;
    for (let i = 0; i < brands.length; i += batchSize) {
        const batch = brands.slice(i, i + batchSize);
        const promises = batch.map(brand => generateModelsForBrand(brand));
        const results = await Promise.all(promises);

        results.forEach(result => {
            if (result && Array.isArray(result)) {
                allModels.push(...result);
            }
        });

        console.log(`Completed batch ${Math.ceil(i / batchSize) + 1}/${Math.ceil(brands.length / batchSize)}`);
        // Small delay between batches
        await new Promise(r => setTimeout(r, 2000));
    }

    await fs.writeFile('generated-models.json', JSON.stringify(allModels, null, 2));
    console.log(`Successfully generated ${allModels.length} models and saved to generated-models.json`);
}

main();
