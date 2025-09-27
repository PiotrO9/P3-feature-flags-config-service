/**
 * Authentication-related type definitions
 */

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
