import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { lessons, units } from '../js/curriculum.js';
import { ASSESSMENTS, evaluate, visibility, updateMovement, calibrationMetrics } from '../js/assessment.js';
import { MOTION_GUIDES, motionFrame } from '../js/motion-guides.js';
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
assert.equal(lessons.filter(x=>x.assessmentId).length,15);
assert.ok(new Set(lessons.filter(x=>x.assessmentId).map(x=>x.assessmentId)).size>=8);
assert.equal(units[1].id,'movement');
assert.equal(lessons.every(x=>!x.assessmentId||ASSESSMENTS[x.assessmentId]),true);
assert.deepEqual(Object.keys(MOTION_GUIDES).sort(),Object.keys(ASSESSMENTS).sort());
for(const [id,stages] of Object.entries(MOTION_GUIDES)){
  assert.equal(stages.length,3);
  for(let i=0;i<3;i++)assert.ok(existsSync(fileURLToPath(new URL('../'+motionFrame(id,i).slice(2),import.meta.url))),`Missing guide image ${id} stage ${i+1}`);
}
assert.equal(lessons.find(x=>x.id==='foundations.priority').id,[...lessons].reverse().find(x=>x.id==='foundations.priority').id);
assert.equal(visibility(p,'ready_stance').ok,true);
assert.ok(evaluate('ready_stance',p,calibration).score>=80);
assert.ok(evaluate('open_guard',p,calibration).score>=80);
const oneGuardHand=base();oneGuardHand[16].y=.56;
assert.equal(evaluate('open_guard',oneGuardHand,calibration).passed,false,'both hands must be in the guard');
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
  assert.ok(result.corrections.some(cue=>/uncross/i.test(cue)));
}
const cover=base();cover[15].x=.42;cover[15].y=.18;cover[16].x=.58;cover[16].y=.18;
assert.ok(evaluate('head_cover',cover,calibration).score>=80);
const narrow=base();narrow[27].x=.49;narrow[28].x=.51;
const narrowResult=evaluate('ready_stance',narrow,calibration);
assert.ok(narrowResult.score<80);
assert.ok(narrowResult.corrections.some(x=>x.includes('Widen')));
const marginal=base();marginal[27].x=.44;marginal[28].x=.56;
assert.ok(evaluate('ready_stance',marginal,calibration).score<100,'marginal form should not receive a perfect score');
const hidden=base();hidden[27].visibility=.1;
assert.equal(evaluate('ready_stance',hidden,calibration).valid,false);
const session={phase:'ready'};
updateMovement(session,p,calibration,'side_step',0);
updateMovement(session,p,calibration,'side_step',1300);
assert.equal(session.phase,'move');
assert.equal(evaluate('side_step',p,calibration,session).passed,false);
const moved=base();for(const i of [11,12,23,24,25,26,27,28])moved[i].x+=.09;
updateMovement(session,moved,calibration,'side_step',1400);
assert.equal(session.phase,'settle');
updateMovement(session,moved,calibration,'side_step',2000);
assert.equal(evaluate('side_step',moved,calibration,session).passed,true);
assert.equal(evaluate('guard_step',moved,calibration,session).passed,true);
const raisedStart=base();raisedStart[15].y=.56;raisedStart[16].y=.56;
const raisedSession={phase:'ready'};
updateMovement(raisedSession,raisedStart,calibration,'boundary_raise',0);
updateMovement(raisedSession,raisedStart,calibration,'boundary_raise',1300);
assert.equal(raisedSession.phase,'gesture');
assert.equal(evaluate('boundary_raise',raisedStart,calibration,raisedSession).passed,false);
assert.ok(evaluate('boundary_raise',raisedStart,calibration,raisedSession).score<80,'unfinished sequence cannot look like a high score');
updateMovement(raisedSession,p,calibration,'boundary_raise',1400);
assert.equal(raisedSession.phase,'step');
assert.equal(evaluate('boundary_raise',p,calibration,raisedSession).passed,false);
const boundaryFinish=base();for(const point of boundaryFinish)point.x+=.075;
updateMovement(raisedSession,boundaryFinish,calibration,'boundary_raise',1500);
updateMovement(raisedSession,boundaryFinish,calibration,'boundary_raise',2100);
assert.equal(raisedSession.phase,'settle');
assert.equal(evaluate('boundary_raise',boundaryFinish,calibration,raisedSession).passed,true);
const oneHand=base();oneHand[16].y=.56;
updateMovement(raisedSession,oneHand,calibration,'boundary_raise',1500);
assert.equal(evaluate('boundary_raise',oneHand,calibration,raisedSession).passed,false);
const backSession={phase:'ready'};
updateMovement(backSession,p,calibration,'retreat_step',0);
updateMovement(backSession,p,calibration,'retreat_step',1300);
assert.equal(evaluate('retreat_step',p,calibration,backSession).passed,false);
assert.ok(evaluate('retreat_step',p,calibration,backSession).score<80,'standing still cannot look like a near-perfect retreat');
const crouch=base();for(const i of [11,12])crouch[i].y+=.07;for(const i of [23,24])crouch[i].y+=.04;
updateMovement(backSession,crouch,calibration,'retreat_step',1400);
assert.equal(backSession.phase,'move','bending in place must not count as stepping back');
const back=base();for(const point of back){point.x=.5+(point.x-.5)*.93;point.y=.2+(point.y-.2)*.93}
for(const time of [1500,1600,1700,1800])updateMovement(backSession,back,calibration,'retreat_step',time);
assert.equal(backSession.phase,'settle');
updateMovement(backSession,back,calibration,'retreat_step',2400);
assert.equal(evaluate('retreat_step',back,calibration,backSession).passed,true);
const highCamera=base();for(const point of highCamera){point.x=.5+(point.x-.5)*.93;point.y=1.5+(point.y-1.5)*.93}
const highCameraSession={phase:'ready'};updateMovement(highCameraSession,p,calibration,'retreat_step',0);updateMovement(highCameraSession,p,calibration,'retreat_step',1300);
updateMovement(highCameraSession,highCamera,calibration,'retreat_step',1400);updateMovement(highCameraSession,highCamera,calibration,'retreat_step',2000);
assert.equal(evaluate('retreat_step',highCamera,calibration,highCameraSession).passed,true,'camera angle must not require ankles to rise');
const bent=base();for(const i of [11,12])bent[i].y+=.07;for(const i of [23,24])bent[i].y+=.04;
const bendSession={phase:'ready'};updateMovement(bendSession,p,calibration,'retreat_step',0);updateMovement(bendSession,p,calibration,'retreat_step',1300);
updateMovement(bendSession,bent,calibration,'retreat_step',1400);
assert.equal(evaluate('retreat_step',bent,calibration,bendSession).passed,false,'crouching in place cannot count as retreat');
assert.ok(evaluate('retreat_step',bent,calibration,bendSession).score<80);
const footLift=base();footLift[27].y-=.06;
const liftSession={phase:'ready'};updateMovement(liftSession,p,calibration,'retreat_step',0);updateMovement(liftSession,p,calibration,'retreat_step',1300);
updateMovement(liftSession,footLift,calibration,'retreat_step',1400);
assert.equal(liftSession.phase,'move','moving only one foot must not count as a retreat');
const turnSession={phase:'ready'};
updateMovement(turnSession,p,calibration,'exit_turn',0);
updateMovement(turnSession,p,calibration,'exit_turn',1300);
assert.equal(evaluate('exit_turn',p,calibration,turnSession).passed,false);
const turned=base();turned[11].x=.45;turned[12].x=.55;
updateMovement(turnSession,turned,calibration,'exit_turn',1400);
assert.equal(turnSession.phase,'step');
const turnFinish=turned.map(point=>({...point,x:point.x+.075}));
updateMovement(turnSession,turnFinish,calibration,'exit_turn',1500);
assert.equal(turnSession.phase,'settle');
updateMovement(turnSession,turnFinish,calibration,'exit_turn',2100);
assert.equal(evaluate('exit_turn',turnFinish,calibration,turnSession).passed,true);
const coverSession={phase:'ready'};
updateMovement(coverSession,raisedStart,calibration,'cover_raise',0);
updateMovement(coverSession,raisedStart,calibration,'cover_raise',1300);
updateMovement(coverSession,cover,calibration,'cover_raise',1400);
assert.equal(coverSession.phase,'step');
const coverFinish=cover.map(point=>({...point,x:point.x+.075}));
updateMovement(coverSession,coverFinish,calibration,'cover_raise',1500);
updateMovement(coverSession,coverFinish,calibration,'cover_raise',2100);
assert.equal(coverSession.phase,'settle');
assert.equal(evaluate('cover_raise',coverFinish,calibration,coverSession).passed,true);
const handsHidden=base();handsHidden[15].visibility=.1;
assert.equal(evaluate('guard_step',handsHidden,calibration,session).valid,false);
console.log('Curriculum, visibility, static rules, dynamic phase, and feedback passed.');
