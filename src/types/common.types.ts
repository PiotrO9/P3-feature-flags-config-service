/**
 * Common type definitions shared across the application
 */

export interface RootResponse {
	message: string;
	endpoints: string[];
}

export interface MessageResponse {
	message: string;
}

export interface ApiError {
	message: string;
	error?: string;
	statusCode?: number;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	offset?: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
