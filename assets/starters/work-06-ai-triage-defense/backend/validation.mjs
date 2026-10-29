const priorities = new Set(['low', 'normal', 'high']);
const categories = new Set(['equipment', 'network', 'software', 'access', 'other']);
const statuses = new Set(['new', 'in_progress', 'resolved', 'closed']);

export class InputError extends TypeError {
  constructor(code = 'validation_error', field) {
    super(code);
    this.code = code;
    this.field = field;
  }
}

export function objectInput(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InputError();
  return value;
}

function text(value, fallback = '') {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') throw new InputError();
  return value.trim();
}

export function ticketInput(value) {
  const input = objectInput(value);
  if (typeof input.title !== 'string' || !input.title.trim()) {
    throw new InputError('validation_error', 'title');
  }
  if (!priorities.has(input.priority) || !categories.has(input.category)) throw new InputError();
  return {
    title: input.title.trim(), description: text(input.description), location: text(input.location),
    priority: input.priority, category: input.category,
  };
}

export function statusInput(value) {
  const {status} = objectInput(value);
  if (!statuses.has(status)) throw new InputError();
  return status;
}

export function commentInput(value) {
  const input = objectInput(value);
  const comment = {author: text(input.author, 'Студент') || 'Студент', text: text(input.text)};
  if (!comment.text) throw new InputError('comment_text_required');
  if (comment.text.length > 1000) throw new InputError('comment_too_long');
  return comment;
}

export function triageInput(value) {
  const input = objectInput(value);
  return {title: text(input.title), description: text(input.description)};
}
