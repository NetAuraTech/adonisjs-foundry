/**
 * Presentation tokens for the design system.
 *
 * These are the shared type surface for typography and paragraph presentation.
 * They live in the design-system package so every consumer (and Storybook)
 * shares a single definition, rather than each app keeping its own copy.
 */

/**
 * Base Tailwind font-size scale, mapping directly to the `text-*` utilities.
 */
export type BaseFontSize =
	| 'xs'
	| 'sm'
	| 'base'
	| 'lg'
	| 'xl'
	| '2xl'
	| '3xl'
	| '4xl'
	| '5xl'
	| '6xl'
	| '7xl'
	| '8xl'
	| '9xl';

/**
 * A font size that can optionally be scoped to a Tailwind responsive breakpoint.
 *
 * Examples: `'base'`, `'lg'`, `'md:xl'`, `'lg:2xl'`
 */
export type SingleFontSize =
	| BaseFontSize
	| `sm:${BaseFontSize}`
	| `md:${BaseFontSize}`
	| `lg:${BaseFontSize}`
	| `xl:${BaseFontSize}`
	| `2xl:${BaseFontSize}`;

/**
 * Accepted value for the `fs` prop on typography components.
 *
 * Accepts either a single responsive size or an array of sizes that are
 * joined into a space-separated class string, allowing multiple breakpoint
 * overrides to be expressed declaratively.
 *
 * @example
 * // Single size
 * fs="lg"
 *
 * // Responsive array
 * fs={['base', 'md:lg', 'xl:xl']}
 */
export type FontSize = SingleFontSize | SingleFontSize[];

/**
 * Color variants accepted by paragraph components.
 */
export type ParagraphVariants =
	| 'ink'
	| 'ink-inverted'
	| 'muted'
	| 'subtle'
	| 'error'
	| 'primary'
	| 'primary-deep'
	| 'primary-soft'
	| 'primary-light'
	| 'secondary'
	| 'secondary-deep'
	| 'secondary-soft'
	| 'secondary-light'
	| 'tertiary'
	| 'tertiary-deep'
	| 'tertiary-soft'
	| 'tertiary-light';

/**
 * Vertical spacing scale accepted by paragraph components.
 */
export type ParagraphSpacing = 'xs' | 'sm' | 'base' | 'xl';
