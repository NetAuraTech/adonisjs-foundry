import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Template from '#cms/models/template/template';
import {
	button,
	flex,
	form,
	field,
	grid,
	icon,
	kicker,
	list,
	para,
	quote,
	separator,
	section,
	title,
} from './content/helpers.js';
import type { PageContent } from '#cms/types/page';

/**
 * CMS Template seeder.
 *
 * Creates a set of reusable templates covering both types:
 *   - `page`  → full page layouts applied to a translation's entire block tree
 *   - `block` → single block presets inserted at a specific position
 *
 * Templates are intentionally image-free (a dangling file id would render
 * nothing): the demo assets are owned by the page seeder.
 *
 * Run with:
 *   node ace db:seed --files database/seeders/cms/template_seeder.ts
 *
 * Templates created:
 *   Page templates:
 *     - Landing page          (hero + feature grid + CTA)
 *     - Article               (kicker + title + body + quote)
 *     - Contact page          (header + working contact form)
 *     - Coming soon           (full-screen hero + CTA)
 *
 *   Block templates:
 *     - Hero (centered)       section preset
 *     - Hero (left-aligned)   section preset
 *     - 2-column grid         grid preset
 *     - 3-column grid         grid preset
 *     - Feature section       section > grid 3 cols
 *     - Testimonial           section > quote
 *     - CTA banner            section (primary bg) > title + button
 *     - Simple separator      separator preset
 */
export default class extends BaseSeeder {
	async run() {
		// ─── Page templates ───────────────────────────────────────────────────────

		await Template.updateOrCreate(
			{ name: 'Landing page' },
			{
				name: 'Landing page',
				description: 'Hero banner, a 3-column feature grid, and a CTA section.',
				type: 'page',
				blockType: null,
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('primary-deep', 'xl', 'md', [
							flex(
								[
									kicker('Product', 'primary-light'),
									title('Build it once. Pour it everywhere.', 1, 'ink-inverted', 'primary-light'),
									para(
										'A short, molten lead paragraph goes here — one sentence of value, one sentence of proof.',
										'lg',
										'primary-light',
										'xl',
									),
									flex(
										[
											button('Get started', 'primary', 'md', {
												linkType: 'external',
												url: 'https://example.com',
											}),
											button('Learn more', 'outline', 'md', {
												linkType: 'external',
												url: 'https://example.com',
											}),
										],
										{ direction: 'row', gap: 'sm', wrap: true },
									),
								],
								{ direction: 'col', gap: 'md' },
							),
						]),
						section('surface', 'xl', 'md', [
							title('Why teams pick it', 2),
							grid({ default: 1, lg: 3 }, 'lg', [
								section(
									'canvas',
									'md',
									'md',
									[
										icon('pepicons-pencil:duplicate', 'primary', 'none'),
										title('First', 3),
										para('Feature copy goes here — one or two sentences at most.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
								section(
									'canvas',
									'md',
									'md',
									[
										icon('pepicons-pencil:grid', 'primary', 'none'),
										title('Second', 3),
										para('Feature copy goes here — one or two sentences at most.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
								section(
									'canvas',
									'md',
									'md',
									[
										icon('pepicons-pencil:shield', 'primary', 'none'),
										title('Third', 3),
										para('Feature copy goes here — one or two sentences at most.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
							]),
						]),
						section('primary', 'xl', 'md', [
							flex(
								[
									title('Ready when you are', 2, 'ink-inverted', 'primary-light'),
									button('Start now', 'secondary', 'md', {
										linkType: 'external',
										url: 'https://example.com',
									}),
								],
								{ direction: 'col', gap: 'md', align: 'center' },
							),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: 'Article' },
			{
				name: 'Article',
				description: 'Long-form reading layout: kicker, title, body copy, checklist, and a pull quote.',
				type: 'page',
				blockType: null,
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('canvas', 'xl', 'md', [
							flex(
								[
									kicker('Notes', 'primary'),
									title('An article title goes here', 1),
									para('A standfirst: one or two sentences that say what the piece is about and why it matters.', 'lg'),
								],
								{ direction: 'col', gap: 'md', className: 'max-w-3xl mx-auto' },
							),
						]),
						section('canvas', 'xl', 'md', [
							flex(
								[
									separator('md', 'primary'),
									para('Lead paragraph of the article — set the scene and state the stakes.'),
									list([
										'A supporting point, phrased like a checklist item.',
										'A second supporting point with a little more meat.',
									]),
									quote('A pull quote lifted from the body of the piece.', '— Author, Role'),
									para('A closing paragraph that points the reader somewhere useful.'),
								],
								{ direction: 'col', gap: 'lg', className: 'max-w-3xl mx-auto' },
							),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: 'Contact page' },
			{
				name: 'Contact page',
				description: 'Intro header plus a working contact form wired to the contact route.',
				type: 'page',
				blockType: null,
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('surface', 'xl', 'md', [
							flex(
								[
									kicker('Contact', 'primary'),
									title('Start the conversation', 1),
									para('Tell us what you are building — we answer within one business day.', 'lg'),
								],
								{ direction: 'col', gap: 'md' },
							),
						]),
						section('canvas', 'xl', 'md', [
							form(
								[
									field('Name', 'name', 'text', { placeholder: 'Ada Lovelace', required: true }),
									field('Email', 'email', 'email', { placeholder: 'ada@example.com', required: true }),
									field('Message', 'message', 'textarea', {
										placeholder: 'Tell us about your project…',
										required: true,
									}),
									button('Send message', 'primary', 'md', { linkType: 'page' }),
								],
								'cms.contact.execute',
							),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: 'Coming soon' },
			{
				name: 'Coming soon',
				description: 'Full-screen announcement hero with a kicker, title, and CTA.',
				type: 'page',
				blockType: null,
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('primary-deep', 'xl', 'md', [
							flex(
								[
									kicker('Coming soon', 'primary-light'),
									title('Something is being poured', 1, 'ink-inverted', 'primary-light'),
									para('We are mid-melt. This page goes live soon — check back.', 'lg', 'primary-light'),
									button('Back to the homepage', 'outline', 'md', {
										linkType: 'external',
										url: 'https://example.com',
									}),
								],
								{ direction: 'col', gap: 'md', align: 'center' },
							),
						]),
					],
				} satisfies PageContent,
			},
		);

		// ─── Block templates ───────────────────────────────────────────────────────

		await Template.updateOrCreate(
			{ name: 'Hero (centered)' },
			{
				name: 'Hero (centered)',
				description: 'Centered hero section: kicker, title, lead paragraph, single CTA.',
				type: 'block',
				blockType: 'section',
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('primary-deep', 'xl', 'md', [
							flex(
								[
									kicker('Kickoff', 'primary-light'),
									title('Centered headline', 1, 'ink-inverted', 'primary-light'),
									para('One sentence of value, one sentence of proof.', 'lg', 'primary-light'),
									button('Call to action', 'primary', 'md', {
										linkType: 'external',
										url: 'https://example.com',
									}),
								],
								{ direction: 'col', gap: 'md', align: 'center' },
							),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: 'Hero (left-aligned)' },
			{
				name: 'Hero (left-aligned)',
				description: 'Left-aligned hero section on a surface background with a two-button CTA row.',
				type: 'block',
				blockType: 'section',
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('surface', 'xl', 'md', [
							flex(
								[
									kicker('Kickoff', 'primary'),
									title('Left-aligned headline', 1),
									para('One sentence of value, one sentence of proof.', 'lg'),
									flex(
										[
											button('Primary action', 'primary', 'md', {
												linkType: 'external',
												url: 'https://example.com',
											}),
											button('Secondary action', 'outline', 'md', {
												linkType: 'external',
												url: 'https://example.com',
											}),
										],
										{ direction: 'row', gap: 'sm', wrap: true },
									),
								],
								{ direction: 'col', gap: 'md' },
							),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: '2-column grid' },
			{
				name: '2-column grid',
				description: 'Two equal columns (stacked on mobile) with placeholder copy.',
				type: 'block',
				blockType: 'grid',
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						grid({ default: 1, lg: 2 }, 'lg', [
							para('Column one — replace with any block: copy, image, form…'),
							para('Column two — replace with any block: copy, image, form…'),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: '3-column grid' },
			{
				name: '3-column grid',
				description: 'Three equal columns (stacked on mobile) with placeholder copy.',
				type: 'block',
				blockType: 'grid',
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						grid({ default: 1, lg: 3 }, 'lg', [
							para('Column one — replace with any block.'),
							para('Column two — replace with any block.'),
							para('Column three — replace with any block.'),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: 'Feature section' },
			{
				name: 'Feature section',
				description: 'Three feature cards in a grid, each with an icon, title, and copy.',
				type: 'block',
				blockType: 'section',
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('surface', 'xl', 'md', [
							title('Features', 2),
							grid({ default: 1, lg: 3 }, 'lg', [
								section(
									'canvas',
									'md',
									'md',
									[
										icon('pepicons-pencil:wrench', 'primary', 'none'),
										title('Feature one', 3),
										para('Short feature copy — one or two sentences at most.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
								section(
									'canvas',
									'md',
									'md',
									[
										icon('pepicons-pencil:square', 'primary', 'none'),
										title('Feature two', 3),
										para('Short feature copy — one or two sentences at most.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
								section(
									'canvas',
									'md',
									'md',
									[
										icon('pepicons-pencil:shield', 'primary', 'none'),
										title('Feature three', 3),
										para('Short feature copy — one or two sentences at most.', 'sm', 'muted'),
									],
									undefined,
									'card',
								),
							]),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: 'Testimonial' },
			{
				name: 'Testimonial',
				description: 'A highlighted quote with attribution, centered in its section.',
				type: 'block',
				blockType: 'section',
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('canvas', 'lg', 'md', [
							flex([quote('A short, quotable line of praise goes here.', '— Name, Company')], {
								direction: 'col',
								gap: 'md',
								className: 'max-w-2xl mx-auto',
							}),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: 'CTA banner' },
			{
				name: 'CTA banner',
				description: 'Primary-background banner with a title and a single button.',
				type: 'block',
				blockType: 'section',
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [
						section('primary', 'xl', 'md', [
							flex(
								[
									title('Ready when you are', 2, 'ink-inverted', 'primary-light'),
									button('Start now', 'secondary', 'md', {
										linkType: 'external',
										url: 'https://example.com',
									}),
								],
								{ direction: 'col', gap: 'md', align: 'center' },
							),
						]),
					],
				} satisfies PageContent,
			},
		);

		await Template.updateOrCreate(
			{ name: 'Simple separator' },
			{
				name: 'Simple separator',
				description: 'A single horizontal rule with medium spacing.',
				type: 'block',
				blockType: 'separator',
				thumbnailId: null,
				createdBy: null,
				content: {
					blocks: [separator('md', 'primary')],
				} satisfies PageContent,
			},
		);
	}
}
