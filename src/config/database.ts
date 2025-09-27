import { PrismaClient } from '../generated/prisma';

export class DatabaseConfig {
	private static instance: PrismaClient;

	public static getInstance(): PrismaClient {
		if (!DatabaseConfig.instance) {
			DatabaseConfig.instance = new PrismaClient();
		}
		return DatabaseConfig.instance;
	}

	public static async disconnect(): Promise<void> {
		if (DatabaseConfig.instance) {
			await DatabaseConfig.instance.$disconnect();
		}
	}
}

// Lazy initialization - only create the instance when needed, not when module is imported
export const getPrisma = () => DatabaseConfig.getInstance();
