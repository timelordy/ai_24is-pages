async function request(path,options={}){const response=await fetch(path,{headers:{"content-type":"application/json",...(options.headers||{})},...options});const body=await response.json().catch(()=>({}));if(!response.ok)throw Object.assign(new Error(body.error||`HTTP ${response.status}`),{status:response.status,body});return body;}
export const listTickets=()=>request("/api/tickets");
export const createTicket=input=>request("/api/tickets",{method:"POST",body:JSON.stringify(input)});
export const updateTicketStatus=(id,status)=>request(`/api/tickets/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});
export const listComments=id=>request(`/api/tickets/${id}/comments`);
export const addComment=(id,input)=>request(`/api/tickets/${id}/comments`,{method:"POST",body:JSON.stringify(input)});
