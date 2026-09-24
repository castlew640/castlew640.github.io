import { expect, test, type Page } from '@playwright/test';

const exhibitId = 'exhibit-featured-client';
const exhibitPath = `/#${exhibitId}`;
const projectPath = '/projects/featured-client/';
const destinations = ['Projects', 'About', 'Resume', 'Contact'];

test.use({ reducedMotion: 'reduce' });

async function settleLayout(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

test('the visible case-study link and return link preserve the exhibit and focus', async ({ page }) => {
  await page.goto('/');
  await page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' }).click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await expect(page.getByRole('heading', { name: /Eiffel Technologies/ })).toBeVisible();
  await page.getByRole('link', { name: '← Back to the exhibition' }).click();
  await expect(page).toHaveURL(new RegExp(`${exhibitPath}$`));
  const exhibit = page.locator(`#${exhibitId}`);
  await expect(exhibit).toBeInViewport();
  await expect(exhibit).toBeFocused();
});

test('direct exhibit arrival focuses without a second scroll jump', async ({ page }) => {
  await page.goto(exhibitPath);
  await expect(page.locator(`#${exhibitId}`)).toBeFocused();
  const scroll = await page.evaluate(() => scrollY);
  await settleLayout(page);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await expect(page.locator(`#${exhibitId}`)).toBeInViewport();
});

test('browser back and forward retain the native history and scroll position', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' });
  await link.scrollIntoViewIfNeeded();
  await settleLayout(page);
  const scrollBefore = await page.evaluate(() => scrollY);
  expect(scrollBefore).toBeGreaterThan(500);
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await page.goBack();
  await settleLayout(page);
  const restored = await page.evaluate(() => ({
    scroll: scrollY,
    restoration: history.scrollRestoration,
    exhibitFocused: document.activeElement?.matches('[data-stop]'),
    actualIndex: Number(document.querySelector<HTMLElement>('.exhibition-controls')?.dataset.stopIndex),
    expectedIndex: Array.from(document.querySelectorAll('#exhibition [data-stop]')).filter((el) => el.getBoundingClientRect().top < 0.5).length - 1,
  }));
  expect(Math.abs(restored.scroll - scrollBefore)).toBeLessThanOrEqual(2);
  expect(restored).toMatchObject({ restoration: 'auto', exhibitFocused: false, actualIndex: restored.expectedIndex });
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await expect(page.getByRole('heading', { name: /Eiffel Technologies/ })).toBeVisible();
});

test('a persisted pageshow rederives the restored stop without scrolling or focusing', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' });
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await page.goBack();
  await settleLayout(page);
  // Exercise the bfcache lifecycle deterministically even when Chromium elects to reload.
  const restored = await page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('.exhibition-controls')!;
    const before = { scroll: scrollY, focus: document.activeElement };
    nav.dataset.stopIndex = '-1';
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    return {
      actualIndex: Number(nav.dataset.stopIndex),
      expectedIndex: Array.from(document.querySelectorAll('#exhibition [data-stop]')).filter((el) => el.getBoundingClientRect().top < 0.5).length - 1,
      sameScroll: scrollY === before.scroll,
      sameFocus: document.activeElement === before.focus,
    };
  });
  expect(restored).toEqual({ actualIndex: restored.expectedIndex, expectedIndex: restored.expectedIndex, sameScroll: true, sameFocus: true });
  expect(restored.actualIndex).toBeGreaterThan(0);
});

test('a single-finger swipe ending stationary over the exhibit scrolls without opening it', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(exhibitPath);
  await settleLayout(page);
  const before = await page.evaluate(() => scrollY);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 135 }] });
  for (const y of [115, 95, 75, 55]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y }] });
  }
  // Hold the final position so the regression includes a stationary release after travel.
  await page.waitForTimeout(150);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 4);
  await expect(page).toHaveURL(new RegExp(`${exhibitPath}$`));
  await cdp.detach();
  await context.close();
});

test('the complete visit keeps resume and contact reachable through single taps', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: 'Next exhibit' }).tap();
  await expect(page.getByRole('navigation', { name: 'Exhibition travel' })).toHaveAttribute('data-stop-index', '1');
  const link = page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' });
  await link.scrollIntoViewIfNeeded();
  await link.tap();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await page.getByRole('link', { name: '← Back to the exhibition' }).tap();
  await expect(page.locator(`#${exhibitId}`)).toBeFocused();
  const forward = page.getByRole('button', { name: 'Next exhibit' });
  await forward.tap();
  await expect(page.getByRole('navigation', { name: 'Exhibition travel' })).toHaveAttribute('data-stop-index', '2');
  const lastIndex = await page.locator('#exhibition [data-stop]').count() - 1;
  for (let index = 3; index <= lastIndex; index++) await forward.tap();
  await expect(forward).toHaveAttribute('aria-disabled', 'true');
  const resume = page.getByRole('link', { name: 'Open my resume' });
  await expect(resume).toHaveAttribute('href', '/resume/william-castle-resume.pdf');
  const pdf = await page.request.get('/resume/william-castle-resume.pdf');
  expect(pdf.status()).toBe(200);
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact' }).tap();
  await expect(page.getByRole('link', { name: 'castlew640@gmail.com' })).toHaveAttribute('href', 'mailto:castlew640@gmail.com');
  await context.close();
});

test('all shipped primary anchors resolve in their original reading order', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const name of destinations) {
    const link = nav.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', `/#${name.toLowerCase()}`);
    await link.click();
    await expect(page.getByRole('heading', { name: name === 'Contact' ? 'Talk shop with me.' : name, exact: true })).toBeInViewport();
  }
  expect(await page.locator('main section[id]').evaluateAll((sections) => sections
    .map((section) => section.id).filter((id) => ['projects', 'about', 'resume', 'contact'].includes(id)),
  )).toEqual(['projects', 'about', 'resume', 'contact']);
});

/** Enter the 3D view and settle in front of the client exhibit; returns the centre of its evidence. */
async function panelPoint(page: Page): Promise<{ x: number; y: number }> {
  await page.goto('/');
  if (await page.locator('html').getAttribute('data-view') === 'still') await page.locator('[data-view-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 20_000 });
  await page.locator(`#${exhibitId}`).evaluate((el) => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'auto' }));
  await expect.poll(() => page.evaluate(() => [window.__exhibition?.panelStopId, window.__exhibition?.u === window.__exhibition?.uTarget, window.__exhibition?.panelTextureReady]), { timeout: 20_000 })
    .toEqual([exhibitId, true, true]);
  return page.evaluate(() => {
    const d = window.__exhibition!;
    return { x: (Number(d.panelLeft) + Number(d.panelRight)) / 2 * innerWidth, y: (Number(d.panelTop) + Number(d.panelBottom)) / 2 * innerHeight };
  });
}

test('one touch on the screenshot opens the exhibit in place, with the same case study as the visible link', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const point = await panelPoint(page);
  const historyBefore = await page.evaluate(() => history.length);
  await page.touchscreen.tap(point.x, point.y);
  const viewer = page.getByRole('dialog', { name: /Eiffel Technologies/ });
  await expect(viewer).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-viewer', 'featured-client');
  expect(await page.evaluate(() => history.length)).toBe(historyBefore + 1);
  const visible = await page.locator('#exhibit-featured-client .exhibit-link').getAttribute('href');
  await expect(viewer.getByRole('link', { name: /Read the full case study/ })).toHaveAttribute('href', visible!);
  // The browser's Back closes the viewer without leaving the exhibition.
  await page.goBack();
  await expect(viewer).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#exhibit-featured-client .view-exhibit')).toBeFocused();
  await page.locator('#exhibit-featured-client').getByRole('link', { name: 'Read case study →' }).tap();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await context.close();
});

test('the active decorative canvas preserves the screenshot alternative and caption for assistive technology', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const point = await panelPoint(page);
  const figure = page.locator('#exhibit-featured-client figure[data-panel-source]');
  const alt = await figure.locator('img').getAttribute('alt');
  const caption = await figure.locator('figcaption').innerText();
  expect(alt).toBeTruthy();
  expect(caption).toBeTruthy();
  // The closed viewer's copies are outside the accessibility tree; the catalogue figure stays in it.
  await expect(page.getByRole('img', { name: alt!, exact: true })).toHaveCount(1);
  const accessible = await figure.ariaSnapshot();
  expect(accessible).toContain(alt!);
  expect(accessible).toContain(caption);
  await expect(figure).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.exhibition-canvas canvas')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.matches('canvas'), point)).toBe(true);
  await page.locator('[data-view-toggle]').click();
  await expect(figure).toBeVisible();
  expect((await figure.boundingBox())!.width).toBeGreaterThan(200);
  await expect(page.getByRole('img', { name: alt!, exact: true })).toHaveCount(1);
  expect(await figure.ariaSnapshot()).toContain(caption);
  await context.close();
});

for (const gesture of ['long press', 'wandering press', 'scroll during press', 'two pointers', 'empty sky'] as const) {
  test(`a real exhibit rejects ${gesture}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const point = await panelPoint(page);
    const initial = page.url();
    // Beside the frame's generous hit volume, where only sand and sky remain.
    if (gesture === 'empty sky') point.x = 6;
    const scrollBefore = await page.evaluate(() => scrollY);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    if (gesture === 'long press') await page.waitForTimeout(550);
    if (gesture === 'wandering press') { await page.mouse.move(point.x + 15, point.y); await page.mouse.move(point.x, point.y); }
    if (gesture === 'scroll during press') { await page.evaluate(() => scrollBy(0, 8)); await settleLayout(page); }
    if (gesture === 'two pointers') await page.evaluate(({ x, y }) => {
      window.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, clientX: x, clientY: y, isPrimary: false }));
    }, point);
    await page.mouse.up();
    if (gesture === 'two pointers') await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2 })));
    await page.waitForTimeout(250);
    expect(page.url()).toBe(initial);
    await expect(page.locator('html')).not.toHaveAttribute('data-viewer');
    if (gesture !== 'scroll during press') expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
    await context.close();
  });
}

test('sky and sand never act as links or travel', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await panelPoint(page);
  const initial = page.url();
  const before = await page.evaluate(() => scrollY);
  const points = await page.evaluate(() => {
    const d = window.__exhibition!;
    // Open sky and sand to the left of the framed exhibit, above its placard.
    const left = Number(d.panelLeft) * innerWidth;
    return [
      { x: 60, y: 110 },
      { x: left * 0.5, y: 170 },
      { x: left * 0.8, y: 240 },
    ];
  });
  for (const point of points) {
    await page.mouse.click(point.x, point.y);
    await page.waitForTimeout(150);
    expect(page.url()).toBe(initial);
    expect(await page.evaluate(() => scrollY)).toBe(before);
    await expect(page.locator('html')).not.toHaveAttribute('data-viewer');
  }
  await context.close();
});
