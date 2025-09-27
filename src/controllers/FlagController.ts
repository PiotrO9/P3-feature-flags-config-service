import { FastifyReply, FastifyRequest } from 'fastify';
import { FlagService } from '../services/FlagService';

export class FlagController {
	private flagService: FlagService;

	constructor() {
		this.flagService = new FlagService();
	}

	async createFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async getAllFlags(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async updateFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async toggleFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async addRuleToFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async removeFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
	async evaluate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// TODO
	}
}
