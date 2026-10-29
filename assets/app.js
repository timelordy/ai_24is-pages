'use strict';
import {$, esc, runtime, selectGroup, routeName, updateProgressPill, dayLabel, currentGroup, isSetupMeeting} from './lib.js?v=85b64ff4da2c';
import {renderTask, bindTaskPage, resolveTaskHash} from './task-page.js?v=85b64ff4da2c';
import {nextCourseLesson} from './course-progress.js?v=85b64ff4da2c';
import {bindStarterDownloads} from './starter-download.js?v=85b64ff4da2c';
import {renderHome, renderTasks, renderStart} from './pages-home.js?v=85b64ff4da2c';
import {renderRoute, renderStack, renderSchedule, renderWork, bindWork} from './pages-course.js?v=85b64ff4da2c';
let entered = false;
// The sticky offset follows wrapped navigation, rotation and larger user text.
if ('ResizeObserver' in window) {
  const headerObserver = new ResizeObserver(([entry]) => {
    const height = entry.target.getBoundingClientRect().height;
    const spacing = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    if (height > 0) document.documentElement.style.setProperty('--header-offset', `${Math.ceil(height + spacing)}px`);
  });
  headerObserver.observe(document.querySelector('.topbar'));
}
function setActiveNav(route) {
  document.querySelectorAll('.tabs a').forEach(link => {
    const active = link.dataset.route === route || ((route.startsWith('task-') || route === 'start') && link.dataset.route === 'tasks');
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
}
function revealTarget(target) {
  if (target.tagName === 'DETAILS') target.open = true;
  requestAnimationFrame(() => {
    target.scrollIntoView({block: 'start'});
    (target.tagName === 'DETAILS' ? target.querySelector('summary') : target).focus({preventScroll: true});
  });
}
function render(focusContent = true) {
  if (!entered) return;
  let route = routeName();
  if (route === 'current') { route = isSetupMeeting() ? 'start' : `task-${nextCourseLesson()?.number || 1}`; history.replaceState(null, '', `#${route}`); }
  const permittedHash=resolveTaskHash(location.hash);
  if (permittedHash!==location.hash) history.replaceState(null,'',permittedHash);
  let html;
  if (route === 'home') html = renderHome();
  else if (route === 'tasks') html = renderTasks();
  else if (route === 'start') html = renderStart();
  else if (route === 'route') html = renderRoute();
  else if (route === 'stack') html = renderStack();
  else if (route === 'schedule') html = renderSchedule();
  else if (route === 'work') html = renderWork();
  else if (/^task-[1-6]$/.test(route)) html = renderTask(Number(route.split('-')[1]));
  else html = renderHome();
  $('#app').innerHTML = html; $('#selected-group').textContent = runtime.state.group;
  const rerender = () => render(false);
  setActiveNav(route); updateProgressPill(); bindTaskPage(route, rerender); if (route === 'work') bindWork(rerender);
  document.querySelectorAll('.code-block').forEach(container => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'copy-command'; button.textContent = 'Копировать';
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(container.querySelector('code').textContent); button.textContent = 'Скопировано'; }
      catch { button.textContent = 'Выдели команду вручную'; }
    });
    container.append(button);
  });
  if (!focusContent) return;
  const anchor = location.hash.split('/')[1];
  const target = anchor && /^(part-\d+|checks|submit|files)$/.test(anchor) ? document.getElementById(anchor) : null;
  if (target) revealTarget(target);
  else { window.scrollTo(0, 0); $('#app').focus({preventScroll: true}); }
}
function openGroupPicker() {
  const dialog = $('#group-dialog'); $('#close-group').hidden = !entered;
  dialog.setAttribute('closedby', entered ? 'closerequest' : 'none');
  $('#group-options').innerHTML = runtime.schedule.map((group, index) => {
    const remembered = runtime.state.groupChosen && runtime.state.group === group.group;
    const indicator = remembered ? '<path d="m4 8 2.5 2.5L12 5"/>' : '<path d="m6 4 4 4-4 4"/>';
    return `<button class="group-option ${remembered ? 'remembered' : ''}" type="button" data-group-index="${index}" aria-label="${esc(group.group)}"><span class="group-option-title"><strong>${esc(group.group)}</strong></span><span class="group-option-time">${esc(dayLabel(group.dates[0]))} · ${esc(group.time)}</span><span class="group-option-time">${esc(group.room)}</span><span class="choice-indicator" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${indicator}</svg></span>${remembered ? '<span class="sr-only">Ранее выбрана</span>' : ''}</button>`;
  }).join('');
  $('#group-options').querySelectorAll('[data-group-index]').forEach(button => {
    button.addEventListener('click', () => {
      const group = runtime.schedule[Number(button.dataset.groupIndex)]; if (!group || !selectGroup(group.group)) return;
      const switching = entered; entered = true; $('#course-shell').hidden = false;
      // Incoming lesson links survive entry. Switching later returns to the new group's dashboard.
      if (switching || !location.hash) history.replaceState(null, '', '#home');
      dialog.close(); render();
    });
  });
  if (!dialog.open) dialog.showModal(); (dialog.querySelector('.remembered') || $('#group-dialog-title'))?.focus({preventScroll: true});
}
async function loadJson(path) { const response = await fetch(path, {cache: 'no-cache'}); if (!response.ok) throw new Error(`Не удалось загрузить ${path}`); return response.json(); }
function validateData(course, schedule) {
  if (!Array.isArray(course) || !course.length || !course.some(item => !item.locked)) throw new Error('Список заданий пока недоступен.');
  if (!Array.isArray(schedule) || !schedule.length || !schedule.every(item => typeof item.group === 'string' && Array.isArray(item.dates) && item.dates.length && typeof item.time === 'string')) throw new Error('Список групп пока недоступен.');
}
$('#group-dialog').addEventListener('cancel', event => { if (!entered) event.preventDefault(); });
// Older browsers ignore closedby; cancel can be noncancelable before user activation.
$('#group-dialog').addEventListener('keydown', event => { if (!entered && event.key === 'Escape') event.preventDefault(); });
$('#close-group').addEventListener('click', () => { if (entered) $('#group-dialog').close(); });
$('#change-group').addEventListener('click', openGroupPicker);
document.querySelector('.skip[href="#app"]').addEventListener('click', event => {
  event.preventDefault();
  $('#app').focus({preventScroll: true});
  $('#app').scrollIntoView({block: 'start'});
});
$('#app').addEventListener('click', event => {
  if (!entered || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#task-"]');
  if (!link || !$('#app').contains(link) || link.getAttribute('aria-disabled') === 'true' || link.hasAttribute('disabled') || link.hasAttribute('download')) return;
  if (link.getAttribute('target') && link.getAttribute('target') !== '_self') return;
  const hash = link.getAttribute('href');
  if (hash !== location.hash || !/^#task-[1-6]\/(part-\d+|checks|submit|files)$/.test(hash) || resolveTaskHash(hash) !== hash) return;
  const target = document.getElementById(hash.split('/')[1]);
  if (!target || !$('#app').contains(target)) return;
  event.preventDefault();
  revealTarget(target);
});
bindStarterDownloads();
Promise.all([loadJson('assets/course.json?v=85b64ff4da2c'), loadJson('assets/schedule.json?v=85b64ff4da2c')]).then(([course, schedule]) => {
  validateData(course, schedule);
  runtime.course = course;
  runtime.schedule = schedule;
  $('#boot-status').hidden = true;
  window.addEventListener('hashchange', () => render());
  if (runtime.state.groupChosen && currentGroup()) {
    entered = true;
    $('#course-shell').hidden = false;
    render();
  } else openGroupPicker();
}).catch(error => {
  const status = $('#boot-status');
  status.textContent = 'Не получилось загрузить курс. Проверьте интернет. ' + error.message;
  const retry = document.createElement('button');
  retry.textContent = 'Попробовать ещё раз';
  retry.id = 'retry-load';
  retry.addEventListener('click', () => location.reload());
  status.append(retry);
});
