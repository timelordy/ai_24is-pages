import { tickets } from "./data.js";
import { countTickets, statusLabel } from "./tickets.js";

const list = document.querySelector("#tickets");
const total = document.querySelector("#total-count");

function render(items) {
  total.textContent = String(countTickets(items));
  list.replaceChildren();
  for (const ticket of items) {
    const article = document.createElement("article");
    article.className = "ticket";
    article.innerHTML = `<h2></h2><p></p><div class="meta"><span class="status-${ticket.status}"></span><span></span></div>`;
    article.querySelector("h2").textContent = ticket.title;
    article.querySelector("p").textContent = ticket.description;
    const spans = article.querySelectorAll("span");
    spans[0].textContent = statusLabel(ticket.status);
    spans[1].textContent = `Приоритет: ${ticket.priority}`;
    list.append(article);
  }
}

render(tickets);
