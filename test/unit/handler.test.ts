import { createHandler } from '../../src/lambdas/vanity-generator/handler';
import { VanityResultWriter } from '../../src/lambdas/vanity-generator/storage';
import event from '../fixtures/connect-event.json';

describe('vanity generator handler', () => {
  const now = () => new Date('2026-05-04T20:00:00.000Z');

  function createMockWriter(): jest.Mocked<VanityResultWriter> {
    return {
      save: jest.fn().mockResolvedValue(undefined)
    };
  }

  it('returns top three vanity numbers for a valid Amazon Connect event', async () => {
    const writer = createMockWriter();
    const handler = createHandler({
      vanityResultWriter: writer,
      now
    });

    const result = await handler(event);

    expect(result.status).toBe('OK');
    expect(result.vanity1).toBe('800-FLOWERS');
    expect(result.vanity2).toBeDefined();
    expect(result.vanity3).toBeDefined();
    expect(result.callerNumberMasked).toBe('***-***-9377');
    expect(writer.save).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId: 'test-contact-001',
        callerNumber: '+18003569377',
        normalizedCallerNumber: '18003569377',
        callerNumberMasked: '***-***-9377',
        createdAt: '2026-05-04T20:00:00.000Z'
      })
    );
    expect(writer.save.mock.calls[0][0].vanityNumbers).toHaveLength(5);
    expect(writer.save.mock.calls[0][0].vanityNumbers[0].displayValue).toBe(
      '800-FLOWERS'
    );
  });

  it('returns an error when caller number is missing', async () => {
    const writer = createMockWriter();
    const handler = createHandler({
      vanityResultWriter: writer,
      now
    });

    const result = await handler({
      Details: {
        ContactData: {
          ContactId: 'test-contact-001',
          CustomerEndpoint: {}
        },
        Parameters: {}
      }
    });

    expect(result.status).toBe('ERROR');
    expect(writer.save).not.toHaveBeenCalled();
  });

  it('returns an error for malformed Amazon Connect events', async () => {
    const writer = createMockWriter();
    const handler = createHandler({
      vanityResultWriter: writer,
      now
    });

    const result = await handler({});

    expect(result).toEqual({
      status: 'ERROR',
      message: 'Missing contact ID or caller number'
    });
    expect(writer.save).not.toHaveBeenCalled();
  });

  it('returns an error when saving the vanity result fails', async () => {
    const writer = createMockWriter();
    writer.save.mockRejectedValue(new Error('DynamoDB write failed'));
    const handler = createHandler({
      vanityResultWriter: writer,
      now
    });

    const result = await handler(event);

    expect(result.status).toBe('ERROR');
    expect(result.message).toBe('DynamoDB write failed');
  });
});
