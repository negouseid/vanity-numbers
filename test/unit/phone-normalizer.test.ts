import {
  normalizePhoneNumber,
  getLastSevenDigits,
  maskPhoneNumber
} from '../../src/lambdas/vanity-generator/phone-normalizer';

describe('phone normalizer', () => {
  it('removes non-digit characters', () => {
    expect(normalizePhoneNumber('+1 (555) 123-4567')).toBe('15551234567');
  });

  it('gets the last seven digits', () => {
    expect(getLastSevenDigits('15551234567')).toBe('1234567');
  });

  it('masks the phone number for dashboard display', () => {
    expect(maskPhoneNumber('+1 (555) 123-4567')).toBe('***-***-4567');
  });

  it('throws for invalid phone numbers', () => {
    expect(() => normalizePhoneNumber('123')).toThrow(
      'Phone number must contain at least 7 digits'
    );
  });
});