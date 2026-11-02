'use strict';
import {runtime, esc, pad, dateLabel, nearestLesson, currentGroup, doneSet, moduleScheduleLabel, block} from './lib.js?v=089533b3fb24';
import {agentChoice, lessonForAgent} from './visual-lesson.js?v=089533b3fb24';
import {lessonProgress, courseProgress, prerequisiteLesson, resumeStepId, nextCourseLesson} from './course-progress.js?v=089533b3fb24';

function progressSummary() {
  const progress=courseProgress(), optional=currentGroup()?.optionalModules ?? [5];
  const optionalTotal=runtime.course.filter(item=>optional.includes(item.number)).length;
  return `<section class="course-progress-summary" aria-label="Прогресс по курсу"><div class="course-progress-heading"><label for="course-overall-progress">Прогресс по курсу</label><strong>${progress.percent}%</strong></div><progress id="course-overall-progress" max="100" value="${progress.percent}" aria-describedby="course-progress-description">${progress.percent}%</progress><p class="course-progress-count">Отмечено обязательных работ: ${progress.completed} из ${progress.total}.</p><p id="course-progress-description">Отметки обязательных шагов сохраняются в этом браузере. Дополнительные работы можно пропустить: это не уменьшит общий прогресс. Результат проверяет преподаватель.</p>${optionalTotal ? `<p class="course-progress-optional">Необязательные работы: ${progress.optionalCompleted} из ${optionalTotal}. Они не снижают общий прогресс.</p>` : ''}</section>`;
}
function workList() {
  const done=doneSet(), optional=currentGroup()?.optionalModules ?? [5];
  return `<section class="handbook-work-list" aria-label="Работы по курсу">${runtime.course.map(item=>{
    const scheduleLabel=moduleScheduleLabel(item.number), progress=lessonProgress(item);
    const prerequisite=item.locked ? null : prerequisiteLesson(item);
    const target=prerequisite || item, step=item.locked || target.locked ? null : resumeStepId(target);
    const status=item.locked ? 'Материалы пока закрыты' : progress.complete ? 'Все обязательные шаги отмечены' : `Отмечено обязательных шагов: ${progress.completed} из ${progress.total}`;
    const action=item.locked ? '<span class="handbook-lock-note">Материалы откроет преподаватель</span>' : prerequisite ? `<span class="handbook-lock-note">Сначала отметь обязательные шаги работы ${pad(prerequisite.number)}.</span>${prerequisite.locked ? '<span class="handbook-lock-note">Её материалы откроет преподаватель.</span>' : `<a class="button" href="#task-${prerequisite.number}${step ? `/part-${step}` : ''}">К работе ${pad(prerequisite.number)}</a>`}` : `<a class="button ${progress.complete ? '' : 'primary'}" href="#task-${item.number}${step ? `/part-${step}` : ''}">${progress.complete ? 'Повторить работу' : 'Открыть работу'}</a>`;
    return `<article class="handbook-work-row ${item.locked ? 'is-locked' : progress.complete ? 'is-complete' : ''}"><span class="handbook-work-number">${pad(item.number)}</span><div class="handbook-work-description"><h2>${esc(item.title)}</h2>${optional.includes(item.number) ? '<span class="handbook-work-optional">Необязательная работа</span>' : ''}<p>${esc(item.ability)}</p>${scheduleLabel ? `<span class="handbook-work-date">${esc(scheduleLabel)}</span>` : ''}</div><div class="handbook-work-actions"><span class="handbook-work-status">${status}</span>${!item.locked && done.has(item.number) ? '<span class="handbook-lock-note">Твоя отметка сохранена отдельно от результата проверки.</span>' : ''}${action}</div></article>`;
  }).join('')}</section>`;
}
export function renderHome() {
  const group=currentGroup(), current=nextCourseLesson(), next=nearestLesson();
  const stepId=current ? resumeStepId(current) : null, step=current?.guide ? lessonForAgent(current).guide.steps.find(step=>step.id===stepId) : null;
  const href=current ? `#task-${current.number}${stepId ? `/part-${stepId}` : ''}` : '#tasks';
  const progress=current ? lessonProgress(current) : null;
  const meeting=next?.meeting;
  const meetingPlan=meeting ? `<p class="handbook-class-plan">Занятие ${next.index+1} · ${meeting.modules.length===1 ? 'работа' : 'работы'} ${meeting.modules.map(pad).join(', ')}</p><h3 class="handbook-class-topic">${esc(meeting.title)}</h3>` : '';
  const nextClass=next?.date ? `${meetingPlan}<time class="handbook-class-date" datetime="${esc(next.date)}">${dateLabel(next.date)}</time><dl class="handbook-class-details"><div><dt>Время</dt><dd>${esc(next.group.time)}</dd></div><div><dt>Аудитория</dt><dd>${esc(next.group.room)}</dd></div></dl>` : `<p>${next?.finished ? 'Занятия по расписанию завершены.' : 'Дата занятия пока не назначена.'}</p>`;
  return `<header class="handbook-heading"><div><h1>Методы искусственного интеллекта</h1><p>Интерактивная методичка · ${esc(group?.group)}</p></div><a class="button" href="#schedule">Расписание группы</a></header>${agentChoice()}${progressSummary()}<section class="handbook-current" aria-label="Текущая работа"><div>${current ? `<p class="course-label">Работа ${pad(current.number)}</p><h2>${esc(current.guide?.title || current.title)}</h2>${step ? `<p class="handbook-resume">Шаг ${step.id}. ${esc(step.title)}</p>` : `<p>${esc(current.ability)}</p>`}<div class="actions"><a class="button primary" href="${href}">${progress.complete ? 'Повторить работу' : progress.completed ? 'Продолжить с этого шага' : 'Начать работу'}</a><a class="button" href="#task-${current.number}/files">Материалы к работе</a></div>` : '<h2>Материалы ещё не открыты</h2><p>Работу откроет преподаватель.</p>'}</div><aside class="handbook-class" aria-labelledby="next-class-title"><h2 id="next-class-title">Ближайшее занятие</h2>${nextClass}</aside></section><p class="muted schedule-note">Календарь не открывает материалы.</p><div class="section-head handbook-section-head"><h2>Работы по курсу</h2><a class="button" href="#tasks">Все работы</a></div>${workList()}<section class="handbook-help"><h2>Если нужна помощь</h2><div class="actions"><a class="button" href="#start">Установка программ</a><a class="button" href="#task-1/part-8">Подключение помощника</a><a class="button" href="#route">Порядок выполнения работы</a></div><p>Шаги есть в заданиях. Отдельную текстовую инструкцию можно не скачивать.</p></section>`;
}
export function renderTasks() {
  return `<header class="handbook-heading"><div><h1>Работы по курсу</h1><p>${esc(runtime.state.group)} · Продолжаем один учебный проект на следующих занятиях.</p></div><a class="button" href="#home">К текущей работе</a></header>${progressSummary()}${workList()}`;
}
export function renderCurrent() { return renderHome(); }
export function renderStart() {
  return `<header class="handbook-heading"><div><h1>Подготовка к первой работе</h1><p>Установи программы, открой папку проекта, подключи помощника и попроси его запустить сайт.</p></div><a class="button primary" href="#task-1/part-1">Открыть пошаговую инструкцию</a></header><section class="setup-list">${[
    ['Git', 'Хранит историю файлов на компьютере. Сначала сохраним изменения в проекте, а со второй работы будем сравнивать версии кода.', 2],
    ['VS Code', 'Редактор помогает читать и менять файлы проекта. В нём откроем код и терминал, где будем вводить команды.', 3],
    ['Node.js и npm', '- **Node.js** выполняет код JavaScript и запустит сервер учебного сайта. Нужна версия **не ниже 22.13.0**.\n- **npm** устанавливается вместе с Node.js. С его помощью установим выбранного агента.', 4],
    ['OpenCode или Freebuff', 'Выбери OpenCode или Freebuff над шагами первой работы. Помощник будет работать с файлами **в той же папке проекта**. Проверяй его ответы и предложенные действия. OpenCode подключается к отдельному сервису ИИ, а в Freebuff вход выполняется через его CLI.', 5],
    ['Учебный проект', 'Клонируй проект преподавателя с GitVerse. В пустой папке **«Методы ИИ»** появится Campus-ServiceDesk с файлами и историей Git.', 7],
    ['Подключение выбранного агента', '**Только для OpenCode:**\n\n- **Mercury 3** составляет ответы, как модели в ChatGPT или Claude.\n- **Inception** даёт доступ к Mercury 3 через интернет.\n\nДля OpenCode на шаге 8 получим ключ Inception и выберем модель. Для Freebuff запустим официальный CLI и войдём в свой аккаунт; ключ Inception там не нужен.', 8]
  ].map(([title,text,part])=>`<article class="setup-step panel"><div><h2>${title}</h2><div class="course-prose">${block(text)}</div><a class="button" href="#task-1/part-${part}">Открыть шаг</a></div></article>`).join('')}</section>`;
}
