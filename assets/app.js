'use strict';
import {$, esc, runtime, selectGroup, routeName, updateProgressPill, dayLabel, currentOpenLesson, isSetupMeeting} from './lib.js?v=18dc50422886';
import {renderTask, bindTaskPage} from './task-page.js?v=19';
import {bindStarterDownloads} from './starter-download.js?v=18dc50422886';
import {renderHome, renderTasks, renderStart} from './pages-home.js?v=18dc50422886';
import {renderRoute, renderSchedule, renderWork, bindWork} from './pages-course.js?v=18dc50422886';
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
function render() {
  if (!entered) return;
  let route = routeName();
  if (route === 'current') { route = isSetupMeeting() ? 'start' : `task-${currentOpenLesson()?.number || 1}`; history.replaceState(null, '', `#${route}`); }
  let html;
  if (route === 'home') html = renderHome();
  else if (route === 'tasks') html = renderTasks();
  else if (route === 'start') html = renderStart();
  else if (route === 'route') html = renderRoute();
  else if (route === 'schedule') html = renderSchedule();
  else if (route === 'work') html = renderWork();
  else if (/^task-[1-6]$/.test(route)) html = renderTask(Number(route.split('-')[1]));
  else html = renderHome();
  $('#app').innerHTML = html; $('#selected-group').textContent = runtime.state.group;
  setActiveNav(route); updateProgressPill(); bindTaskPage(route, render); if (route === 'work') bindWork(render);
  const anchor = location.hash.split('/')[1];
  const target = anchor && /^(part-\d+|checks|submit|files)$/.test(anchor) ? document.getElementById(anchor) : null;
  if (target) { if (target.tagName === 'DETAILS') target.open = true; requestAnimationFrame(() => { target.scrollIntoView({block: 'start'}); (target.querySelector('summary') || target).focus({preventScroll: true}); }); }
  else { window.scrollTo(0, 0); $('#app').focus({preventScroll: true}); }
}
function openGroupPicker() {
  const dialog = $('#group-dialog'); $('#close-group').hidden = !entered;
  $('#group-options').innerHTML = runtime.schedule.map((group, index) => {
    const [name, subgroup] = group.group.split(' — ');
    const remembered = runtime.state.groupChosen && runtime.state.group === group.group;
    const indicator = remembered ? '<path d="m4 8 2.5 2.5L12 5"/>' : '<path d="m6 4 4 4-4 4"/>';
    return `<button class="group-option ${remembered ? 'remembered' : ''}" type="button" data-group-index="${index}" aria-label="${esc(group.group)}"><span class="group-option-title"><span class="group-option-name">${esc(name)}</span><strong>${esc(subgroup || group.group)}</strong></span><span class="group-option-time">${esc(dayLabel(group.dates[0]))} · ${esc(group.time)}</span><span class="choice-indicator" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${indicator}</svg></span>${remembered ? '<span class="sr-only">Ранее выбрана</span>' : ''}</button>`;
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
$('#close-group').addEventListener('click', () => { if (entered) $('#group-dialog').close(); });
$('#change-group').addEventListener('click', openGroupPicker);
bindStarterDownloads();
Promise.all([loadJson('assets/course.json?v=18dc50422886'), loadJson('assets/schedule.json?v=18dc50422886')]).then(([course, schedule]) => {
  validateData(course, schedule);
  runtime.course = course;
  runtime.schedule = schedule;
  $('#boot-status').hidden = true;
  window.addEventListener('hashchange', render);
  openGroupPicker();
}).catch(error => {
  const status = $('#boot-status');
  status.textContent = 'Не получилось загрузить курс. Проверьте интернет. ' + error.message;
  const retry = document.createElement('button');
  retry.textContent = 'Попробовать ещё раз';
  retry.id = 'retry-load';
  retry.addEventListener('click', () => location.reload());
  status.append(retry);
});
