'use strict';
export const $ = selector => document.querySelector(selector);
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pad = value => String(value).padStart(2, '0');
const STORE = 'campus-servicedesk-progress-v11';
const record = value => value && typeof value === 'object' && !Array.isArray(value);
export const runtime = {course: [], schedule: [], state: {group: '', groupChosen: false, done: {}, steps: {}}};
try { const saved = JSON.parse(localStorage.getItem(STORE) || '{}'); if (record(saved)) { runtime.state.group = typeof saved.group === 'string' ? saved.group : ''; runtime.state.groupChosen = saved.groupChosen === true; runtime.state.done = record(saved.done) ? saved.done : {}; runtime.state.steps = record(saved.steps) ? saved.steps : {}; } } catch { /* Storage is optional. */ }
export function save() { try { localStorage.setItem(STORE, JSON.stringify(runtime.state)); } catch { /* Keep the current session usable. */ } updateProgressPill(); }
export function inline(value) { let text = esc(value); text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'); text = text.replace(/`([^`]+)`/g, '<code>$1</code>'); return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); }
function textBlock(value) {
  return value.trim().split(/\n\s*\n/).filter(Boolean).map(paragraph => {
    const lines = paragraph.trim().split('\n');
    if (lines.every(line => /^\s*[-*] /.test(line))) return `<ul>${lines.map(line => `<li>${inline(line.replace(/^\s*[-*] /, ''))}</li>`).join('')}</ul>`;
    if (lines.every(line => /^\s*\d+\. /.test(line))) return `<ol start="${Number(lines[0].match(/\d+/)[0])}">${lines.map(line => `<li>${inline(line.replace(/^\s*\d+\. /, ''))}</li>`).join('')}</ol>`;
    if (lines.length >= 2 && /^\|/.test(lines[0]) && /^\|[\s:|-]+\|$/.test(lines[1])) { const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim()); return `<div class="table-scroll"><table><thead><tr>${cells(lines[0]).map(v => `<th scope="col">${inline(v)}</th>`).join('')}</tr></thead><tbody>${lines.slice(2).map(line => `<tr>${cells(line).map(v => `<td>${inline(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
    if (paragraph.startsWith('>')) return `<blockquote class="question">${inline(paragraph.replace(/^>\s?/gm, ''))}</blockquote>`;
    return `<p>${inline(paragraph.trim()).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}
export function block(value) { const source = String(value || '').trim(); const fence = /```[^\n]*\n([\s\S]*?)```/g; let html = '', offset = 0, match; while ((match = fence.exec(source))) { html += textBlock(source.slice(offset, match.index)); html += `<div class="code-block"><pre class="command"><code>${esc(match[1].trimEnd())}</code></pre></div>`; offset = fence.lastIndex; } return html + textBlock(source.slice(offset)); }
export function todayMoscow() { return new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date()); }
export function dateLabel(value) { return new Date(`${value}T12:00:00+03:00`).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow'}); }
export function dayLabel(value) { return new Date(`${value}T12:00:00+03:00`).toLocaleDateString('ru-RU', {weekday: 'short', timeZone: 'Europe/Moscow'}); }
export const routeName = () => location.hash.slice(1).split('/')[0] || 'home';
// Entering the course requires an explicit choice; no silent first-group fallback.
export const currentGroup = () => runtime.schedule.find(item => item.group === runtime.state.group);
export function selectGroup(group) { if (!runtime.schedule.some(item => item.group === group)) return false; runtime.state.group = group; runtime.state.groupChosen = true; save(); return true; }
export function doneSet() { const values = runtime.state.done?.[runtime.state.group]; return new Set(Array.isArray(values) ? values.filter(Number.isInteger) : []); }
export function setDone(number, isDone) { const item = runtime.course.find(item => item.number === number); if (!currentGroup() || !item || item.locked) return; const values = doneSet(); isDone ? values.add(number) : values.delete(number); runtime.state.done[runtime.state.group] = [...values].sort((a, b) => a - b); save(); }
export function taskSteps(number) { const values = runtime.state.steps?.[runtime.state.group]?.[number]; return new Set(Array.isArray(values) ? values.filter(Number.isInteger) : []); }
export function setTaskStep(number, index, checked) { const item = runtime.course.find(item => item.number === number); if (!currentGroup() || !item || item.locked || !Number.isInteger(index) || index < 0 || index >= (item.steps?.length || 0)) return; if (!record(runtime.state.steps[runtime.state.group])) runtime.state.steps[runtime.state.group] = {}; const values = taskSteps(number); checked ? values.add(index) : values.delete(index); runtime.state.steps[runtime.state.group][number] = [...values].sort((a, b) => a - b); save(); }
export function updateProgressPill() { if (typeof document === 'undefined') return; const node = $('#progress-pill'); const completed = runtime.course.filter(item => !item.locked && doneSet().has(item.number)).length; if (node) node.textContent = `${completed} / ${runtime.course.length || 6} отмечено`; }
export function nearestLesson(group = currentGroup(), today = todayMoscow()) {
  if (!group) return null;
  const index = group.dates.findIndex(date => date >= today);
  if (group.intro?.date >= today && (index < 0 || group.intro.date <= group.dates[index])) return {group, lesson: null, intro: group.intro, date: group.intro.date, index: -1, finished: false};
  if (index < 0) return {group, lesson: null, intro: null, date: null, index: -1, finished: true};
  return {group, lesson: runtime.course[index], intro: null, date: group.dates[index], index, finished: false};
}
export function currentOpenLesson() { return runtime.course.filter(item => !item.locked).at(-1); }
export function isSetupMeeting() { return Boolean(nearestLesson()?.intro); }
export function taskCard(item) {
  const done = doneSet().has(item.number); const date = currentGroup()?.dates[item.number - 1];
  return `<article class="task-card panel ${item.locked ? 'locked' : done ? 'done' : ''}"><div class="task-card-top"><span class="task-number">РАБОТА ${pad(item.number)}</span><span class="status ${done && !item.locked ? 'done' : ''}">${item.locked ? 'ОТКРОЕТСЯ ПОЗЖЕ' : done ? 'ОТМЕЧЕНО' : 'МОЖНО НАЧИНАТЬ'}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.goal || item.ability)}</p>${date ? `<p class="tiny">По расписанию вашей группы: ${dateLabel(date)}</p>` : ''}${item.locked ? '<div class="task-artifact">Задание появится после того, как преподаватель откроет эту работу. Дата и ваши галочки не открывают материалы автоматически.</div>' : `<div class="actions"><a class="button primary" href="#task-${item.number}">Открыть задание</a></div>`}</article>`;
}
