import { expect, test } from '@playwright/test';

test('the real portfolio exhibit follows the client and opens its canonical case study', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#exhibition [data-slug]')).toHaveCount(2);
  await expect(page.locator('#exhibition [data-slug]').first()).toHaveAttribute('data-slug', 'featured-client');
  const portfolio = page.locator('#exhibit-portfolio');
  await expect(portfolio).toHaveAttribute('data-slug', 'portfolio');
  await expect(portfolio.getByRole('heading', { name: 'Surreal Portfolio' })).toBeVisible();
  await expect(portfolio.locator('.exhibit-link')).toHaveAttribute('href', '/projects/portfolio/');
  // In the 3D exhibition only the current stop's placard takes pointer input: walk there first.
  const forward = page.getByRole('button', { name: 'Next exhibit' });
  await forward.click();
  await expect(page.locator('#exhibit-featured-client')).toHaveAttribute('data-current', '');
  await forward.click();
  await expect(portfolio).toHaveAttribute('data-current', '');
  await portfolio.locator('.exhibit-link').click();
  await expect(page).toHaveURL(/\/projects\/portfolio\/$/);
  await expect(page).toHaveTitle('Surreal Portfolio — William Castle');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://castlew640.github.io/projects/portfolio/');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Surreal Portfolio' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View repository' })).toHaveAttribute('href', 'https://github.com/castlew640/castlew640.github.io');
  await expect(page.locator('.evidence figure')).toHaveCount(3);
  for (const figure of await page.locator('.evidence figure').all()) {
    await expect(figure.locator('img')).toHaveAttribute('alt', /.+/);
    await expect(figure.locator('figcaption')).not.toBeEmpty();
    await expect(figure.locator('img')).toHaveAttribute('src', /\/_astro\/.+\.webp$/);
  }
  const story = await page.locator('.project-content').innerText();
  for (const detail of ['one hand', 'ordinary HTML', 'still', 'motion', 'graphics', 'Astro', 'Three.js']) {
    expect(story.toLowerCase()).toContain(detail.toLowerCase());
  }
  expect(story).not.toMatch(/\b(?:60\s*fps|measured on iPhone|rollback tested)\b/i);
  await page.getByRole('link', { name: /Back to the exhibition/ }).click();
  await expect(page).toHaveURL(/\/#exhibit-portfolio$/);
  await expect(portfolio).toBeFocused();
});

test('portfolio story, figures and return remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  await page.goto('/projects/portfolio/');
  await expect(page.getByRole('heading', { level: 1, name: 'Surreal Portfolio' })).toBeVisible();
  await expect(page.locator('.project-content')).toContainText('ordinary HTML');
  await expect(page.locator('.evidence figure')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'View repository' })).toBeVisible();
  await page.getByRole('link', { name: /Back to the exhibition/ }).click();
  await expect(page).toHaveURL(/\/#exhibit-portfolio$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await context.close();
});
