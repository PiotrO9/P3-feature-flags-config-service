import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
	const userController = new UserController();

	fastify.post('/users', userController.createUser.bind(userController));
	fastify.post('/users/login', userController.loginUser.bind(userController));
	fastify.post('/users/logout', userController.logoutUser.bind(userController));
	fastify.delete('/users/:id', userController.deleteUser.bind(userController));
	fastify.get('/users', userController.getAllUsers.bind(userController));
	fastify.get('/users/:id', userController.getUserDetails.bind(userController));
}
