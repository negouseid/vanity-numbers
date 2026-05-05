import {
  generateLetterCombinations,
  generateTopVanityNumbers
} from '../../src/lambdas/vanity-generator/vanity-generator';

describe('vanity generator', () => {
  it('generates letter combinations from digits', () => {
    const combinations = generateLetterCombinations('23');

    expect(combinations).toContain('AD');
    expect(combinations).toContain('AE');
    expect(combinations).toContain('CF');
    expect(combinations).toHaveLength(9);
  });

  it('preserves 0 and 1 because they do not map to letters', () => {
    const combinations = generateLetterCombinations('10');

    expect(combinations).toEqual(['10']);
  });

  it('generates top vanity numbers from a normalized phone number', () => {
    const results = generateTopVanityNumbers('18003569377', 5);

    expect(results).toHaveLength(5);
    expect(results[0].displayValue).toBe('800-FLOWERS');
    expect(results[0].matchedWords).toContain('FLOWERS');
  });

  it('throws for invalid normalized digits', () => {
    expect(() => generateTopVanityNumbers('abc')).toThrow(
      'Phone number must contain only digits after normalization'
    );
  });
});