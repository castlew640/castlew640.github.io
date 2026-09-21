import { expect, test, type Page } from '@playwright/test';

const introduction =
  'I build software around what people are trying to achieve, from the first idea to deployment.';
const destinations = ['Projects', 'About', 'Resume', 'Contact'];
const contract = 'PROFILE_NAV_CONTRACT_MISSING';

async function expectProfile(page: Page) {
  await expect(page.getByRole('heading', { level: 1, name: 'William Castle' }), contract).toBeVisible();
  await expect(page.getByText(introduction, { exact: true }), contract).toBeVisible();
  await expect(page.getByText(/recent computer science graduate/i), contract).toBeVisible();
}

test('the built home page introduces William and describes his background', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expectProfile(page);
});

test('profile and direct navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expectProfile(page);
  for (const name of destinations) {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
    await expect(page.getByRole('heading', { name: name === 'Contact' ? 'Talk shop with me.' : name, exact: true })).toBeVisible();
  }
  await context.close();
});

test('semantic navigation reaches visible sections in reading order', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Primary' });
  await expect(navigation, contract).toBeVisible();
  await expect(navigation.getByRole('link')).toHaveText(destinations);
  for (const name of destinations) {
    const id = name.toLowerCase();
    await expect(navigation.getByRole('link', { name, exact: true })).toHaveAttribute('href', `/#${id}`);
    await expect(page.locator(`section#${id}`)).toBeVisible();
  }
  expect(await page.locator('main section[id]').evaluateAll((sections) =>
    sections.map((section) => section.id).filter((id) => ['projects', 'about', 'resume', 'contact'].includes(id)),
  )).toEqual(['projects', 'about', 'resume', 'contact']);
});

test('keyboard visitors can skip navigation and see their focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip, contract).toBeFocused();
  await expect(skip).toBeInViewport();
  await expect(skip).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('profile and navigation reflow at narrow widths and enlarged text', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expectProfile(page);
    const navigation = page.getByRole('navigation', { name: 'Primary' });
    for (const name of destinations) {
      const link = navigation.getByRole('link', { name, exact: true });
      await expect(link).toBeInViewport();
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.addStyleTag({ content: 'html { font-size: 200%; } * { letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { line-height: 1.5 !important; margin-bottom: 2em !important; }' });
  await expectProfile(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
