const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  OFFICIAL_UMRAH_PAGE_NUMBERS, officialGuidePage, initialGuideReaderState,
  officialGuideReaderReducer: reduce, guideTextParagraphs,
} = require('../src/lib/official-umrah-reader.ts');
const sourceText = require('../assets/guides/en_omrah-text.json');

test('reader skips only the blank source page and retains cover, conclusion and back cover', () => {
  const visited = [];
  let state = initialGuideReaderState();
  for (let i = 0; i < 12; i++) {
    visited.push(state.page);
    state = reduce(state, { type: 'next' });
  }
  assert.deepEqual(visited, [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.equal(state.page, 13);
  assert.ok(sourceText[11].includes('completed, and all praise is due to Allah.'));
  for (const page of visited) {
    const image = fs.readFileSync(path.join(__dirname, `../assets/guides/umrah-page-${String(page).padStart(2, '0')}.jpg`));
    assert.equal(image.readUInt16BE(0), 0xffd8, `source page ${page} has a bundled JPEG`);
  }
});

test('lesson links keep their source page numbers after removing the blank page', () => {
  for (const page of [4, 6, 7, 8, 9, 10, 11, 12]) assert.equal(officialGuidePage(String(page)), page);
  assert.equal(officialGuidePage('2'), 3);
  assert.equal(officialGuidePage('999'), 13);
  for (const value of [undefined, 'bad', '3.5', '-1', '0']) assert.equal(officialGuidePage(value), 1);
  assert.equal(OFFICIAL_UMRAH_PAGE_NUMBERS.length, 12);
});

test('enlarging an original page switches to text, and size and view survive page changes', () => {
  let state = initialGuideReaderState('9');
  state = reduce(state, { type: 'increase-text' });
  assert.equal(state.textMode, true);
  assert.equal(state.textScale, 1.25);
  state = reduce(state, { type: 'next' });
  assert.deepEqual(state, { page: 10, textMode: true, textScale: 1.25 });
  state = reduce(state, { type: 'previous' });
  assert.deepEqual(state, { page: 9, textMode: true, textScale: 1.25 });
  state = reduce(state, { type: 'toggle-view' });
  assert.equal(state.textScale, 1.25);
  assert.equal(state.textMode, false);
  state = reduce(state, { type: 'toggle-view' });
  assert.equal(state.textScale, 1.25);
});

test('visiting either cover does not reset a reader’s text size', () => {
  let state = reduce(initialGuideReaderState('12'), { type: 'increase-text' });
  state = reduce(state, { type: 'next' });
  assert.deepEqual(state, { page: 13, textMode: true, textScale: 1.25 });
  state = reduce(state, { type: 'previous' });
  assert.deepEqual(state, { page: 12, textMode: true, textScale: 1.25 });
  state = { ...state, page: 3 };
  state = reduce(state, { type: 'previous' });
  assert.equal(state.page, 1);
  assert.equal(state.textScale, 1.25);
  assert.equal(reduce(state, { type: 'previous' }).page, 1);
});

test('text sizing is bounded and print line breaks reflow into real paragraphs', () => {
  let state = initialGuideReaderState('4');
  for (let i = 0; i < 20; i++) state = reduce(state, { type: 'increase-text' });
  assert.equal(state.textScale, 2.5);
  for (let i = 0; i < 20; i++) state = reduce(state, { type: 'decrease-text' });
  assert.equal(state.textScale, 1);
  assert.deepEqual(guideTextParagraphs('First line\ncontinues here.\n   Second paragraph with al-\nKafirun.\n\n        9', 9), ['First line continues here.', 'Second paragraph with al-Kafirun.']);
  for (const page of OFFICIAL_UMRAH_PAGE_NUMBERS.filter(page => page !== 1 && page !== 13)) {
    const paragraphs = guideTextParagraphs(sourceText[page - 1], page);
    assert.ok(paragraphs.length > 0);
    assert.ok(paragraphs.every(paragraph => !paragraph.includes('\n')));
    assert.notEqual(paragraphs.at(-1), String(page));
  }
});
