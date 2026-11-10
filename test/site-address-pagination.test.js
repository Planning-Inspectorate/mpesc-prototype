const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const kitRequire = createRequire(require.resolve('govuk-prototype-kit'));
const express = kitRequire('express');
const { paginateSiteAddresses } = require('../app/pagination/site-addresses');
const router = require('../app/sub-routes/add-to-list/site-address');

const addresses = count => Array.from({ length: count }, (_, i) => ({
  id: `sa-${i + 1}`,
  addressLine1: `${i + 1} High Street`,
  addressTown: 'Bristol',
  addressPostcode: 'BS1 1AA'
}));

test('pagination matches the feature at boundaries, page sizes and ellipses', () => {
  const base = '/cases/site-address/hub?ref=TEST%2F1';
  for (const count of [0, 12, 24, 25, 26, 70, 234]) {
    const result = paginateSiteAddresses(addresses(count), 1, 25, base);
    assert.equal(result.addresses.length, Math.min(25, count));
    assert.equal(result.from, count ? 1 : 0);
    assert.equal(result.to, Math.min(count, 25));
    assert.equal(Boolean(result.pagination), count > 25);
  }
  const result = paginateSiteAddresses(addresses(234), 5, 25, base);
  assert.equal(result.from, 101);
  assert.equal(result.to, 125);
  assert.deepEqual(result.pagination.items.map(item => item.number || '...'), [1, '...', 4, 5, 6, '...', 10]);
  assert.equal(result.pagination.previous.href, `${base}&perPage=25&page=4`);
  assert.equal(result.pagination.next.href, `${base}&perPage=25&page=6`);
  assert.equal(paginateSiteAddresses(addresses(70), 99, 50, base).page, 2);
  assert.equal(paginateSiteAddresses(addresses(70), -1, 999, base).pageSize, 25);
  assert.equal(paginateSiteAddresses(addresses(70), 1, 100, base).addresses.length, 70);
});

test('draft pagination survives editing and removing, then commits the whole list', async () => {
  const currentCase = { reference: 'TEST/1', siteAddresses: addresses(51) };
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
    let response = await request('/cases/site-address/hub?ref=TEST/1&page=3&perPage=25');
    let model = await response.json();
    assert.equal(model.from, 51);
    assert.equal(model.addresses[0].id, 'sa-51');
    response = await request('/cases/site-address/step-1?ref=TEST/1&id=sa-51', {
      addressLine1: 'Changed address', addressTown: 'Bristol', addressPostcode: 'BS1 1AA'
    });
    assert.equal(response.status, 302);
    model = await (await request('/cases/site-address/hub?ref=TEST/1')).json();
    assert.equal(model.page, 3);
    assert.equal(model.addresses[0].addressLine1, 'Changed address');
    assert.equal(currentCase.siteAddresses[50].addressLine1, '51 High Street');

    await request('/cases/site-address/remove?ref=TEST/1&id=sa-51', { siteAddressRemove: 'yes' });
    model = await (await request('/cases/site-address/hub?ref=TEST/1')).json();
    assert.equal(model.page, 2);
    assert.equal(model.total, 50);
    response = await request('/cases/site-address/cancel?ref=TEST/1', { cancelSiteAddress: 'no' });
    assert.equal(response.status, 302);
    model = await (await request('/cases/site-address/hub?ref=TEST/1')).json();
    assert.equal(model.page, 2);
    assert.equal(model.total, 50);
    await request('/cases/site-address/commit?ref=TEST/1', {});
    assert.equal(currentCase.siteAddresses.length, 50);
    assert.equal(session.data.siteAddressPagination, undefined);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('adding or changing a plot requires address line 1, town or city and postcode', async () => {
  const original = addresses(1)[0];
  const session = { data: { cases: [{ reference: 'TEST/1', siteAddresses: [original] }] } };
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
    await request('/cases/site-address/hub?ref=TEST/1');
    let response = await request('/cases/site-address/step-1?ref=TEST/1', {});
    let model = await response.json();
    assert.deepEqual(model.errorList.map(error => error.text), [
      'Enter address line 1', 'Enter town or city', 'Enter postcode'
    ]);
    assert.equal(session.data.tempSiteAddresses.length, 1);

    const valid = { addressLine1: '2 High Street', addressTown: 'Bristol', addressPostcode: 'BS1 1AA' };
    for (const [field, message] of [
      ['addressLine1', 'Enter address line 1'],
      ['addressTown', 'Enter town or city'],
      ['addressPostcode', 'Enter postcode']
    ]) {
      response = await request('/cases/site-address/step-1?ref=TEST/1&id=sa-1', { ...valid, [field]: '   ' });
      model = await response.json();
      assert.deepEqual(model.errorList.map(error => error.text), [message]);
      assert.equal(model[field], '   ');
      assert.deepEqual(session.data.tempSiteAddresses[0], original);
    }

    response = await request('/cases/site-address/step-1?ref=TEST/1', { ...valid, addressPostcode: 'invalid' });
    model = await response.json();
    assert.equal(model.addressPostcodeError.text, 'Enter a real postcode');
    assert.equal(session.data.tempSiteAddresses.length, 1);

    response = await request('/cases/site-address/step-1?ref=TEST/1', valid);
    assert.equal(response.status, 302);
    assert.equal(session.data.tempSiteAddresses.length, 2);
    assert.equal(session.data.tempSiteAddresses[1].addressLine1, valid.addressLine1);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
