import { expect, test, type Page } from '@playwright/test';
import { createQualityPolicy, qualityFor } from '../src/scripts/exhibition/scene/quality';

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
  const lostContext = await canvas!.evaluateHandle((element) => {
    const gl = (element as HTMLCanvasElement).getContext('webgl2');
    const extension = gl?.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('The test renderer must support context-loss simulation');
    extension.loseContext();
    return {
      restore: () => new Promise<void>((resolve) => {
        element.addEventListener('webglcontextrestored', () => resolve(), { once: true });
        extension.restoreContext();
      }),
    };
  });
  await expect(page.getByText('The exhibition stopped rendering. Everything is still here to read.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try the exhibition again', exact: true })).toHaveCount(1);
  const link = page.getByRole('link', { name: 'Read case study →' });
  await expect(link).toBeVisible();
  await link.focus();
  await expect(link).toBeFocused();
  await lostContext.evaluate((context) => context.restore());
  await lostContext.dispose();
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

test('scene resources and css-pixel ink stay bounded across three deliberate remounts', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference', deviceScaleFactor: 2, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  const counts = () => page.evaluate(() => ({ materials: window.__exhibition?.materials, geometries: window.__exhibition?.geometries, textures: window.__exhibition?.textures }));
  await expect.poll(() => page.evaluate(() => window.__exhibition?.renderCount ?? 0)).toBeGreaterThan(0);
  const first = await counts();
  expect(first.materials).toBeLessThanOrEqual(18);
  expect(first.materials).toBeGreaterThanOrEqual(8 + Number(await page.evaluate(() => window.__exhibition?.pickablePanels)));
  expect(await page.evaluate(() => window.__exhibition?.lineSegments)).toBeLessThanOrEqual(1200);
  expect(await page.evaluate(() => window.__exhibition?.walkwayObstructions)).toBe(0);
  expect(await page.evaluate(() => window.__exhibition?.pixelRatio)).toBe(1.75);
  expect(await page.evaluate(() => Object.values(window.__exhibition!).every((value) => typeof value === 'number' || typeof value === 'boolean'))).toBe(true);
  expect(await page.evaluate(() => Array.from({ length: 6 }, (_, i) => window.__exhibition![`ink${i}Width`]))).toEqual([1.4, 1.3, 1, 1, 1, 1.4]);
  expect(await page.evaluate(() => Array.from({ length: 6 }, (_, i) => window.__exhibition![`ink${i}Color`]))).toEqual([0x4e5144, 0x8b877b, 0xb9b3a4, 0xb9b3a4, 0x656256, 0x8e4935]);
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Still view', exact: true }).click();
    await expect(page.locator('.exhibition-canvas')).toHaveCount(0);
    expect(await page.evaluate(() => window.__exhibition?.mounted)).toBe(false);
    expect(await page.evaluate(() => window.__exhibition?.geometries)).toBe(0);
    await page.getByRole('button', { name: 'Still view', exact: true }).click();
    await expect.poll(counts).toEqual(first);
    await expect(page.locator('.exhibition-canvas canvas')).toHaveCount(1);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(() => page.evaluate(() => window.__exhibition?.cssWidth)).toBe(844);
  expect(await page.evaluate(() => window.__exhibition?.inkScreenSpace && window.__exhibition?.inkCssResolution)).toBe(true);
  await context.close();
});

test('the scene idles and independently suspends for hidden tabs and offscreen exhibition', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto('/');
  const count = () => page.evaluate(() => Number(window.__exhibition?.renderCount ?? 0));
  await expect.poll(count).toBeGreaterThan(0);
  await page.waitForTimeout(1100);
  const idle = await count();
  await page.waitForTimeout(1100);
  expect(await count()).toBe(idle);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    scrollBy(0, 200);
  });
  await page.waitForTimeout(200);
  expect(await count()).toBe(idle);
  expect(await page.evaluate(() => window.__exhibition?.suspended)).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(count).toBe(idle + 1);
  // A tall footer puts the scrolling exhibition completely outside the viewport.
  await page.addStyleTag({ content: '.site-footer { min-height: 200vh; }' });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.__exhibition?.suspended)).toBe(true);
  const offscreen = await count();
  await page.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    scrollBy(0, -10);
  });
  await page.waitForTimeout(200);
  expect(await count()).toBe(offscreen);
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(count).toBe(offscreen + 1);
  await context.close();
});

test('actual emitted renderer chunks never download for reduced motion or project routes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const downloaded: Promise<string>[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.js')) downloaded.push(response.text());
  });
  await page.goto('/');
  await page.locator('#landing').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect((await Promise.all(downloaded)).some((source) => source.includes('WebGLRenderer'))).toBe(false);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
  expect((await Promise.all(downloaded)).some((source) => source.includes('WebGLRenderer'))).toBe(true);
  downloaded.length = 0;
  await page.goto(projectPath);
  await page.waitForTimeout(300);
  expect((await Promise.all(downloaded)).some((source) => source.includes('WebGLRenderer'))).toBe(false);
  await expect(page.locator('canvas')).toHaveCount(0);
  await context.close();
});

test('sustained measured cost degrades quality in order and fast frames reverse each step', () => {
  const policy = createQualityPolicy();
  expect(qualityFor(1440, 3)).toEqual({ level: 0, reflection: true, shadowMapSize: 1024, pixelRatio: 2, shadows: true });
  expect(qualityFor(390, 3).pixelRatio).toBe(1.75);
  for (let level = 1; level <= 4; level++) {
    for (let frame = 0; frame < 11; frame++) expect(policy.sample(35)).toBe(level === 1 && frame === 1);
    expect(policy.sample(35)).toBe(true);
    const settings = qualityFor(1440, 2, policy.level);
    expect(settings).toEqual({ level, reflection: false, shadowMapSize: level < 2 ? 1024 : 512, pixelRatio: level < 3 ? 2 : 1.25, shadows: level < 4 });
  }
  for (let level = 3; level >= 0; level--) {
    for (let frame = 0; frame < 89; frame++) expect(policy.sample(5)).toBe(false);
    expect(policy.sample(5)).toBe(true);
    expect(policy.level).toBe(level);
  }
  expect(policy.reflectionFallback).toBe(false);
});

test('a blocked renderer chunk retains the catalogue with one retry', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  let aborted = 0;
  await page.route('**/_astro/*.js', async (route) => {
    const response = await route.fetch();
    if ((await response.text()).includes('WebGLRenderer')) { aborted++; await route.abort(); }
    else await route.fulfill({ response });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The exhibition could not start.', exact: true })).toBeVisible();
  expect(aborted).toBe(1);
  await expect(page.getByRole('button', { name: 'Try the exhibition again', exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Read case study →' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Open my resume' })).toHaveAttribute('href', /\.pdf$/);
  await expect(page.getByRole('link', { name: 'castlew640@gmail.com' })).toHaveAttribute('href', 'mailto:castlew640@gmail.com');
  await expect(page.locator('canvas')).toHaveCount(0);
  await context.close();
});

test('a blocked screenshot restores its authored description and caption without a broken icon', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.route('**/*.webp', (route) => route.abort());
  await page.goto(exhibitPath);
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
  const figure = page.locator('figure[data-panel-source]');
  await expect(figure).toHaveClass(/panel-source-failed/);
  await expect(figure).toHaveCSS('visibility', 'visible');
  await expect(figure).not.toHaveAttribute('aria-hidden', 'true');
  const img = figure.locator('img');
  await expect(img).toHaveAttribute('alt', /\S/);
  await expect(img).toHaveCSS('opacity', '0');
  await expect(img).toHaveAttribute('src', /\.webp$/);
  expect(await img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(0);
  expect(await figure.evaluate((el) => getComputedStyle(el, '::before').content)).toContain(await img.getAttribute('alt'));
  await expect(figure.locator('figcaption')).toHaveText(/\S/);
  expect(await page.evaluate(() => window.__exhibition?.panelTextureReady)).toBe(false);
  expect(await page.locator('body').innerText()).not.toMatch(/webgl|gpu|driver|chrome|safari|firefox|unsupported device/i);
  await page.getByRole('link', { name: 'Read case study →' }).click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await context.close();
});

test('the live panel reuses one image request and restores the figure in still view', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().endsWith('.webp')) requests.push(request.url()); });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => window.__exhibition?.panelReusesImage)).toBe(true);
  const figure = page.locator('figure[data-panel-source]');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toBe(await figure.locator('img').evaluate((el) => (el as HTMLImageElement).src));
  await expect(figure).toHaveAttribute('aria-hidden', 'true');
  await expect(figure).toHaveCSS('visibility', 'hidden');
  const link = page.getByRole('link', { name: 'Read case study →' });
  await page.locator(`#${exhibitId}`).focus();
  await page.keyboard.press('Tab');
  await expect(link).toBeFocused();
  await page.getByRole('button', { name: 'Still view', exact: true }).click();
  await expect(figure).not.toHaveAttribute('aria-hidden', 'true');
  await expect(figure).toHaveCSS('visibility', 'visible');
  expect(requests).toHaveLength(1);
  await context.close();
});

test('every published exhibit contains the canonical case-study anchor without javascript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  const exhibits = page.locator('#exhibition [data-slug]');
  expect(await exhibits.count()).toBeGreaterThan(0);
  for (const exhibit of await exhibits.all()) {
    await expect(exhibit.getByRole('link', { name: 'Read case study →', exact: true })).toHaveAttribute('href', `/projects/${await exhibit.getAttribute('data-slug')}/`);
  }
  await expect(page.getByRole('link', { name: 'Read the case study ↗', exact: true })).toHaveCount(0);
  await context.close();
});

test('the overlay plate guarantees ink contrast with the scene active and after teardown', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
  for (const active of [true, false]) {
    if (!active) await page.getByRole('button', { name: 'Still view', exact: true }).click();
    const contrast = await page.locator('.exhibit-overlay').evaluate((el) => {
      const style = getComputedStyle(el);
      const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
      const ink = rgb(style.color).map((value) => value / 255);
      const plate = rgb(style.backgroundColor);
      const luminance = (channels: number[]) => channels.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
      // color(srgb r g b / .88): worst-case scene is black under the plate.
      return (luminance(plate.slice(0, 3).map((v) => v * plate[3])) + 0.05) / (luminance(ink) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  }
  await context.close();
});
