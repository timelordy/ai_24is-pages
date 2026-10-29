import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {serveStatic} from './static.mjs';

export function createStaticServer({root = process.cwd()} = {}) {
  return createServer((req, res) => {
    if (serveStatic(root, req, res)) return;
    res.writeHead(404, {'content-type': 'text/plain;charset=utf-8'});
    res.end('Not found');
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createStaticServer();
  server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => {
    console.log(`Campus ServiceDesk: http://127.0.0.1:${server.address().port}`);
  });
}
