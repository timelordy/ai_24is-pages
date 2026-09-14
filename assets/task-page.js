'use strict';
import {runtime, esc, pad, inline, block, doneSet, setDone, taskSteps, setTaskStep} from './lib.js';

function lessonNav(active) {
  return `<nav class="task-nav panel" aria-label="Задания курса">${runtime.course.map(item => `<a class="${item.number === active ? 'active' : ''}" href="#task-${item.number}"><span>${pad(item.number)}</span><b>${esc(item.title)}</b></a>`).join('')}</nav>`;
}

function renderContext(item) {
  if ((!item.context || !item.context.length) && (!item.choices || !item.choices.length)) return '';
  const context = (item.context || []).map(section => `<article class="context-card"><h3>${esc(section.title)}</h3>${block(section.body)}</article>`).join('');
  const choices = item.choices?.length ? `<article class="context-card"><h3>Выберите одно требование</h3><ol class="choice-list">${item.choices.map(choice => `<li>${inline(choice)}</li>`).join('')}</ol></article>` : '';
  return `<section class="task-section panel"><p class="eyebrow">Исходные условия</p><h2>Что требуется</h2>${context}${choices}</section>`;
}

function bulletList(items, tone = 'success') {
  const marker = tone === 'success' ? '✓' : '×';
  const background = tone === 'success' ? '#f2f8ef' : '#fff3ef';
  const border = tone === 'success' ? '#b7ceb0' : '#e2b8a8';
  return `<ul style="display:grid;gap:10px;margin:16px 0 0;padding:0;list-style:none">${(items || []).map(value => `<li style="display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;align-items:start;padding:13px 14px;border:1px solid ${border};border-radius:12px;background:${background}"><b aria-hidden="true">${marker}</b><span style="min-width:0">${inline(value)}</span></li>`).join('')}</ul>`;
}

export function renderTask(number) {
  const item = runtime.course.find(value => value.number === number);
  if (!item) return `<section class="empty panel"><h1>Задание не найдено</h1><a href="#tasks">Вернуться к списку</a></section>`;
  const done = doneSet().has(number);
  const checked = taskSteps(number);
  const previous = runtime.course[number - 2];
  const next = runtime.course[number];
  return `<header class="page-head"><p class="eyebrow">Задание ${pad(number)} / ${pad(runtime.course.length)} · 90 минут</p><h1>${esc(item.title)}</h1><p class="lead">${esc(item.goal || item.ability)}</p></header>
  <div class="task-layout">${lessonNav(number)}<div class="task-main">
    <section class="task-hero panel"><div class="actions"><a class="button primary starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">Скачать starter ZIP</a><a class="button secondary" href="${esc(item.downloads.task)}" download>Скачать TASK.md</a><a class="button" href="${esc(item.downloads.report)}" download>Шаблон отчёта</a></div>
      <div class="task-summary"><div class="summary-tile"><span>Рабочая ветка</span><b><code>${esc(item.branch || 'feature/...')}</code></b></div><div class="summary-tile"><span>GitVerse</span><b>${esc(item.gitverse)}</b></div><div class="summary-tile"><span>Главный результат</span><b>${esc(item.artifact)}</b></div></div>
    </section>
    ${renderContext(item)}
    <section class="task-section panel"><p class="eyebrow">Практическая работа</p><h2>Что сделать</h2><p class="task-section-intro">Галочки хранятся только в этом браузере и не являются сдачей.</p><ol class="steps">${item.steps.map((step, index) => `<li class="${checked.has(index) ? 'checked' : ''}"><label style="display:grid;grid-template-columns:22px minmax(0,1fr);gap:12px;align-items:start;width:100%;min-width:0"><input type="checkbox" data-step="${index}" ${checked.has(index) ? 'checked' : ''} aria-label="Шаг ${index + 1}"><span style="min-width:0;overflow-wrap:break-word">${inline(step)}</span></label></li>`).join('')}</ol></section>
    <section class="task-section panel" style="border-color:#a9c59f;background:#fbfff8"><p class="eyebrow">Definition of Done</p><h2>Успешный результат</h2><p class="task-section-intro">Работа считается выполненной только если совпали все обязательные проверки ниже.</p>${bulletList(item.success, 'success')}</section>
    <section class="task-section panel" style="border-color:#dfb19f;background:#fffaf7"><p class="eyebrow">Ложный успех</p><h2>Не засчитывается, если</h2>${bulletList(item.failure, 'failure')}</section>
    <section class="task-section panel"><p class="eyebrow">Артефакты</p><h2>Что сдавать</h2><div class="deliver-grid"><article class="deliver-card"><span>Основной результат</span><b>${esc(item.artifact)}</b></article>${item.minimum.map(value => `<article class="deliver-card"><span>Доказательство</span><b>${inline(value)}</b></article>`).join('')}</div></section>
    <section class="task-section panel"><p class="eyebrow">Приёмка</p><h2>Что проверит преподаватель</h2><ul class="steps check-steps">${item.acceptance.map(value => `<li><span>${inline(value)}</span></li>`).join('')}</ul></section>
    ${item.defense ? `<section class="task-section panel"><p class="eyebrow">Индивидуально</p><h2>Вопрос на защите</h2><div class="question">${inline(item.defense)}</div></section>` : ''}
    <section class="task-section panel"><p class="eyebrow">Файлы работы</p><h2>Что открыть</h2><div class="file-grid"><a class="file-link starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}"><b>Starter-репозиторий</b><span>Исходная версия для этой пары</span></a><a class="file-link" href="${esc(item.downloads.task)}" download><b>TASK.md</b><span>Полный текст задания</span></a><a class="file-link" href="${esc(item.downloads.report)}" download><b>REPORT.md</b><span>Отчёт и доказательства</span></a></div></section>
    <section class="progress-action panel"><div><b>${done ? 'Работа отмечена подготовленной' : 'Все критерии совпали?'}</b><p>Отмечайте готовность только после локальной проверки и нужного GitVerse-артефакта.</p></div><button class="${done ? '' : 'primary'}" id="toggle-done" data-number="${number}">${done ? 'Снять отметку' : 'Отметить подготовленной'}</button></section>
    <div class="task-controls"><span>${previous ? `<a href="#task-${previous.number}">← ${esc(previous.title)}</a>` : ''}</span><span>${next ? `<a href="#task-${next.number}">${esc(next.title)} →</a>` : `<a href="#work">Моя работа →</a>`}</span></div>
  </div></div>`;
}

export function bindTaskPage(route, rerender) {
  document.querySelectorAll('[data-step]').forEach(input => input.addEventListener('change', () => {
    const number = Number(route.split('-')[1]);
    setTaskStep(number, Number(input.dataset.step), input.checked);
    input.closest('li')?.classList.toggle('checked', input.checked);
  }));
  document.querySelector('#toggle-done')?.addEventListener('click', event => {
    const number = Number(event.currentTarget.dataset.number);
    setDone(number, !doneSet().has(number));
    rerender();
  });
}
