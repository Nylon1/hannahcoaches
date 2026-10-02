import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePlan,validDate,makeChecklist,readiness,buildSchedule,costBreakdown,tripPack} from '../src/trip-engine.js';

test('Early airport arrival rolls departure and meeting into the previous day',()=>{
  const schedule=buildSchedule({type:'airport',date:'2026-10-18',arrival:'02:00',duration:120,buffer:30,stops:15,meetBefore:15});
  assert.deepEqual(schedule.map(({date,clock})=>({date,clock})),[
    {date:'2026-10-17',clock:'23:00'}, {date:'2026-10-17',clock:'23:15'}, {date:'2026-10-18',clock:'02:00'},
  ]);
});
test('Month and leap-year boundaries retain correct calendar dates',()=>{
  const base={arrival:'01:00',duration:120,buffer:0,stops:0,meetBefore:15};
  assert.equal(buildSchedule({...base,date:'2028-03-01'})[0].date,'2028-02-29');
  assert.equal(buildSchedule({...base,date:'2027-03-01'})[0].date,'2027-02-28');
  assert.equal(validDate('2027-02-29'),false);
  assert.equal(validDate('2026-02-31'),false);
  assert.deepEqual(buildSchedule({...base,date:'2026-10-18',duration:null}),[]);
});
test('Cost splitting conserves every penny, including tiny and zero totals',()=>{
  for(const [cost,people] of [['100',3],['0.01',25],['0',17],['345.67',21]]){
    const split=costBreakdown({cost,people});
    assert.equal(split.low*split.atLow+split.high*split.atHigh,Math.round(Number(cost)*100));
    assert.equal(split.atLow+split.atHigh,people);
    assert.ok(split.high-split.low<=1);
  }
  assert.equal(costBreakdown({cost:''}),null);
});
test('Checklist adapts without counting irrelevant completed items',()=>{
  const golf={type:'golf',accessible:true,nights:2,children:true,equipment:true};
  const tasks=makeChecklist(golf);
  for(const id of ['tee-time','golf-bags','access-confirm','overnight','children-plan','extra-equipment'])assert.ok(tasks.some(t=>t.id===id));
  assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
  const complete=readiness({...golf,done:tasks.map(t=>t.id)});
  assert.equal(complete.percent,100);
  assert.equal(complete.priorities.length,0);
  assert.equal(readiness({type:'airport',done:['tee-time','golf-bags']}).completed,0);
  assert.ok(makeChecklist({type:'school',children:true}).some(t=>t.id==='school-policy'));
});
test('Stored data is bounded and malformed fields cannot break the planner',()=>{
  assert.equal(normalizePlan(null).people,15);
  const p=normalizePlan({people:0,confirmed:500,bags:-1,type:'__proto__',date:'invalid',duration:'oops',done:['<script>','booking'],custom:[{id:'bad',text:'test'}]});
  assert.equal(p.people,1);assert.equal(p.confirmed,1);assert.equal(p.bags,0);
  assert.equal(p.type,'weekend');assert.equal(p.duration,null);assert.equal(p.date,'');
  assert.deepEqual(p.done,['booking']);assert.deepEqual(p.custom,[]);
});
test('Group plan omits checklist while full pack includes custom tasks and draft status',()=>{
  const plan={title:'Golf day',custom:[{id:'custom-123',text:'Bring the cake'}],done:['custom-123']};
  assert.match(tripPack(plan),/\[x\] Bring the cake/);
  assert.doesNotMatch(tripPack(plan,false),/Bring the cake/);
  assert.match(tripPack(plan,false),/DRAFT DAY PLAN/);
  assert.match(tripPack(plan),/does not confirm a booking/);
  assert.ok(!tripPack(plan).includes('\u2014'));
});
