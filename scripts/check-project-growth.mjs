import { createHash } from 'node:crypto';
import { cp, lstat, mkdtemp, mkdir, readFile, readdir, readlink, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { applyGrowthFixtures } from '../tests/fixtures/projects/entries.mjs';

const checkout = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const count = Number.parseInt(args.get('--count') ?? '10', 10);
const suite = args.get('--suite') ?? 'growth';

if (![0, 1, 10].includes(count)) throw new Error('--count must be one of 0, 1, or 10');
if (!['growth', 'media', 'performance'].includes(suite)) throw new Error('--suite must be growth, media, or performance');
if (suite === 'media' && count < 2) throw new Error('Media fixture requires a personal project; use --count 10');

async function hashPath(path) {
  const hash = createHash('sha256');
  async function visit(current) {
    let stat;
    try { stat = await lstat(current); } catch (error) {
      if (error.code === 'ENOENT') { hash.update('MISSING'); return; }
      throw error;
    }
    const name = relative(checkout, current);
    if (stat.isSymbolicLink()) { hash.update(`${name}:LINK:${await readlink(current)}`); return; }
    if (stat.isDirectory()) {
      hash.update(`${name}:DIR`);
      for (const entry of (await readdir(current)).sort()) await visit(join(current, entry));
      return;
    }
    hash.update(`${name}:FILE:`);
    hash.update(await readFile(current));
  }
  await visit(path);
  return hash.digest('hex');
}

async function copyCheckout(root) {
  const directories = ['src', 'tests', 'scripts', 'public'];
  const files = [
    'astro.config.ts',
    'package.json',
    'package-lock.json',
    'playwright.growth.config.ts',
    'tsconfig.json',
  ];
  for (const directory of directories) {
    await cp(join(checkout, directory), join(root, directory), {
      recursive: true,
      filter: (source) => !['.git', 'dist', '.astro', 'node_modules'].includes(basename(source)),
    });
  }
  for (const file of files) await cp(join(checkout, file), join(root, file));
  await symlink(join(checkout, 'node_modules'), join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');

  const clientFixture = join(root, 'tests/fixtures/projects/featured-client');
  await mkdir(clientFixture, { recursive: true });
  await cp(join(checkout, 'src/content/projects/featured-client'), clientFixture, { recursive: true });
  await cp(
    join(checkout, 'src/content/projects/featured-client/clientScreenshot1.jpg'),
    join(root, 'tests/fixtures/projects/approved-evidence.jpg'),
  );
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${commandArgs.join(' ')} exited with ${code ?? signal}`));
    });
  });
}

async function exerciseScenario({ scenario, scenarioCount, personalOnly }) {
  const root = await mkdtemp(join(tmpdir(), `project-growth-${scenario}-`));
  await copyCheckout(root);
  await applyGrowthFixtures(root, { count: scenarioCount, personalOnly, media: suite === 'media' });
  console.log(`Growth fixture root (${scenario}): ${root}`);
  console.log(`Growth fixture output (${scenario}): ${join(root, 'dist')}`);
  const env = {
    GROWTH_FIXTURE_COUNT: String(scenarioCount),
    GROWTH_FIXTURE_SCENARIO: scenario,
    GROWTH_FIXTURE_SUITE: suite,
  };
  await run('npm', ['run', 'build'], { cwd: root, env });
  await run('node', [
    'node_modules/@playwright/test/cli.js',
    'test',
    '--config=playwright.growth.config.ts',
  ], { cwd: root, env });
  await writeFile(join(root, 'growth-report.json'), `${JSON.stringify({ root, output: join(root, 'dist'), scenario, count: scenarioCount }, null, 2)}\n`);
}

const before = {
  content: await hashPath(join(checkout, 'src/content')),
  dist: await hashPath(join(checkout, 'dist')),
};

try {
  if (suite === 'media') {
    const { chromium } = await import('@playwright/test');
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      const bytes = await readFile(join(checkout, 'tests/fixtures/projects/silent-demo.mp4'));
      const decoded = await page.evaluate(async (base64) => {
        const video = document.createElement('video');
        video.src = `data:video/mp4;base64,${base64}`;
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = () => reject(new Error('Checked-in MP4 cannot decode'));
        });
        await video.play();
        await new Promise((resolve, reject) => {
          video.requestVideoFrameCallback?.(() => resolve());
          setTimeout(() => reject(new Error('MP4 frame decode timed out')), 4000);
        });
        return { width: video.videoWidth, height: video.videoHeight, duration: video.duration };
      }, bytes.toString('base64'));
      if (decoded.width !== 256 || decoded.height !== 144 || decoded.duration <= 0) throw new Error('Unexpected MP4 fixture dimensions or duration');
      console.log(`Chromium decoded checked-in MP4: ${decoded.width}x${decoded.height}, ${decoded.duration.toFixed(2)}s`);
    } finally { await browser.close(); }
    await exerciseScenario({ scenario: `media-count-${count}`, scenarioCount: count, personalOnly: false });
  } else if (suite === 'performance') {
    await exerciseScenario({ scenario: `performance-count-${count}`, scenarioCount: count, personalOnly: false });
  } else {
    await exerciseScenario({ scenario: `count-${count}`, scenarioCount: count, personalOnly: false });
    await exerciseScenario({ scenario: 'personal-only', scenarioCount: 1, personalOnly: true });
  }
} finally {
  const after = {
    content: await hashPath(join(checkout, 'src/content')),
    dist: await hashPath(join(checkout, 'dist')),
  };
  if (before.content !== after.content || before.dist !== after.dist) {
    throw new Error('Growth fixture isolation failure: checkout content or dist changed');
  }
  console.log(`Checkout content hash unchanged: ${after.content}`);
  console.log(`Checkout dist hash unchanged: ${after.dist}`);
}
