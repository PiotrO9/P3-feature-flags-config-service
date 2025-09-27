import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/UserService';

export class UserController {
	private userService: UserService;

	constructor() {
		this.userService = new UserService();
	}

	async createUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async loginUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async logoutUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async deleteUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async getAllUsers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async getUserDetails(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
}
