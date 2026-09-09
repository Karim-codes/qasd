const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const values = new Map();
const writes = [];
const memory = {
  async getItem(key) { return values.get(key) ?? null; },
  async setItem(key, value) { writes.push(JSON.parse(value).pilgrim?.name); values.set(key, value); },
  async multiRemove(keys) { keys.forEach(key => values.delete(key)); },
};
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return { default: memory };
  if (request === 'expo-file-system/legacy') return { cacheDirectory: null };
  return originalLoad.call(this, request, parent, isMain);
};
const storage = require('../src/lib/storage.ts');
Module._load = originalLoad;
const { EMPTY_ITINERARY } = require('../src/lib/sample-data.ts');

test('legacy trip retains a stable identity and sanitizes retired sensitive fields', async () => {
  values.clear();
  values.set('@rawaf_itinerary', JSON.stringify({ ...EMPTY_ITINERARY, visa: { imageUri: 'old' }, documents: [] }));
  const trip = await storage.loadItinerary();
  assert.equal(trip.localId, 'legacy');
  assert.equal(trip.visa, undefined);
  assert.equal(trip.documents, undefined);
  assert.equal(JSON.parse(values.get('@rawaf_itinerary')).localId, 'legacy');
});
test('corrupt original backup does not hide current offline itinerary', async () => {
  values.clear();
  values.set('@rawaf_itinerary', JSON.stringify({ ...EMPTY_ITINERARY, localId: 'current' }));
  values.set('@rawaf_itinerary_original', 'invalid json');
  assert.equal((await storage.loadItinerary()).localId, 'current');
});
test('rapid itinerary edits persist in order and clear waits for pending writes', async () => {
  values.clear(); writes.length = 0;
  const first = { ...EMPTY_ITINERARY, localId: 'trip', pilgrim: { ...EMPTY_ITINERARY.pilgrim, name: 'First edit' } };
  const second = { ...first, pilgrim: { ...first.pilgrim, name: 'Second edit' } };
  const saving = [storage.saveItinerary(first), storage.saveItinerary(second)];
  first.pilgrim.name = 'Mutation after save';
  assert.deepEqual(await Promise.all(saving), [true, true]);
  assert.deepEqual(writes, ['First edit', 'Second edit']);
  assert.equal((await storage.loadItinerary()).pilgrim.name, 'Second edit');
  const pending = storage.saveItinerary(second);
  await storage.clearItinerary(); await pending;
  assert.equal(values.has('@rawaf_itinerary'), false);
});
