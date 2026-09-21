import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 390, height: 664 }, { width: 844, height: 390 }, { width: 932, height: 430 }]) {
  test(`fresh phone at ${viewport.width}x${viewport.height} stays complete before deliberate 3D opt-in`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (request) => { if (request.resourceType() === 'script') requests.push(request.url()); });
    await page.goto('/#exhibit-featured-client');
    await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
    await expect(page.locator('[data-view-toggle]')).toHaveText('Enter 3D exhibition');
    await expect(page.getByText('Illustrated still view is on. You can enter the 3D exhibition.')).toBeVisible();
    await expect(page.locator('#exhibit-featured-client .exhibit-link')).toBeVisible();
    const initialScripts = [...requests];
    expect(initialScripts.every((url) => url.includes('/_astro/'))).toBe(true);
    await page.locator('[data-view-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-view', 'moving');
    await expect(page.locator('[data-view-toggle]')).toHaveText('Use illustrated still view');
    await expect.poll(() => page.evaluate(() => Number(window.__exhibition?.renderCount ?? 0))).toBeGreaterThan(0);
    expect(requests.filter((url) => !initialScripts.includes(url)).length).toBeGreaterThan(0);
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

for (const storage of ['invalid', 'blocked']) {
  test(`phone default remains still with ${storage} preference storage`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
    await context.addInitScript((mode) => {
      if (mode === 'invalid') localStorage.setItem('exhibition-view', 'surprise');
      else {
        Storage.prototype.getItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
        Storage.prototype.setItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
      }
    }, storage);
    const page = await context.newPage();
    await page.goto('/#exhibit-featured-client');
    await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
    await page.locator('[data-view-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-view', 'moving');
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.locator('html')).toHaveAttribute('data-view', 'moving');
    await context.close();
  });
}

test('copy, opaque evidence label and contact glass remain usable', async ({ page }) => {
  await page.goto('/#exhibit-featured-client');
  await expect(page).toHaveTitle('William Castle — Software & solutions');
  await expect(page.locator('.wordmark-caption')).toHaveText('Software & solutions.');
  await expect(page.locator('#contact-title')).toHaveText('Talk shop with me.');
  await expect(page.locator('#about .section-body')).toContainText('existing tool makes more sense');
  await expect(page.locator('#about .section-body')).toContainText('three client contracts');
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

test('glass fill is immediate under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contact');
  const glass = page.locator('button[data-contact-glass]');
  await glass.click();
  await expect(glass).toHaveAttribute('data-filled', 'true');
  await expect(glass.locator('.contact-glass-fill')).toHaveCSS('transition-duration', '0s');
  await expect(glass.locator('.contact-glass-fill')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
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
