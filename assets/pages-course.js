'use strict';
import {runtime, esc, pad, dateLabel, currentGroup, doneSet, setDone, nearestLesson, block, inline} from './lib.js?v=85b64ff4da2c';

const workSteps = [
  ['Установи программы', 'В первой работе показано, что скачать и куда нажать.\n\n- **VS Code** откроет файлы.\n- **Node.js** запустит сайт.\n- Через **OpenCode** будем поручать задачи ИИ.', 'Программы открываются, команды проверки показывают номера версий.', '#start', 'Подготовить программы'],
  ['Возьми проект преподавателя', 'Клонируй Campus-ServiceDesk с GitVerse в пустую папку **«Методы ИИ»**. После скачивания открой папку проекта в VS Code.', 'Слева видны `package.json`, `server.mjs` и папка `src`.', '#task-1/part-7', 'Получить проект по шагам'],
  ['Подключи помощника', '- **OpenCode** работает в папке проекта и показывает ответы ИИ.\n- **Inception, наш провайдер**, даёт доступ к модели через интернет.\n- **Mercury 3** отвечает на вопросы и помогает с кодом, как модели в ChatGPT или Claude.\n\nПо инструкции получим личный ключ доступа и подключим его в OpenCode.', 'В поле помощника выбрана **Mercury3**. На следующем шаге отправим первый запрос и проверим ответ.', '#task-1/part-8', 'Подключить ИИ'],
  ['Сохрани подготовку с агентом', '1. Попроси проверить файлы подготовки и показать изменения.\n2. Прочитай изменения и подтверди коммит.\n3. Создай с агентом рабочую ветку: исходные файлы остаются прежними.\n\n`REPORT.md` необязателен, создавать его ради коммита не нужно.', 'Агент показал сохранённую версию и имя `stage/01-discovery`. Если изменений нет, он не создаёт пустой коммит.', '#task-1/part-9', 'Сохранить подготовку'],
  ['Попроси агента запустить сайт', 'Отправь готовый запрос из инструкции. Прочитай предложенную команду, разреши запуск и открой адрес из ответа в браузере.', 'На странице Campus ServiceDesk видны 12 заявок.', '#task-1/part-10', 'Попросить запустить сайт'],
  ['Проверь ответы по файлам и экрану', '1. Попроси найти одну заявку в файлах.\n2. Открой названный файл.\n3. Найди ту же заявку в браузере и сравни сведения.\n\nЕсли хочешь разобраться глубже, используй другие вопросы как примеры.', 'Ты можешь показать запрос, ответ, файл и заявку на странице.', '#task-1/part-11', 'Начать разговор о проекте'],
  ['Коротко опиши результат', 'Запиши своими словами, **как работал с агентом и что проверил**. Можно написать самому или с помощником; `REPORT.md` даёт необязательный пример.', 'Ты можешь показать результат, объяснить проверку и открыть свою короткую заметку.', '#task-1/part-13', 'Подготовить результат']
];

export function renderRoute() {
  return `<header class="page-head"><p class="course-label">Порядок первой работы</p><h1>Как пройти первую работу</h1><p class="lead">На курсе мы постепенно улучшаем готовый сайт для заявок кампуса. ИИ помогает разбираться в коде и изменять его. После каждого действия ты проверяешь, что получилось.</p><div class="actions"><a class="button primary" href="#start">Начать с установки программ</a><a class="button" href="#current">Открыть текущее задание</a></div></header>
  <section class="beginner-context" aria-label="Где мы будем работать"><article><h2>Этот сайт</h2><p>Здесь читаем задания, смотрим расписание и скачиваем материалы.</p></article><article><h2>Учебный сайт</h2><p>Campus ServiceDesk: список заявок, который мы запускаем на своём компьютере и постепенно улучшаем.</p></article><article><h2>VS Code</h2><p>Программа, в которой открываем папку учебного сайта, читаем файлы и вводим команды.</p></article></section>
  <div class="pipeline-summary" role="group" aria-label="Порядок выполнения"><span>Читаем задание</span><span>Подключаем помощника</span><span>Запускаем сайт</span><span>Проверяем ответы</span><span>Показываем результат</span></div>
  <section class="pipeline-list">${workSteps.map(([title, action, result, href, link], index) => `<article class="pipeline-step"><span class="pipeline-number">${pad(index+1)}</span><div class="pipeline-content"><h2>${title}</h2><div class="course-prose">${block(action)}</div>${href ? `<a class="instruction-link" href="${href}">${link}</a>` : ''}<div class="step-result"><span aria-hidden="true">✓</span><p>Результат: ${inline(result)}</p></div></div></article>`).join('')}</section>
  <section class="notice panel"><h2>Если ИИ перестал отвечать</h2><p>Твои файлы остаются на компьютере. Сохрани изменения и открой раздел «Программы»: там описано, как выбрать другой сервис ИИ. Если ни один сервис не работает, преподаватель даст готовый пример изменений для разбора и проверки.</p><a href="#stack">Что делать при ошибке подключения</a></section>`;
}

export function renderStack() {
  return `<header class="page-head"><p class="course-label">Перед первым занятием</p><h1>Какие программы нужны</h1><p class="lead">Сначала разберёмся, зачем нужна каждая программа. Затем установим их по инструкции и проверим на учебном сайте.</p><div class="actions"><a class="button primary" href="#task-1/part-1">Установка с самого начала</a></div></header>
  <section class="program-list">
    <article><span class="stack-symbol">⌘</span><div><h2>VS Code: открыть и изменить файлы</h2><div class="course-prose">
      <p><strong>Редактор</strong> позволяет читать и менять файлы проекта. В нём откроем папку сайта.</p>
      <p><strong>Терминал</strong> внизу окна принимает текстовые команды: вводишь команду, нажимаешь <strong>Enter</strong> и смотришь результат.</p>
    </div></div><a class="button" href="#task-1/part-3">Установка по шагам</a></article>
    <article><span class="stack-symbol">⑂</span><div><h2>Git: сохранять историю проекта</h2><div class="course-prose">
      <p>Хранит историю файлов на компьютере. <strong>Коммит</strong> сохраняет снимок подготовленного состояния проекта.</p>
      <p>В первой работе сохраним настройки, не меняя приложение. Со второй будем сравнивать изменения кода.</p>
    </div></div><a class="button" href="#task-1/part-2">Установка по шагам</a></article>
    <article><span class="stack-symbol">JS</span><div><h2>Node.js: запустить учебный сайт</h2><div class="course-prose">
      <ul><li><strong>Node.js</strong> выполняет файл <code>server.mjs</code>, чтобы браузер получил страницу с заявками. Это среда выполнения JavaScript.</li><li><strong>npm</strong> установится вместе с Node.js. Через него установим OpenCode.</li></ul>
      <p>Выбери выпуск <strong>LTS</strong> с длительной поддержкой, <strong>не ниже 22.13.0</strong>. Эта версия нужна и для встроенного SQLite в следующих работах.</p>
    </div></div><a class="button" href="#task-1/part-4">Установка по шагам</a></article>
    <article><span class="stack-symbol">&gt;_</span><div><h2>OpenCode: помощник с ИИ</h2><div class="course-prose">
      <p>Программа для общения с агентом <strong>в папке проекта</strong>. Агент умеет читать файлы и выполнять разрешённые действия.</p>
      <p>В OpenCode задаём вопросы о коде, уточняем ответы и поручаем изменения. Для ответов подключаем отдельный сервис ИИ через интернет.</p>
    </div></div><a href="#task-1/part-5">Как установить</a></article>
    <article><span class="stack-symbol">G</span><div><h2>GitVerse: хранить проект и показывать работу</h2><div class="course-prose">
      <p>Российская платформа СберТеха для работы с кодом. Здесь лежит репозиторий преподавателя. Со второй работы отправляем свои изменения на проверку.</p>
      <ul><li><strong>Git</strong> сохраняет версии на компьютере.</li><li><strong>GitVerse</strong> хранит отправленную копию в интернете.</li></ul>
    </div></div><a class="button" href="#task-1/part-1">Вход по шагам</a></article>
  </section>
  <section class="notice panel" aria-labelledby="ai-connection-title">
    <h2 id="ai-connection-title">Откуда OpenCode получает ответы</h2>
    <div class="course-prose">
      <p>Если ты пользовался ChatGPT или Claude, тебе знаком принцип: пишешь вопрос и получаешь ответ ИИ. В курсе пишем в <strong>OpenCode</strong>, чтобы помощник мог ещё читать файлы проекта и выполнять разрешённые действия.</p>
      <dl>
        <dt><strong>OpenCode: программа на твоём компьютере</strong></dt>
        <dd>Принимает запрос, показывает ответ и работает с файлами через инструменты. Сам OpenCode не составляет ответ как модель ИИ.</dd>
        <dt><strong>Inception: провайдер</strong></dt>
        <dd>Сервис компании Inception, который даёт доступ к ИИ через интернет. Модель работает на его серверах. Здесь «провайдер» означает поставщика доступа к моделям, а не интернет-оператора.</dd>
        <dt><strong>Mercury 3: модель</strong></dt>
        <dd>Составляет ответы и помогает с кодом, как модели в ChatGPT или Claude. Компьютер не скачивает её целиком.</dd>
      </dl>
      <p id="ai-request-flow"><strong>Как проходит запрос</strong></p>
      <ol aria-labelledby="ai-request-flow">
        <li>Ты пишешь в OpenCode: «Где хранятся заявки?»</li>
        <li>OpenCode отправляет запрос через Inception к Mercury 3.</li>
        <li>Модель составляет ответ, и он появляется в OpenCode.</li>
      </ol>
      <p><strong>Что уходит провайдеру</strong></p>
      <p>Он может получить текст переписки и прочитанные агентом файлы. Это <strong>контекст</strong>, информация для ответа. Вся папка автоматически не отправляется.</p>
      <p><strong>Не отправляй пароли, ключи и реальные персональные данные.</strong> Работаем с учебными заявками.</p>
    </div>
  </section>
  <section class="connection-layout"><div><div class="section-head"><h2>Как подключим помощника</h2></div>
    <ol class="connection-steps">
      <li><h3>Откроем папку проекта</h3><div class="course-prose">
        <p>После клонирования с GitVerse добавим настройки <code>opencode.json</code> и актуальные <code>README.md</code> и <code>TASK.md</code>.</p>
        <p><code>REPORT.md</code> необязателен: это шаблон заметки. <strong>Свои записи заменять не нужно.</strong></p>
      </div></li>
      <li><h3>Войдём в кабинет Inception</h3><div class="course-prose">
        <p>Google нужен только для входа в кабинет. Кнопка <strong>Continue with Google</strong> означает «Продолжить с Google».</p>
        <p>Сам вход ещё не подключает модель. <strong>Пароль Google в OpenCode не вводим.</strong></p>
      </div></li>
      <li><h3>Получим ключ и выберем модель</h3><div class="course-prose">
        <p><strong>API-ключ: секретная строка доступа.</strong> По ней Inception разрешает программе обращаться к ИИ от твоего аккаунта. <strong>API</strong> означает способ обмена запросами и ответами между программами.</p>
        <ul><li>В кабинете откроем <strong>API Keys</strong> («Ключи API») и создадим ключ.</li><li>Вставим его <strong>только в поле авторизации OpenCode</strong>.</li><li>Выберем модель <strong>Mercury3</strong>.</li></ul>
        <p><strong>Не отправляй ключ сообщением агенту и не сохраняй в проекте.</strong></p>
        <p>Ключ относится к сервису ИИ. Разрабатывать API учебного сайта сейчас не нужно. На шаге 8 показано каждое действие; затем первым запросом проверим подключение.</p>
      </div></li>
    </ol><a class="button primary" href="#task-1/part-8">Подключение со скриншотами</a></div>
  <aside class="stack-aside"><h2>После настройки проверь</h2><ul class="plain-checklist"><li>Программы установлены</li><li>Учебный сайт запускается</li><li>OpenCode отвечает и читает учебный файл</li><li>В кабинете Inception есть доступный объём запросов</li><li>Ты знаешь, где найти запасное подключение</li></ul>
    <div class="quota-note"><h3>Сколько это стоит</h3><div class="course-prose">
      <p><strong>Оплачивать сервис для курса не требуется.</strong></p>
      <p>На 28 октября 2026 года документация Inception обещает новым аккаунтам 100 млн бесплатных токенов без платёжных данных. Это предложение сервиса, <strong>не гарантия доступа для каждого аккаунта</strong>.</p>
      <p><strong>Токены</strong> это небольшие части текста, по которым сервис считает объём запросов и ответов.</p>
      <ul><li>Проверь условия и остаток в своём кабинете.</li><li>Если нужен платёж, нет подходящего аккаунта или сервис не открывается, остановись и выбери запасной вариант с преподавателем.</li></ul>
      <p><strong>Не вводи платёжные данные ради занятия.</strong></p>
    </div><a href="https://docs.inceptionlabs.ai/get-started" target="_blank" rel="noopener noreferrer">Условия Inception</a></div>
  </aside></section>
  <section class="reserve-section"><div class="section-head"><div><h2>Если основной сервис ИИ не работает</h2><p>Твой учебный проект сохраняется. Меняем только сервис, который отвечает помощнику.</p></div></div><div class="reserve-grid"><article class="panel reserve-card"><span class="provider-role">Первый запасной вариант</span><h3>Бесплатная модель в OpenCode</h3><p>Внутри OpenCode введи <code>/models</code> и найди доступную бесплатную модель. После выбора снова попроси прочитать файл проекта. Доступные модели и их ограничения меняются.</p><a href="https://opencode.ai/docs/zen/" target="_blank" rel="noopener noreferrer">Информация о моделях</a></article><article class="panel reserve-card"><span class="provider-role">Второй запасной вариант</span><h3>Сервис NVIDIA</h3><p>После проверки преподавателем можно получить личный ключ NVIDIA Developer. В OpenCode введи <code>/connect</code>, выбери NVIDIA и подключи ключ. Через <code>/models</code> выбери согласованную модель.</p><a href="https://docs.api.nvidia.com/nim/docs/product" target="_blank" rel="noopener noreferrer">Условия доступа</a></article><article class="panel reserve-card"><span class="provider-role">Можно продолжить без ИИ</span><h3>Готовый пример для разбора</h3><p>Преподаватель даст подготовленные изменения кода. Ты сравнишь старую и новую версию, запустишь проверки и объяснишь результат. В отчёте укажи, что работал с готовым примером.</p><a href="#route">Как проверять работу</a></article></div><details class="notice panel troubleshooting"><summary>Что означают ошибки подключения</summary><p><strong>401 или 403:</strong> сервис не принял ключ или запретил доступ. Проверь ключ в личном кабинете и повтори подключение через <code>/connect</code>.</p><p><strong>429:</strong> сервис ограничил число запросов или закончился доступный объём. Останови повторные запросы и выбери запасной вариант.</p><p><strong>Нужной модели нет в списке:</strong> проверь, что открыта папка проекта с <code>opencode.json</code>. При подключении имя должно быть <code>inception</code>. Перезапусти OpenCode.</p><p><strong>ИИ отвечает, но не читает файл:</strong> покажи ситуацию преподавателю. Ответ на обычный вопрос ещё не подтверждает, что помощник подключён к проекту.</p></details></section>`;
}
function meetingModules(numbers) {
  return numbers.map(number => {
    const item = runtime.course.find(item => item.number === number);
    return item && !item.locked ? `<a class="button" href="#task-${number}">Работа ${pad(number)}</a>` : `<span class="status">Работа ${pad(number)} · ОТКРОЕТСЯ ПОЗЖЕ</span>`;
  }).join('');
}
export function renderSchedule() {
  const group = currentGroup(); if (!group) return '';
  const nearest = nearestLesson(), planned = Array.isArray(group.meetings);
  const rows = planned ? group.meetings.map((meeting,index) => `<article data-meeting-id="${esc(meeting.id)}" class="schedule-item schedule-meeting panel ${meeting === nearest?.meeting ? 'nearest-meeting' : ''}"><span class="number">Занятие ${index+1}</span><span class="date">${dateLabel(meeting.date)}</span><div class="meeting-content"><h2>${esc(meeting.title)}</h2><p>${esc(meeting.summary)}</p><p class="meeting-provided"><strong>Материалы от преподавателя:</strong> ${esc(meeting.provided)}</p><div class="actions meeting-modules" role="group" aria-label="Работы занятия ${index+1}">${meetingModules(meeting.modules)}</div></div></article>`).join('') : (group.dates || []).map((date,index) => {
    const item=runtime.course[index]; if (!item) return '';
    return `<article class="schedule-item panel ${date === nearest?.date ? 'nearest-meeting' : ''}"><span class="number">Работа ${pad(item.number)}</span><span class="date">${dateLabel(date)}</span><div><h2>${esc(item.title)}</h2><p>${item.locked ? 'Задание ещё не открыто.' : 'Инструкция доступна.'}</p></div>${meetingModules([item.number])}</article>`;
  }).join('');
  const history = `<details class="notice panel schedule-history"><summary>История расписания</summary>${group.intro ? `<p>Вводное занятие: ${dateLabel(group.intro.date)}. ${esc(group.intro.title)}. ${esc(group.intro.note)}</p>` : ''}${group.cancelledFirst ? `<p>Отменённое занятие: ${dateLabel(group.cancelledFirst)}.</p>` : ''}${planned ? `<p>Прежние даты: ${(group.dates || []).map(dateLabel).join('; ')}.</p>` : ''}</details>`;
  return `<header class="page-head"><p class="eyebrow">${esc(group.group)}</p><h1>Ваше расписание</h1><p class="lead">${esc(group.time)} · ${esc(group.room)} · время московское</p><p class="muted">Для другой группы нажмите её название вверху страницы.</p></header><section class="notice panel"><p>Даты не открывают задания. Опубликованные работы проходи по порядку: сначала отметь обязательные шаги предыдущей работы. Работа 05 необязательна. Закрытые готовые комплекты для работ 03/04 и 06 преподаватель передаст после отдельного разрешения на выдачу.</p></section><section class="schedule-list">${rows || '<p class="muted">Дата занятия пока не назначена.</p>'}</section>${planned ? `<section class="notice panel schedule-note"><h2>Работа 05: необязательное дополнение</h2><p>Комментарии и проверка кода по желанию, без отдельного занятия. Пропуск не мешает финалу и высокой оценке.</p><div class="actions">${meetingModules(group.optionalModules || [])}</div></section>` : ''}${history}`;
}
export function renderWork() {
  const done = doneSet();
  return `<header class="page-head"><p class="eyebrow">${esc(runtime.state.group)}</p><h1>Мои отметки</h1><p class="lead">Это ваш список, не журнал преподавателя. Отметки хранятся в этом браузере отдельно для каждой группы. Первую работу показываем локально в VS Code.</p></header><section class="work-list">${runtime.course.map(item => `<article class="work-row panel"><span class="number">${pad(item.number)}</span><div><h2>${esc(item.title)}</h2><p>${item.locked ? 'Задание ещё не открыто.' : done.has(item.number) ? (item.number === 1 ? 'Вы отметили работу. Подготовьте свой результат и короткую заметку в удобной форме.' : 'Вы отметили работу. Проверьте материалы по инструкции.') : 'Пока не отмечено.'}</p></div><div class="actions">${item.locked ? '<span class="status">ОТКРОЕТСЯ ПОЗЖЕ</span>' : `<button data-work="${item.number}" aria-pressed="${done.has(item.number)}">${done.has(item.number) ? 'Снять отметку' : 'Отметить для себя'}</button><a class="button" href="#task-${item.number}">К заданию</a>`}</div></article>`).join('')}</section>`;
}
export function bindWork(rerender) { document.querySelectorAll('[data-work]').forEach(button => button.addEventListener('click', () => { const number = Number(button.dataset.work); setDone(number, !doneSet().has(number)); rerender(); document.querySelector(`[data-work="${number}"]`)?.focus({preventScroll: true}); })); }
