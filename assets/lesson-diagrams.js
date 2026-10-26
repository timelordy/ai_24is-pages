import {esc} from './lib.js?v=05de98df22b4';

const folder = '<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 8V4h12l4 4h18v21H3z" fill="currentColor" opacity=".18"/><path d="M3 8V4h12l4 4h18v21H3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

function illustration(assets, id) {
  const item=assets.find(image=>image.id===id);
  if (!item) return '';
  return `<figure class="lesson-illustration"><button type="button" data-guide-image="${esc(item.id)}" aria-label="Увеличить иллюстрацию: ${esc(item.title)}"><img src="${esc(item.src)}" width="${item.width}" height="${item.height}" alt="${esc(item.alt)}" loading="lazy"><span>Увеличить иллюстрацию ↗</span></button></figure>`;
}

function flow(title, entries) {
  return `<section class="concept-diagram" aria-label="${title}"><h3>${title}</h3><ol class="concept-flow">${entries.map(([name,text])=>`<li><strong>${name}</strong><p>${text}</p></li>`).join('')}</ol></section>`;
}

function folderPanel(state) {
  if (state==='empty') return `<div class="folder-state"><div class="folder-path">${folder}<strong>Документы / Методы ИИ</strong></div><div class="folder-blank"><strong>Папка пока пустая</strong><p>Мы только создали место для учебных проектов. Файлы сайта появятся после клонирования.</p></div></div>`;
  return `<div class="folder-state"><div class="folder-path">${folder}<strong>Документы / Методы ИИ</strong></div><ul class="folder-tree"><li><strong>Campus-ServiceDesk</strong><span>← папка проекта</span><ul><li>index.html <span>страница</span></li><li>package.json <span>команда запуска</span></li><li>server.mjs <span>сервер</span></li><li>src/ <span>код страницы</span></li>${state==='ready' ? '<li class="folder-added">opencode.json <span>добавили настройки ИИ</span></li><li class="folder-added">TASK.md, REPORT.md, README.md <span>обновили инструкции</span></li>' : '<li>README.md, TASK.md, REPORT.md</li>'}</ul></li></ul></div>`;
}

function folderDiagram(initial) {
  const states=[['empty','Сначала пусто'],['filled','После клонирования'],['ready','После настройки']];
  return `<section class="concept-diagram" data-concept-diagram aria-label="Как заполняется папка"><h3>Как заполняется папка</h3><div class="concept-switch">${states.map(([state,label])=>`<button type="button" data-concept-state="${state}" aria-pressed="${state===initial}">${label}</button>`).join('')}</div>${states.map(([state])=>`<div data-concept-panel="${state}" ${state===initial ? '' : 'hidden'}>${folderPanel(state)}</div>`).join('')}</section>`;
}

function historyPanel(after) {
  return `<div class="history-file-grid"><article><strong>main · исходный отчёт</strong><span>REPORT.md</span><pre>Выводы пока не записаны.</pre></article><article><strong>stage/01-discovery · твой отчёт</strong><span>REPORT.md</span><pre>${after ? 'Заявки хранятся в src/data.js.' : 'Выводы пока не записаны.'}</pre></article></div><p class="concept-takeaway">${after ? 'В main остался шаблон отчёта. В рабочей ветке сохранён твой вывод. Сайт в обоих вариантах показывает те же 12 заявок.' : 'Пока оба отчёта одинаковые. После работы сохраним заполненный отчёт в своей ветке.'}</p>`;
}

export function renderConceptDiagram(kind, illustrations=[]) {
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
  if (kind==='git-history') return `<section class="concept-diagram illustrated-concept" data-concept-diagram aria-label="Пример истории первой работы"><h3>Исходный отчёт и отчёт после работы</h3><p>В исходном проекте REPORT.md ещё пустой. Свой заполненный отчёт сохраним отдельно, чтобы можно было сравнить его с исходным.</p>${illustration(illustrations,'git-branches')}<div class="concept-switch"><button type="button" data-concept-state="before" aria-pressed="true">До работы</button><button type="button" data-concept-state="after" aria-pressed="false">После сохранения отчёта</button></div><div data-concept-panel="before">${historyPanel(false)}</div><div data-concept-panel="after" hidden>${historyPanel(true)}</div></section>`;
  if (kind==='inception-key') return flow('Схема получения и подключения ключа',[
    ['Войти через Google','Нажми Continue with Google и выбери свой аккаунт.'],['API Keys','В кабинете открой управление ключами и создай новый ключ.'],['Скопировать значение','Получишь длинную строку: это личный код доступа.'],['OpenCode → /connect','Выбери Inception, затем Add account и вставь ключ в поле авторизации.']
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
