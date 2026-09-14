import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = resolve(root, relative);
  const insideRoot = file === root || file.startsWith(root + sep);
  if (!insideRoot || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, {"content-type":"text/plain; charset=utf-8"});
    res.end("Not found");
    return;
  }
  res.writeHead(200, {"content-type": types[extname(file)] || "application/octet-stream"});
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`ServiceDesk Lite: http://127.0.0.1:${port}`));
