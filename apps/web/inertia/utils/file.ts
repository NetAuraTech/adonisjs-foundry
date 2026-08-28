import { Data } from '@generated/data';

/**
 * Resolves a single file by id through the admin files API.
 *
 * Serves as the `loadFile` query function injected into the design system's
 * `ImagePicker` — the design system owns no API endpoint of its own.
 */
export async function loadFileById(id: number): Promise<Data.File.File | null> {
	const res = await fetch(`/api/v1/admin/files/${id}`, {
		method: 'GET',
		headers: { Accept: 'application/json' },
	});

	if (!res.ok) return null;

	const data = await res.json();
	return data.data ?? null;
}

export function humanSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function isImage(mimeType: string): boolean {
	return mimeType.startsWith('image/');
}
