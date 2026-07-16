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

export type AddItemToShopRequest = {
    clubId:       number;
    name:         string;
    price:        number;
    description?: string;
    image?:       string;
    size?:        string;
    gender?:      string;
    quantity?:    number;
}

export type UpdateItemToShopRequest = {
    shopItemId:   number;
    name?:        string;
    price?:       number;
    description?: string;
    image?:       string;
    size?:        string;
    gender?:      string;
    isActive?:    boolean;
    quantity?:    number;
}

export type GetTheShopItemsParams = {
    clubId:  number | string;
    limit?:  number | string;
    offset?: number | string;
}

export type DeleteShopItemRequest = {
    shopItemId: number;
}

export type GetTheShopItemByIDParams = {
    shopItemId: number | string;
}


