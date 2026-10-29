import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServiceDeskServer} from '../server.mjs';

test('comment types are rejected before storage and store errors remain 500', async t => {
  let calls = 0;
  const server = createServiceDeskServer({store: {
    get: () => ({id: 101}),
    addComment() {calls++; throw new Error('SQL private detail');},
  }});
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/tickets/101/comments`;
  for (const input of [null, [], {text: {}}, {text: 'x', author: []}, {text: ' '}, {text: 'x'.repeat(1001)}]) {
    const response = await fetch(url, {method: 'POST', body: JSON.stringify(input)});
    assert.equal(response.status, 400);
  }
  assert.equal(calls, 0);
  const response = await fetch(url, {method: 'POST', body: JSON.stringify({text: 'Valid'})});
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {error: 'internal_error'});
});
