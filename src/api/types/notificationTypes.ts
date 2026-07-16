export type GetClubNotificationsResponse = {
    statusCode: number;
    message:    string;
    response:   GetUserNotificationResponseResponse;
}

export type GetUserNotificationResponseResponse = {
    count: number;
    rows:  ResponseElement[];
}

export type ResponseElement = {
    id:         number;
    userId:     number;
    clubId:     number;
    title:      string;
    body:       string;
    type:       string;
    isRead:     boolean;
    metadata:   Metadata;
    createdAt:  Date;
    updatedAt:  Date;
    deletedAt?: null;
    club?:      Club;
}

export type Club = {
    id:       number;
    clubName: string;
    logo:     string;
}

export type Metadata = {
    clubId:   number;
    senderId: number;
}

export type SendSubscriptionReminderResponse = {
    statusCode: number;
    message:    string;
    response:   ResponseElement;
}

export type SendSubscriptionReminderToEveryoneResponse = {
    statusCode: number;
    message:    string;
    response:   SendSubscriptionReminderToEveryoneResponseResponse;
}

export type SendSubscriptionReminderToEveryoneResponseResponse = {
    message:   string;
    sentCount: number;
}

