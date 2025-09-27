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
		endpoints: [
			'GET /',
			// Flag endpoints
			'POST /flags',
			'GET /flags',
			'PUT /flags/:id',
			'PATCH /flags/:id/toggle',
			'POST /flags/:id/rules',
			'DELETE /flags/:id/rules',
			'POST /evaluate',
			// User endpoints (public)
			'POST /users',
			'POST /users/login',
			// User endpoints (protected)
			'POST /users/logout [AUTH]',
			'DELETE /users/:id [AUTH]',
			'GET /users [AUTH]',
			'GET /users/:id [AUTH]',
			'GET /users/me [AUTH]',
			// Group endpoints (all protected)
			'POST /groups [AUTH]',
			'GET /groups [AUTH]',
			'GET /groups/:groupId [AUTH]',
			'PUT /groups/:groupId [AUTH]',
			'DELETE /groups/:groupId [AUTH]',
			'POST /groups/:groupId/users [AUTH]',
			'DELETE /groups/:groupId/users/:userId [AUTH]',
			'GET /groups/:groupId/members [AUTH]',
			'GET /users/:userId/groups [AUTH]',
		],
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
