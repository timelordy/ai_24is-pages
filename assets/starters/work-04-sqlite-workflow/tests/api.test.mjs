import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {tickets} from "../src/data.js";
import {createMemoryStore} from "../backend/memory-store.mjs";
import {createServiceDeskServer} from "../server.mjs";

async function fixture(){const store=createMemoryStore(tickets);const server=createServiceDeskServer({store});server.listen(0,"127.0.0.1");await once(server,"listening");const base=`http://127.0.0.1:${server.address().port}`;return {store,base,close:()=>new Promise(r=>server.close(r))};}
const json=(url,options)=>fetch(url,options).then(async r=>({status:r.status,body:await r.json()}));

test("GET tickets returns the twelve seed tickets",async()=>{const f=await fixture();try{const r=await json(`${f.base}/api/tickets`);assert.equal(r.status,200);assert.equal(r.body.length,12);}finally{await f.close();}});
test("GET ticket returns 101 and unknown id is 404",async()=>{const f=await fixture();try{let r=await json(`${f.base}/api/tickets/101`);assert.equal(r.status,200);assert.equal(r.body.id,101);r=await json(`${f.base}/api/tickets/999`);assert.deepEqual(r,{status:404,body:{error:"ticket_not_found"}});}finally{await f.close();}});
test("POST creates id 113 with status new",async()=>{const f=await fixture();try{const r=await json(`${f.base}/api/tickets`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:"Новая заявка",description:"Описание",priority:"normal",category:"software",location:"101"})});assert.equal(r.status,201);assert.equal(r.body.id,113);assert.equal(r.body.status,"new");}finally{await f.close();}});
test("POST rejects blank title",async()=>{const f=await fixture();try{const r=await json(`${f.base}/api/tickets`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:" ",priority:"normal",category:"software"})});assert.equal(r.status,400);assert.equal(r.body.error,"validation_error");}finally{await f.close();}});
test("PATCH changes a ticket status",async()=>{const f=await fixture();try{const r=await json(`${f.base}/api/tickets/101/status`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:"in_progress"})});assert.equal(r.status,200);assert.equal(r.body.status,"in_progress");}finally{await f.close();}});
test("PATCH unknown ticket is 404",async()=>{const f=await fixture();try{const r=await json(`${f.base}/api/tickets/999/status`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:"closed"})});assert.equal(r.status,404);}finally{await f.close();}});
