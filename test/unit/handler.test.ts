import { handler } from '../../src/lambdas/vanity-generator/handler';
import event from '../fixtures/connect-event.json';

describe('vanity generator handler', () => {
  it('returns top three vanity numbers for a valid Amazon Connect event', async () => {
    const result = await handler(event);

    expect(result.status).toBe('OK');
    expect(result.vanity1).toBe('800-FLOWERS');
    expect(result.vanity2).toBeDefined();
    expect(result.vanity3).toBeDefined();
    expect(result.callerNumberMasked).toBe('***-***-9377');
  });

  it('returns an error when caller number is missing', async () => {
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
  });
});