import {createSqliteStore as createStore} from './sqlite-core.mjs';
export {ConflictError} from './sqlite-core.mjs';

export function createSqliteStore(filePath, seed = []) {
  return createStore(filePath, seed, {comments: true});
}
