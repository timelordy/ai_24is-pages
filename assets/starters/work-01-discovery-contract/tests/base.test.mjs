import test from "node:test";
import assert from "node:assert/strict";
import {tickets} from "../src/data.js";
import {copyTickets,countTickets,priorityLabel,statusLabel,validateTickets} from "../src/tickets.js";

test("baseline contains twelve valid unique tickets",()=>{assert.equal(validateTickets(tickets),true);assert.equal(countTickets(tickets),12);assert.equal(new Set(tickets.map(x=>x.id)).size,12);});
test("status labels are human-readable",()=>{assert.equal(statusLabel("new"),"Новая");assert.equal(statusLabel("in_progress"),"В работе");assert.equal(statusLabel("resolved"),"Решена");assert.equal(statusLabel("closed"),"Закрыта");});
test("priority labels are human-readable",()=>{assert.equal(priorityLabel("low"),"Низкий");assert.equal(priorityLabel("normal"),"Обычный");assert.equal(priorityLabel("high"),"Высокий");});
test("copyTickets deep-copies top-level ticket objects",()=>{const copy=copyTickets(tickets);copy[0].title="changed";assert.notEqual(copy[0].title,tickets[0].title);});
test("unknown status and priority are rejected",()=>{assert.throws(()=>statusLabel("later"),RangeError);assert.throws(()=>priorityLabel("urgent"),RangeError);});
