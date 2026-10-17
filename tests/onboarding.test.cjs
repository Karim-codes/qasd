const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ONBOARDING_KEY, ONBOARDING_SCREENS, hasCompletedOnboarding, completeOnboarding } = require('../src/lib/onboarding.ts');

function storage(values = new Map()) {
  return { values, getItem: async key => values.get(key) ?? null, setItem: async (key, value) => values.set(key, value) };
}

test('first launch has four introduction screens and completion survives restart', async () => {
  const firstSession = storage();
  assert.equal(ONBOARDING_SCREENS.length, 4);
  assert.equal(await hasCompletedOnboarding(firstSession), false);
  assert.equal(await completeOnboarding(firstSession), true);
  assert.equal(await hasCompletedOnboarding(storage(firstSession.values)), true);
});

test('welcome completion preserves existing trip, learning and preparation records', async () => {
  const existing = new Map([['@qasd_trip_v2', '{"id":"saved-trip"}'], ['@qasd_learning', 'reviewed'], ['@qasd_checklist', 'packed']]);
  const records = storage(new Map(existing));
  await completeOnboarding(records);
  for (const [key, value] of existing) assert.equal(records.values.get(key), value);
  assert.deepEqual([...records.values.keys()].filter(key => !existing.has(key)), [ONBOARDING_KEY]);
});

test('storage errors cannot leave first launch loading or claim a saved preference', async () => {
  const broken = { getItem: async () => { throw new Error('unavailable'); }, setItem: async () => { throw new Error('full'); } };
  assert.equal(await hasCompletedOnboarding(broken), false);
  assert.equal(await completeOnboarding(broken), false);
});
