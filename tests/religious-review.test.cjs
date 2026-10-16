const { test } = require('node:test');
const assert = require('node:assert/strict');
const { reviewProblems } = require('../scripts/check-religious-review.cjs');

const approved = {
  status: 'approved', reviewerName: 'Test reviewer', reviewerQualifications: 'Test qualification',
  reviewedAt: '2026-01-01', evidenceFile: 'docs/example-sign-off.md', contentSha256: 'reviewed-content',
};

test('a source audit cannot pass the independent scholar release check', () => {
  const pending = { status: 'pending', reviewerName: '', reviewerQualifications: '', reviewedAt: '', evidenceFile: '', contentSha256: '' };
  assert.ok(reviewProblems(pending, 'current-content').some(problem => problem.includes('pending')));
  assert.ok(reviewProblems({ ...approved, status: 'source-checked' }, 'reviewed-content').length);
});

test('review sign-off must identify the reviewer, qualifications and the content version', () => {
  assert.deepEqual(reviewProblems(approved, 'reviewed-content'), []);
  assert.ok(reviewProblems({ ...approved, reviewerQualifications: '' }, 'reviewed-content').length);
  assert.ok(reviewProblems({ ...approved, reviewerName: '' }, 'reviewed-content').length);
  assert.ok(reviewProblems({ ...approved, reviewedAt: '2099-01-01' }, 'reviewed-content').length);
  assert.ok(reviewProblems(approved, 'content-changed-after-review').length);
});
