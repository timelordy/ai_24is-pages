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
  playbook = [],
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
  return `<section class="hero"><div><p class="eyebrow">Методы искусственного интеллекта</p><h1>Что делать<br>на каждой паре</h1><p class="lead">Откройте нужную пару и выберите свою роль. Студент получит пошаговое задание. Преподаватель — готовый сценарий: что сказать, показать и принять.</p><div class="role-choice"><a class="role-card" href="#lesson-1"><b>Я студент</b><span>Открыть первое задание →</span></a><a class="role-card teacher-card" href="#teacher"><b>Я преподаватель</b><span>Открыть сценарий занятия →</span></a></div></div><aside class="next"><p class="eyebrow">${index < 0 ? "Расписание завершено" : "Ближайшее занятие"} · ${escapeHTML(group.group)}</p>${lesson ? `<p class="meta">${dateLabel(group.dates[index])} 2026 · ${group.time}<br>Аудитория ${escapeHTML(group.room)}</p><h2>${pad(index + 1)} / ${escapeHTML(lesson.title)}</h2><p><b>Студент делает:</b> ${escapeHTML(lesson.steps[0])}</p><p><b>Сдаёт:</b> ${escapeHTML(lesson.result)}</p><a class="button" href="#lesson-${index + 1}">Открыть эту пару →</a>` : '<h2>Все семь встреч позади</h2><p>Материалы остаются доступны. Проверьте комплект отчётов и подготовьтесь к защите.</p><a class="button" href="#work">Моя работа</a>'}</aside></section><section class="principles"><article><b>На первой паре</b><p>Любой привычный чат с LLM, файл notes.txt и одна короткая функция Python. OpenCode пока не нужен.</p></article><article><b>Со второй пары</b><p>OpenCode читает файлы учебного проекта. Каждый раз используется новая готовая папка.</p></article><article><b>Чтобы сдать</b><p>Показать исходные данные, реальный результат проверки и объяснить его своими словами.</p></article></section><h2>Все семь пар</h2><div class="lesson-list">${rows()}</div>`;
}
function bullets(items) {
  return `<ul class="check-list">${items.map((s) => `<li>${escapeHTML(s)}</li>`).join("")}</ul>`;
}
function lessonPage(n, role = "student") {
  const c = courses[n - 1];
  const t = playbook[n - 1];
  if (!c) return '<h1>Занятие не найдено</h1><a href="#plan">К плану курса</a>';
  const list = (items) =>
    `<ol class="steps">${items.map((s) => `<li>${escapeHTML(s)}</li>`).join("")}</ol>`;
  const studentSection = `<section class="role-section"><p class="eyebrow">Студенту</p><h2>Сделайте по порядку</h2><div class="notice">Скачайте новую папку для этой пары и откройте START.md. ${[4, 6].includes(n) ? "Падение исходного теста здесь ожидается." : "Работа с прошлой пары не нужна."}</div>${list(t.student)}<div class="prompt-card"><span class="step-label">Запрос для старта — можно скопировать</span><pre>${escapeHTML(t.prompt)}</pre></div><h2>Покажите преподавателю</h2>${bullets(t.accept)}<p class="finish-line"><b>Главный вывод:</b> ${escapeHTML(t.finish)}</p></section>`;
  const teacherSection = `<section class="role-section teacher-section"><p class="eyebrow">Преподавателю</p><h2>До пары</h2>${bullets(t.prepare)}<h2>Скажите группе</h2><blockquote>${escapeHTML(t.say)}</blockquote><h2>Покажите на экране</h2>${list(t.show)}<h2>Дайте студентам одно задание</h2>${bullets(t.student)}<h2>Примите работу, если</h2>${bullets(t.accept)}<div class="notice"><b>Если не работает:</b> ${escapeHTML(t.fallback)}</div><p class="finish-line"><b>Фраза в конце пары:</b> ${escapeHTML(t.finish)}</p></section>`;
  return `<p class="eyebrow">Пара ${pad(n)} / 07 · 90 минут</p><h1>${escapeHTML(c.title)}</h1><div class="lesson-summary"><div><span class="step-label">Задача пары</span><p>${escapeHTML(t.purpose)}</p></div><div><span class="step-label">Что сдаёт студент</span><p>${escapeHTML(c.result)}</p></div></div><div class="role-tabs"><a class="${role === "student" ? "active" : ""}" href="#student-${n}">Студенту: что делать</a><a class="teacher-tab ${role === "teacher" ? "active" : ""}" href="#teach-${n}">Преподавателю: как провести</a></div>${role === "teacher" ? teacherSection : studentSection}<details class="more"><summary>Теория, полный тайминг и расширенное задание</summary><h2>Короткое объяснение</h2><p>${escapeHTML(c.explain)}</p><h2>План на 90 минут</h2><div class="table-wrap"><table><thead><tr><th>Время</th><th>Работа</th></tr></thead><tbody>${c.timeline.map(([time, activity]) => `<tr><td>${time}</td><td>${escapeHTML(activity)}</td></tr>`).join("")}</tbody></table></div><h2>Для сильных</h2><p>${escapeHTML(c.extension)}</p></details><aside class="download-bar"><div><b>Файлы пары ${n}</b><span>Распакуйте ZIP в отдельную папку.</span></div><a class="button" href="assets/downloads/lesson-${pad(n)}.zip" download>Скачать starter ZIP</a><a class="button secondary" href="assets/materials/lessons/${pad(n)}/report-template.md" download>Скачать шаблон отчёта</a></aside><div class="actions lesson-nav">${n > 1 ? `<a href="#${role === "teacher" ? "teach" : "student"}-${n - 1}">← Пара ${n - 1}</a>` : ""}${n < 7 ? `<a href="#${role === "teacher" ? "teach" : "student"}-${n + 1}">Пара ${n + 1} →</a>` : role === "teacher" ? '<a href="#teacher">К списку сценариев →</a>' : '<a href="#work">Проверить свою работу →</a>'}</div>`;
}
function teacherPage() {
  const first = playbook[0];
  return `<p class="eyebrow">Готовый сценарий преподавателя</p><h1>Как провести курс</h1><p class="lead">Не нужно сначала разбираться во всём репозитории. Перед каждой парой откройте только её сценарий: подготовка, фраза для группы, демонстрация и четыре критерия сдачи.</p><section class="teacher-now"><span class="step-label">Первая пара — что сделать прямо сейчас</span><h2>Подготовка займёт около 10 минут</h2>${bullets(first.prepare)}<div class="actions"><a class="button" href="#teach-1">Открыть сценарий первой пары</a><a class="button secondary" href="assets/materials/teacher/QUICK_START.html">Открыть подробную шпаргалку</a></div></section><h2>Ваш цикл на каждой паре</h2><div class="teacher-cycle"><article><b>1. Подготовить</b><p>Распаковать starter и проверить исходное состояние.</p></article><article><b>2. Сказать</b><p>Одной фразой назвать цель сегодняшней работы.</p></article><article><b>3. Показать</b><p>Выполнить один пример на экране с журналом проверки.</p></article><article><b>4. Дать работу</b><p>Студенты повторяют на своей копии starter.</p></article><article><b>5. Принять</b><p>Проверить 3–5 видимых результатов и короткое объяснение.</p></article><article><b>6. Завершить</b><p>Сформулировать один вывод, который нужно унести с пары.</p></article></div><h2>Сценарии семи пар</h2><div class="lesson-list">${playbook.map((t, i) => `<article class="lesson-row"><span class="number">${pad(i + 1)}</span><div><h3>${escapeHTML(courses[i].title)}</h3><p>${escapeHTML(t.purpose)}</p></div><a class="open" href="#teach-${i + 1}">Как провести →</a></article>`).join("")}</div>`;
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
  if (route.startsWith("lesson-"))
    html = lessonPage(Number(route.slice(7)), "student");
  else if (route.startsWith("student-"))
    html = lessonPage(Number(route.slice(8)), "student");
  else if (route.startsWith("teach-"))
    html = lessonPage(Number(route.slice(6)), "teacher");
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
        teacher: teacherPage,
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
  ["course", "schedule", "playbook"].map((name) =>
    fetch(`assets/${name}.json`).then((r) => {
      if (!r.ok) throw Error("Не удалось загрузить " + name);
      return r.json();
    }),
  ),
)
  .then(([c, s, p]) => {
    courses = c;
    schedule = s;
    playbook = p;
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
      if (
        !location.hash.startsWith("#teach-") &&
        !location.hash.startsWith("#student-")
      )
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
