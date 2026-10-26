'use strict';
import {runtime, esc, pad, dateLabel, nearestLesson, currentOpenLesson, currentGroup, doneSet, taskSteps, lessonPosition} from './lib.js?v=05de98df22b4';

function resumeStep(item) {
  const steps=item.guide?.steps || [];
  const saved=steps.find(step=>step.id===lessonPosition(item.number));
  return saved || steps.find((_,index)=>!taskSteps(item.number).has(index)) || steps[0];
}
function workList() {
  const group=currentGroup(), done=doneSet();
  return `<section class="handbook-work-list" aria-label="Работы по курсу">${runtime.course.map(item=>{
    const step=resumeStep(item), date=group?.dates[item.number-1];
    return `<article class="handbook-work-row ${item.locked ? 'is-locked' : ''}"><span class="handbook-work-number">${pad(item.number)}</span><div class="handbook-work-description"><h2>${esc(item.title)}</h2><p>${esc(item.ability)}</p>${date ? `<span class="handbook-work-date">По расписанию: ${dateLabel(date)}</span>` : ''}</div><div class="handbook-work-actions"><span class="handbook-work-status">${item.locked ? 'Материалы ещё не открыты' : done.has(item.number) ? 'Отмечено для себя' : 'Доступна'}</span>${item.locked ? '<span class="handbook-lock-note">Откроет преподаватель</span>' : `<a class="button primary" href="#task-${item.number}${step ? `/part-${step.id}` : ''}">Открыть работу</a>`}</div></article>`;
  }).join('')}</section>`;
}
export function renderHome() {
  const group=currentGroup(), current=currentOpenLesson(), step=resumeStep(current), next=nearestLesson();
  const href=`#task-${current.number}${step ? `/part-${step.id}` : ''}`;
  return `<header class="handbook-heading"><div><h1>Методы искусственного интеллекта</h1><p>Интерактивная методичка · ${esc(group?.group)}</p></div><a class="button" href="#schedule">Расписание группы</a></header><section class="handbook-current" aria-label="Текущая работа"><div><p class="course-label">Работа ${pad(current.number)}</p><h2>${esc(current.guide?.title || current.title)}</h2>${step ? `<p class="handbook-resume">Шаг ${step.id}. ${esc(step.title)}</p>` : `<p>${esc(current.ability)}</p>`}<div class="actions"><a class="button primary" href="${href}">${lessonPosition(current.number) ? 'Продолжить с этого шага' : 'Начать работу'}</a><a class="button" href="#task-${current.number}/files">Материалы к работе</a></div></div><aside class="handbook-class"><strong>Ближайшее занятие</strong>${next && !next.finished ? `<p>${dateLabel(next.date)}</p><p>${esc(next.group.time)}</p><p>Аудитория ${esc(next.group.room)}</p>` : '<p>Встречи по расписанию завершены.</p>'}</aside></section><div class="section-head handbook-section-head"><h2>Работы по курсу</h2><a class="button" href="#tasks">Все работы</a></div>${workList()}<section class="handbook-help"><h2>Если нужна помощь</h2><div class="actions"><a class="button" href="#start">Установка программ</a><a class="button" href="#task-1/part-8">Подключение OpenCode</a><a class="button" href="#route">Порядок выполнения работы</a></div><p>Все действия находятся внутри работ. Дополнительные текстовые инструкции скачивать необязательно.</p></section>`;
}
export function renderTasks() {
  return `<header class="handbook-heading"><div><h1>Работы по курсу</h1><p>${esc(runtime.state.group)} · Продолжаем один учебный проект на следующих занятиях.</p></div><a class="button" href="#home">К текущей работе</a></header>${workList()}`;
}
export function renderCurrent() { return renderHome(); }
export function renderStart() {
  return `<header class="handbook-heading"><div><h1>Подготовка к первой работе</h1><p>Установи программы, открой учебный сайт и подключи помощника.</p></div><a class="button primary" href="#task-1/part-1">Открыть пошаговую инструкцию</a></header><section class="setup-list">${[
    ['Git', 'Хранит историю файлов на компьютере. Сохраним исходный сайт и посмотрим, что изменил агент.', 2],
    ['VS Code', 'Редактор файлов проекта. В нём откроем код и терминал: панель для ввода команд.', 3],
    ['Node.js и npm', 'Node.js — среда выполнения JavaScript. Она запустит сервер учебного сайта. npm — менеджер пакетов в комплекте: через него установим OpenCode.', 4],
    ['OpenCode', 'Программа для общения с агентом в папке проекта. Попросим его объяснить код и заполнить отчёт. Модель ИИ подключим отдельно.', 5],
    ['Учебный проект', 'Клонируй проект преподавателя с GitVerse. В пустой папке «Методы ИИ» появится Campus-ServiceDesk с файлами и историей Git.', 7],
    ['Подключение ИИ', 'Введи личный ключ в OpenCode и выбери модель. Затем попросим агента запустить сайт.', 8]
  ].map(([title,text,part])=>`<article class="setup-step panel"><div><h2>${title}</h2><p>${text}</p><a class="button" href="#task-1/part-${part}">Открыть шаг</a></div></article>`).join('')}</section>`;
}
