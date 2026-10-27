import type { BackupType } from '#backup/types/backup';

/**
 * The application schemas a restore resets.
 *
 * These are the schemas the backup pipeline dumps and inspects throughout
 * the module. A restore replaces their data, but never the schemas
 * themselves, their ACLs, extensions, or platform event triggers.
 */
export const RESTORE_SCHEMAS: readonly string[] = ['public'];

/**
 * Restore preparation for SQL dumps.
 *
 * The stored artifact stays a plain CREATE + data script so it remains
 * portable to a fresh database; making a restore work against a database
 * that is not empty is owned by the restore step, which:
 *
 * - rewrites the dump with {@link makeDumpIdempotent} so replayed
 *   statements replace existing objects instead of colliding;
 * - generates a reset prelude with {@link generateRestorePrelude} that
 *   drops everything the dump is about to re-create. The prelude and the
 *   dump are replayed through the same `psql` transaction, so reset and
 *   replay are atomic.
 *
 * Pure SQL text transforms — no I/O, no framework deps.
 */

/**
 * Make a plain pg_dump replayable against a database that is not empty.
 *
 * Rewrites the dump's creation statements so the replay succeeds when the
 * objects already exist:
 * - `CREATE FUNCTION ...` becomes `CREATE OR REPLACE FUNCTION ...`, so a
 *   function is replaced in place (its identity is preserved, keeping
 *   references such as event triggers valid) instead of colliding;
 * - `CREATE SCHEMA x;` becomes `CREATE SCHEMA IF NOT EXISTS x;`, so an
 *   existing schema — with its ACLs, extensions, and platform event
 *   triggers — is left untouched.
 *
 * Both rewrites are dollar-quote aware (`$$` / `$tag$` ... `$$;` / `$tag$;`):
 * lines inside a function body are never touched. The dump stays a pure
 * CREATE + data script, so it remains portable to a fresh database.
 *
 * @param input - Raw dump content.
 * @returns The idempotent dump content.
 *
 * @example
 * const safe = makeDumpIdempotent(rawDump)
 */
export function makeDumpIdempotent(input: string): string {
	const state: DollarQuoteState = { active: null };
	return input
		.split('\n')
		.map((line) => {
			if (state.active !== null) {
				// Inside a dollar-quoted body: pass the line through untouched,
				// resyncing the state at the closing delimiter.
				const delimiter = state.active;
				const closeAt = line.indexOf(delimiter);
				if (closeAt === -1) return line;
				state.active = null;
				scanDollarQuotes(line.slice(closeAt + delimiter.length), state);
				return line;
			}

			const rewritten = rewriteStatementStart(line);
			scanDollarQuotes(rewritten, state);
			return rewritten;
		})
		.join('\n');
}

/**
 * Input to {@link generateRestorePrelude}.
 */
export interface RestorePreludeInput {
	/**
	 * The kind of artifact being restored: `full` resets every object the
	 * dump re-creates, `differential` only the tables listed in its manifest.
	 */
	type: BackupType;
	/**
	 * The tables listed by a differential artifact's manifest. Required when
	 * `type` is `differential`.
	 */
	tables?: string[];
	/**
	 * The schemas to reset. Defaults to {@link RESTORE_SCHEMAS}.
	 */
	schemas?: readonly string[];
}

/**
 * Generate the reset prelude for a restore: the SQL that drops everything
 * the dump is about to re-create, to be replayed through the same `psql`
 * transaction as the dump so reset and replay are atomic.
 *
 * - `full`: a `DO` block over the catalogs drops, in each configured
 *   schema, every table, view, materialized view, and sequence (relkind
 *   `r`/`v`/`m`/`S`) and every base/composite/domain/enum type (typtype
 *   `b`/`c`/`d`/`e`);
 * - `differential`: one `DROP TABLE` per table listed in the artifact's
 *   manifest.
 *
 * The schemas themselves, their ACLs, extensions, and platform event
 * triggers stay untouched.
 *
 * @param input - What to reset: the artifact kind, the manifest tables
 *   (differential), and the schemas.
 * @returns The prelude SQL script.
 * @throws {Error} When `type` is `differential` and no manifest tables are
 *   given — resetting nothing would make the replay collide.
 *
 * @example
 * const prelude = generateRestorePrelude({ type: 'full' })
 */
export function generateRestorePrelude(input: RestorePreludeInput): string {
	const schemas = input.schemas ?? RESTORE_SCHEMAS;

	if (input.type === 'differential') {
		if (!Array.isArray(input.tables)) {
			throw new Error('A differential restore prelude requires the manifest tables');
		}
		return [
			'-- Restore prelude (differential): reset the tables the dump re-creates.',
			...dropStatementsForTables(input.tables, schemas),
		].join('\n');
	}

	return [
		'-- Restore prelude (full): reset every object the dump re-creates.',
		...schemas.flatMap((schema) => fullResetBlock(quoteLiteral(schema))),
	].join('\n');
}

/**
 * Dollar-quote tracking state for {@link makeDumpIdempotent}.
 */
interface DollarQuoteState {
	/** The open dollar-quote delimiter (`$$` or `$tag$`), or `null` outside a quote. */
	active: string | null;
}

/**
 * A dollar-quote delimiter: `$$` or `$identifier$`.
 */
const DOLLAR_QUOTE_PATTERN = /\$([A-Za-z_][A-Za-z0-9_]*)?\$/g;

/**
 * Rewrite the start of a dump statement line in place. Dump statements
 * always start at the beginning of a line, so the rewrites are line
 * anchors. Already-rewritten statements are left alone (idempotent).
 */
function rewriteStatementStart(line: string): string {
	if (/^CREATE FUNCTION /i.test(line)) {
		return line.replace(/^CREATE FUNCTION /i, 'CREATE OR REPLACE FUNCTION ');
	}
	if (/^CREATE SCHEMA (?!\s*IF NOT EXISTS\b)/i.test(line)) {
		return line.replace(/^CREATE SCHEMA /i, 'CREATE SCHEMA IF NOT EXISTS ');
	}
	return line;
}

/**
 * Fold the dollar-quote openings and closings of `text` (scanned from
 * outside a quote) into `state`, which ends up holding the delimiter open
 * at the end of the text, if any.
 */
function scanDollarQuotes(text: string, state: DollarQuoteState): void {
	let position = 0;
	while (position < text.length) {
		DOLLAR_QUOTE_PATTERN.lastIndex = position;
		const match = DOLLAR_QUOTE_PATTERN.exec(text);
		if (!match) return;

		const delimiter = match[0];
		position = match.index + delimiter.length;
		if (state.active === null) {
			state.active = delimiter;
		} else if (state.active === delimiter) {
			state.active = null;
		} else {
			// A different delimiter while another is open cannot happen in
			// valid SQL (dollar quotes do not nest); trust the latest one.
			state.active = delimiter;
		}
	}
}

/**
 * Build the `DO` block that resets one schema from the catalogs: every
 * table, view, materialized view, and sequence, then every base/composite/
 * domain/enum type, each dropped with `IF EXISTS ... CASCADE` so objects
 * already removed by a previous drop (e.g. a table's composite type) are
 * no-ops instead of errors.
 *
 * @param schemaLiteral - The schema name as a quoted SQL string literal.
 */
function fullResetBlock(schemaLiteral: string): string[] {
	return [
		'DO',
		'$$',
		'    DECLARE',
		'        object RECORD;',
		'    BEGIN',
		'        FOR object IN',
		'            SELECT c.relkind AS kind,',
		'                   n.nspname AS nsp,',
		'                   c.relname AS relname',
		'            FROM pg_class c',
		'            JOIN pg_namespace n ON n.oid = c.relnamespace',
		`            WHERE n.nspname = ${schemaLiteral}`,
		"              AND c.relkind IN ('r', 'v', 'm', 'S')",
		'        LOOP',
		"            IF object.kind = 'r' THEN",
		"                EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', object.nsp, object.relname);",
		"            ELSIF object.kind = 'v' THEN",
		"                EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', object.nsp, object.relname);",
		"            ELSIF object.kind = 'm' THEN",
		"                EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', object.nsp, object.relname);",
		"            ELSIF object.kind = 'S' THEN",
		"                EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I CASCADE', object.nsp, object.relname);",
		'            END IF;',
		'        END LOOP;',
		'',
		'        FOR object IN',
		'            SELECT n.nspname AS nsp,',
		'                   t.typname AS typname',
		'            FROM pg_type t',
		'            JOIN pg_namespace n ON n.oid = t.typnamespace',
		`            WHERE n.nspname = ${schemaLiteral}`,
		"              AND t.typtype IN ('b', 'c', 'd', 'e')",
		'        LOOP',
		"            EXECUTE format('DROP TYPE IF EXISTS %I.%I CASCADE', object.nsp, object.typname);",
		'        END LOOP;',
		'    END',
		'$$;',
	];
}

/**
 * Build one `DROP TABLE IF EXISTS ... CASCADE;` statement per table per
 * schema.
 *
 * @param tables - The manifest table names.
 * @param schemas - The schemas the tables live in.
 */
function dropStatementsForTables(tables: string[], schemas: readonly string[]): string[] {
	const statements: string[] = [];
	for (const schema of schemas) {
		for (const table of tables) {
			statements.push(`DROP TABLE IF EXISTS ${quoteIdentifier(schema)}.${quoteIdentifier(table)} CASCADE;`);
		}
	}
	return statements;
}

/**
 * Quote an SQL identifier (double quotes, embedded quotes doubled).
 */
function quoteIdentifier(name: string): string {
	return `"${name.replaceAll('"', '""')}"`;
}

/**
 * Quote an SQL string literal (single quotes, embedded quotes doubled).
 */
function quoteLiteral(name: string): string {
	return `'${name.replaceAll("'", "''")}'`;
}
