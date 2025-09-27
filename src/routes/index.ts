import { FastifyInstance } from 'fastify';
import { flagRoutes } from './flagRoutes';
import { groupRoutes } from './groupRoutes';
import { userRoutes } from './userRoutes';

export async function registerRoutes(fastifyInstance: FastifyInstance): Promise<void> {
	await fastifyInstance.register(flagRoutes);
	await fastifyInstance.register(groupRoutes);
	await fastifyInstance.register(userRoutes);
}
