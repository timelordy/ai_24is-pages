'use strict';
import {runtime, esc, pad, inline, block, doneSet, setDone, taskSteps, setTaskStep, isSetupMeeting} from './lib.js?v=20260921-local';
import {renderLessonImages} from './lesson-images.js?v=20260921-local';
let disposeTaskToc = () => {};

function bindTaskToc() {
  const nav = document.querySelector('.task-nav');
  if (!nav) return () => {};
  const entries = [...nav.querySelectorAll('[data-toc-target]')].map(link => ({link, target: document.getElementById(link.dataset.tocTarget)})).filter(entry => entry.target);
  if (!entries.length) return () => {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeId = '';
  let frame = 0;

  function reveal(link) {
    const padding = 8;
    let left = nav.scrollLeft;
    let top = nav.scrollTop;
    if (link.offsetLeft < left + padding) left = link.offsetLeft - padding;
    else if (link.offsetLeft + link.offsetWidth > left + nav.clientWidth - padding) left = link.offsetLeft + link.offsetWidth - nav.clientWidth + padding;
    if (link.offsetTop < top + padding) top = link.offsetTop - padding;
    else if (link.offsetTop + link.offsetHeight > top + nav.clientHeight - padding) top = link.offsetTop + link.offsetHeight - nav.clientHeight + padding;
    nav.scrollTo({left: Math.max(0, left), top: Math.max(0, top), behavior: reducedMotion.matches ? 'auto' : 'smooth'});
  }

  function activate(id) {
    if (!id || id === activeId) return;
    activeId = id;
    entries.forEach(({link}) => {
      const active = link.dataset.tocTarget === id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const activeLink = entries.find(({link}) => link.dataset.tocTarget === id)?.link;
    if (activeLink) reveal(activeLink);
  }

  function sync() {
    frame = 0;
    const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-offset')) || 0;
    const activationLine = headerOffset + 24;
    let current = entries[0];
    for (const entry of entries) {
      if (entry.target.getBoundingClientRect().top <= activationLine) current = entry;
      else break;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = entries.at(-1);
    activate(current.target.id);
  }

  function scheduleSync() {
    if (!frame) frame = requestAnimationFrame(sync);
  }

  window.addEventListener('scroll', scheduleSync, {passive: true});
  window.addEventListener('resize', scheduleSync);
  document.querySelectorAll('.lesson-part, .lesson-files').forEach(details => details.addEventListener('toggle', scheduleSync));
  scheduleSync();
  return () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('scroll', scheduleSync);
    window.removeEventListener('resize', scheduleSync);
  };
}

function bulletList(items, tone = 'success') { return `<ul class="result-list ${tone === 'success' ? 'success-list' : 'failure-list'}">${(items || []).map(value => `<li><b aria-hidden="true">${tone === 'success' ? '✓' : '×'}</b><span>${inline(value)}</span></li>`).join('')}</ul>`; }
function files(item) {
  if (!item.downloads) return '';
  return `<details id="files" class="task-section panel lesson-files"><summary>Файлы: проект, инструкция и отчёт</summary><div class="actions"><a class="button primary starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">${item.number === 1 ? 'Скачать стартовый проект' : 'Резервная копия проекта'}</a><a class="button" href="${esc(item.downloads.task)}" download>Скачать инструкцию</a><a class="button" href="${esc(item.downloads.report)}" download>Шаблон отчёта</a></div><p>Проект запускается и изменяется на вашем компьютере в VS Code. Архив пригодится, если не сработало клонирование. Распакуйте его в обычную папку и откройте папку с <code>package.json</code>.</p></details>`;
}
function taskParts(item) {
  const checked = taskSteps(item.number); const parts = (item.context || []).filter(section => /^Часть\s+\d+\./.test(section.title)); const firstUnchecked = parts.findIndex((_, index) => !checked.has(index));
  if (!parts.length) return `<section id="part-1" tabindex="-1" class="task-section panel"><h2>Что делаем</h2>${(item.context || []).map(section => `<article class="context-card"><h3>${esc(section.title)}</h3>${block(section.body)}</article>`).join('')}<ol class="steps">${(item.steps || []).map((step, index) => `<li class="${checked.has(index) ? 'checked' : ''}"><label><input type="checkbox" data-step="${index}" ${checked.has(index) ? 'checked' : ''}><span>${inline(step)}</span></label></li>`).join('')}</ol></section>`;
  const phases = {1: '1. Настраиваем инструменты', 7: '2. Открываем и запускаем проект', 10: '3. Проверяем ответы ИИ', 13: '4. Сохраняем результат'};
  return `<section class="lesson-instructions" aria-label="Пошаговая инструкция"><div class="section-head"><div><h2>Делаем по шагам</h2><p id="lesson-progress-text" aria-live="polite">Пройдено ${checked.size} из ${parts.length}. Откройте нужный шаг.</p></div><button type="button" id="expand-steps">Развернуть все шаги</button></div>${parts.map((section, index) => {
    const part = Number(/^Часть\s+(\d+)\./.exec(section.title)[1]); const title = section.title.replace(/^Часть\s+\d+\.\s*/, '');
    const archive = part === 7 && item.downloads ? `<div class="archive-fallback"><b>Не получилось клонировать?</b><p>Скачайте тот же стартовый проект архивом, распакуйте его на компьютере и откройте папку с <code>package.json</code> в VS Code.</p><a class="button starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">Скачать стартовый проект</a></div>` : '';
    return `${item.number === 1 && phases[part] ? `<h3 class="phase-heading">${phases[part]}</h3>` : ''}<details id="part-${part}" class="lesson-part panel ${checked.has(index) ? 'step-complete' : ''}" ${index === firstUnchecked ? 'open' : ''}><summary><span class="part-number">${pad(part)}</span><span class="part-title">${esc(title)}</span><span class="part-state" data-step-badge="${index}">${checked.has(index) ? 'Готово' : 'Открыть'}</span></summary><div class="part-body">${block(section.body)}${archive}${renderLessonImages(item, section.title)}<label class="step-check"><input type="checkbox" data-step="${index}" ${checked.has(index) ? 'checked' : ''}><span>Этот шаг сделал, результат проверил</span></label>${index < parts.length - 1 ? `<a class="next-step" href="#task-${item.number}/part-${part + 1}">Следующий шаг →</a>` : ''}</div></details>`;
  }).join('')}</section>`;
}
export function renderTask(number) {
  const item = runtime.course.find(entry => entry.number === number);
  if (!item) return '<section class="empty panel"><h1>Задание не найдено</h1><a href="#tasks">Все задания</a></section>';
  if (item.locked) return `<header class="page-head"><p class="eyebrow">${esc(runtime.state.group)} · Работа ${pad(number)}</p><h1>${esc(item.title)}</h1></header><section class="task-section panel"><h2>Материалы пока закрыты</h2><p>Эту работу ещё не открыл преподаватель. Дата в расписании и галочки на сайте не открывают её автоматически.</p><p>Подробное задание, отчёт и архив появятся после публикации. Пока продолжайте открытые работы.</p><a class="button primary" href="#current">К открытой работе</a></section>`;
  const done = doneSet().has(number); const intro = number === 1 && isSetupMeeting();
  return `<header class="page-head lesson-heading"><p class="eyebrow">${esc(runtime.state.group)} · Работа ${pad(number)} из ${pad(runtime.course.length)}</p><h1>${esc(item.title)}</h1><p class="lead">${esc(item.goal || item.ability)}</p><div class="actions"><a class="button primary" href="#task-${number}/part-1">${number === 1 ? 'Начать с установки' : 'К шагам'}</a>${number === 1 ? '<a class="button" href="#task-1/part-7">Всё установлено — открыть проект</a>' : ''}<a class="button text" href="#task-${number}/submit">Что показать →</a></div></header>
  ${intro ? '<section class="notice panel"><b>У вашей группы сначала вводная встреча.</b> На ней достаточно шагов 1–9: установка и запуск. Шаги 10–13 и отчёт — для первой работы. <a href="#start">Открыть план вводной →</a></section>' : ''}

  <div class="task-layout lesson-layout"><nav class="task-nav panel lesson-toc" aria-label="На этой странице"><b class="toc-title">В этой работе</b>${number === 1 ? '<a href="#task-1/part-1" data-toc-target="part-1">Установка программ</a><a href="#task-1/part-7" data-toc-target="part-7">Проект и запуск</a><a href="#task-1/part-10" data-toc-target="part-10">Работа с GigaCode</a>' : ''}<a href="#task-${number}/checks" data-toc-target="checks">Как проверить</a><a href="#task-${number}/submit" data-toc-target="submit">Что показать</a><a href="#task-${number}/files" data-toc-target="files">Скачать файлы</a><a href="#tasks">Все задания →</a></nav><div class="task-main">${taskParts(item)}
  <section id="checks" tabindex="-1" class="task-section panel success-panel"><p class="eyebrow">Проверяем себя</p><h2>Как понять, что работа готова</h2><p>Успешный результат — когда каждый пункт можно показать, а не просто отметить.</p>${bulletList(item.success)}<details class="inline-help"><summary>Это не считается готовым</summary>${bulletList(item.failure, 'failure')}</details></section>
  <section id="submit" tabindex="-1" class="task-section panel"><p class="eyebrow">Показываем результат</p><h2>Что показать преподавателю</h2><p>Откройте локальный проект в VS Code и подготовьте:</p><ul class="submission-list">${(item.minimum || []).map(value => `<li>${inline(value)}</li>`).join('')}</ul><p><b>Ничего не отправляется с этого сайта и в GitVerse.</b> Отчёт остаётся в локальной ветке на вашем компьютере.</p>${item.defense ? `<details class="inline-help"><summary>Что я спрошу при проверке</summary><p>${inline(item.defense)}</p></details>` : ''}<details class="inline-help"><summary>Что будем проверять вместе</summary>${bulletList(item.acceptance)}</details></section>
  ${files(item)}<section class="progress-action panel"><div><b>${done ? 'Вы отметили эту работу' : 'Работа готова к проверке?'}</b><p>Эта кнопка только для вашего списка. Преподавателю она ничего не отправляет.</p></div><button id="toggle-done" data-number="${number}" aria-pressed="${done}">${done ? 'Снять отметку' : 'Отметить для себя'}</button></section>
  <div class="task-controls"><a href="#home">← К моей группе</a><a href="#tasks">Все задания →</a></div></div></div>`;
}
export function bindTaskPage(route, rerender) {
  disposeTaskToc();
  disposeTaskToc = bindTaskToc();
  const number = Number(route.split('-')[1]);
  document.querySelectorAll('[data-step]').forEach(input => input.addEventListener('change', () => {
    setTaskStep(number, Number(input.dataset.step), input.checked);
    input.closest('.lesson-part')?.classList.toggle('step-complete', input.checked);
    input.closest('li')?.classList.toggle('checked', input.checked);
    const badge = document.querySelector(`[data-step-badge="${input.dataset.step}"]`);
    if (badge) badge.textContent = input.checked ? 'Готово' : 'Открыть';
    const status = document.querySelector('#lesson-progress-text');
    if (status) status.textContent = `Пройдено ${taskSteps(number).size} из ${runtime.course.find(item => item.number === number)?.steps.length || 0}.`;
  }));
  document.querySelector('#toggle-done')?.addEventListener('click', () => {
    const y = window.scrollY;
    setDone(number, !doneSet().has(number));
    rerender();
    window.scrollTo(0, y);
    document.querySelector('#toggle-done')?.focus({preventScroll: true});
  });
  document.querySelector('#expand-steps')?.addEventListener('click', event => {
    const details = [...document.querySelectorAll('.lesson-part')];
    const open = details.some(detail => !detail.open);
    details.forEach(detail => { detail.open = open; });
    event.currentTarget.textContent = open ? 'Свернуть все шаги' : 'Развернуть все шаги';
  });
}
