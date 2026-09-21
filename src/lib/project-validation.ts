const CONTRACT_IDS = new Set(['website', 'manual-planner', 'ai-mvp']);

type ProjectRecord = {
  id: string;
  slug: string;
  title?: string;
  summary?: string;
  published: boolean;
  exhibitionOrder: number;
  kind?: 'client' | 'personal';
  liveUrl?: string;
  repositoryUrl?: string;
  contracts?: { id: string }[];
  screenshots?: unknown[];
  evidence?: { alt?: string; caption?: string }[];
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
  const publishedOrders = new Set<number>();
  for (const project of records) {
    const kind = project.kind ?? 'client';
    if (project.liveUrl) requireHttpsUrl(project.liveUrl, `Project ${project.slug} live URL`);
    if (project.repositoryUrl) requireHttpsUrl(project.repositoryUrl, `Project ${project.slug} repository URL`);

    if (project.published) {
      if (!Number.isInteger(project.exhibitionOrder) || project.exhibitionOrder < 0) {
        throw new Error(`Published project ${project.slug} requires a nonnegative integer exhibition order`);
      }
      if (publishedSlugs.has(project.slug)) {
        throw new Error(`Duplicate published project slug: ${project.slug}`);
      }
      publishedSlugs.add(project.slug);
      if (publishedOrders.has(project.exhibitionOrder)) {
        throw new Error(`Duplicate published exhibition order: ${project.exhibitionOrder}`);
      }
      publishedOrders.add(project.exhibitionOrder);
      if (!project.title?.trim() || !project.summary?.trim()) {
        throw new Error(`Published project ${project.slug} requires a title and summary`);
      }
      if (kind === 'client') {
        if (!project.liveUrl) {
          throw new Error(`Published client project ${project.slug} requires an HTTPS live URL`);
        }
        if (!project.screenshots?.length) {
          throw new Error(`Published client project ${project.slug} requires approved screenshots`);
        }
      } else if (!project.evidence?.length || project.evidence.some(({ alt, caption }) => !alt?.trim() || !caption?.trim())) {
        throw new Error(`Published personal project ${project.slug} requires at least one described evidence still`);
      }
    }
    if (kind === 'client') {
      const ids = (project.contracts ?? []).map((contract) => contract.id);
      if (ids.length !== CONTRACT_IDS.size || new Set(ids).size !== CONTRACT_IDS.size || ids.some((id) => !CONTRACT_IDS.has(id))) {
        throw new Error(`Client project ${project.slug} must contain exactly one website, manual-planner, and ai-mvp contract`);
      }
    }
  }
}

export { CONTRACT_IDS };
