import { FastifyInstance } from 'fastify';
import { GroupController } from '../controllers/GroupController';
import { authMiddleware } from '../middleware/auth';

export async function groupRoutes(fastify: FastifyInstance): Promise<void> {
	const groupController = new GroupController();

	// Group CRUD operations - wszystkie wymagają autoryzacji
	fastify.post(
		'/groups',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.createGroup(request, reply),
	);

	fastify.get(
		'/groups',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.getAllGroups(request, reply),
	);

	fastify.get(
		'/groups/:groupId',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.getGroupById(request, reply),
	);

	fastify.put(
		'/groups/:groupId',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.updateGroup(request, reply),
	);

	fastify.delete(
		'/groups/:groupId',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.deleteGroup(request, reply),
	);

	// Group membership operations - wszystkie wymagają autoryzacji
	fastify.post(
		'/groups/:groupId/users',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.addUserToGroup(request, reply),
	);

	fastify.delete(
		'/groups/:groupId/users/:userId',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.removeUserFromGroup(request, reply),
	);

	fastify.get(
		'/groups/:groupId/members',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.getGroupMembers(request, reply),
	);

	// User groups lookup - wymaga autoryzacji
	fastify.get(
		'/users/:userId/groups',
		{
			preHandler: authMiddleware,
		},
		(request, reply) => groupController.getUserGroups(request, reply),
	);
}
