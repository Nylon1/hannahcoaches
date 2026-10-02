import { normalizePlan, makeChecklist, readiness, buildSchedule, costBreakdown, money, formatDate, tripPack, tripTypes } from './trip-engine.js';

const app = document.querySelector('#prep-app');
if (app) {
  const key = 'hannah-trip-companion-v1';
  const $ = selector => app.querySelector(selector);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const detailForm = $('#prep-details'), timingForm = $('#prep-timings');
  const saveToggle = $('#prep-save');
  if ('IntersectionObserver' in window) {
    const toolVisibility = new IntersectionObserver(([entry]) => document.body.classList.toggle('preparing-trip',entry.isIntersecting));
    toolVisibility.observe(document.querySelector('#trip-tool'));
  }
  let plan = normalizePlan(), filter = 'all', saved = false, removed;
  try {
    const text = localStorage.getItem(key);
    if (text && text.length < 60000) {
      const stored = JSON.parse(text);
      if (stored.version === 1 && stored.plan && typeof stored.plan === 'object') {
        plan = normalizePlan(stored.plan);
        saved = true;
        saveToggle.checked = true;
        $('#prep-save-status').textContent = 'Your saved trip has been restored on this device. Nothing is sent to Hannah Coaches.';
      }
    }
  } catch {
    $('#prep-save-status').textContent = 'Your saved trip could not be loaded. You can still plan in this tab and download a trip pack.';
  }
  function fillForms() {
    for (const form of [detailForm,timingForm]) for (const field of form.elements) {
      if (!field.name || !(field.name in plan)) continue;
      if (field.type === 'checkbox') field.checked = plan[field.name];
      else field.value = plan[field.name] ?? '';
    }
    $('#prep-confirmed').max = plan.people;
  }
  function persist() {
    if (!saved) return;
    try {
      localStorage.setItem(key, JSON.stringify({version:1,plan}));
      $('#prep-save-status').textContent = 'Saved on this device only. This browser’s users can access the plan. Nothing is sent to Hannah Coaches.';
    } catch {
      saved = false;
      saveToggle.checked = false;
      $('#prep-save-status').textContent = 'Saving is unavailable or storage is full. Keep this tab open and download your trip pack to keep a copy.';
    }
  }
  saveToggle.addEventListener('change', () => {
    saved = saveToggle.checked;
    if (saved) persist();
    else {
      try { localStorage.removeItem(key); $('#prep-save-status').textContent = 'Saved copy removed. The current plan stays in this tab until you leave.'; }
      catch { $('#prep-save-status').textContent = 'Saving is off, but the old saved copy could not be removed. Clear this site’s data in your browser settings to remove it.'; }
    }
  });

  function validForms() {
    for (const [form,tab] of [[detailForm,'details'],[timingForm,'schedule']]) {
      if (!form.checkValidity()) { activateTab(tab, false); form.reportValidity(); return false; }
    }
    return true;
  }
  function readForm(form) {
    const next = {...plan};
    for (const field of form.elements) if (field.name) next[field.name] = field.type === 'checkbox' ? field.checked : field.value;
    if (form === detailForm && Number(next.people) > 0 && Number(next.people) <= 100) {
      $('#prep-confirmed').max = next.people;
      if (Number(next.confirmed) > Number(next.people)) { next.confirmed = next.people; $('#prep-confirmed').value = next.people; }
    }
    const error = form === detailForm ? $('#prep-details-error') : $('#prep-timings-error');
    if (!form.checkValidity()) {
      error.textContent = 'Please check the highlighted or incomplete values. Your last valid plan is kept until these are corrected.';
      return;
    }
    error.textContent = '';
    plan = normalizePlan(next);
    render();
    persist();
  }
  [detailForm,timingForm].forEach(form => {
    form.addEventListener('input', () => readForm(form));
    form.addEventListener('change', () => readForm(form));
  });
  detailForm.addEventListener('submit', event => { event.preventDefault(); if (validForms()) activateTab('checklist'); });
  timingForm.addEventListener('submit', event => { event.preventDefault(); if (validForms()) render(); });

  const tabs = [...app.querySelectorAll('[data-prep-tab]')];
  function activateTab(name, focus = true) {
    tabs.forEach(tab => {
      const active = tab.dataset.prepTab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      if (active && focus) tab.focus({preventScroll:true});
    });
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => { if(validForms()) activateTab(tab.dataset.prepTab); });
    tab.addEventListener('keydown', event => {
      const indices = {ArrowRight:(index+1)%tabs.length,ArrowLeft:(index-1+tabs.length)%tabs.length,Home:0,End:tabs.length-1};
      if(Object.hasOwn(indices,event.key)){event.preventDefault();if(validForms())activateTab(tabs[indices[event.key]].dataset.prepTab);}
    });
  });
  $('#prep-go-checklist').addEventListener('click',()=>{if(validForms()){activateTab('checklist');$('#prep-tab-checklist').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}});

  function renderChecklist() {
    const tasks = makeChecklist(plan).filter(t=>filter==='todo'?!plan.done.includes(t.id):filter==='priority'?t.priority&&!plan.done.includes(t.id):true);
    const groups = [...new Set(tasks.map(t=>t.group))];
    $('#prep-checklist').innerHTML = tasks.length ? groups.map(group=>`<fieldset class="prep-task-group"><legend>${escape(group)}<span>${tasks.filter(t=>t.group===group).length}</span></legend>${tasks.filter(t=>t.group===group).map(t=>`<div class="prep-task ${plan.done.includes(t.id)?'is-done':''}"><label><input type="checkbox" data-task="${t.id}" ${plan.done.includes(t.id)?'checked':''}><span>${escape(t.text)}${t.priority?'<small>Key arrangement</small>':''}</span></label>${t.id.startsWith('custom-')?`<button type="button" class="prep-remove" data-remove="${t.id}" aria-label="Remove reminder: ${escape(t.text)}">×</button>`:''}</div>`).join('')}</fieldset>`).join('') : `<div class="prep-empty"><span aria-hidden="true">✓</span><h4>${filter==='priority'?'Key arrangements checked.':'Everything in this view is done.'}</h4><p>Your progress is recorded. Revisit the details if plans change.</p></div>`;
  }
  $('#prep-checklist').addEventListener('change', event => {
    const id=event.target.dataset.task;
    if(!id)return;
    const done=new Set(plan.done);event.target.checked?done.add(id):done.delete(id);plan.done=[...done];
    const wasFiltered = filter !== 'all';
    render();persist();
    const next=$(`[data-task="${id}"]`);
    if(next)next.focus({preventScroll:true});
    else if(wasFiltered)app.querySelector(`[data-task-filter="${filter}"]`).focus({preventScroll:true});
  });
  $('#prep-checklist').addEventListener('click', event => {
    const id=event.target.closest('[data-remove]')?.dataset.remove;
    if(!id)return;
    removed={item:plan.custom.find(t=>t.id===id),done:plan.done.includes(id)};
    plan.custom=plan.custom.filter(t=>t.id!==id);plan.done=plan.done.filter(t=>t!==id);
    render();persist();
    $('#prep-custom-status').replaceChildren(document.createTextNode('Reminder removed. '));
    const undo=document.createElement('button');undo.type='button';undo.className='prep-text-button';undo.textContent='Undo';
    undo.addEventListener('click',()=>{if(removed&&plan.custom.length<30){plan.custom.push(removed.item);if(removed.done)plan.done.push(removed.item.id);removed=null;render();persist();$('#prep-custom-status').textContent='Reminder restored.';}});
    $('#prep-custom-status').append(undo);undo.focus({preventScroll:true});
  });
  app.querySelectorAll('[data-task-filter]').forEach(button=>button.addEventListener('click',()=>{
    filter=button.dataset.taskFilter;app.querySelectorAll('[data-task-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderChecklist();
  }));
  $('#prep-custom-form').addEventListener('submit',event=>{
    event.preventDefault();const text=$('#prep-custom-text').value.trim();
    if(!text){$('#prep-custom-status').textContent='Enter a reminder first.';return;}
    if(plan.custom.length>=30){$('#prep-custom-status').textContent='You can add up to 30 custom reminders. Remove one before adding another.';return;}
    plan.custom.push({id:`custom-${crypto.randomUUID()}`,text:text.slice(0,150)});
    $('#prep-custom-text').value='';filter='all';app.querySelectorAll('[data-task-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.taskFilter==='all')));
    render();persist();$('#prep-custom-status').textContent='Reminder added to Your extras.';$('#prep-custom-text').focus();
  });

  function render() {
    const r=readiness(plan), schedule=buildSchedule(plan), cost=costBreakdown(plan);
    $('#prep-percent').textContent=`${r.percent}%`;$('#prep-ring').style.setProperty('--progress',`${r.percent}%`);
    $('#prep-summary-title').textContent=plan.title||'Your next good journey';
    $('#prep-summary-route').textContent=`${plan.destination||'Destination to be agreed'} · ${formatDate(plan.date)}`;
    $('#prep-summary-people').textContent=plan.people;$('#prep-summary-done').textContent=r.completed;$('#prep-summary-left').textContent=r.total-r.completed;
    $('#prep-tab-count').textContent=`${r.completed}/${r.total}`;
    $('#prep-next-task').textContent=r.next?.text||'Your checklist is complete. Keep your arrangements up to date if anything changes.';
    const unconfirmed=plan.people-plan.confirmed, capacity=[15,17,21,25].find(n=>n>=plan.people);
    $('#prep-logistics').innerHTML=`<h4>Keep an eye on</h4><p><strong>${unconfirmed}</strong> passenger${unconfirmed===1?'':'s'} still to confirm.</p><p><strong>${r.priorities.length}</strong> key arrangement${r.priorities.length===1?'':'s'} left to check.</p><p>${plan.accessible?'Discuss accessible vehicle suitability and seating with M Latif.':capacity?`A ${capacity}-seater is a seating starting point. Confirm luggage space and suitability with us.`:'Your group exceeds our largest stated 25-seater. Contact us to discuss whether we can accommodate your plans.'}</p>${plan.bags||plan.equipment?'<p>Confirm space for bags and equipment before booking.</p>':''}`;
    $('#prep-timeline').innerHTML=schedule.length?`<h4>Your draft day plan</h4><ol class="prep-timeline">${schedule.map(item=>`<li><div><strong>${item.clock}</strong><span>${formatDate(item.date)}</span></div><div><h5>${item.label}</h5><p>${escape(item.detail)}</p></div></li>`).join('')}</ol><p class="prep-help">Local clock times as entered. Check the date on early starts. Confirm timings with your operator, especially around clock changes.</p>`:'<div class="prep-empty"><span aria-hidden="true">◷</span><h4>Let’s put the day in order.</h4><p>Add a travel date in Your trip, then a target arrival time and driving estimate above.</p></div>';
    $('#prep-cost-result').innerHTML=cost?`<div class="prep-cost-card"><div><span>YOUR ENTERED GROUP COST</span><strong>${money(cost.totalPence)}</strong></div><p>${cost.atHigh?`${cost.atLow} people pay <strong>${money(cost.low)}</strong> and ${cost.atHigh} pay <strong>${money(cost.high)}</strong>.`:`${plan.people} people pay <strong>${money(cost.low)}</strong> each.`}</p><small>A split of the figure you entered, not a transport quote.</small></div>`:'';
    $('#prep-pack-preview').textContent=tripPack(plan);
    const params=new URLSearchParams({service:tripTypes[plan.type],passengers:String(plan.people),destination:plan.destination});
    if(plan.accessible)params.set('accessible','yes');
    params.set('topics', `Large bags: ${plan.bags}; nights away: ${plan.nights}; return: ${plan.returnTime || 'to be agreed'}${plan.equipment ? '; bulky equipment to discuss' : ''}${plan.children ? '; children travelling' : ''}`);
    if(plan.pickup)params.set('pickup',plan.pickup);if(plan.date)params.set('date',plan.date);
    $('#prep-enquire').href=`${app.dataset.contact}?${params}`;
    renderChecklist();
  }
  $('#prep-enquire').addEventListener('click',event=>{if(!validForms())event.preventDefault();});
  $('#prep-download').addEventListener('click',()=>{
    if(!validForms())return;
    const blob=new Blob([tripPack(plan)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`hannah-trip-${plan.date||'plan'}.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('#prep-export-status').textContent='Your trip pack download is ready. Keep it somewhere you can access on the day.';
  });
  $('#prep-copy').addEventListener('click',async()=>{
    if(!validForms())return;
    const text=tripPack(plan,false);
    try{await navigator.clipboard.writeText(text);$('#prep-export-status').textContent='Group day plan copied. Review it, then paste it into your own message to the group.';}
    catch{$('#prep-pack-preview').textContent=text;$('#prep-export-status').textContent='Copying is unavailable. Select and copy the group plan below.';$('#prep-pack-preview').focus();}
  });
  $('#prep-print').addEventListener('click',()=>{
    if(!validForms())return;
    document.querySelector('#prep-print-sheet').textContent=tripPack(plan);
    document.body.classList.add('printing-trip');window.print();
  });
  addEventListener('afterprint',()=>document.body.classList.remove('printing-trip'));
  const resetDialog=$('#prep-reset-dialog');
  $('#prep-reset').addEventListener('click',()=>resetDialog.showModal());
  $('#prep-reset-cancel').addEventListener('click',()=>resetDialog.close());
  $('#prep-reset-confirm').addEventListener('click',()=>{
    plan=normalizePlan();filter='all';removed=null;
    app.querySelectorAll('[data-task-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.taskFilter==='all')));
    $('#prep-custom-status').textContent='';$('#prep-custom-text').value='';$('#prep-details-error').textContent='';$('#prep-timings-error').textContent='';
    $('#prep-export-status').textContent='';document.querySelector('#prep-print-sheet').textContent='';
    fillForms();render();persist();resetDialog.close();activateTab('details');
  });
  fillForms();render();
}
