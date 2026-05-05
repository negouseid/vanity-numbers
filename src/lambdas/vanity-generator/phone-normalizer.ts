export function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (digits.length < 7) {
    throw new Error('Phone number must contain at least 7 digits');
  }

  return digits;
}

export function getLastSevenDigits(normalizedDigits: string): string {
  if (normalizedDigits.length < 7) {
    throw new Error('Phone number must contain at least 7 digits');
  }

  return normalizedDigits.slice(-7);
}

export function maskPhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (digits.length <= 4) {
    return '****';
  }

  const lastFour = digits.slice(-4);
  return `***-***-${lastFour}`;
}