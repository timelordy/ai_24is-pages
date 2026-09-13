'use strict';

/*
  Student-facing copy lives here on purpose.
  Core lesson logic stays in app.js; this file only changes wording and rerenders.
*/

Object.assign(LESSONS[0],{
  subtitle:'Для начала вообще без ИИ',
  desc:'Есть пачка сообщений от игроков. Надо раскидать их в аккаунты, оплату и технику. Сначала делаем это обычными правилами. Потом специально ищем случаи, где правила начинают косячить.',
  goal:'Чтобы ты мог объяснить, почему простое правило иногда нормально работает, а иногда уже лучше не угадывать и отдать случай человеку.',
  checks:['Прогнал все 12 сообщений','Нашёл хотя бы два места, где правила ошибаются или тупят','Поменял хотя бы одно правило и ещё раз всё прогнал','Могу объяснить, когда лучше не угадывать и отдать сообщение человеку']
});
Object.assign(LESSONS[1],{
  subtitle:'Теперь учим на примерах',
  desc:'Теперь не пишем список слов руками. Берём уже размеченные сообщения, учим на них простую модель и сравниваем её с максимально тупым baseline.',
  goal:'Понять, где модель учится, на чём мы её проверяем и почему test нельзя таскать в обучение ради красивой цифры.',
  checks:['Запустил notebook до конца','Понимаю, чем train отличается от validation и test','Сравнил модель с baseline','Нашёл и разобрал хотя бы одну ошибку модели']
});
Object.assign(LESSONS[2],{
  title:'Разобраться, что вообще значит 95%',
  subtitle:'Смотрим на ошибки, а не только на процент',
  desc:'Допустим, модель показывает 95%. Звучит красиво. Теперь смотрим, на чём именно она ошибается и почему две модели с одинаковой accuracy могут быть вообще разными по пользе.'
});
Object.assign(LESSONS[3],{
  title:'Найти нужную инструкцию',
  subtitle:'Сначала поиск по словам, потом по смыслу',
  desc:'Есть пачка инструкций поддержки. Надо по сообщению игрока найти нужную. Сначала делаем обычный поиск, потом пробуем семантический и сравниваем, где какой вариант реально полезнее.'
});
Object.assign(LESSONS[4],{
  title:'Вытащить нормальные данные из текста',
  subtitle:'LLM как обычный кусок системы',
  desc:'Берём свободный текст и просим модель вернуть нормальную структуру. Если чего-то в сообщении нет, оставляем пусто. Додумывать за пользователя не надо.'
});
Object.assign(LESSONS[5],{
  title:'Собрать всё вместе',
  subtitle:'Ничего нового, просто соединяем части',
  desc:'Определяем тему обращения, находим нужный материал и собираем результат в одну цепочку. Тут задача уже не выучить ещё один метод, а не развалить то, что сделали раньше.'
});
Object.assign(LESSONS[6],{
  title:'Проверить всё на новых сообщениях',
  subtitle:'Финальная проверка и защита',
  desc:'Получаем новые сообщения, которых раньше не видели. Прогоняем систему, смотрим ошибки и нормально объясняем, где она ещё может сломаться.'
});

Object.assign(QUIZ[0],{why:'Это словарь. Значение достаём по ключу: ticket["text"].'});
Object.assign(QUIZ[1],{why:'Условие n > 2 проходит только для 3 и 4, поэтому в списке останутся они.'});
Object.assign(QUIZ[2],{why:'Функция возвращает x * 2. Для тройки получится 6.'});
Object.assign(QUIZ[3],{why:'8 из 10 — это 0,8, то есть 80%.'});

hero=function(){
  return `<section class="hero"><div><div class="eyebrow">Методы искусственного интеллекта · 3 курс</div><h1>Короче, весь семестр у нас один кейс.</h1><p>Берём поддержку игровой студии и на ней по очереди пробуем обычные правила, ML, поиск и LLM. После каждой пары смотрим не «вау, ИИ», а стало ли решение реально лучше и где оно всё ещё ломается.</p></div><div class="hero-meta"><div class="stat-chip"><strong>7</strong><span>пар</span></div><div class="stat-chip"><strong>4</strong><span>подгруппы</span></div><div class="stat-chip"><strong>${state.ready.length}/7</strong><span>готово</span></div></div></section>`;
};

quickbar=function(){
  return `<div class="quickbar"><div class="shell quickbar-inner">
    <button class="chip ${view==='home'?'active':''}" data-view="home">Сейчас</button>
    <button class="chip ${view==='route'?'active':''}" data-view="route">Все пары</button>
    <button class="chip ${view==='schedule'?'active':''}" data-view="schedule">Расписание</button>
    <button class="chip ${view==='materials'?'active':''}" data-view="materials">Материалы</button>
    <button class="chip ${view==='portfolio'?'active':''}" data-view="portfolio">Моя работа</button>
    <span class="chip soft">Сейчас открыты пары 1 и 2</span>
  </div></div>`;
};

homeHTML=function(){
  const next=nextSlot(group);
  return `${hero()}${quickbar()}<div class="content-grid"><div class="stack">${mainJobCard()}
    <article class="card job-card"><div class="job-head"><div><div class="eyebrow">Как работаем на парах</div><h3 class="job-title" style="font-size:20px">Сначала решаем задачу самым простым способом.</h3></div></div><div class="tags"><span class="tag">1. Понять, что вообще надо</span><span class="tag">2. Сделать простой вариант</span><span class="tag">3. Проверить</span><span class="tag">4. Попробовать ИИ</span><span class="tag">5. Сравнить</span></div><p class="job-text">Если обычный код работает не хуже модели — отлично. Значит, здесь модель пока не нужна. Натягивать ИИ на всё подряд не будем.</p></article>
  </div><aside class="stack"><section class="card side-card"><div class="side-title">Твоя подгруппа</div><h3>${esc(group)}</h3><dl class="kv"><dt>Недели</dt><dd>${esc(SCHEDULE_META[group].cycle)}</dd><dt>Когда</dt><dd>${esc(SCHEDULE_META[group].weekday)}, ${esc(SCHEDULE_META[group].time)}</dd><dt>Где</dt><dd>${esc(SCHEDULE_META[group].room)}</dd>${next?`<dt>Ближайшая</dt><dd>${formatDateShort(next.date)}, пара ${next.lesson}</dd>`:''}</dl><button class="secondary-btn" style="width:100%;margin-top:14px" data-view="schedule">Посмотреть все группы</button></section><section class="card side-card"><div class="side-title">Что уже сделал</div><h3>${state.ready.length} из 7</h3><div class="progress"><i style="width:${progress()}%"></i></div><p class="tiny muted">Это просто твои отметки в браузере. Какая пара идёт следующей, сайт берёт из расписания.</p></section></aside></div>`;
};

routeHTML=function(){
  const scheduled=currentLesson();
  return `${hero()}${quickbar()}<div class="section-head"><div><h2>Все пары</h2><p>Темы у всех одинаковые, даты разные. Здесь сразу видно, когда конкретно у ${esc(group)} какая работа.</p></div><button class="secondary-btn" data-view="schedule">Все подгруппы →</button></div><div class="route-list">${LESSONS.map(l=>{const slot=slotForLesson(group,l.id),open=RELEASED.includes(l.id);return `<article class="route-item ${state.ready.includes(l.id)?'done':''} ${l.id===scheduled?'current':''}"><div class="route-num">${state.ready.includes(l.id)?'✓':String(l.id).padStart(2,'0')}</div><div><h3>${esc(l.title)}</h3><p>${formatDate(slot.date,true)} · ${esc(slot.start)}–${esc(slot.end)} · ${esc(slot.room)} · ${esc(l.subtitle)}</p></div><div class="route-status">${statusText(l.id)}${open?` · <button class="ghost-btn" data-action="open-lesson" data-id="${l.id}">Открыть</button>`:''}</div></article>`}).join('')}</div><div class="callout" style="margin-top:14px">Пары 3–7 пока не открываю. Сначала нормально доведём первые две, потом будем добавлять следующие.</div>`;
};

scheduleHTML=function(){
  const order=[group,...GROUPS.filter(g=>g!==group)];
  return `${quickbar()}<div class="section-head"><div><h2>Расписание</h2><p>Здесь все четыре подгруппы и все семь встреч. Выбираешь свою группу сверху — она поднимается первой, чтобы не искать её каждый раз.</p></div></div><div class="stack">${order.map(g=>scheduleGroupHTML(g)).join('')}</div>`;
};

lessonSide=function(l){
  const checks=state.checks[l.id]||[];
  return `<aside class="lesson-side"><section class="card side-card"><div class="side-title">Что должно остаться в голове</div><p class="quote" style="margin-top:0">${esc(l.goal)}</p></section><section class="card side-card"><div class="side-title">Перед тем как закрывать</div><div class="checklist">${l.checks.map((x,i)=>`<label class="checkrow"><input type="checkbox" data-check="${i}" data-lesson="${l.id}" ${checks[i]?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div><label class="tiny muted" style="display:block;margin-top:14px">Коротко напиши, что получилось и где сломалось</label><textarea data-note="${l.id}" placeholder="2–3 предложения. Без отчёта на три страницы.">${esc(state.notes[l.id]||'')}</textarea><button class="primary-btn" style="width:100%;margin-top:10px" data-action="ready" data-id="${l.id}">${state.ready.includes(l.id)?'Обновить отметку ✓':'Готово, можно разбирать'}</button></section></aside>`;
};

lab1HTML=function(){return `
<section class="card lesson-card"><div class="index">01</div><h3>Сначала вообще без ИИ</h3><p>Смотрите, задача простая: есть три отдела — <strong>аккаунт, оплата и техника</strong>. «Забыл пароль» явно идёт в аккаунт. «Деньги списали два раза» — в оплату. Для начала просто попробуем разнести сообщения по таким словам.</p><div class="example"><b>На очевидном сообщении всё нормально</b>Есть «пароль» или «войти» — отправляем в аккаунты.</div><div class="example bad"><b>А тут уже начинается</b>«Пароль менять не надо, проблема с оплатой». Слова нашли два отдела, хотя человеку нужен один. Поиск по словам смысла не понимает.</div><div class="job-actions"><button class="secondary-btn" data-action="quiz">Проверить, что помню по Python</button><button class="secondary-btn" data-download="python-basics">Памятка .txt</button></div></section>
<section class="card lesson-card"><div class="index">02</div><h3>Теперь ломаем свои же правила</h3><p>Меняй слова в списках и гоняй одни и те же 12 сообщений. Тут как раз интересно не сделать 12/12 любой ценой, а увидеть, как одно «улучшение» чинит один случай и ломает другой.</p><div class="rule-grid">${Object.keys(DEFAULT_RULES).map(k=>`<label>${LABELS[k]}<input type="text" data-rule="${k}" value="${esc(state.rules[k])}" maxlength="160"></label>`).join('')}</div><div class="input-actions"><input id="singleText" type="text" value="Не могу войти после смены пароля" maxlength="400"><button class="primary-btn" data-action="classify">Проверить</button></div><div id="singleResult" aria-live="polite"></div><div class="job-actions"><button class="secondary-btn" data-action="run-tests">Прогнать 12 сообщений</button><button class="ghost-btn" data-action="reset-rules">Вернуть как было</button></div><div id="testResults"></div><div class="callout">Процент вырос? Хорошо. Теперь посмотри, за счёт каких сообщений. Одна цифра сама по себе тут мало что говорит.</div></section>
<section class="card lesson-card"><div class="index">03</div><h3>Теперь то же самое в Python</h3><p>Каркас уже готов. Не надо полпары героически писать всё с нуля. Разберись, что делает функция, добавь свои слова, прогони примеры и выбери две ошибки, которые сможешь объяснить.</p><pre class="code">def classify(text):
    text = text.lower().replace("ё", "е")
    matched = []

    for category, words in rules.items():
        if any(word in text for word in words):
            matched.append(category)

    if len(matched) == 1:
        return matched[0]

    return "needs_review"</pre><div class="job-actions"><button class="primary-btn blue" data-download="lab1">Скачать notebook</button><button class="secondary-btn" data-download="lab1py">Версия .py</button><button class="secondary-btn" data-download="cases">Примеры .csv</button></div></section>`};

lab2HTML=function(){return `
<section class="card lesson-card"><div class="index">01</div><h3>Теперь учим на готовых примерах</h3><p>На первой паре мы сами писали слова для каждого отдела. Теперь есть сообщения, где правильный отдел уже известен. Часть отдаём модели на обучение, на другой части проверяем, чему она вообще научилась.</p><div class="example"><b>Что где лежит</b>train — на этом учимся · validation — тут смотрим ошибки и что-то меняем · test — трогаем уже в самом конце.</div><div class="callout blue">TF-IDF и Logistic Regression запомнятся потом. Сейчас важнее понять, где модель училась, где мы её проверяли и почему нельзя подглядывать в test.</div></section>
<section class="card lesson-card"><div class="index">02</div><h3>Запускаем готовый каркас</h3><p>Тут уже понадобится Jupyter и scikit-learn. Видеокарта, API-ключи и какие-то платные сервисы не нужны.</p><pre class="code">model = make_pipeline(
    TfidfVectorizer(),
    LogisticRegression(max_iter=1000)
)

model.fit(train_texts, train_labels)
predictions = model.predict(validation_texts)</pre><div class="job-actions"><button class="primary-btn blue" data-download="lab2">Скачать notebook</button><button class="secondary-btn" data-download="dataset">Данные .csv</button></div></section>
<section class="card lesson-card"><div class="index">03</div><h3>Сначала сравниваем с тупым вариантом</h3><ol><li>Берём baseline, который всегда отвечает самой частой категорией.</li><li>На тех же сообщениях запускаем нашу модель.</li><li>Смотрим не только accuracy, но и конкретно где она ошиблась.</li></ol><div class="example bad"><b>Если модель не обогнала baseline</b>Ничего страшного. Так и пишем. Подгонять данные, пока не получится красивая цифра, смысла нет.</div></section>`};

materialsHTML=function(){
  const files=[['python-basics','TXT','Python на первую пару','Самый минимум: словарь, цикл, функция и как посчитать долю правильных ответов.'],['lab1','IPYNB','Пара 1 · Правила','Каркас уже готов. Тебе надо разобраться и поменять его, а не писать всё с нуля.'],['lab1py','PY','Пара 1 · Обычный .py','То же самое, если не хочешь открывать Jupyter.'],['cases','CSV','Пара 1 · 12 сообщений','Те самые сообщения, на которых ломаем и проверяем правила.'],['lab2','IPYNB','Пара 2 · Первая модель','TF-IDF, Logistic Regression и baseline в одном notebook.'],['dataset','CSV','Пара 2 · Данные','36 вымышленных сообщений с готовыми категориями.']];
  return `${quickbar()}<div class="section-head"><div><h2>Материалы</h2><p>Все файлы с пар лежат здесь. Чтобы потом не искать, что я там куда скидывал.</p></div></div><div class="download-list">${files.map(([id,ext,t,d])=>`<article class="download-item"><div class="file-icon">${ext}</div><div><h3>${t}</h3><p>${d}</p></div><button class="secondary-btn" data-download="${id}">Скачать</button></article>`).join('')}</div>`;
};

portfolioHTML=function(){
  return `${quickbar()}<div class="section-head"><div><h2>Моя работа</h2><p>Тут лежат твои отметки и короткие выводы по ${esc(group)}. Всё хранится только в этом браузере, я автоматически это не вижу.</p></div><div class="job-actions" style="margin-top:0"><button class="secondary-btn" data-action="export">Скачать копию</button><button class="secondary-btn" data-action="import">Загрузить копию</button></div></div><div class="local-note"><span>Если сидишь не за своим компьютером — сначала скачай копию, потом уже очищай данные.</span><button class="ghost-btn" data-action="clear">Очистить</button></div>${state.ready.length?state.ready.map(id=>{const l=lesson(id);return `<article class="card portfolio-card"><div class="job-head"><div><div class="eyebrow">Пара ${id} · ${formatDate(slotForLesson(group,id).date)}</div><h3>${esc(l.title)}</h3></div><span class="tag green">готово к разбору</span></div><p>${esc(state.notes[id]||'')}</p><div class="job-actions"><button class="secondary-btn" data-action="open-lesson" data-id="${id}">Открыть</button><button class="secondary-btn" data-download="report" data-id="${id}">Скачать отчёт</button></div></article>`}).join(''):`<section class="card empty"><h3>Пока пусто</h3><p>Сделай первую работу, пройди чек-лист и напиши пару предложений про то, где правила сломались. Тогда она появится здесь.</p><button class="primary-btn" data-action="open-lesson" data-id="1">Открыть первую пару</button></section>`}`;
};

helpHTML=function(){return `${quickbar()}<div class="section-head"><div><h2>Что вообще от вас здесь надо</h2><p>Задачи выучить весь ИИ за семь пар нет. На каждой паре берём одну новую штуку, пробуем её на том же кейсе и сравниваем с тем, что уже было.</p></div></div><div class="content-grid"><div class="stack"><section class="card lesson-card"><h3>Схема почти всегда одна</h3><ol><li>Что нам вообще надо сделать?</li><li>Как это решить самым простым способом?</li><li>Как поймём, что решение работает?</li><li>Что пробуем вместо baseline?</li><li>Где новый вариант ошибается?</li><li>Стало лучше или просто стало сложнее?</li></ol></section><section class="card lesson-card"><h3>Можно пользоваться ChatGPT и прочим?</h3><p>Можно. Делать вид, что вы этим не пользуетесь, смысла нет. Но если весь код сделал агент, а ты не можешь объяснить, что там происходит и поменять пару строк, значит работа пока не твоя. На защите попрошу показать свой кусок и объяснить его.</p></section></div><aside class="stack"><section class="card side-card"><div class="side-title">Если Python подзабыл</div><p class="quote" style="margin-top:0">Ничего страшного. Пройди четыре вопроса, открой памятку и дальше уже разбирайся на готовом каркасе.</p><button class="secondary-btn" style="width:100%;margin-top:13px" data-action="quiz">Проверить себя</button></section><section class="card side-card"><div class="side-title">Если слишком легко</div><p class="quote" style="margin-top:0">Добавь кривые и неоднозначные сообщения. Потом попробуй улучшить решение так, чтобы не сломать остальные случаи.</p></section></aside></div>`};

openBrief=function(){showDialog('Что хочет заказчик',`<h2>Короче, что у нас за задача</h2><p>Есть вымышленная игровая студия «Север». В поддержку летят сообщения про аккаунты, покупки и технические проблемы. Сейчас человек читает каждое сообщение и руками решает, кому его передать.</p><div class="example"><b>Что надо сделать</b>Предлагать один из трёх отделов: аккаунт, оплата или техника. Если сообщение мутное или подходит сразу под несколько вариантов — не угадывать, а вернуть «Нужен человек».</div><div class="example bad"><b>Чего пока не делаем</b>Не отвечаем игроку, не возвращаем деньги и не лезем в аккаунт. Нам сейчас надо только нормально определить, куда отправить сообщение.</div><p style="margin-top:14px">На первой паре решаем это обычными правилами. Дальше на том же кейсе по очереди пробуем другие методы и смотрим, есть ли от них реальная польза.</p>`)};

quiz=function(){const saved=state.quiz?.answers||[];showDialog('Проверка Python',`<h2>Четыре вопроса, чисто понять, всё ли помнишь</h2><p>Это не оценка. Если половину забыл — просто открой памятку и дальше работай с готовым каркасом.</p>${QUIZ.map((q,i)=>`<fieldset class="quiz"><legend>${i+1}. ${esc(q.q)}</legend>${q.code?`<pre class="code" style="font-size:11px">${esc(q.code)}</pre>`:''}${q.opts.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}" ${saved[i]===j?'checked':''}> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}<div id="quizResult"></div><button class="primary-btn" data-action="quiz-check">Проверить</button>`)};

lab1nb=function(){return notebook([md('# Пара 1. Разносим обращения по отделам\n\nКаркас уже есть. Разберись, что делает функция, добавь слова для technical, прогони сообщения и выбери две ошибки, которые можешь нормально объяснить.'),code(lab1py()),md('## Что написать в конце\n\n- Где правила сработали нормально?\n- Где сломались?\n- Что ты поменял?\n- Когда лучше вернуть needs_review, а не угадывать?')])};

lab2nb=function(){return notebook([md('# Пара 2. Учим модель на примерах\n\nТот же самый кейс. Теперь вместо списка слов руками берём размеченные сообщения. Набор маленький и учебный, поэтому красивый процент здесь ещё ничего не доказывает.'),code('from sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.dummy import DummyClassifier\nfrom sklearn.metrics import accuracy_score\n\ndata = '+JSON.stringify(TRAINING,null,2)+'\ntexts = [x["text"] for x in data]\nlabels = [x["label"] for x in data]'),code('train_texts, rest_texts, train_labels, rest_labels = train_test_split(\n    texts, labels, test_size=1/3, random_state=24, stratify=labels\n)\nvalidation_texts, test_texts, validation_labels, test_labels = train_test_split(\n    rest_texts, rest_labels, test_size=0.5, random_state=24, stratify=rest_labels\n)\nprint(len(train_texts), len(validation_texts), len(test_texts))'),md('## Сначала baseline\n\nБерём максимально тупой вариант: всегда отвечать самой частой категорией. Иначе потом непонятно, наша модель вообще что-то улучшила или просто выглядит умнее.'),code('baseline = DummyClassifier(strategy="most_frequent")\nbaseline.fit([[0]] * len(train_labels), train_labels)\nbase_pred = baseline.predict([[0]] * len(validation_labels))\nprint("baseline:", accuracy_score(validation_labels, base_pred))'),code('model = make_pipeline(TfidfVectorizer(), LogisticRegression(max_iter=1000, random_state=24))\nmodel.fit(train_texts, train_labels)\npred = model.predict(validation_texts)\nprint("model:", accuracy_score(validation_labels, pred))\nfor text, expected, got in zip(validation_texts, validation_labels, pred):\n    print(f"{expected:12} | {got:12} | {text}")'),md('## Короткий вывод\n\n1. Модель обогнала baseline или нет?\n2. Где конкретно ошиблась?\n3. Почему одного запуска мало, чтобы делать серьёзные выводы?\n4. Почему test до финальной проверки лучше вообще не трогать?')])};

render();
