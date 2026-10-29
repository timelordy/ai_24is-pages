const STATUSES=new Set(["new","in_progress","resolved","closed"]);
const PRIORITIES=new Set(["low","normal","high"]);
const CATEGORIES=new Set(["equipment","network","software","access","other"]);
const SORTS=new Set(["id","title_asc","title_desc"]);

export function validateTicket(ticket){
  if(!ticket||!Number.isInteger(ticket.id)||typeof ticket.title!=="string"||!ticket.title.trim())throw new TypeError("invalid ticket");
  if(!STATUSES.has(ticket.status))throw new RangeError(`Unknown status: ${ticket.status}`);
  if(!PRIORITIES.has(ticket.priority))throw new RangeError(`Unknown priority: ${ticket.priority}`);
  if(!CATEGORIES.has(ticket.category))throw new RangeError(`Unknown category: ${ticket.category}`);
  return true;
}
export function validateTickets(items){if(!Array.isArray(items))throw new TypeError("tickets must be an array");const ids=new Set();for(const item of items){validateTicket(item);if(ids.has(item.id))throw new RangeError("duplicate ticket id");ids.add(item.id);}return true;}
export function copyTickets(items){validateTickets(items);return items.map(x=>({...x}));}
export function countTickets(items){validateTickets(items);return items.length;}
export function statusLabel(status){const labels={new:"Новая",in_progress:"В работе",resolved:"Решена",closed:"Закрыта"};if(!(status in labels))throw new RangeError(`Unknown status: ${status}`);return labels[status];}
export function priorityLabel(priority){const labels={low:"Низкий",normal:"Обычный",high:"Высокий"};if(!(priority in labels))throw new RangeError(`Unknown priority: ${priority}`);return labels[priority];}

export function applyTicketQuery(items,{status="all",priority="all",search="",sort="id"}={}){
  validateTickets(items);
  if(status!=="all"&&!STATUSES.has(status))throw new RangeError(`Unknown status: ${status}`);
  if(priority!=="all"&&!PRIORITIES.has(priority))throw new RangeError(`Unknown priority: ${priority}`);
  if(!SORTS.has(sort))throw new RangeError(`Unknown sort: ${sort}`);
  const q=String(search).trim().toLowerCase();
  let result=items.filter(ticket=>(status==="all"||ticket.status===status)&&(priority==="all"||ticket.priority===priority));
  if(q)result=result.filter(ticket=>`${ticket.title} ${ticket.description} ${ticket.location}`.toLowerCase().includes(q));
  result=result.map(ticket=>({...ticket}));
  if(sort==="title_asc")result.sort((a,b)=>a.title.localeCompare(b.title,"ru"));
  if(sort==="title_desc")result.sort((a,b)=>b.title.localeCompare(a.title,"ru"));
  return result;
}
