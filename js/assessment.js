// Pose rules are intentionally conservative: only visible, single-person geometry is scored.
// Coordinates are image-normalized. Each metric is compared to a broad body-relative interval.
const L = { nose:0, leftEar:7, rightEar:8, leftShoulder:11, rightShoulder:12, leftElbow:13, rightElbow:14, leftWrist:15, rightWrist:16, leftHip:23, rightHip:24, leftKnee:25, rightKnee:26, leftAnkle:27, rightAnkle:28 };
export const ASSESSMENTS = {
  ready_stance: { title:'Balanced ready stance', view:'Face the camera with your whole body visible.', kind:'static', target:'Feet comfortably apart, weight centered, shoulders relaxed.', criteria:[
    { id:'width', label:'Stable base', metric:'stanceWidth', range:[0.75,1.8], weight:3, low:'Widen your feet a little.', high:'Bring your feet slightly closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'center', label:'Centered balance', metric:'balance', range:[0,0.42], weight:3, high:'Shift your weight toward the middle of your feet.' },
    { id:'upright', label:'Upright posture', metric:'upright', range:[0,0.42], weight:2, high:'Bring your shoulders above your hips.' }
  ]},
  open_guard: { title:'Open-hand guard', view:'Face the camera. Keep both hands visible.', kind:'static', target:'Open hands near upper chest, elbows relaxed, feet stable.', criteria:[
    { id:'hands', label:'Hand height', metric:'handHeight', range:[-0.12,0.24], weight:3, low:'Lower your hands slightly so you can see clearly.', high:'Raise both hands toward your upper chest.' },
    { id:'elbows', label:'Elbow position', metric:'elbowSpread', range:[0.2,1.2], weight:2, high:'Bring your elbows a little closer to your body.' },
    { id:'base', label:'Stable base', metric:'stanceWidth', range:[0.7,1.9], weight:2, low:'Widen your stance a little.', high:'Bring your feet closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'center', label:'Balance', metric:'balance', range:[0,0.5], weight:2, high:'Keep your weight centered.' }
  ]},
  head_cover: { title:'Protective head cover', view:'Face the camera with both arms visible.', kind:'static', target:'Hands near the sides of your head, elbows forward, feet stable.', criteria:[
    { id:'cover', label:'Head coverage', metric:'earDistance', range:[0,0.95], weight:4, high:'Bring your hands a little nearer the sides of your head.' },
    { id:'base', label:'Stable base', metric:'stanceWidth', range:[0.7,1.9], weight:2, low:'Widen your feet a little.', high:'Bring your feet closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'center', label:'Balance', metric:'balance', range:[0,0.5], weight:2, high:'Keep your weight centered.' }
  ]},
  side_step: { title:'Step toward an open route', view:'Face the camera. Leave room on each side to step.', kind:'dynamic', target:'Start balanced, step sideways with control, then settle into a balanced stance.', movement:'horizontal', criteria:[
    { id:'base', label:'Stable base', metric:'stanceWidth', range:[0.65,2.0], weight:2, low:'Keep a little more width between your feet.', high:'Bring your feet closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'center', label:'Balance', metric:'balance', range:[0,0.7], weight:2, high:'Bring your weight back over your feet.' },
    { id:'travel', label:'Clear step', metric:'travel', range:[0.35,2.8], weight:3, low:'Take one clear side step into your open space.' },
    { id:'recovery', label:'Recovery', metric:'recovery', range:[0,0.6], weight:2, high:'Return to a balanced ready position.' }
  ]},
  guard_step: { title:'Open hands, then move', view:'Face the camera with both hands and feet visible.', kind:'dynamic', target:'Raise open hands, take one side step, and settle with balance.', movement:'horizontal', criteria:[
    { id:'hands', label:'Open-hand position', metric:'handHeight', range:[-0.12,0.24], weight:3, low:'Lower your hands enough to keep a clear view.', high:'Raise your open hands toward your upper chest.' },
    { id:'base', label:'Stable base', metric:'stanceWidth', range:[0.65,2.0], weight:2, low:'Keep a little space between your feet.', high:'Bring your feet slightly closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'travel', label:'Side step', metric:'travel', range:[0.35,2.8], weight:3, low:'Take one clear step toward your open side.' },
    { id:'recovery', label:'Balanced finish', metric:'recovery', range:[0,0.6], weight:2, high:'Settle with your head above your feet.' }
  ]}
};

const mid = (a,b) => ({ x:(a.x+b.x)/2, y:(a.y+b.y)/2 });
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const abs = Math.abs;
export function requiredLandmarks(assessmentId) {
  const common = [11,12,23,24,27,28];
  if (assessmentId === 'open_guard' || assessmentId === 'guard_step') return [...common,13,14,15,16];
  if (assessmentId === 'head_cover') return [...common,7,8,15,16];
  return common;
}
export function visibility(pose, assessmentId) {
  if (!pose) return { ok:false, message:'Step into the frame so your whole body is visible.', quality:0 };
  const ids = requiredLandmarks(assessmentId);
  const quality = Math.round(ids.reduce((sum,i)=>sum+(pose[i]?.visibility ?? 0),0)/ids.length*100);
  const missing = ids.filter(i => !pose[i] || (pose[i].visibility ?? 0) < 0.55);
  if (missing.length) return { ok:false, message:'Move back until your head, hands, hips, and feet are visible in good light.', quality };
  const outer = ids.some(i=>pose[i].x<0.04||pose[i].x>0.96||pose[i].y<0.03||pose[i].y>0.97);
  if (outer) return { ok:false, message:'Move back a little; keep your whole body inside the guide.', quality };
  return { ok:true, message:'Body visible', quality };
}
export function calibrationMetrics(neutral, armsOut, width, height) {
  const s = dist(neutral[11],neutral[12]); const h = dist(neutral[23],neutral[24]);
  const body = abs(mid(neutral[11],neutral[12]).y-mid(neutral[27],neutral[28]).y);
  const arm = (dist(armsOut[11],armsOut[15])+dist(armsOut[12],armsOut[16]))/2;
  return { shoulderWidth:s, hipWidth:h, bodyHeight:body, armLength:arm, aspect:width/height, capturedAt:new Date().toISOString(), schemaVersion:1 };
}
export function smoothPose(previous, current, alpha=0.38) {
  if (!previous) return current;
  return current.map((p,i)=>({ ...p, x:previous[i].x*(1-alpha)+p.x*alpha, y:previous[i].y*(1-alpha)+p.y*alpha, z:previous[i].z*(1-alpha)+p.z*alpha }));
}
export function metrics(p, calibration, session={}) {
  const sw = Math.max(calibration?.shoulderWidth || dist(p[11],p[12]),0.06);
  const shoulders=mid(p[11],p[12]), hips=mid(p[23],p[24]), ankles=mid(p[27],p[28]);
  const center=mid(shoulders,hips);
  const hand=(p[15].y-shoulders.y+p[16].y-shoulders.y)/2/(calibration?.bodyHeight || 0.6);
  const currentX=mid(p[23],p[24]).x;
  const travel=session.originX==null?0:abs(currentX-session.originX)/sw;
  return {
    stanceWidth:abs(p[27].x-p[28].x)/sw,
    footOrder:(p[28].x-p[27].x)*(Math.sign(p[24].x-p[23].x)||Math.sign(p[12].x-p[11].x)||1)/sw,
    balance:abs(hips.x-ankles.x)/sw,
    upright:abs(shoulders.x-hips.x)/sw,
    handHeight:hand,
    elbowSpread:(abs(p[13].x-p[23].x)+abs(p[14].x-p[24].x))/2/sw,
    earDistance:(dist(p[15],p[7])+dist(p[16],p[8]))/2/sw,
    travel:session.peakTravel || travel,
    recovery:session.recovery ?? 1,
    bodyCenter:center
  };
}
export function evaluate(assessmentId, pose, calibration, session={}) {
  const config=ASSESSMENTS[assessmentId];
  const seen=visibility(pose,assessmentId);
  if (!seen.ok) return { valid:false, message:seen.message, quality:seen.quality, criteria:[], score:null, corrections:[] };
  const values=metrics(pose,calibration,session);
  const criteria=config.criteria.map(rule=>{
    const value=values[rule.metric]; const [low,high]=rule.range;
    const span=Math.max(high-low,0.1);
    const miss=value<low?low-value:value>high?value-high:0;
    const score=rule.metric==='footOrder'&&value<=0?0:Math.max(0,Math.round(100-(miss/span)*180));
    return { id:rule.id, label:rule.label, value, score, weight:rule.weight, status:score>=80?'good':score>=55?'adjust':'needs work', correction:miss?value<low?rule.low:rule.high:null };
  });
  const score=Math.round(criteria.reduce((n,c)=>n+c.score*c.weight,0)/criteria.reduce((n,c)=>n+c.weight,0));
  return { valid:true, quality:seen.quality, score, criteria, corrections:criteria.filter(c=>c.correction).sort((a,b)=>a.score-b.score).slice(0,2).map(c=>c.correction), message:score>=80?'Strong alignment. Hold it with easy breathing.':'Adjust one thing at a time.' };
}
export function updateMovement(session, pose, calibration) {
  if (session.originX == null) session.originX=mid(pose[23],pose[24]).x;
  const sw=Math.max(calibration?.shoulderWidth || dist(pose[11],pose[12]),0.06);
  const travel=abs(mid(pose[23],pose[24]).x-session.originX)/sw;
  session.peakTravel=Math.max(session.peakTravel||0,travel);
  if (session.phase==='ready' && travel>0.22) session.phase='move';
  if (session.phase==='move' && session.peakTravel>=0.35) session.phase='settle';
  if (session.phase==='settle') session.recovery=abs(mid(pose[23],pose[24]).x-mid(pose[27],pose[28]).x)/sw;
  return session;
}
