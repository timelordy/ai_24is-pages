'use strict';

(function(){
  const main=document.querySelector('#main');
  if(!main)return;

  const expandedGroups=new Set();
  const mobileSchedule=window.matchMedia('(max-width:640px)');

  function currentPage(){
    const hash=location.hash.slice(1);
    if(/^lesson-\d+$/.test(hash))return 'lesson';
    return ['home','route','schedule','materials','portfolio','help'].includes(hash)?hash:'home';
  }

  function setToggleState(button,expanded){
    const value=String(expanded);
    const text=expanded?'Свернуть':'Показать 7 занятий';
    if(button.getAttribute('aria-expanded')!==value)button.setAttribute('aria-expanded',value);
    if(button.textContent!==text)button.textContent=text;
  }

  function ensureScheduleToggle(card,isSelected){
    const head=card.querySelector('.job-head');
    if(!head)return null;
    let button=head.querySelector('.schedule-collapse-toggle');
    if(isSelected){
      if(button)button.remove();
      return null;
    }
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='secondary-btn schedule-collapse-toggle';
      button.dataset.uiAction='toggle-schedule-group';
      head.appendChild(button);
    }
    return button;
  }

  function decorateSchedule(){
    const groups=[...main.querySelectorAll('[data-testid="schedule-group"]')];
    groups.forEach(card=>{
      card.classList.add('schedule-group-card');
      const tag=card.querySelector('.job-head > .tag.red');
      const isSelected=Boolean(tag);
      card.classList.toggle('is-selected',isSelected);

      const headers=[...card.querySelectorAll('thead th')].map(x=>x.textContent.trim());
      card.querySelectorAll('tbody tr').forEach(row=>{
        [...row.children].forEach((cell,i)=>{
          if(headers[i]&&cell.dataset.label!==headers[i])cell.dataset.label=headers[i];
        });
      });

      const button=ensureScheduleToggle(card,isSelected);
      const shouldCollapse=mobileSchedule.matches&&!isSelected&&!expandedGroups.has(card.dataset.group||'');
      card.classList.toggle('is-collapsed-mobile',shouldCollapse);
      if(button)setToggleState(button,!shouldCollapse);
    });
  }

  function decorateHome(){
    const current=main.querySelector('[data-testid="current-job"]');
    if(current)current.classList.add('job-card--next');
  }

  function decorate(){
    const page=currentPage();
    if(document.body.dataset.page!==page)document.body.dataset.page=page;
    if(page==='schedule')decorateSchedule();
    if(page==='home')decorateHome();
  }

  main.addEventListener('click',event=>{
    const button=event.target.closest('[data-ui-action="toggle-schedule-group"]');
    if(!button)return;
    const card=button.closest('[data-testid="schedule-group"]');
    if(!card)return;
    const groupName=card.dataset.group||'';
    const collapsed=card.classList.toggle('is-collapsed-mobile');
    if(collapsed)expandedGroups.delete(groupName);else expandedGroups.add(groupName);
    setToggleState(button,!collapsed);
  });

  const observer=new MutationObserver(decorate);
  observer.observe(main,{childList:true,subtree:true});
  window.addEventListener('hashchange',decorate);
  mobileSchedule.addEventListener?.('change',decorate);
  decorate();
})();
