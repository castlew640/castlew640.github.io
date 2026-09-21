import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

export const FIXTURE_SENTINEL = 'GROWTH_FIXTURE_DO_NOT_PUBLISH';
export const DRAFT_SENTINEL = 'GROWTH_DRAFT_DO_NOT_PUBLISH';
export const MEDIA_FIXTURE_SHA256 = 'e2fe113d480b69b53fbefebfe3709dd8069fd2a3778485f63f3f173593c51705';
// Self-authored by create-media-fixture.mjs: Chromium canvas MediaRecorder,
// 256x144 moving rust circle on paper, ~1 second, silent H.264/MP4 (avc1.42E01E).
// The checked-in 2,430-byte file is decoded in Chromium before fixture builds.

const personalEntry = (number, exhibitionOrder, media = false) => {
  const id = String(number).padStart(2, '0');
  return `---
kind: personal
format: showcase
slug: fixture-personal-${id}
title: Fixture Personal Project ${id}
summary: ${FIXTURE_SENTINEL} repository-only project ${id} proves content-driven publication.
published: true
exhibitionOrder: ${exhibitionOrder}
repositoryUrl: https://github.com/castlew640/fixture-personal-${id}
${media ? `video:
  src: /media/fixture-personal-${id}/silent-demo.mp4
  poster: ./poster.png
  description: A rust circle crosses a plain paper background.
  hasAudio: true
  captions:
    src: /media/fixture-personal-${id}/silent-demo.vtt
    language: en
    label: English
` : ''}evidence:
${media ? `  - src: ./terminal.png
    alt: Wide terminal capture with visible first and fourth corners
    caption: Complete terminal output.
    kind: terminal
    fit: cover
  - src: ./diagram.png
    alt: Portrait diagram with visible first and fourth corners
    caption: Complete portrait diagram.
    kind: diagram
    fit: cover
  - src: ./poster.png
    alt: Ordinary screenshot preview
    caption: Still preview, not a gallery video.
    kind: screenshot
    fit: cover
` : `  - src: ./evidence-${id}.jpg
    alt: Fixture evidence for personal project ${id}
    caption: ${FIXTURE_SENTINEL} approved-image copy used only inside an isolated build.
    kind: screenshot
    fit: contain
`}
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

async function renderMediaStills(entryRoot) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const [name, width, height] of [['terminal.png', 1200, 240], ['diagram.png', 240, 960], ['poster.png', 800, 400]]) {
      const base64 = await page.evaluate(([file, w, h]) => {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = file === 'terminal.png' ? '#292e29' : '#f4f0e6';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8e4935';
        ctx.fillRect(0, 0, 28, 28);
        ctx.fillRect(w - 28, h - 28, 28, 28);
        ctx.fillStyle = file === 'terminal.png' ? '#f4f0e6' : '#292e29';
        ctx.font = '22px monospace';
        ctx.fillText(file, 40, Math.min(h - 40, 80));
        return canvas.toDataURL('image/png').split(',')[1];
      }, [name, width, height]);
      await writeFile(join(entryRoot, name), Buffer.from(base64, 'base64'));
    }
  } finally { await browser.close(); }
}

async function addPersonal(projectsRoot, sourceImage, number, exhibitionOrder = number, media = false) {
  const id = String(number).padStart(2, '0');
  const entryRoot = join(projectsRoot, `fixture-personal-${id}`);
  await mkdir(entryRoot, { recursive: true });
  const [width, height] = number % 3 === 0 ? [720, 1080] : number % 3 === 1 ? [1200, 675] : [1000, 800];
  const overlay = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="58" fill="#292e29"/><text x="24" y="38" fill="#f4f0e6" font-family="monospace" font-size="27">FIXTURE ${id} · EVIDENCE STUDY</text><rect x="${width - 52}" y="${height - 52}" width="36" height="36" fill="#8e4935"/></svg>`);
  await sharp(sourceImage).resize(width, height, { fit: 'contain', background: '#f4f0e6' })
    .composite([{ input: overlay }]).jpeg({ quality: 79 }).toFile(join(entryRoot, `evidence-${id}.jpg`));
  if (media) await renderMediaStills(entryRoot);
  await writeFile(join(entryRoot, 'index.md'), personalEntry(number, exhibitionOrder, media));
}

export async function applyGrowthFixtures(root, { count, personalOnly = false, media = false }) {
  const projectsRoot = join(root, 'src/content/projects');
  const sourceImage = join(root, 'tests/fixtures/projects/approved-evidence.jpg');
  await clearProjects(projectsRoot);

  if (personalOnly) {
    await addPersonal(projectsRoot, sourceImage, 1, 1, media);
  } else if (count > 0) {
    const sourceClient = join(root, 'tests/fixtures/projects/featured-client');
    await cp(sourceClient, join(projectsRoot, 'featured-client'), { recursive: true });
    for (let number = 1; number < count; number += 1) {
      await addPersonal(projectsRoot, sourceImage, number, number + 1, media && number === 1);
    }
  }

  await writeFile(join(projectsRoot, 'zz-fixture-growth-draft.md'), draftEntry);
  await cp(sourceImage, join(projectsRoot, 'fixture-draft.jpg'));
  if (media) {
    const slugRoot = join(root, 'public/media/fixture-personal-01');
    await mkdir(slugRoot, { recursive: true });
    const fixture = join(root, 'tests/fixtures/projects/silent-demo.mp4');
    const bytes = await readFile(fixture);
    if (createHash('sha256').update(bytes).digest('hex') !== MEDIA_FIXTURE_SHA256) throw new Error('Media fixture hash changed');
    await cp(fixture, join(slugRoot, 'silent-demo.mp4'));
    await writeFile(join(slugRoot, 'silent-demo.vtt'), 'WEBVTT\n\n00:00:00.000 --> 00:00:01.200\nNo speech or music. A circle moves across a plain background.\n');
  }
}
