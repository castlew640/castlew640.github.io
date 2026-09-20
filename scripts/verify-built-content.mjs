import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const requiredFiles = ['index.html', 'projects/featured-client/index.html', 'resume/william-castle-resume.pdf'];
const forbiddenTokens = ['verification-draft', 'Verification Draft', 'sample@example.com', 'example.com'];

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

const files = await filesIn(root);
const names = new Set(files.map((file) => relative(root, file)));
const missing = requiredFiles.filter((file) => !names.has(file));
if (missing.length) throw new Error(`Built artifact is missing required files: ${missing.join(', ')}`);
if (names.has('projects/verification-draft/index.html')) throw new Error('Unpublished verification draft has a route');

const textFiles = files.filter((file) => /\.(html|json|txt|xml|js|css)$/.test(file));
for (const file of textFiles) {
  const text = await readFile(file, 'utf8');
  const token = forbiddenTokens.find((candidate) => text.includes(candidate));
  if (token) throw new Error(`Forbidden built-content token "${token}" found in ${relative(root, file)}`);
  if (/(?:href|src)="\/castlew640\.github\.io\//.test(text)) {
    throw new Error(`Erroneous account-site base prefix found in ${relative(root, file)}`);
  }
}

const html = await readFile(join(root, 'index.html'), 'utf8');
const project = await readFile(join(root, 'projects/featured-client/index.html'), 'utf8');
for (const identifier of ['website', 'manual-planner', 'ai-mvp', 'castlew640@gmail.com']) {
  if (!html.includes(identifier) && !project.includes(identifier)) throw new Error(`Missing required content identifier: ${identifier}`);
}
for (const asset of ['clientScreenshot1', 'clientscreenshot2', 'clientScreenshot3']) {
  if (!files.some((file) => file.includes(asset))) throw new Error(`Missing required evidence asset: ${asset}`);
}
for (const identifier of ['exhibit-featured-client', 'Read case study']) {
  if (!html.includes(identifier)) throw new Error(`Missing required exhibition content: ${identifier}`);
}
if (html.includes('Read the case study')) throw new Error(`Retired case-study link wording found in the home route`);
if (!project.includes('/#exhibit-featured-client')) throw new Error(`Missing exhibit return anchor in the case study`);
console.log(`Built content verified: ${files.length} files, ${requiredFiles.length} required routes/assets present.`);
