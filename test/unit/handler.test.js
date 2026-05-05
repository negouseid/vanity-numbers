"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = require("../../src/lambdas/vanity-generator/handler");
const connect_event_json_1 = __importDefault(require("../fixtures/connect-event.json"));
describe('vanity generator handler', () => {
    it('returns top three vanity numbers for a valid Amazon Connect event', async () => {
        const result = await (0, handler_1.handler)(connect_event_json_1.default);
        expect(result.status).toBe('OK');
        expect(result.vanity1).toBe('800-FLOWERS');
        expect(result.vanity2).toBeDefined();
        expect(result.vanity3).toBeDefined();
        expect(result.callerNumberMasked).toBe('***-***-9377');
    });
    it('returns an error when caller number is missing', async () => {
        const result = await (0, handler_1.handler)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGFuZGxlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFtRDtBQUVuRCxRQUFRLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLEVBQUUsQ0FBQyxtRUFBbUUsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNqRixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsaUJBQU8sRUFBQyw0QkFBSyxDQUFDLENBQUM7UUFFcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDekQsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsZ0RBQWdELEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDOUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGlCQUFPLEVBQUM7WUFDM0IsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRTtvQkFDWCxTQUFTLEVBQUUsa0JBQWtCO29CQUM3QixnQkFBZ0IsRUFBRSxFQUFFO2lCQUNyQjtnQkFDRCxVQUFVLEVBQUUsRUFBRTthQUNmO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGhhbmRsZXIgfSBmcm9tICcuLi8uLi9zcmMvbGFtYmRhcy92YW5pdHktZ2VuZXJhdG9yL2hhbmRsZXInO1xuaW1wb3J0IGV2ZW50IGZyb20gJy4uL2ZpeHR1cmVzL2Nvbm5lY3QtZXZlbnQuanNvbic7XG5cbmRlc2NyaWJlKCd2YW5pdHkgZ2VuZXJhdG9yIGhhbmRsZXInLCAoKSA9PiB7XG4gIGl0KCdyZXR1cm5zIHRvcCB0aHJlZSB2YW5pdHkgbnVtYmVycyBmb3IgYSB2YWxpZCBBbWF6b24gQ29ubmVjdCBldmVudCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKGV2ZW50KTtcblxuICAgIGV4cGVjdChyZXN1bHQuc3RhdHVzKS50b0JlKCdPSycpO1xuICAgIGV4cGVjdChyZXN1bHQudmFuaXR5MSkudG9CZSgnODAwLUZMT1dFUlMnKTtcbiAgICBleHBlY3QocmVzdWx0LnZhbml0eTIpLnRvQmVEZWZpbmVkKCk7XG4gICAgZXhwZWN0KHJlc3VsdC52YW5pdHkzKS50b0JlRGVmaW5lZCgpO1xuICAgIGV4cGVjdChyZXN1bHQuY2FsbGVyTnVtYmVyTWFza2VkKS50b0JlKCcqKiotKioqLTkzNzcnKTtcbiAgfSk7XG5cbiAgaXQoJ3JldHVybnMgYW4gZXJyb3Igd2hlbiBjYWxsZXIgbnVtYmVyIGlzIG1pc3NpbmcnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaGFuZGxlcih7XG4gICAgICBEZXRhaWxzOiB7XG4gICAgICAgIENvbnRhY3REYXRhOiB7XG4gICAgICAgICAgQ29udGFjdElkOiAndGVzdC1jb250YWN0LTAwMScsXG4gICAgICAgICAgQ3VzdG9tZXJFbmRwb2ludDoge31cbiAgICAgICAgfSxcbiAgICAgICAgUGFyYW1ldGVyczoge31cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4cGVjdChyZXN1bHQuc3RhdHVzKS50b0JlKCdFUlJPUicpO1xuICB9KTtcbn0pOyJdfQ==