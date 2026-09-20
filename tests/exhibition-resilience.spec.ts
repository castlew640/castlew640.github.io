import { expect, test, type Page } from '@playwright/test';

const exhibitId = 'exhibit-featured-client';
const exhibitPath = `/#${exhibitId}`;
const projectPath = '/projects/featured-client/';
const notice = 'Still view is on because your device requests reduced motion.';

async function settleLayout(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function nearestStop(page: Page): Promise<string | undefined> {
  return page.locator('#exhibition [data-stop]').evaluateAll((stops) => stops
    .sort((a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top))[0]?.id);
}

test('reduced motion shows still view and never requests scene code during travel', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const sceneRequests: string[] = [];
  page.on('request', (request) => { if (/scene|three/i.test(request.url())) sceneRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Still view' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(notice, { exact: true })).toBeVisible();
  await page.locator('#landing').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  expect(sceneRequests).toEqual([]);
  await context.close();
});

test('the view choice preserves the current exhibit and survives reload', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(exhibitPath);
  await settleLayout(page);
  const before = await nearestStop(page);
  expect(before).toBe(exhibitId);
  const toggle = page.getByRole('button', { name: 'Still view' });
  await toggle.click();
  await settleLayout(page);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText(notice, { exact: true })).toBeHidden();
  expect(await nearestStop(page)).toBe(before);
  expect(await page.evaluate(() => localStorage.getItem('exhibition-view'))).toBe('moving');
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(notice, { exact: true })).toBeHidden();
  await context.close();
});

for (const blockedAccess of ['writes', 'all']) {
  test(`blocked storage ${blockedAccess} still permit an explicit view choice for the session`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.addInitScript((access) => {
      Storage.prototype.setItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
      if (access === 'all') Storage.prototype.getItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
    }, blockedAccess);
    const page = await context.newPage();
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Still view' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('html')).toHaveAttribute('data-view', 'moving');
    await expect(page.getByText(notice, { exact: true })).toBeHidden();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
    await context.close();
  });
}

test('invalid stored choices cannot override the device motion preference', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => localStorage.setItem('exhibition-view', '__proto__'));
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Still view' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(notice, { exact: true })).toBeVisible();
  await context.close();
});

test('changing the device preference switches to still view without an explicit override', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(exhibitPath);
  const toggle = page.getByRole('button', { name: 'Still view' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(notice, { exact: true })).toBeVisible();
  await context.close();
});

test('without javascript the catalogue has no dead controls and all direct navigation works', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.view-toggle, .exhibition-controls')).toHaveCount(0);
  for (const name of ['Projects', 'About', 'Resume', 'Contact']) {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await page.getByRole('link', { name: 'Read case study →' }).click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await page.getByRole('link', { name: /Back to the exhibition/ }).click();
  await expect(page).toHaveURL(new RegExp(`#${exhibitId}$`));
  await context.close();
});

test('native gestures and zoom remain available with a reachable toggle at phone and desktop sizes', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Still view' });
    const box = await toggle.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await toggle.focus();
    await expect(toggle).toHaveCSS('outline-style', 'solid');
    const native = await page.locator('#exhibition').evaluate((el) => ({
      touch: getComputedStyle(el).touchAction,
      overscroll: getComputedStyle(el).overscrollBehavior,
      pointer: getComputedStyle(el).pointerEvents,
      viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
      restoration: history.scrollRestoration,
    }));
    expect(native).toEqual({ touch: 'auto', overscroll: 'auto', pointer: 'auto', viewport: 'width=device-width, initial-scale=1', restoration: 'auto' });
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL(/#contact$/);
  }
});

test('hash arrivals focus the exhibit while reload and browser back preserve browser restoration', async ({ page }) => {
  await page.addInitScript(() => {
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (options) {
      document.documentElement.dataset.focusCalls = String(Number(document.documentElement.dataset.focusCalls ?? 0) + 1);
      focus.call(this, options);
    };
  });
  await page.goto(exhibitPath);
  await expect(page.locator(`#${exhibitId}`)).toBeFocused();
  await page.reload();
  await settleLayout(page);
  expect(await page.evaluate(() => document.documentElement.dataset.focusCalls ?? '0')).toBe('0');
  const link = page.getByRole('link', { name: 'Read case study →' });
  await link.scrollIntoViewIfNeeded();
  await settleLayout(page);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await page.goBack();
  await settleLayout(page);
  expect(Math.abs(await page.evaluate(() => window.scrollY) - scrollBefore)).toBeLessThanOrEqual(2);
  expect(await page.evaluate(() => document.documentElement.dataset.focusCalls ?? '0')).toBe('0');
});

test('resizing and text reflow preserve position within the measured exhibit segment', async ({ page }) => {
  await page.goto('/');
  await settleLayout(page);
  await page.evaluate((id) => {
    const start = document.getElementById(id)!.getBoundingClientRect().top + scrollY;
    const end = document.getElementById('about')!.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: start + (end - start) * 0.25, behavior: 'auto' });
  }, exhibitId);
  await settleLayout(page);
  const fraction = () => page.evaluate((id) => {
    const start = document.getElementById(id)!.getBoundingClientRect().top;
    const end = document.getElementById('about')!.getBoundingClientRect().top;
    return -start / (end - start);
  }, exhibitId);
  await page.setViewportSize({ width: 390, height: 700 });
  await expect.poll(fraction).toBeCloseTo(0.25, 2);
  await page.addStyleTag({ content: '.exhibit-list [data-stop] { min-height: 1400px; }' });
  await expect.poll(fraction).toBeCloseTo(0.25, 2);
});
