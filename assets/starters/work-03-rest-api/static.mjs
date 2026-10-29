import {createReadStream, realpathSync, statSync} from 'node:fs';
import {extname, resolve, sep} from 'node:path';

const publicFiles = new Set([
  '/index.html', '/styles.css', '/src/app.js', '/src/data.js',
  '/src/tickets.js', '/src/api-client.js',
]);
const types = {
  '.html': 'text/html;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.js': 'text/javascript;charset=utf-8',
};

export function serveStatic(root, req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return false;
  }
  if (pathname === '/') pathname = '/index.html';
  if (!publicFiles.has(pathname)) return false;
  let file;
  try {
    const realRoot = realpathSync(root);
    const expected = resolve(realRoot, pathname.slice(1));
    file = realpathSync(expected);
    if (file !== expected || !file.startsWith(realRoot + sep) || !statSync(file).isFile()) return false;
  } catch {
    return false;
  }
  const stream = createReadStream(file);
  stream.on('error', () => res.destroy());
  res.writeHead(200, {'content-type': types[extname(file)], 'x-content-type-options': 'nosniff'});
  if (req.method === 'HEAD') {
    stream.destroy();
    res.end();
  } else {
    stream.pipe(res);
  }
  return true;
}
