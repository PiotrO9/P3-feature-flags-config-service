import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RootResponse } from './types';
import { registerRoutes } from './routes';

// Create Fastify instance
const server: FastifyInstance = fastify({ logger: true });

// Register JWT plugin
server.register(require('@fastify/jwt'), {
	secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
});

// Register routes
server.register(registerRoutes);

server.get('/', async (request: FastifyRequest, reply: FastifyReply): Promise<RootResponse> => {
	return {
		message: 'Fastify TypeScript server is running!',
		endpoints: ['GET /'],
	};
});

async function start(): Promise<void> {
	try {
		await server.listen({ port: 3000, host: '0.0.0.0' });
		console.log('Server is running on http://localhost:3000');
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
