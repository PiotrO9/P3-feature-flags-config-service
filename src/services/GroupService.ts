import { getPrisma } from '../config/database';
import {
	UserGroupRequest,
	UserGroupUpdateRequest,
	UserGroupResponse,
	UserGroupWithMembersResponse,
	UserGroupMembershipResponse,
	GroupQueryParams,
} from '../types';
import { DatabaseHelper } from '../helpers';

export class GroupService {
	async createGroup(data: UserGroupRequest): Promise<UserGroupResponse> {
		const existingGroup = await getPrisma().userGroup.findUnique({
			where: { key: data.key },
		});

		if (existingGroup) {
			throw new Error('Group with this key already exists');
		}

		const group = await getPrisma().userGroup.create({
			data: {
				key: data.key,
				name: data.name,
				description: data.description,
				isActive: data.isActive !== undefined ? data.isActive : true,
			},
			include: DatabaseHelper.getGroupWithCountInclude(),
		});

		return this.mapToGroupResponse(group);
	}

	async getGroupById(
		id: string,
		includeMembers: boolean = false,
	): Promise<UserGroupResponse | UserGroupWithMembersResponse | null> {
		const group = await getPrisma().userGroup.findUnique({
			where: { id },
			include: includeMembers
				? DatabaseHelper.getGroupWithMembersInclude()
				: DatabaseHelper.getGroupWithCountInclude(),
		});

		if (!group) return null;

		return includeMembers
			? this.mapToGroupWithMembersResponse(group)
			: this.mapToGroupResponse(group);
	}

	async getGroupByKey(key: string): Promise<UserGroupResponse | null> {
		const group = await getPrisma().userGroup.findUnique({
			where: { key },
			include: DatabaseHelper.getGroupWithCountInclude(),
		});

		return group ? this.mapToGroupResponse(group) : null;
	}

	async getAllGroups(params: GroupQueryParams = {}): Promise<UserGroupResponse[]> {
		const { isActive, search, page = 1, limit = 50 } = params;

		const groups = await getPrisma().userGroup.findMany({
			where: DatabaseHelper.buildGroupSearchWhere(isActive, search),
			include: DatabaseHelper.getGroupWithCountInclude(),
			orderBy: DatabaseHelper.getDefaultOrderBy(),
			...DatabaseHelper.getPaginationOptions(page, limit),
		});

		return groups.map(group => this.mapToGroupResponse(group));
	}

	async updateGroup(id: string, data: UserGroupUpdateRequest): Promise<UserGroupResponse | null> {
		try {
			const group = await getPrisma().userGroup.update({
				where: { id },
				data: {
					name: data.name,
					description: data.description,
					isActive: data.isActive,
				},
				include: DatabaseHelper.getGroupWithCountInclude(),
			});

			return this.mapToGroupResponse(group);
		} catch (error) {
			return null;
		}
	}

	async deleteGroup(id: string): Promise<boolean> {
		try {
			const group = await getPrisma().userGroup.findUnique({
				where: { id },
				include: DatabaseHelper.getGroupWithFullCountInclude(),
			});

			if (!group) {
				return false;
			}

			await getPrisma().userGroup.delete({
				where: { id },
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	async addUserToGroup(
		userId: string,
		groupId: string,
	): Promise<UserGroupMembershipResponse | null> {
		try {
			const user = await getPrisma().user.findUnique({ where: { id: userId } });
			const group = await getPrisma().userGroup.findUnique({ where: { id: groupId } });

			if (!user) {
				throw new Error('User not found');
			}

			if (!group) {
				throw new Error('Group not found');
			}

			const existingMembership = await getPrisma().userGroupMembership.findUnique({
				where: DatabaseHelper.getMembershipUniqueWhere(userId, groupId),
			});

			if (existingMembership) {
				throw new Error('User is already a member of this group');
			}

			const membership = await getPrisma().userGroupMembership.create({
				data: {
					userId,
					groupId,
				},
				include: DatabaseHelper.getMembershipWithDetailsInclude(),
			});

			return this.mapToMembershipResponse(membership);
		} catch (error) {
			return null;
		}
	}

	async removeUserFromGroup(userId: string, groupId: string): Promise<boolean> {
		try {
			await getPrisma().userGroupMembership.delete({
				where: DatabaseHelper.getMembershipUniqueWhere(userId, groupId),
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	async getGroupMembers(groupId: string): Promise<UserGroupMembershipResponse[]> {
		const memberships = await getPrisma().userGroupMembership.findMany({
			where: { groupId },
			include: DatabaseHelper.getMembershipWithDetailsInclude(),
			orderBy: DatabaseHelper.getDefaultOrderBy(),
		});

		return memberships.map(membership => this.mapToMembershipResponse(membership));
	}

	async getUserGroups(userId: string): Promise<UserGroupResponse[]> {
		const memberships = await getPrisma().userGroupMembership.findMany({
			where: { userId },
			include: {
				group: {
					include: {
						_count: {
							select: {
								memberships: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		return memberships.map(membership => this.mapToGroupResponse(membership.group));
	}

	private mapToGroupResponse(group: any): UserGroupResponse {
		return {
			id: group.id,
			key: group.key,
			name: group.name,
			description: group.description,
			isActive: group.isActive,
			createdAt: group.createdAt,
			updatedAt: group.updatedAt,
			memberCount: group._count?.memberships || 0,
		};
	}

	private mapToGroupWithMembersResponse(group: any): UserGroupWithMembersResponse {
		return {
			...this.mapToGroupResponse(group),
			memberships:
				group.memberships?.map((membership: any) => this.mapToMembershipResponse(membership)) || [],
		};
	}

	private mapToMembershipResponse(membership: any): UserGroupMembershipResponse {
		return {
			id: membership.id,
			userId: membership.userId,
			groupId: membership.groupId,
			createdAt: membership.createdAt,
			user: membership.user
				? {
						id: membership.user.id,
						email: membership.user.email,
						name: membership.user.name,
				  }
				: undefined,
			group: membership.group
				? {
						id: membership.group.id,
						key: membership.group.key,
						name: membership.group.name,
				  }
				: undefined,
		};
	}
}
