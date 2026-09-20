'use strict';
import {runtime, esc, pad, inline, block, doneSet, setDone, taskSteps, setTaskStep, isSetupMeeting} from './lib.js?v=359ee70d123b';
import {renderLessonImages} from './lesson-images.js?v=359ee70d123b';
function bulletList(items, tone = 'success') { return `<ul class="result-list ${tone === 'success' ? 'success-list' : 'failure-list'}">${(items || []).map(value => `<li><b aria-hidden="true">${tone === 'success' ? '✓' : '×'}</b><span>${inline(value)}</span></li>`).join('')}</ul>`; }
function files(item) {
  if (!item.downloads) return '';
  return `<details id="files" class="task-section panel lesson-files"><summary>Файлы: проект, инструкция и отчёт</summary><div class="actions"><a class="button primary starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">${item.number === 1 ? 'Скачать стартовый проект' : 'Резервная копия проекта'}</a><a class="button" href="${esc(item.downloads.task)}" download>Скачать инструкцию</a><a class="button" href="${esc(item.downloads.report)}" download>Шаблон отчёта</a></div><p>Основной вариант — ваш репозиторий в GitVerse. Архив пригодится для первого запуска без доступа или для восстановления. Скачивание архива не создаёт репозиторий в GitVerse.</p></details>`;
}
function taskParts(item) {
  const checked = taskSteps(item.number); const parts = (item.context || []).filter(section => /^Часть\s+\d+\./.test(section.title)); const firstUnchecked = parts.findIndex((_, index) => !checked.has(index));
  if (!parts.length) return `<section id="part-1" tabindex="-1" class="task-section panel"><h2>Что делаем</h2>${(item.context || []).map(section => `<article class="context-card"><h3>${esc(section.title)}</h3>${block(section.body)}</article>`).join('')}<ol class="steps">${(item.steps || []).map((step, index) => `<li class="${checked.has(index) ? 'checked' : ''}"><label><input type="checkbox" data-step="${index}" ${checked.has(index) ? 'checked' : ''}><span>${inline(step)}</span></label></li>`).join('')}</ol></section>`;
  const phases = {1: '1. Настраиваем инструменты', 7: '2. Открываем и запускаем проект', 10: '3. Проверяем ответы ИИ', 13: '4. Отправляем результат'};
  return `<section class="lesson-instructions" aria-label="Пошаговая инструкция"><div class="section-head"><div><h2>Делаем по шагам</h2><p id="lesson-progress-text" aria-live="polite">Пройдено ${checked.size} из ${parts.length}. Откройте нужный шаг.</p></div><button type="button" id="expand-steps">Развернуть все шаги</button></div>${parts.map((section, index) => {
    const part = Number(/^Часть\s+(\d+)\./.exec(section.title)[1]); const title = section.title.replace(/^Часть\s+\d+\.\s*/, '');
    const archive = part === 7 && item.downloads ? `<div class="archive-fallback"><b>Пока нет ссылки на репозиторий?</b><p>Не придумывайте адрес. Уточните его у преподавателя. Пока можно скачать архив и проверить запуск по шагу 9. Ветку и отправку отчёта сделаете после получения доступа.</p><a class="button starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">Скачать стартовый проект</a></div>` : '';
    return `${item.number === 1 && phases[part] ? `<h3 class="phase-heading">${phases[part]}</h3>` : ''}<details id="part-${part}" class="lesson-part panel ${checked.has(index) ? 'step-complete' : ''}" ${index === firstUnchecked ? 'open' : ''}><summary><span class="part-number">${pad(part)}</span><span class="part-title">${esc(title)}</span><span class="part-state" data-step-badge="${index}">${checked.has(index) ? 'Готово' : 'Открыть'}</span></summary><div class="part-body">${block(section.body)}${archive}${renderLessonImages(item, section.title)}<label class="step-check"><input type="checkbox" data-step="${index}" ${checked.has(index) ? 'checked' : ''}><span>Этот шаг сделал, результат проверил</span></label>${index < parts.length - 1 ? `<a class="next-step" href="#task-${item.number}/part-${part + 1}">Следующий шаг →</a>` : ''}</div></details>`;
  }).join('')}</section>`;
}
export function renderTask(number) {
  const item = runtime.course.find(entry => entry.number === number);
  if (!item) return '<section class="empty panel"><h1>Задание не найдено</h1><a href="#tasks">Все задания</a></section>';
  if (item.locked) return `<header class="page-head"><p class="eyebrow">${esc(runtime.state.group)} · Работа ${pad(number)}</p><h1>${esc(item.title)}</h1></header><section class="task-section panel"><h2>Материалы пока закрыты</h2><p>Эту работу ещё не открыл преподаватель. Дата в расписании и галочки на сайте не открывают её автоматически.</p><p>Подробное задание, отчёт и архив появятся после публикации. Пока продолжайте открытые работы.</p><a class="button primary" href="#current">К открытой работе</a></section>`;
  const done = doneSet().has(number); const intro = number === 1 && isSetupMeeting();
  return `<header class="page-head lesson-heading"><p class="eyebrow">${esc(runtime.state.group)} · Работа ${pad(number)} из ${pad(runtime.course.length)}</p><h1>${esc(item.title)}</h1><p class="lead">${esc(item.goal || item.ability)}</p></header>
  ${intro ? '<section class="notice panel"><b>У вашей группы сначала вводная встреча.</b> На ней достаточно шагов 1–9: установка и запуск. Шаги 10–13 и отчёт — для первой работы. <a href="#start">Открыть план вводной →</a></section>' : ''}
  <section class="task-hero panel lesson-brief"><h2>${number === 1 ? 'Что делаем сегодня' : 'Задача этой работы'}</h2><p>${number === 1 ? 'Берём готовый сайт с 12 заявками. Запускаем его, просим GigaCode объяснить код и проверяем три его утверждения по файлам. Сам код пока не меняем.' : esc(item.artifact)}</p><div class="actions"><a class="button primary" href="#task-${number}/part-1">${number === 1 ? 'Начать с установки' : 'К шагам'}</a>${number === 1 ? '<a class="button" href="#task-1/part-7">Всё установлено — открыть проект</a>' : ''}<a class="button text" href="#task-${number}/submit">Что сдавать →</a></div></section>
  <div class="task-layout lesson-layout"><nav class="task-nav panel lesson-toc" aria-label="На этой странице"><b class="toc-title">В этой работе</b>${number === 1 ? '<a href="#task-1/part-1">Установка программ</a><a href="#task-1/part-7">Проект и запуск</a><a href="#task-1/part-10">Работа с GigaCode</a>' : ''}<a href="#task-${number}/checks">Как проверить</a><a href="#task-${number}/submit">Что сдавать</a><a href="#task-${number}/files">Скачать файлы</a><a href="#tasks">Все задания →</a></nav><div class="task-main">${taskParts(item)}
  <section id="checks" tabindex="-1" class="task-section panel success-panel"><p class="eyebrow">Проверяем себя</p><h2>Как понять, что работа готова</h2><p>Успешный результат — когда каждый пункт можно показать, а не просто отметить.</p>${bulletList(item.success)}<details class="inline-help"><summary>Это не считается готовым</summary>${bulletList(item.failure, 'failure')}</details></section>
  <section id="submit" tabindex="-1" class="task-section panel"><p class="eyebrow">Отправляем результат</p><h2>Что сдавать</h2><p>Покажите свой проект и подготовьте:</p><ul class="submission-list">${(item.minimum || []).map(value => `<li>${inline(value)}</li>`).join('')}</ul><p><b>Ничего не отправляется с этого сайта.</b> Отчёт должен лежать в вашей ветке GitVerse. После отправки откройте ветку в браузере и проверьте, что файл там есть.</p>${item.defense ? `<details class="inline-help"><summary>Что я спрошу при сдаче</summary><p>${inline(item.defense)}</p></details>` : ''}<details class="inline-help"><summary>Что будем проверять вместе</summary>${bulletList(item.acceptance)}</details></section>
  ${files(item)}<section class="progress-action panel"><div><b>${done ? 'Вы отметили эту работу' : 'Работа готова и отправлена?'}</b><p>Эта кнопка только для вашего списка. Преподавателю она ничего не отправляет.</p></div><button id="toggle-done" data-number="${number}" aria-pressed="${done}">${done ? 'Снять отметку' : 'Отметить для себя'}</button></section>
  <div class="task-controls"><a href="#home">← К моей группе</a><a href="#tasks">Все задания →</a></div></div></div>`;
}
export function bindTaskPage(route, rerender) {
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
