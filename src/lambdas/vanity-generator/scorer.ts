import { BLOCKED_WORDS, WORD_SCORES } from './dictionary';

export type ScoreResult = {
  value: string;
  score: number;
  matchedWords: string[];
  reason: string;
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export function scoreVanityCandidate(candidate: string): ScoreResult {
  const value = candidate.toUpperCase();
  let score = 0;
  const matchedWords: string[] = [];

  for (const blockedWord of BLOCKED_WORDS) {
    if (value.includes(blockedWord)) {
      return {
        value,
        score: -10000,
        matchedWords: [blockedWord],
        reason: `blocked word: ${blockedWord}`
      };
    }
  }

  for (const [word, wordScore] of Object.entries(WORD_SCORES)) {
    if (value.includes(word)) {
      matchedWords.push(word);

      score += wordScore;
      score += word.length * word.length * 10;

      if (value === word) {
        score += 600;
      }

      if (value.startsWith(word) || value.endsWith(word)) {
        score += 100;
      }
    }
  }

  const digitPenalty = (value.match(/[01]/g) ?? []).length * 75;
  score -= digitPenalty;

  const rareLetterPenalty = (value.match(/[QZX]/g) ?? []).length * 20;
  score -= rareLetterPenalty;

  const vowelCount = value.split('').filter((char) => VOWELS.has(char)).length;

  if (vowelCount > 0) {
    score += 50;
  }

  if (/[BCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(value)) {
    score -= 150;
  }

  if (matchedWords.length === 0) {
    score += basicPronounceabilityScore(value);
  }

  return {
    value,
    score,
    matchedWords,
    reason:
      matchedWords.length > 0
        ? `matched words: ${matchedWords.join(', ')}`
        : 'basic pronounceability score'
  };
}

function basicPronounceabilityScore(value: string): number {
  let score = 0;

  for (const char of value) {
    if (VOWELS.has(char)) {
      score += 8;
    } else if (/[A-Z]/.test(char)) {
      score += 3;
    }
  }

  return score;
}