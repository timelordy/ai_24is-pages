import {createApiHandler as createWorkflowHandler} from './workflow-http.mjs';

export function createApiHandler(store) {
  return createWorkflowHandler(store, {comments: true});
}
