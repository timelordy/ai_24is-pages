'use strict';
import {runtime, esc, pad, dateLabel, currentGroup, doneSet, setDone} from './lib.js';

export function renderRoute() {
  return `<header class="page-head"><p class="eyebrow">От входа до защиты</p><h1>Этапы работы</h1><p class="lead">Шесть обязательных работ складываются в один инженерный цикл. Каждая следующая добавляет только один новый слой.</p></header>
  <section class="route-grid">${runtime.course.map(item => `<article class="stage-card panel"><div class="stage-head"><span class="stage-number">${pad(item.number)}</span><span class="status">РАБОТА ${item.number}</span></div><h3>${esc(item.title)}</h3><h4>Перед работой</h4><p>Скачайте starter, откройте <code>TASK.md</code> и найдите блок «Успешный результат».</p><h4>На паре</h4><p>${esc(item.agent)}</p><h4>В итоге</h4><p>${esc(item.artifact)}</p><div class="accept"><b>Можно идти дальше, если</b>${esc((item.success || item.acceptance).slice(0, 2).join('; '))}</div><div class="actions"><a class="button text" href="#task-${item.number}">Открыть задание →</a></div></article>`).join('')}</section>`;
}

export function renderSchedule() {
  const group = currentGroup();
  const introRow = group.intro ? `<tr><td>00</td><td>${dateLabel(group.intro.date)}</td><td><b>${esc(group.intro.title)}</b><br><span class="muted">Без отдельной обязательной лабораторной</span></td><td>${esc(group.intro.note)}</td></tr>` : '';
  const cancelled = group.cancelledFirst ? `<div class="notice panel panel-pad"><b>Первая запланированная встреча не проводится:</b> ${dateLabel(group.cancelledFirst)}. ${group.intro ? 'Следующая встреча используется как вводная настройка, после неё идут шесть одинаковых обязательных работ для всех групп.' : 'Оставшиеся шесть встреч соответствуют шести обязательным работам.'}</div>` : '';
  return `<header class="page-head"><p class="eyebrow">${esc(group.group)} · ${esc(group.room)}</p><h1>Расписание</h1><p class="lead">${esc(group.time)} · время московское. Выберите свою подгруппу в верхней панели.</p></header>
  ${cancelled}
  <section class="panel panel-pad schedule-wrap"><table class="schedule"><thead><tr><th>№</th><th>Дата</th><th>Работа</th><th>Результат</th></tr></thead><tbody>${introRow}${group.dates.map((date, index) => { const item = runtime.course[index]; return `<tr><td>${pad(item.number)}</td><td>${dateLabel(date)}</td><td><a href="#task-${item.number}">${esc(item.title)}</a></td><td>${esc(item.artifact)}</td></tr>`; }).join('')}</tbody></table></section>`;
}

export function renderWork() {
  const done = doneSet();
  return `<header class="page-head"><p class="eyebrow">Личный чек-лист · ${esc(runtime.state.group)}</p><h1>Моя работа</h1><p class="lead">Отметка означает, что вы проверили весь Definition of Done. Она хранится только в браузере и не заменяет GitVerse, CI и защиту.</p></header>
  <section class="work-list">${runtime.course.map(item => `<article class="work-row panel"><span class="number">${pad(item.number)}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.artifact)}</p></div><div class="actions"><button data-work="${item.number}" class="${done.has(item.number) ? '' : 'primary'}">${done.has(item.number) ? 'Снять отметку' : 'Все критерии PASS'}</button><a class="button" href="#task-${item.number}">Задание</a></div></article>`).join('')}</section>`;
}

export function bindWork(rerender) {
  document.querySelectorAll('[data-work]').forEach(button => button.addEventListener('click', () => {
    const number = Number(button.dataset.work);
    setDone(number, !doneSet().has(number));
    rerender();
  }));
}
