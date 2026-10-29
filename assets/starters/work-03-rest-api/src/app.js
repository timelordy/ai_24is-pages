import {tickets} from "./data.js";
import {applyTicketQuery,priorityLabel,statusLabel} from "./tickets.js";

const list=document.querySelector("#tickets");
const total=document.querySelector("#total-count");
const empty=document.querySelector("#empty");
const controls={status:document.querySelector("#status"),priority:document.querySelector("#priority"),search:document.querySelector("#search"),sort:document.querySelector("#sort")};

function render(){
  const items=applyTicketQuery(tickets,{status:controls.status.value,priority:controls.priority.value,search:controls.search.value,sort:controls.sort.value});
  total.textContent=String(items.length);empty.hidden=items.length!==0;list.replaceChildren();
  for(const ticket of items){const card=document.createElement("article");card.className="ticket";card.innerHTML='<h2></h2><p class="description"></p><div class="meta"><span class="status"></span><span class="priority"></span><span class="location"></span></div>';card.querySelector("h2").textContent=`#${ticket.id} · ${ticket.title}`;card.querySelector(".description").textContent=ticket.description;card.querySelector(".status").textContent=statusLabel(ticket.status);card.querySelector(".priority").textContent=`Приоритет: ${priorityLabel(ticket.priority)}`;card.querySelector(".location").textContent=`Место: ${ticket.location}`;list.append(card);}
}
for(const control of Object.values(controls))control.addEventListener(control===controls.search?"input":"change",render);
render();
