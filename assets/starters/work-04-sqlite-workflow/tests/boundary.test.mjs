import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServiceDeskServer} from '../server.mjs';
import {createMemoryStore} from '../backend/memory-store.mjs';

async function fixture(t, store) {
  const server = createServiceDeskServer({store});
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}
const draft = {title: 'Проверка', priority: 'normal', category: 'software'};
const post = (base, body) => fetch(base + '/api/tickets', {method: 'POST', body});

test('invalid shapes, field types and byte limit never reach storage', async t => {
  const store = createMemoryStore();
  const base = await fixture(t, store);
  for (const input of [null, [], 1, 'text', {...draft, description: {}},
    {...draft, location: []}, {...draft, priority: 1}, {...draft, title: null}]) {
    const response = await post(base, JSON.stringify(input));
    assert.equal(response.status, 400, JSON.stringify(input));
    assert.equal((await response.json()).error, 'validation_error');
  }
  const malformed = await post(base, '{');
  assert.deepEqual(await malformed.json(), {error: 'invalid_json'});
  const large = await post(base, JSON.stringify({...draft, description: 'я'.repeat(51000)}));
  assert.equal(large.status, 400);
  assert.deepEqual(await large.json(), {error: 'body_too_large'});
  assert.equal(store.list().length, 0);
});

test('storage failure is 500 without internal details', async t => {
  const base = await fixture(t, {create() {throw new Error('SQL secret');}});
  const response = await post(base, JSON.stringify(draft));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {error: 'internal_error'});
});

test('status validates shape and enum; safe ids never get rounded', async t => {
  const store = createMemoryStore([{id: 1, title: 'Fixture', description: '', location: '',
    status: 'new', priority: 'normal', category: 'other'}]);
  const base = await fixture(t, store);
  for (const input of [null, [], {status: []}, {status: 'unknown'}]) {
    const response = await fetch(base + '/api/tickets/1/status', {method: 'PATCH', body: JSON.stringify(input)});
    assert.equal(response.status, 400);
  }
  assert.equal(store.get(1).status, 'new');
  for (const id of ['0', '9007199254740993']) {
    assert.equal((await fetch(base + '/api/tickets/' + id)).status, 404);
  }
});
