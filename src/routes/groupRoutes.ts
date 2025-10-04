import { FastifyInstance } from 'fastify';
import { GroupController } from '../controllers/GroupController';
import { authMiddleware } from '../middleware/auth';

/**
 * Group and group membership management routes.
 * All endpoints here require authentication (authMiddleware) – except if stated otherwise.
 */
export async function groupRoutes(fastify: FastifyInstance): Promise<void> {
	const groupController = new GroupController();

	/**
	 * Create a new group.
	 * Body: { name: string, description?: string }
	 */
	fastify.post('/groups', { preHandler: authMiddleware }, (request, reply) =>
		groupController.createGroup(request, reply),
	);

	/**
	 * Get all groups.
	 */
	fastify.get('/groups', { preHandler: authMiddleware }, (request, reply) =>
		groupController.getAllGroups(request, reply),
	);

	/**
	 * Get group by ID.
	 * Params: :groupId
	 */
	fastify.get('/groups/:groupId', { preHandler: authMiddleware }, (request, reply) =>
		groupController.getGroupById(request, reply),
	);

	/**
	 * Update a group.
	 * Params: :groupId; Body: { name?, description? }
	 */
	fastify.put('/groups/:groupId', { preHandler: authMiddleware }, (request, reply) =>
		groupController.updateGroup(request, reply),
	);

	/**
	 * Delete a group.
	 * Params: :groupId
	 */
	fastify.delete('/groups/:groupId', { preHandler: authMiddleware }, (request, reply) =>
		groupController.deleteGroup(request, reply),
	);

	/**
	 * Add a user to a group.
	 * Params: :groupId; Body: { userId }
	 */
	fastify.post('/groups/:groupId/users', { preHandler: authMiddleware }, (request, reply) =>
		groupController.addUserToGroup(request, reply),
	);

	/**
	 * Remove a user from a group.
	 * Params: :groupId, :userId
	 */
	fastify.delete(
		'/groups/:groupId/users/:userId',
		{ preHandler: authMiddleware },
		(request, reply) => groupController.removeUserFromGroup(request, reply),
	);

	/**
	 * Get list of group members.
	 * Params: :groupId
	 */
	fastify.get('/groups/:groupId/members', { preHandler: authMiddleware }, (request, reply) =>
		groupController.getGroupMembers(request, reply),
	);

	/**
	 * Get groups that a user belongs to.
	 * Params: :userId
	 */
	fastify.get('/users/:userId/groups', { preHandler: authMiddleware }, (request, reply) =>
		groupController.getUserGroups(request, reply),
	);
}
