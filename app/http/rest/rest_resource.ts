import { type HttpContext } from '@adonisjs/core/http'
import { type PaginationFilters } from '#types/pagination'
import { extractPagination } from '#helpers/pagination/extract_pagination'
import { stripEmptyStrings } from '#helpers/core/strip_empty_strings'

/**
 * Input handed to every endpoint step: the raw request, the route params,
 * and (when the endpoint is `paginated`) the validated pagination filters.
 */
export interface RestEndpointContext {
  request: HttpContext['request']
  params: HttpContext['params']
  pagination?: PaginationFilters
}

/**
 * Structural contract for the validators consumed by REST endpoints.
 *
 * Every validator returned by `vine.create()` satisfies this shape, so both
 * static validators and validator factories plug in directly.
 */
export interface RestValidator<Payload> {
  validate(data: unknown): Promise<Payload>
}

/**
 * Declarative description of a single REST endpoint.
 *
 * {@link handleRest} executes the steps in this fixed order:
 *
 * 1. `paginated` — validate the pagination parameters, stored on the context
 * 2. `input`     — pick the raw payload to validate (defaults to `request.all()`)
 * 3. `strip`     — drop empty-string entries from the input
 * 4. `prepare`   — endpoint-specific pre-validation work (e.g. role allowlists)
 * 5. `validator` — validate the input into a typed payload
 * 6. `execute`   — call the domain action
 * 7. `refetch`   — reload persisted state when the action result is not
 *                  serializable on its own
 * 8. `transform` — shape the entity, then serialize it with `ctx.serialize()`
 *
 * `status` overrides the success code: `201` on creation, `204` to send no
 * body. Domain exceptions thrown by the action propagate untouched and are
 * shaped by the standard exception handler.
 *
 * @template Prepared Value produced by `prepare` (undefined when absent)
 * @template Payload Typed input produced by the validator
 * @template Result  Value returned by the domain action
 * @template Entity  Entity handed to `transform` (the action result when no refetch)
 */
export interface RestEndpoint<Prepared, Payload, Result, Entity> {
  paginated?: boolean
  strip?: boolean
  status?: 201 | 204
  input?: (context: RestEndpointContext) => unknown
  prepare?: (context: RestEndpointContext) => Promise<Prepared>
  validator: (prepared: Prepared, context: RestEndpointContext) => RestValidator<Payload>
  execute(context: RestEndpointContext, prepared: Prepared, payload: Payload): Promise<Result>
  refetch?(
    context: RestEndpointContext,
    prepared: Prepared,
    payload: Payload,
    result: Result
  ): Promise<Entity>
  transform?(entity: Entity): unknown
}

/**
 * Widened `RestEndpoint` that erases all type parameters.
 *
 * Used at dispatch sites where an endpoint is selected through a route key
 * rather than a literal type.
 */
export type AnyRestEndpoint = RestEndpoint<any, any, any, any>

/**
 * Run a declarative REST endpoint and send the response.
 *
 * This is the only shared HTTP-level code of the REST resources: it carries
 * the transport mechanics (input selection, pagination, validation,
 * serialization, status codes) so resources and controllers stay pure
 * declarations and thin adapters.
 *
 * @param ctx - The AdonisJS HTTP context.
 * @param endpoint - The declarative endpoint to execute.
 * @returns Resolves once the response has been sent.
 *
 * @example
 * async handle(route: 'show', ctx: HttpContext): Promise<void> {
 *   await handleRest(ctx, this.endpoints.show)
 * }
 */
export async function handleRest<Prepared, Payload, Result, Entity>(
  ctx: HttpContext,
  endpoint: RestEndpoint<Prepared, Payload, Result, Entity>
): Promise<void> {
  const context: RestEndpointContext = { request: ctx.request, params: ctx.params }

  if (endpoint.paginated) {
    context.pagination = await extractPagination(ctx.request)
  }

  let input: unknown = endpoint.input ? endpoint.input(context) : ctx.request.all()

  if (endpoint.strip) {
    input = stripEmptyStrings(input as Record<string, unknown>)
  }

  const prepared = endpoint.prepare
    ? await endpoint.prepare(context)
    : (undefined as unknown as Prepared)

  const validator = endpoint.validator(prepared, context)
  const payload = await validator.validate(input)

  const result = await endpoint.execute(context, prepared, payload)

  if (endpoint.status === 204) {
    ctx.response.noContent()
    return
  }

  const entity = endpoint.refetch
    ? await endpoint.refetch(context, prepared, payload, result)
    : (result as unknown as Entity)

  const serialized = endpoint.transform
    ? await ctx.serialize(endpoint.transform(entity))
    : undefined

  ctx.response.status(endpoint.status ?? 200).send(serialized)
}
