import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Create Fastify instance
const server: FastifyInstance = fastify({ logger: true });

// Define interface for test response
interface TestResponse {
	message: string;
	timestamp: string;
	status: string;
}

interface RootResponse {
	message: string;
	endpoints: string[];
}

server.get('/test', async (request: FastifyRequest, reply: FastifyReply): Promise<TestResponse> => {
	return {
		message: 'Hello from Fastify with TypeScript!',
		timestamp: new Date().toISOString(),
		status: 'success',
	};
});

server.get('/', async (request: FastifyRequest, reply: FastifyReply): Promise<RootResponse> => {
	return {
		message: 'Fastify TypeScript server is running!',
		endpoints: ['GET /', 'GET /test'],
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
