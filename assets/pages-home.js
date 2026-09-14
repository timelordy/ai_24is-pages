'use strict';
import {runtime,esc,pad,dateLabel,nearestLesson,taskCard} from './lib.js';

function nearestCard(n){
  if(n.intro)return`<section class="next-card panel"><div class="next-number">00</div><div><p class="eyebrow">Setup session · ${esc(n.group.room)}</p><h2>${esc(n.intro.title)}</h2><p>${esc(n.intro.note)}</p></div><a class="button primary" href="#current">Open setup guide</a></section>`;
  const lesson=n.lesson;
  if(lesson.locked)return`<section class="next-card panel"><div class="next-number">${pad(lesson.number)}</div><div><p class="eyebrow">Next scheduled stage · ${esc(n.group.room)}</p><h2>${esc(lesson.title)}</h2><p>${esc(lesson.releaseHint)}</p></div><a class="button" href="#tasks">See all stages</a></section>`;
  return`<section class="next-card panel"><div class="next-number">${pad(lesson.number)}</div><div><p class="eyebrow">Open now · ${esc(n.group.room)}</p><h2>${esc(lesson.title)}</h2><p><b>What you submit:</b> ${esc(lesson.artifact)}</p></div><a class="button primary" href="#task-${lesson.number}">Open stage</a></section>`;
}

function visualGuide(){
  return`<section class="visual-guide">
    <div class="section-head"><div><p class="eyebrow">What the tools look like</p><h2>Three places you will use.</h2><p>These are simplified screen guides, not exact screenshots. The point is to show where each action happens.</p></div></div>
    <div class="screen-grid">
      <article class="screen-card panel"><div class="mock-window"><div class="mock-top"><i></i><i></i><i></i><b>GitVerse</b></div><div class="gitverse-mock"><aside><span class="active">Project</span><span>Issues</span><span>Merge Requests</span><span>CI/CD</span></aside><main><p class="mock-label">Issue #12</p><h3>Search, filters and sorting</h3><div class="mock-line wide"></div><div class="mock-line"></div><div class="mock-chip">Open</div></main></div></div><h3>GitVerse</h3><p>This is where your repository lives. You create issues, push branches, open a Merge Request, and see whether the automatic checks passed.</p></article>
      <article class="screen-card panel"><div class="mock-window"><div class="mock-top"><i></i><i></i><i></i><b>VS Code + GigaCode</b></div><div class="vscode-mock"><aside><b>FILES</b><span>src/</span><span>tests/</span><span>package.json</span></aside><main><code>function applyTicketQuery(...) {</code><code>  // project code</code><code>}</code></main><section><b>GigaCode</b><p>Read the files first.</p><p>Make a short plan.</p></section></div></div><h3>VS Code + GigaCode</h3><p>This is where you read and change the project. GigaCode can inspect files and suggest code, but you still decide what is correct.</p></article>
      <article class="screen-card panel"><div class="mock-window"><div class="mock-top"><i></i><i></i><i></i><b>Terminal</b></div><div class="terminal-mock"><p><span>$</span> npm test</p><p class="ok">✓ 5 tests passed</p><p><span>$</span> npm run start</p><p>Campus ServiceDesk: http://127.0.0.1:4173</p></div></div><h3>Terminal</h3><p>This is where you run the real checks. An AI message saying “done” is not proof. A command you ran yourself is.</p></article>
    </div>
  </section>`;
}

function glossary(){
  const terms=[
    ['Repository','The project folder tracked by Git and stored in GitVerse. You keep the same one for the whole semester.'],
    ['Branch','A temporary line of work. You make changes there so the stable main branch stays untouched until the work is ready.'],
    ['Merge Request','A GitVerse page where you ask to merge your branch into main. It shows the diff, review comments, and automatic checks.'],
    ['Automatic checks','GitVerse runs the project tests for the commit you pushed. Green means those checks passed; it does not mean every possible bug is gone.'],
    ['HTTP API','A way for the browser and server to exchange data using requests such as GET, POST, and PATCH.'],
    ['SQLite','A small database stored in one file. Later in the project it replaces temporary in-memory data.']
  ];
  return`<section><div class="section-head"><div><p class="eyebrow">Plain-English glossary</p><h2>Words you will see repeatedly.</h2><p>You do not need to memorise definitions. Use this as a reference when a task mentions one of these terms.</p></div></div><div class="glossary-grid">${terms.map(([term,text])=>`<article class="glossary-card panel"><h3>${term}</h3><p>${text}</p></article>`).join('')}</div></section>`;
}

export function renderHome(){
  const n=nearestLesson(),opened=runtime.course.filter(x=>!x.locked).length;
  return`<section class="hero"><div class="hero-content"><p class="eyebrow">Semester software project</p><h1>One project.<br>Six stages.</h1><p class="lead">You keep the same Campus ServiceDesk repository for the whole semester. Each stage adds a real part of the system: the interface, an HTTP API, a database, business rules, team workflow, and finally a controlled AI feature.</p><div class="hero-actions"><a class="button primary" href="#current">Open current stage</a><a class="button secondary" href="#tasks">See project stages</a></div></div><div class="hero-metrics"><div class="metric"><strong>${opened}</strong><span>stage open now</span></div><div class="metric"><strong>6</strong><span>stages in total</span></div><div class="metric"><strong>1</strong><span>repository all semester</span></div><div class="metric"><strong>1</strong><span>working system at the end</span></div></div></section>
  <div class="section-head"><div><p class="eyebrow">What to do next</p><h2>Your next session</h2></div><p>${esc(n.group.group)} · ${dateLabel(n.date)} · ${esc(n.group.time)}</p></div>${nearestCard(n)}
  <div class="section-head"><div><p class="eyebrow">How the course works</p><h2>Build, prove, merge, continue.</h2><p>Every stage starts with a clear expected result. AI can help with the work, but the result is accepted only when you can prove it with code, tests, and a working scenario.</p></div></div>
  <section class="quick-grid"><article class="quick-card panel"><span>1</span><h3>Read the expected result</h3><p>Before asking AI for code, understand exactly what inputs and outputs must work.</p></article><article class="quick-card panel"><span>2</span><h3>Work in a branch</h3><p>Ask the coding assistant to inspect the project, make a plan, then change only what the task needs.</p></article><article class="quick-card panel"><span>3</span><h3>Prove it works</h3><p>Run the tests yourself, check the application, review the diff, then merge the branch only after every required check passes.</p></article></section>
  ${visualGuide()}${glossary()}`;
}

export const renderTasks=()=>`<header class="page-head"><p class="eyebrow">Project plan</p><h1>Six stages of one system.</h1><p class="lead">The cards below show the whole direction of the project. Only released stages contain instructions and files. A future stage shows its goal, but the actual task appears only when that stage opens.</p></header><section class="task-grid">${runtime.course.map(taskCard).join('')}</section>`;

export function renderCurrent(){
  const item=runtime.course.find(x=>!x.locked&&!runtime.state.done?.[runtime.state.group]?.includes(x.number))||runtime.course.filter(x=>!x.locked).at(-1);
  return`<header class="page-head"><p class="eyebrow">Current work</p><h1>${esc(item.title)}</h1><p class="lead">This is the stage you can work on now. Open it for the full task, the exact completion checks, the live project preview, and the backup project download.</p></header>${taskCard(item)}${visualGuide()}`;
}

export function renderStart(){return renderCurrent();}
