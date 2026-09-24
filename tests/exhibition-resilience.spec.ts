import { expect, test, type Page } from '@playwright/test';
import { createQualityPolicy, MAX_QUALITY_LEVEL, qualityFor } from '../src/scripts/exhibition/scene/quality';
import { fovFor } from '../src/scripts/exhibition/scene/rig';
import { chooseMoving, pretendHardwareGraphics } from './support/views';

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
  await expect(page.locator('[data-view-toggle]')).toHaveAttribute('aria-pressed', 'true');
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
  const toggle = page.locator('[data-view-toggle]');
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
    const toggle = page.locator('[data-view-toggle]');
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
  await expect(page.locator('[data-view-toggle]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(notice, { exact: true })).toBeVisible();
  await context.close();
});

test('changing the device preference switches to still view without an explicit override', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await pretendHardwareGraphics(context);
  const page = await context.newPage();
  await page.goto(exhibitPath);
  const toggle = page.locator('[data-view-toggle]');
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
    await expect(page.getByRole('heading', { name: name === 'Contact' ? 'Talk shop with me.' : name, exact: true })).toBeVisible();
  }
  await page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' }).click();
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
    const toggle = page.locator('[data-view-toggle]');
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
  const link = page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' });
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
    const stops = Array.from(document.querySelectorAll<HTMLElement>('#exhibition [data-stop]'));
    const next = stops[stops.findIndex((stop) => stop.id === id) + 1];
    const start = document.getElementById(id)!.getBoundingClientRect().top + scrollY;
    const end = next.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: start + (end - start) * 0.25, behavior: 'auto' });
  }, exhibitId);
  await settleLayout(page);
  const fraction = () => page.evaluate((id) => {
    const stops = Array.from(document.querySelectorAll<HTMLElement>('#exhibition [data-stop]'));
    const next = stops[stops.findIndex((stop) => stop.id === id) + 1];
    const start = document.getElementById(id)!.getBoundingClientRect().top;
    const end = next.getBoundingClientRect().top;
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
  const link = page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' });
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
  await chooseMoving(context);
  const page = await context.newPage();
  await page.goto(exhibitPath);
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 30_000 });
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
  const link = page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' });
  await expect(link).toBeVisible();
  await link.focus();
  await expect(link).toBeFocused();
  await lostContext.evaluate((context) => context.restore());
  await lostContext.dispose();
  await page.waitForTimeout(1100);
  await expect(page.locator('html')).not.toHaveAttribute('data-scene', 'active', { timeout: 30_000 });
  await expect(page.locator('.exhibition-canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Try the exhibition again', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 30_000 });
  await expect(page.locator('.exhibition-canvas')).toHaveCount(1);
  await context.close();
});

test('the moving scene retains native canvas gestures, a level horizon and the fitted field of view', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await chooseMoving(context);
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 30_000 });
  await expect(page.locator('#exhibition')).toHaveCSS('pointer-events', 'none');
  for (const selector of ['.exhibition-canvas', '.exhibition-canvas canvas']) {
    await expect(page.locator(selector)).toHaveCSS('touch-action', 'auto');
    await expect(page.locator(selector)).toHaveCSS('pointer-events', 'auto');
  }
  await expect(page.locator('canvas')).toHaveAttribute('aria-hidden', 'true');
  for (const viewport of [{ width: 1440, height: 810 }, { width: 390, height: 664 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    const expected = fovFor(viewport.width / viewport.height) * 180 / Math.PI;
    await expect.poll(() => page.evaluate(() => window.__exhibition?.fovY)).toBeCloseTo(expected, 4);
  }
  const samples: number[] = [];
  for (const id of ['entrance', exhibitId, 'about', 'landing']) {
    await page.locator(`#${id}`).evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'auto' }));
    await expect.poll(() => page.evaluate(() => [window.__exhibition?.currentStopId, window.__exhibition?.u === window.__exhibition?.uTarget]), { timeout: 30_000 })
      .toEqual([id, true]);
    const pose = await page.evaluate(() => ({ x: Number(window.__exhibition?.cameraX), tilt: Number(window.__exhibition?.horizonTilt) }));
    expect(Math.abs(pose.tilt)).toBeLessThan(1e-6);
    samples.push(pose.x);
  }
  // The walk meanders: the visitor does not travel down one straight axis.
  expect(Math.max(...samples) - Math.min(...samples)).toBeGreaterThan(1);
  await context.close();
});

test('scene resources stay bounded and return to zero across three deliberate remounts', async ({ browser }) => {
  // Four software-rendered scene mounts.
  test.setTimeout(150_000);
  const context = await browser.newContext({ reducedMotion: 'no-preference', deviceScaleFactor: 2, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('[data-view-toggle]').click();
  const projectCount = await page.locator('#exhibition [data-stop][data-slug]').count();
  const counts = () => page.evaluate(() => ({ geometries: window.__exhibition?.geometries, textures: window.__exhibition?.textures, interactives: window.__exhibition?.interactives }));
  await expect.poll(() => page.evaluate(() => window.__exhibition?.idle), { timeout: 30_000 }).toBe(true);
  const first = await counts();
  // Every exhibit plus the sofa, cabinet, phone, pint, castle, clocks, ants, egg, three elephants and the ground arrow.
  expect(first.interactives).toBe(projectCount + 12);
  expect(Number(first.textures)).toBeLessThanOrEqual(8 + 2 * projectCount);
  expect(Number(first.geometries)).toBeLessThanOrEqual(120 + 12 * projectCount);
  const debug = await page.evaluate(() => window.__exhibition!);
  expect(Object.values(debug).every((value) => ['number', 'boolean', 'string'].includes(typeof value))).toBe(true);
  expect(debug.pixelRatio).toBe(qualityFor(390, 2, Number(debug.qualityLevel)).pixelRatio);
  for (let i = 0; i < 3; i++) {
    await page.locator('[data-view-toggle]').click();
    await expect(page.locator('.exhibition-canvas')).toHaveCount(0);
    expect(await page.evaluate(() => window.__exhibition?.mounted)).toBe(false);
    expect(await page.evaluate(() => window.__exhibition?.geometries)).toBe(0);
    // three keeps one 16×16 BRDF lookup table per renderer; the forced context loss frees it.
    expect(await page.evaluate(() => window.__exhibition?.textures)).toBeLessThanOrEqual(1);
    await page.locator('[data-view-toggle]').click();
    await expect.poll(() => page.evaluate(() => window.__exhibition?.idle), { timeout: 30_000 }).toBe(true);
    await expect.poll(counts).toEqual(first);
    await expect(page.locator('.exhibition-canvas canvas')).toHaveCount(1);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(() => page.evaluate(() => window.__exhibition?.cssWidth)).toBe(844);
  await context.close();
});

test('the scene rests when settled and suspends for hidden tabs, an offscreen exhibition and the open viewer', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await chooseMoving(context);
  const page = await context.newPage();
  await page.goto('/');
  const count = () => page.evaluate(() => Number(window.__exhibition?.renderCount ?? 0));
  // CI draws in software, where ambient animation is off and the loop rests as soon as travel settles.
  await expect.poll(() => page.evaluate(() => [window.__exhibition?.softwareRenderer, window.__exhibition?.ambient, window.__exhibition?.idle]), { timeout: 30_000 })
    .toEqual([true, false, true]);
  const idle = await count();
  await page.waitForTimeout(1100);
  expect(await count()).toBe(idle);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    scrollBy(0, 200);
  });
  await page.waitForTimeout(300);
  expect(await count()).toBe(idle);
  expect(await page.evaluate(() => window.__exhibition?.suspended)).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(count).toBeGreaterThan(idle);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.idle), { timeout: 30_000 }).toBe(true);
  // A tall spacer after the exhibition lets it scroll completely out of view.
  await page.addStyleTag({ content: 'main::after { content: ""; display: block; height: 300vh; }' });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.__exhibition?.suspended)).toBe(true);
  const offscreen = await count();
  await page.evaluate(() => scrollBy(0, -10));
  await page.waitForTimeout(300);
  expect(await count()).toBe(offscreen);
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(count).toBeGreaterThan(offscreen);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.idle), { timeout: 30_000 }).toBe(true);
  // The open viewer covers the scene, so it pauses until the viewer closes.
  await page.locator('#exhibit-featured-client').evaluate((el) => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'auto' }));
  await page.getByRole('button', { name: /View exhibit/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => [window.__exhibition?.paused, window.__exhibition?.running])).toEqual([true, false]);
  const paused = await count();
  await page.waitForTimeout(500);
  expect(await count()).toBe(paused);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await page.evaluate(() => window.__exhibition?.paused)).toBe(false);
  await context.close();
});

test('software-rendered browsers open the illustrated view by default and can still enter the scene', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const downloaded: Promise<string>[] = [];
  page.on('response', (response) => { if (response.url().endsWith('.js')) downloaded.push(response.text()); });
  await page.goto('/');
  // CI's Chromium draws WebGL with SwiftShader.
  await expect(page.locator('html')).toHaveAttribute('data-graphics', 'software');
  await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
  await expect(page.getByText(/draws 3D without graphics acceleration/)).toBeVisible();
  await page.waitForTimeout(300);
  expect((await Promise.all(downloaded)).some((source) => source.includes('WebGLRenderer'))).toBe(false);
  await page.locator('[data-view-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 30_000 });
  expect(await page.evaluate(() => [window.__exhibition?.softwareRenderer, window.__exhibition?.qualityLevel, window.__exhibition?.shadows]))
    .toEqual([true, MAX_QUALITY_LEVEL, false]);
  await context.close();
});

test('actual emitted renderer chunks never download for reduced motion or project routes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await pretendHardwareGraphics(context);
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
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 30_000 });
  expect((await Promise.all(downloaded)).some((source) => source.includes('WebGLRenderer'))).toBe(true);
  downloaded.length = 0;
  await page.goto(projectPath);
  await page.waitForTimeout(300);
  expect((await Promise.all(downloaded)).some((source) => source.includes('WebGLRenderer'))).toBe(false);
  await expect(page.locator('canvas')).toHaveCount(0);
  await context.close();
});

test('sustained slow frames step quality down in order and long fast runs step it back up', () => {
  expect(qualityFor(1440, 3)).toEqual({ level: 0, pixelRatio: 2, shadows: true, shadowMapSize: 2048 });
  expect(qualityFor(390, 3).pixelRatio).toBe(1.75);
  const policy = createQualityPolicy();
  for (let level = 1; level <= MAX_QUALITY_LEVEL; level++) {
    for (let frame = 0; frame < 39; frame++) expect(policy.sample(35)).toBe(false);
    expect(policy.sample(35)).toBe(true);
    expect(policy.level).toBe(level);
    const settings = qualityFor(1440, 2, policy.level);
    expect(settings.shadows).toBe(level < 3);
    expect(settings.pixelRatio).toBeLessThan(qualityFor(1440, 2, level - 1).pixelRatio);
  }
  expect(policy.sample(35)).toBe(false);
  for (let level = MAX_QUALITY_LEVEL - 1; level >= 0; level--) {
    for (let frame = 0; frame < 299; frame++) expect(policy.sample(10)).toBe(false);
    expect(policy.sample(10)).toBe(true);
    expect(policy.level).toBe(level);
  }
  expect(createQualityPolicy(99).level).toBe(MAX_QUALITY_LEVEL);
});

test('a blocked renderer chunk retains the catalogue with one retry', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await chooseMoving(context);
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
  await expect(page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Open my resume' })).toHaveAttribute('href', /\.pdf$/);
  await expect(page.getByRole('link', { name: 'castlew640@gmail.com' })).toHaveAttribute('href', 'mailto:castlew640@gmail.com');
  await expect(page.locator('canvas')).toHaveCount(0);
  await context.close();
});

test('a post-construction setup failure releases every scene canvas and context before retry', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await chooseMoving(context);
  await context.addInitScript(() => {
    const contexts: WebGL2RenderingContext[] = [];
    Object.defineProperty(window, '__setupContexts', { value: contexts });
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === '2d') return null;
      const result = Reflect.apply(original, this, [type, ...args]);
      if (type === 'webgl2' && result && !contexts.includes(result)) contexts.push(result);
      return result;
    } as typeof original;
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const failure = page.getByRole('heading', { name: 'The exhibition could not start.', exact: true });
  const retry = page.getByRole('button', { name: 'Try the exhibition again', exact: true });
  for (const attempt of [1, 2]) {
    await expect(failure).toBeVisible();
    await expect(page.locator('.exhibition-canvas, .exhibition-canvas canvas')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
    const resources = await page.evaluate(() => {
      const contexts = (window as unknown as { __setupContexts: WebGL2RenderingContext[] }).__setupContexts;
      return { created: contexts.length, live: contexts.filter((gl) => !gl.isContextLost()).length };
    });
    expect(resources).toEqual({ created: attempt, live: 0 });
    await expect(page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Open my resume' })).toHaveAttribute('href', /\.pdf$/);
    if (attempt === 1) await retry.click();
  }
  await expect(retry).toHaveCount(0);
  expect(errors).toEqual([]);
  await page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' }).click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await context.close();
});

test('a shader that fails to link after construction releases the scene and keeps the catalogue', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await chooseMoving(context);
  await context.addInitScript(() => {
    for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const original = prototype.getProgramParameter;
      prototype.getProgramParameter = function (this: WebGLRenderingContext, program: WebGLProgram, name: number) {
        return name === this.LINK_STATUS ? false : Reflect.apply(original, this, [program, name]);
      } as typeof original;
    }
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The exhibition could not start.', exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
  await expect(page.locator('.exhibition-canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
  await page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' }).click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await context.close();
});

test('a blocked screenshot restores its authored description and caption without a broken icon', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await chooseMoving(context);
  const page = await context.newPage();
  await page.route('**/*.webp', (route) => route.abort());
  await page.goto(exhibitPath);
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 30_000 });
  const figure = page.locator('#exhibit-featured-client figure[data-panel-source]');
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
  await page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' }).click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await context.close();
});

test('the live panel uses the catalogue image request and restores the figure in still view', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await chooseMoving(context);
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().endsWith('.webp')) requests.push(request.url()); });
  await page.goto(exhibitPath);
  await expect.poll(() => page.evaluate(() => [window.__exhibition?.panelStopId, window.__exhibition?.panelTextureReady]), { timeout: 30_000 })
    .toEqual([exhibitId, true]);
  const figure = page.locator('#exhibit-featured-client figure[data-panel-source]');
  const imageUrl = await figure.locator('img').evaluate((el) => (el as HTMLImageElement).src);
  expect(requests.filter((url) => url === imageUrl)).toHaveLength(1);
  await expect(figure).not.toHaveAttribute('aria-hidden', 'true');
  expect((await figure.boundingBox())!.width).toBeLessThanOrEqual(1);
  const view = page.locator('#exhibit-featured-client .view-exhibit');
  const link = page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' });
  await page.locator(`#${exhibitId}`).focus();
  await page.keyboard.press('Tab');
  await expect(view).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(link).toBeFocused();
  await page.locator('[data-view-toggle]').click();
  await expect(figure).toBeVisible();
  expect((await figure.boundingBox())!.width).toBeGreaterThan(200);
  expect(requests.filter((url) => url === imageUrl)).toHaveLength(1);
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

test('exhibit text keeps ink contrast on an opaque plate with the scene active and after teardown', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  await chooseMoving(context);
  const page = await context.newPage();
  await page.goto(exhibitPath);
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 30_000 });
  for (const active of [true, false]) {
    if (!active) await page.locator('[data-view-toggle]').click();
    for (const selector of ['.exhibit-title', '.exhibit-summary']) {
      const contrast = await page.locator(`#exhibit-featured-client ${selector}`).evaluate((el) => {
        const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
        // The nearest painted ancestor is the plate; it must be opaque so scene pixels cannot show through.
        let plate: HTMLElement | null = el as HTMLElement;
        while (plate && rgb(getComputedStyle(plate).backgroundColor)[3] === 0) plate = plate.parentElement;
        const background = rgb(getComputedStyle(plate!).backgroundColor);
        if ((background[3] ?? 1) < 1) return 0;
        const luminance = (channels: number[]) => channels.slice(0, 3).map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
          .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
        const [light, dark] = [luminance(background), luminance(rgb(getComputedStyle(el).color))].sort((a, b) => b - a);
        return (light + 0.05) / (dark + 0.05);
      });
      expect(contrast, `${selector} with the scene ${active ? 'active' : 'removed'}`).toBeGreaterThanOrEqual(4.5);
    }
  }
  await context.close();
});
