'use strict';
import {courseProgress} from './course-progress.js?v=85b64ff4da2c';
export const $ = selector => document.querySelector(selector);
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pad = value => String(value).padStart(2, '0');
const STORE = 'campus-servicedesk-progress-v11';
const record = value => value && typeof value === 'object' && !Array.isArray(value);
export const runtime = {course: [], schedule: [], state: {group: '', groupChosen: false, done: {}, steps: {}, positions: {}}};
try { const saved = JSON.parse(localStorage.getItem(STORE) || '{}'); if (record(saved)) { runtime.state.group = typeof saved.group === 'string' ? saved.group : ''; runtime.state.groupChosen = saved.groupChosen === true; runtime.state.done = record(saved.done) ? saved.done : {}; runtime.state.steps = record(saved.steps) ? saved.steps : {}; runtime.state.positions = record(saved.positions) ? saved.positions : {}; runtime.state.lesson1Order = saved.lesson1Order; } } catch { /* Storage is optional. */ }
export function migrateLessonOrder() {
  if (runtime.state.lesson1Order === 2) return;
  const indices = {7:8,8:9,9:7}, ids = {8:9,9:10,10:8};
  for (const lessons of Object.values(runtime.state.steps)) {
    if (record(lessons) && Array.isArray(lessons[1])) lessons[1] = [...new Set(lessons[1].map(index=>indices[index] ?? index))].sort((a,b)=>a-b);
  }
  for (const lessons of Object.values(runtime.state.positions)) {
    if (record(lessons) && Object.hasOwn(ids,lessons[1])) lessons[1] = ids[lessons[1]];
  }
  runtime.state.lesson1Order = 2;
}
migrateLessonOrder();
export function migrateGroupLabels() {
  const aliases = {'1 группа — 1 подгруппа':'24ИС02/1','1 группа — 2 подгруппа':'24ИС02/2','2 группа — 1 подгруппа':'24ИС03/1','2 группа — 2 подгруппа':'24ИС03/2','Group 1 — subgroup 1':'24ИС02/1','Group 1 — subgroup 2':'24ИС02/2','Group 2 — subgroup 1':'24ИС03/1','Group 2 — subgroup 2':'24ИС03/2'};
  const merge = (a, b) => [...new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])])].filter(Number.isInteger).sort((a,b) => a-b);
  for (const [oldName, name] of Object.entries(aliases)) {
    if (runtime.state.group === oldName) runtime.state.group = name;
    if (Object.hasOwn(runtime.state.done, oldName)) { runtime.state.done[name] = merge(runtime.state.done[name], runtime.state.done[oldName]); delete runtime.state.done[oldName]; }
    const oldSteps = runtime.state.steps[oldName];
    if (record(oldSteps)) {
      if (!record(runtime.state.steps[name])) runtime.state.steps[name] = {};
      for (const [lesson, marks] of Object.entries(oldSteps)) runtime.state.steps[name][lesson] = merge(runtime.state.steps[name][lesson], marks);
    }
    delete runtime.state.steps[oldName];
    if (record(runtime.state.positions?.[oldName])) {
      if (!record(runtime.state.positions[name])) runtime.state.positions[name] = {};
      runtime.state.positions[name] = {...runtime.state.positions[oldName],...runtime.state.positions[name]};
      delete runtime.state.positions[oldName];
    }
  }
}
migrateGroupLabels();
export function save() { try { localStorage.setItem(STORE, JSON.stringify(runtime.state)); } catch { /* Keep the current session usable. */ } updateProgressPill(); }
export function inline(value) {
  const source = String(value ?? ''), tokens = [];
  let marker = '\0';
  while (source.includes(marker)) marker += '\0';
  const protect = html => { tokens.push(html); return `${marker}${tokens.length - 1}${marker}`; };
  const text = source.replace(/`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)|https?:\/\/[^\s<>]+/g, (match, code, label, url) => {
    return protect(code !== undefined ? `<code>${esc(code)}</code>` : url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${inline(label)}</a>` : esc(match));
  });
  const emphasis = text => text.replace(/(?<!\*)\*(?![\s*])([^*\n]+?)(?<!\s)\*(?!\*)/g, '<em>$1</em>');
  const strong = esc(text).replace(/(?<!\*)\*\*(?![\s*])(.+?)(?<![\s*])\*\*(?!\*)/g, (_,content) => protect(`<strong>${emphasis(content)}</strong>`));
  const restore = text => text.split(marker).map((part,index) => index % 2 ? restore(tokens[Number(part)]) : part).join('');
  return restore(emphasis(strong));
}
function textBlock(value) {
  return value.trim().split(/\n\s*\n/).filter(Boolean).map(paragraph => {
    const lines = paragraph.trim().split('\n');
    if (lines.length >= 2 && /^\|/.test(lines[0]) && /^\|[\s:|-]+\|$/.test(lines[1])) { const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim()); return `<div class="table-scroll"><table><thead><tr>${cells(lines[0]).map(v => `<th scope="col">${inline(v)}</th>`).join('')}</tr></thead><tbody>${lines.slice(2).map(line => `<tr>${cells(line).map(v => `<td>${inline(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
    if (paragraph.startsWith('>')) return `<blockquote class="question">${inline(paragraph.replace(/^>\s?/gm, ''))}</blockquote>`;
    const groups = [];
    for (const line of lines) {
      const kind = /^\s*[-*] /.test(line) ? 'ul' : /^\s*\d+\. /.test(line) ? 'ol' : 'p';
      if (groups.at(-1)?.kind !== kind) groups.push({kind, lines: []});
      groups.at(-1).lines.push(line);
    }
    return groups.map(({kind,lines}) => {
      if (kind === 'p') return `<p>${inline(lines.join('\n').trim()).replace(/\n/g, '<br>')}</p>`;
      const start = kind === 'ol' ? ` start="${Number(lines[0].match(/\d+/)[0])}"` : '';
      return `<${kind}${start}>${lines.map(line => `<li>${inline(line.replace(/^\s*(?:[-*]|\d+\.) /, ''))}</li>`).join('')}</${kind}>`;
    }).join('');
  }).join('');
}
export function block(value) { const source = String(value || '').replace(/\r\n?/g, '\n').trim(); const fence = /```[^\n]*\n([\s\S]*?)```/g; let html = '', offset = 0, match; while ((match = fence.exec(source))) { html += textBlock(source.slice(offset, match.index)); html += `<div class="code-block"><pre class="command"><code>${esc(match[1].trimEnd())}</code></pre></div>`; offset = fence.lastIndex; } return html + textBlock(source.slice(offset)); }
export function todayMoscow() { return new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date()); }
function validDate(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value; }
export function dateLabel(value) { return validDate(value) ? new Date(`${value}T12:00:00+03:00`).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow'}) : 'Дата занятия пока не назначена'; }
export function dayLabel(value) { return new Date(`${value}T12:00:00+03:00`).toLocaleDateString('ru-RU', {weekday: 'short', timeZone: 'Europe/Moscow'}); }
export const routeName = () => location.hash.slice(1).split('/')[0] || 'home';
// Entering the course requires an explicit choice; no silent first-group fallback.
export const currentGroup = () => runtime.schedule.find(item => item.group === runtime.state.group);
export function selectGroup(group) { if (!runtime.schedule.some(item => item.group === group)) return false; runtime.state.group = group; runtime.state.groupChosen = true; save(); return true; }
export function doneSet() { const values = runtime.state.done?.[runtime.state.group]; return new Set(Array.isArray(values) ? values.filter(Number.isInteger) : []); }
export function setDone(number, isDone) { const item = runtime.course.find(item => item.number === number); if (!currentGroup() || !item || item.locked) return; const values = doneSet(); isDone ? values.add(number) : values.delete(number); runtime.state.done[runtime.state.group] = [...values].sort((a, b) => a - b); save(); }
export function taskSteps(number) { const values = runtime.state.steps?.[runtime.state.group]?.[number]; return new Set(Array.isArray(values) ? values.filter(Number.isInteger) : []); }
export function lessonPosition(number) { const part = runtime.state.positions?.[runtime.state.group]?.[number]; return Number.isInteger(part) && part > 0 ? part : null; }
export function rememberLessonPosition(number, part) {
  const lesson = runtime.course.find(item=>item.number===number);
  if (!currentGroup() || !lesson || lesson.locked || !lesson.guide?.steps.some(step=>step.id===part)) return;
  if (!record(runtime.state.positions)) runtime.state.positions = {};
  if (!record(runtime.state.positions[runtime.state.group])) runtime.state.positions[runtime.state.group] = {};
  runtime.state.positions[runtime.state.group][number] = part; save();
}
export function setTaskStep(number, index, checked) { const item = runtime.course.find(item => item.number === number); if (!currentGroup() || !item || item.locked || !Number.isInteger(index) || index < 0 || index >= (item.steps?.length || 0)) return; if (!record(runtime.state.steps[runtime.state.group])) runtime.state.steps[runtime.state.group] = {}; const values = taskSteps(number); checked ? values.add(index) : values.delete(index); runtime.state.steps[runtime.state.group][number] = [...values].sort((a, b) => a - b); save(); }
export function updateProgressPill() {
  if (typeof document === 'undefined') return;
  const {completed,total,percent}=courseProgress(), node=$('#progress-pill'), bar=$('#course-progress-bar');
  if (node) node.textContent=`${percent}% · ${completed} из ${total} работ`;
  if (bar) {
    bar.value=percent;
    bar.setAttribute('aria-valuetext',`${percent}%. Завершено обязательных работ: ${completed} из ${total}.`);
  }
}
export function nearestLesson(group = currentGroup(), today = todayMoscow()) {
  if (!group) return null;
  if (Array.isArray(group.meetings)) {
    const upcoming = group.meetings.map((meeting,index) => ({meeting,index})).filter(({meeting}) => validDate(meeting.date) && meeting.date >= today).sort((a,b) => a.meeting.date.localeCompare(b.meeting.date))[0];
    if (!upcoming) return {group, meeting: null, lesson: null, intro: null, date: null, index: -1, finished: group.meetings.length > 0 && group.meetings.every(meeting => validDate(meeting.date))};
    const {meeting,index} = upcoming;
    return {group, meeting, lesson: runtime.course.find(item => item.number === meeting.modules[0]), intro: null, date: meeting.date, index, finished: false};
  }
  const index = (group.dates || []).findIndex(date => validDate(date) && date >= today);
  if (group.intro?.date >= today && (index < 0 || group.intro.date <= group.dates[index])) return {group, lesson: null, intro: group.intro, date: group.intro.date, index: -1, finished: false};
  if (index < 0) return {group, lesson: null, intro: null, date: null, index: -1, finished: true};
  return {group, lesson: runtime.course[index], intro: null, date: group.dates[index], index, finished: false};
}
export function moduleLessonDate(number, group = currentGroup()) {
  if (!group) return null;
  const date = Array.isArray(group.meetings) ? group.meetings.find(meeting => meeting.modules.includes(number))?.date : group.dates?.[number - 1];
  return validDate(date) ? date : null;
}
export function moduleScheduleLabel(number, group = currentGroup()) {
  if (!group) return '';
  if (group.optionalModules?.includes(number)) return 'Необязательная работа, без отдельного занятия.';
  const date = moduleLessonDate(number,group);
  return date ? `По расписанию: ${dateLabel(date)}` : 'Дата занятия пока не назначена.';
}
export function currentOpenLesson() { return runtime.course.filter(item => !item.locked).at(-1); }
export function isSetupMeeting() { return Boolean(nearestLesson()?.intro); }
export function taskCard(item) {
  const done = doneSet().has(item.number), scheduleLabel = moduleScheduleLabel(item.number);
  return `<article class="task-card panel ${item.locked ? 'locked' : done ? 'done' : ''}"><div class="task-card-top"><span class="task-number">РАБОТА ${pad(item.number)}</span><span class="status ${done && !item.locked ? 'done' : ''}">${item.locked ? 'ОТКРОЕТСЯ ПОЗЖЕ' : done ? 'ОТМЕЧЕНО' : 'МОЖНО НАЧИНАТЬ'}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.goal || item.ability)}</p>${scheduleLabel ? `<p class="tiny">${esc(scheduleLabel)}</p>` : ''}${item.locked ? '<div class="task-artifact">Задание появится после того, как преподаватель откроет эту работу. Дата и ваши галочки не открывают материалы автоматически.</div>' : `<div class="actions"><a class="button primary" href="#task-${item.number}">Открыть задание</a></div>`}</article>`;
}
