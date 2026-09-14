'use strict';
import {runtime, esc, pad, inline, dateLabel, nearestLesson, taskCard} from './lib.js';

export function renderHome() {
  const nearest = nearestLesson();
  const lesson = nearest.lesson;
  return `<section class="hero"><div class="hero-content"><p class="eyebrow">КГАСУ · ИСиТ · GitVerse + GigaCode</p><h1>Работа с ИИ и агентами на реальном проекте</h1><p class="lead">Не обзор нейросетей и не тренажёр. На каждой паре есть starter, конкретное задание, сдаваемый артефакт и критерии зачёта.</p><div class="hero-actions"><a class="button primary" href="#task-${lesson.number}">Открыть ближайшее задание</a><a class="button secondary" href="#tasks">Все 7 заданий</a></div></div>
    <div class="hero-metrics"><div class="metric"><strong>7</strong><span>практических работ</span></div><div class="metric"><strong>1</strong><span>сквозной проект</span></div><div class="metric"><strong>4</strong><span>подгруппы</span></div><div class="metric"><strong>0</strong><span>обязательных ML-моделей</span></div></div></section>
  <div class="section-head"><div><p class="eyebrow">Что делать сейчас</p><h2>Ближайшая работа</h2></div><p>${esc(nearest.group.group)} · ${dateLabel(nearest.date)} · ${esc(nearest.group.time)}</p></div>
  <section class="next-card panel"><div class="next-number">${pad(lesson.number)}</div><div><p class="eyebrow">Пара ${lesson.number} · аудитория ${esc(nearest.group.room)}</p><h2>${esc(lesson.title)}</h2><p><b>Результат:</b> ${esc(lesson.artifact)}</p></div><div class="actions"><a class="button primary" href="#task-${lesson.number}">Задание</a><a class="button starter-download" href="#" data-starter="${esc(lesson.downloads.starterKey)}" data-filename="${esc(lesson.downloads.starterFilename)}">Скачать starter</a></div></section>
  <div class="section-head"><div><p class="eyebrow">Формат каждой пары</p><h2>Один понятный цикл</h2></div></div>
  <section class="quick-grid"><article class="quick-card panel"><span>1</span><h3>Откройте задание</h3><p>Прочитайте цель, создайте указанную ветку и скачайте starter именно этой пары.</p></article><article class="quick-card panel"><span>2</span><h3>Работайте с агентом</h3><p>Сначала контекст и план, затем ограниченная правка. Не позволяйте модели расширять задачу без причины.</p></article><article class="quick-card panel"><span>3</span><h3>Сдайте доказательства</h3><p>Ветка, diff, тесты, CI, REPORT.md или Merge Request. Фраза AI «готово» не считается.</p></article></section>
  <div class="section-head"><div><p class="eyebrow">Учебный маршрут</p><h2>Задания</h2><p>Откройте карточку, а не пытайтесь угадать работу по названию пары.</p></div><a href="#tasks">Показать все →</a></div><section class="task-grid">${runtime.course.slice(0, 3).map(taskCard).join('')}</section>`;
}

export function renderTasks() {
  return `<header class="page-head"><p class="eyebrow">7 работ · ServiceDesk Lite</p><h1>Задания</h1><p class="lead">У каждой работы есть отдельный starter, рабочая ветка, пошаговый план, список сдаваемых артефактов и критерии преподавателя.</p></header><section class="task-grid">${runtime.course.map(taskCard).join('')}</section>`;
}

export function renderStart() {
  const steps = [
    ['Войдите в GitVerse', 'Откройте приглашение в модуль курса и убедитесь, что видите своё задание.', 'Должен появиться персональный репозиторий или форк задания.'],
    ['Склонируйте репозиторий', 'Скопируйте URL своего репозитория и клонируйте его в отдельную учебную папку.', 'git clone <адрес-вашего-репозитория>'],
    ['Откройте проект в VS Code', 'Откройте корень проекта, где лежат package.json, TASK.md и src/.', 'В проводнике VS Code видны TASK.md, REPORT.md, src и tests.'],
    ['Установите и авторизуйте GigaCode', 'Используйте подготовленный преподавателем способ установки. Не вводите токены и пароли в файлы проекта.', 'GigaCode отвечает внутри VS Code и видит открытый учебный проект.'],
    ['Проверьте базовый проект', 'Откройте терминал VS Code и выполните команды ниже.', 'npm test\nnpm run start'],
    ['Начните с TASK.md', 'Создайте указанную в задании ветку. Сначала прочитайте требования, затем просите агента составить план.', 'Перед правкой вы можете объяснить ожидаемый результат и способ проверки.'],
  ];
  return `<header class="page-head"><p class="eyebrow">Настройка один раз</p><h1>Как начать</h1><p class="lead">Настраиваем настоящую среду вместе. Если один ПК решил проявить характер, студент работает в паре, а не превращает занятие в терапию PATH.</p></header>
  <section class="setup-list">${steps.map(([title, text, expected]) => `<article class="setup-step panel"><div><h3>${esc(title)}</h3><p>${esc(text)}</p>${expected.includes('\n') ? `<pre class="command">${esc(expected)}</pre>` : `<div class="expected"><b>Должно получиться:</b> ${inline(expected)}</div>`}</div></article>`).join('')}</section>
  <section class="task-section panel"><h2>Быстрые файлы</h2><div class="file-grid"><a class="file-link starter-download" href="#" data-starter="course-all" data-filename="kgasu-ai-agents-course.zip"><b>Весь комплект</b><span>Семь starter ZIP и документы курса</span></a><a class="file-link" href="assets/materials/START_HERE.md" download><b>START_HERE.md</b><span>Текстовая инструкция студенту</span></a><a class="file-link" href="#task-1"><b>Задание 01</b><span>Первая настройка и проверенный ответ GigaCode</span></a></div></section>`;
}
