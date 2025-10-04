import { FastifyInstance } from 'fastify';
import { FlagController } from '../controllers/FlagController';

/**
 * Feature Flag routes.
 * NOTE: There is a potential misconfiguration: DELETE /flags/:id/rules currently calls removeFlag (deletes the whole flag),
 * while logically it should probably delete a single targeting rule via something like DELETE /flags/rules/:ruleId.
 * Left unchanged here – adjust when backend contract is finalized.
 */
export async function flagRoutes(fastify: FastifyInstance): Promise<void> {
	const flagController = new FlagController();

	/**
	 * Create a new feature flag.
	 * Body: { key, type (BOOLEAN|PERCENTAGE|CONFIG), description?, isEnabled? | rolloutPercentage? | configJson? }
	 * Returns: Created flag with metadata.
	 */
	fastify.post('/flags', flagController.createFlag.bind(flagController));

	/**
	 * Get list of all feature flags (with their targeting rules included).
	 */
	fastify.get('/flags', flagController.getAllFlags.bind(flagController));

	/**
	 * Get a single feature flag by its ID.
	 * Params: :id (flag UUID / identifier)
	 */
	fastify.get('/flags/:id', flagController.getFlagById.bind(flagController));

	/**
	 * Update an existing feature flag (description, type-specific properties).
	 * Params: :id
	 * Body: Partial flag fields.
	 */
	fastify.put('/flags/:id', flagController.updateFlag.bind(flagController));

	/**
	 * Toggle a BOOLEAN flag's enabled state.
	 * Params: :id (must reference a BOOLEAN flag) -> 400 if not BOOLEAN.
	 */
	fastify.patch('/flags/:id/toggle', flagController.toggleFlag.bind(flagController));

	/**
	 * Add a targeting rule to a flag.
	 * Params: :id (flag ID)
	 * Body (examples):
	 *  { "targetingType": "GROUP", "groupId": "..." }
	 *  { "targetingType": "ATTRIBUTE", "attribute": "country", "operator": "EQUALS", "value": "PL" }
	 */
	fastify.post('/flags/:id/rules', flagController.addRuleToFlag.bind(flagController));

	/**
	 * Delete a feature flag (WARNING: current path '/flags/:id/rules' invokes removeFlag – likely needs refactor to '/flags/:id').
	 */
	fastify.delete('/flags/:id/rules', flagController.removeFlag.bind(flagController));

	/**
	 * Evaluate a flag for a given user / attributes.
	 * Body: { flagKey, userId?, userAttributes? }
	 * Returns: { flagKey, result, matched }
	 */
	fastify.post('/evaluate', flagController.evaluate.bind(flagController));
}
