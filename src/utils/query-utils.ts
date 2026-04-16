import { partSynonyms } from "@/lib/search-synonyms";
import { simplifyString } from "@/lib/string-similarity";

/**
 * Takes a search query, splits it into words, and for each word
 * finds relevant synonyms if they exist.
 * Returns an array of arrays, where each sub-array is the [originalWord, ...synonyms]
 */
export function expandQueryWithSynonyms(query: string): string[][] {
    if (!query) return [];

    const words = query.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    return words.map(word => {
        const simplifiedWord = simplifyString(word);
        const forms = new Set<string>([word]);
        
        // Find synonyms for this word
        // We check both the original and the simplified version for matches in the dictionary
        Object.entries(partSynonyms).forEach(([key, synonyms]) => {
            const simplifiedKey = simplifyString(key);
            
            if (simplifiedKey === simplifiedWord || key.toLowerCase() === word.toLowerCase()) {
                synonyms.forEach(s => forms.add(s));
            }
        });
        
        return Array.from(forms);
    });
}
