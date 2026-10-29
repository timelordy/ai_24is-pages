import test from "node:test";
import assert from "node:assert/strict";
import {tickets} from "../src/data.js";
import {applyTicketQuery} from "../src/tickets.js";
const ids=x=>x.map(t=>t.id);

test("status new has exact ids",()=>assert.deepEqual(ids(applyTicketQuery(tickets,{status:"new"})),[101,104,107,108,112]));
test("priority high has exact ids",()=>assert.deepEqual(ids(applyTicketQuery(tickets,{priority:"high"})),[101,102,107,108]));
test("search reads title and location case-insensitively",()=>{assert.deepEqual(ids(applyTicketQuery(tickets,{search:"ПРОЕКТОР"})),[101]);assert.deepEqual(ids(applyTicketQuery(tickets,{search:"305"})),[101]);});
test("filters combine",()=>assert.deepEqual(ids(applyTicketQuery(tickets,{status:"new",priority:"high"})),[101,107,108]));
test("filters and search combine",()=>assert.deepEqual(ids(applyTicketQuery(tickets,{status:"new",priority:"high",search:"проектор"})),[101]));
test("missing query returns empty",()=>assert.deepEqual(applyTicketQuery(tickets,{search:"марсианский"}),[]));
test("query never mutates input and returns copies",()=>{const before=JSON.stringify(tickets);const result=applyTicketQuery(tickets,{status:"new",sort:"title_asc"});result[0].title="x";assert.equal(JSON.stringify(tickets),before);});
test("invalid filters are rejected",()=>{assert.throws(()=>applyTicketQuery(tickets,{status:"later"}),RangeError);assert.throws(()=>applyTicketQuery(tickets,{priority:"urgent"}),RangeError);assert.throws(()=>applyTicketQuery(tickets,{sort:"random"}),RangeError);});

test('search trims input and independently reads description and location', () => {
  assert.equal(applyTicketQuery(tickets, {search: '  '}).length, 12);
  assert.deepEqual(ids(applyTicketQuery(tickets, {search: '  ПРОЕКТОР  '})), [101]);
  const fixtures = [
    {...tickets[0], id: 1, title: 'Один', description: 'УникальныйТекст', location: ''},
    {...tickets[0], id: 2, title: 'Два', description: '', location: 'УникальноеМесто'},
  ];
  assert.deepEqual(ids(applyTicketQuery(fixtures, {search: 'уникальныйтекст'})), [1]);
  assert.deepEqual(ids(applyTicketQuery(fixtures, {search: 'уникальноеместо'})), [2]);
});
