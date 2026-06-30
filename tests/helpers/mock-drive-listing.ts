import type { Disk } from 'flydrive'

/**
 * Mock `listAll` on a fake disk. The Flydrive fake supports put/get/delete
 * but not listing, so we track files written via `put` and return them as
 * fake `DriveFile`-like objects from `listAll`.
 *
 * @param disk - The fake disk instance to patch.
 * @returns A map of stored files (key → content) for assertions if needed.
 */
export function mockDriveListing(disk: Disk): Map<string, string> {
  const storedFiles = new Map<string, string>()
  const originalPut = disk.put.bind(disk)

  disk.put = async function (key: string, value: string | Uint8Array) {
    const content = typeof value === 'string' ? value : Buffer.from(value).toString()
    storedFiles.set(key, content)
    return originalPut(key, value)
  }

  ;(disk as any).listAll = async (prefix?: string) => {
    const prefixStr = String(prefix || '')
    const objects = Array.from(storedFiles.entries())
      .filter(([key]) => key.startsWith(prefixStr))
      .map(([key, value]) => createFakeDriveFile(key, value))
    return { objects }
  }

  return storedFiles
}

function createFakeDriveFile(key: string, content: string) {
  return {
    key,
    name: key.split('/').pop()!,
    isFile: true as const,
    isDirectory: false as const,
    getMetaData: async () => ({
      contentLength: Buffer.byteLength(content, 'utf8'),
      etag: 'test-etag',
      lastModified: new Date(),
    }),
  }
}