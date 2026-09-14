import test from "node:test";
import assert from "node:assert/strict";
import { tickets } from "../src/data.js";
import { filterTicketsByStatus } from "../src/tickets.js";

test("all returns every ticket", () => assert.equal(filterTicketsByStatus(tickets, "all").length, 6));
test("open returns four tickets", () => assert.deepEqual(filterTicketsByStatus(tickets, "open").map(x=>x.id), [1,3,4,6]));
test("closed returns two tickets", () => assert.deepEqual(filterTicketsByStatus(tickets, "closed").map(x=>x.id), [2,5]));
test("unknown filter is rejected", () => assert.throws(() => filterTicketsByStatus(tickets, "later"), RangeError));
test("filter does not mutate input", () => {const before=JSON.stringify(tickets);filterTicketsByStatus(tickets,"open");assert.equal(JSON.stringify(tickets),before);});
