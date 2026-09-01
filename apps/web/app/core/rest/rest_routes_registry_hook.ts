import { resolve } from 'node:path';
import {
	collectImportNames,
	extractValidatorIdentifier,
	findEndpointInitializer,
	findEndpointsLiteral,
	findValidatorInitializer,
	findRestDelegation,
	resolveValidatorImport,
	safeRead,
	type ExtractedValidator,
} from './rest_registry_extractor.js';
import type { ScannedController } from '@adonisjs/assembler/types';

/**
 * Map a `#transport/<domain>/rest/<name>` import specifier to the absolute path of
 * the resource file. REST resources are co-located with their domain under
 * `app/<domain>/rest/`, and the domain is embedded in the specifier itself,
 * so the translation is mechanical — no TS import resolution is required.
 *
 * @param appRoot - Absolute path of the application root.
 * @param specifier - Import specifier as it appears in the controller's import.
 * @returns Absolute path of the resource file, or `undefined` when the
 *         specifier is not of the `#transport/<domain>/rest/*` form.
 */
function resolveResourceFile(appRoot: string, specifier: string): string | undefined {
	const match = specifier.match(/^#transport\/([\w$]+)\/rest\/([\w$]+)$/);
	if (!match) return undefined;
	return resolve(appRoot, 'app', match[1], 'rest', `${match[2].replace(/\.(ts|js)$/u, '')}.ts`);
}

/**
 * Find the method body of the named controller handler. A minimal
 * brace-counting parser is enough: the REST controllers are one-line
 * dispatchers.
 *
 * @param sourceText - Full text of the controller module.
 * @param method - Method name to locate.
 * @returns The method body (between the outermost braces), or `undefined`.
 */
function findMethodBody(sourceText: string, method: string): string | undefined {
	const signature = new RegExp(`\\b${method}\\s*\\(\\s*ctx\\s*:\\s*HttpContext\\s*\\)`).exec(sourceText);
	if (!signature) return undefined;
	const open = sourceText.indexOf('{', signature.index);
	if (open === -1) return undefined;
	let depth = 0;
	for (let i = open; i < sourceText.length; i += 1) {
		const ch = sourceText[i];
		if (ch === '{') depth += 1;
		else if (ch === '}') {
			depth -= 1;
			if (depth === 0) return sourceText.slice(open + 1, i);
		}
	}
	return undefined;
}

/**
 * Find the `#transport/<domain>/rest/<name>_resource` import specifier of a
 * resource variable inside a controller source.
 *
 * The constructor property is lowerCamelCase (`usersResource`) while the
 * imported class is PascalCase (`UsersResource`), so the match is done on the
 * shared base name (`users`) rather than on the binding name: every import
 * whose file base is `<base>_resource` is the resource declaration.
 *
 * @param sourceText - Full text of the controller module.
 * @param resourceVariable - The `this.<x>` variable found by the delegation
 *         matcher.
 * @returns The raw import specifier, or `undefined`.
 */
function findResourceSpecifier(sourceText: string, resourceVariable: string): string | undefined {
	const base = resourceVariable.replace(/Resource$/u, '');
	if (!base || base === resourceVariable) return undefined;
	for (const specifier of collectImportNames(sourceText).values()) {
		const match = specifier.match(/^#transport\/[\w$]+\/rest\/([\w$]+)$/u);
		if (!match) continue;
		const fileBase = match[1].replace(/_resource$/u, '');
		if (fileBase === base) return specifier;
	}
	return undefined;
}

/**
 * Extract the Vine validators referenced by the REST-resource endpoints
 * delegated to from a controller method.
 *
 * The result mirrors the Assembler's own `ScannedValidator[]` shape, so
 * `prepareRequestTypes` reuses it unchanged: `InferInput<...>` request types
 * and the `422` error-response union come back for free.
 *
 * @param appRoot - Absolute path of the application root.
 * @param controller - Scanned controller metadata from the Assembler.
 * @returns Single-element array on success, `undefined` when the delegation
 *         cannot be traced — the Assembler then falls back to its default
 *         static extraction.
 */
export async function extractRestResourceValidators(
	appRoot: string,
	controller: ScannedController,
): Promise<ExtractedValidator[] | undefined> {
	const sourceText = await safeRead(controller.path);
	if (!sourceText) return undefined;
	const body = findMethodBody(sourceText, controller.method);
	if (!body) return undefined;
	const delegation = findRestDelegation(body);
	if (!delegation) return undefined;
	const specifier = findResourceSpecifier(sourceText, delegation.resourceVariable);
	if (!specifier) return undefined;
	const resourcePath = resolveResourceFile(appRoot, specifier);
	if (!resourcePath) return undefined;
	const resourceText = await safeRead(resourcePath);
	if (!resourceText) return undefined;

	const endpoints = findEndpointsLiteral(resourceText);
	if (!endpoints) return undefined;
	const endpointInit = findEndpointInitializer(endpoints, delegation.endpoint);
	if (!endpointInit) return undefined;
	const validatorNode = findValidatorInitializer(endpointInit);
	if (!validatorNode) return undefined;
	const identifier = extractValidatorIdentifier(validatorNode);
	if (!identifier) return undefined;
	const validator = resolveValidatorImport(resourceText, identifier);
	return validator ? [validator] : undefined;
}

/**
 * Minimal observable surface of the Assembler's RoutesScanner we consume:
 * the `extractValidators` registration point.
 */
interface RouteScannerSurface {
	extractValidators(
		cb: (route: unknown, controller: ScannedController) => Promise<ExtractedValidator[] | undefined>,
	): unknown;
}

/**
 * The hook bus we subscribe to. Only `routesScanning` is used by this hook.
 */
interface HookBus {
	add(event: 'routesScanning', cb: (devServer: unknown, routesScanner: RouteScannerSurface) => void): unknown;
}

/**
 * Init-hook parent we receive. The Assembler's `DevServer` exposes `cwdPath`
 * (absolute directory of the project root); that is all we need to resolve
 * the `#transport/<domain>/rest/*` resource imports.
 */
interface InitHookParent {
	cwdPath?: string;
}

/**
 * AdonisJS init hook that installs a REST-resource-aware validator extractor
 * on the Assembler's `RoutesScanner`.
 *
 * The Tuyau client registry — and the Assembler's route scanning in general —
 * resolve request types by parsing the controller method body for a Vine
 * validator. Thin REST-resource controllers
 * (`await handle(ctx, this.usersResource.endpoints.show)`) no longer inline a
 * validator: the `validator` step moved into the resource declaration. The
 * scanner therefore degrades those registry entries to `body: {}` and drops
 * the `422` union from `errorResponse`.
 *
 * This hook subscribes to the `routesScanning` event, grabs the
 * `RoutesScanner` instance, and registers an `extractValidators` callback.
 * For every REST-resource delegation the callback resolves the endpoint's
 * `validator` step on the resource file (e.g. `restIdValidator`) and returns
 * the matching named import. Every other controller makes the callback return
 * `undefined`, deferring to the Assembler's default extraction.
 *
 * @example
 * // adonisrc.ts
 * import { restRoutesRegistryHook } from '#transport/core/rest/rest_routes_registry_hook'
 * export default defineConfig({
 *   hooks: {
 *     init: [
 *       // ...
 *       restRoutesRegistryHook(),
 *     ],
 *   },
 * })
 */
export function restRoutesRegistryHook(): {
	run(parent: InitHookParent, hooks: HookBus): void;
} {
	return {
		run(parent: InitHookParent, hooks: HookBus): void {
			const appRoot = parent.cwdPath ?? process.cwd();
			hooks.add('routesScanning', (_devServer, routesScanner) => {
				routesScanner.extractValidators(async (_route, controller) => {
					return extractRestResourceValidators(appRoot, controller);
				});
			});
		},
	};
}
