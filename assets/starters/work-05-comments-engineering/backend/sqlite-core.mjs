import {DatabaseSync} from 'node:sqlite';
import {validateTickets} from '../src/tickets.js';
import {ticketInput, statusInput, commentInput} from './validation.mjs';

export class ConflictError extends Error {
  constructor() {
    super('invalid_transition');
    this.code = 'invalid_transition';
  }
}

const row = value => value ? {...value} : null;
const transitions = {new: ['in_progress'], in_progress: ['resolved'], resolved: ['closed'], closed: []};

function transaction(db, action) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = action();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function initialize(db, seed, comments) {
  db.exec(`
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS tickets(
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL,
      priority TEXT NOT NULL, category TEXT NOT NULL, location TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS ticket_history(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL, from_status TEXT, to_status TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  if (comments) db.exec(`CREATE TABLE IF NOT EXISTS comments(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author TEXT NOT NULL, text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  transaction(db, () => {
    if (db.prepare('SELECT COUNT(*) AS n FROM tickets').get().n !== 0) return;
    const insert = db.prepare('INSERT INTO tickets(id,title,description,status,priority,category,location) VALUES(?,?,?,?,?,?,?)');
    for (const t of seed) insert.run(t.id, t.title, t.description, t.status, t.priority, t.category, t.location);
  });
}

export function createSqliteStore(filePath, seed = [], {comments = false} = {}) {
  validateTickets(seed);
  const db = new DatabaseSync(filePath);
  try {
    initialize(db, seed, comments);
    return prepareStore(db, comments);
  } catch (error) {
    db.close();
    throw error;
  }
}

function prepareStore(db, comments) {
  const selectAll = db.prepare('SELECT * FROM tickets ORDER BY id');
  const selectOne = db.prepare('SELECT * FROM tickets WHERE id=?');
  const insertTicket = db.prepare('INSERT INTO tickets(title,description,status,priority,category,location) VALUES(?,?,?,?,?,?)');
  const updateStatus = db.prepare('UPDATE tickets SET status=? WHERE id=?');
  const insertHistory = db.prepare('INSERT INTO ticket_history(ticket_id,event_type,from_status,to_status) VALUES(?,?,?,?)');
  const selectHistory = db.prepare('SELECT id,ticket_id,event_type,from_status,to_status,created_at FROM ticket_history WHERE ticket_id=? ORDER BY id');
  const store = {
    list() {return selectAll.all().map(row);},
    get(id) {return row(selectOne.get(Number(id)));},
    create(input) {
      const draft = ticketInput(input);
      return transaction(db, () => {
        const result = insertTicket.run(draft.title, draft.description, 'new', draft.priority, draft.category, draft.location);
        const id = Number(result.lastInsertRowid);
        insertHistory.run(id, 'created', null, 'new');
        return row(selectOne.get(id));
      });
    },
    updateStatus(id, status) {
      statusInput({status});
      return transaction(db, () => {
        const current = selectOne.get(Number(id));
        if (!current) return null;
        if (status === current.status) return row(current);
        if (!transitions[current.status].includes(status)) throw new ConflictError();
        updateStatus.run(status, Number(id));
        insertHistory.run(Number(id), 'status_changed', current.status, status);
        return row(selectOne.get(Number(id)));
      });
    },
    history(id) {return selectHistory.all(Number(id)).map(row);},
    close() {db.close();},
  };
  if (comments) attachComments(db, store, selectOne, insertHistory);
  return store;
}

function attachComments(db, store, selectOne, insertHistory) {
  const insert = db.prepare('INSERT INTO comments(ticket_id,author,text) VALUES(?,?,?)');
  const selectAll = db.prepare('SELECT id,ticket_id,author,text,created_at FROM comments WHERE ticket_id=? ORDER BY id');
  const selectOneComment = db.prepare('SELECT id,ticket_id,author,text,created_at FROM comments WHERE id=?');
  store.comments = id => selectAll.all(Number(id)).map(row);
  store.addComment = (id, input) => {
    if (!selectOne.get(Number(id))) return null;
    const draft = commentInput(input);
    return transaction(db, () => {
      const result = insert.run(Number(id), draft.author, draft.text);
      insertHistory.run(Number(id), 'comment_added', null, null);
      return row(selectOneComment.get(Number(result.lastInsertRowid)));
    });
  };
}
