export type GetClubDiscountsResponse = {
    statusCode: number;
    message:    string;
    response:   GetClubDiscountsResponseResponse;
}

export type GetClubDiscountsResponseResponse = {
    count: number;
    rows:  Row[];
}

export type Row = {
    id:                  number;
    clubId:              number;
    addedBy:             number;
    title:               string;
    discountCode:        string;
    discountPercentage:  string;
    discountFixedAmount: null;
    description:         string;
    validTill:           Date;
    isActive:            boolean;
    createdAt:           Date;
    updatedAt:           Date;
    deletedAt:           null;
}

export type UpdateDiscountResponse = {
    statusCode: number;
    message:    string;
    response?:  AddDiscountResponseResponse;
}

export type AddDiscountResponseResponse = {
    id:                  number;
    clubId:              number;
    addedBy:             number;
    title:               string;
    discountCode:        string;
    discountPercentage:  number;
    discountFixedAmount: null;
    description:         string;
    validTill:           Date;
    isActive:            boolean;
    updatedAt:           Date;
    createdAt:           Date;
    deletedAt?:          null;
}

export type DeleteDiscountResponse = {
    statusCode: number;
    message:    string;
}

