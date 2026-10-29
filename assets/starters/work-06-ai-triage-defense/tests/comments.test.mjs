import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {tickets} from "../src/data.js";
import {createSqliteStore} from "../backend/sqlite-store.mjs";
import {DatabaseSync} from 'node:sqlite';
function fixture(){const dir=mkdtempSync(join(tmpdir(),"comments-"));const store=createSqliteStore(join(dir,"test.db"),tickets);return {store,close(){store.close();rmSync(dir,{recursive:true,force:true});}};}

test("comment is stored and listed",()=>{const f=fixture();try{const c=f.store.addComment(101,{author:"Иван",text:"Проверен HDMI"});assert.equal(c.ticket_id,101);assert.equal(c.text,"Проверен HDMI");assert.deepEqual(f.store.comments(101).map(x=>x.text),["Проверен HDMI"]);}finally{f.close();}});
test("comments preserve insertion order",()=>{const f=fixture();try{f.store.addComment(101,{author:"A",text:"Первый"});f.store.addComment(101,{author:"B",text:"Второй"});assert.deepEqual(f.store.comments(101).map(x=>x.text),["Первый","Второй"]);}finally{f.close();}});
test("blank comment is rejected",()=>{const f=fixture();try{assert.throws(()=>f.store.addComment(101,{text:"   "}),TypeError);}finally{f.close();}});
test("unknown ticket returns null",()=>{const f=fixture();try{assert.equal(f.store.addComment(999,{text:"x"}),null);}finally{f.close();}});
test("adding comment appends history event",()=>{const f=fixture();try{f.store.addComment(101,{text:"Проверка"});assert.equal(f.store.history(101).at(-1).event_type,"comment_added");}finally{f.close();}});

test('history failure rolls back a comment', () => {
  const dir = mkdtempSync(join(tmpdir(), 'comment-rollback-'));
  const file = join(dir, 'test.db');
  const store = createSqliteStore(file, tickets);
  const db = new DatabaseSync(file);
  try {
    db.exec(`CREATE TRIGGER fail_history BEFORE INSERT ON ticket_history BEGIN SELECT RAISE(ABORT, 'test failure'); END`);
    assert.throws(() => store.addComment(101, {text: 'Rollback'}));
    assert.deepEqual(store.comments(101), []);
  } finally {
    db.close(); store.close(); rmSync(dir, {recursive: true, force: true});
  }
});
