import test from "node:test";
import assert from "node:assert/strict";
import { tickets } from "../src/data.js";
import { searchTickets } from "../src/tickets.js";

test("search finds title case-insensitively", () => assert.deepEqual(searchTickets(tickets,"ПРОЕКТОР").map(x=>x.id),[1]));
test("search includes description", () => assert.deepEqual(searchTickets(tickets,"210").map(x=>x.id),[4]));
test("blank search returns all", () => assert.equal(searchTickets(tickets,"   ").length,6));
test("missing search returns empty", () => assert.deepEqual(searchTickets(tickets,"марсианский"),[]));
test("search does not mutate input", () => {const before=JSON.stringify(tickets);searchTickets(tickets,"проектор");assert.equal(JSON.stringify(tickets),before);});
