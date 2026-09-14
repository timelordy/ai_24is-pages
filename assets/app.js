'use strict';
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const formatDate = date => new Date(date + 'T12:00:00+03:00').toLocaleDateString('ru-RU', {day:'numeric', month:'long'});

Promise.all([
  fetch('assets/course.json').then(response => {
    if (!response.ok) throw new Error('Не удалось загрузить программу');
    return response.json();
  }),
  fetch('assets/schedule.json').then(response => {
    if (!response.ok) throw new Error('Не удалось загрузить расписание');
    return response.json();
  })
]).then(([course, schedule]) => {
  const groupSelect = $('#group');
  groupSelect.innerHTML = schedule.map(item => `<option value="${escapeHtml(item.group)}">${escapeHtml(item.group)}</option>`).join('');

  function renderNext() {
    const group = schedule.find(item => item.group === groupSelect.value);
    const now = new Date();
    const lessonIndex = group.dates.findIndex(date => new Date(date + 'T23:59:00+03:00') >= now);
    if (lessonIndex < 0) {
      $('#next').innerHTML = '<p class="eyebrow">Курс</p><h2>Расписание завершено</h2><p>Материалы остаются доступны для повторения и защиты.</p>';
      return;
    }
    const lesson = course[lessonIndex];
    $('#next').innerHTML = `
      <p class="eyebrow">Ближайшая пара · ${escapeHtml(group.group)}</p>
      <h2>${formatDate(group.dates[lessonIndex])} · ${escapeHtml(group.time)}</h2>
      <p><b>${String(lesson.number).padStart(2, '0')} · ${escapeHtml(lesson.title)}</b></p>
      <p>${escapeHtml(lesson.artifact)}</p>
      <p class="muted">Аудитория: ${escapeHtml(group.room)}</p>`;
  }

  $('#lessons').innerHTML = course.map(lesson => `
    <article class="card">
      <span class="number">${String(lesson.number).padStart(2, '0')}</span>
      <h3>${escapeHtml(lesson.title)}</h3>
      <p>${escapeHtml(lesson.ability)}</p>
      <p><b>GitVerse:</b> ${escapeHtml(lesson.gitverse)}</p>
      <p><b>Артефакт:</b> ${escapeHtml(lesson.artifact)}</p>
    </article>`).join('');

  groupSelect.addEventListener('change', renderNext);
  renderNext();
}).catch(error => {
  $('main').innerHTML = `<section class="next"><h1>Материалы не загрузились</h1><p>${escapeHtml(error.message)}</p></section>`;
});
