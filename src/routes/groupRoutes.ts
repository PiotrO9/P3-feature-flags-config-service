import { FastifyInstance } from 'fastify';
import { GroupController } from '../controllers/GroupController';

export async function groupRoutes(fastify: FastifyInstance): Promise<void> {
	const groupController = new GroupController();

	fastify.post('/groups', (request, reply) => groupController.createGroup(request, reply));
	fastify.get('/groups', (request, reply) => groupController.getAllGroups(request, reply));
	fastify.put('/groups/:groupId', (request, reply) => groupController.updateGroup(request, reply));
	fastify.delete('/groups/:groupId', (request, reply) =>
		groupController.deleteGroup(request, reply),
	);
	fastify.post('/groups/:groupId/users/:userId', (request, reply) =>
		groupController.addUserToGroup(request, reply),
	);
	fastify.delete('/groups/:groupId/users/:userId', (request, reply) =>
		groupController.removeUserFromGroup(request, reply),
	);
}
