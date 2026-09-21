import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

async function sceneChunk(): Promise<string> {
  const root = path.join(process.cwd(), 'dist', '_astro');
  for (const name of await readdir(root)) {
    if (name.endsWith('.js') && (await readFile(path.join(root, name), 'utf8')).includes('CompletedArchitectureWater')) return name;
  }
  throw new Error('Built scene chunk was not found');
}

for (const viewport of [{ width: 390, height: 664 }, { width: 844, height: 390 }, { width: 932, height: 430 }]) {
  test(`fresh phone at ${viewport.width}x${viewport.height} stays complete before deliberate 3D opt-in`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const chunk = await sceneChunk();
    const requests: string[] = [];
    page.on('request', (request) => { if (request.url().includes(chunk)) requests.push(request.url()); });
    await page.goto('/#exhibit-featured-client');
    await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
    await expect(page.locator('[data-view-toggle]')).toHaveText('Enter 3D exhibition');
    await expect(page.getByText('Illustrated still view is on. You can enter the 3D exhibition.')).toBeVisible();
    await expect(page.locator('#exhibit-featured-client .exhibit-link')).toBeVisible();
    expect(requests).toHaveLength(0);
    await page.locator('[data-view-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-view', 'moving');
    await expect(page.locator('[data-view-toggle]')).toHaveText('Use illustrated still view');
    await expect.poll(() => requests.length).toBeGreaterThan(0);
    await context.close();
  });
}

test('explicit moving choice wins on a phone and survives rotation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await context.addInitScript(() => localStorage.setItem('exhibition-view', 'moving'));
  const page = await context.newPage();
  await page.goto('/#exhibit-featured-client');
  await expect(page.locator('html')).toHaveAttribute('data-view', 'moving');
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('html')).toHaveAttribute('data-view', 'moving');
  await expect(page.locator('[data-view-toggle]')).toHaveText('Use illustrated still view');
  await context.close();
});

test('copy, opaque evidence label and contact glass remain usable', async ({ page }) => {
  await page.goto('/#exhibit-featured-client');
  await expect(page).toHaveTitle('William Castle — Software & solutions');
  await expect(page.locator('.wordmark-caption')).toHaveText('Software & solutions.');
  await expect(page.locator('#contact-title')).toHaveText('Talk shop with me.');
  await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();
  await expect(page.locator('.hero-footnote')).not.toContainText('Ideas, considered. Software, delivered.');
  const overlay = page.locator('#exhibit-featured-client .exhibit-overlay');
  const style = await overlay.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { background: computed.backgroundColor, opacity: computed.opacity, blur: computed.backdropFilter, padding: computed.paddingLeft };
  });
  expect(style.background).toMatch(/rgba?\(/);
  expect(style.background).not.toMatch(/, 0\.[0-9]+\)$/);
  expect(style.opacity).toBe('1');
  expect(style.blur).toBe('none');
  expect(Number.parseFloat(style.padding)).toBeGreaterThanOrEqual(24);
  const glass = page.locator('button[data-contact-glass]');
  await expect(glass).toHaveAttribute('aria-label', 'Fill glass');
  const box = await glass.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await glass.focus();
  await page.keyboard.press('Enter');
  await expect(glass).toHaveAttribute('data-filled', 'true');
  await expect(glass).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Space');
  await expect(glass).toHaveAttribute('data-filled', 'false');
});

test('glass stays a static drawing without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('[data-contact-glass] svg')).toBeVisible();
  await expect(page.locator('button[data-contact-glass]')).toHaveCount(0);
  await expect(page.locator('#contact a[href="mailto:castlew640@gmail.com"]')).toBeVisible();
  await context.close();
});
