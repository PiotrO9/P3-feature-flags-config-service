import { FastifyInstance } from 'fastify';
import { flagRoutes } from './flagRoutes';
import { groupRoutes } from './groupRoutes';
import { userRoutes } from './userRoutes';

/**
 * Registers all route groups (feature flags, groups, users) with the Fastify instance.
 * Each route file encapsulates its own endpoint documentation.
 */
export async function registerRoutes(fastifyInstance: FastifyInstance): Promise<void> {
	await fastifyInstance.register(flagRoutes);
	await fastifyInstance.register(groupRoutes);
	await fastifyInstance.register(userRoutes);
}
