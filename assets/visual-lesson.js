'use strict';
import {runtime, esc, inline, pad, taskSteps, setTaskStep, doneSet, setDone, lessonPosition, rememberLessonPosition} from './lib.js?v=9038b0b85a19';
import {renderConceptDiagram, bindConceptDiagrams} from './lesson-diagrams.js?v=9038b0b85a19';

const workspaceIcons = {
  instructions:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  editor:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M8 9v11m5-7-2 2 2 2m3-4 2 2-2 2"/>',
  browser:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20m-15 5 2 2 3-3m3 1h3m-3 3h3"/>'
};
function workspaceMap() {
  return `<section class="workspace-map" aria-label="Где мы работаем"><h2>Три окна на занятии</h2><div class="workspace-nodes">${[
    ['instructions','Этот сайт','Читаем шаг и смотрим пример'],
    ['editor','VS Code + OpenCode','Даём задачу агенту и смотрим файлы'],
    ['browser','Учебный ServiceDesk','Проверяем результат в браузере']
  ].map(([icon,title,text])=>`<div class="workspace-node"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${workspaceIcons[icon]}</svg><div><strong>${title}</strong><span>${text}</span></div></div>`).join('')}</div></section>`;
}
function screenshot(item, id) {
  const shot = (item.screenshots || []).find(image => image.id === id);
  if (!shot) return '';
  const start = ['servicedesk-start','project-running'].includes(id) && !location.hash.endsWith('/part-10') ? '<a class="button guide-launch-help" href="#task-1/part-10">Как запустить этот сайт с агентом</a>' : '';
  return `<figure class="guide-shot"><div class="guide-shot-label"><strong>${esc(shot.role || 'Пример на экране')}</strong><span>Смотри и сравни со своим экраном</span></div><button type="button" class="guide-shot-open" data-guide-image="${esc(id)}" aria-label="Увеличить скриншот: ${esc(shot.title)}"><img src="${esc(shot.src)}" alt="${esc(shot.title)}" width="${shot.width}" height="${shot.height}" loading="lazy"><span>Увеличить скриншот <span aria-hidden="true">↗</span></span></button>${start}</figure>`;
}
function messageBlock(action) {
  if (!action.code) return '';
  const prompt = action.kind === 'prompt';
  const inside = action.target === 'opencode';
  const repository = action.kind === 'repository';
  const label = repository ? 'Адрес репозитория на GitVerse' : prompt ? 'Отправь агенту в OpenCode' : inside ? 'Введи в поле сообщения OpenCode' : 'Введи в терминал VS Code';
  const hint = repository ? 'Вставь в поле Git: Clone в VS Code' : prompt || inside ? 'Вставь в поле сообщения и нажми Enter' : 'Вводи по одной строке, нажимая Enter после каждой';
  const copy = repository ? 'Скопировать адрес' : prompt ? 'Скопировать запрос' : action.code.includes('\n') ? 'Скопировать команды' : 'Скопировать команду';
  return `<div class="guide-code ${prompt ? 'guide-prompt' : 'guide-command'}"><div class="guide-code-head"><span><strong>${label}</strong><small>${hint}</small></span><button type="button" data-guide-copy>${copy}</button></div><pre><code>${esc(action.code)}</code></pre></div>`;
}
function outputBlock(action) {
  if (!action.outputs?.length) return '';
  return `<section class="guide-output" aria-label="Пример ответа программы"><strong>Ответ программы · пример</strong><p>Эти строки появятся после выполнения команд. Вводить их не нужно.</p><dl>${action.outputs.map(output=>`<div><dt>После <code>${esc(output.command)}</code></dt><dd><pre>${esc(output.value)}</pre></dd></div>`).join('')}</dl></section>`;
}
function actionScreenshots(item, action, shown) {
  const ids = [...(action.imageId ? [action.imageId] : []), ...(action.imageIds || [])];
  return ids.map(id => {
    if (shown.has(id)) {
      const shot = item.screenshots.find(image=>image.id===id);
      return shot ? `<button type="button" class="button guide-shot-link" data-guide-image="${esc(id)}">Скриншот: ${esc(shot.title)} ↗</button>` : '';
    }
    shown.add(id);
    return screenshot(item,id);
  }).join('');
}
function materials(item, resume) {
  return `<section id="files" tabindex="-1" class="guide-materials"><h2>Материалы к работе</h2><p>Скачай нужные файлы. Инструкцию можно проходить прямо на этом сайте.</p><div class="guide-file-grid">${item.number===1 ? `<article class="guide-file"><div><h3>Проект преподавателя на GitVerse</h3><p>Сначала клонируем его в свою папку, вместе с историей Git.</p></div><a class="button primary" href="#task-1/part-7">Открыть шаги</a></article><article class="guide-file"><div><h3>Набор для OpenCode</h3><p>Четыре актуальных файла: настройки, инструкция, отчёт и README. Добавляем их после клонирования.</p></div><a class="button" href="${esc(item.downloads.setup)}" download>Скачать набор</a></article>` : ''}<article class="guide-file"><div><h3>Резервная копия проекта</h3><p>Если GitVerse недоступен: ZIP с готовыми файлами и настройками. Основной порядок получения проекта показан на шаге 7.</p></div><a class="button primary starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">Скачать ZIP</a></article><article class="guide-file"><div><h3>Шаблон отчёта</h3><p>${item.number===1 ? 'Необязательная заготовка REPORT.md. Можно написать самому или с помощником, в удобной форме и объёме.' : 'Файл REPORT.md для выводов о работе с агентом. Его можно заполнить вместе с помощником.'}</p></div><a class="button" href="${esc(item.downloads.report)}" download>Скачать шаблон</a></article><article class="guide-file"><div><h3>Настройки OpenCode</h3><p>Готовый opencode.json без ключей доступа. После клонирования GitVerse добавь его набором для OpenCode.</p></div><a class="button" href="assets/starters/${esc(item.downloads.starterKey)}/opencode.json" download="opencode.json">Скачать настройки</a></article><article class="guide-file"><div><h3>Копия инструкции</h3><p>Текстовая версия шагов для сохранения на компьютер. Все основные действия доступны на сайте.</p></div><a class="button" href="${esc(item.downloads.task)}" download>Скачать инструкцию</a></article></div><div class="guide-pager"><a class="button primary" href="#task-${item.number}/part-${resume}">Вернуться к работе</a><a class="button" href="#task-${item.number}/submit">Что показать преподавателю</a></div></section>`;
}
function showcase(item) {
  const guide = item.guide, done = doneSet().has(item.number);
  return `<section id="submit" tabindex="-1" class="guide-showcase"><span class="guide-place">Разговор с преподавателем</span><h2>Покажи, как ты работал с агентом</h2><p>Результат занятия виден в проекте и в твоих решениях. Количество выполненных команд его не заменяет.</p><ol class="showcase-list">${guide.showcase.map(text=>`<li>${inline(text)}</li>`).join('')}</ol><h3>Объясни своими словами</h3><ul>${guide.questions.map(text=>`<li>${inline(text)}</li>`).join('')}</ul><div class="guide-completion"><div><strong>Готов показать результат?</strong><p>Личная отметка сохранится в этом браузере.</p></div><button id="toggle-done" type="button" aria-pressed="${done}">${done ? 'Снять отметку' : 'Отметить для себя'}</button></div></section>`;
}
function lessonStep(item, step, index) {
  const guide = item.guide, checked = taskSteps(item.number).has(index);
  const previous = guide.steps[index-1], next = guide.steps[index+1];
  const shown = new Set();
  const explanation = step.terms?.length ? `<section class="guide-explainer" aria-label="Что это и зачем"><h3>Что это и зачем</h3><dl>${step.terms.map(({term,text})=>`<div><dt>${esc(term)}</dt><dd>${inline(text)}</dd></div>`).join('')}</dl></section>` : '';
  return `<article id="part-${step.id}" tabindex="-1" class="guide-step"><div class="guide-step-heading"><span class="guide-place">${esc(step.where)}</span><span>Шаг ${index+1} из ${guide.steps.length}</span></div><h2>${esc(step.title)}</h2><p class="guide-step-intro">${inline(step.intro)}</p>${step.diagram ? renderConceptDiagram(step.diagram,item.illustrations || []) : ''}${explanation}<ol class="guide-actions">${step.actions.map((action,actionIndex)=>`<li><span class="guide-action-index" aria-hidden="true">${actionIndex+1}</span><div class="guide-action-body"><h3>${esc(action.title)}</h3><p>${inline(action.text)}</p>${action.diagram ? renderConceptDiagram(action.diagram,item.illustrations || []) : ''}${action.setupDownload && item.downloads.setup ? `<a class="button primary" href="${esc(item.downloads.setup)}" download>Скачать набор для OpenCode</a>` : ''}${action.downloadProject ? `<a class="button primary starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">Скачать учебный проект</a>` : ''}${action.link ? `<a class="button primary" href="${esc(action.link.href)}" target="_blank" rel="noopener noreferrer">${esc(action.link.label)}</a>` : ''}${messageBlock(action)}${outputBlock(action)}${actionScreenshots(item,action,shown)}${action.expect ? `<div class="guide-expect"><div><strong>Проверь у себя</strong><p>${inline(action.expect)}</p></div></div>` : ''}${action.tip ? `<details class="guide-tip"><summary>Подсказка</summary><p>${inline(action.tip)}</p></details>` : ''}</div></li>`).join('')}</ol><div class="guide-step-result"><strong>В конце этого шага</strong><p>${inline(step.result)}</p></div><div class="guide-pager">${previous ? `<a class="button" href="#task-${item.number}/part-${previous.id}">Предыдущий шаг</a>` : '<a class="button" href="#tasks">Все работы</a>'}<div class="guide-next"><label class="guide-step-check"><span>Сделал и посмотрел результат</span><input type="checkbox" data-guide-check="${index}" ${checked ? 'checked' : ''}></label><a class="button primary" href="${next ? `#task-${item.number}/part-${next.id}` : `#task-${item.number}/submit`}">${next ? 'Следующий шаг' : 'Что показать преподавателю'} <span aria-hidden="true">→</span></a></div></div></article>`;
}
export function renderVisualLesson(item) {
  const guide = item.guide, marks = taskSteps(item.number), anchor = location.hash.split('/')[1] || '';
  const requested = /^part-(\d+)$/.exec(anchor);
  const firstPending = guide.steps.findIndex((_,index)=>!marks.has(index));
  let index = requested ? guide.steps.findIndex(step=>step.id===Number(requested[1])) : guide.steps.findIndex(step=>step.id===lessonPosition(item.number));
  if (index < 0) index = Math.max(0,firstPending);
  const special = ['submit','checks','files'].includes(anchor);
  const body = anchor === 'files' ? materials(item,guide.steps[index].id) : special ? showcase(item) : lessonStep(item,guide.steps[index],index);
  return `<div class="guided-lesson" data-guided-lesson><header class="guided-heading"><div class="guide-header-top"><a class="button guide-back" href="#tasks">← Все работы</a><span class="course-label">${esc(runtime.state.group)} · Работа ${pad(item.number)}</span></div><h1>${esc(guide.title)}</h1><p class="lead">${esc(guide.lead)}</p><div class="guide-header-actions"><a class="button primary" href="#task-${item.number}/part-${guide.steps[index].id}">${marks.size || lessonPosition(item.number) || index>0 ? 'Продолжить работу' : 'Начать работу'}</a>${item.number===1 ? `<a class="button" href="#task-1/part-7">Взять проект с GitVerse</a>` : `<a class="button starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">Скачать проект</a>`}<a class="button" href="#task-${item.number}/files">Все материалы</a><a class="button" href="#task-${item.number}/submit">Что показать</a></div><div class="guide-targets"><strong>Задачи занятия</strong><ul>${guide.outcomes.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></div></header><nav class="guide-tools" aria-label="Управление работой"><a class="button" href="#tasks">Все работы</a><a class="button" href="#task-${item.number}/files">Материалы</a><a class="button" href="#task-${item.number}/submit">Что показать</a></nav>${item.number===1 && index===0 && !special ? workspaceMap() : ''}<div class="guide-layout"><aside class="guide-sidebar"><div class="guide-sidebar-heading"><strong>Шаги работы</strong><span id="guide-progress" aria-live="polite">${marks.size} / ${guide.steps.length}</span></div><nav class="guide-nav" aria-label="Шаги работы">${guide.steps.map((step,position)=>`<a href="#task-${item.number}/part-${step.id}" data-guide-nav="${position}" class="${position===index && !special ? 'active' : ''} ${marks.has(position) ? 'is-done' : ''}" ${position===index && !special ? 'aria-current="step"' : ''}><span>${pad(position+1)}</span><span>${esc(step.title)}</span><i aria-hidden="true">${marks.has(position) ? '✓' : ''}</i><span class="sr-only" data-guide-state>${marks.has(position) ? 'Шаг выполнен' : ''}</span></a>`).join('')}<a class="guide-nav-extra ${anchor==='submit' || anchor==='checks' ? 'active' : ''}" href="#task-${item.number}/submit"><span>◎</span><span>Что показать</span></a><a class="guide-nav-extra ${anchor==='files' ? 'active' : ''}" href="#task-${item.number}/files"><span>↓</span><span>Файлы проекта</span></a></nav><a class="guide-help-link" href="#stack">Помощник не подключается?</a></aside><div class="guide-main">${body}</div></div><dialog id="guide-image-dialog" class="guide-image-dialog" aria-label="Увеличенное изображение"><div class="guide-image-toolbar"><strong id="guide-image-title"></strong><div class="guide-image-controls"><button type="button" id="guide-image-fit">Показать 100%</button><button type="button" id="guide-image-close" aria-label="Закрыть скриншот">×</button></div></div><img id="guide-image-full" alt=""></dialog></div>`;
}
export function bindVisualLesson(route, rerender) {
  bindConceptDiagrams();
  const number = Number(route.split('-')[1]);
  const item = runtime.course.find(entry=>entry.number===number);
  const anchor = /^part-(\d+)$/.exec(location.hash.split('/')[1] || '');
  if (anchor) rememberLessonPosition(number,Number(anchor[1]));
  const nav = document.querySelector('.guide-nav');
  const active = nav?.querySelector('[aria-current="step"]');
  if (active) {
    const bounds = nav.getBoundingClientRect(), current = active.getBoundingClientRect();
    if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft += current.left-bounds.left-(nav.clientWidth-current.width)/2;
    if (nav.scrollHeight > nav.clientHeight) nav.scrollTop += current.top-bounds.top-(nav.clientHeight-current.height)/2;
  }
  document.querySelector('[data-guide-check]')?.addEventListener('change',event=>{
    const input = event.currentTarget, index = Number(input.dataset.guideCheck);
    setTaskStep(number,index,input.checked);
    const nav = document.querySelector(`[data-guide-nav="${index}"]`);
    nav?.classList.toggle('is-done',input.checked);
    if (nav) {
      nav.querySelector('i').textContent=input.checked ? '✓' : '';
      nav.querySelector('[data-guide-state]').textContent=input.checked ? 'Шаг выполнен' : '';
    }
    document.querySelector('#guide-progress').textContent=`${taskSteps(number).size} / ${item.guide.steps.length}`;
  });
  document.querySelectorAll('[data-guide-copy]').forEach(button=>button.addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(button.closest('.guide-code').querySelector('code').textContent); button.textContent='Скопировано'; }
    catch { button.textContent='Выдели текст вручную'; }
  }));
  const dialog = document.querySelector('#guide-image-dialog');
  document.querySelectorAll('[data-guide-image]').forEach(button=>button.addEventListener('click',()=>{
    const shot=[...(item.screenshots || []),...(item.illustrations || [])].find(image=>image.id===button.dataset.guideImage);
    document.querySelector('#guide-image-full').src=shot.src;
    document.querySelector('#guide-image-full').alt=shot.title;
    document.querySelector('#guide-image-full').style.setProperty('--shot-width',`${shot.width}px`);
    document.querySelector('#guide-image-title').textContent=shot.title;
    dialog.classList.add("is-fit");
    document.querySelector('#guide-image-fit').textContent='Показать 100%';
    dialog.showModal();
  }));
  document.querySelector('#guide-image-fit')?.addEventListener('click',event=>{ const fit=dialog.classList.toggle('is-fit'); event.currentTarget.textContent=fit ? 'Показать 100%' : 'Вписать в окно'; });
  document.querySelector('#guide-image-close')?.addEventListener('click',()=>dialog.close());
  document.querySelector('#toggle-done')?.addEventListener('click',()=>{
    setDone(number,!doneSet().has(number)); rerender(); document.querySelector('#toggle-done')?.focus({preventScroll:true});
  });
}
