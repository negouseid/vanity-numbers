import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoVanityResultWriter } from '../../src/lambdas/vanity-generator/storage';

describe('DynamoDB vanity result writer', () => {
  it('writes caller and vanity result details to DynamoDB', async () => {
    const send = jest.fn().mockResolvedValue({});
    const writer = createDynamoVanityResultWriter('VanityResultsTable', {
      send
    });

    await writer.save({
      contactId: 'test-contact-001',
      callerNumber: '+18003569377',
      normalizedCallerNumber: '18003569377',
      callerNumberMasked: '***-***-9377',
      createdAt: '2026-05-04T20:00:00.000Z',
      vanityNumbers: [
        {
          displayValue: '800-FLOWERS',
          suffix: 'FLOWERS',
          score: 3090,
          matchedWords: ['FLOWERS'],
          reason: 'matched words: FLOWERS'
        },
        {
          displayValue: '800-FLOWERQ',
          suffix: 'FLOWERQ',
          score: 1930,
          matchedWords: ['FLOWER'],
          reason: 'matched words: FLOWER'
        }
      ]
    });

    expect(send).toHaveBeenCalledWith(expect.any(PutCommand));
    expect(send.mock.calls[0][0].input).toEqual({
      TableName: 'VanityResultsTable',
      Item: {
        contactId: 'test-contact-001',
        callerNumber: '+18003569377',
        normalizedCallerNumber: '18003569377',
        callerNumberMasked: '***-***-9377',
        createdAt: '2026-05-04T20:00:00.000Z',
        recentCallsPartition: 'RECENT_CALLS',
        topThreeVanityNumbers: ['800-FLOWERS', '800-FLOWERQ'],
        vanityNumbers: [
          {
            rank: 1,
            displayValue: '800-FLOWERS',
            suffix: 'FLOWERS',
            score: 3090,
            matchedWords: ['FLOWERS'],
            reason: 'matched words: FLOWERS'
          },
          {
            rank: 2,
            displayValue: '800-FLOWERQ',
            suffix: 'FLOWERQ',
            score: 1930,
            matchedWords: ['FLOWER'],
            reason: 'matched words: FLOWER'
          }
        ]
      }
    });
  });

  it('requires a table name', () => {
    expect(() => createDynamoVanityResultWriter('')).toThrow(
      'VANITY_RESULTS_TABLE_NAME is required'
    );
  });
});
