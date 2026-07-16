export type SubscribeToMembershipPlanResponse = {
    statusCode: number;
    message:    string;
    response:   SubscribeToMembershipPlanResponseResponse;
}

export type SubscribeToMembershipPlanResponseResponse = {
    type:        string;
    checkoutUrl: string;
    sessionId:   string;
}

export type MembershipPlanInfoByIdResponse = {
    statusCode: number;
    message:    string;
    response:   ResponseElement;
}

export type ResponseElement = {
    id:               number;
    clubId:           number;
    name:             string;
    price:            string;
    currency:         string;
    billingInterval:  string;
    autoRenew:        boolean;
    discountPercent:  string;
    features:         Feature[];
    stripeProductId?: string;
    stripePriceId?:   string;
    isActive:         boolean;
    isDeleted:        boolean;
    createdAt:        Date;
    updatedAt:        Date;
}

export type Feature = "Cycling license included" | "Paid activities included" | "Free coffee in our coffeeshop";

export type ListMembershipPlansResponse = {
    statusCode: number;
    message:    string;
    response:   ResponseElement[];
}

export type ListSubscribedMemberResponse = {
    statusCode: number;
    message:    string;
    response:   ListSubscribedMemberResponseResponse;
}

export type ListSubscribedMemberResponseResponse = {
    count: number;
    rows:  Row[];
}

export type Row = {
    id:                    number;
    userId:                number;
    clubId:                number;
    planId:                number;
    planSnapshot:          PlanSnapshot;
    stripeSubscriptionId:  string;
    stripePaymentIntentId: null;
    status:                string;
    paymentStatus:         string;
    currentPeriodStart:    Date;
    currentPeriodEnd:      Date;
    cancelledAt:           null;
    createdAt:             Date;
    updatedAt:             Date;
    user:                  User;
    plan:                  ResponseElement;
}

export type PlanSnapshot = {
    name:            string;
    price:           number;
    currency:        string;
    features:        Feature[];
    autoRenew:       boolean;
    billingInterval: string;
    discountPercent: number;
}

export type User = {
    id:           number;
    fullName:     string;
    profileImage: null;
    email:        string;
}

export type SubscribeToMembershipPlanRequest = {
    clubId: number;
    planId: number;
}

export type GetMyMembershipInfoParams = {
    clubId: number | string;
}

export type CreateClubMembershipPlanRequest = {
    clubId:          number;
    name:            string;
    price:           number;
    currency:        string;
    billingInterval: string;
    autoRenew:       boolean;
    discountPercent: number;
    features:        string[];
}

export type UpdateClubMembershipPlanRequest = {
    planId:           number;
    clubId:           number;
    name?:            string;
    price?:           number;
    currency?:        string;
    billingInterval?: string;
    autoRenew?:       boolean;
    discountPercent?: number;
    features?:        string[];
}

export type DeleteMembershipPlanParams = {
    planId: number | string;
}

export type DeleteMembershipPlanResponse = {
    statusCode: number;
    message:    string;
}

export type ListMembershipPlansParams = {
    clubId: number | string;
}

export type GetMembershipPlanInfoByIDParams = {
    clubId: number | string;
    planId: number | string;
}

export type ListSubscribedMemberParams = {
    clubId:  number | string;
    limit?:  number | string;
    offset?: number | string;
}

export type ChangeClubMemberFeeStatusRequest = {
    clubId: number;
    userId: number;
    planId: number;
}

export type ChangeClubMemberFeeStatusResponse = {
    statusCode: number;
    message:    string;
    response:   Row;
}


