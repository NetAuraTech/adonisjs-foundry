import './css/app.css';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { TuyauProvider } from '@adonisjs/inertia/react';
import { Data } from '@generated/data';
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { ReactElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '~/components/atoms/error_boundary';
import Layout from '~/layouts/default';
import { initSentry } from '~/lib/sentry';
import { client } from './client';

initSentry();

let appName = '';

/**
 * Hand-drawn frame outlines for notebook front cards. Three tangent-continuous
 * wobbles sketched on a 320x200 sheet, cycled by card position so each frame
 * reads as its own pen stroke.
 */
const SKETCH_PATHS = [
	'M 32 12.9 L 35.7 12.9 L 39.5 12.8 L 43.2 12.8 L 47 12.8 L 50.7 12.9 L 54.4 13.1 L 58.2 13.4 L 61.9 13.7 L 65.6 13.9 L 69.4 14 L 73.1 14.1 L 76.9 14 L 80.6 13.9 L 84.3 13.9 L 88.1 14 L 91.8 14.2 L 95.5 14.5 L 99.3 14.9 L 103 15.3 L 106.8 15.6 L 110.5 15.7 L 114.2 15.6 L 118 15.4 L 121.7 15.1 L 125.4 14.8 L 129.2 14.5 L 132.9 14.3 L 136.7 14 L 140.4 13.7 L 144.1 13.3 L 147.9 13 L 151.6 12.6 L 155.4 12.3 L 159.1 12.2 L 162.8 12.3 L 166.6 12.5 L 170.3 12.9 L 174 13.3 L 177.8 13.7 L 181.5 14 L 185.3 14.1 L 189 14.1 L 192.7 14.1 L 196.5 14 L 200.2 14.1 L 203.9 14.2 L 207.7 14.4 L 211.4 14.6 L 215.2 14.8 L 218.9 15 L 222.6 15 L 226.4 15 L 230.1 15 L 233.8 15 L 237.6 15 L 241.3 15.1 L 245.1 15.1 L 248.8 15 L 252.5 14.7 L 256.3 14.4 L 260 13.8 L 263.8 13.3 L 267.5 12.7 L 271.2 12.3 L 275 12.1 L 278.7 12.2 L 282.4 12.3 L 286.2 12.6 L 290 13 L 293.8 14.1 L 297.3 15.9 L 300.3 18.3 L 302.7 21.2 L 304.2 24.6 L 304.9 28.2 L 304.7 31.8 L 304.5 35.5 L 304.7 39.3 L 305.1 43 L 305.2 46.8 L 305 50.5 L 304.5 54.2 L 304.2 58 L 304.5 61.7 L 305.3 65.4 L 306.4 69.2 L 307.4 72.9 L 308 76.7 L 308.2 80.4 L 308.3 84.1 L 308.3 87.9 L 308.1 91.6 L 307.5 95.4 L 306.4 99.1 L 305.2 102.8 L 304.3 106.6 L 304.1 110.3 L 304.4 114 L 304.9 117.8 L 305.1 121.5 L 305 125.3 L 304.7 129 L 304.7 132.7 L 305 136.5 L 305.5 140.2 L 306 143.9 L 306.3 147.7 L 306.6 151.4 L 307.2 155.2 L 308 158.9 L 308.7 162.6 L 308.9 166.4 L 308.1 170.4 L 306.1 174.1 L 303.6 177.2 L 300.9 179.8 L 298 181.9 L 294.8 183.5 L 291.5 184.6 L 288 184.9 L 284.3 184.9 L 280.5 184.8 L 276.8 184.8 L 273 184.8 L 269.3 184.9 L 265.6 185.1 L 261.8 185.4 L 258.1 185.7 L 254.4 185.9 L 250.6 186 L 246.9 186.1 L 243.1 186 L 239.4 185.9 L 235.7 185.9 L 231.9 186 L 228.2 186.2 L 224.5 186.5 L 220.7 186.9 L 217 187.3 L 213.2 187.6 L 209.5 187.7 L 205.8 187.6 L 202 187.4 L 198.3 187.1 L 194.6 186.8 L 190.8 186.5 L 187.1 186.3 L 183.3 186 L 179.6 185.7 L 175.9 185.3 L 172.1 185 L 168.4 184.6 L 164.6 184.3 L 160.9 184.2 L 157.2 184.3 L 153.4 184.5 L 149.7 184.9 L 146 185.3 L 142.2 185.7 L 138.5 186 L 134.7 186.1 L 131 186.1 L 127.3 186.1 L 123.5 186 L 119.8 186.1 L 116.1 186.2 L 112.3 186.4 L 108.6 186.6 L 104.8 186.8 L 101.1 187 L 97.4 187 L 93.6 187 L 89.9 187 L 86.2 187 L 82.4 187 L 78.7 187.1 L 74.9 187.1 L 71.2 187 L 67.5 186.7 L 63.7 186.4 L 60 185.8 L 56.2 185.3 L 52.5 184.7 L 48.8 184.3 L 45 184.1 L 41.3 184.2 L 37.6 184.3 L 33.8 184.6 L 30.2 184.8 L 26.7 184.3 L 23.3 183.1 L 20.3 181.1 L 17.6 178.5 L 15.5 175.5 L 13.8 172 L 12.7 168.2 L 12.5 164.5 L 12.7 160.7 L 13.1 157 L 13.2 153.2 L 13 149.5 L 12.5 145.8 L 12.2 142 L 12.5 138.3 L 13.3 134.6 L 14.4 130.8 L 15.4 127.1 L 16 123.3 L 16.2 119.6 L 16.3 115.9 L 16.3 112.1 L 16.1 108.4 L 15.5 104.6 L 14.4 100.9 L 13.2 97.2 L 12.3 93.4 L 12.1 89.7 L 12.4 86 L 12.9 82.2 L 13.1 78.5 L 13 74.7 L 12.7 71 L 12.7 67.3 L 13 63.5 L 13.5 59.8 L 14 56.1 L 14.3 52.3 L 14.6 48.6 L 15.2 44.8 L 16 41.1 L 16.7 37.4 L 16.9 33.6 L 16.3 30.2 L 16 26.6 L 16.6 22.9 L 18.3 19.5 L 21 16.6 L 24.3 14.6 L 28.1 13.3 Z',
	'M 32 13.7 L 35.7 13.9 L 39.5 14.1 L 43.2 14.3 L 47 14.5 L 50.7 14.6 L 54.4 14.7 L 58.2 14.6 L 61.9 14.6 L 65.6 14.6 L 69.4 14.7 L 73.1 14.8 L 76.9 15.1 L 80.6 15.3 L 84.3 15.5 L 88.1 15.4 L 91.8 15.2 L 95.5 14.8 L 99.3 14.3 L 103 13.8 L 106.8 13.3 L 110.5 12.9 L 114.2 12.7 L 118 12.6 L 121.7 12.6 L 125.4 12.5 L 129.2 12.5 L 132.9 12.6 L 136.7 12.7 L 140.4 12.8 L 144.1 13.1 L 147.9 13.5 L 151.6 14 L 155.4 14.4 L 159.1 14.7 L 162.8 14.9 L 166.6 14.9 L 170.3 14.8 L 174 14.6 L 177.8 14.5 L 181.5 14.4 L 185.3 14.5 L 189 14.7 L 192.7 14.9 L 196.5 15.1 L 200.2 15.2 L 203.9 15.1 L 207.7 15 L 211.4 14.7 L 215.2 14.4 L 218.9 14.2 L 222.6 14 L 226.4 13.8 L 230.1 13.5 L 233.8 13.3 L 237.6 12.9 L 241.3 12.6 L 245.1 12.3 L 248.8 12.1 L 252.5 12.1 L 256.3 12.3 L 260 12.7 L 263.8 13.2 L 267.5 13.7 L 271.2 14.2 L 275 14.6 L 278.7 14.7 L 282.4 14.8 L 286.2 14.8 L 289.8 14.9 L 293.3 15.7 L 296.5 17.2 L 299.3 19.4 L 301.5 22.1 L 303.3 25.1 L 304.6 28.3 L 305.3 31.8 L 305.5 35.5 L 305.4 39.3 L 305.4 43 L 305.6 46.8 L 306.4 50.5 L 307.5 54.2 L 308.5 58 L 308.9 61.7 L 308.6 65.4 L 307.8 69.2 L 307 72.9 L 306.3 76.7 L 305.7 80.4 L 305 84.1 L 304.2 87.9 L 303.7 91.6 L 303.7 95.4 L 304.2 99.1 L 305 102.8 L 305.6 106.6 L 305.8 110.3 L 305.6 114 L 305.4 117.8 L 305.6 121.5 L 306.2 125.3 L 307 129 L 307.6 132.7 L 307.9 136.5 L 307.9 140.2 L 308 143.9 L 307.9 147.7 L 307.7 151.4 L 306.9 155.2 L 305.7 158.9 L 304.4 162.6 L 303.5 166.4 L 303.3 169.8 L 303.1 173.1 L 302.3 176.4 L 300.6 179.5 L 298.1 182.1 L 295.1 184 L 291.6 185.2 L 288 185.7 L 284.3 185.9 L 280.5 186.1 L 276.8 186.3 L 273 186.5 L 269.3 186.6 L 265.6 186.7 L 261.8 186.6 L 258.1 186.6 L 254.4 186.6 L 250.6 186.7 L 246.9 186.8 L 243.1 187.1 L 239.4 187.3 L 235.7 187.5 L 231.9 187.4 L 228.2 187.2 L 224.5 186.8 L 220.7 186.3 L 217 185.8 L 213.2 185.3 L 209.5 184.9 L 205.8 184.7 L 202 184.6 L 198.3 184.6 L 194.6 184.5 L 190.8 184.5 L 187.1 184.6 L 183.3 184.7 L 179.6 184.8 L 175.9 185.1 L 172.1 185.5 L 168.4 186 L 164.6 186.4 L 160.9 186.7 L 157.2 186.9 L 153.4 186.9 L 149.7 186.8 L 146 186.6 L 142.2 186.5 L 138.5 186.4 L 134.7 186.5 L 131 186.7 L 127.3 186.9 L 123.5 187.1 L 119.8 187.2 L 116.1 187.1 L 112.3 187 L 108.6 186.7 L 104.8 186.4 L 101.1 186.2 L 97.4 186 L 93.6 185.8 L 89.9 185.5 L 86.2 185.3 L 82.4 184.9 L 78.7 184.6 L 74.9 184.3 L 71.2 184.1 L 67.5 184.1 L 63.7 184.3 L 60 184.7 L 56.2 185.2 L 52.5 185.7 L 48.8 186.2 L 45 186.6 L 41.3 186.7 L 37.6 186.8 L 33.8 186.8 L 30 186.7 L 26.2 185.9 L 22.6 184.4 L 19.3 182.2 L 16.5 179.4 L 14.5 175.9 L 13.4 172.1 L 13.3 168.2 L 13.5 164.5 L 13.4 160.7 L 13.4 157 L 13.6 153.2 L 14.4 149.5 L 15.5 145.8 L 16.5 142 L 16.9 138.3 L 16.6 134.6 L 15.8 130.8 L 15 127.1 L 14.3 123.3 L 13.7 119.6 L 13 115.9 L 12.2 112.1 L 11.7 108.4 L 11.7 104.6 L 12.2 100.9 L 13 97.2 L 13.6 93.4 L 13.8 89.7 L 13.6 86 L 13.4 82.2 L 13.6 78.5 L 14.2 74.7 L 15 71 L 15.6 67.3 L 15.9 63.5 L 15.9 59.8 L 16 56.1 L 15.9 52.3 L 15.7 48.6 L 14.9 44.8 L 13.7 41.1 L 12.4 37.4 L 11.5 33.6 L 11.5 29.6 L 13 25.6 L 15.3 22.1 L 18 19.2 L 21.1 16.9 L 24.5 15.1 L 28.2 14 Z',
	'M 32 15.1 L 35.7 15 L 39.5 14.8 L 43.2 14.5 L 47 14.2 L 50.7 13.9 L 54.4 13.8 L 58.2 13.7 L 61.9 13.7 L 65.6 13.8 L 69.4 13.9 L 73.1 13.9 L 76.9 13.7 L 80.6 13.5 L 84.3 13.1 L 88.1 12.7 L 91.8 12.5 L 95.5 12.4 L 99.3 12.5 L 103 12.7 L 106.8 13 L 110.5 13.3 L 114.2 13.7 L 118 14 L 121.7 14.2 L 125.4 14.5 L 129.2 14.8 L 132.9 15.1 L 136.7 15.5 L 140.4 15.7 L 144.1 15.8 L 147.9 15.8 L 151.6 15.5 L 155.4 15.1 L 159.1 14.7 L 162.8 14.2 L 166.6 13.9 L 170.3 13.7 L 174 13.6 L 177.8 13.6 L 181.5 13.7 L 185.3 13.7 L 189 13.7 L 192.7 13.5 L 196.5 13.3 L 200.2 13.1 L 203.9 13 L 207.7 13 L 211.4 13 L 215.2 13 L 218.9 13.1 L 222.6 13.2 L 226.4 13.2 L 230.1 13.2 L 233.8 13.3 L 237.6 13.5 L 241.3 13.8 L 245.1 14.3 L 248.8 14.8 L 252.5 15.3 L 256.3 15.7 L 260 15.9 L 263.8 15.9 L 267.5 15.7 L 271.2 15.4 L 275 15 L 278.7 14.7 L 282.4 14.4 L 286.2 14.2 L 289.9 14.1 L 293.6 14.7 L 297.2 16 L 300.5 18 L 303.4 20.7 L 305.7 24 L 307.1 27.8 L 307.3 31.8 L 306.8 35.5 L 306.7 39.3 L 307 43 L 307.4 46.8 L 307.4 50.5 L 306.8 54.2 L 305.8 58 L 304.8 61.7 L 304 65.4 L 303.7 69.2 L 303.7 72.9 L 303.8 76.7 L 304 80.4 L 304.5 84.1 L 305.4 87.9 L 306.6 91.6 L 307.7 95.4 L 308.2 99.1 L 308.1 102.8 L 307.5 106.6 L 307 110.3 L 306.8 114 L 306.9 117.8 L 307.1 121.5 L 306.9 125.3 L 306.4 129 L 305.9 132.7 L 305.5 136.5 L 305.2 140.2 L 304.9 143.9 L 304.4 147.7 L 303.7 151.4 L 303.3 155.2 L 303.5 158.9 L 304.5 162.6 L 305.8 166.4 L 306.9 170.2 L 306.5 174.2 L 304.9 177.9 L 302.4 181.1 L 299.3 183.7 L 295.8 185.6 L 292 186.8 L 288 187.1 L 284.3 187 L 280.5 186.8 L 276.8 186.5 L 273 186.2 L 269.3 185.9 L 265.6 185.8 L 261.8 185.7 L 258.1 185.7 L 254.4 185.8 L 250.6 185.9 L 246.9 185.9 L 243.1 185.7 L 239.4 185.5 L 235.7 185.1 L 231.9 184.7 L 228.2 184.5 L 224.5 184.4 L 220.7 184.5 L 217 184.7 L 213.2 185 L 209.5 185.3 L 205.8 185.7 L 202 186 L 198.3 186.2 L 194.6 186.5 L 190.8 186.8 L 187.1 187.1 L 183.3 187.5 L 179.6 187.7 L 175.9 187.8 L 172.1 187.8 L 168.4 187.5 L 164.6 187.1 L 160.9 186.7 L 157.2 186.2 L 153.4 185.9 L 149.7 185.7 L 146 185.6 L 142.2 185.6 L 138.5 185.7 L 134.7 185.7 L 131 185.7 L 127.3 185.5 L 123.5 185.3 L 119.8 185.1 L 116.1 185 L 112.3 185 L 108.6 185 L 104.8 185 L 101.1 185.1 L 97.4 185.2 L 93.6 185.2 L 89.9 185.2 L 86.2 185.3 L 82.4 185.5 L 78.7 185.8 L 74.9 186.3 L 71.2 186.8 L 67.5 187.3 L 63.7 187.7 L 60 187.9 L 56.2 187.9 L 52.5 187.7 L 48.8 187.4 L 45 187 L 41.3 186.7 L 37.6 186.4 L 33.8 186.2 L 30.1 185.9 L 26.5 184.9 L 23.3 183.2 L 20.5 180.8 L 18.4 178 L 16.9 174.8 L 15.9 171.6 L 15.3 168.2 L 14.8 164.5 L 14.7 160.7 L 15 157 L 15.4 153.2 L 15.4 149.5 L 14.8 145.8 L 13.8 142 L 12.8 138.3 L 12 134.6 L 11.7 130.8 L 11.7 127.1 L 11.8 123.3 L 12 119.6 L 12.5 115.9 L 13.4 112.1 L 14.6 108.4 L 15.7 104.6 L 16.2 100.9 L 16.1 97.2 L 15.5 93.4 L 15 89.7 L 14.8 86 L 14.9 82.2 L 15.1 78.5 L 14.9 74.7 L 14.4 71 L 13.9 67.3 L 13.5 63.5 L 13.2 59.8 L 12.9 56.1 L 12.4 52.3 L 11.7 48.6 L 11.3 44.8 L 11.5 41.1 L 12.5 37.4 L 13.8 33.6 L 15.1 30 L 16.4 26.7 L 17.9 23.7 L 19.8 20.9 L 22.3 18.5 L 25.2 16.7 L 28.5 15.5 Z',
];

/**
 * Per-path viewBox, cropped to the stroke's own bounding box. The raw paths
 * carry uneven margins on the 320x200 sheet; cropping each one lets
 * `preserveAspectRatio="none"` stretch the pen stroke exactly to the card edge
 * — the frame is the card's border, not a line drawn inside it. Pure string
 * scan: the wobbles are plain `M`/`L` polylines.
 */
const SKETCH_VIEW_BOXES = SKETCH_PATHS.map((d) => {
	const nums = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;
	for (let i = 0; i < nums.length; i += 2) {
		minX = Math.min(minX, nums[i]);
		minY = Math.min(minY, nums[i + 1]);
		maxX = Math.max(maxX, nums[i]);
		maxY = Math.max(maxY, nums[i + 1]);
	}
	return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
});

/**
 * Injects the hand-drawn frame into every notebook front card (`.card` inside
 * `.notebook-page`).
 *
 * The frame is an inline SVG stretched to the card box: `preserveAspectRatio="none"`
 * bends the wobble to any card size while `vector-effect="non-scaling-stroke"`
 * keeps the ink a constant screen-space weight (a CSS background image cannot do
 * this — stretched strokes come out uneven). The viewBox is cropped to the
 * stroke's bounding box, so the pen stroke sits flush on the card edge and
 * replaces the card's border — cards flagged `border-danger` (the account
 * delete card) draw the stroke in the danger colour. A mutation observer keeps
 * frames in sync with Inertia navigation and CMS builder edits.
 */
function SketchFrames() {
	useEffect(() => {
		const decorate = (card: Element) => {
			if (card.querySelector(':scope > svg.sketch-frame')) return;
			const siblings = Array.from(card.parentElement?.children ?? []).filter((c) => c.classList.contains('card'));
			const index = siblings.indexOf(card) % SKETCH_PATHS.length;
			const stroke = card.classList.contains('border-danger') ? 'var(--color-danger)' : 'var(--color-ink)';
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('class', 'sketch-frame');
			svg.setAttribute('viewBox', SKETCH_VIEW_BOXES[index]);
			svg.setAttribute('preserveAspectRatio', 'none');
			svg.setAttribute('aria-hidden', 'true');
			svg.innerHTML = `<path d="${SKETCH_PATHS[index]}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
			card.appendChild(svg);
		};

		const decorateSubtree = (root: ParentNode) => {
			root.querySelectorAll('.notebook-page .card').forEach(decorate);
		};

		decorateSubtree(document);
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				mutation.addedNodes.forEach((node) => {
					if (node instanceof Element) {
						if (node.matches?.('.notebook-page .card')) decorate(node);
						decorateSubtree(node);
					}
				});
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, []);

	return null;
}

createInertiaApp({
	title: (title) => (title ? `${title} - ${appName}` : appName),
	resolve: (name) => {
		return resolvePageComponent<ResolvedComponent>(
			`./pages/${name}.tsx`,
			import.meta.glob<ResolvedComponent>(['./pages/**/*.tsx', '!./pages/**/*.spec.tsx']),
			(page: ReactElement<Data.SharedProps>) => <Layout>{page}</Layout>,
		);
	},
	setup({ el, App, props }) {
		appName = props.initialPage.props.app_name as string;

		createRoot(el).render(
			<TuyauProvider client={client}>
				<ErrorBoundary>
					<App {...props} />
					<SketchFrames />
				</ErrorBoundary>
			</TuyauProvider>,
		);
	},
	progress: {
		color: '#4B5563',
	},
});
