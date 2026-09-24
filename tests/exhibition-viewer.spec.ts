import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const exhibitPath = '/#exhibit-featured-client';

// The viewer is the same in both views; the illustrated view keeps these checks fast.
test.use({ reducedMotion: 'reduce' });

test('the viewer shows every screenshot in place with the three contracts and the case study', async ({ page }) => {
  await page.goto(exhibitPath);
  const button = page.locator('#exhibit-featured-client').getByRole('button', { name: /View exhibit/ });
  const before = await page.evaluate(() => history.length);
  await button.click();
  const viewer = page.getByRole('dialog', { name: /Eiffel Technologies/ });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByRole('button', { name: 'Close the exhibit' })).toBeFocused();
  expect(await page.evaluate(() => history.length)).toBe(before + 1);
  const slides = viewer.locator('[data-viewer-slide]');
  await expect(slides).toHaveCount(3);
  for (const slide of await slides.all()) {
    await expect(slide.locator('img')).toHaveAttribute('alt', /\S/);
    await expect(slide.locator('figcaption')).toHaveText(/\S/);
  }
  const count = viewer.locator('[data-viewer-count]');
  await expect(count).toHaveText('1 / 3');
  await viewer.getByRole('button', { name: 'Next screenshot' }).click();
  await expect(count).toHaveText('2 / 3');
  await page.keyboard.press('ArrowRight');
  await expect(count).toHaveText('3 / 3');
  // The end is marked without disabling the focused button, so arrow keys keep working.
  await expect(viewer.getByRole('button', { name: 'Next screenshot' })).toHaveAttribute('aria-disabled', 'true');
  await expect(viewer.getByRole('button', { name: 'Next screenshot' })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(count).toHaveText('2 / 3');
  await expect(slides.nth(1).locator('img')).toHaveJSProperty('complete', true);
  expect(await slides.nth(1).locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(viewer.locator('.viewer-contracts h3')).toHaveText(['Initial website', 'Manual Wi-Fi planner', 'AI planner MVP']);
  await expect(viewer.getByRole('link', { name: /Read the full case study/ })).toHaveAttribute('href', '/projects/featured-client/');
  await expect(viewer.getByRole('link', { name: /Visit Eiffel Technologies/ })).toHaveAttribute('href', 'https://eiffeltechnology.com');
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await expect(button).toBeFocused();
  expect(await page.evaluate(() => (history.state as { exhibitViewer?: string } | null)?.exhibitViewer)).toBeUndefined();
  await expect(page).toHaveURL(new RegExp(`${exhibitPath}$`));
});

test('browser Back closes the viewer and Forward reopens it', async ({ page }) => {
  await page.goto(exhibitPath);
  await page.locator('#exhibit-featured-client').getByRole('button', { name: /View exhibit/ }).click();
  const viewer = page.getByRole('dialog', { name: /Eiffel Technologies/ });
  await expect(viewer).toBeVisible();
  await page.goBack();
  await expect(viewer).toBeHidden();
  await expect(page).toHaveURL(new RegExp(`${exhibitPath}$`));
  await page.goForward();
  await expect(viewer).toBeVisible();
  await viewer.getByRole('button', { name: 'Close the exhibit' }).click();
  await expect(viewer).toBeHidden();
});

test('the backdrop closes the viewer and the screenshot itself opens it', async ({ page }) => {
  await page.goto(exhibitPath);
  await page.locator('#exhibit-featured-client figure[data-panel-source] img').click();
  const viewer = page.getByRole('dialog', { name: /Eiffel Technologies/ });
  await expect(viewer).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(viewer).toBeHidden();
  await expect(page.locator('#exhibit-featured-client .view-exhibit')).toBeFocused();
});

test('returning from the case study restores the viewer and closing it stays on the exhibition', async ({ page }) => {
  await page.goto(exhibitPath);
  await page.locator('#exhibit-featured-client').getByRole('button', { name: /View exhibit/ }).click();
  const viewer = page.getByRole('dialog', { name: /Eiffel Technologies/ });
  await viewer.getByRole('link', { name: /Read the full case study/ }).click();
  await expect(page).toHaveURL(/\/projects\/featured-client\/$/);
  await page.goBack();
  await expect(viewer).toBeVisible();
  const entries = await page.evaluate(() => history.length);
  await viewer.getByRole('button', { name: 'Close the exhibit' }).click();
  await expect(viewer).toBeHidden();
  await expect(page).toHaveURL(new RegExp(`${exhibitPath}$`));
  expect(await page.evaluate(() => history.length)).toBe(entries);
  await expect(page.locator('#exhibit-featured-client')).toBeVisible();
});

test('the open viewer has no accessibility violations', async ({ page }) => {
  await page.goto(exhibitPath);
  await page.locator('#exhibit-featured-client').getByRole('button', { name: /View exhibit/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const results = await new AxeBuilder({ page }).include('dialog[open]').analyze();
  expect(results.violations).toEqual([]);
});

test('on a phone the viewer fills the screen with a thumb-reach way back and swipeable screenshots', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(exhibitPath);
  await page.locator('#exhibit-featured-client').getByRole('button', { name: /View exhibit/ }).tap();
  const viewer = page.getByRole('dialog', { name: /Eiffel Technologies/ });
  await expect(viewer).toBeVisible();
  const box = (await viewer.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(389);
  expect(box.height).toBeGreaterThanOrEqual(663);
  const back = viewer.getByRole('button', { name: 'Back to the exhibition' });
  await expect(back).toBeInViewport();
  expect((await back.boundingBox())!.y).toBeGreaterThanOrEqual(664 * 0.7);
  // A horizontal swipe is ordinary native scrolling in the snap track.
  await viewer.locator('[data-viewer-track]').evaluate((track) => track.scrollTo({ left: track.clientWidth, behavior: 'auto' }));
  await expect(viewer.locator('[data-viewer-count]')).toHaveText('2 / 3');
  await back.tap();
  await expect(viewer).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await context.close();
});

test('without JavaScript the viewer stays out of the way and every exhibit keeps its case-study link', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /View exhibit/ })).toHaveCount(0);
  await expect(page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' })).toHaveAttribute('href', '/projects/featured-client/');
  await context.close();
});
