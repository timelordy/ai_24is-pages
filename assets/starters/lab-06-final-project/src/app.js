import { tickets } from "./data.js";
import { filterTicketsByStatus, searchTickets, sortTicketsByTitle, statusLabel } from "./tickets.js";

const list = document.querySelector("#tickets");
const total = document.querySelector("#total-count");
const empty = document.querySelector("#empty");
const statusFilter = document.querySelector("#status-filter");
const search = document.querySelector("#search");
const sort = document.querySelector("#sort");

function render() {
  const byStatus = filterTicketsByStatus(tickets, statusFilter.value);
  const byQuery = searchTickets(byStatus, search.value);
  const items = sortTicketsByTitle(byQuery, sort.value);
  total.textContent = String(items.length);
  empty.hidden = items.length !== 0;
  list.replaceChildren();
  for (const ticket of items) {
    const article = document.createElement("article"); article.className = "ticket";
    const title = document.createElement("h2"); title.textContent = ticket.title;
    const description = document.createElement("p"); description.textContent = ticket.description;
    const meta = document.createElement("div"); meta.className = "meta";
    const status = document.createElement("span"); status.className = `status-${ticket.status}`; status.textContent = statusLabel(ticket.status);
    const priority = document.createElement("span"); priority.textContent = `Приоритет: ${ticket.priority}`;
    meta.append(status, priority); article.append(title, description, meta); list.append(article);
  }
}
for (const element of [statusFilter, search, sort]) element.addEventListener(element === search ? "input" : "change", render);
render();
