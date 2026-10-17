const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

// Content is spread across screens as well as data files. Include all source and
// educational assets so an approval cannot silently survive a content change.
function contentFingerprint(base = root) {
  const hash = createHash('sha256');
  function visit(relative) {
    const full = path.join(base, relative);
    if (fs.statSync(full).isDirectory()) {
      for (const entry of fs.readdirSync(full).sort()) visit(`${relative}/${entry}`);
    } else {
      hash.update(relative).update('\0').update(fs.readFileSync(full)).update('\0');
    }
  }
  for (const directory of ['src', 'assets/guides', 'assets/learning', 'assets/onboarding']) visit(directory);
  return hash.digest('hex');
}

function reviewProblems(review, fingerprint) {
  const problems = [];
  if (review.status !== 'approved') problems.push('Independent scholar approval is pending.');
  for (const field of ['reviewerName', 'reviewerQualifications', 'evidenceFile']) {
    if (typeof review[field] !== 'string' || !review[field].trim()) problems.push(`Missing ${field}.`);
  }
  if (typeof review.reviewedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt)
      || !Number.isFinite(Date.parse(review.reviewedAt)) || review.reviewedAt > new Date().toISOString().slice(0, 10)) problems.push('A valid review date is required.');
  if (review.contentSha256 !== fingerprint) problems.push('The current source and learning assets do not have recorded approval.');
  return problems;
}

if (require.main === module) {
  if (process.argv.includes('--production-only') && process.env.EAS_BUILD_PROFILE !== 'production') {
    console.log('Religious review release check: development/preview build.');
  } else {
    const fingerprint = contentFingerprint();
    if (process.argv.includes('--fingerprint')) console.log(fingerprint);
    else {
      const review = JSON.parse(fs.readFileSync(path.join(root, 'docs/religious-review.json'), 'utf8'));
      const problems = reviewProblems(review, fingerprint);
      const evidence = typeof review.evidenceFile === 'string' ? path.resolve(root, review.evidenceFile) : '';
      if (!evidence.startsWith(`${root}${path.sep}`) || !fs.existsSync(evidence)
          || !fs.statSync(evidence).isFile() || fs.readFileSync(evidence).length === 0) problems.push('The scholar’s written sign-off must be retained in the repository.');
      if (problems.length) {
        console.error(`Production release is blocked:\n${problems.map(problem => `- ${problem}`).join('\n')}\nSee docs/religious-content-review.md. Source checking by Codex is not scholar approval.`);
        process.exitCode = 1;
      } else console.log(`Religious content review recorded for ${review.reviewerName} (${review.reviewedAt}).`);
    }
  }
}

module.exports = { contentFingerprint, reviewProblems };
