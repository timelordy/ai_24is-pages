'use strict';
import {runtime, esc, inline, block, pad, taskSteps, setTaskStep, doneSet, setDone, lessonPosition, rememberLessonPosition, currentGroup} from './lib.js?v=85b64ff4da2c';
import {renderConceptDiagram, bindConceptDiagrams} from './lesson-diagrams.js?v=85b64ff4da2c';
import {lessonProgress, canVisitStep, resumeStepId} from './course-progress.js?v=85b64ff4da2c';

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
function screenshot(item, id, resultExample = false) {
  const shot = (item.screenshots || []).find(image => image.id === id);
  if (!shot) return '';
  const start = ['servicedesk-start','project-running'].includes(id) && !location.hash.endsWith('/part-10') ? '<a class="button guide-launch-help" href="#task-1/part-10">Как запустить этот сайт с агентом</a>' : '';
  const caption = imageCaption(shot);
  const label = resultExample ? '' : `<div class="guide-shot-label"><strong>${esc(shot.role || 'Пример на экране')}</strong><span>Смотри и сравни со своим экраном</span></div>`;
  return `<figure class="guide-shot">${label}<div class="guide-shot-preview"><img src="${esc(shot.src)}" alt="${esc(shot.alt || shot.title)}" width="${shot.width}" height="${shot.height}" loading="lazy"><button type="button" class="guide-shot-open" data-guide-image="${esc(id)}" aria-label="Увеличить скриншот: ${esc(shot.title)}"${caption ? ` aria-describedby="guide-caption-${esc(id)}"` : ''}>Увеличить скриншот <span aria-hidden="true">↗</span></button></div>${caption ? `<figcaption id="guide-caption-${esc(id)}" class="guide-image-caption">${esc(caption)}</figcaption>` : ''}${start}</figure>`;
}
function imageCaption(shot) {
  if (shot.kind==='generated') return `Учебная схема, созданная с помощью ИИ. ${shot.caption || shot.alt || ''}`.trim();
  return shot.caption || '';
}
function readableText(text) {
  const blocks = [];
  let lines = [], list = false;
  const flush = () => {
    if (lines.length) blocks.push(list ? `<ul>${lines.map(line=>`<li>${esc(line)}</li>`).join('')}</ul>` : `<p>${esc(lines.join('\n'))}</p>`);
    lines = [];
  };
  for (const line of text.replace(/\r\n?/g,'\n').split('\n')) {
    if (!line.trim()) { flush(); continue; }
    const bullet = line.startsWith('- ');
    if (bullet !== list) flush();
    list = bullet;
    lines.push(bullet ? line.slice(2) : line);
  }
  flush();
  return blocks.join('');
}
function messageBlock(action) {
  if (!action.code) return '';
  const prompt = action.kind === 'prompt';
  const inside = action.target === 'opencode';
  const repository = action.kind === 'repository';
  const label = repository ? 'Адрес репозитория на GitVerse' : prompt ? 'Отправь агенту в OpenCode' : inside ? 'Введи в поле сообщения OpenCode' : 'Введи в терминал VS Code';
  const hint = repository ? 'Вставь в поле Git: Clone в VS Code' : prompt || inside ? 'Вставь в поле сообщения и нажми Enter' : 'Вводи по одной строке, нажимая Enter после каждой';
  const copy = repository ? 'Скопировать адрес' : prompt ? 'Скопировать запрос' : action.code.includes('\n') ? 'Скопировать команды' : 'Скопировать команду';
  const body = prompt ? `<div class="guide-prompt-body">${readableText(action.code)}</div>` : `<pre><code>${esc(action.code)}</code></pre>`;
  const fallback = '<label class="guide-copy-fallback" hidden><span>Текст для ручного копирования. Он выделен: нажми Ctrl+C или выбери «Копировать» в меню поля. Браузер может изменить формат переводов строк.</span><textarea readonly rows="8" spellcheck="false"></textarea></label>';
  return `<div class="guide-code ${prompt ? 'guide-prompt' : 'guide-command'}"><div class="guide-code-head"><span><strong>${label}</strong><small>${hint}</small></span><button type="button" data-guide-copy="${esc(JSON.stringify(action.code))}" aria-live="polite">${copy}</button></div>${fallback}${body}</div>`;
}
function outputBlock(action) {
  if (!action.outputs?.length) return '';
  return `<section class="guide-output" aria-label="Текстовый вывод программы"><p>Команды вводи выше. Эти строки появятся после их выполнения. Вводить их не нужно.</p><dl>${action.outputs.map(output=>`<div><dt>После <code>${esc(output.command)}</code></dt><dd><pre>${esc(output.value)}</pre></dd></div>`).join('')}</dl></section>`;
}
function actionScreenshots(item, action, shown) {
  const ids = [...(action.imageId ? [action.imageId] : []), ...(action.imageIds || [])];
  return ids.map(id => {
    if (shown.has(id)) {
      const shot = item.screenshots.find(image=>image.id===id);
      return shot ? `<button type="button" class="button guide-shot-link" data-guide-image="${esc(id)}"${imageCaption(shot) ? ` aria-describedby="guide-caption-${esc(id)}"` : ''}>Скриншот: ${esc(shot.title)} ↗</button>` : '';
    }
    shown.add(id);
    return screenshot(item,id,Boolean(action.outputs?.length));
  }).join('');
}
function actionResult(item, action, shown) {
  const images = actionScreenshots(item,action,shown);
  const result = action.outputs?.length ? `<section class="guide-result-example" aria-label="Пример результата"><h4>Пример результата</h4>${outputBlock(action)}${images ? `<div class="guide-result-screens">${images}</div>` : ''}</section>` : images;
  const expect = action.expect ? `<div class="guide-expect"><div><strong>Проверь у себя</strong>${prose(action.expect)}</div></div>` : '';
  return result || expect ? `<div class="guide-action-evidence">${result}${expect}</div>` : '';
}
function prose(text, extra = '') {
  return `<div class="guide-prose${extra ? ` ${extra}` : ''}">${block(text)}</div>`;
}
function stepAvailable(item, index) {
  return index < item.guide.steps.length ? canVisitStep(item,index) : index===item.guide.steps.length && lessonProgress(item).complete;
}
function navigationAttributes(href, available, reason) {
  return `role="link" tabindex="0" aria-disabled="${!available}"${available ? ` href="${href}"` : ` aria-describedby="${reason}"`}`;
}
function stepState(checked, available, optional = false) {
  return !available ? 'Сначала выполни предыдущие шаги' : checked ? 'Шаг выполнен' : optional ? 'Необязательный шаг: можно пропустить' : '';
}
function stepNavigation(item, index, special) {
  const marks=taskSteps(item.number);
  return item.guide.steps.map((step,position)=>{
    const available=canVisitStep(item,position), checked=marks.has(position);
    return `<a data-guide-nav="${position}" class="${position===index && !special ? 'active' : ''} ${checked ? 'is-done' : ''} ${!available ? 'is-locked' : ''}" ${navigationAttributes(`#task-${item.number}/part-${step.id}`,available,'guide-nav-reason')} ${position===index && !special ? 'aria-current="step"' : ''}><span>${pad(position+1)}</span><span>${esc(step.title)}</span><i aria-hidden="true">${!available ? '🔒' : checked ? '✓' : ''}</i><span class="guide-nav-state" data-guide-state>${stepState(checked,available,step.optional===true)}</span></a>`;
  }).join('');
}
function nextPager(item,index) {
  const next=item.guide.steps[index+1], available=stepAvailable(item,index+1);
  const optional=item.guide.steps[index].optional===true, checked=taskSteps(item.number).has(index);
  return `<div class="guide-next">${optional ? '<p>Необязательный шаг: можно пропустить без галочки.</p>' : ''}<label class="guide-step-check"><span>${optional ? 'Дополнение выполнил и проверил' : 'Сделал и посмотрел результат'}</span><input type="checkbox" data-guide-check="${index}" ${checked ? 'checked' : ''}></label><a class="button primary" data-guide-next="${index+1}" ${navigationAttributes(next ? `#task-${item.number}/part-${next.id}` : `#task-${item.number}/submit`,available,'guide-next-reason')}><span id="guide-next-label">${optional && !checked ? 'Продолжить без дополнения' : next ? 'Следующий шаг' : 'Итог работы'}</span> <span aria-hidden="true">→</span></a><p id="guide-next-reason" class="guide-gate-reason"${available ? ' hidden' : ''}>Чтобы перейти дальше, отметь, что сделал шаг и проверил результат.</p></div>`;
}
function materials(item, resume) {
  const recovery = item.number===1 ? 'Если GitVerse недоступен: ZIP с готовыми файлами и настройками. Основной порядок получения проекта показан на шаге 7.' : 'Продолжай свою папку. ZIP нужен только для восстановления с преподавателем; не распаковывай его поверх проекта.';
  return `<section id="files" tabindex="-1" class="guide-materials"><h2>Материалы к работе</h2><p>${item.number>=3 ? 'Продолжай свою папку и свой форк. Готовые foundation/final передаёт только преподаватель после явного разрешения. Не распаковывай их поверх своей работы: сравни версии и перенеси согласованные части по инструкции.' : 'Скачай нужные файлы.'} Инструкцию можно проходить прямо на этом сайте.</p><div class="guide-file-grid">
  ${item.number===1 ? `<article class="guide-file"><div><h3>Проект преподавателя на GitVerse</h3><p>Сначала клонируем его в свою папку, вместе с историей Git.</p></div><a class="button primary" href="#task-1/part-7">Открыть шаги</a></article><article class="guide-file"><div><h3>Набор для OpenCode</h3><p>Четыре актуальных файла: настройки, инструкция, необязательный шаблон отчёта и README. Добавляем их после клонирования, сохраняя свои заметки.</p></div><a class="button" href="${esc(item.downloads.setup)}" download>Скачать набор</a></article>` : ''}
  ${item.number===2 ? '<article class="guide-file"><div><h3>Продолжай свою папку</h3><p>Создай форк и подключи его по карточкам. Повторное клонирование нужно только на новом компьютере или без прежней папки.</p></div><a class="button primary" href="#task-2/part-1">Своя копия на GitVerse</a></article>' : item.number>=3 ? `<article class="guide-file"><div><h3>Продолжай свою папку</h3><p>Открой свою принятую версию с прошлой работы. Сохрани историю, поиск, заметки и настройки; проверь свой форк перед отправкой.</p></div><a class="button primary" href="#task-${item.number}/part-1">Подготовить свою версию</a></article>` : ''}
  <article class="guide-file"><div><h3>Резервная копия проекта</h3><p>${recovery}</p></div><a class="button starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">Скачать ZIP</a></article>
  <article class="guide-file"><div><h3>Шаблон отчёта</h3><p>Необязательная заготовка REPORT.md. Можно написать самому или с помощником, в удобной форме и объёме. Существующие заметки не заменяй шаблоном.</p></div><a class="button" href="${esc(item.downloads.report)}" download>Скачать шаблон</a></article>
  <article class="guide-file"><div><h3>Настройки OpenCode</h3><p>Готовый opencode.json без ключей доступа. ${item.number===1 ? 'После клонирования GitVerse добавь его набором для OpenCode.' : 'Если помощник уже подключён, сохрани свой файл настроек; скачивание не требуется.'}</p></div><a class="button" href="assets/starters/${esc(item.downloads.starterKey)}/opencode.json" download="opencode.json">Скачать настройки</a></article>
  <article class="guide-file"><div><h3>Копия инструкции</h3><p>Текстовая версия шагов для сохранения на компьютер. Все основные действия доступны на сайте.</p></div><a class="button" href="${esc(item.downloads.task)}" download>Скачать инструкцию</a></article></div><div class="guide-pager"><a class="button primary" href="#task-${item.number}/part-${resume}">Вернуться к работе</a><a class="button" href="#task-${item.number}/submit">Итог работы</a></div></section>`;
}
function showcase(item) {
  const guide = item.guide, done = doneSet().has(item.number);
  const complete=lessonProgress(item).complete;
  const optional=(currentGroup()?.optionalModules ?? [5]).includes(item.number);
  const skip=optional ? '<aside class="notice panel"><h3>Если пропускаешь работу</h3><p>Ничего отмечать не нужно: не ставь галочки за невыполненные действия. Пропуск не снижает общий прогресс и не мешает переходу к следующей обязательной работе, когда она открыта преподавателем. Результаты ниже относятся только к выбранному дополнению.</p><a class="button" href="#tasks">К обязательным работам</a></aside>' : '';
  return `<section id="submit" tabindex="-1" class="guide-showcase"><span class="guide-place">Итог работы</span><h2>Что должно получиться в конце</h2>${skip}<p>Сверь свой проект с результатами ниже. Проверь, что всё работает, и разберись в собственных изменениях.</p><p>REPORT.md необязателен; заметку можно сохранить в удобной форме, не заменяя прежние записи.</p><ol class="showcase-list">${guide.showcase.map(text=>`<li>${inline(text)}</li>`).join('')}</ol><h3>Вопросы для самопроверки</h3><ul>${guide.questions.map(text=>`<li>${inline(text)}</li>`).join('')}</ul><div class="guide-completion"><div><strong>Результат проверен?</strong><p>Личная отметка сохранится в этом браузере.</p>${!complete ? `<p id="guide-completion-reason">${optional ? 'Если выполняешь дополнение и хочешь отметить его завершённым, пройди и отметь его обязательные шаги. При пропуске эта отметка не нужна.' : 'Сначала выполни и отметь обязательные шаги работы. Необязательные дополнения можно пропустить без галочек.'} <a href="#task-${item.number}/part-${resumeStepId(item)}">Вернуться к незавершённому шагу</a></p>` : ''}</div><button id="toggle-done" type="button" aria-pressed="${done}"${!complete && !done ? ' disabled aria-describedby="guide-completion-reason"' : ''}>${done ? 'Снять отметку' : 'Отметить для себя'}</button></div></section>`;
}
function lessonStep(item, step, index) {
  const guide = item.guide;
  const previous = guide.steps[index-1];
  const shown = new Set();
  const example = step.example ? `<section class="guide-example" aria-label="Пример до и после"><h3>${esc(step.example.title)}</h3><div class="guide-example-grid">${[step.example.before,step.example.after].map(side=>`<section><h4>${esc(side.title)}</h4>${prose(side.text)}${actionScreenshots(item,side,shown)}</section>`).join('')}</div>${step.example.note ? prose(step.example.note,'guide-example-note') : ''}</section>` : '';
  const explanation = example + (step.terms?.length ? `<section class="guide-explainer" aria-label="Что это и зачем"><h3>Что это и зачем</h3><dl>${step.terms.map(({term,text})=>`<div><dt>${esc(term)}</dt><dd>${prose(text)}</dd></div>`).join('')}</dl></section>` : '');
  return `<article id="part-${step.id}" tabindex="-1" class="guide-step"><div class="guide-step-heading"><span class="guide-place">${esc(step.where)}</span><span>Шаг ${index+1} из ${guide.steps.length}</span></div><h2>${esc(step.title)}</h2>${prose(step.intro,'guide-step-intro')}${step.diagram ? renderConceptDiagram(step.diagram,item.illustrations || []) : ''}${explanation}<ol class="guide-actions">${step.actions.map((action,actionIndex)=>`<li><span class="guide-action-index" aria-hidden="true">${actionIndex+1}</span><div class="guide-action-body"><h3>${esc(action.title)}</h3>${prose(action.text)}${action.diagram ? renderConceptDiagram(action.diagram,item.illustrations || []) : ''}${action.setupDownload && item.downloads.setup ? `<a class="button primary" href="${esc(item.downloads.setup)}" download>Скачать набор для OpenCode</a>` : ''}${action.downloadProject ? `<a class="button primary starter-download" href="#" data-starter="${esc(item.downloads.starterKey)}" data-filename="${esc(item.downloads.starterFilename)}">Скачать учебный проект</a>` : ''}${action.link ? `<a class="button primary" href="${esc(action.link.href)}" target="_blank" rel="noopener noreferrer">${esc(action.link.label)}</a>` : ''}${messageBlock(action)}${actionResult(item,action,shown)}${action.tip ? `<details class="guide-tip"><summary>Подсказка</summary>${prose(action.tip)}</details>` : ''}</div></li>`).join('')}</ol><div class="guide-step-result"><strong>В конце этого шага</strong>${prose(step.result)}</div><div class="guide-pager">${previous ? `<a class="button" href="#task-${item.number}/part-${previous.id}">Предыдущий шаг</a>` : '<a class="button" href="#tasks">Все работы</a>'}${nextPager(item,index)}</div></article>`;
}
export function renderVisualLesson(item) {
  const guide = item.guide, progress = lessonProgress(item), anchor = location.hash.split('/')[1] || '';
  const requested = /^part-(\d+)$/.exec(anchor);
  let index = requested ? guide.steps.findIndex(step=>step.id===Number(requested[1])) : guide.steps.findIndex(step=>step.id===lessonPosition(item.number));
  if (index < 0 || !canVisitStep(item,index)) index = guide.steps.findIndex(step=>step.id===resumeStepId(item));
  const special = ['submit','checks','files'].includes(anchor);
  const body = anchor === 'files' ? materials(item,guide.steps[index].id) : special ? showcase(item) : lessonStep(item,guide.steps[index],index);
  const projectIndex=item.number===1 ? 6 : 0, projectAvailable=canVisitStep(item,projectIndex);
  const projectLabel=item.number===1 ? 'Взять проект с GitVerse' : item.number===2 ? 'Своя копия на GitVerse' : 'Продолжить свою папку';
  const projectLink=`<a class="button" data-guide-project href="#task-${item.number}/part-${projectAvailable ? guide.steps[projectIndex].id : resumeStepId(item)}"${!projectAvailable ? ' aria-describedby="guide-project-reason"' : ''}>${projectLabel}</a>`;
  return `<div class="guided-lesson" data-guided-lesson><header class="guided-heading"><div class="guide-header-top"><a class="button guide-back" href="#tasks">← Все работы</a><span class="course-label">${esc(runtime.state.group)} · Работа ${pad(item.number)}</span></div><h1>${esc(guide.title)}</h1><p class="lead">${esc(guide.lead)}</p><div class="guide-header-actions"><a class="button primary" href="#task-${item.number}/part-${guide.steps[index].id}">${progress.completed || lessonPosition(item.number) || index>0 ? 'Продолжить работу' : 'Начать работу'}</a>${projectLink}<a class="button" href="#task-${item.number}/files">Все материалы</a><a class="button" href="#task-${item.number}/submit">Итог работы</a></div><p id="guide-project-reason" class="guide-gate-reason"${projectAvailable ? ' hidden' : ''}>${item.number===1 ? 'Проект будет на шаге 7. ' : ''}Пока вернись к первому незавершённому шагу.</p><div class="guide-targets"><strong>Задачи занятия</strong><ul>${guide.outcomes.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></div></header><nav class="guide-tools" aria-label="Управление работой"><a class="button" href="#tasks">Все работы</a><a class="button" href="#task-${item.number}/files">Материалы</a><a class="button" href="#task-${item.number}/submit">Итог работы</a></nav>${item.number===1 && index===0 && !special ? workspaceMap() : ''}<div class="guide-layout"><aside class="guide-sidebar"><div class="guide-sidebar-heading"><strong>Шаги работы</strong><span id="guide-progress" aria-live="polite">${progress.completed} / ${progress.total}</span></div><p id="guide-nav-reason" class="guide-gate-reason">Следующие шаги открываются после отметки о выполнении предыдущих.</p><nav class="guide-nav" aria-label="Шаги работы">${stepNavigation(item,index,special)}<a class="guide-nav-extra ${anchor==='submit' || anchor==='checks' ? 'active' : ''}" href="#task-${item.number}/submit"><span>◎</span><span>Итог работы</span></a><a class="guide-nav-extra ${anchor==='files' ? 'active' : ''}" href="#task-${item.number}/files"><span>↓</span><span>Файлы проекта</span></a></nav><a class="guide-help-link" href="#stack">Помощник не подключается?</a></aside><div class="guide-main">${body}</div></div><dialog id="guide-image-dialog" class="guide-image-dialog" aria-label="Увеличенное изображение" aria-describedby="guide-image-caption"><div class="guide-image-toolbar"><strong id="guide-image-title"></strong><div class="guide-image-controls"><button type="button" id="guide-image-fit">Показать 100%</button><button type="button" id="guide-image-close" aria-label="Закрыть скриншот">×</button></div></div><p id="guide-image-caption" class="guide-image-caption" hidden></p><img id="guide-image-full" alt=""></dialog></div>`;
}
export function bindVisualLesson(route, rerender) {
  bindConceptDiagrams();
  const number = Number(route.split('-')[1]);
  const item = runtime.course.find(entry=>entry.number===number);
  const anchor = /^part-(\d+)$/.exec(location.hash.split('/')[1] || '');
  if (anchor) {
    const index=item.guide.steps.findIndex(step=>step.id===Number(anchor[1]));
    rememberLessonPosition(number,canVisitStep(item,index) ? Number(anchor[1]) : resumeStepId(item));
  }
  const nav = document.querySelector('.guide-nav');
  const active = nav?.querySelector('[aria-current="step"]');
  if (active) {
    const bounds = nav.getBoundingClientRect(), current = active.getBoundingClientRect();
    if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft += current.left-bounds.left-(nav.clientWidth-current.width)/2;
    if (nav.scrollHeight > nav.clientHeight) nav.scrollTop += current.top-bounds.top-(nav.clientHeight-current.height)/2;
  }
  nav?.addEventListener('focusin',event=>{
    const link=event.target.closest('a');
    if (link?.parentElement!==nav || nav.scrollWidth<=nav.clientWidth) return;
    const left=nav.getBoundingClientRect().left+nav.clientLeft, right=left+nav.clientWidth;
    const current=link.getBoundingClientRect();
    if (current.left<left || current.width>nav.clientWidth) nav.scrollLeft+=current.left-left;
    else if (current.right>right) nav.scrollLeft+=current.right-right;
  });
  document.querySelector('[data-guide-check]')?.addEventListener('change',event=>{
    const input = event.currentTarget, index = Number(input.dataset.guideCheck);
    if (!canVisitStep(item,index)) return;
    setTaskStep(number,index,input.checked);
    const marks=taskSteps(number), progress=lessonProgress(item);
    document.querySelectorAll('[data-guide-nav]').forEach(node=>{
      const position=Number(node.dataset.guideNav), available=canVisitStep(item,position), checked=marks.has(position);
      updateNavigation(node,`#task-${number}/part-${item.guide.steps[position].id}`,available,'guide-nav-reason');
      node.classList.toggle('is-done',checked);
      node.classList.toggle('is-locked',!available);
      node.querySelector('i').textContent=!available ? '🔒' : checked ? '✓' : '';
      node.querySelector('[data-guide-state]').textContent=stepState(checked,available,item.guide.steps[position].optional===true);
    });
    const next=document.querySelector('[data-guide-next]'), available=stepAvailable(item,index+1);
    if (next) updateNavigation(next,item.guide.steps[index+1] ? `#task-${number}/part-${item.guide.steps[index+1].id}` : `#task-${number}/submit`,available,'guide-next-reason');
    const nextLabel=document.querySelector('#guide-next-label');
    if (nextLabel) nextLabel.textContent=item.guide.steps[index].optional===true && !input.checked ? 'Продолжить без дополнения' : item.guide.steps[index+1] ? 'Следующий шаг' : 'Итог работы';
    const reason=document.querySelector('#guide-next-reason');
    if (reason) reason.hidden=available;
    const project=document.querySelector('[data-guide-project]'), projectIndex=number===1 ? 6 : 0;
    if (project) {
      const projectAvailable=canVisitStep(item,projectIndex);
      project.setAttribute('href',`#task-${number}/part-${projectAvailable ? item.guide.steps[projectIndex].id : resumeStepId(item)}`);
      if (projectAvailable) project.removeAttribute('aria-describedby');
      else project.setAttribute('aria-describedby','guide-project-reason');
    }
    const projectReason=document.querySelector('#guide-project-reason');
    if (projectReason) projectReason.hidden=canVisitStep(item,projectIndex);
    document.querySelector('#guide-progress').textContent=`${progress.completed} / ${progress.total}`;
  });
  document.querySelectorAll('[data-guide-nav], [data-guide-next]').forEach(node=>{
    const blocked=()=>!stepAvailable(item,Number(node.dataset.guideNav ?? node.dataset.guideNext));
    node.addEventListener('click',event=>{ if (blocked()) event.preventDefault(); });
    node.addEventListener('keydown',event=>{ if (blocked() && ['Enter',' '].includes(event.key)) event.preventDefault(); });
  });
  document.querySelectorAll('[data-guide-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const source = JSON.parse(button.dataset.guideCopy);
    try {
      await navigator.clipboard.writeText(source);
      button.textContent='Скопировано';
      const fallback = button.closest?.('.guide-code')?.querySelector('.guide-copy-fallback');
      if (fallback) fallback.hidden=true;
    }
    catch {
      button.textContent='Не скопировано. Повторить';
      const fallback = button.closest('.guide-code').querySelector('.guide-copy-fallback');
      const field = fallback.querySelector('textarea');
      field.value=source;
      fallback.hidden=false;
      field.focus();
      field.select();
    }
  }));
  const dialog = document.querySelector('#guide-image-dialog');
  let imageOpener;
  dialog?.addEventListener('close',()=>imageOpener?.focus({preventScroll:true}));
  document.querySelectorAll('[data-guide-image]').forEach(button=>button.addEventListener('click',()=>{
    const shot=[...(item.screenshots || []),...(item.illustrations || [])].find(image=>image.id===button.dataset.guideImage);
    document.querySelector('#guide-image-full').src=shot.src;
    document.querySelector('#guide-image-full').alt=shot.alt || shot.title;
    document.querySelector('#guide-image-full').style.setProperty('--shot-width',`${shot.width}px`);
    document.querySelector('#guide-image-title').textContent=shot.title;
    const caption = document.querySelector('#guide-image-caption');
    caption.textContent=imageCaption(shot);
    caption.hidden=!caption.textContent;
    dialog.classList.add("is-fit");
    document.querySelector('#guide-image-fit').textContent='Показать 100%';
    imageOpener=button;
    dialog.showModal();
  }));
  document.querySelector('#guide-image-fit')?.addEventListener('click',event=>{ const fit=dialog.classList.toggle('is-fit'); event.currentTarget.textContent=fit ? 'Показать 100%' : 'Вписать в окно'; });
  document.querySelector('#guide-image-close')?.addEventListener('click',()=>dialog.close());
  document.querySelector('#toggle-done')?.addEventListener('click',()=>{
    const done=doneSet().has(number);
    if (!done && !lessonProgress(item).complete) return;
    setDone(number,!done); rerender(); document.querySelector('#toggle-done')?.focus({preventScroll:true});
  });
}
function updateNavigation(node,href,available,reason) {
  node.setAttribute('aria-disabled',String(!available));
  if (available) { node.setAttribute('href',href); node.removeAttribute('aria-describedby'); }
  else { node.removeAttribute('href'); node.setAttribute('aria-describedby',reason); }
}
