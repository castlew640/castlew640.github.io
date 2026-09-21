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

async function panelPoint(page: Page): Promise<{ x: number; y: number }> {
  await page.goto('/');
  if (await page.locator('html').getAttribute('data-view') === 'still') await page.locator('[data-view-toggle]').click();
  await expect.poll(() => page.evaluate(() => window.__exhibition?.panelTextureReady)).toBe(true);
  await page.locator(`#${exhibitId}`).evaluate((el) => el.scrollIntoView());
  await expect.poll(() => page.evaluate(() => window.__exhibition?.currentStopId)).toBe(exhibitId);
  await expect.poll(() => page.evaluate(() => Number(window.__exhibition?.station))).toBeCloseTo(18, 2);
  return page.evaluate(() => {
    const d = window.__exhibition!;
    return {
      x: (Number(d.panelCorner0X) + Number(d.panelCorner2X)) / 2 * innerWidth,
      y: (Number(d.panelCorner0Y) + Number(d.panelCorner2Y)) / 2 * innerHeight,
    };
  });
}

test('one touch on the screenshot opens the same anchor as the visible case-study link', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const point = await panelPoint(page);
  await page.locator('#exhibit-featured-client .exhibit-link').evaluate((anchor) => {
    const link = anchor as HTMLAnchorElement;
    const click = link.click.bind(link);
    link.click = () => { sessionStorage.setItem('panel-used-anchor', 'true'); click(); };
  });
  await page.touchscreen.tap(point.x, point.y);
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  expect(await page.evaluate(() => location.pathname)).toBe(projectPath);
  expect(await page.evaluate(() => sessionStorage.getItem('panel-used-anchor'))).toBe('true');
  await panelPoint(page);
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
  // Role queries exclude aria-hidden and visibility:hidden descendants. The
  // snapshot additionally proves the authored caption remains readable.
  await expect(page.getByRole('img', { name: alt!, exact: true })).toHaveCount(1);
  const accessible = await figure.ariaSnapshot();
  expect(accessible).toContain(alt!);
  expect(accessible).toContain(caption);
  await expect(figure).not.toHaveAttribute('aria-hidden', 'true');
  await expect(figure).toHaveCSS('opacity', '0');
  await expect(figure).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('.exhibition-canvas canvas')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.matches('canvas'), point)).toBe(true);
  await page.locator('[data-view-toggle]').click();
  await expect(figure).toHaveCSS('opacity', '1');
  await expect(page.getByRole('img', { name: alt!, exact: true })).toHaveCount(1);
  expect(await figure.ariaSnapshot()).toContain(caption);
  await context.close();
});

for (const gesture of ['long press', 'wandering press', 'scroll during press', 'two pointers', 'pier', 'missing slug'] as const) {
  test(`a real panel rejects ${gesture}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const point = await panelPoint(page);
    const initial = page.url();
    if (gesture === 'pier') point.x = await page.evaluate(() => {
      const d = window.__exhibition!;
      const xs = Array.from({ length: 4 }, (_, index) => Number(d[`panelCorner${index}X`]));
      const centre = (Math.min(...xs) + Math.max(...xs)) / 2;
      return (centre + (Math.max(...xs) - Math.min(...xs)) * 3.9 / 4) * innerWidth;
    });
    if (gesture === 'missing slug') await page.locator(`#${exhibitId}`).evaluate((el) => el.removeAttribute('data-slug'));
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
    await page.waitForTimeout(200);
    expect(page.url()).toBe(initial);
    await context.close();
  });
}

test('lintel sill walkway and empty sky never act as project links', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await panelPoint(page);
  const initial = page.url();
  const points = await page.evaluate(() => {
    const d = window.__exhibition!;
    const xs = Array.from({ length: 4 }, (_, index) => Number(d[`panelCorner${index}X`]) * innerWidth);
    const ys = Array.from({ length: 4 }, (_, index) => Number(d[`panelCorner${index}Y`]) * innerHeight);
    const centreX = (Math.min(...xs) + Math.max(...xs)) / 2;
    return [
      { x: centreX, y: Math.max(4, Math.min(...ys) - 24) },
      { x: centreX, y: Math.min(innerHeight - 4, Math.max(...ys) + 12) },
      { x: centreX, y: Math.min(innerHeight - 4, Math.max(...ys) + 180) },
      { x: 40, y: 90 },
    ];
  });
  for (const point of points) {
    await page.mouse.click(point.x, point.y);
    await page.waitForTimeout(100);
    expect(page.url()).toBe(initial);
  }
  await context.close();
});
