export type GetClubPermissionsResponse = {
    statusCode: number;
    message:    string;
    response:   GetClubPermissionsResponseResponse;
}

export type GetClubPermissionsResponseResponse = {
    members:           FullAccessMemberElement[];
    rolePermissions:   MemberPermissionElement[];
    memberPermissions: MemberPermissionElement[];
    fullAccessMembers: FullAccessMemberElement[];
}

export type FullAccessMemberElement = {
    id:            number;
    clubId:        number;
    userId:        number;
    isFullAccess?: boolean;
    createdAt:     Date;
    updatedAt:     Date;
    deletedAt?:    null;
    user?:         User;
    status?:       string;
}

export type User = {
    id:           number;
    fullName:     string;
    profileImage: null;
}

export type MemberPermissionElement = {
    permissionName: string;
    id:             number;
    clubId:         number;
    userId?:        number;
    permissionId:   number;
    isAllowed:      boolean;
    createdAt:      Date;
    updatedAt:      Date;
    deletedAt?:     null;
    roleName?:      string;
    roleId?:        number;
}

export type ApplyPermissionTogglesForSelectedMembersResponse = {
    statusCode: number;
    message:    string;
    response:   MemberPermissionElement[];
}

export type GrantRevokeFullClubAccessForOneMemberResponse = {
    statusCode: number;
    message:    string;
    response:   FullAccessMemberElement;
}

