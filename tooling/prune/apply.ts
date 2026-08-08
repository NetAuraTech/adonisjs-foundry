/**
 * Prune pipeline CLI entrypoint.
 *
 * Standalone Node script (not an ace command) that applies a flavor manifest
 * to a clean checkout of `main` and produces the flavor tree in place. Run
 * locally and in CI via:
 *
 *   node --import @poppinss/ts-exec tooling/prune/apply.ts <flavor> [--root <path>]
 *
 * Defaults `--root` to the current working directory. Exits non-zero on any
 * inconsistency (missing delete path, rewrite outside the allowlist) so CI
 * fails loudly instead of publishing a half-pruned flavor branch.
 *
 * The manifest for `<flavor>` is resolved from
 * `tooling/prune/flavors/<flavor>.manifest.ts` — each flavor owns its own
 * manifest file (see issues #5 and #8 for the concrete `inertia` and `api`
 * manifests). A missing manifest file is a hard error: the pipeline never
 * silently skips a flavor.
 */
import { pathToFileURL } from 'node:url'
import { resolve, join } from 'node:path'
import { existsSync } from 'node:fs'
import { PruneEngine } from '#prune/engine'
import type { FlavorManifest } from '#prune/types'

/** Parsed CLI arguments. */
interface CliArgs {
  flavor: string
  root: string
  dryRun: boolean
}

/** Print usage to stderr and exit with code 2 (usage error). */
function printUsageAndExit(): never {
  process.stderr.write(
    [
      'Usage: node --import @poppinss/ts-exec tooling/prune/apply.ts <flavor> [--root <path>] [--dry-run]',
      '',
      'Arguments:',
      '  <flavor>        Flavor identifier (matches a manifest file in tooling/prune/flavors/).',
      '  --root <path>   Repo root to prune. Defaults to the current working directory.',
      '  --dry-run       Validate and report planned actions without modifying the tree.',
      '',
    ].join('\n')
  )
  process.exit(2)
}

/** Parse argv into a CliArgs object. */
function parseArgs(argv: string[]): CliArgs {
  const positional: string[] = []
  let root = process.cwd()
  let dryRun = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--root') {
      const next = argv[i + 1]
      if (!next) {
        process.stderr.write('error: --root requires a value\n')
        return process.exit(2)
      }
      root = resolve(next)
      i++
    } else if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--help' || arg === '-h') {
      printUsageAndExit()
    } else if (arg.startsWith('--')) {
      process.stderr.write(`error: unknown option ${arg}\n`)
      return process.exit(2)
    } else {
      positional.push(arg)
    }
  }

  if (positional.length === 0) {
    process.stderr.write('error: <flavor> is required\n')
    printUsageAndExit()
  }

  return { flavor: positional[0], root, dryRun }
}

/** Resolve a flavor manifest file path from the repo root. */
function manifestPath(root: string, flavor: string): string {
  return join(root, 'tooling', 'prune', 'flavors', `${flavor}.manifest.ts`)
}

/** Load a flavor manifest by dynamic import. */
async function loadManifest(root: string, flavor: string): Promise<FlavorManifest> {
  const file = manifestPath(root, flavor)
  if (!existsSync(file)) {
    process.stderr.write(
      `error: no manifest found for flavor "${flavor}".\n` +
        `expected: ${file}\n` +
        `flavor manifests live in tooling/prune/flavors/<flavor>.manifest.ts\n`
    )
    process.exit(2)
  }

  const url = pathToFileURL(file).href
  const mod = (await import(url)) as Record<string, unknown>
  const exported = mod[`${flavor}Manifest`] ?? mod.default ?? mod.manifest

  if (!exported || typeof exported !== 'object') {
    process.stderr.write(
      `error: manifest "${file}" did not export a FlavorManifest ` +
        `(expected export \`${flavor}Manifest\`, \`default\`, or \`manifest\`).\n`
    )
    process.exit(2)
  }

  return exported as FlavorManifest
}

/**
 * Main entrypoint — parse args, load the manifest, apply or dry-run, and exit
 * with a status code reflecting the outcome.
 */
async function main(): Promise<void> {
  const { flavor, root, dryRun } = parseArgs(process.argv.slice(2))
  const manifest = await loadManifest(root, flavor)
  const engine = new PruneEngine()

  if (dryRun) {
    const plan = engine.dryRun(root, manifest)
    process.stdout.write(
      [
        `Dry-run for flavor "${flavor}" against ${root}:`,
        `  would delete:    ${plan.deletedPaths.length} path(s)`,
        `  would rewrite:   ${plan.rewrittenFiles.length} file(s)`,
        `  would prune dep: ${plan.prunedPackages.length} package(s)`,
        '',
      ].join('\n')
    )
    return
  }

  const result = await engine.apply(root, manifest)
  process.stdout.write(
    [
      `Pruned flavor "${flavor}" against ${root}:`,
      `  deleted:    ${result.deletedPaths.length} path(s)`,
      `  rewrote:    ${result.rewrittenFiles.length} file(s)`,
      `  pruned dep: ${result.prunedPackages.length} package(s)`,
      '',
    ].join('\n')
  )
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`prune failed: ${message}\n`)
  process.exit(1)
})
