import {
	FeatureFlagRequest,
	TargetingRuleRequest,
	FlagEvaluationRequest,
	FeatureFlagType,
	TargetingType,
} from '../types/flag.types';

export class FlagValidator {
	/**
	 * Validate flag creation data
	 */
	static validateFlagCreation(flagData: FeatureFlagRequest): string[] {
		const errors: string[] = [];

		if (!flagData.key?.trim()) {
			errors.push('Key is required and cannot be empty');
		}

		if (!flagData.type) {
			errors.push('Type is required');
		}

		// Type-specific validation
		if (flagData.type === FeatureFlagType.BOOLEAN) {
			if (flagData.isEnabled === undefined) {
				errors.push('isEnabled is required for BOOLEAN flags');
			}
		}

		if (flagData.type === FeatureFlagType.PERCENTAGE) {
			if (flagData.rolloutPercentage === undefined) {
				errors.push('rolloutPercentage is required for PERCENTAGE flags');
			} else if (flagData.rolloutPercentage < 0 || flagData.rolloutPercentage > 100) {
				errors.push('rolloutPercentage must be between 0 and 100');
			}
		}

		if (flagData.type === FeatureFlagType.CONFIG) {
			if (!flagData.configJson) {
				errors.push('configJson is required for CONFIG flags');
			}
		}

		return errors;
	}

	/**
	 * Validate flag update data
	 */
	static validateFlagUpdate(flagData: Partial<FeatureFlagRequest>): string[] {
		const errors: string[] = [];

		// Only validate type-specific fields if they are provided
		if (flagData.type === FeatureFlagType.PERCENTAGE && flagData.rolloutPercentage !== undefined) {
			if (flagData.rolloutPercentage < 0 || flagData.rolloutPercentage > 100) {
				errors.push('rolloutPercentage must be between 0 and 100');
			}
		}

		return errors;
	}

	/**
	 * Validate targeting rule data
	 */
	static validateTargetingRule(ruleData: TargetingRuleRequest): string[] {
		const errors: string[] = [];

		if (!ruleData.targetingType) {
			errors.push('Targeting type is required');
		}

		if (ruleData.targetingType === TargetingType.ATTRIBUTE) {
			if (!ruleData.attribute?.trim()) {
				errors.push('Attribute is required for ATTRIBUTE targeting');
			}
			if (!ruleData.operator) {
				errors.push('Operator is required for ATTRIBUTE targeting');
			}
			if (ruleData.value === undefined) {
				errors.push('Value is required for ATTRIBUTE targeting');
			}
		}

		if (ruleData.targetingType === TargetingType.GROUP) {
			if (!ruleData.groupId?.trim()) {
				errors.push('Group ID is required for GROUP targeting');
			}
		}

		return errors;
	}

	/**
	 * Validate flag evaluation request
	 */
	static validateFlagEvaluation(request: FlagEvaluationRequest): string[] {
		const errors: string[] = [];

		if (!request.flagKey?.trim()) {
			errors.push('Flag key is required and cannot be empty');
		}

		return errors;
	}

	/**
	 * Validate ID parameters
	 */
	static validateId(id: string, fieldName: string = 'ID'): string[] {
		const errors: string[] = [];

		if (!id?.trim()) {
			errors.push(`${fieldName} is required and cannot be empty`);
		}

		return errors;
	}
}
