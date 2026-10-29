import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import * as entry from '../server.mjs';

test('static allowlist denies existing secrets and private source', async () => {
  const root = mkdtempSync(join(tmpdir(), 'static-'));
  for (const folder of ['backend', '.git', 'src']) mkdirSync(join(root, folder));
  for (const file of ['index.html', '.env', 'servicedesk.db', '.git/config',
    'backend/http.mjs', 'package.json', 'src/private.js', 'src/app.js']) {
    writeFileSync(join(root, file), 'synthetic fixture');
  }
  const server = entry.createStaticServer
    ? entry.createStaticServer({root})
    : entry.createServiceDeskServer({root, store: {}});
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/', '/src/app.js']) assert.equal((await fetch(base + path)).status, 200);
    for (const path of ['/.env', '/servicedesk.db', '/.git/config', '/backend/http.mjs',
      '/package.json', '/src/private.js', '/%2eenv', '/src/%2e%2e/.env', '/%ZZ']) {
      assert.equal((await fetch(base + path)).status, 404, path);
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    rmSync(root, {recursive: true, force: true});
  }
});
