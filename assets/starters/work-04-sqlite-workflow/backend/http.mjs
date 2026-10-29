import {json, readJson, requestError, ticketId} from './http-common.mjs';
import {ticketInput, statusInput} from './validation.mjs';

export function createApiHandler(store) {
  return async function handle(req, res) {
    const path = new URL(req.url, 'http://localhost').pathname;
    try {
      if (req.method === 'GET' && path === '/api/tickets') {
        json(res, 200, store.list());
      } else if (req.method === 'POST' && path === '/api/tickets') {
        json(res, 201, store.create(ticketInput(await readJson(req))));
      } else {
        const match = path.match(/^\/api\/tickets\/(\d+)(\/status)?$/);
        if (!match || !['GET', 'PATCH'].includes(req.method)) return false;
        const id = ticketId(match[1]);
        if (req.method === 'GET' && !match[2]) {
          const ticket = id && store.get(id);
          json(res, ticket ? 200 : 404, ticket || {error: 'ticket_not_found'});
        } else if (req.method === 'PATCH' && match[2]) {
          const status = statusInput(await readJson(req));
          const ticket = id && store.updateStatus(id, status);
          json(res, ticket ? 200 : 404, ticket || {error: 'ticket_not_found'});
        } else return false;
      }
    } catch (error) {
      requestError(res, error);
    }
    return true;
  };
}
