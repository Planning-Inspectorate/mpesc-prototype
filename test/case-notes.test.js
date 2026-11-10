const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const kitRequire = createRequire(require.resolve('govuk-prototype-kit'));
const express = kitRequire('express');
const router = require('../app/sub-routes/case-notes');

async function withCaseNotes(run) {
  const currentCase = { reference: 'TEST/1', caseNotes: [{ text: 'Original note' }], auditLog: [] };
  const session = { data: { cases: [currentCase] } };
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    req.session = session;
    res.render = (view, model) => res.json({ view, ...model });
    next();
  });
  app.use(router);
  const server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, body) => fetch(base + path, body === undefined ? { redirect: 'manual' } : {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
    redirect: 'manual'
  });
  try {
    await run({ request, currentCase, session });
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

for (const journey of [
  { name: 'main', add: '/cases/add-case-note', base: '/cases/case-notes', home: '/cases/case-details' },
  { name: 'archive', add: '/features-and-components/added/case-notes/add', base: '/features-and-components/added/case-notes', home: '/features-and-components/added/case-notes' }
]) {
  test(`${journey.name} case notes: add, validate, change and remove`, async () => {
    await withCaseNotes(async ({ request, currentCase, session }) => {
      let response = await request(`${journey.add}?ref=TEST/1`, { comment: 'New note' });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('location'), `${journey.home}?ref=TEST%2F1`);
      assert.equal(currentCase.caseNotes[0].text, 'New note');
      assert.equal(currentCase.caseNotes[0].tableUser, 'Kieran De La Kruz');
      assert.equal(currentCase.auditLog[0].user, 'Kieran De La Kruz');
      assert.equal(currentCase.lastModifiedBy, 'Kieran De La Kruz');
      assert.equal(session.flashSection, 'case-notes');

      response = await request(`${journey.base}/change?ref=TEST/1`, { index: '0', updatedNote: ' ' });
      const error = await response.json();
      assert.equal(error.error, true);
      assert.equal(currentCase.caseNotes[0].text, 'New note');

      response = await request(`${journey.base}/change?ref=TEST/1`, { index: '0', updatedNote: ' Edited note ' });
      assert.equal(response.status, 302);
      assert.equal(currentCase.caseNotes[0].text, 'Edited note');
      assert.ok(currentCase.caseNotes[0].editedDate);

      response = await request(`${journey.base}/remove?ref=TEST/1&index=0`, {});
      assert.equal(response.status, 302);
      assert.equal(currentCase.caseNotes[0].text, 'Original note');
      assert.deepEqual(currentCase.auditLog.map(item => item.details), [
        'Case note removed: Edited note',
        'Case note updated from "New note" to "Edited note" ',
        'Case note added: New note'
      ]);
    });
  });

  test(`${journey.name} case notes: missing or invalid indexes cannot alter a note`, async () => {
    await withCaseNotes(async ({ request, currentCase }) => {
      for (const suffix of ['', '&index=', '&index=-1', '&index=0.5', '&index=99']) {
        const response = await request(`${journey.base}/remove?ref=TEST/1${suffix}`, {});
        assert.equal(response.status, 302);
        assert.equal(currentCase.caseNotes[0].text, 'Original note');
        assert.equal(currentCase.auditLog.length, 0);
      }

    });
  });
}

test('case notes and audit history use the current user when supplied', async () => {
  await withCaseNotes(async ({ request, currentCase, session }) => {
    session.data.currentUser = 'Alex Example';
    await request('/cases/add-case-note?ref=TEST/1', { comment: 'New note' });
    assert.equal(currentCase.caseNotes[0].tableUser, 'Alex Example');
    assert.equal(currentCase.auditLog[0].user, 'Alex Example');
    assert.equal(currentCase.lastModifiedBy, 'Alex Example');
  });
});
