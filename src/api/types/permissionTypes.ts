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

export type GetClubPermissionsParams = {
    clubId: number | string;
}

export type SavePermissionsForRoleRequest = {
    clubId:      number;
    roleId:      number;
    permissions: { permissionId: number; isAllowed: boolean }[];
}

export type ApplyPermissionTogglesForSelectedMembersRequest = {
    clubId:      number;
    userIds:     number[];
    permissions: { permissionId: number; isAllowed: boolean }[];
}

export type GrantRevokeFullClubAccessForOneMemberRequest = {
    clubId:       number;
    userId:       number;
    isFullAccess: boolean;
}

export type AssignRoleToMemberRequest = {
    clubId: number;
    userId: number;
    roleId: number;
}

export type AssignRoleToMemberResponse = {
    statusCode: number;
    message:    string;
}

export type RemoveFullAccessPermissionRequest = {
    clubId: number;
    userId: number;
}

export type RemoveFullAccessPermissionResponse = {
    statusCode: number;
    message:    string;
}


