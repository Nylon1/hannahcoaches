export const tripTypes = {
  weekend: 'UK resort or weekend trip', airport: 'Airport transfer', golf: 'Golf trip',
  football: 'Football trip', wedding: 'Wedding or celebration', school: 'School transport', other: 'Other journey',
};
const clean = (value, limit = 200) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
const integer = (value, min, max, fallback) => value === '' || value == null || !Number.isFinite(Number(value)) ? fallback : Math.min(max, Math.max(min, Math.round(Number(value))));
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0,10) === value && date.getUTCFullYear() >= 2020 && date.getUTCFullYear() <= 2100;
}
export function normalizePlan(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) raw = {};
  const people = integer(raw.people, 1, 100, 15);
  return {
    title: clean(raw.title, 100), type: Object.hasOwn(tripTypes, raw.type) ? raw.type : 'weekend',
    destination: clean(raw.destination), pickup: clean(raw.pickup),
    date: validDate(raw.date) ? raw.date : '', arrival: /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.arrival || '') ? raw.arrival : '',
    people, confirmed: integer(raw.confirmed, 0, people, 0),
    bags: integer(raw.bags, 0, 200, 0), nights: integer(raw.nights, 0, 30, 0),
    duration: integer(raw.duration, 1, 1440, null), buffer: integer(raw.buffer, 0, 240, 30),
    meetBefore: integer(raw.meetBefore, 5, 120, 15), stops: integer(raw.stops, 0, 360, 0),
    returnTime: clean(raw.returnTime, 100), accessible: raw.accessible === true, children: raw.children === true,
    equipment: raw.equipment === true, cost: raw.cost === '' || raw.cost == null || !Number.isFinite(Number(raw.cost)) ? '' : String(Math.max(0,Math.min(100000,Number(raw.cost)))),
    notes: clean(raw.notes, 1200), done: Array.isArray(raw.done) ? [...new Set(raw.done.filter(id => typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id)))].slice(0,200) : [],
    custom: Array.isArray(raw.custom) ? raw.custom.filter(item => item && /^custom-[a-z0-9-]{1,70}$/.test(item.id) && clean(item.text, 150)).slice(0,30).map(item=>({id:item.id,text:clean(item.text,150)})) : [],
  };
}
const task = (id, text, group, priority = false) => ({id,text,group,priority});
export function makeChecklist(plan) {
  const p = normalizePlan(plan);
  const tasks = [
    task('booking','Confirm your transport booking, agreed price and payment arrangements.','Arrange',true),
    task('route','Agree pickup points, travel timings and the return plan with M Latif.','Arrange',true),
    task('headcount','Confirm the final passenger count with the whole group.','Arrange',true),
    task('luggage','Confirm that passengers, bags and equipment fit the agreed vehicle.','Arrange',true),
    task('meeting','Send everyone the exact meeting point, meeting time and organiser contact.','Prepare',true),
    task('venue','Check venue opening, entry arrangements and any advance reservations.','Prepare'),
    task('forecast','Check the destination weather close to departure and pack accordingly.','Prepare'),
    task('phone','Charge your phone and pack a charger or power bank.','Pack'),
    task('essentials','Pack your usual personal essentials, drinks and any items you rely on.','Pack'),
    task('tickets','Keep tickets, confirmations and useful contact details easy to reach.','Pack'),
    task('count-out','Check everyone is aboard before leaving the pickup point.','Travel day',true),
    task('return-check','Reconfirm the return meeting point and count the group before departure.','Travel day',true),
  ];
  const specific = {
    airport:[task('flight','Check your airline’s current check-in deadline, terminal and flight details.','Arrange',true),task('airport-arrival','Agree an airport arrival time that meets your airline’s requirements.','Arrange',true),task('documents','Check the travel documents and entry requirements that apply to each traveller.','Prepare',true),task('airline-bags','Check airline baggage limits and current airport security guidance.','Pack')],
    golf:[task('tee-time','Confirm the tee time, course address and group booking.','Arrange',true),task('golf-bags','Tell the operator exactly how many golf bags and trolleys are coming.','Arrange',true),task('golf-kit','Pack your clubs, shoes and the clothing required by your course.','Pack')],
    football:[task('fixture','Recheck the fixture time, venue and any match-day travel changes.','Prepare',true),task('stadium','Check stadium entry, bag rules and the agreed coach meeting area.','Prepare'),task('match-ticket','Have each person’s match ticket ready before departure.','Pack')],
    wedding:[task('ceremony','Confirm ceremony time, venues and any transfer between locations.','Arrange',true),task('guest-list','Make sure every travelling guest knows their pickup and return arrangements.','Prepare',true),task('wedding-kit','Pack outfits and occasion essentials where they can travel safely.','Pack')],
    school:[task('school-lead','Agree the responsible school contact and supervision arrangements.','Arrange',true),task('school-policy','Complete the school’s own trip approvals, permissions and required checks.','Prepare',true),task('school-register','Prepare the school’s passenger register and agreed headcount procedure.','Prepare',true)],
    weekend:[task('reservation','Confirm accommodation or attraction reservations and arrival arrangements.','Arrange'),task('day-bag','Pack a small day bag for items you need during the journey.','Pack')],
    other:[],
  };
  tasks.push(...specific[p.type]);
  if (p.accessible) tasks.push(task('access-confirm','Discuss boarding, mobility equipment, assistance and vehicle suitability directly with M Latif.','Arrange',true),task('access-venue','Confirm destination access and any support needed at the venue.','Prepare',true));
  if (p.children && p.type !== 'school') tasks.push(task('children-plan','Agree adult supervision and discuss any child seating needs with the operator.','Arrange',true));
  if (p.equipment) tasks.push(task('extra-equipment','Provide equipment quantities and dimensions, then confirm loading space.','Arrange',true));
  if (p.nights > 0) tasks.push(task('overnight','Pack overnight clothing, toiletries and accommodation details.','Pack'),task('checkout','Confirm checkout, luggage storage and return-day arrangements.','Prepare'));
  tasks.push(...p.custom.map(item=>task(item.id,item.text,'Your extras')));
  const order = ['Arrange','Prepare','Pack','Travel day','Your extras'];
  return tasks.sort((a,b)=>order.indexOf(a.group)-order.indexOf(b.group));
}
export function readiness(plan) {
  const p = normalizePlan(plan), tasks = makeChecklist(p), done = new Set(p.done);
  const completed = tasks.filter(t=>done.has(t.id)).length;
  return {total:tasks.length,completed,percent:Math.round(completed/tasks.length*100),priorities:tasks.filter(t=>t.priority&&!done.has(t.id)),next:tasks.find(t=>!done.has(t.id))};
}
// Treat entered dates/times as local-clock values, not browser timezone conversions.
export function buildSchedule(plan) {
  const p = normalizePlan(plan);
  if (!p.date || !p.arrival || p.duration === null) return [];
  const arrival = Date.parse(`${p.date}T${p.arrival}:00Z`);
  const depart = arrival - (p.duration + p.stops + p.buffer) * 60000;
  return [
    {label:'Group meets',time:depart-p.meetBefore*60000,detail:`${p.meetBefore} minutes before planned departure`},
    {label:'Planned departure',time:depart,detail:`${p.duration} minutes driving + ${p.stops} minutes stops + ${p.buffer} minutes buffer`},
    {label:p.type==='airport'?'Arrive at the airport':'Target arrival',time:arrival,detail:p.destination || 'Your destination'},
  ].map(item=>({...item,date:new Date(item.time).toISOString().slice(0,10),clock:new Date(item.time).toISOString().slice(11,16)}));
}
export function formatDate(date) {
  return validDate(date) ? new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`)) : 'Date to be agreed';
}
export function costBreakdown(plan) {
  const p = normalizePlan(plan);
  if (p.cost === '') return null;
  const totalPence = Math.round(Number(p.cost)*100), low = Math.floor(totalPence/p.people), extra = totalPence%p.people;
  return {totalPence,low,high:low+(extra?1:0),atHigh:extra,atLow:p.people-extra};
}
export const money = pence => new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(pence/100);
export function tripPack(plan, includeChecklist = true) {
  const p=normalizePlan(plan), r=readiness(p), schedule=buildSchedule(p), cost=costBreakdown(p);
  const lines = [p.title || 'Our group trip','HANNAH COACHES UK',`${tripTypes[p.type]} | ${formatDate(p.date)}`,'',`Destination: ${p.destination || 'To be agreed'}`,`Pickup: ${p.pickup || 'To be agreed'}`,`Group: ${p.people} people (${p.confirmed} confirmed)`,`Large bags: ${p.bags} | Nights away: ${p.nights}`,`Return: ${p.returnTime || 'To be agreed'}`,'','DRAFT DAY PLAN'];
  if(schedule.length) schedule.forEach(item=>lines.push(`${formatDate(item.date)}, ${item.clock} | ${item.label} | ${item.detail}`));
  else lines.push('Set a travel date, target arrival time and estimated driving time to prepare a schedule.');
  lines.push('Times use your entered local clock values. This is a planning aid, not live routing or operator-confirmed timings. Confirm with the operator, especially around clock changes.');
  if(cost) lines.push('',`YOUR ENTERED GROUP COST: ${money(cost.totalPence)}`,cost.atHigh?`${cost.atLow} people at ${money(cost.low)} and ${cost.atHigh} at ${money(cost.high)}.`:`${p.people} people at ${money(cost.low)} each.`,'This uses your own figure. It is not a Hannah Coaches quote.');
  if(p.accessible) lines.push('Accessibility requirements: discuss and confirm directly with the operator.');
  if(p.children) lines.push('Children are travelling: supervision and seating arrangements to be confirmed.');
  if(p.equipment) lines.push('Extra equipment: quantities and space to be confirmed.');
  if(p.notes) lines.push('',`Organiser notes: ${p.notes}`);
  if(includeChecklist){lines.push('',`CHECKLIST: ${r.completed} of ${r.total} completed`);let group='';for(const t of makeChecklist(p)){if(t.group!==group){group=t.group;lines.push('',group.toUpperCase());}lines.push(`${p.done.includes(t.id)?'[x]':'[ ]'} ${t.text}`);}}
  lines.push('','TRAVEL CONTACT','M Latif | Licensed transport manager','07971 117677 | safetravel77@outlook.com','A preparation plan does not confirm a booking, availability or vehicle suitability.');
  return lines.join('\n');
}
