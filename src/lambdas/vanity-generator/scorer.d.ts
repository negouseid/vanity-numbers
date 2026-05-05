export type ScoreResult = {
    value: string;
    score: number;
    matchedWords: string[];
    reason: string;
};
export declare function scoreVanityCandidate(candidate: string): ScoreResult;
