import {json, readJson, requestError, ticketId} from './http-common.mjs';
import {ticketInput, statusInput, commentInput} from './validation.mjs';

export function createApiHandler(store, {comments = false} = {}) {
  return async function handle(req, res) {
    const path = new URL(req.url, 'http://localhost').pathname;
    try {
      if (path === '/api/tickets' && req.method === 'GET') {
        json(res, 200, store.list());
      } else if (path === '/api/tickets' && req.method === 'POST') {
        json(res, 201, store.create(ticketInput(await readJson(req))));
      } else {
        const match = path.match(/^\/api\/tickets\/(\d+)(?:\/(status|history|comments))?$/);
        if (!match) return false;
        const [, rawId, resource] = match;
        const allowed = (req.method === 'GET' && (!resource || resource === 'history' || comments && resource === 'comments'))
          || (req.method === 'PATCH' && resource === 'status')
          || (req.method === 'POST' && comments && resource === 'comments');
        if (!allowed) return false;
        const id = ticketId(rawId);
        const ticket = id && store.get(id);
        if (!ticket) {
          json(res, 404, {error: 'ticket_not_found'});
        } else if (req.method === 'GET') {
          json(res, 200, resource ? store[resource](id) : ticket);
        } else if (resource === 'status') {
          json(res, 200, store.updateStatus(id, statusInput(await readJson(req))));
        } else {
          json(res, 201, store.addComment(id, commentInput(await readJson(req))));
        }
      }
    } catch (error) {
      requestError(res, error);
    }
    return true;
  };
}
