import { getCollection } from 'astro:content';
import { validateProjectRecords } from './project-validation';

export async function getPublishedProjects() {
  const entries = await getCollection('projects');
  validateProjectRecords(entries.map(({ id, data }) => ({ id, ...data })));
  return entries
    .filter(({ data }) => data.published)
    .sort((a, b) => a.data.exhibitionOrder - b.data.exhibitionOrder);
}
