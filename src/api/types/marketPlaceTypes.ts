export type GetOwnListingsResponse = {
    statusCode: number;
    message:    string;
    response:   GetMarketplaceListResponseResponse;
}

export type GetMarketplaceListResponseResponse = {
    count: number;
    rows:  ResponseElement[];
}

export type ResponseElement = {
    id:          number;
    clubId:      number;
    sellerId:    number;
    productName: string;
    price:       string;
    condition:   string;
    image:       string;
    description: string;
    isActive:    boolean;
    isSoldOut?:  boolean;
    createdAt:   Date;
    updatedAt:   Date;
    deletedAt:   null;
    seller:      Seller;
    club?:       Club;
}

export type Club = {
    id:       number;
    clubName: string;
    logo:     string;
}

export type Seller = {
    id:           number;
    fullName:     string;
    profileImage: string;
}

export type UpdateMarketPlaceItemResponse = {
    statusCode: number;
    message:    string;
    response:   AddMarketPlaceItemResponseResponse;
}

export type AddMarketPlaceItemResponseResponse = {
    id:          number;
    clubId:      number;
    sellerId:    number;
    productName: string;
    price:       number;
    condition:   string;
    image:       string;
    description: string;
    isActive:    boolean;
    updatedAt:   Date;
    createdAt:   Date;
    isSoldOut?:  boolean;
    deletedAt?:  null;
}

export type GetMarketplaceItemInfoResponse = {
    statusCode: number;
    message:    string;
    response:   ResponseElement;
}

export type DeleteMarketPlaceItemResponse = {
    statusCode: number;
    message:    string;
}

