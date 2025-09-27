/**
 * User group-related type definitions
 */

export interface UserGroupRequest {
	key: string;
	name: string;
	description?: string;
	isActive?: boolean;
}

export interface UserGroupUpdateRequest {
	name?: string;
	description?: string;
	isActive?: boolean;
}

export interface UserGroupResponse {
	id: string;
	key: string;
	name: string;
	description?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	memberCount?: number;
}

export interface UserGroupWithMembersResponse extends UserGroupResponse {
	memberships: UserGroupMembershipResponse[];
}

export interface UserGroupMembershipRequest {
	userId: string;
	groupId: string;
}

export interface UserGroupMembershipResponse {
	id: string;
	userId: string;
	groupId: string;
	createdAt: Date;
	user?: {
		id: string;
		email?: string;
		name?: string;
	};
	group?: {
		id: string;
		key: string;
		name: string;
	};
}

// Route parameter types
export interface GroupParams {
	groupId: string;
}

export interface GroupUserParams {
	groupId: string;
	userId: string;
}

// Query parameter types
export interface GroupQueryParams {
	includeMembers?: boolean;
	isActive?: boolean;
	search?: string;
	page?: number;
	limit?: number;
}

// Request body types for specific endpoints
export interface AddUserToGroupRequest {
	userId: string;
}

export interface CreateGroupRequest extends UserGroupRequest {}

export interface UpdateGroupRequest extends UserGroupUpdateRequest {}
