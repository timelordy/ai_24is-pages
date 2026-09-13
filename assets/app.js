"use strict";
const $ = (s) => document.querySelector(s);
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const KEY = "kgasu-ai-course-v2";
let courses = [],
  schedule = [],
  state = { group: "24ИС02/1", done: {} },
  storageFailed = false;
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (
    saved &&
    typeof saved.group === "string" &&
    saved.done &&
    typeof saved.done === "object"
  )
    state = saved;
} catch {
  storageFailed = true;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    storageFailed = true;
  }
}
const pad = (n) => String(n).padStart(2, "0");
const dateLabel = (d) =>
  new Date(d + "T12:00:00+03:00").toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
  });
function nextLesson(now = new Date()) {
  const group = schedule.find((g) => g.group === state.group);
  const index = group.dates.findIndex(
    (date) =>
      new Date(date + "T" + group.time.split("–")[1] + ":00+03:00") >= now,
  );
  return { group, index };
}
function rows() {
  return courses
    .map(
      (c, i) =>
        `<article class="lesson-row"><span class="number">${pad(i + 1)}</span><div><h3><a href="#lesson-${i + 1}">${escapeHTML(c.title)}</a></h3><p>${escapeHTML(c.result)}</p></div><a class="open" href="#lesson-${i + 1}">Открыть пару →</a></article>`,
    )
    .join("");
}
function home() {
  const { group, index } = nextLesson();
  const lesson = courses[index];
  return `<section class="hero"><div><p class="eyebrow">Методы искусственного интеллекта</p><h1>От запроса<br>к собственному<br>ИИ-агенту</h1><p class="lead">За семь пар вы настроите помощника для небольшого Python-проекта: научите его читать требования, использовать инструменты и проверять исправления.</p><span class="tag">7 занятий по 90 минут</span><span class="tag">Без обязательной оплаты</span><div class="actions"><a class="button" href="#lesson-1">Начать с первой пары</a><a class="button secondary" href="#guide">Как устроена работа</a></div></div><aside class="next"><p class="eyebrow">${index < 0 ? "Расписание завершено" : "Ближайшее занятие"} · ${escapeHTML(group.group)}</p>${lesson ? `<p class="meta">${dateLabel(group.dates[index])} 2026 · ${group.time}<br>Аудитория ${escapeHTML(group.room)}</p><h2>${pad(index + 1)} / ${escapeHTML(lesson.title)}</h2><p><b>Что сделать:</b> ${escapeHTML(lesson.steps[0])}</p><p><b>Результат:</b> ${escapeHTML(lesson.result)}</p><a class="button" href="#lesson-${index + 1}">Открыть задание →</a>` : '<h2>Все семь встреч позади</h2><p>Материалы остаются доступны. Проверьте комплект отчётов и подготовьтесь к защите.</p><a class="button" href="#work">Моя работа</a>'}</aside></section><section class="principles"><article><b>Один понятный проект</b><p>Учебный список задач на Python. Без фреймворков и сложной предметной области.</p></article><article><b>Доступная вам модель</b><p>Начинаем в привычном чате. Затем OpenCode, бесплатный маршрут и подготовленный резерв.</p></article><article><b>Результат нужно проверить</b><p>Сохраняем вызовы инструментов, тесты и diff. На защите объясняем свою работу.</p></article></section><h2>Семь шагов курса</h2><div class="lesson-list">${rows()}</div>`;
}
function lessonPage(n) {
  const c = courses[n - 1];
  if (!c) return '<h1>Занятие не найдено</h1><a href="#plan">К плану курса</a>';
  const list = (items) =>
    `<ol class="steps">${items.map((s) => `<li>${escapeHTML(s)}</li>`).join("")}</ol>`;
  return `<p class="eyebrow">Пара ${pad(n)} / 07 · 90 минут</p><h1>${escapeHTML(c.title)}</h1><div class="lesson-layout"><div><h2>Что изучаем</h2><p>${escapeHTML(c.learn)}</p><h2>Что делаем</h2><p>${escapeHTML(c.result)}</p><div class="notice">Начните с новой копии starter. Работа с прошлой пары не требуется. ${[4, 6].includes(n) ? "Исходное падение тестов подготовлено специально." : "Исходные тесты должны пройти."}</div><h2>Шаги</h2>${list(c.steps)}<h2>Что должно получиться</h2><p>${escapeHTML(c.result)}</p><h2>Как проверить</h2>${list(c.checks)}<h2>Что показать преподавателю</h2><p>${escapeHTML(c.defense)}</p><h2>Разбор понятия</h2><p>${escapeHTML(c.explain)}</p><h2>План на 90 минут</h2><div class="table-wrap"><table><thead><tr><th>Время</th><th>Работа</th></tr></thead><tbody>${c.timeline.map(([t, a]) => `<tr><td>${t}</td><td>${escapeHTML(a)}</td></tr>`).join("")}</tbody></table></div><h2>Для сильных</h2><p>${escapeHTML(c.extension)}</p><div class="actions">${n > 1 ? `<a href="#lesson-${n - 1}">← Пара ${n - 1}</a>` : ""}${n < 7 ? `<a href="#lesson-${n + 1}">Пара ${n + 1} →</a>` : '<a href="#work">Проверить свою работу →</a>'}</div></div><aside class="sidebar"><h3>Комплект пары ${n}</h3><p>Распакуйте в отдельную папку. Откройте START.md внутри.</p><a class="button" href="assets/downloads/lesson-${pad(n)}.zip" download>Скачать starter ZIP</a><a class="button secondary" href="assets/materials/lessons/${pad(n)}/report-template.md" download>Шаблон отчёта</a><p><a href="assets/materials/lessons/${pad(n)}/README.html">Полное задание</a><br><a href="assets/materials/lessons/${pad(n)}/expected-result.html">Ожидаемый результат</a><br><a href="assets/materials/lessons/${pad(n)}/checks.html">Проверочные сценарии</a></p><p><a href="#guide">Не получается начать?</a></p></aside></div>`;
}
function schedulePage() {
  const group = schedule.find((g) => g.group === state.group);
  return `<p class="eyebrow">Осень 2026 · четыре подгруппы</p><h1>Расписание</h1><p class="lead">${escapeHTML(group.group)} · ${group.time}<br>${escapeHTML(group.room)}</p><p>Выберите свою подгруппу в верхней части страницы. Время московское.</p><div class="table-wrap"><table><thead><tr><th>Пара</th><th>Дата</th><th>Тема</th></tr></thead><tbody>${group.dates.map((d, i) => `<tr><td>${i + 1}</td><td>${dateLabel(d)}<br><span class="muted">${group.group === "24ИС03/2" ? "вторник" : "понедельник"}</span></td><td><a href="#lesson-${i + 1}">${escapeHTML(courses[i].title)}</a></td></tr>`).join("")}</tbody></table></div>`;
}
function materials() {
  return `<p class="eyebrow">Файлы для самостоятельной работы</p><h1>Материалы</h1><p class="lead">Каждый starter готов к запуску независимо от предыдущих занятий. В полном комплекте есть задания, шаблоны, исходники и инструкции.</p><a class="button" href="assets/downloads/course-student.zip" download>Скачать весь студенческий комплект</a><div class="panel"><a href="assets/materials/START_HERE.html">Начните здесь</a> · <a href="assets/materials/free-stack.html">Бесплатная среда</a> · <a href="assets/materials/security/README.html">Безопасность</a> · <a href="assets/materials/assessment/RUBRIC.html">Критерии оценки</a></div>${rows()}`;
}
function work() {
  const done = state.done[state.group] || [];
  return `<p class="eyebrow">Локальный чек-лист · ${escapeHTML(state.group)}</p><h1>Моя работа</h1><p class="lead">Отмечайте работы, которые подготовили к разбору. Это самоотметка, не оценка и не отправка преподавателю.</p><p>Отчёты и журналы храните в своих файлах. Этот список сохраняется только в браузере; на другом устройстве импортируйте экспорт.</p>${courses.map((c, i) => `<div class="work-row"><label><input type="checkbox" data-lesson="${i + 1}" ${done.includes(i + 1) ? "checked" : ""}><span>Пара ${i + 1}. ${escapeHTML(c.title)}<br><a href="#lesson-${i + 1}">Задание и критерии</a></span></label></div>`).join("")}<div class="actions"><button id="export">Экспорт отметок</button><button id="import">Импорт отметок</button><input type="file" id="import-file" accept="application/json" hidden></div><p id="work-status" role="status" class="status">${done.length} из 7 подготовлено.${storageFailed ? " Хранилище браузера недоступно: экспортируйте отметки перед закрытием." : ""}</p>`;
}
function guide() {
  return `<p class="eyebrow">Первый запуск и правила</p><h1>Как работать</h1><p class="lead">Сначала получите ответ, затем проверьте, на чём он основан. На каждой паре результат сохраняется в отдельной рабочей папке.</p><ol class="steps"><li>Выберите свою подгруппу и нужную пару. Скачайте starter и распакуйте в новую папку без личных файлов.</li><li>Прочитайте START.md. Проверьте Python 3.11+. На первой паре достаточно привычного чата; OpenCode понадобится со второй.</li><li>Выполните шаги задания. Записывайте точный запрос, модель, вызовы инструментов и вывод проверки.</li><li>Посмотрите diff и защищённые файлы. Сохраните отчёт и будьте готовы объяснить новый пример без подсказки модели.</li></ol><div class="notice">Не покупайте подписку для сдачи. Если бесплатная модель недоступна, за 15 минут перейдите к резервному маршруту с преподавателем. Непроведённую проверку помечайте NOT_RUN.</div><h2>Установка и помощь</h2><p><a href="assets/materials/free-stack.html">Инструкция бесплатного запуска и ограничения</a></p><p><a href="assets/materials/teacher/FALLBACK.html">Если модель или установка не работают</a></p><h2>Что оценивается</h2><p>Выполнение, проверка результата, индивидуальное объяснение и воспроизводимость. Бренд и тариф модели не оцениваются.</p><p><a href="assets/materials/assessment/RUBRIC.html">Полная рубрика</a> · <a href="assets/materials/assessment/DEFENSE.html">Как проходит защита</a> · <a href="assets/materials/security/README.html">Безопасность</a></p>`;
}
function render() {
  const route = location.hash.slice(1) || "home";
  let html;
  if (route.startsWith("lesson-")) html = lessonPage(Number(route.slice(7)));
  else
    html = (
      {
        home,
        plan: () =>
          '<p class="eyebrow">От чата к проверяемому помощнику</p><h1>План курса</h1><p class="lead">Каждая пара добавляет один инструмент работы с ИИ. Для каждой есть готовый старт, проверка и индивидуальное объяснение.</p>' +
          rows(),
        schedule: schedulePage,
        materials,
        work,
        guide,
      }[route] || home
    )();
  $("#content").innerHTML = html;
  document.querySelectorAll("nav a").forEach((a) => {
    if (a.hash === "#" + route) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (route === "work") bindWork();
}
function bindWork() {
  document.querySelectorAll("[data-lesson]").forEach((input) =>
    input.addEventListener("change", () => {
      let done = state.done[state.group] || [];
      const n = Number(input.dataset.lesson);
      done = done.filter((x) => x !== n);
      if (input.checked) done.push(n);
      state.done[state.group] = done;
      save();
      $("#work-status").textContent =
        `${done.length} из 7 подготовлено.${storageFailed ? " Сохранение недоступно: сделайте экспорт." : ""}`;
    }),
  );
  $("#export").onclick = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "course-progress.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $("#import").onclick = () => $("#import-file").click();
  $("#import-file").onchange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file || file.size > 10000)
        throw Error("Файл отсутствует или больше 10 КБ");
      const value = JSON.parse(await file.text());
      if (
        !schedule.some((g) => g.group === value.group) ||
        !value.done ||
        typeof value.done !== "object" ||
        Array.isArray(value.done)
      )
        throw Error("Неверный формат");
      for (const [group, items] of Object.entries(value.done)) {
        if (
          !schedule.some((g) => g.group === group) ||
          !Array.isArray(items) ||
          items.some((n) => !Number.isInteger(n) || n < 1 || n > 7)
        )
          throw Error("Неверные отметки");
      }
      state = { group: value.group, done: value.done };
      save();
      $("#group").value = state.group;
      render();
      $("#work-status").textContent =
        "Отметки импортированы. Самоотметки не являются оценкой.";
    } catch (error) {
      $("#work-status").textContent = "Импорт не выполнен: " + error.message;
    }
  };
}
Promise.all(
  ["course", "schedule"].map((name) =>
    fetch(`assets/${name}.json`).then((r) => {
      if (!r.ok) throw Error("Не удалось загрузить " + name);
      return r.json();
    }),
  ),
)
  .then(([c, s]) => {
    courses = c;
    schedule = s;
    if (!schedule.some((g) => g.group === state.group))
      state.group = schedule[0].group;
    $("#group").innerHTML = schedule
      .map(
        (g) =>
          `<option value="${escapeHTML(g.group)}">${escapeHTML(g.group)}</option>`,
      )
      .join("");
    $("#group").value = state.group;
    $("#group").onchange = (e) => {
      state.group = e.target.value;
      save();
      render();
    };
    window.addEventListener("hashchange", () => {
      render();
      $("#content").focus();
      window.scrollTo(0, 0);
    });
    render();
  })
  .catch((error) => {
    $("#content").innerHTML =
      "<h1>Материалы не загрузились</h1><p>" +
      escapeHTML(error.message) +
      '</p><p>Откройте портал через HTTP-сервер или Pages. <a href="assets/downloads/course-student.zip">Скачать комплект</a>.</p>';
  });
