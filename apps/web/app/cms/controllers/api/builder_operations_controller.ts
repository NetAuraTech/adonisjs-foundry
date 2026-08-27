import { randomUUID } from 'node:crypto';
import { inject } from '@adonisjs/core';
import transmit from '@adonisjs/transmit/services/main';
import vine from '@vinejs/vine';
import { builderOperationValidator, builderPresenceValidator, OP_SCHEMAS } from '#app/cms/validators/builder';
import { sanitizeBuilderOperation, sanitizeDraftContent } from '#cms/services/page/builder_sanitize';
import { BuilderSessionService } from '#cms/services/page/builder_session_service';
import type { BroadcastPayload } from '#cms/types/builder';
import type { PageContent, Block } from '#cms/types/page';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class BuilderOperationsController {
	constructor(protected sessionService: BuilderSessionService) {}

	async execute(ctx: HttpContext) {
		const { request, response, auth } = ctx;

		const user = auth.getUserOrFail();
		const raw = request.all();

		// Pass 1: Validate common envelope
		const envelope = await builderOperationValidator.validate(raw);

		// Pass 2: Validate op-specific payload
		const opSchema = OP_SCHEMAS[envelope.op as keyof typeof OP_SCHEMAS];
		const opPayload = await vine.validate({
			schema: opSchema,
			data: raw,
		});

		// Merge envelope (common fields) with op-specific validated payload
		const payload = { ...envelope, ...opPayload } as typeof envelope & {
			blockId?: string;
			props?: Record<string, unknown>;
			newParentId?: string;
			parentId?: string;
			newIndex?: number;
			index?: number;
			block?: Block;
			fieldKey?: string;
		};

		// Use client-provided operationId if present — SSE can arrive before the
		// HTTP response, so we need the ID registered client-side before the fetch.
		const operationId = typeof raw.operationId === 'string' && raw.operationId ? raw.operationId : randomUUID();

		const channel = `admin/pages/${payload.pageId}/translations/${payload.translationId}`;

		let session = await this.sessionService.getSession(payload.translationId, user.id);
		if (!session) {
			session = await this.sessionService.join(payload.translationId, {
				userId: user.id,
				userName: user.username,
				userEmail: user.email,
			});
			await this.sessionService.saveMeta(payload.translationId, payload.pageId);
		}

		switch (payload.op) {
			case 'LOCK_ACQUIRE': {
				if (!payload.blockId || !payload.fieldKey) {
					return response.badRequest({
						error: {
							code: 'E_INVALID_OP',
							message: 'blockId and fieldKey are required for LOCK_ACQUIRE',
						},
					});
				}

				const result = await this.sessionService.acquireLock(
					payload.translationId,
					payload.blockId,
					payload.fieldKey,
					user.id,
				);

				if (!result.acquired) {
					return response.conflict({
						error: {
							code: 'E_LOCK_CONFLICT',
							message: `Field is being edited by ${result.lock.userName}`,
							lock: {
								blockId: result.lock.blockId,
								fieldKey: result.lock.fieldKey,
								userId: result.lock.userId,
								userName: result.lock.userName,
								userColor: result.lock.userColor,
								expiresAt: result.lock.expiresAt.toISOString(),
							},
						},
					});
				}

				transmit.broadcast(channel, {
					op: 'LOCK_ACQUIRED',
					blockId: result.lock.blockId,
					fieldKey: result.lock.fieldKey,
					userId: user.id,
					userName: session.userName,
					userColor: session.color,
					expiresAt: result.lock.expiresAt.toISOString(),
					timestamp: new Date().toISOString(),
				});

				return response.ok({ lock: { ...result.lock, timer: undefined } });
			}

			case 'LOCK_RELEASE': {
				if (!payload.blockId || !payload.fieldKey) {
					return response.badRequest({
						error: {
							code: 'E_INVALID_OP',
							message: 'blockId and fieldKey are required for LOCK_RELEASE',
						},
					});
				}

				await this.sessionService.releaseLock(payload.translationId, payload.blockId, payload.fieldKey, user.id);

				// Always broadcast — the lock may have already expired in Redis but
				// other clients might have missed LOCK_EXPIRED via SSE. Broadcasting
				// here guarantees they remove the overlay regardless.
				transmit.broadcast(channel, {
					op: 'LOCK_RELEASED',
					blockId: payload.blockId,
					fieldKey: payload.fieldKey,
					userId: user.id,
					timestamp: new Date().toISOString(),
				});

				return response.ok({ released: true });
			}

			case 'CURSOR': {
				const broadcastPayload: BroadcastPayload = {
					operationId,
					op: 'CURSOR',
					blockId: payload.blockId ?? null,
					userId: user.id,
					userName: session.userName,
					userColor: session.color,
					timestamp: new Date().toISOString(),
				};
				transmit.broadcast(channel, broadcastPayload);
				return response.ok({ operationId });
			}

			case 'UPDATE_PROPS': {
				if (!payload.blockId || !payload.props) {
					return response.badRequest({
						error: {
							code: 'E_INVALID_OP',
							message: 'blockId and props are required for UPDATE_PROPS',
						},
					});
				}
				// Sanitize props before broadcasting to prevent XSS in real-time
				const sanitizedPayload = sanitizeBuilderOperation('UPDATE_PROPS', {
					blockId: payload.blockId,
					props: payload.props,
				});
				const broadcastPayload: BroadcastPayload = {
					operationId,
					op: 'UPDATE_PROPS',
					blockId: payload.blockId,
					props: sanitizedPayload.props as Record<string, unknown>,
					userId: user.id,
					userName: session.userName,
					userColor: session.color,
					timestamp: new Date().toISOString(),
				};
				transmit.broadcast(channel, broadcastPayload);
				return response.ok({ operationId });
			}

			case 'MOVE_BLOCK': {
				if (!payload.blockId || payload.newParentId === undefined || payload.newIndex === undefined) {
					return response.badRequest({
						error: {
							code: 'E_INVALID_OP',
							message: 'blockId, newParentId and newIndex are required for MOVE_BLOCK',
						},
					});
				}
				const broadcastPayload: BroadcastPayload = {
					operationId,
					op: 'MOVE_BLOCK',
					blockId: payload.blockId,
					newParentId: payload.newParentId,
					newIndex: payload.newIndex,
					userId: user.id,
					userName: session.userName,
					userColor: session.color,
					timestamp: new Date().toISOString(),
				};
				transmit.broadcast(channel, broadcastPayload);
				return response.ok({ operationId });
			}

			case 'ADD_BLOCK': {
				if (!payload.block || payload.parentId === undefined || payload.index === undefined) {
					return response.badRequest({
						error: {
							code: 'E_INVALID_OP',
							message: 'block, parentId and index are required for ADD_BLOCK',
						},
					});
				}
				// Sanitize block before broadcasting to prevent XSS in real-time
				const sanitizedPayload = sanitizeBuilderOperation('ADD_BLOCK', {
					block: payload.block,
					parentId: payload.parentId,
					index: payload.index,
				});
				const broadcastPayload: BroadcastPayload = {
					operationId,
					op: 'ADD_BLOCK',
					block: sanitizedPayload.block as Block,
					parentId: payload.parentId,
					index: payload.index,
					userId: user.id,
					userName: session.userName,
					userColor: session.color,
					timestamp: new Date().toISOString(),
				};
				transmit.broadcast(channel, broadcastPayload);
				return response.ok({ operationId });
			}

			case 'DELETE_BLOCK': {
				if (!payload.blockId) {
					return response.badRequest({
						error: { code: 'E_INVALID_OP', message: 'blockId is required for DELETE_BLOCK' },
					});
				}
				const broadcastPayload: BroadcastPayload = {
					operationId,
					op: 'DELETE_BLOCK',
					blockId: payload.blockId,
					userId: user.id,
					userName: session.userName,
					userColor: session.color,
					timestamp: new Date().toISOString(),
				};
				transmit.broadcast(channel, broadcastPayload);
				return response.ok({ operationId });
			}

			default:
				return response.badRequest({
					error: { code: 'E_UNKNOWN_OP', message: 'Unknown operation type' },
				});
		}
	}

	async presence(ctx: HttpContext) {
		const { params, response } = ctx;

		const { translationId } = await builderPresenceValidator.validate(params);

		const [sessions, locks, draft] = await Promise.all([
			this.sessionService.getPresence(translationId),
			this.sessionService.getLocks(translationId),
			this.sessionService.getDraft(translationId),
		]);

		return response.ok({
			sessions,
			draft,
			locks: locks.map((l) => ({
				blockId: l.blockId,
				fieldKey: l.fieldKey,
				userId: l.userId,
				userName: l.userName,
				userColor: l.userColor,
				expiresAt: l.expiresAt,
			})),
		});
	}

	async saveDraft(ctx: HttpContext) {
		const { params, request, response, auth } = ctx;

		auth.getUserOrFail();
		const translationId = Number(params.translationId);
		if (!translationId || Number.isNaN(translationId)) {
			return response.badRequest({ error: { code: 'E_INVALID_PARAMS' } });
		}
		const body = request.only(['content']);
		if (!body.content) {
			return response.badRequest({ error: { code: 'E_MISSING_CONTENT' } });
		}
		// Sanitize draft content before storing in Redis
		const safeContent = sanitizeDraftContent(body.content as PageContent);
		await this.sessionService.saveDraft(translationId, safeContent);
		return response.ok({ saved: true });
	}
}
