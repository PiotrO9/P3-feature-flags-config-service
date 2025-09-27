import { FastifyReply, FastifyRequest } from 'fastify';
import { GroupService } from '../services/GroupService';
import {
	GroupParams,
	GroupUserParams,
	GroupQueryParams,
	AddUserToGroupRequest,
	CreateGroupRequest,
	UpdateGroupRequest,
} from '../types';
import { ValidationHelper, ResponseHelper } from '../helpers';

export class GroupController {
	private groupService: GroupService;

	constructor() {
		this.groupService = new GroupService();
	}

	async createGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const groupData = request.body as CreateGroupRequest;

			// Walidacja przy użyciu helpera
			const validations = ValidationHelper.combineValidations(
				ValidationHelper.validateRequired({ key: groupData.key, name: groupData.name }),
				ValidationHelper.validateGroupKey(groupData.key),
				ValidationHelper.validateStringLength(groupData.key, 2, 50, 'Group key'),
				ValidationHelper.validateStringLength(groupData.name, 2, 100, 'Group name'),
				...(groupData.description
					? [ValidationHelper.validateStringLength(groupData.description, 0, 500, 'Group description')]
					: []),
			);

			if (!validations.isValid) {
				return ResponseHelper.validationError(reply, validations.error!);
			}

			const group = await this.groupService.createGroup(groupData);
			ResponseHelper.created(reply, group);
		} catch (error: any) {
			ResponseHelper.handleServiceError(reply, error);
		}
	}

	async getAllGroups(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const query = request.query as GroupQueryParams;

			// Walidacja paginacji
			const paginationValidation = ValidationHelper.validatePagination(query.page, query.limit);
			if (!paginationValidation.isValid) {
				return ResponseHelper.validationError(reply, paginationValidation.error!);
			}

			const processedQuery = {
				...query,
				page: query.page ? Number(query.page) : undefined,
				limit: query.limit ? Number(query.limit) : undefined,
			};

			const groups = await this.groupService.getAllGroups(processedQuery);
			ResponseHelper.list(reply, groups);
		} catch (error: any) {
			ResponseHelper.serverError(reply);
		}
	}
	async getGroupById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { groupId } = request.params as GroupParams;
			const query = request.query as GroupQueryParams;

			const uuidValidation = ValidationHelper.validateUUID(groupId);
			if (!uuidValidation.isValid) {
				return ResponseHelper.validationError(reply, uuidValidation.error!);
			}

			const group = await this.groupService.getGroupById(groupId, query.includeMembers);

			if (!group) {
				return ResponseHelper.notFound(reply, 'Group');
			}

			ResponseHelper.success(reply, group);
		} catch (error: any) {
			ResponseHelper.serverError(reply);
		}
	}

	async updateGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { groupId } = request.params as GroupParams;
			const updateData = request.body as UpdateGroupRequest;

			// Kombinowana walidacja
			const validations = ValidationHelper.combineValidations(
				ValidationHelper.validateUUID(groupId),
				ValidationHelper.validateUpdateData(updateData),
				...(updateData.name !== undefined
					? [ValidationHelper.validateStringLength(updateData.name, 2, 100, 'Group name')]
					: []),
				...(updateData.description !== undefined
					? [ValidationHelper.validateStringLength(updateData.description, 0, 500, 'Group description')]
					: []),
			);

			if (!validations.isValid) {
				return ResponseHelper.validationError(reply, validations.error!);
			}

			const group = await this.groupService.updateGroup(groupId, updateData);

			if (!group) {
				return ResponseHelper.notFound(reply, 'Group');
			}

			ResponseHelper.success(reply, group);
		} catch (error: any) {
			ResponseHelper.serverError(reply);
		}
	}

	async deleteGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { groupId } = request.params as GroupParams;

			const uuidValidation = ValidationHelper.validateUUID(groupId);
			if (!uuidValidation.isValid) {
				return ResponseHelper.validationError(reply, uuidValidation.error!);
			}

			const deleted = await this.groupService.deleteGroup(groupId);

			if (!deleted) {
				return ResponseHelper.notFound(reply, 'Group');
			}

			ResponseHelper.deleted(reply, 'Group deleted successfully');
		} catch (error: any) {
			ResponseHelper.serverError(reply);
		}
	}

	async addUserToGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { groupId } = request.params as GroupParams;
			const { userId } = request.body as AddUserToGroupRequest;

			const validations = ValidationHelper.combineValidations(
				ValidationHelper.validateUUID(groupId),
				ValidationHelper.validateRequired({ userId }),
				ValidationHelper.validateUUID(userId),
			);

			if (!validations.isValid) {
				return ResponseHelper.validationError(reply, validations.error!);
			}

			const membership = await this.groupService.addUserToGroup(userId, groupId);

			if (!membership) {
				return ResponseHelper.error(
					reply,
					'Failed to add user to group. User or group may not exist, or user is already a member.',
				);
			}

			ResponseHelper.created(reply, membership);
		} catch (error: any) {
			ResponseHelper.serverError(reply);
		}
	}

	async removeUserFromGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { groupId, userId } = request.params as GroupUserParams;

			const validations = ValidationHelper.combineValidations(
				ValidationHelper.validateUUID(groupId),
				ValidationHelper.validateUUID(userId),
			);

			if (!validations.isValid) {
				return ResponseHelper.validationError(reply, validations.error!);
			}

			const removed = await this.groupService.removeUserFromGroup(userId, groupId);

			if (!removed) {
				return ResponseHelper.notFound(reply, 'User membership in group');
			}

			ResponseHelper.deleted(reply, 'User removed from group successfully');
		} catch (error: any) {
			ResponseHelper.serverError(reply);
		}
	}

	async getGroupMembers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { groupId } = request.params as GroupParams;

			const uuidValidation = ValidationHelper.validateUUID(groupId);
			if (!uuidValidation.isValid) {
				return ResponseHelper.validationError(reply, uuidValidation.error!);
			}

			const members = await this.groupService.getGroupMembers(groupId);
			ResponseHelper.list(reply, members);
		} catch (error: any) {
			ResponseHelper.serverError(reply);
		}
	}

	async getUserGroups(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { userId } = request.params as { userId: string };

			const uuidValidation = ValidationHelper.validateUUID(userId);
			if (!uuidValidation.isValid) {
				return ResponseHelper.validationError(reply, uuidValidation.error!);
			}

			const groups = await this.groupService.getUserGroups(userId);
			ResponseHelper.list(reply, groups);
		} catch (error: any) {
			ResponseHelper.serverError(reply);
		}
	}
}
