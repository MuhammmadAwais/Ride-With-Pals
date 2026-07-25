export type ListClubSubscriptionResponse = {
    statusCode: number;
    message:    string;
    response:   ResponseElement[];
}

export type ResponseElement = {
    id:              number;
    name:            string;
    description:     string;
    price:           string;
    currency:        string;
    billingInterval: string;
    config:          ResponseConfig;
    stripeProductId: string;
    stripePriceId:   string;
    trialPeriodDays: null;
    planType:        string;
    planScope:       string;
    isActive:        boolean;
    isDeleted:       boolean;
    createdAt:       Date;
    updatedAt:       Date;
}

export type ResponseConfig = {
    gpxDownload:                boolean;
    paidActivities:             boolean;
    unlimitedRides:             boolean;
    stravaConnection:           boolean;
    unlimitedClubMembers:       boolean;
    clubStripeIntegration:      boolean;
    unlimitedItemInMarketplace: boolean;
}

export type GetMySubscriptionResponse = {
    statusCode: number;
    message:    string;
    response:   GetMySubscriptionResponseResponse;
}

export type GetMySubscriptionResponseResponse = {
    id:                   number;
    userId:               number;
    planId:               number;
    planSnapshot:         PlanSnapshot;
    stripeCustomerId:     string;
    stripeSubscriptionId: string;
    status:               string;
    paymentStatus:        string;
    trialEnd:             Date;
    currentPeriodStart:   Date;
    currentPeriodEnd:     Date;
    cancelledAt:          null;
    createdAt:            Date;
    updatedAt:            Date;
    plan:                 Plan;
}

export type Plan = {
    id:              number;
    name:            string;
    description:     string;
    price:           string;
    currency:        string;
    billingInterval: string;
    config:          PlanSnapshot;
    stripePriceId:   string;
    trialPeriodDays: number;
    planType:        string;
    isActive:        boolean;
    isDeleted:       boolean;
    createdAt:       Date;
    updatedAt:       Date;
}

export type PlanSnapshot = {
    numberOfRides:    number;
    marketplaceItems: number;
}

export type SubscriptionPlanListResponse = {
    statusCode: number;
    message:    string;
    response:   SubscriptionPlanListResponseResponse;
}

export type SubscriptionPlanListResponseResponse = {
    count: number;
    rows:  Row[];
}

export type Row = {
    id:              number;
    name:            string;
    description:     string;
    price:           string;
    currency:        string;
    billingInterval: string;
    config:          RowConfig;
    stripePriceId:   null | string;
    trialPeriodDays: number | null;
    isActive:        number;
    isDeleted:       number;
    createdAt:       Date;
    updatedAt:       Date;
}

export type RowConfig = {
    numberOfRides:    number;
    marketplaceItems: number;
    premiumChat?:     boolean;
}

export type SubscribeToAnyPlanResponse = {
    statusCode: number;
    message:    string;
    response:   SubscribeToAnyPlanResponseResponse;
}

export type SubscribeToAnyPlanResponseResponse = {
    type:        string;
    checkoutUrl: string;
    sessionId:   string;
}

export type ListClubSubscriptionParams = {
    clubId: number | string;
}

export type MySubscriptionParams = {
    clubId: number | string;
}

export type SubscribeToClubPlanRequest = {
    clubId: number | string;
    planId: number;
    successUrl: string;
    cancelUrl: string;
}

export type SubscribeToClubPlanResponse = {
    type:        string;
    checkoutUrl: string;
    sessionId:   string;
}

export type ClubCustomerPortalRequest = {
    clubId: number;
}

export type ClubCustomerPortalResponse = {
    url: string;
}

export type SubscribeToAnyPlanRequest = {
    planId: number;
    successUrl?: string;
    cancelUrl?: string;
}

export type CreateCustomerPortalParams = {
    type:    string;
    clubId?: number | string;
}

export type CreateCustomerPortalResponse = {
    url: string;
}


