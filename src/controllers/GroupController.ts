import { FastifyReply, FastifyRequest } from 'fastify';
import { GroupService } from '../services/GroupService';

export class GroupController {
	private groupService: GroupService;

	constructor() {
		this.groupService = new GroupService();
	}

	async createGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async getAllGroups(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async updateGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async deleteGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async addUserToGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async removeUserFromGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
}
