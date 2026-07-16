export type ConnectStripeResponse = {
    statusCode: number;
    message:    string;
    response:   ConnectStripeResponseResponse;
}

export type ConnectStripeResponseResponse = {
    onboardingUrl:   string;
    stripeAccountId: string;
}

export type CheckStripeAccountStatusResponse = {
    statusCode: number;
    message:    string;
    response:   CheckStripeAccountStatusResponseResponse;
}

export type CheckStripeAccountStatusResponseResponse = {
    connected:          boolean;
    stripeAccountId:    string;
    status:             string;
    onboardingComplete: boolean;
    chargesEnabled:     boolean;
    payoutsEnabled:     boolean;
    detailsSubmitted:   boolean;
}

