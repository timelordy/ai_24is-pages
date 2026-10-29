import {applyTicketQuery,priorityLabel,statusLabel} from "./tickets.js";
import {createTicket,listTickets} from "./api-client.js";
const list=document.querySelector("#tickets"),total=document.querySelector("#total-count"),empty=document.querySelector("#empty"),form=document.querySelector("#create-form"),formStatus=document.querySelector("#form-status");
const controls={status:document.querySelector("#status"),priority:document.querySelector("#priority"),search:document.querySelector("#search"),sort:document.querySelector("#sort")};let tickets=[];
function render(){const items=applyTicketQuery(tickets,{status:controls.status.value,priority:controls.priority.value,search:controls.search.value,sort:controls.sort.value});total.textContent=String(items.length);empty.hidden=items.length!==0;list.replaceChildren();for(const ticket of items){const card=document.createElement("article");card.className="ticket";card.innerHTML='<h2></h2><p class="description"></p><div class="meta"><span class="status"></span><span class="priority"></span><span class="location"></span></div>';card.querySelector("h2").textContent=`#${ticket.id} · ${ticket.title}`;card.querySelector(".description").textContent=ticket.description;card.querySelector(".status").textContent=statusLabel(ticket.status);card.querySelector(".priority").textContent=`Приоритет: ${priorityLabel(ticket.priority)}`;card.querySelector(".location").textContent=`Место: ${ticket.location}`;list.append(card);}}
async function refresh(){tickets=await listTickets();render();}
for(const control of Object.values(controls))control.addEventListener(control===controls.search?"input":"change",render);
form.addEventListener('submit', async event => {
  event.preventDefault();
  formStatus.textContent = '';
  const data = Object.fromEntries(new FormData(form));
  let created;
  try {
    created = await createTicket(data);
  } catch (error) {
    const message = error.body?.error === 'validation_error' && error.body.field === 'title'
      ? 'Введите заголовок заявки. Он не должен состоять только из пробелов.'
      : error.body?.error || error.message;
    formStatus.textContent = `Ошибка: ${message}`;
    return;
  }
  formStatus.textContent = `Создана заявка #${created.id}`;
  form.reset();
  try {
    await refresh();
  } catch {
    formStatus.textContent += '. Список не обновился, перезагрузите страницу.';
  }
});
refresh().catch(error=>{formStatus.textContent=`API недоступен: ${error.message}`;});
