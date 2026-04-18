import { simplifyString, fuzzyMatch } from '../src/lib/string-similarity.js';

function test(name, actual, expected) {
    if (actual === expected) {
        console.log(`✅ [PASS] ${name}`);
    } else {
        console.log(`❌ [FAIL] ${name}: Got ${actual}, expected ${expected}`);
    }
}

console.log("Testing simplifyString...");
test("Basic", simplifyString("Audi"), "audi");
test("Accents", simplifyString("Klíma nyomócső"), "klimanyomocso");
test("Special Chars", simplifyString("Ford S-Max II (Mk2)"), "fordsmaxiimk2");

console.log("\nTesting fuzzyMatch...");
test("Accent insensitivity", fuzzyMatch("Klíma nyomócső", "klima"), true);
test("Typo tolerance (hyphen)", fuzzyMatch("Focus II (Mk2)", "focus2"), true);
test("Multi-word agnostic order", fuzzyMatch("Klíma nyomócső", "nyomócso klima"), true);
test("Simplified match", fuzzyMatch("Ford S-Max", "smax"), true);
test("Partial match", fuzzyMatch("Volkswagen", "vw"), false); 
test("Mismatched words", fuzzyMatch("Audi A6", "Audi A4"), false);
