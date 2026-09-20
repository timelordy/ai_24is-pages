'use strict';
import {esc} from './lib.js?v=359ee70d123b';

export function renderLessonImages(item, sectionTitle) {
  const part = Number(/^Часть\s+(\d+)\./.exec(sectionTitle)?.[1]);
  const images = (item.screenshots || []).filter(image => image.part === part);
  return images.map(image => {
    const source = image.sourceUrl
      ? `<a href="${esc(image.sourceUrl)}" target="_blank" rel="noopener noreferrer">Официальный источник</a>`
      : 'Снимок запущенного учебного проекта';
    return `<figure class="lesson-shot" data-screenshot="${esc(image.id)}">
      <a class="lesson-shot-link" href="${esc(image.src)}" target="_blank" rel="noopener noreferrer" aria-label="Открыть крупнее: ${esc(image.title)}">
        <img src="${esc(image.src)}" alt="${esc(image.title)}" width="${Number(image.width)}" height="${Number(image.height)}" loading="lazy" decoding="async">
      </a>
      <figcaption><b>${esc(image.title)}</b><p>${esc(image.caption)}</p>
        <div class="lesson-shot-meta">${source}<a href="${esc(image.src)}" target="_blank" rel="noopener noreferrer">Открыть крупнее ↗</a></div>
      </figcaption>
    </figure>`;
  }).join('');
}
