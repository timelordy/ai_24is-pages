import {tickets} from "./data.js";
import {countTickets,priorityLabel,statusLabel} from "./tickets.js";

const list=document.querySelector("#tickets");
const total=document.querySelector("#total-count");

function render(items){
  total.textContent=String(countTickets(items));
  list.replaceChildren();
  for(const ticket of items){
    const card=document.createElement("article");
    card.className="ticket";
    card.innerHTML='<h2></h2><p class="description"></p><div class="meta"><span class="status"></span><span class="priority"></span><span class="location"></span></div>';
    card.querySelector("h2").textContent=`#${ticket.id} · ${ticket.title}`;
    card.querySelector(".description").textContent=ticket.description;
    card.querySelector(".status").textContent=statusLabel(ticket.status);
    card.querySelector(".priority").textContent=`Приоритет: ${priorityLabel(ticket.priority)}`;
    card.querySelector(".location").textContent=`Место: ${ticket.location}`;
    list.append(card);
  }
}
render(tickets);
