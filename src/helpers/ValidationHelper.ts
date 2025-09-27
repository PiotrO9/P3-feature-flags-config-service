export interface ValidationResult {
	isValid: boolean;
	error?: string;
}

export class ValidationHelper {
	/**
	 * Waliduje format UUID
	 */
	static validateUUID(uuid: string): ValidationResult {
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

		if (!uuidRegex.test(uuid)) {
			return { isValid: false, error: 'Invalid UUID format' };
		}

		return { isValid: true };
	}

	/**
	 * Waliduje długość stringa
	 */
	static validateStringLength(
		value: string,
		minLength: number,
		maxLength: number,
		fieldName: string,
	): ValidationResult {
		if (value.length < minLength || value.length > maxLength) {
			return {
				isValid: false,
				error: `${fieldName} must be between ${minLength} and ${maxLength} characters long`,
			};
		}

		return { isValid: true };
	}

	/**
	 * Waliduje klucz grupy (alfanumeryczne + podkreślniki/myślniki)
	 */
	static validateGroupKey(key: string): ValidationResult {
		if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
			return {
				isValid: false,
				error: 'Group key must contain only alphanumeric characters, hyphens, and underscores',
			};
		}

		return { isValid: true };
	}

	/**
	 * Waliduje czy wymagane pola są wypełnione
	 */
	static validateRequired(fields: Record<string, any>): ValidationResult {
		const missingFields = Object.entries(fields)
			.filter(([_, value]) => !value)
			.map(([key, _]) => key);

		if (missingFields.length > 0) {
			return {
				isValid: false,
				error: `${missingFields.join(', ')} ${missingFields.length === 1 ? 'is' : 'are'} required`,
			};
		}

		return { isValid: true };
	}

	/**
	 * Waliduje parametry paginacji
	 */
	static validatePagination(page?: string | number, limit?: string | number): ValidationResult {
		if (page !== undefined) {
			const pageNum = Number(page);
			if (isNaN(pageNum) || pageNum < 1) {
				return { isValid: false, error: 'Page must be a positive number' };
			}
		}

		if (limit !== undefined) {
			const limitNum = Number(limit);
			if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
				return { isValid: false, error: 'Limit must be a positive number between 1 and 100' };
			}
		}

		return { isValid: true };
	}

	/**
	 * Waliduje czy obiekt ma jakieś właściwości do aktualizacji
	 */
	static validateUpdateData(data: Record<string, any>): ValidationResult {
		if (Object.keys(data).length === 0) {
			return { isValid: false, error: 'No update data provided' };
		}

		return { isValid: true };
	}

	/**
	 * Kombinuje walidacje i zwraca pierwszy błąd
	 */
	static combineValidations(...validations: ValidationResult[]): ValidationResult {
		for (const validation of validations) {
			if (!validation.isValid) {
				return validation;
			}
		}

		return { isValid: true };
	}
}
