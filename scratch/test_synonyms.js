import { expandQueryWithSynonyms } from '../src/utils/query-utils.js';

function test(name, actual, expected) {
    const sActual = JSON.stringify(actual);
    const sExpected = JSON.stringify(expected);
    if (sActual === sExpected) {
        console.log(`✅ [PASS] ${name}`);
    } else {
        console.log(`❌ [FAIL] ${name}: Got ${sActual}, expected ${sExpected}`);
    }
}

console.log("Testing expandQueryWithSynonyms...");

// Simple word with synonyms
// Expected: [['lámpa', 'fényszóró', 'hátsólámpa', 'ködlámpa', 'irányjelző', 'index', 'világítás']]
const lampaResult = expandQueryWithSynonyms("lámpa");
test("Single word with synonyms", lampaResult.length > 0 && lampaResult[0].includes("fényszóró"), true);

// Word without synonyms
test("Word without synonyms", expandQueryWithSynonyms("valami"), [["valami"]]);

// Multi-word with one synonym
const multiResult = expandQueryWithSynonyms("lámpa focus");
test("Multi-word length", multiResult.length, 2);
test("Multi-word synonym expansion", multiResult[0].includes("fényszóró"), true);
test("Multi-word original preserved", multiResult[1], ["focus"]);

// Case and accent insensitivity
test("Accent insensitivity", expandQueryWithSynonyms("lampa")[0].includes("fényszóró"), true);
test("Case insensitivity", expandQueryWithSynonyms("LÁMPA")[0].includes("fényszóró"), true);
