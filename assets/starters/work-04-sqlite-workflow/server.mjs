import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {serveStatic} from './static.mjs';
import {tickets} from './src/data.js';
import {createMemoryStore} from './backend/memory-store.mjs';
import {createApiHandler} from './backend/http.mjs';

export function createServiceDeskServer({root = process.cwd(), store = createMemoryStore(tickets)} = {}) {
  const api = createApiHandler(store);
  return createServer(async (req, res) => {
    try {
      if (await api(req, res) || serveStatic(root, req, res)) return;
      res.writeHead(404, {'content-type': 'application/json;charset=utf-8'});
      res.end(JSON.stringify({error: 'not_found'}));
    } catch {
      res.writeHead(500, {'content-type': 'application/json;charset=utf-8'});
      res.end(JSON.stringify({error: 'internal_error'}));
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createServiceDeskServer();
  server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => {
    console.log(`Campus ServiceDesk: http://127.0.0.1:${server.address().port}`);
  });
}
