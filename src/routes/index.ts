import { FastifyInstance } from 'fastify';
import { flagRoutes } from './flagRoutes';

export async function registerRoutes(fastifyInstance: FastifyInstance): Promise<void> {
	await fastifyInstance.register(flagRoutes);
}
