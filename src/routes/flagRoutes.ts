import { FastifyInstance } from 'fastify';
import { FlagController } from '../controllers/FlagController';

export async function flagRoutes(fastify: FastifyInstance): Promise<void> {
	const flagController = new FlagController();

	// TODO - Pisać tuatj dokumentacje do każdego enpointa tak aby było wiadomo o co chodzi

	fastify.post('/flags', flagController.createFlag.bind(flagController));
	fastify.get('/flags', flagController.getAllFlags.bind(flagController));
	fastify.get('/flags/:id', flagController.getFlagById.bind(flagController));
	fastify.put('/flags/:id', flagController.updateFlag.bind(flagController));
	fastify.patch('/flags/:id/toggle', flagController.toggleFlag.bind(flagController));
	fastify.post('/flags/:id/rules', flagController.addRuleToFlag.bind(flagController));
	fastify.delete('/flags/:id/rules', flagController.removeFlag.bind(flagController));
	fastify.post('/evaluate', flagController.evaluate.bind(flagController));
}
