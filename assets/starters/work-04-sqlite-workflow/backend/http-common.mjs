import {InputError, objectInput} from './validation.mjs';

export function json(res, status, payload) {
  res.writeHead(status, {'content-type': 'application/json;charset=utf-8'});
  res.end(JSON.stringify(payload));
}

export async function readJson(req) {
  const chunks = [];
  let bytes = 0;
  let tooLarge = false;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > 100000) tooLarge = true;
    if (!tooLarge) chunks.push(chunk);
  }
  if (tooLarge) throw new InputError('body_too_large');
  let input;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new InputError('invalid_json');
  }
  return objectInput(input);
}

export function requestError(res, error) {
  if (error instanceof InputError) {
    json(res, 400, {error: error.code, ...(error.field ? {field: error.field} : {})});
  } else if (error.code === 'invalid_transition') {
    json(res, 409, {error: 'invalid_transition'});
  } else {
    json(res, 500, {error: 'internal_error'});
  }
}

export function ticketId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
