'use strict';
import {runtime, esc, nearestLesson, currentOpenLesson, currentGroup, taskCard, isSetupMeeting, doneSet} from './lib.js?v=20260921-local';

function shortDate(value) {
  return new Date(`${value}T12:00:00+03:00`).toLocaleDateString('ru-RU', {day:'numeric', month:'long', timeZone:'Europe/Moscow'});
}

function nextClassCard(next) {
  if (!next || next.finished) return '<aside class="next-class-card panel"><p class="eyebrow">Расписание</p><h2>Пары закончились</h2><a href="#schedule">Открыть расписание →</a></aside>';
  return `<aside class="next-class-card panel"><p class="eyebrow">Следующая пара</p><h2>${shortDate(next.date)}</h2><p>${esc(next.group.time)}</p><p class="class-room">${esc(next.group.room)}</p><a href="#schedule">Расписание →</a></aside>`;
}

export function renderHome() {
  const group = currentGroup(), current = currentOpenLesson(), next = nearestLesson(), setup = isSetupMeeting();
  const href = setup ? '#start' : `#task-${current.number}`;
  const title = setup ? 'Поставить программы и запустить проект' : current.title;
  const note = setup ? 'Git, VS Code, Node.js и GigaCode. Цель — чтобы проект открылся и 5 тестов прошли. Отчёт пока не нужен.' : current.number === 1 ? 'Запусти готовый проект, проверь три ответа GigaCode по коду и отправь REPORT.md в GitVerse.' : (current.goal || current.ability);
  const label = setup ? 'Открыть настройку' : doneSet().has(current.number) ? `Открыть работу ${current.number} ещё раз` : `Открыть работу ${current.number}`;
  return `<section class="group-home page-head"><p class="eyebrow">${esc(group?.group)}</p><div class="group-dashboard"><a class="current-work panel" href="${href}"><div><span class="current-kicker">${setup ? 'Сначала' : 'Сейчас'}</span><h1>${esc(title)}</h1><p>${esc(note)}</p></div><span class="current-cta">${esc(label)} <span aria-hidden="true">→</span></span></a>${nextClassCard(next)}</div></section>`;
}

export function renderTasks() { return `<header class="page-head"><p class="eyebrow">${esc(runtime.state.group)}</p><h1>Все работы</h1><p class="lead">Один проект на весь семестр. Сейчас открыта только текущая работа; следующую я открою позже.</p></header><section class="task-grid">${runtime.course.map(taskCard).join('')}</section>`; }
export function renderCurrent() { return renderHome(); }
export function renderStart() {
  return `<header class="page-head"><p class="eyebrow">${esc(runtime.state.group)} · Вводная</p><h1>Поставить программы и запустить проект</h1><p class="lead">Нужно открыть Campus ServiceDesk и получить 5 пройденных тестов. Код пока не меняем, отчёт не сдаём.</p><div class="actions"><a class="button primary" href="#task-1/part-1">Начать</a><a class="button" href="#task-1/part-7">Программы уже стоят — открыть проект</a></div></header><section class="setup-list">${[
    ['GitVerse', 'Войти и получить доступ к своему репозиторию.', 1],
    ['Программы', 'Поставить Git, VS Code, Node.js и GigaCode.', 2],
    ['Проект', 'Открыть Campus ServiceDesk на компьютере.', 7],
    ['Проверка', 'Получить 5 тестов и увидеть 12 заявок в браузере.', 9]
  ].map(([title, text, part]) => `<article class="setup-step panel"><div><h2>${title}</h2><p>${text}</p><a href="#task-1/part-${part}">Открыть шаг →</a></div></article>`).join('')}</section><section class="notice panel setup-stop"><b>На вводной достаточно шагов 1–9.</b> Работа с ответами ИИ и REPORT.md начнётся в первой работе.</section>`;
}
