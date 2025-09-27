import { FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	count?: number;
	error?: string;
}

export class ResponseHelper {
	/**
	 * Standardowa odpowiedź sukcesu
	 */
	static success<T>(
		reply: FastifyReply,
		data?: T,
		statusCode: number = 200,
		message?: string,
		count?: number,
	): void {
		const response: ApiResponse<T> = {
			success: true,
			...(data !== undefined && { data }),
			...(message && { message }),
			...(count !== undefined && { count }),
		};

		reply.status(statusCode).send(response);
	}

	/**
	 * Standardowa odpowiedź błędu
	 */
	static error(
		reply: FastifyReply,
		message: string,
		statusCode: number = 400,
		error?: string,
	): void {
		const response: ApiResponse = {
			success: false,
			message,
			...(error && { error }),
		};

		reply.status(statusCode).send(response);
	}

	/**
	 * Odpowiedź błędu walidacji
	 */
	static validationError(reply: FastifyReply, message: string): void {
		this.error(reply, message, 400);
	}

	/**
	 * Odpowiedź "nie znaleziono"
	 */
	static notFound(reply: FastifyReply, resource: string = 'Resource'): void {
		this.error(reply, `${resource} not found`, 404);
	}

	/**
	 * Odpowiedź konfliktu (już istnieje)
	 */
	static conflict(reply: FastifyReply, message: string): void {
		this.error(reply, message, 409);
	}

	/**
	 * Odpowiedź błędu serwera
	 */
	static serverError(reply: FastifyReply, message: string = 'Internal server error'): void {
		this.error(reply, message, 500);
	}

	/**
	 * Odpowiedź utworzenia zasobu
	 */
	static created<T>(reply: FastifyReply, data: T, message?: string): void {
		this.success(reply, data, 201, message);
	}

	/**
	 * Odpowiedź listy z paginacją
	 */
	static list<T>(reply: FastifyReply, data: T[], count?: number): void {
		this.success(reply, data, 200, undefined, count || data.length);
	}

	/**
	 * Odpowiedź usunięcia
	 */
	static deleted(reply: FastifyReply, message: string = 'Resource deleted successfully'): void {
		this.success(reply, undefined, 200, message);
	}

	/**
	 * Obsługa standardowych błędów service
	 */
	static handleServiceError(reply: FastifyReply, error: Error): void {
		if (error.message.includes('already exists')) {
			this.conflict(reply, error.message);
		} else if (error.message.includes('not found')) {
			this.notFound(reply);
		} else {
			this.serverError(reply);
		}
	}
}
