import { BaseTransformer } from '@adonisjs/core/transformers';
import type LogEntry from '#log/models/log_entry';

export default class LogEntryTransformer extends BaseTransformer<LogEntry> {
	toObject() {
		return this.pick(this.resource, [
			'id',
			'level',
			'category',
			'message',
			'actorId',
			'actorEmail',
			'ip',
			'userAgent',
			'requestId',
			'context',
			'error',
			'createdAt',
		]);
	}
}
