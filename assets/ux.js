'use strict';

const ASSIGNMENT_UI = {
  1: {
    title:'Настроить правила, которые распределяют обращения по трём отделам',
    short:'Прогнать 12 сообщений, найти ошибки, изменить правила и проверить результат ещё раз.',
    why:'На этой паре ИИ пока не используем. Сначала нужен простой baseline, с которым потом будем сравнивать модель.',
    steps:[
      'Прогнать исходные правила на 12 сообщениях.',
      'Найти минимум две ошибки или спорных случая.',
      'Изменить хотя бы одно правило и проверить отдельное сообщение.',
      'Снова прогнать все 12 сообщений и посмотреть, что изменилось.',
      'Открыть готовый Python-каркас и повторить ту же проверку в коде.'
    ],
    result:'В конце у тебя должны быть изменённые правила, два разобранных ошибочных случая и короткий вывод на 2–3 предложения.',
    startLabel:'Начать с 12 сообщений',
    startAction:'jump-work'
  },
  2: {
    title:'Обучить первую модель и сравнить её с простым baseline',
    short:'Запустить notebook, проверить train/validation/test, сравнить baseline и модель и разобрать одну ошибку.',
    why:'Теперь решаем ту же задачу не списком слов, а моделью, которая учится на размеченных примерах.',
    steps:[
      'Скачать notebook и учебные данные.',
      'Запустить ячейки и посмотреть, как данные делятся на train, validation и test.',
      'Запустить baseline и записать его результат.',
      'Обучить TF-IDF + Logistic Regression и сравнить результат с baseline.',
      'Выбрать хотя бы одну ошибку модели и объяснить, почему она могла возникнуть.'
    ],
    result:'В конце нужен запущенный notebook, сравнение model vs baseline и короткий разбор одной ошибки.',
    startLabel:'Скачать notebook',
    startDownload:'lab2'
  }
};

function assignmentBrief(l){
  const a=ASSIGNMENT_UI[l.id];
  if(!a)return '';
  const action=a.startDownload
    ? `<button class="primary-btn assignment-start" data-download="${a.startDownload}">${a.startLabel}</button>`
    : `<button class="primary-btn assignment-start" data-ui-action="${a.startAction}">${a.startLabel}</button>`;
  return `<section class="card assignment-brief" data-testid="assignment-brief">
    <div class="assignment-head">
      <div><div class="assignment-kicker">Задание на пару</div><h2>${esc(a.title)}</h2><p>${esc(a.short)}</p></div>
      <span class="assignment-time">${esc(l.time)}</span>
    </div>
    <div class="assignment-grid">
      <div class="assignment-panel">
        <h3>Что нужно сделать</h3>
        <ol class="assignment-steps">${a.steps.map((x,i)=>`<li><span>${i+1}</span><p>${esc(x)}</p></li>`).join('')}</ol>
      </div>
      <div class="assignment-side">
        <div class="assignment-panel assignment-why"><h3>Зачем это делаем</h3><p>${esc(a.why)}</p></div>
        <div class="assignment-panel assignment-result"><h3>Что должно получиться</h3><p>${esc(a.result)}</p></div>
        ${action}
      </div>
    </div>
  </section>`;
}

hero=function(){
  return `<section class="hero course-intro"><div><div class="eyebrow">Методы искусственного интеллекта · 3 курс</div><h1>Практика по методам искусственного интеллекта</h1><p>На каждой паре есть одно конкретное задание. Сначала решаем его простым способом, потом пробуем методы машинного обучения, поиск и LLM. Открывай ближайшую пару и выполняй шаги сверху вниз.</p></div><div class="hero-meta"><div class="stat-chip"><strong>7</strong><span>пар</span></div><div class="stat-chip"><strong>4</strong><span>подгруппы</span></div><div class="stat-chip"><strong>${state.ready.length}/7</strong><span>готово</span></div></div></section>`;
};

mainJobCard=function(){
  const slot=nextSlot(group);
  if(!slot){return `<article class="card job-card" data-testid="current-job"><div class="job-head"><div><div class="eyebrow">Семестр закончен</div><h2 class="job-title">Все занятия по расписанию уже прошли</h2></div></div><p class="job-text">Материалы и свои заметки можно открыть в разделе «Все пары».</p><div class="job-actions"><button class="primary-btn" data-view="route">Открыть все пары</button></div></article>`}
  const l=lesson(slot.lesson),open=RELEASED.includes(slot.lesson),a=ASSIGNMENT_UI[slot.lesson];
  return `<article class="card job-card job-card--next" data-testid="current-job"><div class="job-head"><div><div class="eyebrow">Следующая пара · ${formatDate(slot.date,true)}</div><h2 class="job-title">${esc(l.title)}</h2><div class="job-company">${esc(group)} · ${esc(slot.start)}–${esc(slot.end)} · ${esc(slot.room)}</div></div><div class="job-pay">${l.time}<small>${esc(l.stack)}</small></div></div>${a?`<div class="next-assignment"><span>Задание</span><strong>${esc(a.short)}</strong></div>`:''}<div class="job-actions">${open?`<button class="primary-btn" data-action="open-lesson" data-id="${slot.lesson}">Открыть задание</button>`:`<button class="primary-btn" data-view="route">Посмотреть план пары</button>`}<button class="secondary-btn" data-view="schedule">Расписание</button></div></article>`;
};

homeHTML=function(){
  const next=nextSlot(group);
  return `${hero()}${quickbar()}<div class="content-grid"><div class="stack">${mainJobCard()}
    <article class="card job-card course-how"><div class="eyebrow">Как устроена каждая пара</div><h3>Одна задача, несколько способов её решить</h3><div class="course-flow"><span>1. Задание</span><span>2. Простой вариант</span><span>3. Проверка ошибок</span><span>4. Новый метод</span><span>5. Сравнение</span></div><p class="job-text">Главное не получить «красивый ИИ», а понять, какой способ работает лучше и почему.</p></article>
  </div><aside class="stack"><section class="card side-card"><div class="side-title">Твоя подгруппа</div><h3>${esc(group)}</h3><dl class="kv"><dt>Когда</dt><dd>${esc(SCHEDULE_META[group].weekday)}, ${esc(SCHEDULE_META[group].time)}</dd><dt>Где</dt><dd>${esc(SCHEDULE_META[group].room)}</dd>${next?`<dt>Следующая</dt><dd>${formatDateShort(next.date)}, пара ${next.lesson}</dd>`:''}</dl><button class="secondary-btn" style="width:100%;margin-top:14px" data-view="schedule">Посмотреть расписание</button></section><section class="card side-card"><div class="side-title">Прогресс</div><h3>${state.ready.length} из 7</h3><div class="progress"><i style="width:${progress()}%"></i></div><p class="tiny muted">Отметки сохраняются только в этом браузере.</p></section></aside></div>`;
};

lessonTop=function(l){
  const slot=slotForLesson(group,l.id);
  return `<div class="lesson-page-head"><div><div class="eyebrow">Пара ${l.id} · ${esc(group)}</div><h1>${esc(l.title)}</h1><p>Сначала посмотри блок «Задание на пару». Ниже идут рабочая часть, примеры и материалы, которые помогают его выполнить.</p><div class="tags"><span class="tag red">${formatDate(slot.date,true)}</span><span class="tag">${esc(slot.start)}–${esc(slot.end)}</span><span class="tag">${esc(slot.room)}</span></div></div><button class="secondary-btn" data-view="route">← Все пары</button></div>`;
};

lessonHTML=function(){
  const l=lesson(activeLesson);
  if(!RELEASED.includes(l.id))return routeHTML();
  return `${quickbar()}${lessonTop(l)}${assignmentBrief(l)}<div class="lesson-shell lesson-shell--task"><div class="lesson-main">${l.id===1?lab1HTML():lab2HTML()}</div>${lessonSide(l)}</div>`;
};

lessonSide=function(l){
  const checks=state.checks[l.id]||[];
  return `<aside class="lesson-side"><section class="card side-card finish-card"><div class="side-title">Когда задание готово</div><div class="checklist">${l.checks.map((x,i)=>`<label class="checkrow"><input type="checkbox" data-check="${i}" data-lesson="${l.id}" ${checks[i]?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div><label class="tiny muted" style="display:block;margin-top:14px">Короткий вывод</label><textarea data-note="${l.id}" placeholder="Что получилось, где была ошибка и что ты поменял.">${esc(state.notes[l.id]||'')}</textarea><button class="primary-btn" style="width:100%;margin-top:10px" data-action="ready" data-id="${l.id}">${state.ready.includes(l.id)?'Обновить отметку ✓':'Отметить как готовое'}</button><p class="tiny muted" style="margin-top:10px">Отметка сохраняется только в твоём браузере.</p></section></aside>`;
};

lab1HTML=function(){return `
<section class="card context-card"><div class="section-label">Перед началом</div><h3>Что за задача</h3><p>Есть 12 обращений игроков. Каждое надо отправить в один из трёх отделов: <strong>аккаунт</strong>, <strong>оплата</strong> или <strong>техника</strong>. Если сообщение подходит сразу под несколько вариантов или непонятно, куда его отнести, возвращаем <strong>«Нужен человек»</strong>.</p><div class="example"><b>Пример</b>«Не могу войти после смены пароля» → аккаунт. «Деньги списались два раза» → оплата.</div></section>
<section id="work-area" class="card lesson-card work-card"><div class="section-label">Рабочая часть</div><h3>Выполняй по порядку</h3>
  <div class="work-step"><span class="work-num">1</span><div><h4>Прогони исходные правила</h4><p>Ничего пока не меняй. Сначала посмотри, сколько сообщений они классифицируют правильно и на каких ошибаются.</p><button class="primary-btn" data-action="run-tests">Прогнать 12 сообщений</button></div></div>
  <div id="testResults"></div>
  <div class="work-step"><span class="work-num">2</span><div><h4>Выбери минимум две ошибки</h4><p>Посмотри строки, где ожидаемая категория и результат не совпали. Подумай, почему правило ошиблось: не хватает слова, совпало несколько категорий или текст вообще неоднозначный.</p></div></div>
  <div class="work-step"><span class="work-num">3</span><div><h4>Измени хотя бы одно правило</h4><p>Добавь или убери слова. Перед повторным прогоном можно проверить одно сообщение вручную.</p><div class="rule-grid">${Object.keys(DEFAULT_RULES).map(k=>`<label>${LABELS[k]}<input type="text" data-rule="${k}" value="${esc(state.rules[k])}" maxlength="160"></label>`).join('')}</div><div class="input-actions"><input id="singleText" type="text" value="Не могу войти после смены пароля" maxlength="400"><button class="secondary-btn" data-action="classify">Проверить одно сообщение</button></div><div id="singleResult" aria-live="polite"></div><button class="ghost-btn" data-action="reset-rules">Вернуть исходные правила</button></div></div>
  <div class="work-step"><span class="work-num">4</span><div><h4>Прогони все 12 сообщений ещё раз</h4><p>Сравни результат с первым запуском. Если общий процент вырос, всё равно проверь, какие конкретно случаи починились, а какие могли сломаться.</p><button class="primary-btn" data-action="run-tests">Проверить после изменений</button></div></div>
  <div class="work-step"><span class="work-num">5</span><div><h4>Повтори ту же логику в Python</h4><p>Каркас уже готов. Твоя задача не написать всё с нуля, а разобраться в функции, изменить правила и получить тот же результат в коде.</p><div class="job-actions"><button class="primary-btn blue" data-download="lab1">Скачать notebook</button><button class="secondary-btn" data-download="lab1py">Версия .py</button><button class="secondary-btn" data-download="cases">12 сообщений .csv</button></div></div></div>
</section>`};

lab2HTML=function(){return `
<section class="card context-card"><div class="section-label">Перед началом</div><h3>Что меняется после первой пары</h3><p>Задача остаётся той же: распределять обращения по отделам. Но теперь список слов вручную не пишем. У нас есть сообщения с готовыми правильными категориями, и на них обучаем простую модель.</p><div class="example"><b>Важно</b>train — модель учится; validation — здесь сравниваем варианты; test — оставляем для финальной проверки.</div></section>
<section id="work-area" class="card lesson-card work-card"><div class="section-label">Рабочая часть</div><h3>Выполняй по порядку</h3>
  <div class="work-step"><span class="work-num">1</span><div><h4>Скачай notebook и данные</h4><p>Открой notebook в Jupyter. GPU и API-ключи не нужны.</p><div class="job-actions"><button class="primary-btn blue" data-download="lab2">Скачать notebook</button><button class="secondary-btn" data-download="dataset">Данные .csv</button></div></div></div>
  <div class="work-step"><span class="work-num">2</span><div><h4>Посмотри, как разделены данные</h4><p>Запусти ячейки до блока train / validation / test. Убедись, что понимаешь, какая часть для чего нужна.</p></div></div>
  <div class="work-step"><span class="work-num">3</span><div><h4>Запусти baseline</h4><p>Baseline специально очень простой: он всегда отвечает самой частой категорией. Запиши его accuracy.</p></div></div>
  <div class="work-step"><span class="work-num">4</span><div><h4>Обучи модель и сравни</h4><p>Запусти TF-IDF + Logistic Regression. Сравни accuracy с baseline на тех же validation-примерах.</p></div></div>
  <div class="work-step"><span class="work-num">5</span><div><h4>Разбери одну ошибку</h4><p>Найди сообщение, где модель ошиблась. Напиши, что ожидалось, что она предсказала и почему, по твоему мнению, могла ошибиться.</p></div></div>
</section>`};

openBrief=function(){showDialog('Что за задача',`<h2>Поддержка игровой студии</h2><p>Есть поток обращений игроков. Сейчас сотрудник вручную читает каждое сообщение и решает, в какой отдел его передать: аккаунт, оплата или техническая поддержка.</p><div class="example"><b>Наша задача</b>Автоматически предложить один из трёх отделов. Если уверенно определить отдел нельзя, вернуть «Нужен человек».</div><div class="example bad"><b>Чего здесь нет</b>Мы не отвечаем игроку, не меняем аккаунт и не проводим оплату. На этом курсе автоматизируем только определение категории обращения.</div>`)};

document.addEventListener('click',e=>{
  const jump=e.target.closest('[data-ui-action="jump-work"]');
  if(jump){document.querySelector('#work-area')?.scrollIntoView({behavior:'smooth',block:'start'});}
  const run=e.target.closest('button[data-action="run-tests"]');
  if(run){setTimeout(()=>document.querySelector('#testResults')?.scrollIntoView({behavior:'smooth',block:'nearest'}),0);}
});

render();
