const ALLOWED_STATUSES = new Set(["open", "closed"]);

export function validateTickets(tickets) {
  if (!Array.isArray(tickets)) throw new TypeError("tickets must be an array");
  for (const ticket of tickets) {
    if (!ticket || !Number.isInteger(ticket.id) || typeof ticket.title !== "string" || !ALLOWED_STATUSES.has(ticket.status)) {
      throw new TypeError("invalid ticket");
    }
  }
  return true;
}

export function statusLabel(status) {
  if (status === "open") return "Открыта";
  if (status === "closed") return "Закрыта";
  throw new RangeError(`Unknown status: ${status}`);
}

export function countTickets(tickets) {
  validateTickets(tickets);
  return tickets.length;
}

export function copyTickets(tickets) {
  validateTickets(tickets);
  return tickets.map(ticket => ({ ...ticket }));
}

export function filterTicketsByStatus(tickets, status = "all") {
  validateTickets(tickets);
  if (status === "all") return copyTickets(tickets);
  if (!ALLOWED_STATUSES.has(status)) throw new RangeError(`Unknown status: ${status}`);
  return tickets.filter(ticket => ticket.status === status).map(ticket => ({ ...ticket }));
}

export function searchTickets(tickets, query = "") {
  validateTickets(tickets);
  const normalized = String(query).trim().toLocaleLowerCase("ru");
  if (!normalized) return copyTickets(tickets);
  return tickets
    .filter(ticket => `${ticket.title} ${ticket.description}`.toLocaleLowerCase("ru").includes(normalized))
    .map(ticket => ({ ...ticket }));
}

export function sortTicketsByTitle(tickets, direction = "asc") {
  validateTickets(tickets);
  if (!new Set(["asc", "desc"]).has(direction)) throw new RangeError(`Unknown direction: ${direction}`);
  const factor = direction === "asc" ? 1 : -1;
  return copyTickets(tickets).sort((a, b) => factor * a.title.localeCompare(b.title, "ru"));
}
