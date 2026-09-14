import test from "node:test";
import assert from "node:assert/strict";
import { tickets } from "../src/data.js";
import { sortTicketsByTitle } from "../src/tickets.js";

test("ascending title sort", () => {const r=sortTicketsByTitle(tickets,"asc");assert.equal(r[0].title,"Не включается проектор");assert.equal(r.at(-1).title,"Сломалась клавиатура");});
test("descending reverses order", () => {const a=sortTicketsByTitle(tickets,"asc").map(x=>x.id);const d=sortTicketsByTitle(tickets,"desc").map(x=>x.id);assert.deepEqual(d,[...a].reverse());});
test("invalid direction is rejected", () => assert.throws(()=>sortTicketsByTitle(tickets,"sideways"),RangeError));
test("sort does not mutate input", () => {const before=JSON.stringify(tickets);sortTicketsByTitle(tickets,"asc");assert.equal(JSON.stringify(tickets),before);});
