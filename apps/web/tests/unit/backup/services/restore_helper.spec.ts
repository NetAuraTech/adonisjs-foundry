import { test } from '@japa/runner';

/**
 * Unit tests for the restore preparation transforms in `restore_helper`:
 * `makeDumpIdempotent` (dump rewrites) and `generateRestorePrelude` (reset
 * script generation).
 */
test.group('RestoreHelper', () => {
	// ─── makeDumpIdempotent ─────────────────────────────────────────────────

	test('makeDumpIdempotent rewrites CREATE FUNCTION to CREATE OR REPLACE FUNCTION', async ({ assert }) => {
		const { makeDumpIdempotent } = await import('#backup/services/restore_helper');

		const input = [
			'--',
			'-- Name: f; Type: FUNCTION; Schema: public; Owner: -',
			'--',
			'CREATE FUNCTION public.f() RETURNS void',
			'LANGUAGE sql',
			'AS $$',
			'SELECT 1;',
			'$$;',
		].join('\n');

		const output = makeDumpIdempotent(input).split('\n');

		assert.equal(output[3], 'CREATE OR REPLACE FUNCTION public.f() RETURNS void');
	});

	test('makeDumpIdempotent rewrites CREATE SCHEMA to CREATE SCHEMA IF NOT EXISTS', async ({ assert }) => {
		const { makeDumpIdempotent } = await import('#backup/services/restore_helper');

		const output = makeDumpIdempotent('CREATE SCHEMA public;\nCREATE SCHEMA custom;');

		assert.equal(output, 'CREATE SCHEMA IF NOT EXISTS public;\nCREATE SCHEMA IF NOT EXISTS custom;');
	});

	test('makeDumpIdempotent leaves lines inside dollar-quoted bodies untouched', async ({ assert }) => {
		const { makeDumpIdempotent } = await import('#backup/services/restore_helper');

		const input = [
			'CREATE FUNCTION public.outer() RETURNS void',
			'LANGUAGE sql',
			'AS $$',
			'CREATE FUNCTION public.inner() RETURNS void;',
			'CREATE SCHEMA public;',
			'$$;',
			'CREATE FUNCTION public.after() RETURNS void',
		].join('\n');

		const output = makeDumpIdempotent(input).split('\n');

		assert.equal(output[0], 'CREATE OR REPLACE FUNCTION public.outer() RETURNS void');
		assert.equal(output[3], 'CREATE FUNCTION public.inner() RETURNS void;');
		assert.equal(output[4], 'CREATE SCHEMA public;');
		assert.equal(output[6], 'CREATE OR REPLACE FUNCTION public.after() RETURNS void');
	});

	test('makeDumpIdempotent tracks tagged dollar quotes', async ({ assert }) => {
		const { makeDumpIdempotent } = await import('#backup/services/restore_helper');

		const input = [
			'CREATE FUNCTION public.f() RETURNS void',
			'LANGUAGE plpgsql',
			'AS $fn$',
			'CREATE FUNCTION public.inner() RETURNS void;',
			'$fn$;',
		].join('\n');

		const output = makeDumpIdempotent(input).split('\n');

		assert.equal(output[0], 'CREATE OR REPLACE FUNCTION public.f() RETURNS void');
		assert.equal(output[3], 'CREATE FUNCTION public.inner() RETURNS void;');
	});

	test('makeDumpIdempotent is idempotent on already-rewritten dumps', async ({ assert }) => {
		const { makeDumpIdempotent } = await import('#backup/services/restore_helper');

		const input = [
			'CREATE SCHEMA IF NOT EXISTS public;',
			'CREATE OR REPLACE FUNCTION public.f() RETURNS void',
			'LANGUAGE sql',
			'AS $$',
			'SELECT 1;',
			'$$;',
		].join('\n');

		assert.equal(makeDumpIdempotent(input), input);
	});

	test('makeDumpIdempotent leaves unrelated statements untouched', async ({ assert }) => {
		const { makeDumpIdempotent } = await import('#backup/services/restore_helper');

		const input = [
			'SET standard_conforming_strings = on;',
			'CREATE TABLE public.t (id integer);',
			'COPY public.t (id) FROM stdin;',
			'1',
			'\\.',
			'CREATE INDEX t_idx ON public.t (id);',
			"CREATE TYPE public.status AS ENUM ('draft', 'published');",
			'CREATE DOMAIN public.positive_int AS integer;',
			'CREATE VIEW public.v AS SELECT id FROM public.t;',
		].join('\n');

		assert.equal(makeDumpIdempotent(input), input);
	});

	test('makeDumpIdempotent leaves COPY data rows that look like statements untouched', async ({ assert }) => {
		const { makeDumpIdempotent } = await import('#backup/services/restore_helper');

		const input = [
			'CREATE TABLE public.t (body text);',
			'COPY public.t (body) FROM stdin;',
			'CREATE SCHEMA public;',
			'CREATE FUNCTION public.f() RETURNS void',
			'AS $$',
			'SELECT 1;',
			'$$;',
			'\\.',
			'CREATE SCHEMA public;',
		].join('\n');

		const output = makeDumpIdempotent(input).split('\n');

		// The `CREATE SCHEMA` / `CREATE FUNCTION` rows are COPY data, not SQL
		assert.equal(output[2], 'CREATE SCHEMA public;');
		assert.equal(output[3], 'CREATE FUNCTION public.f() RETURNS void');
		// A real `CREATE SCHEMA` after the COPY section is still rewritten
		assert.equal(output[8], 'CREATE SCHEMA IF NOT EXISTS public;');
	});

	// ─── generateRestorePrelude ─────────────────────────────────────────────

	test('generateRestorePrelude generates a catalog-driven reset for full artifacts', async ({ assert }) => {
		const { generateRestorePrelude } = await import('#backup/services/restore_helper');

		const prelude = generateRestorePrelude({ type: 'full' });

		assert.include(prelude, 'DO');
		assert.include(prelude, '$$');
		assert.include(prelude, "n.nspname = 'public'");
		assert.include(prelude, "c.relkind IN ('r', 'p', 'v', 'm', 'S')");
		assert.include(prelude, "IF object.kind IN ('r', 'p') THEN");
		assert.include(prelude, "t.typtype IN ('b', 'c', 'd', 'e')");
		assert.include(prelude, "format('DROP TABLE IF EXISTS %I.%I CASCADE',");
		assert.include(prelude, "format('DROP VIEW IF EXISTS %I.%I CASCADE',");
		assert.include(prelude, "format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE',");
		assert.include(prelude, "format('DROP SEQUENCE IF EXISTS %I.%I CASCADE',");
		assert.include(prelude, "format('DROP TYPE IF EXISTS %I.%I CASCADE',");
	});

	test('generateRestorePrelude resets only the manifest tables for differential artifacts', async ({ assert }) => {
		const { generateRestorePrelude } = await import('#backup/services/restore_helper');

		const prelude = generateRestorePrelude({ type: 'differential', tables: ['users', 'posts'] });

		assert.include(prelude, 'DROP TABLE IF EXISTS "public"."users" CASCADE;');
		assert.include(prelude, 'DROP TABLE IF EXISTS "public"."posts" CASCADE;');
		assert.notInclude(prelude, 'pg_class');
		assert.notInclude(prelude, 'pg_type');
		assert.notInclude(prelude, '$$');
	});
});
