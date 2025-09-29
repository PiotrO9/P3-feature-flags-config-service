import { getPrisma } from '../config/database';
import {
	FeatureFlagRequest,
	FeatureFlagResponse,
	TargetingRuleRequest,
	TargetingRuleResponse,
	FlagEvaluationRequest,
	FlagEvaluationResponse,
	FeatureFlagType,
	TargetingType,
	Operator,
} from '../types/flag.types';
import { FLAG_INCLUDES, FLAG_ORDER_BY, FLAG_ERRORS } from '../constants/flag.constants';
import type { PrismaClient, FeatureFlag, TargetingRule } from '../generated/prisma';

export class FlagService {
	private readonly prisma: PrismaClient = getPrisma();

	/**
	 * Create a new feature flag
	 */
	async createFlag(flagData: FeatureFlagRequest): Promise<FeatureFlagResponse> {
		const createData = this.buildFlagCreateData(flagData);

		const flag = await this.prisma.featureFlag.create({
			data: createData,
			include: FLAG_INCLUDES.FULL,
		});

		return this.mapFlagToResponse(flag);
	}

	/**
	 * Build create data based on flag type
	 */
	private buildFlagCreateData(flagData: FeatureFlagRequest) {
		const baseData = {
			key: flagData.key,
			description: flagData.description,
			type: flagData.type,
		};

		const typeSpecificData = this.getTypeSpecificData(flagData);
		return { ...baseData, ...typeSpecificData };
	}

	/**
	 * Get type-specific data for flag creation/update
	 */
	private getTypeSpecificData(flagData: Partial<FeatureFlagRequest>) {
		const data: Record<string, any> = {};

		switch (flagData.type) {
			case FeatureFlagType.BOOLEAN:
				data.isEnabled = flagData.isEnabled;
				break;
			case FeatureFlagType.PERCENTAGE:
				data.rolloutPercentage = flagData.rolloutPercentage;
				break;
			case FeatureFlagType.CONFIG:
				data.configJson = flagData.configJson;
				break;
		}

		return data;
	}

	/**
	 * Get all feature flags
	 */
	async getAllFlags(): Promise<FeatureFlagResponse[]> {
		const flags = await this.prisma.featureFlag.findMany({
			include: FLAG_INCLUDES.FULL,
			orderBy: FLAG_ORDER_BY,
		});

		return flags.map(flag => this.mapFlagToResponse(flag));
	}

	/**
	 * Get a single flag by ID
	 */
	async getFlagById(id: string): Promise<FeatureFlagResponse | null> {
		const flag = await this.prisma.featureFlag.findUnique({
			where: { id },
			include: FLAG_INCLUDES.FULL,
		});

		return flag ? this.mapFlagToResponse(flag) : null;
	}

	/**
	 * Get a single flag by key
	 */
	async getFlagByKey(key: string): Promise<FeatureFlagResponse | null> {
		const flag = await this.prisma.featureFlag.findUnique({
			where: { key },
			include: FLAG_INCLUDES.FULL,
		});

		return flag ? this.mapFlagToResponse(flag) : null;
	}

	/**
	 * Find flag or throw error if not found
	 */
	private async findFlagOrThrow(id: string): Promise<FeatureFlag> {
		const flag = await this.prisma.featureFlag.findUnique({
			where: { id },
		});

		if (!flag) {
			throw new Error(FLAG_ERRORS.FLAG_NOT_FOUND);
		}

		return flag;
	}

	/**
	 * Update a feature flag
	 */
	async updateFlag(
		id: string,
		flagData: Partial<FeatureFlagRequest>,
		updatedBy: string,
	): Promise<FeatureFlagResponse> {
		const oldFlag = await this.findFlagOrThrow(id);
		const updateData = this.buildUpdateData(flagData);

		const updatedFlag = await this.prisma.featureFlag.update({
			where: { id },
			data: updateData,
			include: FLAG_INCLUDES.FULL,
		});

		await this.logFlagChange(id, updatedBy, oldFlag, updatedFlag);
		return this.mapFlagToResponse(updatedFlag);
	}

	/**
	 * Build update data from partial flag data
	 */
	private buildUpdateData(flagData: Partial<FeatureFlagRequest>) {
		const updateData: Record<string, any> = {};

		if (flagData.description !== undefined) {
			updateData.description = flagData.description;
		}

		if (flagData.type !== undefined) {
			updateData.type = flagData.type;
			// Reset other type-specific fields when type changes
			this.resetTypeFields(updateData, flagData.type);
			// Apply new type-specific data
			Object.assign(updateData, this.getTypeSpecificData(flagData));
		} else {
			// If type doesn't change, just update type-specific fields
			Object.assign(updateData, this.getTypeSpecificData(flagData));
		}

		return updateData;
	}

	/**
	 * Reset type-specific fields when type changes
	 */
	private resetTypeFields(updateData: Record<string, any>, newType: FeatureFlagType) {
		if (newType !== FeatureFlagType.BOOLEAN) {
			updateData.isEnabled = null;
		}
		if (newType !== FeatureFlagType.PERCENTAGE) {
			updateData.rolloutPercentage = null;
		}
		if (newType !== FeatureFlagType.CONFIG) {
			updateData.configJson = null;
		}
	}

	/**
	 * Toggle flag enabled state (for BOOLEAN flags)
	 */
	async toggleFlag(id: string, updatedBy: string): Promise<FeatureFlagResponse> {
		const flag = await this.findFlagOrThrow(id);

		if (flag.type !== FeatureFlagType.BOOLEAN) {
			throw new Error(FLAG_ERRORS.ONLY_BOOLEAN_CAN_TOGGLE);
		}

		const newEnabledState = !flag.isEnabled;
		const updatedFlag = await this.prisma.featureFlag.update({
			where: { id },
			data: { isEnabled: newEnabledState },
			include: FLAG_INCLUDES.FULL,
		});

		await this.logFlagChange(id, updatedBy, flag, updatedFlag);
		return this.mapFlagToResponse(updatedFlag);
	}

	/**
	 * Delete a feature flag
	 */
	async deleteFlag(id: string): Promise<void> {
		await this.findFlagOrThrow(id);
		await this.prisma.featureFlag.delete({
			where: { id },
		});
	}

	/**
	 * Add a targeting rule to a flag
	 */
	async addTargetingRule(
		flagId: string,
		ruleData: TargetingRuleRequest,
	): Promise<TargetingRuleResponse> {
		await this.findFlagOrThrow(flagId);

		const rule = await this.prisma.targetingRule.create({
			data: {
				flagId,
				targetingType: ruleData.targetingType,
				attribute: ruleData.attribute,
				operator: ruleData.operator,
				value: ruleData.value,
				groupId: ruleData.groupId,
			},
			include: {
				group: true,
			},
		});

		return this.mapRuleToResponse(rule);
	}

	/**
	 * Remove a targeting rule
	 */
	async removeTargetingRule(ruleId: string): Promise<void> {
		const rule = await this.prisma.targetingRule.findUnique({
			where: { id: ruleId },
		});

		if (!rule) {
			throw new Error(FLAG_ERRORS.RULE_NOT_FOUND);
		}

		await this.prisma.targetingRule.delete({
			where: { id: ruleId },
		});
	}

	/**
	 * Evaluate a feature flag for a user
	 */
	async evaluateFlag(request: FlagEvaluationRequest): Promise<FlagEvaluationResponse> {
		const flag = await this.prisma.featureFlag.findUnique({
			where: { key: request.flagKey },
			include: FLAG_INCLUDES.WITH_RULES_AND_MEMBERSHIPS,
		});

		if (!flag) {
			throw new Error(FLAG_ERRORS.FLAG_NOT_FOUND);
		}

		const { result, matched } = await this.evaluateFlagLogic(flag, request);

		// Log the evaluation
		if (request.userId) {
			await this.logFlagEvaluation(flag.id, request.userId, result);
		}

		return {
			flagKey: request.flagKey,
			result,
			matched,
		};
	}

	/**
	 * Evaluate flag logic separated for better testability
	 */
	private async evaluateFlagLogic(flag: any, request: FlagEvaluationRequest) {
		let matched = await this.checkTargetingRules(flag.targetingRules, request);

		// If no targeting rules matched but there are no rules, apply to everyone
		if (!matched && flag.targetingRules.length === 0) {
			matched = true;
		}

		const result = matched ? this.getFlagResult(flag, request) : this.getDefaultResult(flag.type);

		return { result, matched };
	}

	/**
	 * Check if any targeting rules match
	 */
	private async checkTargetingRules(rules: any[], request: FlagEvaluationRequest): Promise<boolean> {
		if (rules.length === 0 || !request.userId) {
			return false;
		}

		for (const rule of rules) {
			const ruleMatched = await this.evaluateRule(rule, request.userId, request.userAttributes);
			if (ruleMatched) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get flag result based on type
	 */
	private getFlagResult(flag: any, request: FlagEvaluationRequest): any {
		switch (flag.type) {
			case FeatureFlagType.BOOLEAN:
				return flag.isEnabled;
			case FeatureFlagType.PERCENTAGE:
				if (request.userId && flag.rolloutPercentage !== null) {
					const hash = this.hashUserId(request.userId);
					return hash < flag.rolloutPercentage;
				}
				return false;
			case FeatureFlagType.CONFIG:
				return flag.configJson;
			default:
				return null;
		}
	}

	/**
	 * Get default result when flag doesn't match
	 */
	private getDefaultResult(type: FeatureFlagType): any {
		switch (type) {
			case FeatureFlagType.BOOLEAN:
			case FeatureFlagType.PERCENTAGE:
				return false;
			case FeatureFlagType.CONFIG:
				return null;
			default:
				return null;
		}
	}

	/**
	 * Evaluate a targeting rule
	 */
	private async evaluateRule(
		rule: any,
		userId: string,
		userAttributes?: Record<string, any>,
	): Promise<boolean> {
		if (rule.targetingType === TargetingType.GROUP) {
			// Check if user is in the group
			if (!rule.groupId) return false;

			const membership = await this.prisma.userGroupMembership.findFirst({
				where: {
					userId,
					groupId: rule.groupId,
				},
			});

			return !!membership;
		} else if (rule.targetingType === TargetingType.ATTRIBUTE) {
			// Check user attributes
			if (!userAttributes || !rule.attribute || !rule.operator) return false;

			const userValue = userAttributes[rule.attribute];
			const ruleValue = rule.value;

			switch (rule.operator) {
				case Operator.EQUALS:
					return userValue === ruleValue;
				case Operator.IN:
					return Array.isArray(ruleValue) && ruleValue.includes(userValue);
				case Operator.NOT_IN:
					return Array.isArray(ruleValue) && !ruleValue.includes(userValue);
				case Operator.GREATER_THAN:
					return Number(userValue) > Number(ruleValue);
				case Operator.LESS_THAN:
					return Number(userValue) < Number(ruleValue);
				default:
					return false;
			}
		}

		return false;
	}

	/**
	 * Simple hash function for user ID to percentage
	 */
	private hashUserId(userId: string): number {
		let hash = 0;
		for (let i = 0; i < userId.length; i++) {
			const char = userId.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash) % 100;
	}

	/**
	 * Log flag evaluation
	 */
	private async logFlagEvaluation(flagId: string, userId: string, result: any): Promise<void> {
		await this.prisma.flagEvaluationLog.create({
			data: {
				flagId,
				userId,
				result,
			},
		});
	}

	/**
	 * Log flag changes
	 */
	private async logFlagChange(
		flagId: string,
		changedBy: string,
		oldValue: any,
		newValue: any,
	): Promise<void> {
		await this.prisma.flagChangeHistory.create({
			data: {
				flagId,
				changedBy,
				oldValue,
				newValue,
			},
		});
	}

	/**
	 * Map database flag to response format
	 */
	private mapFlagToResponse(flag: FeatureFlag): FeatureFlagResponse {
		return {
			id: flag.id,
			key: flag.key,
			description: flag.description ?? undefined,
			type: flag.type as FeatureFlagType,
			isEnabled: flag.isEnabled ?? undefined,
			rolloutPercentage: flag.rolloutPercentage ?? undefined,
			configJson: flag.configJson ? (flag.configJson as Record<string, any>) : undefined,
			createdAt: flag.createdAt,
			updatedAt: flag.updatedAt,
		};
	}

	/**
	 * Map database rule to response format
	 */
	private mapRuleToResponse(rule: TargetingRule & { group?: any }): TargetingRuleResponse {
		return {
			id: rule.id,
			flagId: rule.flagId,
			targetingType: rule.targetingType as TargetingType,
			attribute: rule.attribute ?? undefined,
			operator: rule.operator as Operator | undefined,
			value: rule.value,
			groupId: rule.groupId ?? undefined,
		};
	}
}
