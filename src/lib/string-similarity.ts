/**
 * Calculates the Levenshtein distance between two strings.
 * Higher value means more differences.
 */
export function getLevenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

/**
 * Calculates similarity as a percentage (0 to 1).
 */
export function getStringSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    if (longer.length === 0) return 1.0;

    const distance = getLevenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - distance) / longer.length;
}

/**
 * Deeply normalizes a string for comparison by removing accents, 
 * converting to lowercase, and removing all non-alphanumeric characters.
 */
export function simplifyString(str: string): string {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[űü]/g, "u")
        .replace(/[őö]/g, "o")
        .replace(/[^a-z0-9]/g, "");
}

/**
 * Checks if a target string matches a query with basic fuzzy logic:
 * 1. Checks if all words in the query exist in the target (order agnostic).
 * 2. Handles accent-insensitivity and special character tolerance via simplifyString.
 */
export function fuzzyMatch(target: string, query: string): boolean {
    if (!query) return true;
    if (!target) return false;

    const cleanQuery = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanTarget = target.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Try simple includes (fast path)
    if (cleanTarget.includes(cleanQuery)) return true;

    // 2. Try multi-word match (order agnostic)
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);
    if (queryWords.length > 1) {
        const allWordsMatch = queryWords.every(word => cleanTarget.includes(word));
        if (allWordsMatch) return true;
    }

    // 3. Try simplified deep match (typo tolerance for hyphens/slashes/spaces)
    const simpleQuery = simplifyString(query);
    const simpleTarget = simplifyString(target);
    if (simpleTarget.includes(simpleQuery)) return true;

    return false;
}

/**
 * Finds the closest matches from a dictionary.
 */
export function findClosestMatches(word: string, dictionary: string[], threshold = 0.7): { word: string, score: number }[] {
    if (!word || word.length < 3) return [];

    return dictionary
        .map(dictWord => ({
            word: dictWord,
            score: getStringSimilarity(word, dictWord)
        }))
        .filter(match => match.score >= threshold)
        .sort((a, b) => b.score - a.score);
}
