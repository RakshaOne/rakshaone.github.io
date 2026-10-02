import assert from 'node:assert/strict';
import { lessons, units } from '../js/curriculum.js';
import { ASSESSMENTS, evaluate, visibility, updateMovement, calibrationMetrics } from '../js/assessment.js';
import { targetPose } from '../js/pose.js';

const base=()=>{
  const p=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:.99}));
  const set=(i,x,y)=>Object.assign(p[i],{x,y});
  set(7,.44,.18);set(8,.56,.18);set(11,.42,.3);set(12,.58,.3);
  set(13,.39,.44);set(14,.61,.44);set(15,.39,.36);set(16,.61,.36);
  set(23,.44,.57);set(24,.56,.57);set(25,.43,.75);set(26,.57,.75);
  set(27,.4,.93);set(28,.6,.93);return p;
};
const p=base(),calibration=calibrationMetrics(p,p,960,720);
assert.equal(units.length,8);
assert.equal(lessons.length,40);
assert.equal(new Set(lessons.map(x=>x.id)).size,40);
const publishedIds={
  foundations:'priority support instinct boundary planning',
  awareness:'scan position route followed transport',
  voice:'boundaries deescalate callhelp online after',
  movement:'ready distance stepback angle run',
  position:'guard head fall rise breath',
  contact:'grip clothing space limits after',
  scenarios:'street party transit school home',
  review:'checkin mix plan uncertainty next'
};
const expectedIds=Object.entries(publishedIds).flatMap(([unit,names])=>names.split(' ').map(name=>unit+'.'+name));
assert.deepEqual(lessons.map(x=>x.id).sort(),expectedIds.sort());
assert.equal(lessons.every(x=>x.blocks.some(b=>b.type==='choice')&&x.blocks.some(b=>b.type==='practice')),true);
assert.equal(lessons.filter(x=>x.assessmentId).length,9);
assert.equal(units[1].id,'movement');
assert.equal(lessons.every(x=>!x.assessmentId||ASSESSMENTS[x.assessmentId]),true);
assert.equal(lessons.find(x=>x.id==='foundations.priority').id,[...lessons].reverse().find(x=>x.id==='foundations.priority').id);
assert.equal(visibility(p,'ready_stance').ok,true);
assert.ok(evaluate('ready_stance',p,calibration).score>=80);
assert.ok(evaluate('open_guard',p,calibration).score>=80);
const mirrored=base().map(point=>({...point,x:1-point.x}));
const mirroredCalibration=calibrationMetrics(mirrored,mirrored,960,720);
assert.ok(evaluate('ready_stance',mirrored,mirroredCalibration).score>=80);
for(const pose of [p,mirrored]){
  const hipOrder=Math.sign(pose[24].x-pose[23].x);
  for(const id of Object.keys(ASSESSMENTS)){
    const guide=targetPose(pose,id,calibration);
    assert.ok((guide[28].x-guide[27].x)*hipOrder>0);
    assert.ok((guide[26].x-guide[25].x)*hipOrder>0);
    if(id==='open_guard'||id==='guard_step'||id==='head_cover')assert.ok((guide[16].x-guide[15].x)*hipOrder>0);
  }
}
const crossed=base();
const leftAnkle=crossed[27].x;
crossed[27].x=crossed[28].x;crossed[28].x=leftAnkle;
for(const id of Object.keys(ASSESSMENTS)){
  const result=evaluate(id,crossed,calibration,{phase:'settle',peakTravel:1,recovery:0});
  assert.ok(result.score<80,`${id} accepted crossed feet`);
  assert.ok(result.corrections.some(cue=>cue.includes('Uncross')));
}
const cover=base();cover[15].x=.42;cover[15].y=.18;cover[16].x=.58;cover[16].y=.18;
assert.ok(evaluate('head_cover',cover,calibration).score>=80);
const narrow=base();narrow[27].x=.49;narrow[28].x=.51;
const narrowResult=evaluate('ready_stance',narrow,calibration);
assert.ok(narrowResult.score<80);
assert.ok(narrowResult.corrections.some(x=>x.includes('Widen')));
const hidden=base();hidden[27].visibility=.1;
assert.equal(evaluate('ready_stance',hidden,calibration).valid,false);
const session={phase:'ready'};updateMovement(session,p,calibration);
const moved=base();for(const i of [11,12,23,24,25,26,27,28])moved[i].x+=.09;
updateMovement(session,moved,calibration);
assert.equal(session.phase,'settle');
assert.ok(evaluate('side_step',moved,calibration,session).score>=80);
assert.ok(evaluate('guard_step',moved,calibration,session).score>=80);
const handsHidden=base();handsHidden[15].visibility=.1;
assert.equal(evaluate('guard_step',handsHidden,calibration,session).valid,false);
console.log('Curriculum, visibility, static rules, dynamic phase, and feedback passed.');
