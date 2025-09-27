import type { Prisma } from '../generated/prisma';

export class DatabaseHelper {
	/**
	 * Standardowe include dla użytkownika (podstawowe dane)
	 */
	static getUserSelect(): Prisma.UserSelect {
		return {
			id: true,
			email: true,
			name: true,
		};
	}

	/**
	 * Standardowe include dla grupy (podstawowe dane)
	 */
	static getGroupSelect(): Prisma.UserGroupSelect {
		return {
			id: true,
			key: true,
			name: true,
		};
	}

	/**
	 * Include dla grupy z liczbą członków
	 */
	static getGroupWithCountInclude(): Prisma.UserGroupInclude {
		return {
			_count: {
				select: {
					memberships: true,
				},
			},
		};
	}

	/**
	 * Include dla grupy z członkami
	 */
	static getGroupWithMembersInclude(): Prisma.UserGroupInclude {
		return {
			memberships: {
				include: {
					user: {
						select: this.getUserSelect(),
					},
				},
			},
			_count: {
				select: {
					memberships: true,
				},
			},
		};
	}

	/**
	 * Include dla członkostwa z danymi użytkownika i grupy
	 */
	static getMembershipWithDetailsInclude(): Prisma.UserGroupMembershipInclude {
		return {
			user: {
				select: this.getUserSelect(),
			},
			group: {
				select: this.getGroupSelect(),
			},
		};
	}

	/**
	 * Tworzy where clause dla wyszukiwania grup
	 */
	static buildGroupSearchWhere(isActive?: boolean, search?: string): Prisma.UserGroupWhereInput {
		const where: Prisma.UserGroupWhereInput = {};

		if (isActive !== undefined) {
			where.isActive = isActive;
		}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ key: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
			];
		}

		return where;
	}

	/**
	 * Standardowe opcje paginacji
	 */
	static getPaginationOptions(page: number = 1, limit: number = 50) {
		return {
			skip: (page - 1) * limit,
			take: limit,
		};
	}

	/**
	 * Standardowe sortowanie (najnowsze pierwsze)
	 */
	static getDefaultOrderBy(): Prisma.UserGroupOrderByWithRelationInput {
		return { createdAt: 'desc' };
	}

	/**
	 * Sprawdza czy członkostwo już istnieje
	 */
	static getMembershipUniqueWhere(
		userId: string,
		groupId: string,
	): Prisma.UserGroupMembershipWhereUniqueInput {
		return {
			userId_groupId: {
				userId,
				groupId,
			},
		};
	}

	/**
	 * Include dla grup z liczeniem relacji (członkowie, reguły targetowania)
	 */
	static getGroupWithFullCountInclude(): Prisma.UserGroupInclude {
		return {
			_count: {
				select: {
					memberships: true,
					targetingRules: true,
				},
			},
		};
	}
}
