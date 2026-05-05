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
export declare function handler(event: ConnectEvent): Promise<ConnectResponse>;
export {};
