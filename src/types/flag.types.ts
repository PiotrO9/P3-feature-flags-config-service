/**
 * Feature flag-related type definitions
 */

export enum FeatureFlagType {
	BOOLEAN = 'BOOLEAN',
	PERCENTAGE = 'PERCENTAGE',
	CONFIG = 'CONFIG',
}

export enum Operator {
	EQUALS = 'EQUALS',
	IN = 'IN',
	NOT_IN = 'NOT_IN',
	GREATER_THAN = 'GREATER_THAN',
	LESS_THAN = 'LESS_THAN',
}

export enum TargetingType {
	ATTRIBUTE = 'ATTRIBUTE',
	GROUP = 'GROUP',
}

export interface FeatureFlagRequest {
	key: string;
	description?: string;
	type: FeatureFlagType;
	isEnabled?: boolean;
	rolloutPercentage?: number;
	configJson?: Record<string, any>;
}

export interface FeatureFlagResponse {
	id: string;
	key: string;
	description?: string;
	type: FeatureFlagType;
	isEnabled?: boolean;
	rolloutPercentage?: number;
	configJson?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

export interface TargetingRuleRequest {
	targetingType: TargetingType;
	attribute?: string;
	operator?: Operator;
	value?: any;
	groupId?: string;
}

export interface TargetingRuleResponse {
	id: string;
	flagId: string;
	targetingType: TargetingType;
	attribute?: string;
	operator?: Operator;
	value?: any;
	groupId?: string;
}

export interface FlagEvaluationRequest {
	flagKey: string;
	userId?: string;
	userAttributes?: Record<string, any>;
}

export interface FlagEvaluationResponse {
	flagKey: string;
	result: any;
	matched: boolean;
}

export interface FlagEvaluationLogResponse {
	id: string;
	flagId: string;
	userId?: string;
	requestId?: string;
	result: any;
	createdAt: Date;
}

export interface FlagChangeHistoryResponse {
	id: string;
	flagId: string;
	changedBy: string;
	oldValue: any;
	newValue: any;
	createdAt: Date;
}
