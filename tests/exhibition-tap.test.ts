// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { registerTap } from '../src/scripts/exhibition/tap.ts';
import type { Pick } from '../src/lib/exhibition/types.ts';

function harness() {
  const target = new EventTarget();
  const state = { picks: [] as Pick[], hits: 0, scrollY: 0, overCanvas: true, mounted: true, pick: { id: 'exhibit-featured-client', kind: 'exhibit', name: 'Eiffel Technologies', action: 'View Eiffel Technologies', stopIndex: 1, slug: 'featured-client' } as Pick | null };
  const listeners: { type: string; passive: boolean }[] = [];
  const add = target.addEventListener.bind(target);
  target.addEventListener = (type, listener, options) => {
    listeners.push({ type, passive: typeof options === 'object' && options.passive === true });
    add(type, listener, options);
  };
  Object.defineProperty(target, 'scrollY', { get: () => state.scrollY });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: target });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    elementFromPoint: () => state.overCanvas ? { matches: () => true } : null,
  } });
  registerTap(() => state.mounted ? { pick: () => { state.hits++; return state.pick; } } : null, (pick) => state.picks.push(pick));
  const pointer = (type: string, overrides: Partial<PointerEvent> = {}) => {
    const event = new Event(type);
    const values = { pointerId: 1, isPrimary: true, button: 0, clientX: 100, clientY: 100, timeStamp: 0, ...overrides };
    for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });
    target.dispatchEvent(event);
  };
  return { state, listeners, pointer, target };
}

test('a tap at every inclusive threshold delivers the scene pick exactly once', () => {
  const h = harness();
  h.pointer('pointerdown');
  h.pointer('pointermove', { clientX: 106, clientY: 108 });
  h.state.scrollY = 4;
  h.pointer('pointerup', { clientX: 106, clientY: 108, timeStamp: 500 });
  assert.equal(h.state.hits, 1);
  assert.deepEqual(h.state.picks.map((pick) => pick.id), ['exhibit-featured-client']);
});

const failures: [string, (h: ReturnType<typeof harness>) => void][] = [
  ['long press', (h) => h.pointer('pointerup', { timeStamp: 501 })],
  ['maximum excursion even after returning to the origin', (h) => { h.pointer('pointermove', { clientX: 111 }); h.pointer('pointermove'); h.pointer('pointerup'); }],
  ['release movement without a move event', (h) => h.pointer('pointerup', { clientY: 111 })],
  ['scroll displacement without an event', (h) => { h.state.scrollY = 5; h.pointer('pointerup'); }],
  ['momentum scroll even with no net displacement', (h) => { h.target.dispatchEvent(new Event('scroll')); h.pointer('pointerup'); }],
  ['second pointer even after it is released', (h) => { h.pointer('pointerdown', { pointerId: 2, isPrimary: false }); h.pointer('pointerup', { pointerId: 2, isPrimary: false }); h.pointer('pointerup'); }],
  ['another primary pointer from a different device', (h) => { h.pointer('pointerdown', { pointerId: 2 }); h.pointer('pointerup', { pointerId: 2 }); h.pointer('pointerup'); }],
  ['pointer cancellation', (h) => { h.pointer('pointercancel'); h.pointer('pointerup'); }],
  ['leaving then reentering the canvas', (h) => { h.state.overCanvas = false; h.pointer('pointermove'); h.state.overCanvas = true; h.pointer('pointerup'); }],
  ['leaving the viewport without another move', (h) => { h.state.overCanvas = false; h.pointer('pointerout'); h.state.overCanvas = true; h.pointer('pointerup'); }],
  ['release outside the canvas', (h) => { h.state.overCanvas = false; h.pointer('pointerup'); }],
  ['release of an unrelated pointer', (h) => h.pointer('pointerup', { pointerId: 2 })],
  ['nonprimary release', (h) => h.pointer('pointerup', { isPrimary: false })],
  ['lost window focus', (h) => { h.target.dispatchEvent(new Event('blur')); h.pointer('pointerup'); }],
];
for (const [reason, finish] of failures) {
  test(`rejects ${reason} before asking the scene to hit-test`, () => {
    const h = harness();
    h.pointer('pointerdown');
    finish(h);
    assert.equal(h.state.picks.length, 0);
    assert.equal(h.state.hits, 0);
  });
}

test('an ordinary DOM target, nonprimary press, or secondary mouse button cannot begin a tap', () => {
  for (const mode of ['dom', 'nonprimary', 'secondary']) {
    const h = harness();
    h.state.overCanvas = mode !== 'dom';
    h.pointer('pointerdown', { isPrimary: mode !== 'nonprimary', button: mode === 'secondary' ? 2 : 0 });
    h.state.overCanvas = true;
    h.pointer('pointerup');
    assert.equal(h.state.hits, 0);
  }
});

test('still view or tapping empty sky delivers no pick', () => {
  for (const mode of ['still', 'miss']) {
    const h = harness();
    h.state.mounted = mode !== 'still';
    if (mode === 'miss') h.state.pick = null;
    h.pointer('pointerdown');
    h.pointer('pointerup');
    assert.equal(h.state.picks.length, 0);
  }
});

test('toys and arrows without a project slug are delivered unchanged', () => {
  const h = harness();
  h.state.pick = { id: 'persistence', kind: 'toy', name: 'Soft clocks', action: 'Turn back time' };
  h.pointer('pointerdown');
  h.pointer('pointerup');
  assert.deepEqual(h.state.picks, [{ id: 'persistence', kind: 'toy', name: 'Soft clocks', action: 'Turn back time' }]);
});

test('unsafe project slugs are rejected before the pick is used', () => {
  for (const slug of ['bad"], a', '../featured-client', 'Featured-client', '-featured', 'featured--client', '']) {
    const h = harness();
    h.state.pick = { id: 'exhibit-x', kind: 'exhibit', name: 'X', action: 'View X', stopIndex: 1, slug };
    h.pointer('pointerdown');
    h.pointer('pointerup');
    assert.equal(h.state.picks.length, 0);
  }
});

test('a cancelled multi-pointer gesture cannot restart until every pointer is released', () => {
  const h = harness();
  h.pointer('pointerdown');
  h.pointer('pointerdown', { pointerId: 2, isPrimary: false });
  h.pointer('pointerup');
  h.pointer('pointerdown');
  h.pointer('pointerup');
  assert.equal(h.state.picks.length, 0);
  h.pointer('pointerup', { pointerId: 2, isPrimary: false });
  h.pointer('pointerdown');
  h.pointer('pointerup');
  assert.equal(h.state.picks.length, 1);
});

test('every gesture listener is passive and no wheel or touch listener is installed', () => {
  const h = harness();
  assert.deepEqual(h.listeners.map(({ type }) => type), ['pointerdown', 'pointermove', 'pointerout', 'scroll', 'pointercancel', 'blur', 'pointerup']);
  assert.ok(h.listeners.every(({ passive }) => passive));
});
