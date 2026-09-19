const CONTRACT_IDS = new Set(['website', 'manual-planner', 'ai-mvp']);

type ProjectRecord = {
  id: string;
  slug: string;
  title?: string;
  summary?: string;
  published: boolean;
  liveUrl?: string;
  contracts: { id: string }[];
  screenshots: unknown[];
};

function requireHttpsUrl(value: string, label: string): void {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname) throw new Error();
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL`);
  }
}

export function validateProjectRecords(records: ProjectRecord[]): void {
  const publishedSlugs = new Set<string>();
  for (const project of records) {
    if (project.published) {
      if (publishedSlugs.has(project.slug)) {
        throw new Error(`Duplicate published project slug: ${project.slug}`);
      }
      publishedSlugs.add(project.slug);
      if (!project.title?.trim() || !project.summary?.trim()) {
        throw new Error(`Published project ${project.slug} requires a title and summary`);
      }
      if (!project.liveUrl) {
        throw new Error(`Published project ${project.slug} requires an HTTPS live URL`);
      }
      requireHttpsUrl(project.liveUrl, `Published project ${project.slug} live URL`);
      if (project.screenshots.length < 1) {
        throw new Error(`Published project ${project.slug} requires approved screenshots`);
      }
    }
    const ids = project.contracts.map((contract) => contract.id);
    if (ids.length !== CONTRACT_IDS.size || new Set(ids).size !== CONTRACT_IDS.size || ids.some((id) => !CONTRACT_IDS.has(id))) {
      throw new Error(`Project ${project.slug} must contain exactly one website, manual-planner, and ai-mvp contract`);
    }
  }
}

export { CONTRACT_IDS };
