import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtPayload } from '../types';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
	try {
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			return reply.status(401).send({ message: 'Authorization header is required' });
		}

		const token = authHeader.replace('Bearer ', '');

		if (!token) {
			return reply.status(401).send({ message: 'Token is required' });
		}

		// Weryfikuj token
		const decoded = request.server.jwt.verify(token) as JwtPayload;
		request.user = decoded;
	} catch (error) {
		return reply.status(401).send({ message: 'Invalid token' });
	}
}
