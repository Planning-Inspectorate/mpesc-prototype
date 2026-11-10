const { test } = require('node:test');
const assert = require('node:assert/strict');
const { countSubfolderFiles } = require('../app/helpers');

test('counts descendant files without including the current folder', () => {
  const folder = {
    documents: [{ id: 'parent' }],
    subfolders: [
      { documents: [{ id: 'one' }, { id: 'two' }], subfolders: [{ documents: [{ id: 'three' }] }] },
      { subfolders: [{ documents: [{ id: 'four' }] }, {}] }
    ]
  };
  assert.equal(countSubfolderFiles(folder), 4);
});

test('counts empty and missing subfolder lists', () => {
  assert.equal(countSubfolderFiles({}), 0);
  assert.equal(countSubfolderFiles({ subfolders: [{}, { documents: [] }] }), 0);
});
