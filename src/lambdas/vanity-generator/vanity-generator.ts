import { scoreVanityCandidate, ScoreResult } from './scorer';

const DIGIT_TO_LETTERS: Record<string, string[]> = {
  '0': ['0'],
  '1': ['1'],
  '2': ['A', 'B', 'C'],
  '3': ['D', 'E', 'F'],
  '4': ['G', 'H', 'I'],
  '5': ['J', 'K', 'L'],
  '6': ['M', 'N', 'O'],
  '7': ['P', 'Q', 'R', 'S'],
  '8': ['T', 'U', 'V'],
  '9': ['W', 'X', 'Y', 'Z']
};

export type VanityNumberResult = {
  displayValue: string;
  suffix: string;
  score: number;
  matchedWords: string[];
  reason: string;
};

export function generateTopVanityNumbers(
  normalizedDigits: string,
  limit = 5
): VanityNumberResult[] {
  if (!/^\d+$/.test(normalizedDigits)) {
    throw new Error('Phone number must contain only digits after normalization');
  }

  if (normalizedDigits.length < 7) {
    throw new Error('Phone number must contain at least 7 digits');
  }

  const lastSevenDigits = normalizedDigits.slice(-7);
  const combinations = generateLetterCombinations(lastSevenDigits);

  const scoredCandidates = combinations
    .map((suffix) => {
      const scoreResult = scoreVanityCandidate(suffix);

      return toVanityNumberResult(normalizedDigits, suffix, scoreResult);
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.suffix.localeCompare(b.suffix);
    });

  return dedupeByDisplayValue(scoredCandidates).slice(0, limit);
}

export function generateLetterCombinations(digits: string): string[] {
  if (!/^\d+$/.test(digits)) {
    throw new Error('Digits input must contain only numbers');
  }

  return digits.split('').reduce<string[]>((combinations, digit) => {
    const letters = DIGIT_TO_LETTERS[digit];

    if (!letters) {
      throw new Error(`Unsupported digit: ${digit}`);
    }

    const nextCombinations: string[] = [];

    for (const existing of combinations) {
      for (const letter of letters) {
        nextCombinations.push(`${existing}${letter}`);
      }
    }

    return nextCombinations;
  }, ['']);
}

function toVanityNumberResult(
  normalizedDigits: string,
  suffix: string,
  scoreResult: ScoreResult
): VanityNumberResult {
  return {
    displayValue: formatVanityNumber(normalizedDigits, suffix),
    suffix,
    score: scoreResult.score,
    matchedWords: scoreResult.matchedWords,
    reason: scoreResult.reason
  };
}

function formatVanityNumber(normalizedDigits: string, suffix: string): string {
  const formattedSuffix = formatSuffix(suffix);

  if (normalizedDigits.length === 11 && normalizedDigits.startsWith('1')) {
    const areaCode = normalizedDigits.slice(1, 4);
    return `${areaCode}-${formattedSuffix}`;
  }

  if (normalizedDigits.length === 10) {
    const areaCode = normalizedDigits.slice(0, 3);
    return `${areaCode}-${formattedSuffix}`;
  }

  const prefix = normalizedDigits.slice(0, -7);

  if (prefix.length > 0) {
    return `${prefix}-${formattedSuffix}`;
  }

  return formattedSuffix;
}

function formatSuffix(suffix: string): string {
  if (/^[A-Z]{7}$/.test(suffix)) {
    return suffix;
  }

  if (suffix.length === 7) {
    return `${suffix.slice(0, 3)}-${suffix.slice(3)}`;
  }

  return suffix;
}

function dedupeByDisplayValue(
  candidates: VanityNumberResult[]
): VanityNumberResult[] {
  const seen = new Set<string>();
  const results: VanityNumberResult[] = [];

  for (const candidate of candidates) {
    if (!seen.has(candidate.displayValue)) {
      seen.add(candidate.displayValue);
      results.push(candidate);
    }
  }

  return results;
}