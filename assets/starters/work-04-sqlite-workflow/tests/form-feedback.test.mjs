import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {once} from 'node:events';
import {createServiceDeskServer} from '../server.mjs';
import {createMemoryStore} from '../backend/memory-store.mjs';
import {createTicket} from '../src/api-client.js';

async function fixture(t, createFails = false, create = null) {
  const elements = new Map();
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      value: '', textContent: '', hidden: false, listeners: {},
      addEventListener(name, callback) {this.listeners[name] = callback;},
      replaceChildren() {},
    });
    return elements.get(selector);
  }
  const form = element('#create-form');
  form.elements = Object.fromEntries(['title', 'description', 'location', 'priority', 'category']
    .map(name => [name, element(`[name=${name}]`)]));
  form.elements.title.value = 'Синтетическая заявка';
  let resets = 0;
  form.reset = () => {resets++; form.elements.title.value = '';};
  element('#comment-form').elements = {ticketId: element('ticketId'), text: element('commentText')};
  let lists = 0;
  let creates = 0;
  const api = {
    async listTickets() {if (++lists > 1) throw new Error('refresh failed'); return [];},
    async createTicket(input) {
      creates++;
      if (createFails) throw new Error('create failed');
      if (create) return create(input);
      return {id: 113};
    },
    async getConfig() {return {ai: {mode: 'demo', testMode: true}};},
    async listComments() {return [];},
    async addComment() {}, async triageTicket() {},
  };
  const previous = {document: globalThis.document, FormData: globalThis.FormData};
  globalThis.document = {querySelector: element};
  globalThis.FormData = class {
    constructor(target) {this.target = target;}
    [Symbol.iterator]() {
      return Object.entries(this.target.elements).map(([key, value]) => [key, value.value])[Symbol.iterator]();
    }
  };
  globalThis.formFeedbackApi = api;
  t.after(() => {
    globalThis.document = previous.document; globalThis.FormData = previous.FormData;
    delete globalThis.formFeedbackApi;
  });
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8')
    .replace(/import .*?from ["']\.\/tickets.js["'];/, 'const applyTicketQuery = x => x; const priorityLabel = x => x; const statusLabel = x => x;')
    .replace(/import .*?from ["']\.\/api-client.js["'];/, 'const {createTicket,listTickets,addComment,listComments,triageTicket,getConfig} = globalThis.formFeedbackApi;');
  await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${Math.random()}`);
  return {form, status: element('#form-status'), creates: () => creates, resets: () => resets};
}

test('successful creation remains confirmed when refreshing the list fails', async t => {
  const f = await fixture(t);
  await f.form.listeners.submit({preventDefault() {}});
  assert.match(f.status.textContent, /Создана заявка #113/);
  assert.match(f.status.textContent, /Список не обновился/);
  assert.doesNotMatch(f.status.textContent, /Ошибка:/);
  assert.equal(f.creates(), 1);
  assert.equal(f.resets(), 1);
});

test('failed creation preserves the entered form and reports the error', async t => {
  const f = await fixture(t, true);
  await f.form.listeners.submit({preventDefault() {}});
  assert.match(f.status.textContent, /Ошибка: create failed/);
  assert.equal(f.form.elements.title.value, 'Синтетическая заявка');
  assert.equal(f.resets(), 0);
});

test('blank titles keep the HTTP contract and show actionable feedback until corrected', async t => {
  const store = createMemoryStore();
  const server = createServiceDeskServer({store, env: {}});
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const fetch = globalThis.fetch;
  globalThis.fetch = (path, options) => fetch(new URL(path, `http://127.0.0.1:${server.address().port}`), options);
  t.after(() => {globalThis.fetch = fetch;});
  const f = await fixture(t, false, async input => {
    try {
      return await createTicket(input);
    } catch (error) {
      assert.equal(error.status, 400);
      assert.deepEqual(error.body, {error: 'validation_error', field: 'title'});
      throw error;
    }
  });
  f.form.elements.priority.value = 'normal';
  f.form.elements.category.value = 'equipment';
  f.form.elements.description.value = 'Описание сохраняется';
  for (const title of ['', '   ', '\t\n\u00a0']) {
    f.form.elements.title.value = title;
    await f.form.listeners.submit({preventDefault() {}});
    assert.equal(f.status.textContent, 'Ошибка: Введите заголовок заявки. Он не должен состоять только из пробелов.');
    assert.equal(f.form.elements.title.value, title);
    assert.equal(f.form.elements.description.value, 'Описание сохраняется');
    assert.equal(f.resets(), 0);
    assert.equal(store.list().length, 0);
  }
  f.form.elements.title.value = 'Исправленный заголовок';
  await f.form.listeners.submit({preventDefault() {}});
  assert.match(f.status.textContent, /Создана заявка #/);
  assert.doesNotMatch(f.status.textContent, /Ошибка:|validation_error/);
  assert.equal(f.creates(), 4);
  assert.equal(f.resets(), 1);
  assert.equal(store.list().length, 1);
});

test('create and optional comment controls have visible associated labels', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const forms = [...html.matchAll(/<form\b[^>]*id="(?:create|comment)-form"[^>]*>([\s\S]*?)<\/form>/g)];
  assert.ok(forms.length > 0);
  for (const [, form] of forms) {
    const controls = [...form.matchAll(/<(?:input|select|textarea)\b[^>]*name="([^"]+)"/g)];
    const labelled = [...form.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g)];
    for (const [, name] of controls) {
      assert.ok(labelled.some(([, label]) => label.includes(`name="${name}"`) && /^\s*[^<\s]/.test(label)), name);
    }
  }
});
