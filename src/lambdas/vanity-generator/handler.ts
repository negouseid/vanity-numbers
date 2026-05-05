import {
  maskPhoneNumber,
  normalizePhoneNumber
} from './phone-normalizer';
import { generateTopVanityNumbers } from './vanity-generator';
import {
  createDynamoVanityResultWriterFromEnv,
  VanityResultWriter
} from './storage';

export type ConnectEvent = {
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

export type ConnectResponse = {
  status: 'OK' | 'ERROR';
  vanity1?: string;
  vanity2?: string;
  vanity3?: string;
  callerNumberMasked?: string;
  message?: string;
};

type HandlerDependencies = {
  vanityResultWriter?: VanityResultWriter;
  now?: () => Date;
};

export function createHandler(dependencies: HandlerDependencies = {}) {
  return async function vanityGeneratorHandler(
    event: ConnectEvent
  ): Promise<ConnectResponse> {
    const now = dependencies.now ?? (() => new Date());

    try {
      const contactId = event.Details?.ContactData?.ContactId;
      const callerNumber =
        event.Details?.ContactData?.CustomerEndpoint?.Address;

      if (!contactId || !callerNumber) {
        return {
          status: 'ERROR',
          message: 'Missing contact ID or caller number'
        };
      }

      const normalizedDigits = normalizePhoneNumber(callerNumber);
      const callerNumberMasked = maskPhoneNumber(callerNumber);
      const vanityNumbers = generateTopVanityNumbers(normalizedDigits, 5);
      const writer =
        dependencies.vanityResultWriter ??
        createDynamoVanityResultWriterFromEnv();

      await writer.save({
        contactId,
        callerNumber,
        normalizedCallerNumber: normalizedDigits,
        callerNumberMasked,
        vanityNumbers,
        createdAt: now().toISOString()
      });

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
  };
}

export const handler = createHandler();
