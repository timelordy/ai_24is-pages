'use strict';
import {runtime, esc, dateLabel, nearestLesson, currentOpenLesson, currentGroup, taskCard, isSetupMeeting, doneSet} from './lib.js?v=359ee70d123b';
function nextMeeting() {
  const next = nearestLesson();
  if (!next || next.finished) return '<section class="notice panel"><b>Все встречи по этому расписанию прошли.</b> Открытые задания и ваши отметки остаются на сайте.</section>';
  const title = next.intro ? 'Устанавливаем программы и запускаем проект' : next.lesson?.title || 'Занятие по проекту';
  return `<section class="meeting-card panel"><div><p class="eyebrow">Ближайшая встреча по расписанию</p><h2>${dateLabel(next.date)}</h2><p>${esc(next.group.time)} · ${esc(next.group.room)}</p></div><div><b>${esc(title)}</b><p>${next.intro ? 'На этой встрече — настройка и первый запуск. Разбор ИИ и отчёт будут в первой работе.' : next.lesson?.locked ? 'Подробное задание ещё закрыто. Сейчас можно заниматься открытой работой.' : 'Инструкция уже открыта.'}</p><a href="#schedule">Всё расписание группы →</a></div></section>`;
}
export function renderHome() {
  const group = currentGroup(), current = currentOpenLesson(), setup = isSetupMeeting();
  const title = setup ? 'Сначала установим программы и запустим проект' : doneSet().has(current.number) ? 'Работа отмечена. Проверьте, что она отправлена' : current.number === 1 ? 'Запускаем проект и разбираемся, как он работает' : current.title;
  return `<header class="page-head group-home"><p class="eyebrow">${esc(group?.group)}</p><h1>${esc(title)}</h1><p class="lead">Делаем сайт для заявок: не работает проектор, сломался стул, нужен доступ в аудиторию. Это наш учебный проект на семестр — Campus ServiceDesk.</p><div class="actions"><a class="button primary" href="${setup ? '#start' : `#task-${current.number}`}">${setup ? 'Начать настройку' : 'Открыть задание'}</a><a class="button" href="#task-1/part-7">Программы уже стоят — открыть проект</a></div></header>
  ${nextMeeting()}<section class="plain-intro"><h2>Что мы здесь делаем</h2><p>Не пишем новый проект на каждой паре. Берём один и постепенно добавляем поиск, сервер, базу данных и подсказки ИИ. GigaCode используем в работе, но проверяем его ответы сами.</p></section>
  <section class="quick-grid"><article class="quick-card panel"><span>1</span><h3>Сначала запускаем</h3><p>Ставим Git, VS Code, Node.js и GigaCode. Открываем проект. Проверяем: 5 тестов прошли, на сайте 12 заявок.</p></article><article class="quick-card panel"><span>2</span><h3>Потом разбираемся</h3><p>Просим GigaCode объяснить код. Берём три утверждения из ответа и находим подтверждение в файлах. На первой работе код не меняем.</p></article><article class="quick-card panel"><span>3</span><h3>Показываем результат</h3><p>Записываем выводы в отчёт и отправляем в свой GitVerse. Галочка на этом сайте ничего преподавателю не отправляет.</p></article></section>
  <section class="section-head"><div><h2>Доступно вашей группе</h2><p>Один проект, шесть работ. Следующие задания открывает преподаватель.</p></div><a href="#tasks">Все задания →</a></section><section class="task-grid">${runtime.course.filter(item => !item.locked).map(taskCard).join('')}</section>`;
}
export function renderTasks() { return `<header class="page-head"><p class="eyebrow">${esc(runtime.state.group)}</p><h1>Все задания</h1><p class="lead">Один проект на весь семестр. Каждая работа продолжает предыдущую. Начните с открытого задания, а не с нового пустого проекта.</p></header><section class="task-grid">${runtime.course.map(taskCard).join('')}</section>`; }
export function renderCurrent() { return renderHome(); }
export function renderStart() {
  return `<header class="page-head"><p class="eyebrow">${esc(runtime.state.group)} · Вводная встреча</p><h1>Устанавливаем программы.<br>Запускаем проект.</h1><p class="lead">Сегодня нужно получить работающий проект на своём компьютере. Код приложения пока не меняем. Отдельный отчёт за вводную встречу не нужен.</p><div class="actions"><a class="button primary" href="#task-1/part-1">Начать с первого шага</a><a class="button" href="#task-1/part-7">Всё установлено — перейти к проекту</a></div></header><section class="setup-list">${[
    ['Войти в GitVerse', 'Здесь будет ваш репозиторий — файлы проекта с историей изменений.', 1],
    ['Поставить программы', 'Git сохраняет историю. VS Code — редактор, не Visual Studio. Node.js запускает проект и тесты. GigaCode — помощник внутри редактора.', 2],
    ['Открыть учебный проект', 'Получите у преподавателя ссылку на личный репозиторий. Если доступа пока нет, стартовый архив позволяет хотя бы проверить запуск.', 7],
    ['Проверить результат', 'npm test: 5 тестов пройдены. npm run start: в браузере 12 заявок. GigaCode отвечает на ваш запрос.', 9]
  ].map(([title, text, part]) => `<article class="setup-step panel"><div><h2>${title}</h2><p>${text}</p><a href="#task-1/part-${part}">Открыть инструкцию →</a></div></article>`).join('')}</section><section class="notice panel setup-stop"><b>На вводной встрече достаточно шагов 1–9.</b> Шаги 10–13 — разбор ответов ИИ, требования и отчёт — относятся к первой работе.</section>`;
}
