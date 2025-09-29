/**
 * Constants for database queries and configurations
 */

// Database query includes for consistent data fetching
export const FLAG_INCLUDES = {
	FULL: {
		targetingRules: {
			include: {
				group: true,
			},
		},
	},
	WITH_RULES_AND_MEMBERSHIPS: {
		targetingRules: {
			include: {
				group: {
					include: {
						memberships: true,
					},
				},
			},
		},
	},
} as const;

// Default ordering for flags
export const FLAG_ORDER_BY = {
	createdAt: 'desc',
} as const;

// Error messages
export const FLAG_ERRORS = {
	FLAG_NOT_FOUND: 'Flag not found',
	ONLY_BOOLEAN_CAN_TOGGLE: 'Only BOOLEAN flags can be toggled',
	KEY_ALREADY_EXISTS: 'Flag with this key already exists',
	RULE_NOT_FOUND: 'Targeting rule not found',
} as const;

// Success messages
export const FLAG_MESSAGES = {
	CREATED: 'Flag created successfully',
	UPDATED: 'Flag updated successfully',
	TOGGLED: 'Flag toggled successfully',
	DELETED: 'Flag deleted successfully',
	RETRIEVED: 'Flag retrieved successfully',
	FLAGS_RETRIEVED: 'Flags retrieved successfully',
	RULE_ADDED: 'Targeting rule added successfully',
	RULE_REMOVED: 'Targeting rule removed successfully',
	EVALUATED: 'Flag evaluated successfully',
} as const;
