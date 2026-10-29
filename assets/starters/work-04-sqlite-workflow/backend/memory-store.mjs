import {validateTicket, validateTickets} from '../src/tickets.js';
import {ticketInput, statusInput} from './validation.mjs';

export function createMemoryStore(seed = []) {
  validateTickets(seed);
  const rows = structuredClone(seed);
  let nextId = Math.max(0, ...rows.map(ticket => ticket.id)) + 1;
  return {
    list() {return structuredClone(rows);},
    get(id) {
      const row = rows.find(ticket => ticket.id === Number(id));
      return row ? structuredClone(row) : null;
    },
    create(input) {
      const ticket = {id: nextId, status: 'new', ...ticketInput(input)};
      validateTicket(ticket);
      rows.push(ticket);
      nextId++;
      return structuredClone(ticket);
    },
    updateStatus(id, status) {
      statusInput({status});
      const row = rows.find(ticket => ticket.id === Number(id));
      if (!row) return null;
      validateTicket({...row, status});
      row.status = status;
      return structuredClone(row);
    },
    history() {return [];},
  };
}
