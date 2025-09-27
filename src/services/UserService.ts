import { getPrisma } from '../config/database';
import * as bcrypt from 'bcrypt';
import { CreateUserRequest, UserResponse } from '../types';

export class UserService {
	private readonly saltRounds = 10;

	async createUser(data: CreateUserRequest): Promise<UserResponse> {
		const existingUser = await getPrisma().user.findUnique({
			where: { email: data.email },
		});

		if (existingUser) {
			throw new Error('User with this email already exists');
		}

		const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

		const user = await getPrisma().user.create({
			data: {
				email: data.email,
				password: hashedPassword,
				name: data.name,
				attributes: data.attributes || {},
			},
		});

		return this.mapToUserResponse(user);
	}

	async getUserById(id: string): Promise<UserResponse | null> {
		const user = await getPrisma().user.findUnique({
			where: { id },
		});

		return user ? this.mapToUserResponse(user) : null;
	}

	async getUserByEmail(email: string): Promise<UserResponse | null> {
		const user = await getPrisma().user.findUnique({
			where: { email },
		});

		return user ? this.mapToUserResponse(user) : null;
	}

	async getAllUsers(): Promise<UserResponse[]> {
		const users = await getPrisma().user.findMany({
			orderBy: { createdAt: 'desc' },
		});

		return users.map(this.mapToUserResponse);
	}

	async deleteUser(id: string): Promise<boolean> {
		try {
			await getPrisma().user.delete({
				where: { id },
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	async verifyPassword(email: string, password: string): Promise<UserResponse | null> {
		const user = await getPrisma().user.findUnique({
			where: { email },
		});

		if (!user) {
			return null;
		}

		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			return null;
		}

		return this.mapToUserResponse(user);
	}

	private mapToUserResponse(user: any): UserResponse {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			attributes: user.attributes,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}
}
