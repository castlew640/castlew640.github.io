import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const project = fileURLToPath(new URL('../', import.meta.url));
const dist = join(project, 'dist');
const SCENE_BUDGET = 190_000;
const SCREENSHOT_BUDGET = 180_000;

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path));
    else files.push(path);
  }
  return files;
}

for (const file of await filesIn(join(project, 'src/scripts/exhibition/scene'))) {
  if (file.endsWith('.ts') && /new\s+Clock\b|elapsedTime|getDelta\s*\(\s*\)|performance\.now\s*\(\s*\)/.test(await readFile(file, 'utf8'))) {
    throw new Error(`Scene must derive motion only from route station; forbidden clock in ${relative(project, file)}`);
  }
}

const scripts = await Promise.all((await filesIn(join(dist, '_astro'))).filter((file) => file.endsWith('.js'))
  .map(async (file) => ({ file, bytes: await readFile(file) })));
const scenes = scripts.filter(({ bytes }) => bytes.includes('WebGLRenderer'));
if (scenes.length !== 1) throw new Error(`Expected exactly one renderer chunk; found ${scenes.length}`);
const sceneBytes = gzipSync(scenes[0].bytes, { level: 9 }).length;
if (sceneBytes > SCENE_BUDGET) throw new Error(`Scene gzip budget exceeded: ${sceneBytes} bytes > ${SCENE_BUDGET}`);
const html = await readFile(join(dist, 'index.html'), 'utf8');
const entries = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map((match) => join(dist, match[1]));
const essentialScripts = await Promise.all(entries.map(async (file) => ({ file, bytes: await readFile(file) })));
const controllers = essentialScripts.filter(({ bytes }) => bytes.includes('exhibition-view'));
if (controllers.length !== 1) throw new Error(`Expected one always-loaded exhibition controller; found ${controllers.length}`);
const controllerBytes = gzipSync(controllers[0].bytes, { level: 9 }).length;
const essentialBytes = essentialScripts.reduce((total, { bytes }) => total + gzipSync(bytes, { level: 9 }).length, 0);
const allScriptBytes = scripts.reduce((total, { bytes }) => total + gzipSync(bytes, { level: 9 }).length, 0);

function webpDimensions(bytes) {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error('Exhibit asset is not WebP');
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const tag = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > bytes.length) throw new Error('Truncated WebP chunk');
    if (tag === 'VP8X' && size >= 10) return [bytes.readUIntLE(start + 4, 3) + 1, bytes.readUIntLE(start + 7, 3) + 1];
    if (tag === 'VP8 ' && size >= 10) return [bytes.readUInt16LE(start + 6) & 0x3fff, bytes.readUInt16LE(start + 8) & 0x3fff];
    if (tag === 'VP8L' && size >= 5) { const bits = bytes.readUInt32LE(start + 1); return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1]; }
    offset = start + size + (size % 2);
  }
  throw new Error('No supported WebP dimension header');
}
const panels = [...html.matchAll(/<figure\b[^>]*data-panel-source[^>]*>\s*<img\b[^>]*src="([^"]+)"/g)];
if (!panels.length) throw new Error('No published exhibit image to measure');
const images = [];
const unique = new Map();
for (const [, url] of panels) {
  if (!url.startsWith('/_astro/') || !url.endsWith('.webp') || url.includes('..')) throw new Error(`Unexpected exhibit asset URL: ${url}`);
  const bytes = await readFile(join(dist, url));
  const [width, height] = webpDimensions(bytes);
  if (Math.max(width, height) > 1600 || bytes.length > SCREENSHOT_BUDGET) throw new Error(`Screenshot budget exceeded: ${bytes.length} bytes, ${width}x${height} (${url})`);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  unique.set(url, { url, sha256, bytes: bytes.length, width, height });
  images.push(`${bytes.length} B / ${width}x${height} / ${url}`);
}
if (unique.size !== panels.length || new Set([...unique.values()].map((image) => image.sha256)).size !== panels.length) {
  throw new Error(`Published preview images must have distinct optimized URLs and hashes: ${unique.size}/${panels.length}`);
}
console.log(`Scene budget: scene gzip ${sceneBytes}/${SCENE_BUDGET} B; controller gzip ${controllerBytes} B; essential scripts gzip ${essentialBytes} B; all JS gzip ${allScriptBytes} B; ${unique.size} unique previews / ${[...unique.values()].reduce((total, image) => total + image.bytes, 0)} B encoded; screenshots ${images.join(', ')} (<=1600px, <=${SCREENSHOT_BUDGET} B each); route-station no-clock source guard passed.`);
