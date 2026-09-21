import { getCollection } from 'astro:content';
import { validateProjectRecords } from './project-validation';
import { validatePublicMedia } from './project-media';
// @ts-expect-error Node declarations are intentionally not a production dependency.
import { resolve } from 'node:path';

declare const process: { cwd(): string };

export async function getPublishedProjects() {
  const entries = await getCollection('projects');
  validateProjectRecords(entries.map(({ id, data }) => ({ id, ...data })));
  await validatePublicMedia(entries, resolve(process.cwd(), 'public'));
  return entries
    .filter(({ data }) => data.published)
    .sort((a, b) => a.data.exhibitionOrder - b.data.exhibitionOrder);
}
