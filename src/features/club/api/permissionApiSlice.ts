import { apiSlice } from '@/api/apiSlice';
import { PermissionTypes } from '@/api/types';

export const permissionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClubPermissions: builder.query<PermissionTypes.GetClubPermissionsResponseResponse, PermissionTypes.GetClubPermissionsParams>({
      query: (params) => ({
        url: '/user/club/permissions',
        method: 'GET',
        params,
      }),
      providesTags: ['Permission'],
    }),

    savePermissionsForRole: builder.mutation<PermissionTypes.MemberPermissionElement[], PermissionTypes.SavePermissionsForRoleRequest>({
      query: (body) => ({
        url: '/user/club/permissions/role',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Permission', 'Club'],
    }),

    applyPermissionTogglesForSelectedMembers: builder.mutation<PermissionTypes.MemberPermissionElement[], PermissionTypes.ApplyPermissionTogglesForSelectedMembersRequest>({
      query: (body) => ({
        url: '/user/club/permissions/members',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Permission', 'Club'],
    }),

    grantRevokeFullClubAccessForOneMember: builder.mutation<PermissionTypes.FullAccessMemberElement, PermissionTypes.GrantRevokeFullClubAccessForOneMemberRequest>({
      query: (body) => ({
        url: '/user/club/permissions/full-access',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Permission', 'Club'],
    }),

    assignRoleToMember: builder.mutation<PermissionTypes.AssignRoleToMemberResponse, PermissionTypes.AssignRoleToMemberRequest>({
      query: (body) => ({
        url: '/user/club/member/role',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Permission', 'Club'],
    }),

    removeFullAccessPermission: builder.mutation<PermissionTypes.RemoveFullAccessPermissionResponse, PermissionTypes.RemoveFullAccessPermissionRequest>({
      query: (body) => ({
        url: '/user/club/permissions/remove-full-access',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Permission', 'Club'],
    }),
  }),
});

export const {
  useGetClubPermissionsQuery,
  useSavePermissionsForRoleMutation,
  useApplyPermissionTogglesForSelectedMembersMutation,
  useGrantRevokeFullClubAccessForOneMemberMutation,
  useAssignRoleToMemberMutation,
  useRemoveFullAccessPermissionMutation,
} = permissionApiSlice;
