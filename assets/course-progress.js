import {runtime, currentGroup, taskSteps} from './lib.js?v=85b64ff4da2c';

const optionalModules = () => currentGroup()?.optionalModules ?? [5];
const orderedLessons = () => [...runtime.course].sort((a, b) => Number(a.number) - Number(b.number));

export function lessonProgress(item) {
  const steps = item.guide?.steps;
  const stepCount = steps?.length ?? item.steps?.length ?? 0;
  const checked = item.locked ? new Set() : taskSteps(item.number);
  let total = 0, completed = 0, firstPending = stepCount;
  for (let index = 0; index < stepCount; index++) {
    if (steps?.[index]?.optional === true) continue;
    total++;
    if (checked.has(index)) completed++;
    else firstPending = Math.min(firstPending, index);
  }
  return {completed, total, complete: !item.locked && total > 0 && completed === total, firstPending};
}

export function courseProgress() {
  const optional = optionalModules();
  let completed = 0, total = 0, optionalCompleted = 0, fractions = 0;
  for (const item of runtime.course) {
    const progress = lessonProgress(item);
    if (optional.includes(item.number)) {
      if (progress.complete) optionalCompleted++;
      continue;
    }
    total++;
    if (progress.complete) completed++;
    if (progress.total > 0) fractions += progress.completed / progress.total;
  }
  const percent = total ? Math.max(0, Math.min(100, Math.floor(100 * fractions / total))) : 0;
  return {completed, total, percent, optionalCompleted};
}

export function prerequisiteLesson(item) {
  const optional = optionalModules();
  return orderedLessons().find(earlier => Number(earlier.number) < Number(item.number)
    && !optional.includes(earlier.number) && !lessonProgress(earlier).complete) ?? null;
}

export function canVisitStep(item, index) {
  if (item.locked || !Number.isInteger(index) || index < 0) return false;
  const progress = lessonProgress(item);
  const stepCount = item.guide?.steps?.length ?? item.steps?.length ?? 0;
  return index < stepCount && !prerequisiteLesson(item) && index <= progress.firstPending;
}

export function resumeStepId(item) {
  const steps = item.guide?.steps;
  if (!steps?.length) return 1;
  return steps[Math.min(lessonProgress(item).firstPending, steps.length - 1)]?.id ?? 1;
}

export function nextCourseLesson() {
  const optional = optionalModules();
  const unlocked = orderedLessons().filter(item => !item.locked);
  const required = unlocked.filter(item => !optional.includes(item.number));
  return required.find(item => !lessonProgress(item).complete) ?? required.at(-1) ?? unlocked[0] ?? null;
}
