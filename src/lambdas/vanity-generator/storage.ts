import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand
} from '@aws-sdk/lib-dynamodb';
import { VanityNumberResult } from './vanity-generator';

export type SaveVanityResultInput = {
  contactId: string;
  callerNumber: string;
  normalizedCallerNumber: string;
  callerNumberMasked: string;
  vanityNumbers: VanityNumberResult[];
  createdAt: string;
};

export type VanityResultWriter = {
  save(input: SaveVanityResultInput): Promise<void>;
};

type DynamoDocumentClient = {
  send(command: PutCommand): Promise<unknown>;
};

export function createDynamoVanityResultWriter(
  tableName: string,
  documentClient: DynamoDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({})
  )
): VanityResultWriter {
  if (!tableName) {
    throw new Error('VANITY_RESULTS_TABLE_NAME is required');
  }

  return {
    async save(input: SaveVanityResultInput): Promise<void> {
      await documentClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            contactId: input.contactId,
            callerNumber: input.callerNumber,
            normalizedCallerNumber: input.normalizedCallerNumber,
            callerNumberMasked: input.callerNumberMasked,
            vanityNumbers: input.vanityNumbers.map((vanityNumber, index) => ({
              rank: index + 1,
              displayValue: vanityNumber.displayValue,
              suffix: vanityNumber.suffix,
              score: vanityNumber.score,
              matchedWords: vanityNumber.matchedWords,
              reason: vanityNumber.reason
            })),
            topThreeVanityNumbers: input.vanityNumbers
              .slice(0, 3)
              .map((vanityNumber) => vanityNumber.displayValue),
            createdAt: input.createdAt,
            recentCallsPartition: 'RECENT_CALLS'
          }
        })
      );
    }
  };
}

export function createDynamoVanityResultWriterFromEnv(): VanityResultWriter {
  return createDynamoVanityResultWriter(
    process.env.VANITY_RESULTS_TABLE_NAME ?? ''
  );
}
