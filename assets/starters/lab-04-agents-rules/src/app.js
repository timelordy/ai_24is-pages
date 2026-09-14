import { tickets } from "./data.js";
import { filterTicketsByStatus, statusLabel } from "./tickets.js";

const list = document.querySelector("#tickets");
const total = document.querySelector("#total-count");
const empty = document.querySelector("#empty");
const statusFilter = document.querySelector("#status-filter");

function render() {
  const items = filterTicketsByStatus(tickets, statusFilter.value);
  total.textContent = String(items.length);
  empty.hidden = items.length !== 0;
  list.replaceChildren();
  for (const ticket of items) {
    const article = document.createElement("article");
    article.className = "ticket";
    const title = document.createElement("h2"); title.textContent = ticket.title;
    const description = document.createElement("p"); description.textContent = ticket.description;
    const meta = document.createElement("div"); meta.className = "meta";
    const status = document.createElement("span"); status.className = `status-${ticket.status}`; status.textContent = statusLabel(ticket.status);
    const priority = document.createElement("span"); priority.textContent = `Приоритет: ${ticket.priority}`;
    meta.append(status, priority); article.append(title, description, meta); list.append(article);
  }
}
statusFilter.addEventListener("change", render);
render();
