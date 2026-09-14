const STATUSES = new Set(["new","in_progress","resolved","closed"]);
const PRIORITIES = new Set(["low","normal","high"]);
const CATEGORIES = new Set(["equipment","network","software","access","other"]);

export function validateTicket(ticket) {
  if (!ticket || !Number.isInteger(ticket.id) || typeof ticket.title !== "string" || !ticket.title.trim()) throw new TypeError("invalid ticket");
  if (!STATUSES.has(ticket.status)) throw new RangeError(`Unknown status: ${ticket.status}`);
  if (!PRIORITIES.has(ticket.priority)) throw new RangeError(`Unknown priority: ${ticket.priority}`);
  if (!CATEGORIES.has(ticket.category)) throw new RangeError(`Unknown category: ${ticket.category}`);
  return true;
}

export function validateTickets(items) {
  if (!Array.isArray(items)) throw new TypeError("tickets must be an array");
  const ids = new Set();
  for (const ticket of items) { validateTicket(ticket); if (ids.has(ticket.id)) throw new RangeError("duplicate ticket id"); ids.add(ticket.id); }
  return true;
}

export function copyTickets(items) { validateTickets(items); return items.map(item => ({...item})); }
export function countTickets(items) { validateTickets(items); return items.length; }

export function statusLabel(status) {
  const labels={new:"Новая",in_progress:"В работе",resolved:"Решена",closed:"Закрыта"};
  if (!(status in labels)) throw new RangeError(`Unknown status: ${status}`);
  return labels[status];
}

export function priorityLabel(priority) {
  const labels={low:"Низкий",normal:"Обычный",high:"Высокий"};
  if (!(priority in labels)) throw new RangeError(`Unknown priority: ${priority}`);
  return labels[priority];
}
