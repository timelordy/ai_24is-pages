'use strict';
import {runtime, esc, pad, inline, dateLabel, nearestLesson, taskCard} from './lib.js';

function nearestCard(nearest) {
  if (nearest.intro) {
    return `<section class="next-card panel"><div class="next-number">00</div><div><p class="eyebrow">Вводная встреча · аудитория ${esc(nearest.group.room)}</p><h2>${esc(nearest.intro.title)}</h2><p>${esc(nearest.intro.note)}</p></div><div class="actions"><a class="button primary" href="#start">Инструкция по настройке</a><a class="button" href="#task-1">Посмотреть работу 01</a></div></section>`;
  }
  const lesson = nearest.lesson;
  return `<section class="next-card panel"><div class="next-number">${pad(lesson.number)}</div><div><p class="eyebrow">Обязательная работа ${lesson.number} · аудитория ${esc(nearest.group.room)}</p><h2>${esc(lesson.title)}</h2><p><b>Результат:</b> ${esc(lesson.artifact)}</p></div><div class="actions"><a class="button primary" href="#task-${lesson.number}">Задание</a><a class="button starter-download" href="#" data-starter="${esc(lesson.downloads.starterKey)}" data-filename="${esc(lesson.downloads.starterFilename)}">Скачать starter</a></div></section>`;
}

export function renderHome() {
  const nearest = nearestLesson();
  const primaryHref = nearest.intro ? '#start' : `#task-${nearest.lesson.number}`;
  const primaryText = nearest.intro ? 'Открыть настройку' : 'Открыть ближайшее задание';
  return `<section class="hero"><div class="hero-content"><p class="eyebrow">КГАСУ · ИСиТ · GitVerse + GigaCode</p><h1>Работа с ИИ и агентами на реальном проекте</h1><p class="lead">Шесть обязательных работ. У каждой заранее известны входы, ожидаемые результаты, команды проверки и признаки ложного успеха.</p><div class="hero-actions"><a class="button primary" href="${primaryHref}">${primaryText}</a><a class="button secondary" href="#tasks">Все ${runtime.course.length} заданий</a></div></div>
    <div class="hero-metrics"><div class="metric"><strong>${runtime.course.length}</strong><span>обязательных работ</span></div><div class="metric"><strong>1</strong><span>сквозной проект</span></div><div class="metric"><strong>4</strong><span>подгруппы</span></div><div class="metric"><strong>0</strong><span>обязательных ML-моделей</span></div></div></section>
  <div class="section-head"><div><p class="eyebrow">Что делать сейчас</p><h2>Ближайшая встреча</h2></div><p>${esc(nearest.group.group)} · ${dateLabel(nearest.date)} · ${esc(nearest.group.time)}</p></div>
  ${nearestCard(nearest)}
  <div class="section-head"><div><p class="eyebrow">Формат каждой работы</p><h2>Результат либо доказан, либо нет</h2></div></div>
  <section class="quick-grid"><article class="quick-card panel"><span>1</span><h3>Сначала контракт</h3><p>До правки зафиксируйте конкретные входы и ожидаемые выходы. «Работает корректно» не считается критерием.</p></article><article class="quick-card panel"><span>2</span><h3>Потом агент</h3><p>Дайте контекст, получите план, ограничьте изменение и посмотрите diff.</p></article><article class="quick-card panel"><span>3</span><h3>Докажите результат</h3><p>Точные значения, тесты, CI и ручные сценарии. Сообщение AI «готово» доказательством не является.</p></article></section>
  <div class="section-head"><div><p class="eyebrow">Учебный маршрут</p><h2>Задания</h2><p>На странице каждой работы отдельно показаны Definition of Done и условия, при которых работа не засчитывается.</p></div><a href="#tasks">Показать все →</a></div><section class="task-grid">${runtime.course.slice(0, 3).map(taskCard).join('')}</section>`;
}

export function renderTasks() {
  return `<header class="page-head"><p class="eyebrow">${runtime.course.length} работ · ServiceDesk Lite</p><h1>Задания</h1><p class="lead">У каждой работы есть starter, ветка, конкретный контракт, Definition of Done, доказательства для сдачи и вопрос на защиту.</p></header><section class="task-grid">${runtime.course.map(taskCard).join('')}</section>`;
}

export function renderStart() {
  const steps = [
    ['Войдите в GitVerse', 'Откройте приглашение в модуль курса и убедитесь, что видите своё задание.', 'Должен появиться персональный репозиторий или форк задания.'],
    ['Склонируйте репозиторий', 'Скопируйте URL своего репозитория и клонируйте его в отдельную учебную папку.', 'git clone <адрес-вашего-репозитория>'],
    ['Откройте проект в VS Code', 'Откройте корень проекта, где лежат package.json, TASK.md и src/.', 'В проводнике VS Code видны TASK.md, REPORT.md, src и tests.'],
    ['Установите и авторизуйте GigaCode', 'Используйте подготовленный преподавателем способ установки. Не вводите токены и пароли в файлы проекта.', 'GigaCode отвечает внутри VS Code и видит открытый учебный проект.'],
    ['Проверьте базовый проект', 'Откройте терминал VS Code и выполните команды ниже.', 'npm test\nnpm run start'],
    ['Начните с TASK.md', 'Создайте указанную ветку. Сначала найдите блок «Успешный результат» и убедитесь, что понимаете, чем будете доказывать выполнение.', 'До запуска агента вы можете назвать ожидаемый результат и способ проверки.'],
  ];
  return `<header class="page-head"><p class="eyebrow">Настройка один раз</p><h1>Как начать</h1><p class="lead">У 24ИС02/2 и 24ИС03/1 для настройки есть отдельная вводная встреча 21 сентября. Для остальных групп настройка входит в первую обязательную работу.</p></header>
  <section class="setup-list">${steps.map(([title, text, expected]) => `<article class="setup-step panel"><div><h3>${esc(title)}</h3><p>${esc(text)}</p>${expected.includes('\n') ? `<pre class="command">${esc(expected)}</pre>` : `<div class="expected"><b>Должно получиться:</b> ${inline(expected)}</div>`}</div></article>`).join('')}</section>
  <section class="task-section panel"><h2>Быстрые файлы</h2><div class="file-grid"><a class="file-link starter-download" href="#" data-starter="course-all" data-filename="kgasu-ai-agents-course.zip"><b>Весь комплект</b><span>Шесть starter-репозиториев и документы курса</span></a><a class="file-link" href="assets/materials/START_HERE.md" download><b>START_HERE.md</b><span>Текстовая инструкция студенту</span></a><a class="file-link" href="#task-1"><b>Задание 01</b><span>Среда + постановка проверяемой задачи</span></a></div></section>`;
}
