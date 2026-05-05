"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const phone_normalizer_1 = require("../../src/lambdas/vanity-generator/phone-normalizer");
describe('phone normalizer', () => {
    it('removes non-digit characters', () => {
        expect((0, phone_normalizer_1.normalizePhoneNumber)('+1 (555) 123-4567')).toBe('15551234567');
    });
    it('gets the last seven digits', () => {
        expect((0, phone_normalizer_1.getLastSevenDigits)('15551234567')).toBe('1234567');
    });
    it('masks the phone number for dashboard display', () => {
        expect((0, phone_normalizer_1.maskPhoneNumber)('+1 (555) 123-4567')).toBe('***-***-4567');
    });
    it('throws for invalid phone numbers', () => {
        expect(() => (0, phone_normalizer_1.normalizePhoneNumber)('123')).toThrow('Phone number must contain at least 7 digits');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGhvbmUtbm9ybWFsaXplci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGhvbmUtbm9ybWFsaXplci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMEZBSTZEO0FBRTdELFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7SUFDaEMsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtRQUN0QyxNQUFNLENBQUMsSUFBQSx1Q0FBb0IsRUFBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hFLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtRQUNwQyxNQUFNLENBQUMsSUFBQSxxQ0FBa0IsRUFBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1RCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw4Q0FBOEMsRUFBRSxHQUFHLEVBQUU7UUFDdEQsTUFBTSxDQUFDLElBQUEsa0NBQWUsRUFBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3BFLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtRQUMxQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBQSx1Q0FBb0IsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FDL0MsNkNBQTZDLENBQzlDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgbm9ybWFsaXplUGhvbmVOdW1iZXIsXG4gIGdldExhc3RTZXZlbkRpZ2l0cyxcbiAgbWFza1Bob25lTnVtYmVyXG59IGZyb20gJy4uLy4uL3NyYy9sYW1iZGFzL3Zhbml0eS1nZW5lcmF0b3IvcGhvbmUtbm9ybWFsaXplcic7XG5cbmRlc2NyaWJlKCdwaG9uZSBub3JtYWxpemVyJywgKCkgPT4ge1xuICBpdCgncmVtb3ZlcyBub24tZGlnaXQgY2hhcmFjdGVycycsICgpID0+IHtcbiAgICBleHBlY3Qobm9ybWFsaXplUGhvbmVOdW1iZXIoJysxICg1NTUpIDEyMy00NTY3JykpLnRvQmUoJzE1NTUxMjM0NTY3Jyk7XG4gIH0pO1xuXG4gIGl0KCdnZXRzIHRoZSBsYXN0IHNldmVuIGRpZ2l0cycsICgpID0+IHtcbiAgICBleHBlY3QoZ2V0TGFzdFNldmVuRGlnaXRzKCcxNTU1MTIzNDU2NycpKS50b0JlKCcxMjM0NTY3Jyk7XG4gIH0pO1xuXG4gIGl0KCdtYXNrcyB0aGUgcGhvbmUgbnVtYmVyIGZvciBkYXNoYm9hcmQgZGlzcGxheScsICgpID0+IHtcbiAgICBleHBlY3QobWFza1Bob25lTnVtYmVyKCcrMSAoNTU1KSAxMjMtNDU2NycpKS50b0JlKCcqKiotKioqLTQ1NjcnKTtcbiAgfSk7XG5cbiAgaXQoJ3Rocm93cyBmb3IgaW52YWxpZCBwaG9uZSBudW1iZXJzJywgKCkgPT4ge1xuICAgIGV4cGVjdCgoKSA9PiBub3JtYWxpemVQaG9uZU51bWJlcignMTIzJykpLnRvVGhyb3coXG4gICAgICAnUGhvbmUgbnVtYmVyIG11c3QgY29udGFpbiBhdCBsZWFzdCA3IGRpZ2l0cydcbiAgICApO1xuICB9KTtcbn0pOyJdfQ==