import test from "node:test";
import assert from "node:assert/strict";
import { tickets } from "../src/data.js";
import { copyTickets, countTickets, statusLabel, validateTickets } from "../src/tickets.js";

test("baseline data is valid", () => assert.equal(validateTickets(tickets), true));
test("countTickets returns six", () => assert.equal(countTickets(tickets), 6));
test("status labels are human-readable", () => {
  assert.equal(statusLabel("open"), "Открыта");
  assert.equal(statusLabel("closed"), "Закрыта");
});
test("copyTickets does not expose original objects", () => {
  const copy = copyTickets(tickets);
  copy[0].title = "changed";
  assert.notEqual(copy[0].title, tickets[0].title);
});
test("invalid status is rejected", () => assert.throws(() => statusLabel("unknown"), RangeError));
