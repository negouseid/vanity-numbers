export type VanityNumberResult = {
    displayValue: string;
    suffix: string;
    score: number;
    matchedWords: string[];
    reason: string;
};
export declare function generateTopVanityNumbers(normalizedDigits: string, limit?: number): VanityNumberResult[];
export declare function generateLetterCombinations(digits: string): string[];
