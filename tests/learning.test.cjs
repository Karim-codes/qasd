const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLocalRecord } = require('../src/lib/local-record.ts');
const { EMPTY_LEARNING, learningProgress } = require('../src/lib/learning.ts');
const { EMPTY_GUIDE, guideProgress, changeCounter } = require('../src/lib/progress.ts');
const { EMPTY_CHECKLIST, checklistProgress } = require('../src/lib/checklist.ts');
const { LEARNING_PROGRESS_KEY, PRACTICE_PROGRESS_KEY, GUEST_CHECKLIST_KEY, tripProgressKey } = require('../src/lib/progress-keys.ts');
const { carryPreparationToTrip } = require('../src/lib/preparation-storage.ts');
const { EMPTY_ITINERARY } = require('../src/lib/sample-data.ts');
const { UMRAH_STEPS } = require('../src/lib/umrah-steps.ts');
const { getHomeAction } = require('../src/lib/home-action.ts');
const { learningResumeIndex, nextLearningIndex, learningTitle, UMRAH_CHAPTERS } = require('../src/lib/umrah-learning.ts');

test('a new learner starts at Ihram even after browsing the final topic', () => {
  assert.equal(nextLearningIndex({ reviewed: {}, lastStep: 'complete' }), 0);
  assert.equal(learningResumeIndex({ reviewed: {}, lastStep: 'complete' }), 11);
  assert.equal(learningTitle(UMRAH_STEPS.at(-1)), 'Completing Umrah');
});

test('resume reading uses browsing history, while continuation uses the first unreviewed topic', () => {
  assert.equal(learningResumeIndex({ reviewed: { ihram: true }, lastStep: 'sai-start' }), 8);
  assert.equal(nextLearningIndex({ reviewed: { ihram: true }, lastStep: 'sai-start' }), 1);
  assert.equal(learningResumeIndex({ reviewed: { ihram: true }, lastStep: 'ihram' }), 0);
  assert.equal(learningResumeIndex({ reviewed: { ihram: true }, lastStep: 'removed-topic' }), null);
  assert.equal(nextLearningIndex({ reviewed: { ihram: true }, lastStep: 'removed-topic' }), 1);
  const reviewed = Object.fromEntries(UMRAH_STEPS.map(step => [step.id, true]));
  assert.equal(learningResumeIndex({ reviewed, lastStep: 'complete' }), 11);
  assert.equal(learningResumeIndex({ reviewed, lastStep: 'removed-topic' }), null);
  assert.equal(nextLearningIndex({ reviewed, lastStep: 'complete' }), null);
});

test('three reviewed topics never recommend the last chapter as the next learning topic', () => {
  const progress = { reviewed: { ihram: true, 'enter-masjid': true, 'first-sight': true }, lastStep: 'complete' };
  assert.equal(learningResumeIndex(progress), 11);
  assert.equal(nextLearningIndex(progress), 3);
  progress.reviewed['tawaf-start'] = true;
  assert.equal(nextLearningIndex(progress), 4);
});

test('unknown review IDs and unreviewed holes do not skip required learning positions', () => {
  assert.equal(nextLearningIndex({ reviewed: { 'old-topic': true, complete: true }, lastStep: '' }), 0);
  assert.equal(learningResumeIndex(EMPTY_LEARNING), null);
  assert.equal(nextLearningIndex(EMPTY_LEARNING), 0);
});

test('the simplified overview covers every existing topic once, in ritual order', () => {
  assert.deepEqual(UMRAH_CHAPTERS.flatMap(chapter => chapter.indices), UMRAH_STEPS.map((_, index) => index));
});

function memory() {
  const values = new Map();
  return { values, async getItem(key) { return values.get(key) ?? null; }, async setItem(key, value) { values.set(key, value); } };
}
const learningRecord = storage => createLocalRecord(storage, LEARNING_PROGRESS_KEY, structuredClone(EMPTY_LEARNING), learningProgress);
const ritualRecord = (storage, tripId, pilgrimId) => createLocalRecord(storage, tripProgressKey(tripId, pilgrimId, 'guide'), structuredClone(EMPTY_GUIDE), guideProgress);

test('learning and practice survive restart without starting or changing a real ritual', async () => {
  const storage = memory();
  const lessons = learningRecord(storage);
  const practice = createLocalRecord(storage, PRACTICE_PROGRESS_KEY, structuredClone(EMPTY_GUIDE), guideProgress);
  const ritual = ritualRecord(storage, 'existing-trip', 'pilgrim');
  await Promise.all([lessons.hydrate(), practice.hydrate(), ritual.hydrate()]);
  await ritual.update(value => changeCounter(value, 'sai', 'add', 1000));
  await lessons.update(value => ({ ...value, lastStep: 'tawaf-start', reviewed: Object.fromEntries(UMRAH_STEPS.map(step => [step.id, true])) }));
  await practice.update(value => changeCounter(value, 'tawaf', 'add', 1000));
  await practice.update(value => changeCounter(value, 'tawaf', 'add', 2000));

  const restoredLessons = learningRecord(storage);
  const restoredRitual = ritualRecord(storage, 'existing-trip', 'pilgrim');
  const restoredPractice = createLocalRecord(storage, PRACTICE_PROGRESS_KEY, structuredClone(EMPTY_GUIDE), guideProgress);
  await Promise.all([restoredLessons.hydrate(), restoredRitual.hydrate(), restoredPractice.hydrate()]);
  assert.equal(restoredLessons.getSnapshot().value.lastStep, 'tawaf-start');
  assert.equal(Object.values(restoredLessons.getSnapshot().value.reviewed).filter(Boolean).length, 12);
  assert.equal(restoredPractice.getSnapshot().value.counters.tawaf.count, 2);
  assert.equal(restoredRitual.getSnapshot().value.counters.sai.count, 1);
  assert.equal(restoredRitual.getSnapshot().value.counters.tawaf.count, 0);
  assert.deepEqual(restoredRitual.getSnapshot().value.completed, {});
});

test('adding a first trip retains guest preparation and global learning without copying practice into rituals', async () => {
  const storage = memory();
  const guest = createLocalRecord(storage, GUEST_CHECKLIST_KEY, structuredClone(EMPTY_CHECKLIST), checklistProgress);
  const lessons = learningRecord(storage);
  await Promise.all([guest.hydrate(), lessons.hydrate()]);
  await guest.update(value => ({ ...value, completed: { passport: true, 'custom-family': true }, customItems: [{ id: 'custom-family', title: 'Call family', source: 'pilgrim' }] }));
  await lessons.update(value => ({ ...value, lastStep: 'sai-start', reviewed: { ihram: true } }));
  await storage.setItem(PRACTICE_PROGRESS_KEY, JSON.stringify(changeCounter(structuredClone(EMPTY_GUIDE), 'sai', 'add', 1000)));

  await carryPreparationToTrip(storage, 'new-trip', 'new-pilgrim');
  const tripChecklist = createLocalRecord(storage, tripProgressKey('new-trip', 'new-pilgrim', 'checklist'), EMPTY_CHECKLIST, checklistProgress);
  const newRitual = ritualRecord(storage, 'new-trip', 'new-pilgrim');
  const restoredLessons = learningRecord(storage);
  await Promise.all([tripChecklist.hydrate(), newRitual.hydrate(), restoredLessons.hydrate()]);
  assert.equal(tripChecklist.getSnapshot().value.completed.passport, true);
  assert.equal(tripChecklist.getSnapshot().value.customItems[0].title, 'Call family');
  assert.equal(restoredLessons.getSnapshot().value.lastStep, 'sai-start');
  assert.deepEqual(newRitual.getSnapshot().value, EMPTY_GUIDE);
  assert.equal(JSON.parse(storage.values.get(PRACTICE_PROGRESS_KEY)).counters.sai.count, 1);
});

test('guest preparation never overwrites an existing trip checklist', async () => {
  const storage = memory();
  await storage.setItem(GUEST_CHECKLIST_KEY, JSON.stringify({ completed: { passport: true }, customItems: [] }));
  const key = tripProgressKey('saved-trip', 'pilgrim', 'checklist');
  const original = JSON.stringify({ completed: { medication: true }, customItems: [] });
  await storage.setItem(key, original);
  await carryPreparationToTrip(storage, 'saved-trip', 'pilgrim');
  assert.equal(await storage.getItem(key), original);
});

test('preparation outranks a distant flight, while actual counter resume explicitly opens Perform', () => {
  const itinerary = structuredClone(EMPTY_ITINERARY);
  itinerary.tripType = 'umrah';
  itinerary.flights.outbound.departureDate = '2026-02-01';
  itinerary.flights.return.arrivalDate = '2026-02-12';
  const now = new Date('2026-01-02T12:00:00Z');
  assert.equal(getHomeAction(itinerary, {}, EMPTY_GUIDE, now).route, '/checklist');
  const active = changeCounter(structuredClone(EMPTY_GUIDE), 'sai', 'add', 1000);
  const action = getHomeAction(itinerary, {}, active, now);
  assert.equal(action.title, 'Continue Sa’i');
  assert.equal(action.destination.params.mode, 'perform');
  assert.equal(action.destination.params.step, 'sai-laps');
});
