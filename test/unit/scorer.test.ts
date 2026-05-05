import { scoreVanityCandidate } from '../../src/lambdas/vanity-generator/scorer';

describe('scorer', () => {
  it('scores dictionary words higher than random-looking candidates', () => {
    const wordResult = scoreVanityCandidate('FLOWERS');
    const randomResult = scoreVanityCandidate('DJMWDPP');

    expect(wordResult.score).toBeGreaterThan(randomResult.score);
    expect(wordResult.matchedWords).toContain('FLOWERS');
  });

  it('penalizes blocked words', () => {
    const result = scoreVanityCandidate('BADTEST');

    expect(result.score).toBeLessThan(0);
    expect(result.reason).toContain('blocked word');
  });
});