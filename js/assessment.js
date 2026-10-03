// Pose rules are intentionally conservative: only visible, single-person geometry is scored.
// Coordinates are image-normalized. Each metric is compared to a broad body-relative interval.
const L = { nose:0, leftEar:7, rightEar:8, leftShoulder:11, rightShoulder:12, leftElbow:13, rightElbow:14, leftWrist:15, rightWrist:16, leftHip:23, rightHip:24, leftKnee:25, rightKnee:26, leftAnkle:27, rightAnkle:28 };
export const ASSESSMENTS = {
  ready_stance: { title:'Balanced ready stance', view:'Face the camera with your whole body visible.', kind:'static', required:['width','feet','center'], target:'Feet comfortably apart, weight centered, shoulders relaxed.', criteria:[
    { id:'width', label:'Stable base', metric:'stanceWidth', range:[0.75,1.8], weight:3, low:'Widen your feet a little.', high:'Bring your feet slightly closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'center', label:'Centered balance', metric:'balance', range:[0,0.42], weight:3, high:'Shift your weight toward the middle of your feet.' },
    { id:'upright', label:'Upright posture', metric:'upright', range:[0,0.42], weight:2, high:'Bring your shoulders above your hips.' }
  ]},
  open_guard: { title:'Open-hand guard', view:'Face the camera. Keep both hands visible.', kind:'static', required:['hands','base','feet'], target:'Open hands near upper chest, elbows relaxed, feet stable.', criteria:[
    { id:'hands', label:'Hand height', metric:'handHeight', range:[-0.12,0.24], weight:3, low:'Lower your hands slightly so you can see clearly.', high:'Raise both hands toward your upper chest.' },
    { id:'elbows', label:'Elbow position', metric:'elbowSpread', range:[0.2,1.2], weight:2, high:'Bring your elbows a little closer to your body.' },
    { id:'base', label:'Stable base', metric:'stanceWidth', range:[0.7,1.9], weight:2, low:'Widen your stance a little.', high:'Bring your feet closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'center', label:'Balance', metric:'balance', range:[0,0.5], weight:2, high:'Keep your weight centered.' }
  ]},
  head_cover: { title:'Protective head cover', view:'Face the camera with both arms visible.', kind:'static', required:['cover','base','feet'], target:'Hands near the sides of your head, elbows forward, feet stable.', criteria:[
    { id:'cover', label:'Head coverage', metric:'earDistance', range:[0,0.95], weight:4, high:'Bring your hands a little nearer the sides of your head.' },
    { id:'base', label:'Stable base', metric:'stanceWidth', range:[0.7,1.9], weight:2, low:'Widen your feet a little.', high:'Bring your feet closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'center', label:'Balance', metric:'balance', range:[0,0.5], weight:2, high:'Keep your weight centered.' }
  ]},
  side_step: { title:'Step toward an open route', view:'Face the camera. Leave room on each side to step.', kind:'dynamic', required:['travel','feet','recovery'], target:'Start balanced, step sideways with control, then settle into a balanced stance.', movement:'horizontal', moveCue:'Take one clear side step into open space.', criteria:[
    { id:'base', label:'Stable base', metric:'stanceWidth', range:[0.65,2.0], weight:2, low:'Keep a little more width between your feet.', high:'Bring your feet closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'center', label:'Balance', metric:'balance', range:[0,0.7], weight:2, high:'Bring your weight back over your feet.' },
    { id:'travel', label:'Clear step', metric:'travel', range:[0.35,2.8], weight:3, low:'Take one clear side step into your open space.' },
    { id:'recovery', label:'Recovery', metric:'recovery', range:[0,0.6], weight:2, high:'Return to a balanced ready position.' }
  ]},
  guard_step: { title:'Open hands, then move', view:'Face the camera with both hands and feet visible.', kind:'dynamic', required:['hands','travel','feet'], target:'Raise open hands, take one side step, and settle with balance.', movement:'horizontal', moveCue:'Show open hands and take one side step.', criteria:[
    { id:'hands', label:'Open-hand position', metric:'handHeight', range:[-0.12,0.24], weight:3, low:'Lower your hands enough to keep a clear view.', high:'Raise your open hands toward your upper chest.' },
    { id:'base', label:'Stable base', metric:'stanceWidth', range:[0.65,2.0], weight:2, low:'Keep a little space between your feet.', high:'Bring your feet slightly closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' },
    { id:'travel', label:'Side step', metric:'travel', range:[0.35,2.8], weight:3, low:'Take one clear step toward your open side.' },
    { id:'recovery', label:'Balanced finish', metric:'recovery', range:[0,0.6], weight:2, high:'Settle with your head above your feet.' }
  ]},
  boundary_raise: { title:'Set a boundary and leave', view:'Face the camera with room to step sideways.', kind:'dynamic', required:['lift','hands','travel','feet'], movement:'boundary_exit', moveCue:'Raise both open hands below eye level.', stepCue:'Keep your hands up and take one side step toward your open route.', target:'Start with relaxed arms, raise open hands, then step away with balance.', criteria:[
    { id:'lift', label:'Hands raised', metric:'handLift', range:[0.2,0.7], weight:4, low:'Start with your hands down, then raise them clearly.' },
    { id:'hands', label:'Clear view', metric:'handHeight', range:[-0.12,0.24], weight:3, low:'Lower your hands below your eyes.', high:'Raise your hands toward your upper chest.' },
    { id:'travel', label:'Exit step', metric:'travel', range:[0.28,2.8], weight:4, low:'Keep your hands up and take one side step toward open space.' },
    { id:'base', label:'Stable feet', metric:'stanceWidth', range:[0.7,1.9], weight:2, low:'Keep a little room between your feet.', high:'Bring your feet a little closer.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' }
  ]},
  retreat_step: { title:'Step back into space', view:'Face the camera with clear space behind you.', kind:'dynamic', required:['depth','ankles','feet'], movement:'back', moveCue:'Take one controlled step away; move both feet and stay upright.', target:'Stand still first, then step back until both feet have moved away and you are balanced.', criteria:[
    { id:'depth', label:'Step away', metric:'depthChange', range:[0.045,0.35], weight:4, low:'Take one clear step backward into safe space.' },
    { id:'ankles', label:'Both feet moved', metric:'ankleRise', range:[0.025,0.28], weight:4, low:'Move both feet back rather than bending in place.' },
    { id:'upright', label:'Stay upright', metric:'upright', range:[0,0.55], weight:2, high:'Keep your head over your hips.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' }
  ]},
  exit_turn: { title:'Turn and leave', view:'Face the camera first, with room to step sideways.', kind:'dynamic', required:['turn','travel','feet'], movement:'turn', moveCue:'Turn your shoulders partway toward your imagined exit.', stepCue:'Now take one side step toward that open route.', target:'Turn partway toward an imagined exit, then take one step into open space.', criteria:[
    { id:'turn', label:'Visible turn', metric:'turnAmount', range:[0.18,0.65], weight:5, low:'Turn your shoulders a little more toward the open side.', high:'Keep a partial turn so the camera can still see you.' },
    { id:'travel', label:'Exit step', metric:'travel', range:[0.28,2.8], weight:4, low:'Take one step toward your open route after turning.' },
    { id:'upright', label:'Balanced posture', metric:'upright', range:[0,0.7], weight:2, high:'Keep your shoulders over your hips.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.05,3], weight:3, low:'Keep your feet uncrossed as you turn.' }
  ]},
  cover_raise: { title:'Cover and move away', view:'Face the camera with room to step sideways.', kind:'dynamic', required:['lift','cover','travel','feet'], movement:'cover_exit', moveCue:'Bring both hands beside your head.', stepCue:'Keep the cover and take one side step toward open space.', target:'Bring both hands beside your head, then move sideways while keeping your view clear.', criteria:[
    { id:'lift', label:'Cover raised', metric:'handLift', range:[0.27,0.85], weight:3, low:'Start with relaxed arms, then lift both hands.' },
    { id:'cover', label:'Hands beside head', metric:'earDistance', range:[0,0.95], weight:4, high:'Bring your hands nearer the sides of your head.' },
    { id:'travel', label:'Move toward space', metric:'travel', range:[0.28,2.8], weight:4, low:'Keep your cover and take one side step away.' },
    { id:'feet', label:'Feet uncrossed', metric:'footOrder', range:[0.15,3], weight:3, low:'Uncross your feet so each stays on its own side.' }
  ]}
};

const mid = (a,b) => ({ x:(a.x+b.x)/2, y:(a.y+b.y)/2 });
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const abs = Math.abs;
const idealRanges={
  stanceWidth:[0.95,1.5],footOrder:[0.45,2],balance:[0,0.25],upright:[0,0.27],
  handHeight:[-0.03,0.16],elbowSpread:[0.3,0.85],earDistance:[0,0.6],
  travel:[0.5,1.8],recovery:[0,0.35],handLift:[0.3,0.58],
  depthChange:[0.075,0.22],ankleRise:[0.045,0.16],turnAmount:[0.27,0.5]
};
export function requiredLandmarks(assessmentId) {
  const common = [11,12,23,24,27,28];
  if (['open_guard','guard_step','boundary_raise'].includes(assessmentId)) return [...common,13,14,15,16];
  if (['head_cover','cover_raise'].includes(assessmentId)) return [...common,7,8,15,16];
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
  const handHeights=[p[15],p[16]].map(wrist=>(wrist.y-shoulders.y)/(calibration?.bodyHeight||0.6));
  const hand=handHeights.reduce((worst,value)=>Math.abs(value-0.065)>Math.abs(worst-0.065)?value:worst);
  return {
    stanceWidth:abs(p[27].x-p[28].x)/sw,
    footOrder:(p[28].x-p[27].x)*(Math.sign(p[24].x-p[23].x)||Math.sign(p[12].x-p[11].x)||1)/sw,
    balance:abs(hips.x-ankles.x)/sw,
    upright:abs(shoulders.x-hips.x)/sw,
    handHeight:hand,
    elbowSpread:(abs(p[13].x-p[23].x)+abs(p[14].x-p[24].x))/2/sw,
    earDistance:Math.max(dist(p[15],p[7]),dist(p[16],p[8]))/sw,
    travel:session.travel || 0,
    handLift:session.handLift || 0,
    depthChange:session.depthChange || 0,
    ankleRise:session.ankleRise || 0,
    turnAmount:session.turnAmount || 0,
    recovery:session.recovery ?? 1,
    bodyCenter:center
  };
}
function criterionScore(rule,value){
  const [low,high]=rule.range;
  if(rule.metric==='footOrder'&&value<=0)return 0;
  const ideal=idealRanges[rule.metric]||rule.range;
  const innerLow=Math.max(low,ideal[0]),innerHigh=Math.min(high,ideal[1]);
  if(value>=innerLow&&value<=innerHigh)return 100;
  if(value>=low&&value<=high){
    const fraction=value<innerLow?(value-low)/Math.max(innerLow-low,0.001):(high-value)/Math.max(high-innerHigh,0.001);
    return Math.round(80+20*Math.max(0,Math.min(1,fraction)));
  }
  const miss=value<low?low-value:value-high;
  return Math.max(0,Math.round(80-80*miss/Math.max((high-low)*0.3,0.025)));
}
export function evaluate(assessmentId, pose, calibration, session={}) {
  const config=ASSESSMENTS[assessmentId];
  const seen=visibility(pose,assessmentId);
  if (!seen.ok) return { valid:false, message:seen.message, quality:seen.quality, criteria:[], score:null, corrections:[] };
  const values=metrics(pose,calibration,session);
  const criteria=config.criteria.map(rule=>{
    const value=values[rule.metric];
    const ideal=idealRanges[rule.metric]||rule.range;
    const score=criterionScore(rule,value);
    return { id:rule.id, label:rule.label, value, score, weight:rule.weight, status:score>=80?'good':score>=55?'adjust':'needs work', correction:value<ideal[0]?rule.low||null:value>ideal[1]?rule.high||null:null };
  });
  const rawScore=Math.round(criteria.reduce((n,c)=>n+c.score*c.weight,0)/criteria.reduce((n,c)=>n+c.weight,0));
  const corrections=criteria.filter(c=>c.correction).sort((a,b)=>(values.footOrder<=0?(a.id==='feet'?-1:b.id==='feet'?1:0):0)||a.score-b.score).slice(0,2).map(c=>c.correction);
  const unmet=(config.required||[]).filter(id=>criteria.find(c=>c.id===id)?.score<80);
  const sequenceDone=config.kind==='static'||session.phase==='settle'&&session.stable;
  const score=Math.min(rawScore,unmet.length?79:sequenceDone?100:87);
  const passed=score>=88&&unmet.length===0&&sequenceDone;
  return { valid:true, passed, quality:seen.quality, score, criteria, corrections, message:passed?'Strong alignment. Hold it with easy breathing.':'Adjust one thing at a time.' };
}
export function updateMovement(session, pose, calibration, assessmentId='side_step', now=performance.now()) {
  const mode=ASSESSMENTS[assessmentId]?.movement||'horizontal';
  const hips=mid(pose[23],pose[24]), ankles=mid(pose[27],pose[28]);
  const shoulders=mid(pose[11],pose[12]);
  const sw=Math.max(calibration?.shoulderWidth||dist(pose[11],pose[12]),0.06);
  const bodyHeight=Math.max(abs(shoulders.y-ankles.y),0.2);
  const hipHeight=Math.max(abs(hips.y-ankles.y),0.1);
  const shoulderRatio=abs(pose[12].x-pose[11].x)/bodyHeight;
  if(session.phase==='ready'){
    const armsLow=(pose[15].y-shoulders.y)/bodyHeight>0.25&&(pose[16].y-shoulders.y)/bodyHeight>0.25;
    const facing=shoulderRatio>=(calibration?.shoulderWidth/calibration?.bodyHeight||0.2)*0.78;
    const canStart=(!['boundary_exit','cover_exit'].includes(mode)||armsLow)&&(mode!=='turn'||facing);
    const anchor=session.readyAnchor;
    const steady=anchor&&abs(hips.x-anchor.hipX)<sw*0.12&&abs(ankles.x-anchor.ankleX)<sw*0.16&&abs(bodyHeight-anchor.bodyHeight)<anchor.bodyHeight*0.07;
    if(!canStart||!steady){
      session.readyAnchor=canStart?{hipX:hips.x,ankleX:ankles.x,bodyHeight}:null;
      session.readySince=canStart?now:null;
    }else if(now-session.readySince>=1200){
      session.phase=['boundary_exit','cover_exit'].includes(mode)?'gesture':'move';
      session.originX=hips.x;
      session.originFeet=[pose[27].x,pose[28].x];
      session.originHands=[pose[15].y,pose[16].y];
      session.originBodyHeight=bodyHeight;
      session.originHipHeight=hipHeight;
      session.originAnkles=[pose[27].y,pose[28].y];
      session.originShoulderRatio=shoulderRatio;
    }
    return session;
  }
  if(mode==='horizontal'||mode==='boundary_exit'||mode==='cover_exit'){
    if(mode!=='horizontal'){
      session.handLift=Math.min((session.originHands[0]-pose[15].y)/bodyHeight,(session.originHands[1]-pose[16].y)/bodyHeight);
      if(session.phase==='gesture'){
        const ready=mode==='boundary_exit'?session.handLift>=0.2&&metrics(pose,calibration,session).handHeight<=0.24:session.handLift>=0.27&&metrics(pose,calibration,session).earDistance<=0.95;
        if(ready)session.phase='step';
        return session;
      }
    }
    const hipDelta=hips.x-session.originX;
    const direction=Math.sign(hipDelta);
    const footDelta=Math.max(0,Math.min((pose[27].x-session.originFeet[0])*direction,(pose[28].x-session.originFeet[1])*direction));
    session.travel=Math.min(abs(hipDelta),footDelta)/sw;
    if(['move','step'].includes(session.phase)&&session.travel>=(mode==='horizontal'?0.35:0.28))session.phase='settle';
    if(session.phase==='settle')session.recovery=abs(hips.x-ankles.x)/sw;
  }else if(mode==='back'){
    session.depthChange=1-(0.65*bodyHeight/session.originBodyHeight+0.35*hipHeight/session.originHipHeight);
    session.ankleRise=Math.min(session.originAnkles[0]-pose[27].y,session.originAnkles[1]-pose[28].y)/session.originBodyHeight;
    if(session.phase==='move'&&session.depthChange>=0.045&&session.ankleRise>=0.025)session.phase='settle';
  }else if(mode==='turn'){
    session.turnAmount=Math.max(0,1-shoulderRatio/session.originShoulderRatio);
    if(session.phase==='move'&&session.turnAmount>=0.18)session.phase='step';
    if(session.phase==='step'||session.phase==='settle'){
      const hipDelta=hips.x-session.originX;
      const direction=Math.sign(hipDelta);
      const footDelta=Math.max(0,Math.min((pose[27].x-session.originFeet[0])*direction,(pose[28].x-session.originFeet[1])*direction));
      session.travel=Math.min(abs(hipDelta),footDelta)/sw;
      if(session.phase==='step'&&session.travel>=0.28)session.phase='settle';
    }
  }
  if(session.phase==='settle'){
    const anchor=session.settleAnchor;
    const still=anchor&&abs(hips.x-anchor.hipX)<sw*0.08&&abs(ankles.y-anchor.ankleY)<bodyHeight*0.025&&abs(bodyHeight-anchor.bodyHeight)<bodyHeight*0.035;
    if(!still){session.settleAnchor={hipX:hips.x,ankleY:ankles.y,bodyHeight};session.settleSince=now;session.stable=false}
    else session.stable=now-session.settleSince>=500;
  }
  return session;
}
