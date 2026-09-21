import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const types = new Map([
  ['.html', /text\/html/i], ['.css', /text\/css/i], ['.js', /(?:javascript|ecmascript)/i],
  ['.webp', /image\/webp/i], ['.jpg', /image\/jpeg/i], ['.jpeg', /image\/jpeg/i],
  ['.png', /image\/png/i], ['.pdf', /application\/pdf/i],
  ['.mp4', /video\/mp4/i], ['.vtt', /text\/vtt/i],
]);

async function listFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function checkedBase(baseUrl) {
  const url = new URL(baseUrl);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(loopback && url.protocol === 'http:')) {
    throw new Error('Production smoke requires HTTPS; only loopback HTTP is allowed for tests');
  }
  if (url.pathname !== '/' || url.username || url.password || url.search || url.hash) {
    throw new Error('Production smoke base URL must be an origin root without credentials or query');
  }
  return url;
}

async function responseAt(base, pathname) {
  let target = new URL(pathname, base);
  for (let redirects = 0; redirects < 5; redirects++) {
    if (target.origin !== base.origin || target.protocol !== base.protocol) throw new Error(`Redirect escaped checked origin: ${target}`);
    const response = await fetch(target, { redirect: 'manual', signal: AbortSignal.timeout(12_000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`Redirect without location: ${target}`);
      target = new URL(location, target);
      continue;
    }
    if (response.status !== 200) throw new Error(`HTTP ${response.status} for ${target}`);
    if (new URL(response.url).origin !== base.origin) throw new Error(`Response escaped checked origin: ${response.url}`);
    return response;
  }
  throw new Error(`Too many redirects for ${pathname}`);
}

function routeFor(relativePath) {
  if (relativePath === 'index.html') return '/';
  if (relativePath.endsWith('/index.html')) return `/${relativePath.slice(0, -'index.html'.length)}`;
  return `/${relativePath}`;
}

async function browserJourney(base, projectSlugs) {
  const browser = await chromium.launch();
  const checks = { directRoutesAndReturns: false, primaryNavigation: false,
    contactAndResume: false, noJavaScriptRoutes: false, phoneStillAndOptIn: false };
  try {
    const desktop = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 810 } });
    const page = await desktop.newPage();
    for (const slug of projectSlugs) {
      await page.goto(new URL(`/projects/${slug}/`, base).href);
      await page.reload();
      const returnLink = page.getByRole('link', { name: /Back to the exhibition/ });
      const expected = `/#exhibit-${slug}`;
      if (await returnLink.getAttribute('href') !== expected) throw new Error(`Broken return destination for ${slug}`);
      await returnLink.click();
      if (new URL(page.url()).hash !== `#exhibit-${slug}` || await page.locator(`#exhibit-${slug}`).count() !== 1) {
        throw new Error(`Return did not reach exhibit ${slug}`);
      }
    }
    checks.directRoutesAndReturns = true;
    await page.goto(base.href);
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const section of ['projects', 'about', 'resume', 'contact']) {
      await nav.getByRole('link', { name: new RegExp(`^${section}$`, 'i') }).click();
      if (new URL(page.url()).hash !== `#${section}` || await page.locator(`#${section}`).count() !== 1) {
        throw new Error(`Broken primary navigation destination: ${section}`);
      }
    }
    checks.primaryNavigation = true;
    if (await page.getByRole('link', { name: 'Open my resume' }).getAttribute('href') !== '/resume/william-castle-resume.pdf') {
      throw new Error('Broken resume destination');
    }
    if (await page.getByRole('link', { name: 'castlew640@gmail.com' }).getAttribute('href') !== 'mailto:castlew640@gmail.com') {
      throw new Error('Broken contact email destination');
    }
    for (const [label, href] of [['GitHub', 'https://github.com/castlew640'],
      ['LinkedIn', 'https://linkedin.com/in/will-castle-swefh'],
      ['Indeed', 'https://profile.indeed.com/?hl=en_US&co=US&from=gnav-homepage--homepage-frontend']]) {
      if (await page.getByRole('link', { name: label, exact: true }).getAttribute('href') !== href) {
        throw new Error(`Broken contact profile destination: ${label}`);
      }
    }
    checks.contactAndResume = true;
    await desktop.close();

    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const plain = await noJS.newPage();
    await plain.goto(base.href);
    for (const slug of projectSlugs) {
      await plain.goto(new URL(`/projects/${slug}/`, base).href);
      await plain.reload();
      const link = plain.getByRole('link', { name: /Back to the exhibition/ });
      if (await link.getAttribute('href') !== `/#exhibit-${slug}`) throw new Error(`No-JS return destination broken: ${slug}`);
      await link.click();
      if (new URL(plain.url()).hash !== `#exhibit-${slug}`) throw new Error(`No-JS return failed: ${slug}`);
    }
    if (await plain.getByRole('link', { name: 'castlew640@gmail.com' }).count() !== 1) throw new Error('No-JS contact missing');
    checks.noJavaScriptRoutes = true;
    await noJS.close();

    const phone = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true,
      isMobile: true, deviceScaleFactor: 3, reducedMotion: 'no-preference' });
    const mobile = await phone.newPage();
    await mobile.goto(base.href);
    if (await mobile.locator('html').getAttribute('data-view') !== 'still') throw new Error('Fresh phone did not open in still view');
    await mobile.locator('[data-view-toggle]').click();
    await mobile.locator('html[data-scene="active"]').waitFor({ timeout: 12_000 });
    if (await mobile.locator('html').getAttribute('data-view') !== 'moving') throw new Error('Phone 3D opt-in failed');
    checks.phoneStillAndOptIn = true;
    await phone.close();
  } finally { await browser.close(); }
  return checks;
}

export async function runProductionSmoke({ baseUrl, distRoot, outputPath }) {
  const base = checkedBase(baseUrl);
  const root = resolve(distRoot);
  const files = (await listFiles(root)).sort();
  if (!files.length) throw new Error(`Empty checked artifact: ${root}`);
  const records = [];
  for (const file of files) {
    const name = relative(root, file).split(sep).join('/');
    if (name.startsWith('../') || name.startsWith('.')) throw new Error(`Unexpected checked-artifact path: ${name}`);
    const pathname = routeFor(name);
    const expected = await readFile(file);
    const response = await responseAt(base, pathname);
    const actual = Buffer.from(await response.arrayBuffer());
    const extension = `.${name.split('.').at(-1)}`;
    const expectedType = types.get(extension);
    if (!expectedType || !expectedType.test(response.headers.get('content-type') ?? '')) {
      throw new Error(`Content-type mismatch for ${pathname}: ${response.headers.get('content-type')}`);
    }
    if (extension === '.pdf' && (!expected.subarray(0, 5).equals(Buffer.from('%PDF-')) || !actual.subarray(0, 5).equals(Buffer.from('%PDF-')))) {
      throw new Error(`PDF signature mismatch for ${pathname}`);
    }
    const expectedHash = sha256(expected);
    const actualHash = sha256(actual);
    if (expectedHash !== actualHash) throw new Error(`Artifact hash mismatch for ${pathname}: ${actualHash} != ${expectedHash}`);
    records.push({ pathname, bytes: actual.length, sha256: actualHash, contentType: response.headers.get('content-type') });
  }
  const projectSlugs = files.map((file) => relative(root, file).split(sep).join('/'))
    .filter((name) => /^projects\/[^/]+\/index\.html$/.test(name))
    .map((name) => name.split('/')[1]).sort();
  if (!projectSlugs.length) throw new Error('Checked artifact has no published project routes');
  const browserChecks = await browserJourney(base, projectSlugs);
  const result = { ok: true, baseUrl: base.href, timestamp: new Date().toISOString(),
    distRoot: root, filesChecked: records.length, projectSlugs, browserChecks, files: records };
  await mkdir(dirname(resolve(outputPath)), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = new Map();
  for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
  const baseUrl = args.get('--base-url');
  const distRoot = args.get('--dist');
  const outputPath = args.get('--output');
  if (!baseUrl || !distRoot || !outputPath) throw new Error('Usage: node scripts/production-smoke.mjs --base-url URL --dist DIST --output REPORT.json');
  runProductionSmoke({ baseUrl, distRoot, outputPath })
    .then((result) => console.log(`Production smoke passed: ${result.filesChecked} byte-matched files, ${result.projectSlugs.length} direct projects, all browser journeys; ${outputPath}`))
    .catch((error) => { console.error(`Production smoke failed: ${error.message}`); process.exitCode = 1; });
}
