import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {tickets} from "../src/data.js";
import {createSqliteStore,ConflictError} from "../backend/sqlite-store.mjs";
function fixture(){const dir=mkdtempSync(join(tmpdir(),"servicedesk-"));const file=join(dir,"test.db");const store=createSqliteStore(file,tickets);return {file,store,close(){store.close();rmSync(dir,{recursive:true,force:true});}};}

test("sqlite seeds twelve tickets",()=>{const f=fixture();try{assert.equal(f.store.list().length,12);}finally{f.close();}});
test("created ticket survives database reopen",()=>{const dir=mkdtempSync(join(tmpdir(),"servicedesk-reopen-"));const file=join(dir,"test.db");let store=createSqliteStore(file,tickets);const created=store.create({title:"Проверка persistence",description:"",priority:"normal",category:"software",location:"101"});assert.equal(created.id,113);store.close();store=createSqliteStore(file,tickets);assert.equal(store.get(113).title,"Проверка persistence");store.close();rmSync(dir,{recursive:true,force:true});});
test("valid workflow is new to in_progress to resolved to closed",()=>{const f=fixture();try{const t=f.store.create({title:"Workflow",description:"",priority:"normal",category:"software",location:""});assert.equal(f.store.updateStatus(t.id,"in_progress").status,"in_progress");assert.equal(f.store.updateStatus(t.id,"resolved").status,"resolved");assert.equal(f.store.updateStatus(t.id,"closed").status,"closed");}finally{f.close();}});
test("new cannot jump directly to closed",()=>{const f=fixture();try{const t=f.store.create({title:"Conflict",description:"",priority:"normal",category:"software",location:""});assert.throws(()=>f.store.updateStatus(t.id,"closed"),ConflictError);}finally{f.close();}});
test("history records creation and status changes",()=>{const f=fixture();try{const t=f.store.create({title:"History",description:"",priority:"normal",category:"software",location:""});f.store.updateStatus(t.id,"in_progress");f.store.updateStatus(t.id,"resolved");assert.deepEqual(f.store.history(t.id).map(x=>x.event_type),["created","status_changed","status_changed"]);assert.deepEqual(f.store.history(t.id).map(x=>x.to_status),["new","in_progress","resolved"]);}finally{f.close();}});
