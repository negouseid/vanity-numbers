import {
  maskPhoneNumber,
  normalizePhoneNumber
} from './phone-normalizer';
import { generateTopVanityNumbers } from './vanity-generator';

type ConnectEvent = {
  Details?: {
    ContactData?: {
      ContactId?: string;
      CustomerEndpoint?: {
        Address?: string;
      };
    };
    Parameters?: Record<string, string>;
  };
};

type ConnectResponse = {
  status: 'OK' | 'ERROR';
  vanity1?: string;
  vanity2?: string;
  vanity3?: string;
  callerNumberMasked?: string;
  message?: string;
};

export async function handler(event: ConnectEvent): Promise<ConnectResponse> {
  try {
    const contactId = event.Details?.ContactData?.ContactId;
    const callerNumber = event.Details?.ContactData?.CustomerEndpoint?.Address;

    if (!contactId || !callerNumber) {
      return {
        status: 'ERROR',
        message: 'Missing contact ID or caller number'
      };
    }

    const normalizedDigits = normalizePhoneNumber(callerNumber);
    const callerNumberMasked = maskPhoneNumber(callerNumber);
    const vanityNumbers = generateTopVanityNumbers(normalizedDigits, 5);

    return {
      status: 'OK',
      vanity1: vanityNumbers[0]?.displayValue,
      vanity2: vanityNumbers[1]?.displayValue,
      vanity3: vanityNumbers[2]?.displayValue,
      callerNumberMasked
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return {
      status: 'ERROR',
      message
    };
  }
}