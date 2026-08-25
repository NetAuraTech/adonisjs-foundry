import Permission from '#identity/models/permission';
import type { PaginationFilters } from '#types/pagination';

interface ListPermissionsCriteria {
	search?: string;
	pagination: PaginationFilters;
}

/**
 * Read-side query for listing permissions with an optional search filter and
 * pagination.
 */
export class ListPermissionsQuery {
	/**
	 * Execute the permission listing query.
	 *
	 * @param criteria - Optional search term and pagination parameters.
	 * @returns A paginated result set of permissions.
	 */
	async execute(criteria: ListPermissionsCriteria) {
		const query = Permission.query().orderBy('name', 'asc');

		if (criteria.search) {
			query.where((builder) => {
				builder.whereILike('name', `%${criteria.search}%`).orWhereILike('description', `%${criteria.search}%`);
			});
		}

		return query.paginate(criteria.pagination.page ?? 1, criteria.pagination.perPage ?? 20);
	}
}
