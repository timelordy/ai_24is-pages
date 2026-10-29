import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createSqliteStore} from '../backend/sqlite-store.mjs';
import {tickets} from '../src/data.js';

test('failed history insert rolls back create and status', () => {
  const dir = mkdtempSync(join(tmpdir(), 'rollback-'));
  const file = join(dir, 'test.db');
  const store = createSqliteStore(file, tickets);
  const db = new DatabaseSync(file);
  try {
    db.exec(`CREATE TRIGGER fail_history BEFORE INSERT ON ticket_history BEGIN SELECT RAISE(ABORT, 'test failure'); END`);
    assert.throws(() => store.create({title: 'Rollback', priority: 'normal', category: 'other'}));
    assert.equal(store.list().length, 12);
    assert.throws(() => store.updateStatus(101, 'in_progress'));
    assert.equal(store.get(101).status, 'new');
  } finally {
    db.close(); store.close(); rmSync(dir, {recursive: true, force: true});
  }
});

test('seed is all or nothing and can recover on reopen', () => {
  const dir = mkdtempSync(join(tmpdir(), 'seed-rollback-'));
  const file = join(dir, 'test.db');
  let store = createSqliteStore(file);
  store.close();
  const db = new DatabaseSync(file);
  try {
    db.exec(`CREATE TRIGGER fail_seed BEFORE INSERT ON tickets WHEN NEW.id=102 BEGIN SELECT RAISE(ABORT, 'test failure'); END`);
    assert.throws(() => createSqliteStore(file, tickets));
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM tickets').get().n, 0);
    db.exec('DROP TRIGGER fail_seed');
    store = createSqliteStore(file, tickets);
    assert.equal(store.list().length, 12);
    store.close();
  } finally {
    db.close(); rmSync(dir, {recursive: true, force: true});
  }
});
