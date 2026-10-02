import assert from 'node:assert/strict';
import { heldFor, neutralPoseReady, armsOutReady } from '../js/camera-flow.js';

let hold=heldFor(null,true,1000,3000);
assert.equal(hold.remaining,3000);
hold=heldFor(hold.since,true,2600,3000);
assert.equal(hold.ready,false);
hold=heldFor(hold.since,false,3000,3000);
assert.equal(hold.since,null);
hold=heldFor(hold.since,true,4000,3000);
assert.equal(hold.ready,false);
hold=heldFor(hold.since,true,7000,3000);
assert.equal(hold.ready,true);

const pose=Array.from({length:33},()=>({x:.5,y:.5,visibility:.99}));
pose[11]={x:.4,y:.3,visibility:.99};pose[12]={x:.6,y:.3,visibility:.99};
pose[23]={x:.43,y:.6,visibility:.99};pose[24]={x:.57,y:.6,visibility:.99};
pose[15]={x:.42,y:.58,visibility:.99};pose[16]={x:.58,y:.58,visibility:.99};
assert.equal(neutralPoseReady(pose),true);
const arms=pose.map(point=>({...point}));
arms[15].x=.22;arms[15].y=.32;arms[16].x=.78;arms[16].y=.32;
assert.equal(neutralPoseReady(arms),false);
assert.equal(armsOutReady(arms,pose),true);
arms[16].visibility=.2;
assert.equal(armsOutReady(arms,pose),false);

console.log('Hands-free calibration and assessment hold gates passed.');
