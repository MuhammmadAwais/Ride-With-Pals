export type UpdateItemToShopResponse = {
    statusCode: number;
    message:    string;
    response?:  AddItemToShopResponseResponse;
}

export type AddItemToShopResponseResponse = {
    id:          number;
    clubId:      number;
    addedBy:     number;
    name:        string;
    description: string;
    image:       string;
    price:       number;
    size:        string;
    gender:      string;
    isActive:    boolean;
    updatedAt:   Date;
    createdAt:   Date;
    deletedAt?:  null;
}

export type GetTheShopItemsResponse = {
    statusCode: number;
    message:    string;
    response:   GetTheShopItemsResponseResponse;
}

export type GetTheShopItemsResponseResponse = {
    count: number;
    rows:  Row[];
}

export type Row = {
    id:          number;
    clubId:      number;
    addedBy:     number;
    name:        string;
    description: string;
    image:       string;
    price:       string;
    size:        string;
    gender:      string;
    isActive:    boolean;
    createdAt:   Date;
    updatedAt:   Date;
    deletedAt:   null;
    user:        User;
}

export type User = {
    id:           number;
    fullName:     string;
    profileImage: string;
}

export type DeleteShopItemResponse = {
    statusCode: number;
    message:    string;
}

