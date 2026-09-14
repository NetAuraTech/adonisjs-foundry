import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
	protected tableName = 'webhook_deliveries';

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id');
			table.string('receiver', 100).notNullable();
			table.string('delivery_id', 255).notNullable();
			table.string('status', 20).notNullable();
			table.string('payload_digest', 64).notNullable();
			table.string('content_type', 100).nullable();
			table.string('ip', 45).nullable();
			table.text('user_agent').nullable();
			table.text('error').nullable();
			table.timestamp('created_at').notNullable();
			table.timestamp('processed_at').nullable();

			// Idempotency key: a receiver never sees the same delivery id twice.
			table.unique(['receiver', 'delivery_id']);
			table.index(['status', 'created_at']);
			table.index(['created_at']);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
