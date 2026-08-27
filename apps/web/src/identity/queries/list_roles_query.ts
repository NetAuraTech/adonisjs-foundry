import Role from '#identity/models/role';
import type { PaginationFilters } from '#types/pagination';

interface ListRolesCriteria {
	search?: string;
	pagination: PaginationFilters;
}

/**
 * Read-side query for listing roles with an optional search filter and
 * pagination, including preloaded permissions and the assigned user count.
 */
export class ListRolesQuery {
	/**
	 * Execute the role listing query.
	 *
	 * @param criteria - Optional search term and pagination parameters.
	 * @returns A paginated result set of roles with permissions preloaded and user count.
	 */
	async execute(criteria: ListRolesCriteria) {
		const query = Role.query().preload('permissions').withCount('users').orderBy('name', 'asc');

		if (criteria.search) {
			query.where((builder) => {
				builder.whereILike('name', `%${criteria.search}%`).orWhereILike('description', `%${criteria.search}%`);
			});
		}

		return query.paginate(criteria.pagination.page ?? 1, criteria.pagination.perPage ?? 20);
	}
}
