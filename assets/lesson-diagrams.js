import {esc} from './lib.js?v=85b64ff4da2c';

const folder = '<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 8V4h12l4 4h18v21H3z" fill="currentColor" opacity=".18"/><path d="M3 8V4h12l4 4h18v21H3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

const concepts = {
  'project-tools': ['Как связаны инструменты проекта', [
    ['VS Code','Редактор открывает папку проекта и показывает изменения файлов.'],
    ['OpenCode','ИИ-помощник получает задачу и предлагает изменения в этой папке. Ты проверяешь результат.'],
    ['Node.js','Запускает server.mjs и обслуживает учебный сайт.'],
    ['Браузер','Показывает сайт. Здесь ты проверяешь результат работы, а не редактируешь файлы.']
  ]],
  'git-branch-commit': ['Ветка, коммит и отправка на GitVerse', [
    ['Рабочая ветка','Имя ветки указывает на коммит. Новая ветка начинается с текущего коммита; создание ветки не сохраняет незаписанные изменения и не создаёт вторую папку.'],
    ['Коммит','После проверки выбери нужные изменения для коммита. Коммит сохраняет в локальной истории Git снимок подготовленного состояния проекта, включая прежнее содержимое отслеживаемых файлов без изменений. Изменения, которые ты не подготовил, в этот снимок не входят. Текущая ветка начинает указывать на новый коммит.'],
    ['GitVerse','Push отправляет локальные коммиты в выбранный удалённый репозиторий и обновляет ветку там. Сохранение файла и локальный коммит сами по себе ничего не отправляют.']
  ]],
  'browser-api-server': ['Как форма передаёт заявку серверу', [
    ['Браузер','Собирает поля формы и отправляет HTTP-запрос POST /api/tickets. Тело запроса записано в JSON: это текст с именами полей и их значениями.'],
    ['Сервер и API','API задаёт адреса и формат обмена данными с сервером. Сервер проверяет поля, создаёт заявку и возвращает JSON и HTTP-статус: 201 при создании, 400 при неверном вводе.'],
    ['Ответ в браузере','После успешного ответа страница показывает созданную заявку. При ошибке сохраняет введённый текст для исправления.']
  ]],
  'sqlite-persistence': ['Почему заявки остаются после перезапуска', [
    ['Запрос к серверу','Браузер отправляет новую заявку или изменение статуса через API.'],
    ['SQLite','Сервер проверяет данные и записывает их в файл базы SQLite. Данные в памяти процесса без записи пропали бы.'],
    ['Перезапуск сервера','Сервер должен открыть тот же файл базы по прежнему пути SERVICEDESK_DB. Проверь сохранённую заявку после перезапуска и обновления страницы; другой файл базы покажет другие данные.']
  ]],
  'comment-review': ['Два необязательных пути: комментарии или review', [
    ['Выбор по желанию','Можно выбрать комментарии, review или оба пути. Занятие 05 можно пропустить целиком без штрафа; оно не добавляет условий допуска к финалу.'],
    ['Комментарии к заявке','В отдельной форме укажи ID заявки и учебный текст. Сервер связывает запись с этим ID и сохраняет её в SQLite. Пустой текст должен быть отклонён.'],
    ['Повторная загрузка комментариев','После F5 пустая область не означает потерю записей: приложение не загружает комментарии при открытии. Замени ID на 102 и щёлкни вне поля, затем на 101 и снова щёлкни вне поля. Это загрузит записи к 101; проверь их порядок. После перезапуска сервера с тем же файлом базы повтори загрузку.'],
    ['Review по желанию','Попроси чтение кода без правок. Найди названные строки и проверь замечание агента в программе. Исправления разрешай отдельно, только если ошибка подтверждена; отсутствие подтверждённых ошибок тоже допустимый результат.']
  ]],
  'ai-suggestion-boundary': ['Предложение ИИ и решение человека', [
    ['Предложение ИИ','Сервер запрашивает подсказку категории и приоритета. В режиме demo ответ заранее задан, модель не вызывается.'],
    ['Проверка человеком','Человек сравнивает предложение с текстом заявки и решает, применять ли его. Подсказка сама не сохраняет заявку.'],
    ['Сохранение заявки','После подтверждения браузер подставляет выбранные поля. Для сохранения человек отдельно отправляет форму; при сбое ИИ её можно заполнить вручную.']
  ]]
};

function illustration(assets, id) {
  const item=assets.find(image=>image.id===id);
  if (!item) return '';
  return `<figure class="lesson-illustration"><div class="guide-shot-preview"><img src="${esc(item.src)}" width="${item.width}" height="${item.height}" alt="${esc(item.alt)}" loading="lazy"><button type="button" class="guide-shot-open" data-guide-image="${esc(item.id)}" aria-label="Увеличить иллюстрацию: ${esc(item.title)}">Увеличить иллюстрацию <span aria-hidden="true">↗</span></button></div><figcaption class="guide-image-caption"><strong>Учебная схема, созданная с помощью ИИ</strong><span>${esc(item.caption || item.alt)}</span></figcaption></figure>`;
}

function flow(title, entries) {
  return `<section class="concept-diagram" aria-label="${title}"><h3>${title}</h3><ol class="concept-flow">${entries.map(([name,text])=>`<li><strong>${name}</strong><p>${text}</p></li>`).join('')}</ol></section>`;
}

function folderPanel(state) {
  if (state==='empty') return `<div class="folder-state"><div class="folder-path">${folder}<strong>Документы / Методы ИИ</strong></div><div class="folder-blank"><strong>Папка пока пустая</strong><p>Мы только создали место для учебных проектов. Файлы сайта появятся после клонирования.</p></div></div>`;
  return `<div class="folder-state"><div class="folder-path">${folder}<strong>Документы / Методы ИИ</strong></div><ul class="folder-tree"><li><strong>Campus-ServiceDesk</strong><span>← папка проекта</span><ul><li>index.html <span>страница</span></li><li>package.json <span>команда запуска</span></li><li>server.mjs <span>сервер</span></li><li>src/ <span>код страницы</span></li>${state==='ready' ? '<li class="folder-added">opencode.json <span>добавили настройки ИИ</span></li><li class="folder-added">TASK.md, README.md <span>обновили инструкции</span></li><li>REPORT.md <span>необязательный шаблон; свои записи сохраняем</span></li>' : '<li>README.md, TASK.md, REPORT.md</li>'}</ul></li></ul></div>`;
}

function folderDiagram(initial) {
  const states=[['empty','Сначала пусто'],['filled','После клонирования'],['ready','После настройки']];
  return `<section class="concept-diagram" data-concept-diagram aria-label="Как заполняется папка"><h3>Как заполняется папка</h3><div class="concept-switch">${states.map(([state,label])=>`<button type="button" data-concept-state="${state}" aria-pressed="${state===initial}">${label}</button>`).join('')}</div>${states.map(([state])=>`<div data-concept-panel="${state}" ${state===initial ? '' : 'hidden'}>${folderPanel(state)}</div>`).join('')}</section>`;
}

function historyPanel(after) {
  return `<div class="history-file-grid"><article><strong>main · исходный отчёт</strong><span>REPORT.md</span><pre>Выводы пока не записаны.</pre></article><article><strong>stage/01-discovery · твой отчёт</strong><span>REPORT.md</span><pre>${after ? 'Заявки хранятся в src/data.js.' : 'Выводы пока не записаны.'}</pre></article></div><p class="concept-takeaway">${after ? 'В этом условном примере заметка записана в файл и сохранена коммитом в stage/01-discovery. В main остался шаблон отчёта. Сайт в обоих вариантах показывает те же 12 заявок.' : 'Сразу после создания ветки оба отчёта одинаковые: ветки указывают на один коммит. Создание ветки не меняет и не сохраняет отчёт.'}</p>`;
}

export function renderConceptDiagram(kind, illustrations=[]) {
  if (kind==='git-saving') kind='git-storage';
  if (kind==='git-branches') kind='git-history';
  if (Object.hasOwn(concepts,kind)) {
    const [title,entries]=concepts[kind];
    return flow(title,entries) + illustration(illustrations,kind);
  }
  if (kind==='gitverse') return flow('Откуда берётся учебный проект',[
    ['Преподаватель','Подготовил сайт с 12 заявками.'],['GitVerse','Российская платформа. Здесь лежат файлы и история проекта.'],['Твой компьютер','Клонируешь проект и работаешь в своей папке.']
  ]);
  if (kind==='git-storage') return `<section class="concept-diagram illustrated-concept" aria-label="Зачем нужна история Git"><h3>Если изменение сломало сайт</h3><p>Пример для следующих работ: мы добавили поиск, а после новой правки он перестал работать. С Git попросим агента показать, что изменилось, и вернуть рабочий вариант.</p>${illustration(illustrations,'git-saving')}<p class="concept-takeaway">Облако удобно для хранения и передачи копий. У него тоже может быть история версий. Git здесь нужен, чтобы сравнивать изменения в коде всего проекта и выбирать, что сохранить или вернуть.</p></section>`;
  if (kind==='node-runtime') return flow('Что делает Node.js в нашем проекте',[
    ['server.mjs','В файле написано, как отдавать страницы сайта.'],['Node.js','Среда выполнения запускает этот JavaScript-код на компьютере.'],['Браузер','Получает страницу, показывает заявки и выполняет код src/app.js.']
  ]);
  if (kind==='data-to-page') return flow('Как заявка появляется на странице',[
    ['Данные заявки','В файлах проекта записаны её номер, название и описание.'],['Код страницы','Читает эти данные и создаёт карточку заявки.'],['Браузер','Показывает карточку. Сравни её название с исходными данными.']
  ]);
  if (kind.startsWith('folder-')) return folderDiagram(kind.slice(7));
  if (kind==='git-history') return `<section class="concept-diagram illustrated-concept" data-concept-diagram aria-label="Пример истории первой работы"><h3>Условный пример с необязательной заметкой</h3><p>Сейчас создаём ветку, содержимое файлов остаётся прежним. Если на шаге 13 ты решишь записать необязательную заметку в REPORT.md и создать коммит в stage/01-discovery, история будет выглядеть как в примере ниже. Заполнение заметки и коммит можно пропустить.</p>${illustration(illustrations,'git-branches')}<div class="concept-switch"><button type="button" data-concept-state="before" aria-pressed="true">Сразу после создания ветки</button><button type="button" data-concept-state="after" aria-pressed="false">Пример после записи и коммита заметки</button></div><div data-concept-panel="before">${historyPanel(false)}</div><div data-concept-panel="after" hidden>${historyPanel(true)}</div></section>`;
  if (kind==='inception-key') return flow('Схема получения и подключения ключа',[
    ['Кабинет Inception','Это сайт провайдера, который даёт OpenCode доступ к Mercury 3. Continue with Google («Продолжить с Google») позволяет войти в кабинет.'],['API Keys («Ключи API»)','Создай секретный ключ: по нему Inception разрешит программе обращаться к модели от твоего аккаунта.'],['Скопировать ключ','Не отправляй эту строку в чат и не сохраняй в проекте. Пароль Google для подключения OpenCode не нужен.'],['OpenCode → /connect','В поле OpenCode введи /connect, выбери Inception и Add account («Добавить аккаунт»). Вставь ключ только в поле авторизации. Затем через /models выбери Mercury3.']
  ]);
  return '';
}

export function bindConceptDiagrams(root=document) {
  root.querySelectorAll('[data-concept-diagram]').forEach(diagram=>{
    diagram.querySelectorAll('[data-concept-state]').forEach(button=>button.addEventListener('click',()=>{
      const state=button.dataset.conceptState;
      diagram.querySelectorAll('[data-concept-state]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));
      diagram.querySelectorAll('[data-concept-panel]').forEach(panel=>{ panel.hidden=panel.dataset.conceptPanel!==state; });
    }));
  });
}
