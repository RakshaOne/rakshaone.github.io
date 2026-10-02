import assert from 'node:assert/strict';
import { lessons } from '../js/curriculum.js';
import { lessonBlocks, savePlace, readPlace, clearPlace, resumeLesson, lessonReward } from '../js/experience.js';

const data = new Map();
globalThis.localStorage = {
  getItem: key => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, String(value)),
  removeItem: key => data.delete(key)
};

const cameraLesson = lessons.find(item => item.assessmentId);
const blocks = lessonBlocks(cameraLesson);
const cameraIndex = blocks.findIndex(block => block.id === 'camera-practice');
assert.equal(blocks[cameraIndex + 1].type, 'choice');
assert.equal(cameraLesson.blocks.some(block => block.id === 'camera-practice'), false);

savePlace('learner-a', cameraLesson, 'camera-practice');
assert.equal(readPlace('learner-a', cameraLesson), cameraIndex);
assert.equal(readPlace('learner-b', cameraLesson), 0);
assert.equal(resumeLesson('learner-a', lessons, new Map()).id, cameraLesson.id);

const completed = new Map([[cameraLesson.id, { status: 'passed' }]]);
assert.notEqual(resumeLesson('learner-a', lessons, completed).id, cameraLesson.id);
clearPlace('learner-a', cameraLesson);
assert.equal(readPlace('learner-a', cameraLesson), 0);
assert.equal(resumeLesson('learner-a', lessons, new Map()).id, lessons[0].id);

savePlace('learner-a', cameraLesson, 'method');
savePlace('learner-a', lessons[0], 'recap');
const oneDone = new Map([[lessons[0].id, { status: 'passed' }], [cameraLesson.id, { status: 'practiced', updated_at: '2026-10-02' }]]);
assert.equal(resumeLesson('learner-a', lessons, oneDone).id, cameraLesson.id);

assert.deepEqual(lessonReward(null, 'passed'), { firstFinish: true, masteryEarned: false, xp: 20 });
assert.deepEqual(lessonReward({ status: 'practiced' }, 'mastered'), { firstFinish: true, masteryEarned: true, xp: 30 });
assert.deepEqual(lessonReward({ status: 'passed', completed_at: '2026-10-01' }, 'mastered'), { firstFinish: false, masteryEarned: true, xp: 10 });
assert.deepEqual(lessonReward({ status: 'mastered', completed_at: '2026-10-01' }, 'mastered'), { firstFinish: false, masteryEarned: false, xp: 0 });

console.log('Lesson position, learner isolation, and camera stage continuity passed.');
