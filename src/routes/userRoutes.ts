import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

/**
 * User management and authentication routes.
 * Public endpoints: account creation and login.
 * All other endpoints require authentication.
 */
export async function userRoutes(fastify: FastifyInstance): Promise<void> {
	const userController = new UserController();

	/**
	 * Register a new user.
	 * Body: { email, password, ... }
	 */
	fastify.post('/users', userController.createUser.bind(userController));

	/**
	 * Login user and obtain session/token.
	 * Body: { email, password }
	 */
	fastify.post('/users/login', userController.loginUser.bind(userController));

	/**
	 * Logout current user (invalidate session / token context).
	 */
	fastify.post(
		'/users/logout',
		{ preHandler: authMiddleware },
		userController.logoutUser.bind(userController),
	);

	/**
	 * Delete a user by ID.
	 * Params: :id
	 */
	fastify.delete(
		'/users/:id',
		{ preHandler: authMiddleware },
		userController.deleteUser.bind(userController),
	);

	/**
	 * Get all users.
	 */
	fastify.get(
		'/users',
		{ preHandler: authMiddleware },
		userController.getAllUsers.bind(userController),
	);

	/**
	 * Get a single user by ID.
	 * Params: :id
	 */
	fastify.get(
		'/users/:id',
		{ preHandler: authMiddleware },
		userController.getUserDetails.bind(userController),
	);

	/**
	 * Get the currently authenticated user's profile.
	 */
	fastify.get(
		'/users/me',
		{ preHandler: authMiddleware },
		userController.getCurrentUser.bind(userController),
	);
}
