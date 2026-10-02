import assert from 'node:assert/strict';
import { units, lessons } from '../js/curriculum.js';
import { roadmapCurve, renderRoadmapUnit } from '../js/roadmap.js';

const curve=roadmapCurve(5);
assert.equal(curve.points.length,5);
assert.equal(curve.height,540);
assert.equal((curve.d.match(/ C /g)||[]).length,4);
assert.ok(curve.points.every(point=>point.x>20&&point.x<68));
const current=lessons[0];
const page=renderRoadmapUnit(units[0],current,new Map(),lessons,1,units.length);
assert.equal((page.match(/class="path-node /g)||[]).length,5);
assert.ok(page.includes('aria-current="step"'));
assert.ok(page.includes('roadmap-spine'));
assert.ok(page.includes('Checkpoint 1'));
console.log('Smooth roadmap geometry and checkpoint states passed.');
