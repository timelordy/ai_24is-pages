'use strict';

const GROUPS = ['24ИС02/1','24ИС02/2','24ИС03/1','24ИС03/2'];
const RELEASED = [1,2];
const KEY = 'ai24is:v2:';
const LABELS = {account:'Аккаунт',payment:'Оплата',technical:'Техника',needs_review:'Нужен человек'};
const DEFAULT_RULES = {
  account:'пароль, вход, войти, аккаунт, почт',
  payment:'оплат, платеж, списал, покупк, деньги',
  technical:'ошибк, вылет, завис, звук, fps, текстур'
};
const CASES = [
  ['Не могу войти после смены пароля','account'],
  ['Деньги списались два раза','payment'],
  ['После обновления игра вылетает','technical'],
  ['Не приходит письмо для входа','account'],
  ['Купил дополнение, но его нет','payment'],
  ['Пропал звук после обновления','technical'],
  ['Пароль менять не надо, проблема с оплатой','needs_review'],
  ['Вообще ничего не работает, помогите','needs_review'],
  ['Ошибка при покупке набора','needs_review'],
  ['Хочу поменять почту у аккаунта','account'],
  ['Игра зависает в главном меню','technical'],
  ['Где посмотреть чек за покупку?','payment']
];
const TRAINING = [
  ['Не могу войти после смены пароля','account'],['Забыл пароль от профиля','account'],['Как поменять почту аккаунта','account'],['Не приходит код для входа','account'],['Хочу удалить аккаунт','account'],['Кто-то вошёл в мой профиль','account'],['Не помню логин','account'],['Как выйти со всех устройств','account'],['Не приходит письмо восстановления','account'],['Перенести профиль на другую почту','account'],['Не могу авторизоваться','account'],['Нужна помощь со входом','account'],
  ['Купил набор, но его нет','payment'],['Списали деньги дважды','payment'],['Не проходит оплата','payment'],['Хочу вернуть деньги','payment'],['Где найти чек','payment'],['Как отключить подписку','payment'],['Баланс не изменился после покупки','payment'],['Банк отклонил платёж','payment'],['Цена в чеке другая','payment'],['Когда вернут деньги','payment'],['Покупка прошла, предмет не появился','payment'],['Деньги списались без подтверждения','payment'],
  ['Игра вылетает при запуске','technical'],['Чёрные текстуры','technical'],['После обновления пропал звук','technical'],['Игра зависает','technical'],['Не работает геймпад','technical'],['Очень низкий FPS','technical'],['Загрузка встала','technical'],['Мерцает изображение','technical'],['Клиент закрывается сам','technical'],['Персонаж застрял в стене','technical'],['Не сохраняются настройки','technical'],['Постоянно рвётся соединение','technical']
].map(([text,label],i)=>({id:i+1,text,label}));
const QUIZ = [
  {q:'Как достать текст из словаря?',code:'ticket = {"text": "Не могу войти"}',opts:['ticket["text"]','ticket.text()','text(ticket)'],a:0,why:'У словаря значение берём по ключу: ticket["text"].'},
  {q:'Что останется в result?',code:'result = []\nfor n in [1,2,3,4]:\n    if n > 2:\n        result.append(n)',opts:['[1,2]','[3,4]','[4]'],a:1,why:'Условие n > 2 выполняется для 3 и 4.'},
  {q:'Что вернёт функция?',code:'def double(x):\n    return x * 2\n\ndouble(3)',opts:['3','6','Ничего'],a:1,why:'return отдаёт результат функции. 3 × 2 = 6.'},
  {q:'8 верных ответов из 10. Это сколько?',code:'',opts:['8%','20%','80%'],a:2,why:'8 / 10 = 0,8 = 80%.'}
];
const LESSONS = [
  {id:1,title:'Разнести обращения по отделам',subtitle:'Сначала без нейросети',time:'90 мин',stack:'Python · правила',desc:'Есть сообщения игроков. Нужно понять, куда отправить каждое: аккаунт, оплата или техника. Сначала делаем это обычными правилами и смотрим, где они ломаются.',goal:'Понять разницу между «код работает» и «решение реально нормально разбирает случаи».',checks:['Прогнал все 12 примеров','Нашёл минимум две ошибки или спорных случая','Изменил хотя бы одно правило и проверил ещё раз','Могу объяснить, когда лучше отдать обращение человеку']},
  {id:2,title:'Научить модель на примерах',subtitle:'Тот же заказ, новый способ',time:'90 мин',stack:'scikit-learn · TF-IDF',desc:'Теперь не прописываем все слова руками. Берём размеченные сообщения, обучаем простую модель и честно сравниваем её с тупым базовым вариантом.',goal:'Понять цепочку данные → признаки → обучение → проверка и не мешать test с обучением.',checks:['Запустил notebook','Понимаю, что лежит в train, validation и test','Сравнил модель с простым baseline','Разобрал хотя бы одно неправильное предсказание']},
  {id:3,title:'Проверить, что скрывается за 95%',subtitle:'Метрики и цена ошибки',time:'90 мин',stack:'confusion matrix',desc:'Красивый процент сам по себе ничего не гарантирует. Разберём, какие ошибки модель делает и какие из них реально хуже.'},
  {id:4,title:'Найти нужную инструкцию',subtitle:'Поиск по словам и смыслу',time:'90 мин',stack:'поиск · embeddings',desc:'Есть пачка инструкций. Нужно быстро находить подходящую и понимать, когда нужного ответа в базе вообще нет.'},
  {id:5,title:'Достать нормальные данные из текста',subtitle:'LLM как один компонент',time:'90 мин',stack:'LLM · JSON',desc:'Берём свободное сообщение и получаем структуру. Если данных нет, оставляем пусто, а не додумываем красивый ответ.'},
  {id:6,title:'Собрать всё в одну цепочку',subtitle:'Без новой магии',time:'90 мин',stack:'pipeline',desc:'Соединяем знакомые куски: определить тему, найти материал, подготовить результат. Здесь уже ничего принципиально нового.'},
  {id:7,title:'Пройти приёмку',subtitle:'Новые сообщения и защита',time:'90 мин',stack:'проверка · разбор',desc:'Получаем новые случаи, гоняем систему и объясняем, где она ещё может облажаться и что с этим делать.'}
];

const SCHEDULE_META = {
  '24ИС02/1': {cycle:'нечётные недели',weekday:'понедельник',time:'15:30–17:00',start:'15:30',end:'17:00',room:'3-305'},
  '24ИС02/2': {cycle:'чётные недели',weekday:'понедельник',time:'15:30–17:00',start:'15:30',end:'17:00',room:'3-305'},
  '24ИС03/1': {cycle:'чётные недели',weekday:'понедельник',time:'17:10–18:40',start:'17:10',end:'18:40',room:'3-305'},
  '24ИС03/2': {cycle:'нечётные недели',weekday:'вторник',time:'09:40–11:10',start:'09:40',end:'11:10',room:'3-317 НОЦ «Цифра»'}
};
const SCHEDULE_DATES = {
  '24ИС02/1':['2026-09-14','2026-09-28','2026-10-12','2026-10-26','2026-11-09','2026-11-23','2026-12-07'],
  '24ИС02/2':['2026-09-21','2026-10-05','2026-10-19','2026-11-02','2026-11-16','2026-11-30','2026-12-14'],
  '24ИС03/1':['2026-09-21','2026-10-05','2026-10-19','2026-11-02','2026-11-16','2026-11-30','2026-12-14'],
  '24ИС03/2':['2026-09-15','2026-09-29','2026-10-13','2026-10-27','2026-11-10','2026-11-24','2026-12-08']
};
const SCHEDULE = Object.fromEntries(GROUPS.map(g=>[g,SCHEDULE_DATES[g].map((date,i)=>({group:g,lesson:i+1,date,start:SCHEDULE_META[g].start,end:SCHEDULE_META[g].end,room:SCHEDULE_META[g].room}))]));

const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];
const esc = v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let group = localStorage.getItem(KEY+'group') || GROUPS[0];
if(!GROUPS.includes(group)) group=GROUPS[0];
let view = 'home';
let activeLesson = 1;
let state = loadState();
let lastTest = null;
let toastTimer;

function fresh(){return {version:2,ready:[],notes:{},checks:{},rules:{...DEFAULT_RULES},quiz:null}}
function loadState(){
  try{
    const raw = localStorage.getItem(KEY+group);
    if(!raw) return fresh();
    const parsed = JSON.parse(raw);
    if(parsed.version!==2) return fresh();
    return Object.assign(fresh(),parsed,{rules:Object.assign({},DEFAULT_RULES,parsed.rules||{})});
  }catch{return fresh()}
}
function save(){try{localStorage.setItem(KEY+group,JSON.stringify(state))}catch{showBanner('Браузер не сохраняет данные. Перед закрытием скачай копию в «Моя работа».')}}
function showBanner(text){const el=$('#banner');el.textContent=text;el.hidden=false}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500)}
function setHash(hash){if(location.hash.slice(1)!==hash) history.replaceState(null,'','#'+hash)}
function route(to,id){view=to;if(id)activeLesson=id;setHash(to==='lesson'?'lesson-'+activeLesson:to);render();window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true})}
function fromHash(){const h=location.hash.slice(1);const m=h.match(/^lesson-([1-7])$/);if(m){activeLesson=Number(m[1]);view=RELEASED.includes(activeLesson)?'lesson':'route'}else view=['home','route','schedule','materials','portfolio','help'].includes(h)?h:'home';render()}
function lesson(id){return LESSONS.find(x=>x.id===id)}
function slotStart(slot){return new Date(`${slot.date}T${slot.start}:00+03:00`)}
function slotEnd(slot){return new Date(`${slot.date}T${slot.end}:00+03:00`)}
function nextSlot(g,at=new Date()){return SCHEDULE[g].find(s=>slotEnd(s)>at)||null}
function slotForLesson(g,id){return SCHEDULE[g].find(s=>s.lesson===id)||null}
function currentLesson(){const slot=nextSlot(group);return slot?slot.lesson:7}
function progress(){return Math.round(state.ready.length/7*100)}
function formatDate(date,withWeekday=false){
  const d=new Date(`${date}T12:00:00+03:00`);
  return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',...(withWeekday?{weekday:'short'}:{}),timeZone:'Europe/Moscow'}).format(d).replace(/^./,c=>c.toUpperCase());
}
function formatDateShort(date){
  const [y,m,d]=date.split('-');
  return `${d}.${m}.${y}`;
}
function slotPhase(slot,at=new Date()){
  if(at<slotStart(slot))return 'future';
  if(at<=slotEnd(slot))return 'now';
  return 'past';
}
function slotLabel(slot,at=new Date()){
  const phase=slotPhase(slot,at);
  if(phase==='now')return 'Идёт сейчас';
  if(phase==='past')return 'Прошло';
  return 'Следующая пара';
}
function statusText(id){
  if(state.ready.includes(id))return 'Готово к разбору';
  const slot=slotForLesson(group,id),phase=slotPhase(slot);
  if(phase==='now')return 'Идёт сейчас';
  if(id===currentLesson()&&phase==='future')return 'Следующая пара';
  if(phase==='past')return RELEASED.includes(id)?'Можно повторить':'По расписанию прошло';
  return RELEASED.includes(id)?'Доступно':'Откроется позже';
}

function nav(){
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view || (view==='lesson'&&b.dataset.view==='home')));
  $('#group').value=group;
}
function quickbar(){
  return `<div class="quickbar"><div class="shell quickbar-inner">
    <button class="chip ${view==='home'?'active':''}" data-view="home">Сейчас</button>
    <button class="chip ${view==='route'?'active':''}" data-view="route">Все пары</button>
    <button class="chip ${view==='schedule'?'active':''}" data-view="schedule">Расписание</button>
    <button class="chip ${view==='materials'?'active':''}" data-view="materials">Материалы</button>
    <button class="chip ${view==='portfolio'?'active':''}" data-view="portfolio">Моя работа</button>
    <span class="chip soft">Первые 2 пары готовы</span>
  </div></div>`;
}
function hero(){
  return `<section class="hero"><div><div class="eyebrow">Методы искусственного интеллекта · 3 курс</div><h1>Одна задача. Дальше просто усложняем её по чуть-чуть.</h1><p>У каждой подгруппы семь встреч. Тема одна и та же, расписание своё. Сайт сам показывает, какая пара у выбранной подгруппы следующая.</p></div><div class="hero-meta"><div class="stat-chip"><strong>7</strong><span>пар</span></div><div class="stat-chip"><strong>4</strong><span>подгруппы</span></div><div class="stat-chip"><strong>${state.ready.length}/7</strong><span>пройдено</span></div></div></section>`;
}
function mainJobCard(){
  const slot=nextSlot(group);
  if(!slot){return `<article class="card job-card" data-testid="current-job"><div class="job-head"><div><div class="eyebrow">Семестр закончен</div><h2 class="job-title">Все семь встреч по расписанию уже прошли</h2><div class="job-company">${esc(group)} · ${esc(SCHEDULE_META[group].room)}</div></div></div><p class="job-text">Материалы и свои заметки можно открыть в «Все пары» и «Моя работа».</p><div class="job-actions"><button class="primary-btn" data-view="route">Открыть все пары</button><button class="secondary-btn" data-view="schedule">Посмотреть расписание</button></div></article>`}
  const l=lesson(slot.lesson),open=RELEASED.includes(slot.lesson),phase=slotPhase(slot);
  return `<article class="card job-card" data-testid="current-job"><div class="job-head"><div><div class="eyebrow">${slotLabel(slot)} · Пара ${slot.lesson} · ${formatDate(slot.date,true)}</div><h2 class="job-title">${esc(l.title)}</h2><div class="job-company">${esc(group)} · ${esc(SCHEDULE_META[group].weekday)} · ${esc(slot.start)}–${esc(slot.end)} · ${esc(slot.room)}</div></div><div class="job-pay">${l.time}<small>${esc(l.stack)}</small></div></div><div class="tags"><span class="tag red">${esc(l.subtitle)}</span><span class="tag">${formatDateShort(slot.date)}</span><span class="tag">${esc(SCHEDULE_META[group].cycle)}</span>${slot.lesson===1?'<span class="tag blue">можно начать в браузере</span>':''}</div><p class="job-text">${esc(l.desc)}</p><div class="job-actions">${open?`<button class="primary-btn" data-action="open-lesson" data-id="${slot.lesson}">${phase==='now'?'Открыть занятие':'Открыть задачу'}</button>`:`<button class="primary-btn" data-view="route">Посмотреть этап</button>`}<button class="secondary-btn" data-view="schedule">Всё расписание</button><span class="status">${open?statusText(slot.lesson):'Материалы откроются позже'}</span></div></article>`;
}
function homeHTML(){
  const next=nextSlot(group);
  return `${hero()}${quickbar()}<div class="content-grid"><div class="stack">${mainJobCard()}
    <article class="card job-card"><div class="job-head"><div><div class="eyebrow">Как здесь учимся</div><h3 class="job-title" style="font-size:20px">Сначала самое простое решение. Потом уже ИИ.</h3></div></div><div class="tags"><span class="tag">1. Понять задачу</span><span class="tag">2. Сделать baseline</span><span class="tag">3. Проверить ошибки</span><span class="tag">4. Попробовать метод</span><span class="tag">5. Сравнить</span></div><p class="job-text">Если нейросеть или LLM оказалась хуже обычного кода, это нормальный вывод. Здесь не надо доказывать, что ИИ обязательно нужен.</p></article>
  </div><aside class="stack"><section class="card side-card"><div class="side-title">Твоя подгруппа</div><h3>${esc(group)}</h3><dl class="kv"><dt>Недели</dt><dd>${esc(SCHEDULE_META[group].cycle)}</dd><dt>Когда</dt><dd>${esc(SCHEDULE_META[group].weekday)}, ${esc(SCHEDULE_META[group].time)}</dd><dt>Где</dt><dd>${esc(SCHEDULE_META[group].room)}</dd>${next?`<dt>Ближайшая</dt><dd>${formatDateShort(next.date)}, пара ${next.lesson}</dd>`:''}</dl><button class="secondary-btn" style="width:100%;margin-top:14px" data-view="schedule">Расписание всех групп</button></section><section class="card side-card"><div class="side-title">Твой прогресс</div><h3>${state.ready.length} из 7</h3><div class="progress"><i style="width:${progress()}%"></i></div><p class="tiny muted">Это личная отметка. Номер следующей пары берётся из календаря, а не из этих галочек.</p></section></aside></div>`;
}
function routeHTML(){
  const scheduled=currentLesson();
  return `${hero()}${quickbar()}<div class="section-head"><div><h2>Все семь занятий</h2><p>У каждой подгруппы те же семь тем. Даты разные, поэтому рядом с каждой парой показываю дату именно для ${esc(group)}.</p></div><button class="secondary-btn" data-view="schedule">Все подгруппы →</button></div><div class="route-list">${LESSONS.map(l=>{const slot=slotForLesson(group,l.id),open=RELEASED.includes(l.id);return `<article class="route-item ${state.ready.includes(l.id)?'done':''} ${l.id===scheduled?'current':''}"><div class="route-num">${state.ready.includes(l.id)?'✓':String(l.id).padStart(2,'0')}</div><div><h3>${esc(l.title)}</h3><p>${formatDate(slot.date,true)} · ${esc(slot.start)}–${esc(slot.end)} · ${esc(slot.room)} · ${esc(l.subtitle)}</p></div><div class="route-status">${statusText(l.id)}${open?` · <button class="ghost-btn" data-action="open-lesson" data-id="${l.id}">Открыть</button>`:''}</div></article>`}).join('')}</div><div class="callout" style="margin-top:14px">Пары 3–7 пока только план. Расписание уже фиксируем, а задания не изображаем готовыми, пока их реально нет.</div>`;
}
function scheduleHTML(){
  const order=[group,...GROUPS.filter(g=>g!==group)];
  return `${quickbar()}<div class="section-head"><div><h2>Расписание всех подгрупп</h2><p>Семь занятий на каждую подгруппу. Никакой 24ИС01 здесь нет: по «Методам ИИ» у тебя 24ИС02/1, 24ИС02/2, 24ИС03/1 и 24ИС03/2.</p></div></div><div class="stack">${order.map(g=>scheduleGroupHTML(g)).join('')}</div>`;
}
function scheduleGroupHTML(g){
  const meta=SCHEDULE_META[g];
  return `<section class="card lesson-card" data-testid="schedule-group" data-group="${esc(g)}"><div class="job-head"><div><div class="eyebrow">${g===group?'Выбрана сейчас':'Подгруппа'}</div><h3>${esc(g)}</h3><div class="job-company">${esc(meta.cycle)} · ${esc(meta.weekday)} · ${esc(meta.time)} · ${esc(meta.room)}</div></div>${g===group?'<span class="tag red">твоя выбранная</span>':''}</div><div class="table-wrap"><table><thead><tr><th>№</th><th>Дата</th><th>Время</th><th>Тема</th><th>Статус</th></tr></thead><tbody>${SCHEDULE[g].map(slot=>{const l=lesson(slot.lesson),phase=slotPhase(slot),open=RELEASED.includes(slot.lesson);const status=phase==='past'?'прошло':phase==='now'?'сейчас':slot.lesson===nextSlot(g)?.lesson?'следующая':'впереди';return `<tr data-testid="schedule-row"><td><strong>${slot.lesson}</strong></td><td>${formatDate(slot.date,true)}<div class="tiny muted">${formatDateShort(slot.date)}</div></td><td>${esc(slot.start)}–${esc(slot.end)}<div class="tiny muted">${esc(slot.room)}</div></td><td>${esc(l.title)}<div class="tiny muted">${esc(l.subtitle)}</div></td><td>${open&&g===group?`<button class="ghost-btn" data-action="open-lesson" data-id="${slot.lesson}">${status}</button>`:`<span class="tag ${phase==='now'?'red':phase==='past'?'green':''}">${status}</span>`}</td></tr>`}).join('')}</tbody></table></div></section>`;
}
function lessonTop(l){
  const slot=slotForLesson(group,l.id);
  return `<div class="section-head"><div><div class="eyebrow">Пара ${l.id} · ${esc(group)}</div><h2>${esc(l.title)}</h2><p>${esc(l.desc)}</p><div class="tags"><span class="tag red">${formatDate(slot.date,true)}</span><span class="tag">${esc(slot.start)}–${esc(slot.end)}</span><span class="tag">${esc(slot.room)}</span><span class="tag">${esc(SCHEDULE_META[group].cycle)}</span></div></div><button class="secondary-btn" data-view="route">← Все пары</button></div>`;
}
function lessonHTML(){const l=lesson(activeLesson);if(!RELEASED.includes(l.id))return routeHTML();return `${quickbar()}${lessonTop(l)}<div class="lesson-shell"><div class="lesson-main">${l.id===1?lab1HTML():lab2HTML()}</div>${lessonSide(l)}</div>`}
function lessonSide(l){const checks=state.checks[l.id]||[];return `<aside class="lesson-side"><section class="card side-card"><div class="side-title">Что в итоге должно быть понятно</div><p class="quote" style="margin-top:0">${esc(l.goal)}</p></section><section class="card side-card"><div class="side-title">Перед тем как закончить</div><div class="checklist">${l.checks.map((x,i)=>`<label class="checkrow"><input type="checkbox" data-check="${i}" data-lesson="${l.id}" ${checks[i]?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div><label class="tiny muted" style="display:block;margin-top:14px">Коротко: что получилось и где ломается</label><textarea data-note="${l.id}" placeholder="Без отчёта на три страницы. Пара нормальных предложений.">${esc(state.notes[l.id]||'')}</textarea><button class="primary-btn" style="width:100%;margin-top:10px" data-action="ready" data-id="${l.id}">${state.ready.includes(l.id)?'Обновить отметку ✓':'Отметить как готовое'}</button></section></aside>`}
function lab1HTML(){return `
<section class="card lesson-card"><div class="index">01</div><h3>Сначала руками</h3><p>Есть три отдела: <strong>аккаунт, оплата, техника</strong>. Сообщение «забыл пароль» явно идёт в аккаунт. «Деньги списали два раза» — в оплату. Так же попробуй разложить ещё несколько сообщений.</p><div class="example"><b>Простое правило</b>Если встретилось «пароль» или «войти» → предлагаем отдел аккаунтов.</div><div class="example bad"><b>А вот уже не так красиво</b>«Пароль менять не надо, проблема с оплатой». Два слова есть, но смысл один. Обычный поиск по словам этого не понимает.</div><div class="job-actions"><button class="secondary-btn" data-action="quiz">Быстро проверить Python</button><button class="secondary-btn" data-download="python-basics">Памятка .txt</button></div></section>
<section class="card lesson-card"><div class="index">02</div><h3>Покрути правила</h3><p>Ниже обычная проверка по словам. Можешь менять списки и сразу видеть, что стало лучше, а что сломалось.</p><div class="rule-grid">${Object.keys(DEFAULT_RULES).map(k=>`<label>${LABELS[k]}<input type="text" data-rule="${k}" value="${esc(state.rules[k])}" maxlength="160"></label>`).join('')}</div><div class="input-actions"><input id="singleText" type="text" value="Не могу войти после смены пароля" maxlength="400"><button class="primary-btn" data-action="classify">Проверить</button></div><div id="singleResult" aria-live="polite"></div><div class="job-actions"><button class="secondary-btn" data-action="run-tests">Прогнать 12 примеров</button><button class="ghost-btn" data-action="reset-rules">Сбросить правила</button></div><div id="testResults"></div><div class="callout">Если после изменения стало 10/12 вместо 8/12, это ещё не победа. Посмотри, <strong>какие именно</strong> два случая всё ещё неправильные.</div></section>
<section class="card lesson-card"><div class="index">03</div><h3>То же самое в Python</h3><p>Основная функция уже есть. Не надо полпары вспоминать синтаксис. Задача: понять код, дописать небольшой кусок, прогнать примеры и объяснить две ошибки.</p><pre class="code">def classify(text):
    text = text.lower().replace("ё", "е")
    matched = []

    for category, words in rules.items():
        if any(word in text for word in words):
            matched.append(category)

    if len(matched) == 1:
        return matched[0]

    return "needs_review"</pre><div class="job-actions"><button class="primary-btn blue" data-download="lab1">Скачать notebook</button><button class="secondary-btn" data-download="lab1py">Версия .py</button><button class="secondary-btn" data-download="cases">Примеры .csv</button></div></section>`}
function lab2HTML(){return `
<section class="card lesson-card"><div class="index">01</div><h3>Теперь не прописываем слова сами</h3><p>Есть сообщения, где правильная категория уже известна. Показываем их модели и проверяем на других примерах. Важно: <strong>проверочные ответы не должны участвовать в обучении</strong>.</p><div class="example"><b>Схема на эту пару</b>train → модель учится · validation → смотрим ошибки · test → финальная проверка после того, как решение зафиксировали.</div><div class="callout blue">Названия TF-IDF и Logistic Regression знать полезно. Но важнее понимать, зачем здесь признаки, где модель учится и почему нельзя подглядывать в test.</div></section>
<section class="card lesson-card"><div class="index">02</div><h3>Запускаем готовый каркас</h3><p>Тут уже нужен Jupyter и scikit-learn. GPU, API-ключ и подписка на что-либо не нужны.</p><pre class="code">model = make_pipeline(
    TfidfVectorizer(),
    LogisticRegression(max_iter=1000)
)

model.fit(train_texts, train_labels)
predictions = model.predict(validation_texts)</pre><div class="job-actions"><button class="primary-btn blue" data-download="lab2">Скачать notebook</button><button class="secondary-btn" data-download="dataset">Данные .csv</button></div></section>
<section class="card lesson-card"><div class="index">03</div><h3>С чем сравниваем</h3><ol><li>Самый тупой baseline: всегда отвечать самой частой категорией.</li><li>Нашу модель на тех же validation-примерах.</li><li>Конкретные ошибки. Не только одну цифру accuracy.</li></ol><div class="example bad"><b>Нормальный результат</b>Если модель оказалась не лучше baseline, так и пишем. Подгонять примеры под красивый процент не надо.</div></section>`}
function materialsHTML(){
  const files=[['python-basics','TXT','Минимум Python','Словарь, цикл, функция и доля правильных ответов.'],['lab1','IPYNB','Пара 1 · Правила','Готовый каркас. Без сторонних библиотек.'],['lab1py','PY','Пара 1 · Обычный .py','То же задание без Jupyter.'],['cases','CSV','Пара 1 · 12 примеров','Открытые случаи для разбора ошибок.'],['lab2','IPYNB','Пара 2 · Первая модель','TF-IDF, Logistic Regression, baseline.'],['dataset','CSV','Пара 2 · Учебные данные','36 вымышленных сообщений.']];
  return `${quickbar()}<div class="section-head"><div><h2>Материалы</h2><p>Всё лежит здесь. Никаких «я скинул файл где-то в чат две недели назад».</p></div></div><div class="download-list">${files.map(([id,ext,t,d])=>`<article class="download-item"><div class="file-icon">${ext}</div><div><h3>${t}</h3><p>${d}</p></div><button class="secondary-btn" data-download="${id}">Скачать</button></article>`).join('')}</div>`;
}
function portfolioHTML(){
  return `${quickbar()}<div class="section-head"><div><h2>Моя работа</h2><p>${esc(group)}. Всё хранится только в этом браузере. Это не аккаунт и не журнал оценок.</p></div><div class="job-actions" style="margin-top:0"><button class="secondary-btn" data-action="export">Скачать копию</button><button class="secondary-btn" data-action="import">Загрузить копию</button></div></div><div class="local-note"><span>Если работаешь на общем компьютере: скачай копию, потом очисти сессию.</span><button class="ghost-btn" data-action="clear">Очистить</button></div>${state.ready.length?state.ready.map(id=>{const l=lesson(id);return `<article class="card portfolio-card"><div class="job-head"><div><div class="eyebrow">Пара ${id} · ${formatDate(slotForLesson(group,id).date)}</div><h3>${esc(l.title)}</h3></div><span class="tag green">готово к разбору</span></div><p>${esc(state.notes[id]||'')}</p><div class="job-actions"><button class="secondary-btn" data-action="open-lesson" data-id="${id}">Открыть</button><button class="secondary-btn" data-download="report" data-id="${id}">Скачать отчёт</button></div></article>`}).join(''):`<section class="card empty"><h3>Пока пусто</h3><p>Пройди первую пару, отметь чек-лист и напиши пару предложений про ошибки. После этого работа появится здесь.</p><button class="primary-btn" data-action="open-lesson" data-id="1">Открыть первую пару</button></section>`}`;
}
function helpHTML(){return `${quickbar()}<div class="section-head"><div><h2>Как не утонуть в этой дисциплине</h2><p>Не пытайся запомнить весь ИИ. На каждой паре нужна одна новая идея и один нормальный вывод.</p></div></div><div class="content-grid"><div class="stack"><section class="card lesson-card"><h3>Что повторяем каждый раз</h3><ol><li>Что за задача?</li><li>Как сделать самым простым способом?</li><li>На чём проверяем?</li><li>Какой метод пробуем?</li><li>Где он ошибается?</li><li>Стало ли реально лучше?</li></ol></section><section class="card lesson-card"><h3>ИИ-помощниками пользоваться можно?</h3><p>В этой версии курса предполагается: можно разбираться с кодом и просить объяснения, но на паре ты должен сам объяснить свой кусок и поменять его. Если весь результат держится на «мне агент сгенерировал», это просто не видно, что ты понял.</p></section></div><aside class="stack"><section class="card side-card"><div class="side-title">Если Python пока слабый</div><p class="quote" style="margin-top:0">Начни с четырёх вопросов и памятки. На первой паре каркас уже готов.</p><button class="secondary-btn" style="width:100%;margin-top:13px" data-action="quiz">Проверить себя</button></section><section class="card side-card"><div class="side-title">Если слишком легко</div><p class="quote" style="margin-top:0">Добавь спорные сообщения и покажи, как одно улучшение ломает другой случай. Это полезнее, чем прикрутить ещё три библиотеки.</p></section></aside></div>`}
function render(){
  nav();
  const pages={home:homeHTML,route:routeHTML,schedule:scheduleHTML,lesson:lessonHTML,materials:materialsHTML,portfolio:portfolioHTML,help:helpHTML};
  $('#main').innerHTML=(pages[view]||homeHTML)();
}
function normalize(s){return String(s).toLocaleLowerCase('ru').replaceAll('ё','е')}
function classify(text){
  const clean=normalize(text),hits=[];
  for(const [cat,raw] of Object.entries(state.rules)){
    const words=raw.split(',').map(x=>normalize(x.trim())).filter(Boolean);
    const found=words.filter(w=>clean.includes(w));
    if(found.length) hits.push({cat,found});
  }
  return {category:hits.length===1?hits[0].cat:'needs_review',hits};
}
function classifyOne(){const input=$('#singleText');if(!input)return;const text=input.value.trim();if(!text){toast('Напиши сообщение.');return}const out=classify(text);const el=$('#singleResult');const detail=out.hits.length?out.hits.map(x=>LABELS[x.cat]+': '+x.found.join(', ')).join(' · '):'Совпадений нет';el.innerHTML=`<div class="result ${out.category==='needs_review'?'bad':''}"><strong>${esc(LABELS[out.category])}</strong><div class="tiny" style="margin-top:4px">${esc(detail)}</div></div>`}
function runTests(){lastTest=CASES.map(([text,expected])=>({text,expected,predicted:classify(text).category}));const ok=lastTest.filter(x=>x.expected===x.predicted).length;$('#testResults').innerHTML=`<div class="result ${ok<10?'bad':''}"><strong>${ok} / ${CASES.length}</strong> совпало с учебной разметкой. Смотри не только на число.</div><div class="table-wrap"><table><thead><tr><th>Сообщение</th><th>Ожидалось</th><th>Получилось</th></tr></thead><tbody>${lastTest.map(x=>`<tr><td>${esc(x.text)}</td><td>${esc(LABELS[x.expected])}</td><td class="${x.expected===x.predicted?'good':'bad-text'}">${x.expected===x.predicted?'✓ ':'○ '}${esc(LABELS[x.predicted])}</td></tr>`).join('')}</tbody></table></div>`}
function invalidate(id){if(state.ready.includes(id)){state.ready=state.ready.filter(x=>x!==id);toast('Ты изменил работу. Отметку готовности снял, проверь ещё раз.')}}
function markReady(id){
  const checks=state.checks[id]||[];
  if(checks.filter(Boolean).length<4){toast('Сначала пройди весь чек-лист.');return}
  if((state.notes[id]||'').trim().length<25){toast('Напиши хотя бы пару предложений про результат и ошибки.');return}
  if(!state.ready.includes(id))state.ready.push(id);
  save();toast('Отметил. Никуда автоматически не отправлял.');render();
}
function openBrief(){showDialog('Что за заказ',`<h2>Поддержка студии «Север»</h2><p>У них одна очередь сообщений: вход в аккаунт, покупки и технические проблемы. Оператор сначала читает каждое обращение и вручную понимает, кому его передать.</p><div class="example"><b>Что хотим</b>Предлагать одну из трёх категорий. Если всё мутно или совпало сразу несколько вариантов — не фантазировать, а вернуть «Нужен человек».</div><div class="example bad"><b>Чего не делаем</b>Не отвечаем игрокам, не списываем деньги, не меняем аккаунты. Это учебный кейс, а не продакшен.</div><p style="margin-top:14px">На первой паре решаем обычными правилами. Потом на тех же данных постепенно пробуем другие методы.</p>`)}
function showDialog(title,html){$('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=html;$('#dialog').showModal()}
function quiz(){const saved=state.quiz?.answers||[];showDialog('Быстрая проверка Python',`<h2>Четыре вопроса, без оценки</h2><p>Нужно только понять, надо ли перед первой работой освежить базу.</p>${QUIZ.map((q,i)=>`<fieldset class="quiz"><legend>${i+1}. ${esc(q.q)}</legend>${q.code?`<pre class="code" style="font-size:11px">${esc(q.code)}</pre>`:''}${q.opts.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}" ${saved[i]===j?'checked':''}> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}<div id="quizResult"></div><button class="primary-btn" data-action="quiz-check">Проверить</button>`)}
function quizCheck(){const answers=QUIZ.map((_,i)=>{const el=$(`input[name="q${i}"]:checked`);return el?Number(el.value):null});if(answers.includes(null)){toast('Ответь на все четыре.');return}const score=answers.filter((x,i)=>x===QUIZ[i].a).length;state.quiz={answers,score};save();$('#quizResult').innerHTML=`<div class="result ${score<3?'bad':''}" style="margin-bottom:12px"><strong>${score} / 4</strong><div style="margin-top:7px">${QUIZ.map((q,i)=>`<div>${answers[i]===q.a?'✓':'○'} ${esc(q.why)}</div>`).join('')}</div></div>`}
function notebook(cells){return JSON.stringify({cells,metadata:{kernelspec:{display_name:'Python 3',language:'python',name:'python3'},language_info:{name:'python',version:'3.11'}},nbformat:4,nbformat_minor:5},null,2)}
function md(text){return {cell_type:'markdown',metadata:{},source:text.split(/(?<=\n)/)}}
function code(text){return {cell_type:'code',execution_count:null,metadata:{},outputs:[],source:text.split(/(?<=\n)/)}}
function lab1py(){return `# Пара 1. Правила\nrules = {\n    "account": ["пароль", "вход", "аккаунт"],\n    "payment": ["оплат", "платеж", "покупк"],\n    "technical": [],  # TODO: добавь 2–3 слова\n}\n\ndef classify(text):\n    text = text.lower().replace("ё", "е")\n    matched = []\n    for category, words in rules.items():\n        if any(word in text for word in words):\n            matched.append(category)\n    return matched[0] if len(matched) == 1 else "needs_review"\n\ncases = ${JSON.stringify(CASES,null,2)}\n\ncorrect = 0\nfor text, expected in cases:\n    predicted = classify(text)\n    correct += predicted == expected\n    print(f"{predicted:14} | {expected:14} | {text}")\nprint(f"Итого: {correct}/{len(cases)}")\n`}
function lab1nb(){return notebook([md('# Пара 1. Разносим обращения по отделам\n\nНе надо писать всё с нуля. Разберись в функции, добавь слова для technical, прогони примеры, найди две ошибки и объясни их.'),code(lab1py()),md('## Короткий вывод\n\n- Что сработало?\n- Где правило ошиблось?\n- Что поменял?\n- Когда лучше вернуть needs_review?')])}
function lab2nb(){return notebook([md('# Пара 2. Учимся на примерах\n\nТот же заказ. Здесь уже нужен scikit-learn. GPU и API не нужны. Набор маленький и учебный, поэтому проценты не надо воспринимать как качество реального сервиса.'),code('from sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.dummy import DummyClassifier\nfrom sklearn.metrics import accuracy_score\n\ndata = '+JSON.stringify(TRAINING,null,2)+'\ntexts = [x["text"] for x in data]\nlabels = [x["label"] for x in data]'),code('train_texts, rest_texts, train_labels, rest_labels = train_test_split(\n    texts, labels, test_size=1/3, random_state=24, stratify=labels\n)\nvalidation_texts, test_texts, validation_labels, test_labels = train_test_split(\n    rest_texts, rest_labels, test_size=0.5, random_state=24, stratify=rest_labels\n)\nprint(len(train_texts), len(validation_texts), len(test_texts))'),md('## Baseline\n\nСамый простой вариант: всегда отвечать самой частой категорией. Он нужен, чтобы модель было с чем сравнить.'),code('baseline = DummyClassifier(strategy="most_frequent")\nbaseline.fit([[0]] * len(train_labels), train_labels)\nbase_pred = baseline.predict([[0]] * len(validation_labels))\nprint("baseline:", accuracy_score(validation_labels, base_pred))'),code('model = make_pipeline(TfidfVectorizer(), LogisticRegression(max_iter=1000, random_state=24))\nmodel.fit(train_texts, train_labels)\npred = model.predict(validation_texts)\nprint("model:", accuracy_score(validation_labels, pred))\nfor text, expected, got in zip(validation_texts, validation_labels, pred):\n    print(f"{expected:12} | {got:12} | {text}")'),md('## Что написать в выводе\n\n1. Модель лучше baseline или нет?\n2. Где ошиблась?\n3. Почему один удачный запуск ничего не доказывает?\n4. Что нельзя делать с test до финальной проверки?')])}
const BASICS=`МИНИМУМ PYTHON ДЛЯ ПЕРВОЙ ПАРЫ\n\n1. Словарь\nticket = {"text": "Не могу войти"}\nprint(ticket["text"])\n\n2. Цикл\nfor text in ["Не могу войти", "Не проходит оплата"]:\n    print(text)\n\n3. Функция\ndef double(x):\n    return x * 2\n\n4. Условие\nif "пароль" in text.lower():\n    print("account")\n\n5. Доля верных ответов\ncorrect = 8\ntotal = 10\nprint(correct / total)\n\nЕсли это всё выглядит чужим, не страшно. На первой паре каркас уже есть.\n`;
function csv(rows){return '\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')}
function dl(name,text,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}
function download(kind,id){
  if(kind==='python-basics')dl('python_basics.txt',BASICS);
  if(kind==='lab1')dl('lab_01_rules.ipynb',lab1nb(),'application/json');
  if(kind==='lab1py')dl('lab_01_rules.py',lab1py());
  if(kind==='cases')dl('lab_01_cases.csv',csv([['text','expected'],...CASES]),'text/csv;charset=utf-8');
  if(kind==='lab2')dl('lab_02_learning.ipynb',lab2nb(),'application/json');
  if(kind==='dataset')dl('tickets_training.csv',csv([['id','text','label'],...TRAINING.map(x=>[x.id,x.text,x.label])]),'text/csv;charset=utf-8');
  if(kind==='report'){
    const l=lesson(id||activeLesson),checks=state.checks[l.id]||[],slot=slotForLesson(group,l.id);
    dl(`lab_${String(l.id).padStart(2,'0')}_report.md`,`# Пара ${l.id}. ${l.title}\n\nПодгруппа: ${group}\nДата: ${formatDateShort(slot.date)}\nВремя: ${slot.start}–${slot.end}\nАудитория: ${slot.room}\n\n## Что получилось и где ломается\n${state.notes[l.id]||'Пока не заполнено.'}\n\n## Чек-лист\n${l.checks.map((x,i)=>`- [${checks[i]?'x':' '}] ${x}`).join('\n')}\n\n## Какая помощь ИИ использовалась\nНапиши коротко, если использовал.\n`,'text/markdown;charset=utf-8');
  }
}
function exportState(){dl(`ai_${group.replace('/','_')}_backup.json`,JSON.stringify({app:'ai24is',version:2,group,state},null,2),'application/json')}
async function importState(file){if(!file)return;try{const obj=JSON.parse(await file.text());if(obj.app!=='ai24is'||obj.version!==2||!GROUPS.includes(obj.group))throw new Error();group=obj.group;state=Object.assign(fresh(),obj.state||{});localStorage.setItem(KEY+'group',group);save();toast('Копию загрузил.');route('portfolio')}catch{toast('Это не похоже на нормальную копию этого курса.')}}

function handleClick(e){const b=e.target.closest('button');if(!b)return;if(b.dataset.view){route(b.dataset.view);return}if(b.dataset.download){download(b.dataset.download,Number(b.dataset.id)||activeLesson);return}const a=b.dataset.action,id=Number(b.dataset.id);if(a==='open-lesson'){if(RELEASED.includes(id))route('lesson',id);else route('route')}if(a==='open-brief')openBrief();if(a==='quiz')quiz();if(a==='quiz-check')quizCheck();if(a==='dialog-close')$('#dialog').close();if(a==='classify')classifyOne();if(a==='run-tests')runTests();if(a==='reset-rules'){state.rules={...DEFAULT_RULES};lastTest=null;invalidate(1);save();render();toast('Вернул исходные правила.')}if(a==='ready')markReady(id);if(a==='export')exportState();if(a==='import'){$('#importFile').value='';$('#importFile').click()}if(a==='clear'){if(confirm('Очистить локальную работу этой подгруппы?')){localStorage.removeItem(KEY+group);state=fresh();route('portfolio')}}}
function handleInput(e){const el=e.target;if(el.dataset.rule){state.rules[el.dataset.rule]=el.value;invalidate(1);save()}if(el.dataset.note){const id=Number(el.dataset.note);state.notes[id]=el.value;invalidate(id);save()}}
function handleChange(e){const el=e.target;if(el.dataset.check!==undefined){const id=Number(el.dataset.lesson),i=Number(el.dataset.check);state.checks[id] ||= [false,false,false,false];state.checks[id][i]=el.checked;invalidate(id);save()}}

document.addEventListener('click',handleClick);
document.addEventListener('input',handleInput);
document.addEventListener('change',handleChange);
$('#group').addEventListener('change',e=>{group=e.target.value;localStorage.setItem(KEY+'group',group);state=loadState();toast('Открыл '+group);render()});
$('#importFile').addEventListener('change',e=>importState(e.target.files[0]));
window.addEventListener('hashchange',fromHash);
fromHash();
