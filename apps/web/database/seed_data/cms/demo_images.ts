import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import app from '@adonisjs/core/services/app';
import sharp from 'sharp';
import CmsFile from '#file/models/file';

/**
 * Seed-time demo assets for the CMS showcase pages.
 *
 * The public pages seeded by `page_seeder.ts` reference images that cannot
 * live in the repo (`apps/web/storage/` is gitignored). This module keeps the
 * compositions as inline SVG, rasterizes them to PNG with sharp on the first
 * seed, and upserts a `files` row per image (keyed by storage path, so
 * re-running the seeder never duplicates rows).
 *
 * The palette below mirrors the "Fonderie" theme tokens (hex approximations
 * of the oklch values in `inertia/css/app.css`).
 */

const C = {
	ironDark: '#141414',
	iron: '#1f1f1e',
	ink: '#1c1c1b',
	inkMuted: '#66655f',
	inkSubtle: '#99988f',
	bone: '#f7f6f1',
	surface: '#f0efe9',
	sunken: '#e7e5dd',
	edge: '#d6d3c8',
	primaryDeep: '#9c3f0e',
	primary: '#e25c04',
	primarySoft: '#ec8a3f',
	primaryLight: '#fbe0c8',
	steelDeep: '#222f4e',
	steel: '#33418a',
	steelSoft: '#7484b6',
	steelLight: '#e2e6ef',
	brassDeep: '#8a6a14',
	brass: '#c9931a',
	brassSoft: '#e0bd5f',
	brassLight: '#f3e9c9',
};

interface DemoImageSpec {
	/** File name — also the stable identity key for the `files` row. */
	filename: string;
	/** Default alt text (used by the page seeder as `altOverride`). */
	alt: string;
	width: number;
	height: number;
	svg: string;
}

const svg = (w: number, h: number, body: string): string =>
	`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

/** Full-height vertical hairlines every `step` pixels. */
const vlines = (w: number, h: number, step: number, color: string, opacity: number): string => {
	let out = '';
	for (let x = step; x < w; x += step) {
		out += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
	}
	return `<g stroke="${color}" stroke-opacity="${opacity}" stroke-width="1">${out}</g>`;
};

/** Full-width horizontal hairlines every `step` pixels. */
const hlines = (w: number, h: number, step: number, color: string, opacity: number): string => {
	let out = '';
	for (let y = step; y < h; y += step) {
		out += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
	}
	return `<g stroke="${color}" stroke-opacity="${opacity}" stroke-width="1">${out}</g>`;
};

/** Blueprint-style gear: toothed outer circle, inner ring, spokes, brass hub. */
const gear = (cx: number, cy: number, r: number, rot = 0): string => {
	const a0 = (rot * Math.PI) / 180;
	let out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.steelLight}" stroke-width="2.5"/>`;
	for (let i = 0; i < 36; i++) {
		const a = a0 + (i * Math.PI * 2) / 36;
		const cos = Math.cos(a),
			sin = Math.sin(a);
		out += `<line x1="${(cx + (r - 30) * cos).toFixed(1)}" y1="${(cy + (r - 30) * sin).toFixed(1)}" x2="${(cx + r * cos).toFixed(1)}" y2="${(cy + r * sin).toFixed(1)}" stroke="${C.steelSoft}" stroke-width="3"/>`;
	}
	out += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.55).toFixed(1)}" fill="none" stroke="${C.steelLight}" stroke-width="1.5" opacity="0.7"/>`;
	for (let i = 0; i < 12; i++) {
		const a = a0 + (i * Math.PI) / 6;
		const cos = Math.cos(a),
			sin = Math.sin(a);
		out += `<line x1="${(cx + r * 0.12 * cos).toFixed(1)}" y1="${(cy + r * 0.12 * sin).toFixed(1)}" x2="${(cx + r * 0.55 * cos).toFixed(1)}" y2="${(cy + r * 0.55 * sin).toFixed(1)}" stroke="${C.steelSoft}" stroke-width="2"/>`;
	}
	out += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.12).toFixed(1)}" fill="${C.brass}" stroke="${C.brassDeep}" stroke-width="3"/>`;
	return out;
};

/** Semicircular gauge ticks (180° → 0°, a major tick every five). */
const gaugeTicks = (() => {
	const cx = 450,
		cy = 560,
		r = 320;
	let out = '';
	for (let i = 0; i <= 20; i++) {
		const a = ((180 - i * 9) * Math.PI) / 180;
		const major = i % 5 === 0;
		const r1 = r - (major ? 56 : 30);
		const cos = Math.cos(a),
			sin = -Math.sin(a);
		out += `<line x1="${(cx + r1 * cos).toFixed(1)}" y1="${(cy + r1 * sin).toFixed(1)}" x2="${(cx + r * cos).toFixed(1)}" y2="${(cy + r * sin).toFixed(1)}" stroke="${major ? C.bone : C.inkSubtle}" stroke-width="${major ? 5 : 2}"/>`;
	}
	return out;
})();

/** Radiating spark burst from an off-centre origin. */
const burst = (() => {
	const cx = 430,
		cy = 390;
	const colors = [C.primary, C.brass, C.primarySoft, C.inkSubtle];
	let out = '';
	for (let i = 0; i < 30; i++) {
		const a = (i * Math.PI * 2) / 30 + 0.1;
		const len = 110 + Math.round(300 * Math.abs(Math.sin(i * 7.3)));
		const x2 = (cx + len * Math.cos(a)).toFixed(1);
		const y2 = (cy + len * Math.sin(a)).toFixed(1);
		const color = colors[i % 4];
		const op = (0.45 + 0.5 * Math.abs(Math.cos(i * 3.1))).toFixed(2);
		out += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${i % 3 === 0 ? 4 : 2}" opacity="${op}" stroke-linecap="round"/>`;
		if (i % 2 === 0) out += `<circle cx="${x2}" cy="${y2}" r="5" fill="${color}" opacity="0.8"/>`;
	}
	return out;
})();

export const DEMO_IMAGES: DemoImageSpec[] = [
	{
		filename: 'forge-hero.png',
		alt: 'Fournaise — coulée en fusion',
		width: 1600,
		height: 900,
		svg: svg(
			1600,
			900,
			`<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ironDark}"/><stop offset="1" stop-color="${C.iron}"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.82" r="0.8"><stop offset="0" stop-color="${C.primary}" stop-opacity="0.5"/><stop offset="0.55" stop-color="${C.primaryDeep}" stop-opacity="0.2"/><stop offset="1" stop-color="${C.primaryDeep}" stop-opacity="0"/></radialGradient>
<linearGradient id="molten" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.primaryDeep}" stop-opacity="0"/><stop offset="0.18" stop-color="${C.primarySoft}"/><stop offset="0.5" stop-color="${C.primaryLight}"/><stop offset="0.82" stop-color="${C.primarySoft}"/><stop offset="1" stop-color="${C.primaryDeep}" stop-opacity="0"/></linearGradient>
</defs>
<rect width="1600" height="900" fill="url(#bg)"/>
${vlines(1600, 900, 100, C.bone, 0.05)}
<rect width="1600" height="900" fill="url(#glow)"/>
<rect x="0" y="600" width="1600" height="7" fill="url(#molten)"/>
<rect x="0" y="610" width="1600" height="2" fill="${C.primaryLight}" opacity="0.45"/>
<line x1="800" y1="598" x2="716" y2="330" stroke="${C.primarySoft}" stroke-width="3" opacity="0.75" stroke-linecap="round"/>
<line x1="812" y1="598" x2="876" y2="300" stroke="${C.brassSoft}" stroke-width="2.5" opacity="0.6" stroke-linecap="round"/>
<line x1="790" y1="598" x2="560" y2="420" stroke="${C.primaryLight}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>
<line x1="818" y1="598" x2="1030" y2="400" stroke="${C.primary}" stroke-width="2.5" opacity="0.55" stroke-linecap="round"/>
<circle cx="716" cy="330" r="6" fill="${C.primarySoft}" opacity="0.8"/>
<circle cx="876" cy="300" r="5" fill="${C.brassSoft}" opacity="0.7"/>
<rect x="48" y="48" width="72" height="72" fill="none" stroke="${C.brass}" stroke-width="3"/>
<rect x="62" y="62" width="44" height="44" fill="${C.primary}"/>`,
		),
	},
	{
		filename: 'specimen-grid.png',
		alt: "Grille d'échantillons — plaques rivetées",
		width: 1200,
		height: 800,
		svg: svg(
			1200,
			800,
			(() => {
				const fills = [C.bone, C.primaryLight, C.steelLight, C.brassLight, C.surface, C.steelSoft];
				let out = `<rect width="1200" height="800" fill="${C.ink}"/>`;
				for (let r = 0; r < 2; r++) {
					for (let c = 0; c < 3; c++) {
						const i = r * 3 + c;
						const x = 80 + c * 350,
							y = 80 + r * 320;
						out += `<rect x="${x}" y="${y}" width="300" height="260" fill="${fills[i]}" stroke="${C.ink}" stroke-width="3"/>`;
						for (const [dx, dy] of [
							[26, 26],
							[274, 26],
							[26, 234],
							[274, 234],
						]) {
							out += `<circle cx="${x + dx}" cy="${y + dy}" r="9" fill="${C.ink}" opacity="0.85"/>`;
						}
						out += `<rect x="${x + 26}" y="${y + 200}" width="40" height="12" fill="${C.primary}"/>`;
					}
				}
				return out;
			})(),
		),
	},
	{
		filename: 'molten-flow.png',
		alt: 'Coulée de métal le long du caniveau',
		width: 1200,
		height: 800,
		svg: svg(
			1200,
			800,
			`<defs>
<linearGradient id="flow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0"><stop offset="0" stop-color="${C.primaryDeep}"/><stop offset="0.35" stop-color="${C.primarySoft}"/><stop offset="0.6" stop-color="${C.primaryLight}"/><stop offset="1" stop-color="${C.brassDeep}"/></linearGradient>
</defs>
<rect width="1200" height="800" fill="${C.ironDark}"/>
${vlines(1200, 800, 120, C.bone, 0.04)}
<path d="M -40 560 C 260 420, 420 640, 700 500 C 940 380, 1080 560, 1240 460" fill="none" stroke="#14110f" stroke-width="118"/>
<path d="M -40 560 C 260 420, 420 640, 700 500 C 940 380, 1080 560, 1240 460" fill="none" stroke="url(#flow)" stroke-width="86" stroke-linecap="round"/>
<path d="M -40 560 C 260 420, 420 640, 700 500 C 940 380, 1080 560, 1240 460" fill="none" stroke="#f6ddb4" stroke-width="26" opacity="0.55" stroke-linecap="round"/>
<circle cx="300" cy="472" r="10" fill="${C.primaryLight}" opacity="0.8"/>
<circle cx="700" cy="500" r="14" fill="${C.primarySoft}" opacity="0.9"/>
<circle cx="1010" cy="486" r="8" fill="${C.brassSoft}" opacity="0.8"/>`,
		),
	},
	{
		filename: 'steel-plates.png',
		alt: "Plaques d'acier rivetées, colonne laiton",
		width: 1200,
		height: 800,
		svg: svg(
			1200,
			800,
			(() => {
				const fills = [C.steel, C.steelDeep, '#4a6b8a', C.steel, C.steelDeep];
				let out = `<rect width="1200" height="800" fill="${C.bone}"/>`;
				for (let i = 0; i < 5; i++) {
					const y = 110 + i * 118;
					out += `<rect x="140" y="${y}" width="780" height="86" fill="${fills[i]}" stroke="${C.ink}" stroke-width="3"/>`;
					out += `<line x1="140" y1="${y + 12}" x2="920" y2="${y + 12}" stroke="${C.bone}" stroke-opacity="0.25" stroke-width="2"/>`;
					for (const dx of [50, 300, 550, 710]) {
						out += `<circle cx="${140 + dx}" cy="${y + 43}" r="9" fill="${C.bone}" opacity="0.9"/>`;
					}
				}
				out += `<rect x="960" y="110" width="100" height="556" fill="${C.brass}" stroke="${C.brassDeep}" stroke-width="3"/>`;
				out += `<circle cx="1010" cy="140" r="10" fill="${C.brassDeep}"/>`;
				out += `<circle cx="1010" cy="636" r="10" fill="${C.brassDeep}"/>`;
				out += `<rect x="140" y="700" width="920" height="6" fill="${C.ink}"/>`;
				return out;
			})(),
		),
	},
	{
		filename: 'blueprint-gears.png',
		alt: 'Plan — engrenages et repères de montage',
		width: 1200,
		height: 800,
		svg: svg(
			1200,
			800,
			`<rect width="1200" height="800" fill="${C.steelDeep}"/>
${vlines(1200, 800, 80, C.bone, 0.06)}
${hlines(1200, 800, 80, C.bone, 0.06)}
<line x1="0" y1="400" x2="1200" y2="400" stroke="${C.bone}" stroke-opacity="0.15" stroke-width="1"/>
<line x1="430" y1="0" x2="430" y2="800" stroke="${C.bone}" stroke-opacity="0.15" stroke-width="1"/>
${gear(430, 400, 260)}
${gear(880, 400, 150, 7.5)}
<rect x="48" y="48" width="40" height="40" fill="none" stroke="${C.brass}" stroke-width="3"/>
<rect x="1112" y="712" width="40" height="40" fill="none" stroke="${C.brass}" stroke-width="3"/>`,
		),
	},
	{
		filename: 'brass-gauge.png',
		alt: 'Jauge laiton, aiguille au rouge',
		width: 900,
		height: 900,
		svg: svg(
			900,
			900,
			`<rect width="900" height="900" fill="${C.iron}"/>
${vlines(900, 900, 90, C.bone, 0.04)}
<path d="M 130 560 A 320 320 0 0 1 633.5 297.9" fill="none" stroke="${C.brass}" stroke-width="14"/>
${gaugeTicks}
<line x1="450" y1="560" x2="269.9" y2="345.5" stroke="${C.primary}" stroke-width="9" stroke-linecap="round"/>
<circle cx="450" cy="560" r="28" fill="${C.ink}" stroke="${C.bone}" stroke-width="3"/>
<rect x="250" y="588" width="400" height="14" fill="${C.ink}"/>
<rect x="48" y="48" width="36" height="36" fill="${C.brass}"/>`,
		),
	},
	{
		filename: 'spark-burst.png',
		alt: 'Éclats de forge',
		width: 1200,
		height: 675,
		svg: svg(
			1200,
			675,
			`<rect width="1200" height="675" fill="#141210"/>
${burst}
<circle cx="430" cy="390" r="10" fill="${C.primaryLight}"/>
<rect x="24" y="24" width="1152" height="627" fill="none" stroke="${C.bone}" stroke-opacity="0.15" stroke-width="2"/>`,
		),
	},
	{
		filename: 'foundry-mark.png',
		alt: "Marque de la fonderie — F d'atelier",
		width: 1200,
		height: 800,
		svg: svg(
			1200,
			800,
			`<rect width="1200" height="800" fill="${C.surface}"/>
<rect x="232" y="172" width="740" height="480" fill="${C.sunken}" stroke="${C.edge}" stroke-width="2"/>
<rect x="200" y="140" width="740" height="480" fill="${C.primaryDeep}" stroke="${C.ink}" stroke-width="3"/>
<rect x="380" y="240" width="110" height="260" fill="${C.bone}"/>
<rect x="380" y="240" width="330" height="74" fill="${C.bone}"/>
<rect x="380" y="352" width="250" height="56" fill="${C.primaryLight}"/>
${[C.brass, C.steel, C.primarySoft, C.bone, C.brassDeep, C.steelLight]
	.map(
		(f, i) =>
			`<rect x="${380 + i * 56}" y="540" width="40" height="40" fill="${f}" stroke="${C.ink}" stroke-width="2"/>`,
	)
	.join('')}`,
		),
	},
];

/**
 * Ensures every demo asset exists on the `fs` disk (rasterizing its SVG
 * source on first seed) and that a `files` row exists for it, then returns a
 * filename → file id map for the page seeder to embed in image blocks.
 *
 * Idempotent: the physical file is written only when missing, and the
 * `files` row is keyed by storage path, so re-running never duplicates rows.
 */
export async function ensureDemoFiles(): Promise<Record<string, number>> {
	const filesDir = path.join(app.makePath('storage'), 'cms', 'files');
	const ids: Record<string, number> = {};

	for (const spec of DEMO_IMAGES) {
		const absolute = path.join(filesDir, spec.filename);
		const storagePath = `cms/files/${spec.filename}`;

		if (!fs.existsSync(absolute)) {
			await fsp.mkdir(filesDir, { recursive: true });
			await sharp(Buffer.from(spec.svg, 'utf8')).png().toFile(absolute);
		}

		const existing = await CmsFile.query().where('path', storagePath).first();
		if (existing) {
			ids[spec.filename] = existing.id;
			continue;
		}

		const stat = await fsp.stat(absolute);
		const row = await CmsFile.create({
			disk: 'fs',
			extension: 'png',
			filename: spec.filename,
			folderId: null,
			mimeType: 'image/png',
			originalName: spec.filename,
			path: storagePath,
			size: stat.size,
			uploadedBy: null,
		});
		ids[spec.filename] = row.id;
	}

	return ids;
}
