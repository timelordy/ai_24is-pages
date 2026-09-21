import {createReadStream,existsSync,statSync} from "node:fs";
import {createServer} from "node:http";
import {extname,resolve,sep} from "node:path";
import {pathToFileURL} from "node:url";

export function createStaticServer({root=process.cwd()}={}){
  return createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
    const relative=pathname==="/"?"index.html":pathname.replace(/^\/+/,"");
    const file=resolve(root,relative);
    if(!(file===root||file.startsWith(root+sep))||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404,{"content-type":"text/plain;charset=utf-8"});res.end("Not found");return;}
    const types={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".css":"text/css;charset=utf-8",".json":"application/json;charset=utf-8"};
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream"});createReadStream(file).pipe(res);
  });
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){const server=createStaticServer();server.listen(Number(process.env.PORT||4173),"127.0.0.1",()=>console.log(`Campus ServiceDesk: http://127.0.0.1:${server.address().port}`));}
