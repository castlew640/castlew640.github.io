import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const FIXTURE_SENTINEL = 'GROWTH_FIXTURE_DO_NOT_PUBLISH';
export const DRAFT_SENTINEL = 'GROWTH_DRAFT_DO_NOT_PUBLISH';

const personalEntry = (number) => {
  const id = String(number).padStart(2, '0');
  return `---
kind: personal
format: showcase
slug: fixture-personal-${id}
title: Fixture Personal Project ${id}
summary: ${FIXTURE_SENTINEL} repository-only project ${id} proves content-driven publication.
published: true
exhibitionOrder: ${number}
repositoryUrl: https://github.com/castlew640/fixture-personal-${id}
evidence:
  - src: ./evidence.jpg
    alt: Fixture evidence for personal project ${id}
    caption: ${FIXTURE_SENTINEL} approved-image copy used only inside an isolated build.
    kind: screenshot
    fit: contain
---

## What it does

This unmistakably artificial entry exercises the personal-project publishing path.
`;
};

const draftEntry = `---
kind: personal
format: case-study
slug: fixture-growth-draft
title: Fixture Growth Draft
summary: ${DRAFT_SENTINEL}
published: false
exhibitionOrder: 999
repositoryUrl: https://github.com/castlew640/fixture-growth-draft
evidence: []
liveUrl: https://example.invalid/fixture-growth-draft
contracts:
  - id: website
    title: Fixture website
    description: ${DRAFT_SENTINEL}
    hosting: Fixture host
    stack: [Fixture]
  - id: manual-planner
    title: Fixture planner
    description: ${DRAFT_SENTINEL}
    hosting: Fixture host
    stack: [Fixture]
  - id: ai-mvp
    title: Fixture AI MVP
    description: ${DRAFT_SENTINEL}
    hosting: Fixture host
    stack: [Fixture]
screenshots:
  - src: ./fixture-draft.jpg
    alt: Fixture draft evidence
    caption: ${DRAFT_SENTINEL}
---

${DRAFT_SENTINEL}
`;

async function clearProjects(projectsRoot) {
  for (const entry of await readdir(projectsRoot)) {
    await rm(join(projectsRoot, entry), { recursive: true, force: true });
  }
}

async function addPersonal(projectsRoot, sourceImage, number) {
  const id = String(number).padStart(2, '0');
  const entryRoot = join(projectsRoot, `fixture-personal-${id}`);
  await mkdir(entryRoot, { recursive: true });
  await cp(sourceImage, join(entryRoot, 'evidence.jpg'));
  await writeFile(join(entryRoot, 'index.md'), personalEntry(number));
}

export async function applyGrowthFixtures(root, { count, personalOnly = false }) {
  const projectsRoot = join(root, 'src/content/projects');
  const sourceImage = join(root, 'tests/fixtures/projects/approved-evidence.jpg');
  await clearProjects(projectsRoot);

  if (personalOnly) {
    await addPersonal(projectsRoot, sourceImage, 1);
  } else if (count > 0) {
    const sourceClient = join(root, 'tests/fixtures/projects/featured-client');
    await cp(sourceClient, join(projectsRoot, 'featured-client'), { recursive: true });
    for (let number = 1; number < count; number += 1) {
      await addPersonal(projectsRoot, sourceImage, number);
    }
  }

  await writeFile(join(projectsRoot, 'zz-fixture-growth-draft.md'), draftEntry);
  await cp(sourceImage, join(projectsRoot, 'fixture-draft.jpg'));
}
