import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const allowedPrefix = 'src/scripts/exhibition/scene/';
const scannedExtensions = /\.(ts|astro)$/;
const importPatterns = [
  /import\s+[^;]*?\bfrom\s+['"](three(?:\/[^'"]*)?)['"]/,
  /import\s*\(\s*['"](three(?:\/[^'"]*)?)['"]/,
];

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

const allFiles = await filesIn(root);
const candidateFiles = allFiles.filter((file) => scannedExtensions.test(file));

let scanned = 0;
for (const file of candidateFiles) {
  const relativePath = `src/${relative(root, file).split('\\').join('/')}`;
  scanned++;
  if (relativePath.startsWith(allowedPrefix)) continue;

  const text = await readFile(file, 'utf8');
  for (const pattern of importPatterns) {
    if (pattern.test(text)) {
      throw new Error(`three is imported outside the scene boundary in ${relativePath} — only files under ${allowedPrefix} may import three`);
    }
  }
}

console.log(`Scene boundary verified: ${scanned} files scanned outside ${allowedPrefix}, no "three" import found.`);
