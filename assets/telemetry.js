export const TELEMETRY_CONFIG = Object.freeze({enabled: false, endpoint: ''});

const fields = ['group', 'lesson', 'step', 'kind', 'detail'];
const groups = ['24is02-1', '24is02-2', '24is03-1', '24is03-2', 'unknown'];
const details = {
  route_view: ['home', 'tasks', 'start', 'route', 'stack', 'schedule', 'work', 'lesson', 'files', 'submit', 'checks'],
  step_toggle: ['checked', 'unchecked'],
  navigation_blocked: ['required_step', 'prior_required_work', 'unreleased'],
  copy_result: ['success', 'failure'],
  image_open: ['screenshot', 'illustration'],
  download: ['requested', 'prepared', 'failure'],
  app_error: ['course_load'],
  group_selected: ['selected'],
};

function configuredEndpoint(config) {
  try {
    if (config?.enabled !== true) return '';
    const endpoint = config.endpoint;
    if (typeof endpoint !== 'string' || !/^https:\/\/[^/?#\\@\s]+\/v1\/course-events$/i.test(endpoint)) return '';
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || url.pathname !== '/v1/course-events' || url.username || url.password || url.search || url.hash) return '';
    return endpoint;
  } catch {
    return '';
  }
}

function safeEvent(input) {
  if (!input || typeof input !== 'object') return null;
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const keys = Reflect.ownKeys(input);
  if (keys.length !== fields.length || keys.some(key => !fields.includes(key))) return null;
  const values = fields.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
  });
  const [group, lesson, step, kind, detail] = values;
  if (typeof group !== 'string' || !groups.includes(group)
    || !Number.isInteger(lesson) || lesson < 0 || lesson > 6
    || !Number.isInteger(step) || step < 0 || step > 13
    || typeof kind !== 'string' || !Object.hasOwn(details, kind)
    || typeof detail !== 'string' || !details[kind].includes(detail)) return null;
  if (lesson === 0 && step !== 0) return null;
  if (group === 'unknown' && kind !== 'app_error') return null;
  switch (kind) {
    case 'step_toggle':
      if (lesson === 0 || step === 0) return null;
      break;
    case 'navigation_blocked':
    case 'image_open':
      if (lesson === 0) return null;
      break;
    case 'group_selected':
    case 'app_error':
      if (lesson !== 0 || step !== 0) return null;
      break;
    case 'route_view':
      if (detail === 'lesson') {
        if (lesson === 0 || step === 0) return null;
      } else if (['files', 'submit', 'checks'].includes(detail)) {
        if (lesson === 0 || step !== 0) return null;
      } else if (lesson !== 0 || step !== 0) return null;
  }
  return {group, lesson, step, kind, detail};
}

export function createTelemetry(config = TELEMETRY_CONFIG, dependencies = {}) {
  const endpoint = configuredEndpoint(config);
  let attempts = 0, inFlight = false;
  return {async emit(event) {
    // Drop invalid, concurrent and over-budget events; never queue or retry them.
    if (!endpoint || inFlight || attempts >= 120) return;
    inFlight = true;
    try {
      const safe = safeEvent(event);
      if (!safe) return;
      attempts++;
      const injectedFetch = dependencies.fetch;
      const fetch = injectedFetch === undefined ? globalThis.fetch : injectedFetch;
      if (typeof fetch !== 'function') return;
      await fetch.call(globalThis, endpoint, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error',
        body: JSON.stringify({version: 1, events: [safe]}),
      });
    } catch {
      // Telemetry must not affect the course, including synchronous transport failures.
    } finally {
      inFlight = false;
    }
  }};
}

export const telemetry = createTelemetry(TELEMETRY_CONFIG);
