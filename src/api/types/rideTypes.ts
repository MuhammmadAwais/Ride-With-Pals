export type UnsaveRideResponse = {
    statusCode: number;
    message:    string;
}

export type GetSavedRidesListResponse = {
    statusCode: number;
    message:    string;
    response:   Response;
}

export type Response = {
    count: number;
    rows:  Row[];
}

export type Row = {
    id:                  number;
    userId:              number;
    clubId:              number;
    rideName:            string;
    date:                Date;
    time:                string;
    activityTypeId:      number;
    isAsphalt:           boolean;
    isTrail:             boolean;
    categoryTypeId:      number;
    meetingPoint:        string;
    gpxFile:             string;
    distance:            string;
    description:         string;
    pace:                string;
    isRecurringActivity: boolean;
    recurringActivities: string[];
    isStops:             boolean;
    stops:               number[];
    isRecommendedSlots:  boolean;
    recommendedSlots:    string[];
    isWomenAndNonBinary: boolean;
    rideLeaders:         SupportCarDriver[];
    supportCarDriver:    SupportCarDriver;
    isPublic:            boolean;
    isPaymentRequired:   boolean;
    joinedParticipants:  number[];
    createdAt:           Date;
    updatedAt:           Date;
    deletedAt:           null;
    club:                Club;
    user:                User;
    isRideJoined:        boolean;
    isRideSaved:         boolean;
    savedAt:             Date;
}

export type Club = {
    clubTypeName: string;
    id:           number;
    clubName:     string;
    clubTypeId:   number;
    logo:         string;
}

export type SupportCarDriver = {
    name:   string;
    userId: number;
}

export type User = {
    id:           number;
    fullName:     string;
    profileImage: null;
}

