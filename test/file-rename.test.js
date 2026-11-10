const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getFileNameParts, validateFileName } = require('../app/helpers');

test('separates the last extension and preserves names without extensions', () => {
  assert.deepEqual(getFileNameParts('report.final.pdf'), { baseName: 'report.final', extension: '.pdf' });
  assert.deepEqual(getFileNameParts('report'), { baseName: 'report', extension: '' });
});

test('validates and normalizes filenames without changing the existing extension', () => {
  assert.deepEqual(validateFileName('  New report.pdf  ', '.pdf'), { baseName: 'New report', errorMessage: null });
  assert.deepEqual(validateFileName("Plan (1) & O'Brien", '.pdf'), { baseName: "Plan (1) & O'Brien", errorMessage: null });
  assert.equal(validateFileName('a'.repeat(100), '.pdf').errorMessage, null);
  assert.equal(validateFileName('a'.repeat(101), '.pdf').errorMessage, 'File name must be 100 characters or fewer');
  assert.equal(validateFileName('  ', '.pdf').errorMessage, 'Enter a file name');
  assert.equal(validateFileName('.pdf', '.pdf').errorMessage, 'Enter a file name');
  assert.match(validateFileName("O''Brien", '.pdf').errorMessage, /File name can only include/);
  assert.match(validateFileName('file/name', '.pdf').errorMessage, /File name can only include/);
});
