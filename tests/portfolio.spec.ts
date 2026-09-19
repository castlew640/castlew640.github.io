import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const projectPath = '/projects/featured-client/';

test('home and direct project routes expose descriptive metadata and evidence', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/William Castle/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://castlew640.github.io/');
  await expect(page.getByRole('link', { name: 'Read the case study' })).toBeVisible();
  const projectResponse = await page.goto(projectPath);
  expect(projectResponse?.status()).toBe(200);
  await expect(page).toHaveTitle(/Eiffel Technologies/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://castlew640.github.io/projects/featured-client/');
  await expect(page.getByRole('heading', { name: /Eiffel Technologies/ })).toBeVisible();
  await expect(page.locator('figure')).toHaveCount(3);
  await expect(page.locator('figure img')).toHaveCount(3);
  expect((await page.locator('figure img').evaluateAll((images) => images.map((image) => image.getAttribute('alt') ?? ''))).every(Boolean)).toBe(true);
  await expect(page.locator('figcaption')).toHaveCount(3);
});

test('direct route and navigation work with JavaScript disabled at 320px', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  await page.goto(projectPath);
  await expect(page.getByRole('heading', { name: /Eiffel Technologies/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to projects/ })).toHaveAttribute('href', '/#projects');
  await page.getByRole('link', { name: /Back to projects/ }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.locator('#projects')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await context.close();
});

test('keyboard visitors can tab through links with visible focus and reach destinations', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Resume' }).focus();
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Resume' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/#resume$/);
  await expect(page.getByRole('link', { name: /Open my resume/ })).toHaveAttribute('href', '/resume/william-castle-resume.pdf');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact' }).click();
  await expect(page.getByRole('link', { name: 'castlew640@gmail.com' })).toHaveAttribute('href', 'mailto:castlew640@gmail.com');
});

test('axe reports no violations on home and project pages', async ({ page }) => {
  for (const path of ['/', projectPath]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `${path} accessibility violations`).toEqual([]);
  }
});

test('reduced motion keeps journeys usable and disables nonessential motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'William Castle' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Projects' }).click();
  await expect(page.locator('#projects')).toBeVisible();
  await page.getByRole('link', { name: 'Read the case study' }).click();
  await expect(page.getByRole('heading', { name: /Eiffel Technologies/ })).toBeVisible();
  await page.getByRole('link', { name: /Back to projects/ }).click();
  await expect(page.locator('#projects')).toBeVisible();
  const motion = await page.evaluate(() => ({
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
    animation: getComputedStyle(document.body).animationName,
    transition: getComputedStyle(document.body).transitionDuration,
  }));
  expect(motion).toEqual({ scroll: 'auto', animation: 'none', transition: '0s' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await context.close();
});
