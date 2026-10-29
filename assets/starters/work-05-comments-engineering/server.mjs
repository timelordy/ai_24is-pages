import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {serveStatic} from './static.mjs';
import {tickets} from './src/data.js';
import {createSqliteStore} from './backend/sqlite-store.mjs';
import {createApiHandler} from './backend/http.mjs';

export function createServiceDeskServer({root = process.cwd(), store} = {}) {
  const owned = !store;
  store ||= createSqliteStore(process.env.SERVICEDESK_DB || 'servicedesk.db', tickets);
  const api = createApiHandler(store);
  const server = createServer(async (req, res) => {
    try {
      if (await api(req, res) || serveStatic(root, req, res)) return;
      res.writeHead(404, {'content-type': 'application/json;charset=utf-8'});
      res.end(JSON.stringify({error: 'not_found'}));
    } catch {
      res.writeHead(500, {'content-type': 'application/json;charset=utf-8'});
      res.end(JSON.stringify({error: 'internal_error'}));
    }
  });
  if (owned) server.on('close', () => store.close());
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createServiceDeskServer();
  server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => {
    console.log(`Campus ServiceDesk: http://127.0.0.1:${server.address().port}`);
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
