import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/UserService';
import {
	CreateUserRequest,
	LoginUserRequest,
	LoginResponse,
	MessageResponse,
	UserResponse,
} from '../types';

export class UserController {
	private userService: UserService;

	constructor() {
		this.userService = new UserService();
	}

	async createUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const userData = request.body as CreateUserRequest;

			if (!userData.email || !userData.password) {
				return reply.status(400).send({
					message: 'Email and password are required',
				});
			}

			const user = await this.userService.createUser(userData);

			reply.status(201).send({
				message: 'User created successfully',
				user,
			});
		} catch (error: any) {
			if (error.message.includes('already exists')) {
				return reply.status(409).send({
					message: error.message,
				});
			}

			reply.status(500).send({
				message: 'Internal server error',
				error: error.message,
			});
		}
	}

	async loginUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { email, password } = request.body as LoginUserRequest;

			if (!email || !password) {
				return reply.status(400).send({
					message: 'Email and password are required',
				});
			}

			const user = await this.userService.verifyPassword(email, password);

			if (!user) {
				return reply.status(401).send({
					message: 'Invalid email or password',
				});
			}

			const token = request.server.jwt.sign({
				userId: user.id,
				email: user.email,
			});

			const response: LoginResponse = {
				user,
				token,
			};

			reply.send(response);
		} catch (error: any) {
			reply.status(500).send({
				message: 'Internal server error',
				error: error.message,
			});
		}
	}

	async logoutUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		// W przypadku JWT logout jest po stronie klienta (usunięcie tokena)
		// Można zaimplementować blacklistę tokenów jeśli potrzebne
		const response: MessageResponse = {
			message: 'Logged out successfully',
		};

		reply.status(200).send(response);
	}

	async deleteUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { id } = request.params as { id: string };

			if (!id) {
				return reply.status(400).send({
					message: 'User ID is required',
				});
			}

			const deleted = await this.userService.deleteUser(id);

			if (!deleted) {
				return reply.status(404).send({
					message: 'User not found',
				});
			}

			const response: MessageResponse = {
				message: 'User deleted successfully',
			};

			reply.send(response);
		} catch (error: any) {
			reply.status(500).send({
				message: 'Internal server error',
				error: error.message,
			});
		}
	}

	async getAllUsers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const users = await this.userService.getAllUsers();
			reply.send(users);
		} catch (error: any) {
			reply.status(500).send({
				message: 'Internal server error',
				error: error.message,
			});
		}
	}

	async getUserDetails(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { id } = request.params as { id: string };

			if (!id) {
				return reply.status(400).send({
					message: 'User ID is required',
				});
			}

			const user = await this.userService.getUserById(id);

			if (!user) {
				return reply.status(404).send({
					message: 'User not found',
				});
			}

			reply.send(user);
		} catch (error: any) {
			reply.status(500).send({
				message: 'Internal server error',
				error: error.message,
			});
		}
	}

	async getCurrentUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			if (!request.user) {
				return reply.status(401).send({
					message: 'User not authenticated',
				});
			}

			const user = await this.userService.getUserById(request.user.userId);

			if (!user) {
				return reply.status(404).send({
					message: 'User not found',
				});
			}

			reply.send(user);
		} catch (error: any) {
			reply.status(500).send({
				message: 'Internal server error',
				error: error.message,
			});
		}
	}
}
