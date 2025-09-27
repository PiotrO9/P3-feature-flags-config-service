/**
 * User-related type definitions
 */

export interface CreateUserRequest {
	email: string;
	password: string;
	name?: string;
	attributes?: Record<string, any>;
}

export interface LoginUserRequest {
	email: string;
	password: string;
}

export interface UserResponse {
	id: string;
	email?: string;
	name?: string;
	attributes?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

export interface LoginResponse {
	user: UserResponse;
	token: string;
}
