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
