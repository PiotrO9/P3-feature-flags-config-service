import { FastifyReply, FastifyRequest } from 'fastify';
import { FlagService } from '../services/FlagService';
import { ResponseHelper } from '../helpers/ResponseHelper';
import { FlagValidator } from '../validators/FlagValidator';
import { FLAG_ERRORS, FLAG_MESSAGES } from '../constants/flag.constants';
import {
	FeatureFlagRequest,
	TargetingRuleRequest,
	FlagEvaluationRequest,
	FeatureFlagType,
} from '../types/flag.types';

// Type definitions for request parameters
interface IdParams {
	id: string;
}

interface KeyParams {
	key: string;
}

interface RuleIdParams {
	ruleId: string;
}

export class FlagController {
	private readonly flagService: FlagService;

	constructor() {
		this.flagService = new FlagService();
	}

	/**
	 * Handle common service errors
	 */
	private handleServiceError(error: any, reply: FastifyReply, defaultMessage: string): void {
		if (error.message === FLAG_ERRORS.FLAG_NOT_FOUND) {
			ResponseHelper.error(reply, FLAG_ERRORS.FLAG_NOT_FOUND, 404);
		} else if (error.message === FLAG_ERRORS.ONLY_BOOLEAN_CAN_TOGGLE) {
			ResponseHelper.error(reply, FLAG_ERRORS.ONLY_BOOLEAN_CAN_TOGGLE, 400);
		} else if (error.message === FLAG_ERRORS.RULE_NOT_FOUND) {
			ResponseHelper.error(reply, FLAG_ERRORS.RULE_NOT_FOUND, 404);
		} else {
			ResponseHelper.error(reply, defaultMessage, 500, error.message);
		}
	}

	async createFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const flagData = request.body as FeatureFlagRequest;

			// Validate input
			const validationErrors = FlagValidator.validateFlagCreation(flagData);
			if (validationErrors.length > 0) {
				return ResponseHelper.error(reply, validationErrors.join(', '), 400);
			}

			const flag = await this.flagService.createFlag(flagData);
			ResponseHelper.success(reply, flag, 201, FLAG_MESSAGES.CREATED);
		} catch (error: any) {
			if (error.code === 'P2002') {
				ResponseHelper.error(reply, FLAG_ERRORS.KEY_ALREADY_EXISTS, 409);
			} else {
				ResponseHelper.error(reply, 'Failed to create flag', 500, error.message);
			}
		}
	}
	async getAllFlags(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const flags = await this.flagService.getAllFlags();
			ResponseHelper.success(reply, flags, 200, FLAG_MESSAGES.FLAGS_RETRIEVED, flags.length);
		} catch (error: any) {
			ResponseHelper.error(reply, 'Failed to retrieve flags', 500, error.message);
		}
	}
	async updateFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { id } = request.params as IdParams;
			const flagData = request.body as Partial<FeatureFlagRequest>;
			const updatedBy = 'system';

			// Validate ID
			const idErrors = FlagValidator.validateId(id, 'Flag ID');
			if (idErrors.length > 0) {
				return ResponseHelper.error(reply, idErrors.join(', '), 400);
			}

			// Validate update data
			const validationErrors = FlagValidator.validateFlagUpdate(flagData);
			if (validationErrors.length > 0) {
				return ResponseHelper.error(reply, validationErrors.join(', '), 400);
			}

			const updatedFlag = await this.flagService.updateFlag(id, flagData, updatedBy);
			ResponseHelper.success(reply, updatedFlag, 200, FLAG_MESSAGES.UPDATED);
		} catch (error: any) {
			this.handleServiceError(error, reply, 'Failed to update flag');
		}
	}
	async toggleFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { id } = request.params as IdParams;
			const updatedBy = 'system';

			const idErrors = FlagValidator.validateId(id, 'Flag ID');
			if (idErrors.length > 0) {
				return ResponseHelper.error(reply, idErrors.join(', '), 400);
			}

			const updatedFlag = await this.flagService.toggleFlag(id, updatedBy);
			ResponseHelper.success(reply, updatedFlag, 200, FLAG_MESSAGES.TOGGLED);
		} catch (error: any) {
			this.handleServiceError(error, reply, 'Failed to toggle flag');
		}
	}
	async addRuleToFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { id } = request.params as IdParams;
			const ruleData = request.body as TargetingRuleRequest;

			// Validate ID
			const idErrors = FlagValidator.validateId(id, 'Flag ID');
			if (idErrors.length > 0) {
				return ResponseHelper.error(reply, idErrors.join(', '), 400);
			}

			// Validate rule data
			const ruleErrors = FlagValidator.validateTargetingRule(ruleData);
			if (ruleErrors.length > 0) {
				return ResponseHelper.error(reply, ruleErrors.join(', '), 400);
			}

			const rule = await this.flagService.addTargetingRule(id, ruleData);
			ResponseHelper.success(reply, rule, 201, FLAG_MESSAGES.RULE_ADDED);
		} catch (error: any) {
			this.handleServiceError(error, reply, 'Failed to add targeting rule');
		}
	}
	async removeFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { id } = request.params as IdParams;

			const idErrors = FlagValidator.validateId(id, 'Flag ID');
			if (idErrors.length > 0) {
				return ResponseHelper.error(reply, idErrors.join(', '), 400);
			}

			await this.flagService.deleteFlag(id);
			ResponseHelper.success(reply, null, 200, FLAG_MESSAGES.DELETED);
		} catch (error: any) {
			this.handleServiceError(error, reply, 'Failed to delete flag');
		}
	}
	async evaluate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const evaluationRequest = request.body as FlagEvaluationRequest;

			// Validate evaluation request
			const validationErrors = FlagValidator.validateFlagEvaluation(evaluationRequest);
			if (validationErrors.length > 0) {
				return ResponseHelper.error(reply, validationErrors.join(', '), 400);
			}

			const evaluation = await this.flagService.evaluateFlag(evaluationRequest);
			ResponseHelper.success(reply, evaluation, 200, FLAG_MESSAGES.EVALUATED);
		} catch (error: any) {
			this.handleServiceError(error, reply, 'Failed to evaluate flag');
		}
	}

	async removeRuleFromFlag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { ruleId } = request.params as RuleIdParams;

			const idErrors = FlagValidator.validateId(ruleId, 'Rule ID');
			if (idErrors.length > 0) {
				return ResponseHelper.error(reply, idErrors.join(', '), 400);
			}

			await this.flagService.removeTargetingRule(ruleId);
			ResponseHelper.success(reply, null, 200, FLAG_MESSAGES.RULE_REMOVED);
		} catch (error: any) {
			this.handleServiceError(error, reply, 'Failed to remove targeting rule');
		}
	}

	async getFlagById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { id } = request.params as IdParams;

			const idErrors = FlagValidator.validateId(id, 'Flag ID');
			if (idErrors.length > 0) {
				return ResponseHelper.error(reply, idErrors.join(', '), 400);
			}

			const flag = await this.flagService.getFlagById(id);
			if (!flag) {
				return ResponseHelper.error(reply, FLAG_ERRORS.FLAG_NOT_FOUND, 404);
			}

			ResponseHelper.success(reply, flag, 200, FLAG_MESSAGES.RETRIEVED);
		} catch (error: any) {
			ResponseHelper.error(reply, 'Failed to retrieve flag', 500, error.message);
		}
	}

	async getFlagByKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
		try {
			const { key } = request.params as KeyParams;

			const keyErrors = FlagValidator.validateId(key, 'Flag key');
			if (keyErrors.length > 0) {
				return ResponseHelper.error(reply, keyErrors.join(', '), 400);
			}

			const flag = await this.flagService.getFlagByKey(key);
			if (!flag) {
				return ResponseHelper.error(reply, FLAG_ERRORS.FLAG_NOT_FOUND, 404);
			}

			ResponseHelper.success(reply, flag, 200, FLAG_MESSAGES.RETRIEVED);
		} catch (error: any) {
			ResponseHelper.error(reply, 'Failed to retrieve flag', 500, error.message);
		}
	}
}
