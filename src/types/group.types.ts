/**
 * User group-related type definitions
 */

export interface UserGroupRequest {
	key: string;
	name: string;
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
