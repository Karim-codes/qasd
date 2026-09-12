const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLocalRecord } = require('../src/lib/local-record.ts');
const { EMPTY_GUIDE, changeCounter, guideProgress, booleanMap } = require('../src/lib/progress.ts');
const { getHomeAction } = require('../src/lib/home-action.ts');
const { buildSteps, getNextJourneyStep } = require('../src/lib/journey.ts');
const { EMPTY_ITINERARY } = require('../src/lib/sample-data.ts');
const { parseDate } = require('../src/lib/date-helpers.ts');
const { EMPTY_CHECKLIST } = require('../src/lib/checklist.ts');
const { itineraryFromTripRecord, mergeItineraryIntoTripRecord, normalizeItinerary } = require('../src/lib/trip.ts');
const clone = value => structuredClone(value);
function memory() {
  const values = new Map();
  return { values, async getItem(key) { return values.get(key) ?? null; }, async setItem(key, value) { values.set(key, value); } };
}
function date(offset) {
  const value = new Date(); value.setDate(value.getDate() + offset);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
function trip(route = 'makkah-madinah') {
  const value = clone(EMPTY_ITINERARY);
  value.tripType = 'umrah'; value.umrah = { route };
  value.flights.outbound = { ...value.flights.outbound, departureDate: date(-2), arrivalDate: date(-1) };
  value.flights.return = { ...value.flights.return, departureDate: date(8), arrivalDate: date(8) };
  value.hotels.hotel1 = { name: 'Makkah hotel', city: 'Makkah', checkIn: date(-1), checkOut: date(4) };
  value.hotels.hotel2 = { name: 'Madinah hotel', city: 'Madinah', checkIn: date(4), checkOut: date(8) };
  if (route === 'madinah-makkah') {
    value.hotels.hotel1 = { ...value.hotels.hotel1, name: 'Madinah hotel', city: 'Madinah' };
    value.hotels.hotel2 = { ...value.hotels.hotel2, name: 'Makkah hotel', city: 'Makkah' };
  }
  return value;
}

test('counter ignores duplicate taps, clamps at 7, and keeps counters independent', () => {
  let value = changeCounter(clone(EMPTY_GUIDE), 'tawaf', 'add', 1000);
  assert.equal(value.counters.tawaf.count, 1);
  assert.equal(changeCounter(value, 'tawaf', 'add', 1200), value);
  for (let i = 2; i < 12; i++) value = changeCounter(value, 'tawaf', 'add', i * 1000);
  assert.equal(value.counters.tawaf.count, 7);
  assert.equal(value.completed['tawaf-start'], true);
  assert.equal(value.counters.sai.count, 0);
  value = changeCounter(value, 'sai', 'add', 12000);
  value = changeCounter(value, 'tawaf', 'reset', 13000);
  assert.equal(value.counters.sai.count, 1);
  assert.equal(value.counters.tawaf.count, 0);
  assert.equal(changeCounter(value, 'tawaf', 'undo', 14000), value);
});
test('undo invalidates completed ritual and final completion', () => {
  const value = clone(EMPTY_GUIDE);
  value.counters.tawaf.count = 7; value.completed = { 'tawaf-start': true, complete: true };
  const next = changeCounter(value, 'tawaf', 'undo', 1000);
  assert.equal(next.counters.tawaf.count, 6);
  assert.equal(next.completed['tawaf-start'], false);
  assert.equal(next.completed.complete, false);
});
test('late hydration cannot overwrite new taps because editing waits for restore', async () => {
  const storage = memory();
  let release;
  storage.getItem = () => new Promise(resolve => { release = resolve; });
  const record = createLocalRecord(storage, 'guide', clone(EMPTY_GUIDE), guideProgress);
  const loading = record.hydrate();
  assert.equal(await record.update(value => changeCounter(value, 'tawaf', 'add', 1000)), false);
  const saved = clone(EMPTY_GUIDE); saved.counters.tawaf.count = 4;
  release(JSON.stringify(saved)); await loading;
  assert.equal(record.getSnapshot().value.counters.tawaf.count, 4);
});
test('serialized rapid updates survive a new record (app restart)', async () => {
  const storage = memory();
  const record = createLocalRecord(storage, 'guide:a', clone(EMPTY_GUIDE), guideProgress);
  await record.hydrate();
  const updates = Array.from({ length: 5 }, (_, i) => record.update(value => changeCounter(value, 'sai', 'add', (i + 1) * 1000)));
  await Promise.all(updates);
  const restored = createLocalRecord(storage, 'guide:a', clone(EMPTY_GUIDE), guideProgress);
  await restored.hydrate();
  assert.equal(restored.getSnapshot().value.counters.sai.count, 5);
  const separate = createLocalRecord(storage, 'guide:b', clone(EMPTY_GUIDE), guideProgress);
  await separate.hydrate();
  assert.equal(separate.getSnapshot().value.counters.sai.count, 0);
});
test('failed write stays visibly unsaved, retry persists the latest count', async () => {
  const storage = memory(); const originalWrite = storage.setItem;
  storage.setItem = async () => { throw new Error('disk full'); };
  const record = createLocalRecord(storage, 'guide', clone(EMPTY_GUIDE), guideProgress);
  await record.hydrate();
  assert.equal(await record.update(value => changeCounter(value, 'tawaf', 'add', 1000)), false);
  assert.match(record.getSnapshot().error, /not saved/);
  storage.setItem = originalWrite;
  await record.retry();
  assert.equal(record.getSnapshot().error, null);
  assert.equal(JSON.parse(storage.values.get('guide')).counters.tawaf.count, 1);
});
test('corrupt persisted counts stay protected until a successful read', async () => {
  const storage = memory(); storage.values.set('guide', '{bad json');
  const record = createLocalRecord(storage, 'guide', clone(EMPTY_GUIDE), guideProgress);
  await record.hydrate(); assert.equal(record.getSnapshot().ready, false);
  assert.equal(await record.update(() => clone(EMPTY_GUIDE)), false);
  storage.values.set('guide', JSON.stringify(EMPTY_GUIDE)); await record.retry();
  assert.equal(record.getSnapshot().ready, true);
  assert.throws(() => guideProgress({ ...EMPTY_GUIDE, counters: { ...EMPTY_GUIDE.counters, tawaf: { count: 8, changedAt: 0 } } }));
});
test('bookmarks and journey completions survive restart', async () => {
  const storage = memory();
  for (const key of ['bookmarks', 'journey']) {
    const record = createLocalRecord(storage, key, {}, booleanMap); await record.hydrate();
    await record.update(value => ({ ...value, saved: true }));
    const restored = createLocalRecord(storage, key, {}, booleanMap); await restored.hydrate();
    assert.equal(restored.getSnapshot().value.saved, true);
  }
});
test('legacy local progress migrates once into the trip and pilgrim scoped key', async () => {
  const storage = memory();
  storage.values.set('old-progress', JSON.stringify({ saved: true }));
  const record = createLocalRecord(storage, 'new-progress', {}, booleanMap, ['old-progress']);
  await record.hydrate();
  assert.equal(record.getSnapshot().value.saved, true);
  assert.deepEqual(JSON.parse(storage.values.get('new-progress')), { saved: true });
});
test('onboarding itinerary normalizes without asking for trip data again', () => {
  const value = trip('madinah-makkah');
  value.localId = 'trip-1'; value.pilgrim.name = 'Karim';
  value.flights.outbound.arrivalCity = 'Jeddah (JED)';
  const record = normalizeItinerary(value, new Date('2026-01-01T00:00:00Z'));
  assert.equal(record.schemaVersion, 2);
  assert.equal(record.pilgrims[record.trip.primaryPilgrimId].name, 'Karim');
  assert.equal(record.trip.flights[0].arrivalTimeZone, 'Asia/Riyadh');
  assert.deepEqual(record.trip.stays.map(stay => stay.kind), ['madinah', 'makkah']);
  assert.equal(itineraryFromTripRecord(record).umrah.route, 'madinah-makkah');
  record.trip.journeyEvents.push({ id: 'operator-1', type: 'custom', title: 'Meet your group', source: 'operator' });
  const edited = itineraryFromTripRecord(record); edited.pilgrim.name = 'Karim A';
  const merged = mergeItineraryIntoTripRecord(record, edited);
  assert.equal(merged.trip.journeyEvents[0].id, 'operator-1');
  assert.equal(merged.pilgrims[merged.trip.primaryPilgrimId].name, 'Karim A');
});
test('home and journey use the same next step and advance after hotel completion', () => {
  const value = trip(); const completed = {};
  const steps = buildSteps(value).phases.flatMap(phase => phase.steps);
  assert.equal(getNextJourneyStep(steps, completed).id, 'hotel-makkah');
  assert.equal(getHomeAction(value, completed, EMPTY_GUIDE).journeyStep, 'hotel-makkah');
  completed['hotel-makkah'] = true;
  assert.equal(getNextJourneyStep(steps, completed).id, 'umrah-rites');
  assert.equal(getHomeAction(value, completed, EMPTY_GUIDE).step, 'ihram');
});
test('active ritual stays above an ordinary tomorrow flight', () => {
  const value = trip(); const progress = changeCounter(clone(EMPTY_GUIDE), 'tawaf', 'add', 1000);
  assert.equal(getHomeAction(value, {}, progress).step, 'tawaf-start');
  value.flights.return.departureDate = date(1);
  assert.equal(getHomeAction(value, {}, progress).title, 'Continue Tawaf');
});
test('a reliably timed flight within six hours can override an active ritual', () => {
  const value = trip(); const progress = changeCounter(clone(EMPTY_GUIDE), 'tawaf', 'add', 1000);
  value.flights.return = {
    ...value.flights.return,
    departureCity: 'Madinah (MED)', departureDate: '2026-09-11', departureTime: '14:00', departureTimeZone: 'Asia/Riyadh',
  };
  const action = getHomeAction(value, {}, progress, new Date('2026-09-11T10:00:00Z'));
  assert.equal(action.journeyStep, 'depart-saudi');
});
test('preparation checklist feeds the Home action engine', () => {
  const value = trip();
  value.flights.outbound.departureDate = date(5);
  value.hotels.hotel1.checkIn = date(6); value.hotels.hotel1.checkOut = date(8);
  value.hotels.hotel2.checkIn = date(8); value.hotels.hotel2.checkOut = date(10);
  const checklist = clone(EMPTY_CHECKLIST);
  checklist.completed = { passport: true, visa: true };
  const action = getHomeAction(value, {}, EMPTY_GUIDE, new Date(), checklist);
  assert.equal(action.route, '/checklist');
  assert.match(action.detail, /2 of 10/);
});
test('Home resumes the next saved guide step when no urgent travel action exists', () => {
  const value = trip(); const guide = clone(EMPTY_GUIDE);
  guide.completed = { ihram: true };
  const action = getHomeAction(value, { 'hotel-makkah': true }, guide);
  assert.equal(action.step, 'enter-masjid');
});
test('Madinah-first Ihram advice uses trip order without claiming Miqat proximity', () => {
  const value = trip('madinah-makkah');
  value.hotels.hotel2.checkIn = date(1);
  const action = getHomeAction(value, {}, EMPTY_GUIDE);
  assert.equal(action.title, 'Prepare for Ihram');
  assert.match(action.detail, /Madinah to Makkah/);
  assert.doesNotMatch(action.detail, /approaching Miqat/i);
});
test('Madinah-first route stays in city order, browsing does not begin a ritual', () => {
  const value = trip('madinah-makkah'); const progress = clone(EMPTY_GUIDE); progress.lastStep = 'sai-laps';
  const action = getHomeAction(value, {}, progress);
  assert.equal(action.journeyStep, 'hotel-madinah');
  assert.equal(action.route, '/stays');
});
test('Makkah-only setup omits Madinah and completed trip shows review', () => {
  const value = trip('makkah-only'); value.hotels.hotel2 = clone(EMPTY_ITINERARY.hotels.hotel2);
  assert.ok(!buildSteps(value).phases.some(phase => phase.id === 'madinah'));
  value.flights.return.arrivalDate = date(-1);
  assert.equal(getHomeAction(value, {}, EMPTY_GUIDE).eyebrow, 'Back home');
});
test('missing dates and Hajj itineraries produce navigable fallbacks', () => {
  const value = clone(EMPTY_ITINERARY);
  assert.equal(getHomeAction(value, {}, EMPTY_GUIDE).route, '/(tabs)/flights');
  value.tripType = 'hajj'; value.hajj = { arafahDate: date(1) };
  const steps = buildSteps(value).phases.flatMap(phase => phase.steps);
  assert.equal(steps.find(step => step.id === 'tarwiyah').status, 'active');
  const done = Object.fromEntries(steps.filter(step => step.id !== 'tarwiyah').map(step => [step.id, true]));
  assert.equal(getHomeAction(value, done, EMPTY_GUIDE).route, '/hajj-guide');
});
test('calendar dates do not shift to the previous day in western timezones', () => {
  const previous = process.env.TZ; process.env.TZ = 'America/Los_Angeles';
  try { assert.equal(parseDate('2026-09-05').getDate(), 5); assert.equal(parseDate('2026-02-31'), null); }
  finally { process.env.TZ = previous; }
});
