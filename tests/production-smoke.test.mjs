import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runProductionSmoke } from '../scripts/production-smoke.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const contentType = (file) => ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf' })[extname(file)] ?? 'application/octet-stream';

async function serve(root, overrides = new Map()) {
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const path = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const relative = path.slice(1);
    if (!relative || relative.includes('..')) { response.writeHead(400).end(); return; }
    try {
      const override = overrides.get(pathname);
      if (override?.status) { response.writeHead(override.status).end(); return; }
      const body = override?.body ?? await readFile(join(root, relative));
      response.writeHead(200, { 'content-type': override?.type ?? contentType(path), 'cache-control': 'no-store' });
      response.end(body);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { baseUrl: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise((done) => server.close(done)) };
}

const report = async () => join(await mkdtemp(join(tmpdir(), 'production-smoke-report-')), 'report.json');

test('checked artifact passes HTTP hashes, direct routes and browser journeys on loopback', async () => {
  const server = await serve(dist);
  try {
    const result = await runProductionSmoke({ baseUrl: server.baseUrl, distRoot: dist, outputPath: await report() });
    assert.equal(result.ok, true);
    assert.ok(result.filesChecked >= 10);
    assert.deepEqual(result.projectSlugs, ['featured-client', 'portfolio']);
    assert.equal(result.browserChecks.phoneStillAndOptIn, true);
    assert.equal(result.browserChecks.noJavaScriptRoutes, true);
  } finally { await server.close(); }
});

test('remote plain HTTP is rejected before any network request', async () => {
  await assert.rejects(runProductionSmoke({ baseUrl: 'http://example.com/', distRoot: dist, outputPath: await report() }), /HTTPS/i);
});

test('a 200 fallback page at a direct project URL is rejected by artifact hash', async () => {
  const root = await readFile(join(dist, 'index.html'));
  const server = await serve(dist, new Map([['/projects/portfolio/', { body: root, type: 'text/html' }]]));
  try {
    await assert.rejects(runProductionSmoke({ baseUrl: server.baseUrl, distRoot: dist, outputPath: await report() }), /hash|mismatch|portfolio/i);
  } finally { await server.close(); }
});

test('a missing direct route and a stale page cannot pass', async () => {
  const old = await readFile(join(dist, 'projects/featured-client/index.html'), 'utf8');
  const server = await serve(dist, new Map([['/projects/portfolio/', { status: 404 }], ['/projects/featured-client/', { body: old.replace('Three contracts', 'Older release'), type: 'text/html' }]]));
  try {
    await assert.rejects(runProductionSmoke({ baseUrl: server.baseUrl, distRoot: dist, outputPath: await report() }), /404|hash|mismatch/i);
  } finally { await server.close(); }
});

test('wrong image bytes, PDF bytes and PDF content type are rejected', async () => {
  const files = await import('node:fs/promises').then((fs) => fs.readdir(join(dist, '_astro')));
  const image = files.find((name) => name.endsWith('.webp'));
  assert.ok(image);
  for (const [path, override] of [
    [`/_astro/${image}`, { body: Buffer.from('not the checked image'), type: 'image/webp' }],
    ['/resume/william-castle-resume.pdf', { body: Buffer.from('%PDF-1.7\nnot the checked resume'), type: 'application/pdf' }],
    ['/resume/william-castle-resume.pdf', { type: 'text/html' }],
  ]) {
    const server = await serve(dist, new Map([[path, override]]));
    try {
      await assert.rejects(runProductionSmoke({ baseUrl: server.baseUrl, distRoot: dist, outputPath: await report() }), /hash|mismatch|content.type|PDF/i);
    } finally { await server.close(); }
  }
});

test('broken return and contact destinations fail even when remote hashes match modified local files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'production-smoke-broken-'));
  await cp(dist, root, { recursive: true });
  const project = join(root, 'projects/portfolio/index.html');
  await writeFile(project, (await readFile(project, 'utf8')).replace('/#exhibit-portfolio', '/#missing-exhibit'));
  const home = join(root, 'index.html');
  await writeFile(home, (await readFile(home, 'utf8')).replace('mailto:castlew640@gmail.com', 'mailto:wrong@example.invalid'));
  const server = await serve(root);
  try {
    await assert.rejects(runProductionSmoke({ baseUrl: server.baseUrl, distRoot: root, outputPath: await report() }), /return|contact|email|exhibit|destination/i);
  } finally { await server.close(); }
});
