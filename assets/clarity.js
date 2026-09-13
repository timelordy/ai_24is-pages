'use strict';

const CLEAR_PLAN = [
  {
    id: 1,
    title: 'Классификация обращений по правилам',
    problem: 'Есть текст обращения. Нужно определить его тему.',
    change: 'Пишем простые правила по ключевым словам.',
    result: 'Категория: аккаунт / оплата / техника / нужен человек.'
  },
  {
    id: 2,
    title: 'Классификация обращений с помощью ML',
    problem: 'Новые формулировки не всегда попадают в правила.',
    change: 'Обучаем модель на размеченных примерах.',
    result: 'Модель, которая предсказывает категорию обращения.'
  },
  {
    id: 3,
    title: 'Проверка качества модели',
    problem: 'Одна accuracy не показывает, какие именно ошибки делает модель.',
    change: 'Смотрим confusion matrix и разбираем ошибки по классам.',
    result: 'Понимаем, где модель ошибается и какие ошибки важнее.'
  },
  {
    id: 4,
    title: 'Поиск нужной инструкции',
    problem: 'Категория известна, но сотруднику всё ещё надо искать инструкцию вручную.',
    change: 'Сравниваем поиск по словам и поиск по смыслу.',
    result: 'Для обращения находится подходящий фрагмент инструкции.'
  },
  {
    id: 5,
    title: 'Извлечение данных из текста',
    problem: 'В сообщении могут быть номер заказа, устройство и другие полезные данные.',
    change: 'Используем LLM, чтобы вернуть данные в заданном JSON-формате.',
    result: 'Структурированные поля без ручного копирования из текста.'
  },
  {
    id: 6,
    title: 'Собираем всё в одну цепочку',
    problem: 'Классификация, поиск и извлечение данных пока работают отдельно.',
    change: 'Соединяем части в один pipeline обработки обращения.',
    result: 'Один запуск обрабатывает сообщение от начала до конца.'
  },
  {
    id: 7,
    title: 'Финальная проверка на новых обращениях',
    problem: 'Нужно понять, как система поведёт себя на сообщениях, которых раньше не видела.',
    change: 'Проверяем на новых примерах, разбираем ошибки и ограничения.',
    result: 'Итоговая версия системы и защита решения.'
  }
];

Object.assign(LESSONS[0], {
  title: CLEAR_PLAN[0].title,
  subtitle: 'Сначала самый простой классификатор',
  desc: 'Берём текст обращения и по ключевым словам решаем, к какой теме его отнести.'
});
Object.assign(LESSONS[1], {
  title: CLEAR_PLAN[1].title,
  subtitle: 'Теперь модель учится на примерах',
  desc: 'Берём размеченные сообщения и обучаем модель предсказывать категорию.'
});
for (let i = 2; i < CLEAR_PLAN.length; i++) {
  Object.assign(LESSONS[i], {
    title: CLEAR_PLAN[i].title,
    subtitle: CLEAR_PLAN[i].change,
    desc: CLEAR_PLAN[i].problem
  });
}

Object.assign(ASSIGNMENT_UI[1], {
  title: 'Сделать простой классификатор обращений по ключевым словам',
  short: 'Вводим текст обращения и получаем одну из четырёх меток: аккаунт, оплата, техника или «нужен человек».',
  why: 'Это самый простой вариант решения. На следующей паре мы сравним его с моделью машинного обучения.',
  steps: [
    'Запустить исходные правила на 12 готовых обращениях.',
    'Найти минимум две ошибки или спорных случая.',
    'Изменить хотя бы одно правило.',
    'Снова запустить все 12 обращений и сравнить результат.',
    'Открыть готовый Python-каркас и повторить ту же логику в коде.'
  ],
  result: 'Работающие правила, два разобранных ошибочных случая и короткий вывод: что получилось и где такой подход ломается.',
  startLabel: 'Перейти к заданию'
});

Object.assign(ASSIGNMENT_UI[2], {
  title: 'Обучить модель определять категорию обращения по тексту',
  short: 'Берём размеченные обращения, обучаем модель и сравниваем её с простым baseline.',
  why: 'Правила по словам приходится постоянно дописывать. Модель попробует обобщить примеры и работать с новыми формулировками.',
  steps: [
    'Скачать notebook и учебный набор обращений.',
    'Посмотреть, как данные разделены на train, validation и test.',
    'Запустить baseline и записать его результат.',
    'Обучить TF-IDF + Logistic Regression и сравнить с baseline.',
    'Найти хотя бы одну ошибку модели и объяснить её.'
  ],
  result: 'Запущенный notebook, сравнение baseline и модели и короткий разбор одной ошибки.',
  startLabel: 'Скачать notebook'
});

quickbar = function () {
  return `<div class="quickbar"><div class="shell quickbar-inner">
    <button class="chip ${view === 'home' ? 'active' : ''}" data-view="home">Главная</button>
    <button class="chip ${view === 'route' ? 'active' : ''}" data-view="route">План курса</button>
    <button class="chip ${view === 'schedule' ? 'active' : ''}" data-view="schedule">Расписание</button>
    <button class="chip ${view === 'materials' ? 'active' : ''}" data-view="materials">Материалы</button>
    <button class="chip ${view === 'portfolio' ? 'active' : ''}" data-view="portfolio">Моя работа</button>
    <span class="chip soft">Сейчас доступны пары 1 и 2</span>
  </div></div>`;
};

hero = function () {
  return `<section class="hero course-intro clarity-hero"><div>
    <div class="eyebrow">Методы искусственного интеллекта · практика</div>
    <h1>На 7 парах соберём систему, которая помогает разбирать обращения пользователей</h1>
    <p>Пример: пользователь пишет «не могу войти», «деньги списали дважды» или «программа не запускается». Система должна понять тему обращения, найти нужную инструкцию и, если нужно, достать данные из текста. На каждой паре добавляем одну часть.</p>
  </div><div class="hero-meta"><div class="stat-chip"><strong>7</strong><span>пар</span></div><div class="stat-chip"><strong>1</strong><span>учебный проект</span></div><div class="stat-chip"><strong>${state.ready.length}/7</strong><span>выполнено</span></div></div></section>`;
};

function clarityBrief() {
  return `<section class="card course-brief clarity-brief"><div class="course-brief-grid">
    <div><span>Что это за сайт</span><p>Здесь лежат задания на практические пары. Открываешь текущую пару и выполняешь шаги сверху вниз.</p></div>
    <div><span>Что мы автоматизируем</span><p>Разбор текстовых обращений в службу поддержки. На входе текст. На выходе категория, инструкция и нужные поля.</p></div>
    <div><span>Что получится к концу</span><p>Небольшой учебный помощник. Если он не уверен в ответе, то должен вернуть «нужен человек», а не придумывать результат.</p></div>
  </div></section>`;
}

function clarityPlanCard(currentId) {
  return `<section class="card story-card clarity-plan-card"><div class="story-card-head"><div><div class="eyebrow">План курса</div><h2>Как система будет усложняться от пары к паре</h2></div><span class="story-company">7 практических занятий</span></div>
    <div class="story-timeline">${CLEAR_PLAN.map(x => `<button class="story-node ${x.id === currentId ? 'active' : ''} ${state.ready.includes(x.id) ? 'past' : ''}" ${RELEASED.includes(x.id) ? `data-action="open-lesson" data-id="${x.id}"` : 'disabled'}><span>${state.ready.includes(x.id) ? '✓' : x.id}</span><strong>${esc(x.title)}</strong></button>`).join('')}</div>
    <p class="story-note">Каждая следующая пара использует результат предыдущей. Новый проект каждый раз не начинаем.</p>
  </section>`;
}

mainJobCard = function () {
  const slot = nextSlot(group);
  if (!slot) {
    return `<article class="card job-card" data-testid="current-job"><div class="job-head"><div><div class="eyebrow">Семестр закончен</div><h2 class="job-title">Все занятия по расписанию уже прошли</h2></div></div><p class="job-text">Материалы и свои заметки можно открыть в разделе «План курса».</p><div class="job-actions"><button class="primary-btn" data-view="route">Открыть план курса</button></div></article>`;
  }
  const l = lesson(slot.lesson);
  const a = ASSIGNMENT_UI[slot.lesson];
  const plan = CLEAR_PLAN[slot.lesson - 1];
  const open = RELEASED.includes(slot.lesson);
  return `<article class="card job-card job-card--next" data-testid="current-job">
    <div class="job-head"><div><div class="eyebrow">Ближайшая практика · ${formatDate(slot.date, true)}</div><h2 class="job-title">Пара ${slot.lesson}. ${esc(plan.title)}</h2><div class="job-company">${esc(group)} · ${esc(slot.start)}–${esc(slot.end)} · ${esc(slot.room)}</div></div><div class="job-pay">${l.time}<small>${esc(l.stack)}</small></div></div>
    <div class="next-story"><span>Что делаем на этой паре</span><p>${esc(plan.change)} ${esc(plan.problem)}</p></div>
    ${a ? `<div class="next-assignment"><span>Что должно получиться</span><strong>${esc(a.result)}</strong></div>` : ''}
    <div class="job-actions">${open ? `<button class="primary-btn" data-action="open-lesson" data-id="${slot.lesson}">Открыть пару ${slot.lesson}</button>` : `<button class="primary-btn" data-view="route">Посмотреть план</button>`}<button class="secondary-btn" data-view="schedule">Расписание</button></div>
  </article>`;
};

homeHTML = function () {
  const next = nextSlot(group);
  const current = next ? next.lesson : 7;
  return `${hero()}${quickbar()}${clarityBrief()}${clarityPlanCard(current)}<div class="content-grid"><div class="stack">${mainJobCard()}</div><aside class="stack"><section class="card side-card"><div class="side-title">Твоя подгруппа</div><h3>${esc(group)}</h3><dl class="kv"><dt>Когда</dt><dd>${esc(SCHEDULE_META[group].weekday)}, ${esc(SCHEDULE_META[group].time)}</dd><dt>Где</dt><dd>${esc(SCHEDULE_META[group].room)}</dd>${next ? `<dt>Ближайшая</dt><dd>${formatDateShort(next.date)}, пара ${next.lesson}</dd>` : ''}</dl><button class="secondary-btn" style="width:100%;margin-top:14px" data-view="schedule">Посмотреть расписание</button></section><section class="card side-card"><div class="side-title">Прогресс</div><h3>${state.ready.length} из 7</h3><div class="progress"><i style="width:${progress()}%"></i></div><p class="tiny muted">Отметки сохраняются только в этом браузере.</p></section></aside></div>`;
};

routeHTML = function () {
  const scheduled = currentLesson();
  return `${quickbar()}<div class="section-head"><div><h2>Что будем делать на 7 парах</h2><p>Это один учебный проект. Каждая следующая пара добавляет новую возможность к той же системе обработки обращений.</p></div></div><div class="story-route">${CLEAR_PLAN.map(item => {
    const l = lesson(item.id);
    const slot = slotForLesson(group, item.id);
    const open = RELEASED.includes(item.id);
    return `<article class="story-route-item ${state.ready.includes(item.id) ? 'done' : ''} ${item.id === scheduled ? 'current' : ''}"><div class="story-route-num">${state.ready.includes(item.id) ? '✓' : String(item.id).padStart(2, '0')}</div><div class="story-route-copy"><h3>${esc(item.title)}</h3><p>${formatDate(slot.date, true)} · ${esc(slot.start)}–${esc(slot.end)} · ${esc(slot.room)}</p><p><strong>Задача:</strong> ${esc(item.problem)}</p><p><strong>Что добавляем:</strong> ${esc(item.change)}</p><div class="story-route-result"><span>Результат пары</span>${esc(item.result)}</div></div><div class="story-route-action">${open ? `<button class="secondary-btn" data-action="open-lesson" data-id="${item.id}">Открыть пару</button>` : `<span class="tiny muted">Откроется позже</span>`}</div></article>`;
  }).join('')}</div>`;
};

function clarityContext(l) {
  const item = CLEAR_PLAN[l.id - 1];
  const previous = l.id === 1
    ? 'Пока ничего. Начинаем с самого простого решения, чтобы потом было с чем сравнивать более сложные методы.'
    : `После пары ${l.id - 1} у нас уже есть результат: ${CLEAR_PLAN[l.id - 2].result}`;
  return `<section class="card story-context clarity-context" data-testid="story-context"><div class="story-context-top"><div><div class="eyebrow">Где мы сейчас</div><h3>Пара ${l.id} из 7</h3></div><span class="story-role">Один проект на весь семестр</span></div><div class="story-context-grid"><div><span>Что уже есть</span><p>${esc(previous)}</p></div><div><span>Зачем эта пара</span><p>${esc(item.problem)}</p></div><div><span>Что будет после пары</span><p>${esc(item.result)}</p></div></div></section>`;
}

lessonTop = function (l) {
  const slot = slotForLesson(group, l.id);
  return `<div class="lesson-page-head"><div><div class="eyebrow">Пара ${l.id} · ${esc(group)}</div><h1>${esc(CLEAR_PLAN[l.id - 1].title)}</h1><p>${esc(CLEAR_PLAN[l.id - 1].change)} Ниже сначала показано, что именно нужно сделать, затем идёт рабочая часть.</p><div class="tags"><span class="tag red">${formatDate(slot.date, true)}</span><span class="tag">${esc(slot.start)}–${esc(slot.end)}</span><span class="tag">${esc(slot.room)}</span></div></div><button class="secondary-btn" data-view="route">← План курса</button></div>`;
};

lessonHTML = function () {
  const l = lesson(activeLesson);
  if (!RELEASED.includes(l.id)) return routeHTML();
  return `${quickbar()}${lessonTop(l)}${clarityContext(l)}${assignmentBrief(l)}<div class="lesson-shell lesson-shell--task"><div class="lesson-main">${l.id === 1 ? lab1HTML() : lab2HTML()}</div>${lessonSide(l)}</div>`;
};

lab1HTML = function () {
  return `<section class="card context-card"><div class="section-label">Пример задачи</div><h3>Что должен делать классификатор</h3><p>На вход подаём текст обращения. На выходе получаем одну из четырёх меток: <strong>аккаунт</strong>, <strong>оплата</strong>, <strong>техника</strong> или <strong>нужен человек</strong>.</p><div class="example"><b>Примеры</b>«Не могу войти после смены пароля» → аккаунт.<br>«Деньги списались два раза» → оплата.<br>«Программа закрывается при запуске» → техника.</div></section>
  <section id="work-area" class="card lesson-card work-card"><div class="section-label">Задание</div><h3>Выполняй по шагам</h3>
    <div class="work-step"><span class="work-num">1</span><div><h4>Запусти исходные правила</h4><p>Ничего не меняй. Сначала посмотри, как готовые правила распределяют 12 обращений.</p><button class="primary-btn" data-action="run-tests">Запустить 12 обращений</button></div></div>
    <div id="testResults"></div>
    <div class="work-step"><span class="work-num">2</span><div><h4>Найди минимум две ошибки</h4><p>Смотри строки, где ожидаемая категория и результат не совпали. Для каждой ошибки попробуй понять причину.</p></div></div>
    <div class="work-step"><span class="work-num">3</span><div><h4>Измени правило</h4><p>Добавь или убери ключевые слова и проверь отдельное сообщение.</p><div class="rule-grid">${Object.keys(DEFAULT_RULES).map(k => `<label>${LABELS[k]}<input type="text" data-rule="${k}" value="${esc(state.rules[k])}" maxlength="160"></label>`).join('')}</div><div class="input-actions"><input id="singleText" type="text" value="Не могу войти после смены пароля" maxlength="400"><button class="secondary-btn" data-action="classify">Проверить одно обращение</button></div><div id="singleResult" aria-live="polite"></div><button class="ghost-btn" data-action="reset-rules">Вернуть исходные правила</button></div></div>
    <div class="work-step"><span class="work-num">4</span><div><h4>Запусти все 12 обращений ещё раз</h4><p>Сравни результат до и после изменения. Проверь не только общий процент, но и конкретные сообщения.</p><button class="primary-btn" data-action="run-tests">Проверить после изменений</button></div></div>
    <div class="work-step"><span class="work-num">5</span><div><h4>Повтори то же самое в Python</h4><p>Каркас уже готов. Разберись, как работает функция классификации, и перенеси свои изменения в код.</p><div class="job-actions"><button class="primary-btn blue" data-download="lab1">Скачать notebook</button><button class="secondary-btn" data-download="lab1py">Версия .py</button><button class="secondary-btn" data-download="cases">12 обращений .csv</button></div></div></div>
  </section>`;
};

lab2HTML = function () {
  return `<section class="card context-card"><div class="section-label">Что меняется на второй паре</div><h3>Теперь правила заменяем моделью</h3><p>Задача та же: по тексту определить категорию обращения. Но теперь мы не пишем ключевые слова вручную. У нас есть примеры обращений с правильными категориями, и на них обучается модель.</p><div class="example"><b>Как устроены данные</b>train — модель учится · validation — сравниваем варианты · test — оставляем для финальной проверки.</div></section>
  <section id="work-area" class="card lesson-card work-card"><div class="section-label">Задание</div><h3>Выполняй по шагам</h3>
    <div class="work-step"><span class="work-num">1</span><div><h4>Скачай notebook и данные</h4><p>Открой notebook в Jupyter. Видеокарта и API-ключи не нужны.</p><div class="job-actions"><button class="primary-btn blue" data-download="lab2">Скачать notebook</button><button class="secondary-btn" data-download="dataset">Данные .csv</button></div></div></div>
    <div class="work-step"><span class="work-num">2</span><div><h4>Посмотри разделение данных</h4><p>Разберись, какие примеры попали в train, validation и test и зачем нужны три части.</p></div></div>
    <div class="work-step"><span class="work-num">3</span><div><h4>Запусти baseline</h4><p>Это специально очень простой ориентир. Запиши его accuracy.</p></div></div>
    <div class="work-step"><span class="work-num">4</span><div><h4>Обучи модель</h4><p>Запусти TF-IDF + Logistic Regression и сравни результат с baseline на validation.</p></div></div>
    <div class="work-step"><span class="work-num">5</span><div><h4>Разбери одну ошибку</h4><p>Найди обращение, где модель ошиблась. Запиши ожидаемую категорию, предсказание и возможную причину ошибки.</p></div></div>
  </section>`;
};

openBrief = function () {
  showDialog('Что мы делаем на курсе', `<h2>Автоматизируем разбор обращений в службу поддержки</h2><p>Пользователь пишет сообщение. Наша учебная система должна понять, о чём оно, и помочь сотруднику поддержки обработать его.</p><div class="example"><b>Пример</b>«Не могу войти после смены пароля» → тема: аккаунт.</div><div class="example"><b>К концу курса</b>Система будет определять категорию, искать подходящую инструкцию и извлекать нужные данные из текста.</div><div class="example bad"><b>Важно</b>Если система не уверена, она должна вернуть «нужен человек», а не выдумывать ответ.</div>`);
};

render();
