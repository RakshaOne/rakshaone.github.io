import assert from 'node:assert/strict';
import { ACHIEVEMENTS, achievementStats, earnedAchievementIds, newlyEarnedAchievements } from '../js/achievements.js';
import { lessons, units } from '../js/curriculum.js';

const progress=new Map();
const summary=()=>({completed:[...progress.values()].filter(row=>['passed','mastered'].includes(row.status)).length,mastered:[...progress.values()].filter(row=>row.status==='mastered').length});
const snapshot=(days=[])=>earnedAchievementIds(achievementStats(progress,days,summary()));
const empty=snapshot();
assert.equal(empty.size,0);
progress.set(lessons[0].id,{status:'passed'});
assert.deepEqual(newlyEarnedAchievements(empty,snapshot()).map(award=>award.id),['first-choice']);
assert.equal(newlyEarnedAchievements(snapshot(),snapshot()).length,0,'existing awards must not toast again');

for(const item of units[0].lessons)progress.set(item.id,{status:'passed'});
const five=snapshot();
assert.ok(five.has('five-steps'));
assert.ok(five.has('safety-foundations'));
assert.ok(!five.has('all-chapters'));

const camera=lessons.filter(item=>item.assessmentId);
const distinct=[...new Map(camera.map(item=>[item.assessmentId,item])).values()].slice(0,3);
for(const item of distinct)progress.set(item.id,{status:'mastered'});
const movement=snapshot();
assert.ok(movement.has('camera-explorer'));
assert.ok(movement.has('movement-mix'));
assert.ok(!movement.has('practice-regular'));

const days=['2026-09-01','2026-09-02','2026-09-03','2026-09-06'].map(activity_date=>({activity_date,lessons_completed:1,practice_count:0}));
const habits=snapshot(days);
assert.ok(habits.has('three-day-rhythm'));
assert.ok(!habits.has('week-of-care'));
assert.equal(new Set(ACHIEVEMENTS.map(award=>award.id)).size,ACHIEVEMENTS.length);
assert.ok(new Set(ACHIEVEMENTS.map(award=>award.category)).size>=3);
console.log('Achievement milestones, history, and unlock transitions passed.');
