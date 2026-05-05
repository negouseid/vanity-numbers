"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const phone_normalizer_1 = require("./phone-normalizer");
const vanity_generator_1 = require("./vanity-generator");
async function handler(event) {
    try {
        const contactId = event.Details?.ContactData?.ContactId;
        const callerNumber = event.Details?.ContactData?.CustomerEndpoint?.Address;
        if (!contactId || !callerNumber) {
            return {
                status: 'ERROR',
                message: 'Missing contact ID or caller number'
            };
        }
        const normalizedDigits = (0, phone_normalizer_1.normalizePhoneNumber)(callerNumber);
        const callerNumberMasked = (0, phone_normalizer_1.maskPhoneNumber)(callerNumber);
        const vanityNumbers = (0, vanity_generator_1.generateTopVanityNumbers)(normalizedDigits, 5);
        return {
            status: 'OK',
            vanity1: vanityNumbers[0]?.displayValue,
            vanity2: vanityNumbers[1]?.displayValue,
            vanity3: vanityNumbers[2]?.displayValue,
            callerNumberMasked
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
            status: 'ERROR',
            message
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUEyQkEsMEJBK0JDO0FBMURELHlEQUc0QjtBQUM1Qix5REFBOEQ7QUF1QnZELEtBQUssVUFBVSxPQUFPLENBQUMsS0FBbUI7SUFDL0MsSUFBSSxDQUFDO1FBQ0gsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDO1FBQ3hELE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQztRQUUzRSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDaEMsT0FBTztnQkFDTCxNQUFNLEVBQUUsT0FBTztnQkFDZixPQUFPLEVBQUUscUNBQXFDO2FBQy9DLENBQUM7UUFDSixDQUFDO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLHVDQUFvQixFQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVELE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxrQ0FBZSxFQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3pELE1BQU0sYUFBYSxHQUFHLElBQUEsMkNBQXdCLEVBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFcEUsT0FBTztZQUNMLE1BQU0sRUFBRSxJQUFJO1lBQ1osT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZO1lBQ3ZDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWTtZQUN2QyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVk7WUFDdkMsa0JBQWtCO1NBQ25CLENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sT0FBTyxHQUFHLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUV6RSxPQUFPO1lBQ0wsTUFBTSxFQUFFLE9BQU87WUFDZixPQUFPO1NBQ1IsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgbWFza1Bob25lTnVtYmVyLFxuICBub3JtYWxpemVQaG9uZU51bWJlclxufSBmcm9tICcuL3Bob25lLW5vcm1hbGl6ZXInO1xuaW1wb3J0IHsgZ2VuZXJhdGVUb3BWYW5pdHlOdW1iZXJzIH0gZnJvbSAnLi92YW5pdHktZ2VuZXJhdG9yJztcblxudHlwZSBDb25uZWN0RXZlbnQgPSB7XG4gIERldGFpbHM/OiB7XG4gICAgQ29udGFjdERhdGE/OiB7XG4gICAgICBDb250YWN0SWQ/OiBzdHJpbmc7XG4gICAgICBDdXN0b21lckVuZHBvaW50Pzoge1xuICAgICAgICBBZGRyZXNzPzogc3RyaW5nO1xuICAgICAgfTtcbiAgICB9O1xuICAgIFBhcmFtZXRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICB9O1xufTtcblxudHlwZSBDb25uZWN0UmVzcG9uc2UgPSB7XG4gIHN0YXR1czogJ09LJyB8ICdFUlJPUic7XG4gIHZhbml0eTE/OiBzdHJpbmc7XG4gIHZhbml0eTI/OiBzdHJpbmc7XG4gIHZhbml0eTM/OiBzdHJpbmc7XG4gIGNhbGxlck51bWJlck1hc2tlZD86IHN0cmluZztcbiAgbWVzc2FnZT86IHN0cmluZztcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50OiBDb25uZWN0RXZlbnQpOiBQcm9taXNlPENvbm5lY3RSZXNwb25zZT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGNvbnRhY3RJZCA9IGV2ZW50LkRldGFpbHM/LkNvbnRhY3REYXRhPy5Db250YWN0SWQ7XG4gICAgY29uc3QgY2FsbGVyTnVtYmVyID0gZXZlbnQuRGV0YWlscz8uQ29udGFjdERhdGE/LkN1c3RvbWVyRW5kcG9pbnQ/LkFkZHJlc3M7XG5cbiAgICBpZiAoIWNvbnRhY3RJZCB8fCAhY2FsbGVyTnVtYmVyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXM6ICdFUlJPUicsXG4gICAgICAgIG1lc3NhZ2U6ICdNaXNzaW5nIGNvbnRhY3QgSUQgb3IgY2FsbGVyIG51bWJlcidcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3Qgbm9ybWFsaXplZERpZ2l0cyA9IG5vcm1hbGl6ZVBob25lTnVtYmVyKGNhbGxlck51bWJlcik7XG4gICAgY29uc3QgY2FsbGVyTnVtYmVyTWFza2VkID0gbWFza1Bob25lTnVtYmVyKGNhbGxlck51bWJlcik7XG4gICAgY29uc3QgdmFuaXR5TnVtYmVycyA9IGdlbmVyYXRlVG9wVmFuaXR5TnVtYmVycyhub3JtYWxpemVkRGlnaXRzLCA1KTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXM6ICdPSycsXG4gICAgICB2YW5pdHkxOiB2YW5pdHlOdW1iZXJzWzBdPy5kaXNwbGF5VmFsdWUsXG4gICAgICB2YW5pdHkyOiB2YW5pdHlOdW1iZXJzWzFdPy5kaXNwbGF5VmFsdWUsXG4gICAgICB2YW5pdHkzOiB2YW5pdHlOdW1iZXJzWzJdPy5kaXNwbGF5VmFsdWUsXG4gICAgICBjYWxsZXJOdW1iZXJNYXNrZWRcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJztcblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXM6ICdFUlJPUicsXG4gICAgICBtZXNzYWdlXG4gICAgfTtcbiAgfVxufSJdfQ==