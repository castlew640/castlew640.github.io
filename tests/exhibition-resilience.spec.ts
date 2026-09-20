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
  await page.emulateMedia({ reducedMotion: 'reduce' });
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

test('unavailable webgl keeps the complete catalogue and offers one deliberate retry', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (/webgl/i.test(type)) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The exhibition could not start.', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
  await expect(page.locator(`#${exhibitId}`)).toBeVisible();
  await expect(page.getByText(/recent computer science graduate/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open my resume', exact: true })).toHaveAttribute('href', /\.pdf$/);
  await expect(page.locator('a[href="mailto:castlew640@gmail.com"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try the exhibition again', exact: true })).toHaveCount(1);
  expect(await page.locator('body').innerText()).not.toMatch(/webgl|gpu|driver|chrome|safari|firefox|unsupported device/i);
  const link = page.getByRole('link', { name: 'Read case study →' });
  await link.focus();
  await expect(link).toBeFocused();
  await page.getByRole('button', { name: 'Try the exhibition again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The exhibition could not start.', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try the exhibition again', exact: true })).toHaveCount(0);
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await context.close();
});

test('context loss keeps navigation usable and context restoration never resumes the scene', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
  const canvas = await page.locator('.exhibition-canvas canvas').elementHandle();
  expect(canvas).not.toBeNull();
  await canvas!.evaluate((element) => {
    const gl = (element as HTMLCanvasElement).getContext('webgl2');
    const extension = gl?.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('The test renderer must support context-loss simulation');
    extension.loseContext();
  });
  await expect(page.getByText('The exhibition stopped rendering. Everything is still here to read.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try the exhibition again', exact: true })).toHaveCount(1);
  const link = page.getByRole('link', { name: 'Read case study →' });
  await expect(link).toBeVisible();
  await link.focus();
  await expect(link).toBeFocused();
  await canvas!.evaluate((element) => {
    (element as HTMLCanvasElement).getContext('webgl2')?.getExtension('WEBGL_lose_context')?.restoreContext();
  });
  await page.waitForTimeout(1100);
  await expect(page.locator('html')).not.toHaveAttribute('data-scene', 'active');
  await expect(page.locator('.exhibition-canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Try the exhibition again', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
  await expect(page.locator('.exhibition-canvas')).toHaveCount(1);
  await context.close();
});

test('the moving scene retains native canvas gestures and the fixed camera and light contract', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
  await expect(page.locator('#exhibition')).toHaveCSS('pointer-events', 'none');
  for (const selector of ['.exhibition-canvas', '.exhibition-canvas canvas']) {
    await expect(page.locator(selector)).toHaveCSS('touch-action', 'auto');
    await expect(page.locator(selector)).toHaveCSS('pointer-events', 'auto');
  }
  await expect(page.locator('canvas')).toHaveAttribute('aria-hidden', 'true');
  for (const viewport of [{ width: 1440, height: 810 }, { width: 390, height: 664 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    const expected = Math.max(36, Math.min(68, 2 * Math.atan(Math.tan(32 * Math.PI / 180) / (viewport.width / viewport.height)) * 180 / Math.PI));
    await expect.poll(() => page.evaluate(() => window.__exhibition?.fovY)).toBeCloseTo(expected, 2);
  }
  for (const [id, z] of [['entrance', 0], [exhibitId, -18], ['landing', -46]] as const) {
    await page.locator(`#${id}`).evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'auto' }));
    await expect.poll(() => page.evaluate(() => window.__exhibition?.cameraZ)).toBeCloseTo(z, 1);
    expect(await page.evaluate(() => ({ x: window.__exhibition?.cameraX, y: window.__exhibition?.cameraY, zeroPitch: window.__exhibition?.cameraRotationX === 0 }))).toEqual({ x: 0, y: 1.62, zeroPitch: true });
  }
  expect(await page.evaluate(() => ({ lights: window.__exhibition?.lights, shadowLights: window.__exhibition?.shadowLights }))).toEqual({ lights: 3, shadowLights: 1 });
  await context.close();
});
