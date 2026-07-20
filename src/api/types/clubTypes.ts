export type GetClubRidesResponse = {
    statusCode: number;
    message:    string;
    response:   GetClubRidesResponseResponse;
}

export type GetClubRidesResponseResponse = {
    count: number;
    rows:  UpdateRideInfoResponseResponse[];
}

export type UpdateRideInfoResponseResponse = {
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
    recurringActivities: RecurringActivity[];
    isStops:             boolean;
    stops:               number[];
    isRecommendedSlots:  boolean;
    recommendedSlots:    RecommendedSlot[];
    isWomenAndNonBinary: boolean;
    rideLeaders:         PurpleSupportCarDriver[];
    supportCarDriver:    PurpleSupportCarDriver | null;
    isPublic:            boolean;
    isPaymentRequired:   boolean;
    createdAt:           Date;
    updatedAt:           Date;
    deletedAt:           null;
    club?:               Club;
    user?:               User;
}

export type Club = {
    clubTypeName: ClubTypeName;
    id:           number;
    clubName:     ClubName;
    clubTypeId:   number;
    logo:         Logo;
}

export type ClubName = "Weekend Riders Club 2" | "Weekend Riders Club";

export type ClubTypeName = "Riding" | "Cycling";

export type Logo = "logo.png";

export type RecommendedSlot = "08:30" | "09:00";

export type RecurringActivity = "monday" | "weekly";

export type PurpleSupportCarDriver = {
    name:   PurpleName;
    userId: number;
}

export type PurpleName = "Jane Doe" | "John Smith" | "Saqib" | "Saqibu";

export type User = {
    id:           number;
    fullName:     FullNameEnum;
    profileImage: null | string;
    email?:       string;
}

export type FullNameEnum = "Saqib Usman";

export type GetCalendarTabDataResponse = {
    statusCode: number;
    message:    string;
    response:   GetActivitiesDataResponseResponse;
}

export type GetActivitiesDataResponseResponse = {
    count: number;
    rows:  PurpleRow[];
}

export type PurpleRow = {
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
    recurringActivities: RecurringActivity[];
    isStops:             boolean;
    stops:               number[];
    isRecommendedSlots:  boolean;
    recommendedSlots:    RecommendedSlot[];
    isWomenAndNonBinary: boolean;
    rideLeaders:         PurpleSupportCarDriver[];
    supportCarDriver:    PurpleSupportCarDriver | null;
    isPublic:            boolean;
    isPaymentRequired:   boolean;
    joinedParticipants:  number[] | null;
    createdAt:           Date;
    updatedAt:           Date;
    deletedAt:           null;
    club:                Club;
    user:                User;
    isJoined:            boolean;
}

export type ConnectStravaAccountResponse = {
    statusCode: number;
    message:    string;
    response:   ConnectStravaAccountResponseResponse;
}

export type ConnectStravaAccountResponseResponse = {
    authorizeUrl: string;
    redirectUri:  string;
}

export type CheckStravaStatusResponse = {
    statusCode: number;
    message:    string;
    response:   CheckStravaStatusResponseResponse;
}

export type CheckStravaStatusResponseResponse = {
    connected:       boolean;
    stravaAthleteId: number;
    connectedAt:     Date;
}

export type DisconnectStravaAccountResponse = {
    statusCode: number;
    message:    string;
    response:   DisconnectStravaAccountResponseResponse;
}

export type DisconnectStravaAccountResponseResponse = {
    connected: boolean;
}

export type GetStravaLeaderboardDataResponse = {
    statusCode: number;
    message:    string;
    response:   GetStravaLeaderboardDataResponseResponse;
}

export type GetStravaLeaderboardDataResponseResponse = {
    clubId: number;
    period: string;
    filter: Filter;
    count:  number;
    rows:   FluffyRow[];
}

export type Filter = {
    startDate: Date;
    endDate:   Date;
}

export type FluffyRow = {
    rank:            number;
    userId:          number;
    fullName:        FullNameEnum;
    profileImage:    string;
    totalKm:         number;
    stravaConnected: boolean;
}

export type GetClubLeaderboardAppRidesResponse = {
    statusCode: number;
    message:    string;
    response:   GetClubLeaderboardAppRidesResponseResponse;
}

export type GetClubLeaderboardAppRidesResponseResponse = {
    clubId: number;
    count:  number;
    rows:   TentacledRow[];
}

export type TentacledRow = {
    rank:         number;
    userId:       number;
    fullName:     FullNameEnum;
    profileImage: string;
    rideCount:    number;
}

export type CreateClubProfileResponse = {
    statusCode: number;
    message:    string;
    response:   CreateClubProfileResponseResponse;
}

export type CreateClubProfileResponseResponse = {
    clubPrivacyName:   string;
    clubTypeName:      ClubTypeName;
    id:                number;
    clubName:          ClubName;
    clubPrivacyId:     number;
    clubTypeId:        number;
    email:             string;
    phone:             string;
    location:          string;
    description:       string;
    logo:              Logo;
    userId:            number;
    updatedAt:         Date;
    createdAt:         Date;
    participantCount?: number;
    deletedAt?:        null;
    clubMembers?:      ClubMemberElement[];
}

export type ClubMemberElement = {
    id:         number;
    clubId:     number;
    userId:     number;
    status:     string;
    updatedAt:  Date;
    createdAt:  Date;
    deletedAt?: null;
}

export type AddRidesResponse = {
    statusCode: number;
    message:    string;
    response:   AddRidesResponseResponse;
}

export type AddRidesResponseResponse = {
    activityTypeName:    string;
    sportSubTypeName:    string;
    id:                  number;
    clubId:              number;
    rideName:            string;
    date:                Date;
    time:                string;
    activityTypeId:      number;
    sportSubTypeId:      number;
    categoryTypeId:      number;
    meetingPoint:        string;
    gpxFile:             string;
    distance:            number;
    description:         string;
    pace:                string;
    isRecurringActivity: boolean;
    recurringActivities: RecurringActivity[];
    isStops:             boolean;
    stops:               number[];
    isRecommendedSlots:  boolean;
    recommendedSlots:    RecommendedSlot[];
    isWomenAndNonBinary: boolean;
    rideLeaders:         PurpleSupportCarDriver[];
    supportCarDriver:    PurpleSupportCarDriver;
    isPublic:            boolean;
    isPaymentRequired:   boolean;
    userId:              number;
    updatedAt:           Date;
    createdAt:           Date;
}

export type GetOwnRidesResponse = {
    statusCode: number;
    message:    string;
    response:   GetOwnRidesResponseResponse;
}

export type GetOwnRidesResponseResponse = {
    count: number;
    rows:  StickyRow[];
}

export type StickyRow = {
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
    recurringActivities: RecurringActivity[];
    isStops:             boolean;
    stops:               number[];
    isRecommendedSlots:  boolean;
    recommendedSlots:    RecommendedSlot[];
    isWomenAndNonBinary: boolean;
    rideLeaders:         FluffySupportCarDriver[];
    supportCarDriver:    FluffySupportCarDriver | null;
    isPublic:            boolean;
    isPaymentRequired:   boolean;
    createdAt:           Date;
    updatedAt:           Date;
    deletedAt:           null;
    club:                Club;
}

export type FluffySupportCarDriver = {
    name:          PurpleName;
    userId:        number;
    fullName?:     FullNameEnum;
    profileImage?: null | string;
    email?:        string;
}

export type GetRideInfoByIdResponse = {
    statusCode: number;
    message:    string;
    response:   GetRideInfoByIdResponseResponse;
}

export type GetRideInfoByIdResponseResponse = {
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
    recurringActivities: RecurringActivity[];
    isStops:             boolean;
    stops:               number[];
    isRecommendedSlots:  boolean;
    recommendedSlots:    RecommendedSlot[];
    isWomenAndNonBinary: boolean;
    rideLeaders:         FluffySupportCarDriver[];
    supportCarDriver:    FluffySupportCarDriver;
    isPublic:            boolean;
    isPaymentRequired:   boolean;
    joinedParticipants:  JoinedParticipant[];
    createdAt:           Date;
    updatedAt:           Date;
    deletedAt:           null;
    club:                Club;
    isJoined:            boolean;
    maxSlope?:           number;
    elevationGain?:      number;
    hasLiveBeacon?:      boolean;
    isPublicRide?:       boolean;
}

export type JoinedParticipant = {
    id:      number;
    name:    FullNameEnum;
    profile: string;
}

export type UpdateRideInfoResponse = {
    statusCode: number;
    message:    string;
    response:   UpdateRideInfoResponseResponse;
}

export type GetJoinedClubsResponse = {
    statusCode: number;
    message:    string;
    response:   ClubsResponseResponse;
}

export type ClubsResponseResponse = {
    count: number;
    rows:  CreateClubProfileResponseResponse[];
}

export type JoinClubResponse = {
    statusCode: number;
    message:    string;
    response?:  ClubMemberElement;
}

export type LeaveClubResponse = {
    statusCode: number;
    message:    string;
}

export type JoinRideResponse = {
    statusCode: number;
    message:    string;
    response?:  JoinRideResponseResponse;
}

export type JoinRideResponseResponse = {
    joinedParticipants: number[];
}

export type GetClubMembersListResponse = {
    statusCode: number;
    message:    string;
    response:   GetClubMembersListResponseResponse[];
}

export type GetClubMembersListResponseResponse = {
    userId:       number;
    fullName:     FullNameEnum;
    profileImage: string;
    email:        string;
    role:         string;
    isFullAccess: boolean;
    permissions:  Permissions;
}

export type Permissions = {
    publishRides:        boolean;
    publishNews:         boolean;
    publishDiscount:     boolean;
    acceptOrBanUsers:    boolean;
    manageMembershipFee: boolean;
}

export type GetClubJoinRequestResponse = {
    statusCode: number;
    message:    string;
    response:   GetClubJoinRequestResponseResponse[];
}

export type GetClubJoinRequestResponseResponse = {
    clubMemberRoleName: string;
    id:                 number;
    clubId:             number;
    userId:             number;
    clubMemberRoleId:   number;
    status:             string;
    createdAt:          Date;
    updatedAt:          Date;
    deletedAt:          null;
    user:               User;
}

export type RemoveClubMemberResponse = {
    statusCode: number;
    message:    string;
    response:   ManageJoinGroupRequestResponseResponse;
}

export type ManageJoinGroupRequestResponseResponse = {
    message: string;
}

export type GetClubRidesParams = {
    clubId:  number | string;
    status?: string;
}

export type CreateClubProfileRequest = {
    clubName:                string;
    clubPrivacyId:           number;
    clubTypeId:              number;
    email:                   string;
    phone:                   string;
    location:                string;
    description:             string;
    logo?:                   string;
    clubImage?:              string;
    invitationCode?:         string;
    invitationCodeExpiresAt?: string;
    restrictUnpaidMembers?:   boolean;
    restrictClubShop?:        boolean;
    restrictJoinActivities?:  boolean;
}

export type UpdateClubInfoRequest = CreateClubProfileRequest & {
    clubId: number;
}

export type AddRidesRequest = {
    clubId?:              number;
    clubIds?:             number[];
    rideName:             string;
    date:                 string;
    time:                 string;
    activityTypeId:       number;
    sportSubTypeId?:      number;
    categoryTypeId:       number;
    meetingPoint:         string;
    gpxFile:              string;
    distance:             number;
    description:          string;
    pace:                 string;
    isRecurringActivity:  boolean;
    recurringActivities?: string[];
    isStops:              boolean;
    stops?:               number[];
    isRecommendedSlots:   boolean;
    recommendedSlots?:    string[];
    isWomenAndNonBinary:  boolean;
    rideLeaders:          { userId: number; name: string }[];
    supportCarDriver?:    { userId?: number; name: string };
    isPublic:             boolean;
    isPaymentRequired:    boolean;
}

export type UpdateRideInfoRequest = AddRidesRequest & {
    id: number;
}

export type GetOwnRidesParams = {
    limit?:  number;
    offset?: number;
}

export type GetRideInfoByIdParams = {
    rideId: number | string;
}

export type GetClubsParams = {
    owned?: boolean | string;
}

export type JoinClubRequest = {
    clubId:          number;
    invitationCode?: string;
}

export type GetJoinedClubsParams = {
    limit?:  number;
    offset?: number;
}

export type LeaveClubRequest = {
    clubId: number;
}

export type JoinRideRequest = {
    rideId: number;
}

export type GetClubMembersListParams = {
    clubId: number | string;
}

export type GetClubJoinRequestParams = {
    clubId: number | string;
}

export type ManageJoinGroupRequest = {
    clubId: number;
    userId: number;
    action: 'approve' | 'reject';
}

export type GetClubDashboardStatsParams = {
    clubId: number | string;
}

export type GetClubDashboardStatsResponseResponse = {
    totalMembers:     number | string;
    totalRides:       number | string;
    totalEarnings:    number | string;
    walletBalance:    number | string;
    revenueForecast:  number | string;
    marketplaceSales: any[];
}

export type GetClubInfoByIdParams = {
    clubId: number | string;
}

export type RemoveClubMemberRequest = {
    clubId: number;
    userId: number;
}


