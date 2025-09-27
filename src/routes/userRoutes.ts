import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
	const userController = new UserController();

	// Publiczne endpointy (bez autoryzacji)
	fastify.post('/users', userController.createUser.bind(userController));
	fastify.post('/users/login', userController.loginUser.bind(userController));

	// Chronione endpointy (wymagają autoryzacji)
	fastify.post(
		'/users/logout',
		{
			preHandler: authMiddleware,
		},
		userController.logoutUser.bind(userController),
	);

	fastify.delete(
		'/users/:id',
		{
			preHandler: authMiddleware,
		},
		userController.deleteUser.bind(userController),
	);

	fastify.get(
		'/users',
		{
			preHandler: authMiddleware,
		},
		userController.getAllUsers.bind(userController),
	);

	fastify.get(
		'/users/:id',
		{
			preHandler: authMiddleware,
		},
		userController.getUserDetails.bind(userController),
	);

	fastify.get(
		'/users/me',
		{
			preHandler: authMiddleware,
		},
		userController.getCurrentUser.bind(userController),
	);
}
