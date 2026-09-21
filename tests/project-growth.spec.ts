import { expect, test } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const count = Number.parseInt(process.env.GROWTH_FIXTURE_COUNT ?? '10', 10);
const personalOnly = process.env.GROWTH_FIXTURE_SCENARIO === 'personal-only';
const hasPersonal = personalOnly || count > 1;

test('content alone publishes canonical pages, catalogue exhibits, and stable returns', async ({ page }) => {
  const home = await page.goto('/');
  expect(home?.status()).toBe(200);

  if (!personalOnly && count > 0) {
    await expect(page.locator('[data-slug]').first()).toHaveAttribute('data-slug', 'featured-client');
    await page.goto('/projects/featured-client/');
    await expect(page.locator('.evidence-grid figure')).toHaveCount(3);
    for (const contract of ['website', 'manual-planner', 'ai-mvp']) {
      await expect(page.locator(`#contract-${contract}`)).toHaveCount(1);
    }
    await page.goto('/');
  }

  if (!hasPersonal) {
    await expect(page.locator('[data-slug^="fixture-personal-"]')).toHaveCount(0);
    return;
  }

  const slug = 'fixture-personal-01';
  const title = 'Fixture Personal Project 01';
  const exhibit = page.locator(`[data-slug="${slug}"]`);
  await expect(exhibit).toContainText(title);
  await expect(exhibit).toContainText('repository-only project 01');
  await expect(exhibit.getByRole('link', { name: 'Read case study →' })).toHaveAttribute('href', `/projects/${slug}/`);

  const project = await page.goto(`/projects/${slug}/`);
  expect(project?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  await expect(page.getByText('repository-only project 01')).toBeVisible();
  await expect(page.getByRole('link', { name: /View repository/i })).toHaveAttribute('href', `https://github.com/castlew640/${slug}`);
  await expect(page.getByRole('link', { name: /Visit .*demo/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Three contracts' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Back to the exhibition/ })).toHaveAttribute('href', `/#exhibit-${slug}`);
});

test('draft content and fixture-only draft links never serialize', async ({ page, request }) => {
  const response = await request.get('/projects/fixture-growth-draft/');
  expect(response.status()).toBe(404);
  await page.goto('/');
  await expect(page.getByText('GROWTH_DRAFT_DO_NOT_PUBLISH')).toHaveCount(0);
  expect(await page.content()).not.toContain('fixture-growth-draft');
});
