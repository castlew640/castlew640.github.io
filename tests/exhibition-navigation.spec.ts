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
  await page.getByRole('link', { name: 'Read case study →' }).click();
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
  const link = page.getByRole('link', { name: 'Read case study →' });
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
  const link = page.getByRole('link', { name: 'Read case study →' });
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
  const link = page.getByRole('link', { name: 'Read case study →' });
  await link.scrollIntoViewIfNeeded();
  await link.tap();
  await expect(page).toHaveURL(new RegExp(`${projectPath}$`));
  await page.getByRole('link', { name: '← Back to the exhibition' }).tap();
  await expect(page.locator(`#${exhibitId}`)).toBeFocused();
  const forward = page.getByRole('button', { name: 'Next exhibit' });
  await forward.tap();
  await expect(page.getByRole('navigation', { name: 'Exhibition travel' })).toHaveAttribute('data-stop-index', '2');
  await forward.tap();
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
    await expect(page.getByRole('heading', { name, exact: true })).toBeInViewport();
  }
  expect(await page.locator('main section[id]').evaluateAll((sections) => sections
    .map((section) => section.id).filter((id) => ['projects', 'about', 'resume', 'contact'].includes(id)),
  )).toEqual(['projects', 'about', 'resume', 'contact']);
});
