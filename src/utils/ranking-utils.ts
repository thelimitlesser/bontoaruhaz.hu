import { expandQueryWithSynonyms } from "./query-utils";
import { simplifyString } from "@/lib/string-similarity";

/**
 * Calculates a technical relevance score for a target string based on a query.
 * Used to rank search results professionally.
 */
export function calculateTechnicalScore(target: string, query: string, sku?: string | null, productCode?: string | null): number {
    if (!query) return 0;
    if (!target) return 0;

    const sTarget = simplifyString(target);
    const sQuery = simplifyString(query);
    const lTarget = target.toLowerCase();
    const lQuery = query.trim().toLowerCase();

    let score = 0;

    // 1. HIGHEST: Exact Code Match (1000 points)
    if (sku && simplifyString(sku) === sQuery) score += 1000;
    if (productCode && simplifyString(productCode) === sQuery) score += 1000;

    // 2. HIGH: Exact Name Match (500 points)
    if (sTarget === sQuery) {
        score += 500;
    } else if (sTarget.startsWith(sQuery)) {
        // Starts with match (300 points)
        score += 300;
    } else if (sTarget.includes(sQuery)) {
        // Contains match (150 points)
        score += 150;
    }

    // 3. Synonym Match (80 points)
    const expandedTerms = expandQueryWithSynonyms(query);
    // expandedTerms is string[][] (one array per query word)
    const forms = expandedTerms.flat();
    
    const hasSynonymMatch = forms.some(form => {
        const sForm = simplifyString(form);
        return sForm !== sQuery && sTarget.includes(sForm);
    });

    if (hasSynonymMatch) {
        score += 80;
    }

    // 4. Multi-word agnostic match bonus
    const queryWords = lQuery.split(/\s+/).filter(w => w.length > 0);
    if (queryWords.length > 1) {
        const allWordsMatch = queryWords.every(word => lTarget.includes(word));
        if (allWordsMatch) score += 50;
    }

    return score;
}
