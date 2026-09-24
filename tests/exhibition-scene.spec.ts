import { expect, test, type Page } from '@playwright/test';
import { chooseMoving } from './support/views';

const viewport = { width: 1440, height: 900 };

test.use({ viewport, reducedMotion: 'no-preference' });
test.beforeEach(async ({ context }) => { await chooseMoving(context); });

async function settleAt(page: Page, id: string): Promise<void> {
  await expect.poll(() => page.evaluate(() => [window.__exhibition?.currentStopId, window.__exhibition?.u === window.__exhibition?.uTarget]), { timeout: 20_000 })
    .toEqual([id, true]);
}

async function travelTo(page: Page, id: string): Promise<void> {
  await page.locator(`#${id}`).evaluate((el) => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'auto' }));
  await settleAt(page, id);
}

/** Where the scene says an interactive object sits, checked to be visible canvas rather than HTML. */
async function screenPoint(page: Page, id: string): Promise<{ x: number; y: number }> {
  await expect.poll(() => page.evaluate((key) => window.__exhibition?.[key], `at:${id}`), { message: `${id} is on screen` }).toBeTruthy();
  const size = page.viewportSize()!;
  const [x, y] = String(await page.evaluate((key) => window.__exhibition?.[key], `at:${id}`)).split(',').map(Number);
  const point = { x: x * size.width, y: y * size.height };
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.matches('canvas'), point), `${id} is not covered by HTML`).toBe(true);
  return point;
}

async function panelCentre(page: Page): Promise<{ x: number; y: number }> {
  return page.evaluate(() => {
    const d = window.__exhibition!;
    return { x: (Number(d.panelLeft) + Number(d.panelRight)) / 2 * innerWidth, y: (Number(d.panelTop) + Number(d.panelBottom)) / 2 * innerHeight };
  });
}

test('exactly one placard shows, and it belongs to the current stop', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active', { timeout: 20_000 });
  for (const id of await page.locator('#exhibition [data-stop]').evaluateAll((stops) => stops.map((stop) => stop.id))) {
    await page.locator(`#${id}`).evaluate((el) => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'auto' }));
    await expect(page.locator(`#${id}`)).toHaveAttribute('data-current', '');
    await expect.poll(() => page.locator('.placard').evaluateAll((placards) => placards
      .filter((placard) => getComputedStyle(placard).opacity === '1').map((placard) => placard.closest('[data-stop]')?.id))).toEqual([id]);
    await expect(page.locator(`#${id} .placard`)).toHaveCSS('pointer-events', 'auto');
  }
});

test('hovering the scene labels what a click will do', async ({ page }) => {
  await page.goto('/');
  await settleAt(page, 'entrance');
  const exhibit = await screenPoint(page, 'exhibit-featured-client');
  await page.mouse.move(exhibit.x, exhibit.y);
  const tooltip = page.locator('.scene-tooltip');
  await expect(tooltip).toHaveText('Walk to Eiffel Technologies');
  await expect(page.locator('html')).toHaveAttribute('data-hover', 'pick');
  await expect(page.locator('.exhibition-canvas')).toHaveCSS('cursor', 'pointer');
  await expect(tooltip).toHaveAttribute('aria-hidden', 'true');
  await page.mouse.move(60, 120);
  await expect(tooltip).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-hover');
});

test('clicking a distant exhibit walks there, and clicking it on arrival opens it', async ({ page }) => {
  await page.goto('/');
  await settleAt(page, 'entrance');
  const history = await page.evaluate(() => window.history.length);
  const exhibit = await screenPoint(page, 'exhibit-featured-client');
  await page.mouse.click(exhibit.x, exhibit.y);
  await settleAt(page, 'exhibit-featured-client');
  await expect(page.locator('#exhibit-featured-client')).toHaveAttribute('data-current', '');
  expect(await page.evaluate(() => window.history.length)).toBe(history);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.panelTextureReady), { timeout: 20_000 }).toBe(true);
  const centre = await panelCentre(page);
  await page.mouse.move(centre.x, centre.y);
  await expect(page.locator('.scene-tooltip')).toHaveText('View Eiffel Technologies');
  await page.mouse.click(centre.x, centre.y);
  await expect(page.getByRole('dialog', { name: /Eiffel Technologies/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#exhibit-featured-client .view-exhibit')).toBeFocused();
});

test('the ground arrow walks on to the next stop', async ({ page }) => {
  await page.goto('/');
  await settleAt(page, 'entrance');
  await expect.poll(() => page.evaluate(() => window.__exhibition?.arrowVisible), { timeout: 20_000 }).toBe(true);
  const arrow = await screenPoint(page, 'arrow');
  await page.mouse.move(arrow.x, arrow.y);
  await expect(page.locator('.scene-tooltip')).toHaveText(/^Walk on to Exhibit 01/);
  await page.mouse.click(arrow.x, arrow.y);
  await settleAt(page, 'exhibit-featured-client');
});

test('landmarks walk to their stop from afar, then act on arrival', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/#exhibit-portfolio');
  await settleAt(page, 'exhibit-portfolio');
  const sofa = await screenPoint(page, 'sofa');
  await page.mouse.click(sofa.x, sofa.y);
  await settleAt(page, 'about');
  const seat = await screenPoint(page, 'sofa');
  await page.mouse.click(seat.x, seat.y);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.lastReaction)).toBe('sofa');
  await travelTo(page, 'landing');
  const phone = await screenPoint(page, 'phone');
  await page.mouse.click(phone.x, phone.y);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.lastReaction)).toBe('phone');
  await expect(page.locator('.email-link')).toHaveClass(/is-ringing/);
  const pint = await screenPoint(page, 'pint');
  await page.mouse.click(pint.x, pint.y);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.lastReaction)).toBe('pint');
  const cabinet = await screenPoint(page, 'cabinet');
  const resume = page.waitForRequest(/\/resume\/william-castle-resume\.pdf$/);
  await page.mouse.click(cabinet.x, cabinet.y);
  await resume;
});

test('toys react where they stand without travelling', async ({ page }) => {
  await page.goto('/');
  await settleAt(page, 'entrance');
  const before = await page.evaluate(() => scrollY);
  const clocks = await screenPoint(page, 'persistence');
  await page.mouse.move(clocks.x, clocks.y);
  await expect(page.locator('.scene-tooltip')).toHaveText('Turn back time');
  await page.mouse.click(clocks.x, clocks.y);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.lastReaction)).toBe('persistence');
  const ants = await screenPoint(page, 'ants');
  await page.mouse.click(ants.x, ants.y);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.lastReaction)).toBe('ants');
  expect(await page.evaluate(() => scrollY)).toBe(before);
  // The reaction plays out, then the scene rests again.
  await expect.poll(() => page.evaluate(() => window.__exhibition?.idle), { timeout: 20_000 }).toBe(true);
});

test('keyboard focus inside another stop brings that stop into view', async ({ page }) => {
  await page.goto('/');
  await settleAt(page, 'entrance');
  const link = page.locator('#exhibit-portfolio .exhibit-link');
  await link.focus();
  await expect(page.locator('#exhibit-portfolio')).toHaveAttribute('data-current', '');
  await expect(page.locator('#exhibit-portfolio .placard')).toHaveCSS('opacity', '1');
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/portfolio\/$/);
});

test('in-page links travel to the stop that holds their target', async ({ page }) => {
  await page.goto('/');
  await settleAt(page, 'entrance');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await nav.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#landing')).toHaveAttribute('data-current', '');
  await expect(page.locator('#contact-title')).toBeInViewport();
  await expect(page.locator('#landing .placard')).toHaveCSS('opacity', '1');
  await nav.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('#about')).toHaveAttribute('data-current', '');
  await page.goBack();
  await expect(page).toHaveURL(/#contact$/);
});

test('a direct link into a placard arrives at its stop', async ({ page }) => {
  await page.goto('/#resume');
  await expect(page.locator('#landing')).toHaveAttribute('data-current', '');
  await settleAt(page, 'landing');
  await expect(page.getByRole('link', { name: 'Open my resume' })).toBeInViewport();
});

test('a single tap walks to a distant exhibit on a phone', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
  await chooseMoving(context);
  const page = await context.newPage();
  await page.goto('/');
  await settleAt(page, 'entrance');
  const exhibit = await screenPoint(page, 'exhibit-featured-client');
  await page.touchscreen.tap(exhibit.x, exhibit.y);
  await settleAt(page, 'exhibit-featured-client');
  await context.close();
});
