// authTypes.ts
```typescript
interface SignupResponse {
  statusCode: number;
  message: string;
  response: SignupData;
}

interface SignupData {
  id: number;
  email: string;
  token: string;
}

interface ForgotPasswordResponse {
  statusCode: number;
  message: string;
  response: ForgotPasswordData;
}

interface ForgotPasswordData {
  id: number;
  email: string;
  token: string;
}

interface ResendOtpResponse {
  statusCode: number;
  message: string;
  response: ResendOtpData;
}

interface ResendOtpData {
  id: number;
  email: string;
}

interface ValidateOtpResponse {
  statusCode: number;
  message: string;
  response: ValidateOtpData;
}

interface ValidateOtpData {
  id: number;
  email: string;
  token: string;
}

interface ChangePasswordResponse {
  statusCode: number;
  message: string;
}

interface LoginResponse {
  statusCode: number;
  response: LoginData;
}

interface LoginData {
  id: number;
  email: string;
  isAthleteProfile: number;
  token: string;
}

interface UpdatePasswordResponse {
  statusCode: number;
  message: string;
}

interface UpsertAthleteProfileResponse {
  statusCode: number;
  message: string;
  response: UpsertAthleteProfileData;
}

interface UpsertAthleteProfileData {
  id: number;
  email: string;
  isAthleteProfile: boolean;
  profileImage: string;
  fullName: string;
  dob: string;
  genderId: number;
  country: string;
  unit: string;
  phone: string;
  description: string;
}

interface UserInfoResponse {
  statusCode: number;
  message: string;
  response: UserInfoData;
}

interface UserInfoData {
  id: number;
  email: string;
  fullName: string;
  dob: string;
  genderId: number;
  country: string;
  unit: string;
  phone: string;
  description: string;
  isAthleteProfile: number;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadFileResponse {
  statusCode: number;
  message: string;
  response: UploadFileData;
}

interface UploadFileData {
  fileName: string;
  originalName: string;
  mimeType: string;
}

interface UpdateScaleUnitSettingsResponse {
  statusCode: number;
  message: string;
  response: UpdateScaleUnitSettingsData;
}

interface UpdateScaleUnitSettingsData {
  id: number;
  scale: string;
}

interface CheckEmailExistenceResponse {
  statusCode: number;
  message: string;
  response: CheckEmailExistenceData;
}

interface CheckEmailExistenceData {
  exists: boolean;
}

interface GetOtherUserInfoResponse {
  statusCode: number;
  message: string;
  response: GetOtherUserInfoData;
}

interface GetOtherUserInfoData {
  id: number;
  email: string;
  fullName: string;
  dob: null;
  genderId: number;
  country: null;
  unit: null;
  scale: string;
  phone: null;
  description: null;
  isAthleteProfile: number;
  profileImage: null;
  timezone: null;
  timeFormat: string;
  createdAt: string;
  updatedAt: string;
}

```

// clubTypes.ts
```typescript
interface GetClubRidesResponse {
  statusCode: number;
  message: string;
  response: GetClubRidesData;
}

interface GetClubRidesData {
  count: number;
  rows: GetClubRidesRow[];
}

interface GetClubRidesRow {
  id: number;
  userId: number;
  clubId: number;
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  isAsphalt: boolean;
  isTrail: boolean;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: string;
  description: string;
  pace: string;
  isRecurringActivity: boolean;
  recurringActivities: string[];
  isStops: boolean;
  stops: number[];
  isRecommendedSlots: boolean;
  recommendedSlots: string[];
  isWomenAndNonBinary: boolean;
  rideLeaders: RideLeader[];
  supportCarDriver: RideLeader | null;
  isPublic: boolean;
  isPaymentRequired: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  club: Club;
  user: User;
}

interface User {
  id: number;
  fullName: string;
  profileImage: string;
}

interface Club {
  clubTypeName: string;
  id: number;
  clubName: string;
  clubTypeId: number;
  logo: string;
}

interface RideLeader {
  name: string;
  userId: number;
}

interface GetActivitiesDataResponse {
  statusCode: number;
  message: string;
  response: GetActivitiesDataData;
}

interface GetActivitiesDataData {
  count: number;
  rows: GetActivitiesDataRow[];
}

interface GetActivitiesDataRow {
  id: number;
  userId: number;
  clubId: number;
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  isAsphalt: boolean;
  isTrail: boolean;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: string;
  description: string;
  pace: string;
  isRecurringActivity: boolean;
  recurringActivities: string[];
  isStops: boolean;
  stops: number[];
  isRecommendedSlots: boolean;
  recommendedSlots: string[];
  isWomenAndNonBinary: boolean;
  rideLeaders: RideLeader[];
  supportCarDriver: RideLeader | null;
  isPublic: boolean;
  isPaymentRequired: boolean;
  joinedParticipants: number[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  club: Club;
  user: User;
  isJoined: boolean;
}

interface User {
  id: number;
  fullName: string;
  profileImage: null | string;
}

interface GetCalendarTabDataResponse {
  statusCode: number;
  message: string;
  response: GetCalendarTabDataData;
}

interface GetCalendarTabDataData {
  count: number;
  rows: GetCalendarTabDataRow[];
}

interface GetCalendarTabDataRow {
  id: number;
  userId: number;
  clubId: number;
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  isAsphalt: boolean;
  isTrail: boolean;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: string;
  description: string;
  pace: string;
  isRecurringActivity: boolean;
  recurringActivities: string[];
  isStops: boolean;
  stops: number[];
  isRecommendedSlots: boolean;
  recommendedSlots: string[];
  isWomenAndNonBinary: boolean;
  rideLeaders: RideLeader[];
  supportCarDriver: RideLeader | null;
  isPublic: boolean;
  isPaymentRequired: boolean;
  joinedParticipants: number[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  club: Club;
  user: User;
  isJoined: boolean;
}

interface ConnectStravaAccountResponse {
  statusCode: number;
  message: string;
  response: ConnectStravaAccountData;
}

interface ConnectStravaAccountData {
  authorizeUrl: string;
  redirectUri: string;
}

interface CheckStravaStatusResponse {
  statusCode: number;
  message: string;
  response: CheckStravaStatusData;
}

interface CheckStravaStatusData {
  connected: boolean;
  stravaAthleteId: number;
  connectedAt: string;
}

interface DisconnectStravaAccountResponse {
  statusCode: number;
  message: string;
  response: DisconnectStravaAccountData;
}

interface DisconnectStravaAccountData {
  connected: boolean;
}

interface GetStravaLeaderboardDataResponse {
  statusCode: number;
  message: string;
  response: GetStravaLeaderboardDataData;
}

interface GetStravaLeaderboardDataData {
  clubId: number;
  period: string;
  filter: Filter;
  count: number;
  rows: GetStravaLeaderboardDataRow[];
}

interface GetStravaLeaderboardDataRow {
  rank: number;
  userId: number;
  fullName: string;
  profileImage: string;
  totalKm: number;
  stravaConnected: boolean;
}

interface Filter {
  startDate: string;
  endDate: string;
}

interface GetClubLeaderboardAppRidesResponse {
  statusCode: number;
  message: string;
  response: GetClubLeaderboardAppRidesData;
}

interface GetClubLeaderboardAppRidesData {
  clubId: number;
  count: number;
  rows: GetClubLeaderboardAppRidesRow[];
}

interface GetClubLeaderboardAppRidesRow {
  rank: number;
  userId: number;
  fullName: string;
  profileImage: string;
  rideCount: number;
}

interface CreateClubProfileResponse {
  statusCode: number;
  message: string;
  response: CreateClubProfileData;
}

interface CreateClubProfileData {
  clubPrivacyName: string;
  clubTypeName: string;
  id: number;
  clubName: string;
  clubPrivacyId: number;
  clubTypeId: number;
  email: string;
  phone: string;
  location: string;
  description: string;
  logo: string;
  userId: number;
  updatedAt: string;
  createdAt: string;
}

interface AddRidesResponse {
  statusCode: number;
  message: string;
  response: AddRidesData;
}

interface AddRidesData {
  activityTypeName: string;
  sportSubTypeName: string;
  id: number;
  clubId: number;
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  sportSubTypeId: number;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: number;
  description: string;
  pace: string;
  isRecurringActivity: boolean;
  recurringActivities: string[];
  isStops: boolean;
  stops: number[];
  isRecommendedSlots: boolean;
  recommendedSlots: string[];
  isWomenAndNonBinary: boolean;
  rideLeaders: RideLeader[];
  supportCarDriver: RideLeader;
  isPublic: boolean;
  isPaymentRequired: boolean;
  userId: number;
  updatedAt: string;
  createdAt: string;
}

interface RideLeader {
  userId: number;
  name: string;
}

interface GetOwnRidesResponse {
  statusCode: number;
  message: string;
  response: GetOwnRidesData;
}

interface GetOwnRidesData {
  count: number;
  rows: GetOwnRidesRow[];
}

interface GetOwnRidesRow {
  id: number;
  userId: number;
  clubId: number;
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  isAsphalt: boolean;
  isTrail: boolean;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: string;
  description: string;
  pace: string;
  isRecurringActivity: boolean;
  recurringActivities: string[];
  isStops: boolean;
  stops: number[];
  isRecommendedSlots: boolean;
  recommendedSlots: string[];
  isWomenAndNonBinary: boolean;
  rideLeaders: RideLeader[];
  supportCarDriver: SupportCarDriver | null;
  isPublic: boolean;
  isPaymentRequired: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  club: Club;
}

interface SupportCarDriver {
  name: string;
  userId: number;
  fullName: string;
  profileImage: string;
  email: string;
}

interface RideLeader {
  name: string;
  userId: number;
  fullName?: string;
  profileImage?: string;
  email?: string;
}

interface GetRideInfoByIdResponse {
  statusCode: number;
  message: string;
  response: GetRideInfoByIdData;
}

interface GetRideInfoByIdData {
  id: number;
  userId: number;
  clubId: number;
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  isAsphalt: boolean;
  isTrail: boolean;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: string;
  description: string;
  pace: string;
  isRecurringActivity: boolean;
  recurringActivities: string[];
  isStops: boolean;
  stops: number[];
  isRecommendedSlots: boolean;
  recommendedSlots: string[];
  isWomenAndNonBinary: boolean;
  rideLeaders: RideLeader[];
  supportCarDriver: SupportCarDriver;
  isPublic: boolean;
  isPaymentRequired: boolean;
  joinedParticipants: JoinedParticipant[];
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  club: Club;
  isJoined: boolean;
}

interface JoinedParticipant {
  id: number;
  name: string;
  profile: string;
}

interface RideLeader {
  name: string;
  userId: number;
  fullName: string;
  profileImage: null | string;
  email: string;
}

interface UpdateRideInfoResponse {
  statusCode: number;
  message: string;
  response: UpdateRideInfoData;
}

interface UpdateRideInfoData {
  id: number;
  userId: number;
  clubId: number;
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  isAsphalt: boolean;
  isTrail: boolean;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: string;
  description: string;
  pace: string;
  isRecurringActivity: boolean;
  recurringActivities: string[];
  isStops: boolean;
  stops: number[];
  isRecommendedSlots: boolean;
  recommendedSlots: string[];
  isWomenAndNonBinary: boolean;
  rideLeaders: RideLeader[];
  supportCarDriver: RideLeader;
  isPublic: boolean;
  isPaymentRequired: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface ClubsResponse {
  statusCode: number;
  message: string;
  response: ClubsData;
}

interface ClubsData {
  count: number;
  rows: ClubsRow[];
}

interface ClubsRow {
  clubPrivacyName: string;
  clubTypeName: string;
  id: number;
  userId: number;
  logo: string;
  email: string;
  phone: string;
  clubName: string;
  clubPrivacyId: number;
  clubTypeId: number;
  location: string;
  description: string;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface JoinClubResponse {
  statusCode: number;
  message: string;
  response: JoinClubData;
}

interface JoinClubData {
  id: number;
  clubId: number;
  userId: number;
  status: string;
  updatedAt: string;
  createdAt: string;
}

interface JoinClubResponse {
  statusCode: number;
  message: string;
}

interface GetJoinedClubsResponse {
  statusCode: number;
  message: string;
  response: GetJoinedClubsData;
}

interface GetJoinedClubsData {
  count: number;
  rows: GetJoinedClubsRow[];
}

interface GetJoinedClubsRow {
  clubPrivacyName: string;
  clubTypeName: string;
  id: number;
  userId: number;
  logo: string;
  email: string;
  phone: string;
  clubName: string;
  clubPrivacyId: number;
  clubTypeId: number;
  location: string;
  description: string;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  clubMembers: ClubMember[];
}

interface ClubMember {
  id: number;
  clubId: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface LeaveClubResponse {
  statusCode: number;
  message: string;
}

interface JoinRideResponse {
  statusCode: number;
  message: string;
}

interface JoinRideResponse {
  statusCode: number;
  message: string;
  response: JoinRideData;
}

interface JoinRideData {
  joinedParticipants: number[];
}

interface GetClubMembersListResponse {
  statusCode: number;
  message: string;
  response: GetClubMembersListData[];
}

interface GetClubMembersListData {
  userId: number;
  fullName: string;
  profileImage: string;
  email: string;
  role: string;
  isFullAccess: boolean;
  permissions: Permissions;
}

interface Permissions {
  publishRides: boolean;
  publishNews: boolean;
  publishDiscount: boolean;
  acceptOrBanUsers: boolean;
  manageMembershipFee: boolean;
}

interface GetClubJoinRequestResponse {
  statusCode: number;
  message: string;
  response: GetClubJoinRequestData[];
}

interface GetClubJoinRequestData {
  clubMemberRoleName: string;
  id: number;
  clubId: number;
  userId: number;
  clubMemberRoleId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  user: User;
}

interface User {
  id: number;
  fullName: string;
  profileImage: null;
  email: string;
}

interface ManageJoinGroupRequestResponse {
  statusCode: number;
  message: string;
  response: ManageJoinGroupRequestData;
}

interface ManageJoinGroupRequestData {
  message: string;
}

interface RemoveClubMemberResponse {
  statusCode: number;
  message: string;
  response: RemoveClubMemberData;
}

interface RemoveClubMemberData {
  message: string;
}

```

// newsTypes.ts
```typescript
interface AddCommentResponse {
  statusCode: number;
  message: string;
  response: AddCommentData;
}

interface AddCommentData {
  id: number;
  newsId: number;
  userId: number;
  comment: string;
  updatedAt: string;
  createdAt: string;
}

interface GetAllNewsCommentsResponse {
  statusCode: number;
  message: string;
  response: GetAllNewsCommentsData;
}

interface GetAllNewsCommentsData {
  count: number;
  rows: GetAllNewsCommentsRow[];
}

interface GetAllNewsCommentsRow {
  id: number;
  newsId: number;
  userId: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  user: User;
}

interface User {
  id: number;
  fullName: string;
  profileImage: null;
}

interface UpdateNewsCommentResponse {
  statusCode: number;
  message: string;
  response: UpdateNewsCommentData;
}

interface UpdateNewsCommentData {
  id: number;
  newsId: number;
  userId: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface UpdateNewsCommentResponse {
  statusCode: number;
  message: string;
}

interface DelCommentResponse {
  statusCode: number;
  message: string;
}

interface AddNewsResponse {
  statusCode: number;
  message: string;
  response: AddNewsData;
}

interface AddNewsData {
  id: number;
  title: string;
  description: string;
  image: string;
  clubId: number;
  addedBy: number;
  updatedAt: string;
  createdAt: string;
}

interface AddNewsResponse {
  statusCode: number;
  message: string;
}

interface GetNewsByIdResponse {
  statusCode: number;
  message: string;
  response: GetNewsByIdData;
}

interface GetNewsByIdData {
  id: number;
  addedBy: number;
  clubId: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface UpdateNewsResponse {
  statusCode: number;
  message: string;
  response: UpdateNewsData;
}

interface UpdateNewsData {
  id: number;
  addedBy: number;
  clubId: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface DeleteNewsResponse {
  statusCode: number;
  message: string;
  response: DeleteNewsData;
}

interface DeleteNewsData {
  id: number;
  addedBy: number;
  clubId: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

interface GetAllNewsResponse {
  statusCode: number;
  message: string;
  response: GetAllNewsData;
}

interface GetAllNewsData {
  count: number;
  rows: GetAllNewsRow[];
}

interface GetAllNewsRow {
  id: number;
  addedBy: number;
  clubId: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  latestComment: LatestComment | null;
  totalCommentsCount: number;
}

interface LatestComment {
  id: number;
  newsId: number;
  userId: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  user: User;
}

```

// shopTypes.ts
```typescript
interface AddItemToShopResponse {
  statusCode: number;
  message: string;
  response: AddItemToShopData;
}

interface AddItemToShopData {
  id: number;
  clubId: number;
  addedBy: number;
  name: string;
  description: string;
  image: string;
  price: number;
  size: string;
  gender: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

interface AddItemToShopResponse {
  statusCode: number;
  message: string;
}

interface UpdateItemToShopResponse {
  statusCode: number;
  message: string;
  response: UpdateItemToShopData;
}

interface UpdateItemToShopData {
  id: number;
  clubId: number;
  addedBy: number;
  name: string;
  description: string;
  image: string;
  price: number;
  size: string;
  gender: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface GetTheShopItemsResponse {
  statusCode: number;
  message: string;
  response: GetTheShopItemsData;
}

interface GetTheShopItemsData {
  count: number;
  rows: GetTheShopItemsRow[];
}

interface GetTheShopItemsRow {
  id: number;
  clubId: number;
  addedBy: number;
  name: string;
  description: string;
  image: string;
  price: string;
  size: string;
  gender: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  user: User;
}

interface User {
  id: number;
  fullName: string;
  profileImage: string;
}

interface DeleteShopItemResponse {
  statusCode: number;
  message: string;
}

```

// shopOrderTypes.ts
```typescript
interface ForClubOwnerOrderListResponse {
  statusCode: number;
  message: string;
  response: ForClubOwnerOrderListData;
}

interface ForClubOwnerOrderListData {
  count: number;
  rows: ForClubOwnerOrderListRow[];
}

interface ForClubOwnerOrderListRow {
  statusName: string;
  id: number;
  shopItemId: number;
  clubId: number;
  buyerId: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  shop: Shop;
  buyer: Buyer;
  club: Club;
}

interface Club {
  id: number;
  clubName: string;
  logo: string;
}

interface Buyer {
  id: number;
  fullName: string;
  profileImage: null;
}

interface Shop {
  id: number;
  clubId: number;
  addedBy: number;
  name: string;
  description: string;
  image: string;
  price: string;
  size: string;
  gender: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  user: User;
}

interface User {
  id: number;
  fullName: string;
  profileImage: string;
}

interface ForClubOwnerUpdateOrderStatusResponse {
  statusCode: number;
  message: string;
  response: ForClubOwnerUpdateOrderStatusData;
}

interface ForClubOwnerUpdateOrderStatusData {
  statusName: string;
  id: number;
  shopItemId: number;
  clubId: number;
  buyerId: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface ForClubOwnerUpdateOrderStatusResponse {
  statusCode: number;
  message: string;
}

interface BuyShopItemResponse {
  statusCode: number;
  message: string;
  response: BuyShopItemData;
}

interface BuyShopItemData {
  statusName: string;
  id: number;
  shopItemId: number;
  clubId: number;
  buyerId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  statusId: number;
  updatedAt: string;
  createdAt: string;
}

interface BuyShopItemData {
  statusName: string;
  id: number;
  shopItemId: number;
  clubId: number;
  buyerId: number;
  quantity: number;
  unitPrice: number;
  originalTotalPrice: number;
  discountAmount: number;
  discountCode: string;
  totalPrice: number;
  statusId: number;
  updatedAt: string;
  createdAt: string;
}

interface BuyShopItemData {
  type: string;
  checkoutUrl: string;
  sessionId: string;
  order: Order;
}

interface Order {
  statusName: string;
  id: number;
  shopItemId: number;
  clubId: number;
  buyerId: number;
  quantity: number;
  unitPrice: string;
  originalTotalPrice: string;
  discountAmount: string;
  discountCode: null;
  totalPrice: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: null;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface GetMyPurchasesListResponse {
  statusCode: number;
  message: string;
  response: GetMyPurchasesListData;
}

interface GetMyPurchasesListData {
  count: number;
  rows: GetMyPurchasesListRow[];
}

interface GetMyPurchasesListRow {
  statusName: string;
  id: number;
  shopItemId: number;
  clubId: number;
  buyerId: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  shop: Shop;
  club: Club;
}

interface UpdateShopOrderStatusResponse {
  statusCode: number;
  message: string;
  response: UpdateShopOrderStatusData;
}

interface UpdateShopOrderStatusData {
  statusName: string;
  id: number;
  shopItemId: number;
  clubId: number;
  buyerId: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

```

// marketPlaceTypes.ts
```typescript
interface GetMarketplaceListResponse {
  statusCode: number;
  message: string;
  response: GetMarketplaceListData;
}

interface GetMarketplaceListData {
  count: number;
  rows: GetMarketplaceListRow[];
}

interface GetMarketplaceListRow {
  id: number;
  clubId: number;
  sellerId: number;
  productName: string;
  price: string;
  condition: string;
  image: string;
  description: string;
  isActive: boolean;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  seller: Seller;
}

interface Seller {
  id: number;
  fullName: string;
  profileImage: string;
}

interface AddMarketPlaceItemResponse {
  statusCode: number;
  message: string;
  response: AddMarketPlaceItemData;
}

interface AddMarketPlaceItemData {
  id: number;
  clubId: number;
  sellerId: number;
  productName: string;
  price: number;
  condition: string;
  image: string;
  description: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

interface UpdateMarketPlaceItemResponse {
  statusCode: number;
  message: string;
  response: UpdateMarketPlaceItemData;
}

interface UpdateMarketPlaceItemData {
  id: number;
  clubId: number;
  sellerId: number;
  productName: string;
  price: number;
  condition: string;
  image: string;
  description: string;
  isActive: boolean;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface GetMarketplaceItemInfoResponse {
  statusCode: number;
  message: string;
  response: GetMarketplaceItemInfoData;
}

interface GetMarketplaceItemInfoData {
  id: number;
  clubId: number;
  sellerId: number;
  productName: string;
  price: string;
  condition: string;
  image: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  seller: Seller;
  club: Club;
}

interface Club {
  id: number;
  clubName: string;
  logo: string;
}

interface DeleteMarketPlaceItemResponse {
  statusCode: number;
  message: string;
}

interface GetOwnListingsResponse {
  statusCode: number;
  message: string;
  response: GetOwnListingsData;
}

interface GetOwnListingsData {
  count: number;
  rows: GetOwnListingsRow[];
}

interface GetOwnListingsRow {
  id: number;
  clubId: number;
  sellerId: number;
  productName: string;
  price: string;
  condition: string;
  image: string;
  description: string;
  isActive: boolean;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  seller: Seller;
  club: Club;
}

```

// rideTypes.ts
```typescript
interface SaveRideResponse {
  statusCode: number;
  message: string;
}

interface UnsaveRideResponse {
  statusCode: number;
  message: string;
}

interface GetSavedRidesListResponse {
  statusCode: number;
  message: string;
  response: GetSavedRidesListData;
}

interface GetSavedRidesListData {
  count: number;
  rows: GetSavedRidesListRow[];
}

interface GetSavedRidesListRow {
  id: number;
  userId: number;
  clubId: number;
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  isAsphalt: boolean;
  isTrail: boolean;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: string;
  description: string;
  pace: string;
  isRecurringActivity: boolean;
  recurringActivities: string[];
  isStops: boolean;
  stops: number[];
  isRecommendedSlots: boolean;
  recommendedSlots: string[];
  isWomenAndNonBinary: boolean;
  rideLeaders: RideLeader[];
  supportCarDriver: RideLeader;
  isPublic: boolean;
  isPaymentRequired: boolean;
  joinedParticipants: number[];
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  club: Club;
  user: User;
  isRideJoined: boolean;
  isRideSaved: boolean;
  savedAt: string;
}

interface User {
  id: number;
  fullName: string;
  profileImage: null;
}

interface Club {
  clubTypeName: string;
  id: number;
  clubName: string;
  clubTypeId: number;
  logo: string;
}

interface RideLeader {
  name: string;
  userId: number;
}

```

// discountTypes.ts
```typescript
interface GetClubDiscountsResponse {
  statusCode: number;
  message: string;
  response: GetClubDiscountsData;
}

interface GetClubDiscountsData {
  count: number;
  rows: GetClubDiscountsRow[];
}

interface GetClubDiscountsRow {
  id: number;
  clubId: number;
  addedBy: number;
  title: string;
  discountCode: string;
  discountPercentage: string;
  discountFixedAmount: null;
  description: string;
  validTill: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface AddDiscountResponse {
  statusCode: number;
  message: string;
  response: AddDiscountData;
}

interface AddDiscountData {
  id: number;
  clubId: number;
  addedBy: number;
  title: string;
  discountCode: string;
  discountPercentage: number;
  discountFixedAmount: null;
  description: string;
  validTill: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

interface AddDiscountResponse {
  statusCode: number;
  message: string;
}

interface UpdateDiscountResponse {
  statusCode: number;
  message: string;
  response: UpdateDiscountData;
}

interface UpdateDiscountData {
  id: number;
  clubId: number;
  addedBy: number;
  title: string;
  discountCode: string;
  discountPercentage: number;
  discountFixedAmount: null;
  description: string;
  validTill: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface DeleteDiscountResponse {
  statusCode: number;
  message: string;
}

```

// permissionTypes.ts
```typescript
interface GetClubPermissionsResponse {
  statusCode: number;
  message: string;
  response: GetClubPermissionsData;
}

interface GetClubPermissionsData {
  members: Member[];
  rolePermissions: RolePermission[];
  memberPermissions: MemberPermission[];
  fullAccessMembers: FullAccessMember[];
}

interface FullAccessMember {
  id: number;
  clubId: number;
  userId: number;
  isFullAccess: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  user: User;
}

interface MemberPermission {
  permissionName: string;
  id: number;
  clubId: number;
  userId: number;
  permissionId: number;
  isAllowed: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface RolePermission {
  roleName: string;
  permissionName: string;
  id: number;
  clubId: number;
  roleId: number;
  permissionId: number;
  isAllowed: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface Member {
  id: number;
  clubId: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  user: User;
}

interface User {
  id: number;
  fullName: string;
  profileImage: null;
}

interface SavePermissionsForAdminOrUserRoleResponse {
  statusCode: number;
  message: string;
  response: SavePermissionsForAdminOrUserRoleData[];
}

interface SavePermissionsForAdminOrUserRoleData {
  roleName: string;
  permissionName: string;
  id: number;
  clubId: number;
  roleId: number;
  permissionId: number;
  isAllowed: boolean;
  updatedAt: string;
  createdAt: string;
}

interface ApplyPermissionTogglesForSelectedMembersResponse {
  statusCode: number;
  message: string;
  response: ApplyPermissionTogglesForSelectedMembersData[];
}

interface ApplyPermissionTogglesForSelectedMembersData {
  permissionName: string;
  id: number;
  clubId: number;
  userId: number;
  permissionId: number;
  isAllowed: boolean;
  updatedAt: string;
  createdAt: string;
}

interface GrantRevokeFullClubAccessForOneMemberResponse {
  statusCode: number;
  message: string;
  response: GrantRevokeFullClubAccessForOneMemberData;
}

interface GrantRevokeFullClubAccessForOneMemberData {
  id: number;
  clubId: number;
  userId: number;
  isFullAccess: boolean;
  updatedAt: string;
  createdAt: string;
}

```

// subscriptionTypes.ts
```typescript
interface ListClubSubscriptionResponse {
  statusCode: number;
  message: string;
  response: ListClubSubscriptionData[];
}

interface ListClubSubscriptionData {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  config: Config;
  stripeProductId: string;
  stripePriceId: string;
  trialPeriodDays: null;
  planType: string;
  planScope: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Config {
  gpxDownload: boolean;
  paidActivities: boolean;
  unlimitedRides: boolean;
  stravaConnection: boolean;
  unlimitedClubMembers: boolean;
  clubStripeIntegration: boolean;
  unlimitedItemInMarketplace: boolean;
}

interface GetMySubscriptionResponse {
  statusCode: number;
  message: string;
  response: GetMySubscriptionData;
}

interface GetMySubscriptionData {
  id: number;
  userId: number;
  planId: number;
  planSnapshot: PlanSnapshot;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  paymentStatus: string;
  trialEnd: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: null;
  createdAt: string;
  updatedAt: string;
  plan: Plan;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  config: PlanSnapshot;
  stripePriceId: string;
  trialPeriodDays: number;
  planType: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlanSnapshot {
  numberOfRides: number;
  marketplaceItems: number;
}

interface SubscriptionPlanListResponse {
  statusCode: number;
  message: string;
  response: SubscriptionPlanListData;
}

interface SubscriptionPlanListData {
  count: number;
  rows: SubscriptionPlanListRow[];
}

interface SubscriptionPlanListRow {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  config: Config;
  stripePriceId: null | string;
  trialPeriodDays: null | number;
  isActive: number;
  isDeleted: number;
  createdAt: string;
  updatedAt: string;
}

interface Config {
  numberOfRides: number;
  marketplaceItems: number;
  premiumChat?: boolean;
}

interface SubscribeToAnyPlanResponse {
  statusCode: number;
  message: string;
  response: SubscribeToAnyPlanData;
}

interface SubscribeToAnyPlanData {
  type: string;
  checkoutUrl: string;
  sessionId: string;
}

```

// stripeTypes.ts
```typescript
interface ConnectStripeResponse {
  statusCode: number;
  message: string;
  response: ConnectStripeData;
}

interface ConnectStripeData {
  onboardingUrl: string;
  stripeAccountId: string;
}

interface CheckStripeAccountStatusResponse {
  statusCode: number;
  message: string;
  response: CheckStripeAccountStatusData;
}

interface CheckStripeAccountStatusData {
  connected: boolean;
  stripeAccountId: string;
  status: string;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

```

// membershipTypes.ts
```typescript
interface SubscribeToMembershipPlanResponse {
  statusCode: number;
  message: string;
  response: SubscribeToMembershipPlanData;
}

interface SubscribeToMembershipPlanData {
  type: string;
  checkoutUrl: string;
  sessionId: string;
}

interface CreateClubMembershipPlanResponse {
  statusCode: number;
  message: string;
  response: CreateClubMembershipPlanData;
}

interface CreateClubMembershipPlanData {
  id: number;
  clubId: number;
  name: string;
  price: string;
  currency: string;
  billingInterval: string;
  autoRenew: boolean;
  discountPercent: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateClubMembershipPlanResponse {
  statusCode: number;
  message: string;
  response: UpdateClubMembershipPlanData;
}

interface UpdateClubMembershipPlanData {
  id: number;
  clubId: number;
  name: string;
  price: string;
  currency: string;
  billingInterval: string;
  autoRenew: boolean;
  discountPercent: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListMembershipPlansResponse {
  statusCode: number;
  message: string;
  response: ListMembershipPlansData[];
}

interface ListMembershipPlansData {
  id: number;
  clubId: number;
  name: string;
  price: string;
  currency: string;
  billingInterval: string;
  autoRenew: boolean;
  discountPercent: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MembershipPlanInfoByIdResponse {
  statusCode: number;
  message: string;
  response: MembershipPlanInfoByIdData;
}

interface MembershipPlanInfoByIdData {
  id: number;
  clubId: number;
  name: string;
  price: string;
  currency: string;
  billingInterval: string;
  autoRenew: boolean;
  discountPercent: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListSubscribedMemberResponse {
  statusCode: number;
  message: string;
  response: ListSubscribedMemberData;
}

interface ListSubscribedMemberData {
  count: number;
  rows: ListSubscribedMemberRow[];
}

interface ListSubscribedMemberRow {
  id: number;
  userId: number;
  clubId: number;
  planId: number;
  planSnapshot: PlanSnapshot;
  stripeSubscriptionId: string;
  stripePaymentIntentId: null;
  status: string;
  paymentStatus: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: null;
  createdAt: string;
  updatedAt: string;
  user: User;
  plan: Plan;
}

interface Plan {
  id: number;
  clubId: number;
  name: string;
  price: string;
  currency: string;
  billingInterval: string;
  autoRenew: boolean;
  discountPercent: string;
  features: string[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  fullName: string;
  profileImage: null;
  email: string;
}

interface PlanSnapshot {
  name: string;
  price: number;
  currency: string;
  features: string[];
  autoRenew: boolean;
  billingInterval: string;
  discountPercent: number;
}

```

// notificationTypes.ts
```typescript
interface GetUserNotificationResponse {
  statusCode: number;
  message: string;
  response: GetUserNotificationData;
}

interface GetUserNotificationData {
  count: number;
  rows: GetUserNotificationRow[];
}

interface GetUserNotificationRow {
  id: number;
  userId: number;
  clubId: number;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  metadata: Metadata;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  club: Club;
}

interface Club {
  id: number;
  clubName: string;
  logo: string;
}

interface Metadata {
  clubId: number;
  senderId: number;
}

interface GetClubNotificationsResponse {
  statusCode: number;
  message: string;
  response: GetClubNotificationsData;
}

interface GetClubNotificationsData {
  count: number;
  rows: unknown[];
}

interface MarkAsReadNotificationsResponse {
  statusCode: number;
  message: string;
  response: MarkAsReadNotificationsData;
}

interface MarkAsReadNotificationsData {
  id: number;
  userId: number;
  clubId: number;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  metadata: Metadata;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface SendSubscriptionReminderResponse {
  statusCode: number;
  message: string;
  response: SendSubscriptionReminderData;
}

interface SendSubscriptionReminderData {
  id: number;
  userId: number;
  clubId: number;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  metadata: Metadata;
  updatedAt: string;
  createdAt: string;
}

interface Metadata {
  senderId: number;
  clubId: number;
}

interface SendSubscriptionReminderToEveryoneResponse {
  statusCode: number;
  message: string;
  response: SendSubscriptionReminderToEveryoneData;
}

interface SendSubscriptionReminderToEveryoneData {
  message: string;
  sentCount: number;
}

```