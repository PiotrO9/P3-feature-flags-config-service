export interface RootResponse {
	message: string;
	endpoints: string[];
}

// User interfaces
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

export interface MessageResponse {
	message: string;
}

// JWT Payload
export interface JwtPayload {
	userId: string;
	email?: string;
	iat?: number;
	exp?: number;
}

// Fastify request with user info
declare module 'fastify' {
	interface FastifyRequest {
		user?: JwtPayload;
	}

	interface FastifyInstance {
		jwt: {
			sign: (payload: any) => string;
			verify: (token: string) => any;
		};
	}
}
