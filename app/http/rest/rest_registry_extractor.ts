import { promises as fs } from 'node:fs';
import ts from 'typescript';

/** Validator reference shape consumed by the Tuyau/Assembler routes scanner. */
export interface ExtractedValidator {
	name: string;
	import: {
		specifier: string;
		type: 'named' | 'default';
		value: string;
	};
}

/** The two pieces of a REST-resource delegation found in a controller method. */
export interface RestDelegation {
	resourceVariable: string;
	endpoint: string;
}

/**
 * Read a text file, returning `undefined` on failure. The registry is a dev-
 * only artefact: a missing file must never break the dev server boot.
 *
 * @param file - Absolute path of the file to read.
 * @returns The file text, or `undefined` when it cannot be read.
 */
export async function safeRead(file: string): Promise<string | undefined> {
	try {
		return await fs.readFile(file, 'utf8');
	} catch {
		return undefined;
	}
}

/**
 * Find a REST-resource delegation in a controller method body:
 * `handle(ctx, this\<resource\>.endpoints\<endpoint\>)`.
 *
 * The first capture is the injected resource variable, the second the endpoint
 * key of the REST resource. Returns `undefined` for methods that do not follow
 * the contract (hand-rolled controllers, `handleUpdate` dispatchers, ...).
 *
 * @param body - The controller method body, without the enclosing braces.
 * @returns The resource variable and endpoint key, or `undefined`.
 */
export function findRestDelegation(body: string): RestDelegation | undefined {
	const match = body.match(/\bthis(?:\.\w+)*\s*\.\s*([A-Za-z_$][\w$]*)\s*\.\s*endpoints\s*\.\s*([A-Za-z_$][\w$]*)/);
	if (!match) return undefined;
	return { resourceVariable: match[1], endpoint: match[2] };
}

/**
 * Parse a TypeScript source file's import declarations into a map of local
 * names to their import specifier.
 *
 * Default, named and namespace imports are all recorded. A named import's key
 * is the local (aliased) name: `import { a as b } from 'x'` yields
 * `b -> 'x'`.
 *
 * @param sourceText - The file text to analyse.
 * @param fileName - Logical file name used by the parser for diagnostics.
 * @returns Map of local names to import specifier.
 */
export function collectImportNames(sourceText: string, fileName = 'fixture.ts'): Map<string, string> {
	const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const names = new Map<string, string>();
	for (const statement of sourceFile.statements) {
		if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
			continue;
		}
		const specifier = statement.moduleSpecifier.text;
		const clause = statement.importClause;
		if (!clause) continue;
		if (clause.name) names.set(clause.name.text, specifier);
		if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
			for (const element of clause.namedBindings.elements) {
				names.set(element.name.text, specifier);
			}
		}
		if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
			names.set(clause.namedBindings.name.text, specifier);
		}
	}
	return names;
}

/**
 * Locate the `endpoints` object literal on a REST resource class.
 *
 * The resource declares `readonly endpoints: <Type> = { ... }`; this returns
 * that object literal so callers can descend into individual endpoints.
 *
 * @param sourceText - Text of the resource module.
 * @returns The object-literal node holding the endpoints, or `undefined`.
 */
export function findEndpointsLiteral(sourceText: string): ts.ObjectLiteralExpression | undefined {
	const sourceFile = ts.createSourceFile('resource.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	let result: ts.ObjectLiteralExpression | undefined;
	const visit = (node: ts.Node): void => {
		if (result) return;
		if (ts.isPropertyDeclaration(node) || ts.isPropertyAssignment(node)) {
			const nameNode = node.name as ts.Node;
			const isEndpoints = (ts.isIdentifier(nameNode) || ts.isStringLiteral(nameNode)) && nameNode.text === 'endpoints';
			if (isEndpoints && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
				result = node.initializer;
				return;
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(sourceFile);
	return result;
}

/**
 * Return the per-endpoint object literal for the given endpoint key.
 *
 * @param endpoints - The `endpoints` object literal.
 * @param endpoint - The endpoint key to look up.
 * @returns The endpoint's object-literal node, or `undefined`.
 */
export function findEndpointInitializer(
	endpoints: ts.ObjectLiteralExpression,
	endpoint: string,
): ts.ObjectLiteralExpression | undefined {
	for (const property of endpoints.properties) {
		if (
			ts.isPropertyAssignment(property) &&
			property.name.getText() === endpoint &&
			ts.isObjectLiteralExpression(property.initializer)
		) {
			return property.initializer;
		}
	}
	return undefined;
}

/**
 * Return the initializer of the `validator` step of an endpoint.
 *
 * @param endpointInit - The per-endpoint object literal.
 * @returns The validator property's initializer node, or `undefined`.
 */
export function findValidatorInitializer(endpointInit: ts.ObjectLiteralExpression): ts.Node | undefined {
	for (const property of endpointInit.properties) {
		if (ts.isPropertyAssignment(property) && property.name.getText() === 'validator') {
			return property.initializer;
		}
	}
	return undefined;
}

/**
 * Extract the Vine validator identifier referenced by a `validator` initializer.
 *
 * Two shapes the REST contract uses:
 * - `() => restIdValidator` — direct binding,
 * - `() => updateValidator(id, allowed)` — a factory call (the identifier is
 *   what gets mapped to a Vine module, not the arguments).
 *
 * Block-body functions are not supported (none in the current resources).
 *
 * @param node - The validator property initializer.
 * @returns The referenced identifier, or `undefined`.
 */
export function extractValidatorIdentifier(node: ts.Node): string | undefined {
	if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
		const body = ts.isParenthesizedExpression(node.body) ? node.body.expression : node.body;
		return extractIdentifier(body);
	}
	if (ts.isIdentifier(node)) return node.text;
	return undefined;
}

function extractIdentifier(node: ts.Node): string | undefined {
	if (ts.isIdentifier(node)) return node.text;
	if (ts.isCallExpression(node) && node.expression) {
		return extractIdentifier(node.expression);
	}
	return undefined;
}

/**
 * Resolve the local identifier of a Vine validator into its import record.
 *
 * The identifier must be a named or default import of the resource module;
 * otherwise the record is `undefined` and the endpoint falls back to the
 * scanner's default (no-validator) extraction.
 *
 * @param sourceText - Text of the resource module.
 * @param identifier - Local identifier to resolve.
 * @returns The extracted validator record, or `undefined`.
 */
export function resolveValidatorImport(sourceText: string, identifier: string): ExtractedValidator | undefined {
	const specifier = collectImportNames(sourceText).get(identifier);
	if (!specifier) return undefined;
	return {
		name: identifier,
		import: {
			specifier,
			type: 'named',
			value: identifier,
		},
	};
}
