// @ts-expect-error Node declarations are intentionally not a production dependency.
import { lstat, open, readFile, readdir, realpath } from 'node:fs/promises';
// @ts-expect-error Node declarations are intentionally not a production dependency.
import { join, relative, resolve, sep } from 'node:path';

type Video = {
  src: string;
  description: string;
  hasAudio: boolean;
  captions?: { src: string; language: string; label: string };
};
type Entry = { data: { slug: string; published: boolean; video?: Video } };
const MAX_BYTES = 25_000_000;

function mediaPath(value: string, slug: string, extension: 'mp4' | 'vtt'): string {
  const prefix = `/media/${slug}/`;
  const name = value.startsWith(prefix) ? value.slice(prefix.length) : '';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)
    || name === '.' || name === '..' || !name.endsWith(`.${extension}`)
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Invalid media path or project slug ownership: ${value}`);
  }
  return `${slug}/${name}`;
}

function inside(path: string, root: string): boolean {
  return path === root || path.startsWith(`${root}${sep}`);
}

async function checkedFile(mediaRoot: string, relativePath: string, extension: 'mp4' | 'vtt'): Promise<void> {
  const path = resolve(mediaRoot, relativePath);
  if (!inside(path, mediaRoot)) throw new Error(`Media path escapes public root: ${relativePath}`);
  let info;
  try { info = await lstat(path); } catch {
    throw new Error(`Missing public media file: ${relativePath}`);
  }
  if (info.isSymbolicLink()) throw new Error(`Media symlink is not allowed: ${relativePath}`);
  if (!info.isFile()) throw new Error(`Media path is not a regular file: ${relativePath}`);
  const actual = await realpath(path);
  if (!inside(actual, mediaRoot)) throw new Error(`Media file escapes public root: ${relativePath}`);
  if (info.size <= 0 || info.size > MAX_BYTES) throw new Error(`Media file size must be 1–${MAX_BYTES} bytes: ${relativePath}`);
  if (extension === 'mp4') {
    const handle = await open(path, 'r');
    try {
      const header = new Uint8Array(12);
      const result = await handle.read(header, 0, header.length, 0);
      if (result.bytesRead < header.length || String.fromCharCode(...header.slice(4, 8)) !== 'ftyp') {
        throw new Error(`Media file is not an MP4: ${relativePath}`);
      }
    } finally { await handle.close(); }
  } else {
    const source = await readFile(path, 'utf8');
    if (!/^\uFEFF?WEBVTT(?:[^\n]*)\r?\n/.test(source) || !/\d\d:\d\d:\d\d\.\d{3}\s+-->\s+\d\d:\d\d:\d\d\.\d{3}/.test(source)
      || !source.split(/-->/).slice(1).some((part: string) => /\n\S/.test(part))) {
      throw new Error(`Caption VTT must contain a nonempty cue: ${relativePath}`);
    }
  }
}

async function audit(mediaRoot: string, directory: string, allowed: Set<string>): Promise<void> {
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    const info = await lstat(path);
    const key = relative(mediaRoot, path).split(sep).join('/');
    if (info.isSymbolicLink()) throw new Error(`Media symlink is not allowed: ${key}`);
    if (info.isDirectory()) await audit(mediaRoot, path, allowed);
    else if (!info.isFile() || !allowed.has(key)) throw new Error(`Orphan or unreferenced public media: ${key}`);
  }
}

export async function validatePublicMedia(entries: Entry[], publicRoot: string): Promise<void> {
  const mediaRoot = resolve(publicRoot, 'media');
  const allowed = new Set<string>();
  for (const entry of entries) {
    if (!entry.data.published || !entry.data.video) continue;
    const { slug, video } = entry.data;
    if (!video.description?.trim()) throw new Error(`Video description required for ${slug}`);
    if (video.hasAudio && (!video.captions?.language?.trim() || !video.captions?.label?.trim())) {
      throw new Error(`Video with audio requires caption language and label: ${slug}`);
    }
    const files: [string, 'mp4' | 'vtt'][] = [[video.src, 'mp4']];
    if (video.captions) files.push([video.captions.src, 'vtt']);
    for (const [source, extension] of files) {
      const key = mediaPath(source, slug, extension);
      await checkedFile(mediaRoot, key, extension);
      allowed.add(key);
    }
  }
  let rootInfo;
  try { rootInfo = await lstat(mediaRoot); } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT' && allowed.size === 0) return;
    throw new Error('Missing public media directory');
  }
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) throw new Error('Media root must be a real directory');
  const actualRoot = await realpath(mediaRoot);
  if (!inside(actualRoot, await realpath(resolve(publicRoot)))) throw new Error('Media root escapes public root');
  await audit(mediaRoot, mediaRoot, allowed);
}
