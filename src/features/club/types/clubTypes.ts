export interface Club {
  id: number;
  clubName: string;
  clubPrivacyId: number; // 1 = Public, 2 = Private
  clubTypeId: number;
  email: string;
  phone?: string;
  location: string;
  description: string;
  logo: string;
  coverImage: string;
  restrictUnpaidMembers: boolean;
  restrictClubShop: boolean;
  restrictJoinActivities: boolean;
  invitationCode?: string;
  invitationCodeExpiresAt?: string;
  memberCount?: number;
  totalMembers?: number;
  membersCount?: number;
  ownerId?: number;
  createdAt?: string;
}

export interface ClubState {
  myClubs: Club[];        // Managed clubs (Owner or Admin) — owned=true API
  joinedClubs: Club[];    // Clubs the user has joined as a regular member
  exploreClubs: Club[];   // Public clubs available to join (Athlete)
  currentClub: Club | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateClubPayload {
  clubName: string;
  clubPrivacyId: number;
  clubTypeId: number;
  email: string;
  location: string;
  description: string;
  logo: string;
  coverImage: string;
  restrictUnpaidMembers: boolean;
  restrictClubShop: boolean;
  restrictJoinActivities: boolean;
}
