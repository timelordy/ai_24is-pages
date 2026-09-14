'use strict';

// All page modules must use the same canonical shared-state import.
// Cache versions are assigned once in index.html, not per importing module.
import {$, esc, runtime, save, routeName, updateProgressPill} from './lib.js?v=99b18c7fecee';
import {renderTask, bindTaskPage} from './task-page.js?v=99b18c7fecee';
import {bindStarterDownloads} from './starter-download.js?v=99b18c7fecee';
import {renderHome, renderTasks, renderCurrent, renderStart} from './pages-home.js?v=99b18c7fecee';
import {renderRoute, renderSchedule, renderWork, bindWork} from './pages-course.js?v=99b18c7fecee';

function setActiveNav(route) {
  document.querySelectorAll('.tabs a').forEach(link => {
    const active = link.dataset.route === route ||
      (route.startsWith('task-') && link.dataset.route === 'current');
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function render() {
  const route = routeName();
  let html;
  if (route === 'home') html = renderHome();
  else if (route === 'tasks') html = renderTasks();
  else if (route === 'current') html = renderCurrent();
  else if (route === 'start') html = renderStart();
  else if (route === 'route') html = renderRoute();
  else if (route === 'schedule') html = renderSchedule();
  else if (route === 'work') html = renderWork();
  else if (/^task-[1-6]$/.test(route)) html = renderTask(Number(route.split('-')[1]));
  else html = renderHome();
  $('#app').innerHTML = html;
  setActiveNav(route);
  updateProgressPill();
  bindTaskPage(route, render);
  if (route === 'work') bindWork(render);
  $('#app').focus({preventScroll: true});
}

async function loadJson(path) {
  const response = await fetch(path, {cache: 'no-cache'});
  if (!response.ok) throw new Error(`Не удалось загрузить ${path}`);
  return response.json();
}

bindStarterDownloads();
Promise.all([
  loadJson('assets/course.json?v=99b18c7fecee'),
  loadJson('assets/schedule.json?v=99b18c7fecee'),
]).then(([course, schedule]) => {
  runtime.course = course;
  runtime.schedule = schedule;
  if (!schedule.some(item => item.group === runtime.state.group)) {
    runtime.state.group = schedule[0].group;
  }
  const picker = $('#group');
  picker.innerHTML = schedule.map(item =>
    `<option value="${esc(item.group)}">${esc(item.group)}</option>`).join('');
  picker.value = runtime.state.group;
  picker.addEventListener('change', () => {
    runtime.state.group = picker.value;
    save();
    render();
  });
  window.addEventListener('hashchange', render);
  if (!location.hash) history.replaceState(null, '', '#home');
  render();
}).catch(error => {
  $('#app').innerHTML = `<section class="empty panel"><h1>Материалы не загрузились</h1><p>${esc(error.message)}</p><a class="button" href="?reload=13#task-1">Повторить загрузку первого урока</a></section>`;
});
