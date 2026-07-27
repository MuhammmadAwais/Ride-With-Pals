export type GetMyPurchasesListResponse = {
    statusCode: number;
    message:    string;
    response:   ForClubOwnerOrderListResponseResponse;
}

export type ForClubOwnerOrderListResponseResponse = {
    count: number;
    rows:  ResponseElement[];
}

export type ResponseElement = {
    statusName: string;
    id:         number;
    shopItemId: number;
    clubId:     number;
    buyerId:    number;
    quantity:   number;
    unitPrice:  string;
    totalPrice: string;
    statusId:   number;
    createdAt:  Date;
    updatedAt:  Date;
    deletedAt:  null;
    shop?:          Shop;
    buyer?:         Buyer;
    club?:          Club;
    deliveryMethod?: string;
    orderAddress?: {
        fullName?:   string;
        phone?:      string;
        street?:     string;
        city?:       string;
        state?:      string;
        postalCode?: string;
        country?:    string;
    };
}

export type Buyer = {
    id:           number;
    fullName:     string;
    profileImage: null | string;
}

export type Club = {
    id:       number;
    clubName: string;
    logo:     string;
}

export type Shop = {
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
    user:        Buyer;
}

export type UpdateShopOrderStatusResponse = {
    statusCode: number;
    message:    string;
    response?:  ResponseElement;
}

export type BuyShopItemResponse = {
    statusCode: number;
    message:    string;
    response:   BuyShopItemResponseResponse;
}

export type BuyShopItemResponseResponse = {
    statusName?:         string;
    id?:                 number;
    shopItemId?:         number;
    clubId?:             number;
    buyerId?:            number;
    quantity?:           number;
    unitPrice?:          number;
    totalPrice?:         number;
    statusId?:           number;
    updatedAt?:          Date;
    createdAt?:          Date;
    originalTotalPrice?: number;
    discountAmount?:     number;
    discountCode?:       string;
    type?:               string;
    checkoutUrl?:        string;
    sessionId?:          string;
    order?:              Order;
}

export type Order = {
    statusName:              string;
    id:                      number;
    shopItemId:              number;
    clubId:                  number;
    buyerId:                 number;
    quantity:                number;
    unitPrice:               string;
    originalTotalPrice:      string;
    discountAmount:          string;
    discountCode:            null;
    totalPrice:              string;
    stripeCheckoutSessionId: string;
    stripePaymentIntentId:   null;
    statusId:                number;
    createdAt:               Date;
    updatedAt:               Date;
    deletedAt:               null;
}

export type ForClubOwnerOrderListParams = {
    clubId:     number | string;
    limit?:     number | string;
    offset?:    number | string;
    statusIds?: string;
}

export type ForClubOwnerUpdateOrderStatusRequest = {
    orderId:  number;
    statusId: number;
}

export type BuyShopItemRequest = {
    shopItemId:      number;
    quantity:        number;
    deliveryMethod:  'pickup' | 'delivery' | string;
    orderAddress?: {
        fullName?:   string;
        phone?:      string;
        street?:     string;
        city?:       string;
        state?:      string;
        postalCode?: string;
        country?:    string;
    };
    discountCode?:   string;
}

export type GetMyPurchasesListParams = {
    statusIds?: string;
    limit?:     number | string;
    offset?:    number | string;
}

export type UpdateShopOrderStatusRequest = {
    orderId: number;
}


