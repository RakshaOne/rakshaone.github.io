import { smoothPose, visibility, evaluate, updateMovement, ASSESSMENTS } from './assessment.js';

const VERSION='1.0.1';
const MODEL='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const BONES=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
let modelPromise;
async function getModel() {
  if (!modelPromise) modelPromise=(async()=>{
    const { FilesetResolver, PoseLandmarker }=await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/+esm`);
    const vision=await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`);
    return PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:0.6,minPosePresenceConfidence:0.6,minTrackingConfidence:0.55});
  })().catch(error=>{modelPromise=null;throw error});
  return modelPromise;
}
function xy(ctx,p) {const r=ctx.poseRect;return {x:r.x+p.x*r.w,y:r.y+p.y*r.h}}
function line(ctx,a,b,color,width=4) { const start=xy(ctx,a),end=xy(ctx,b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke(); }
function dot(ctx,p,color,r=5) { const at=xy(ctx,p);ctx.fillStyle=color;ctx.beginPath();ctx.arc(at.x,at.y,r,0,Math.PI*2);ctx.fill(); }
function targetPose(p,id,calibration) {
  const q=p.map(v=>({...v}));
  const sw=calibration?.shoulderWidth||Math.abs(p[11].x-p[12].x)||0.15;
  const bh=calibration?.bodyHeight||0.6;
  const midX=(p[23].x+p[24].x)/2;
  if (id==='ready_stance'||id==='open_guard'||id==='head_cover'||id==='side_step'||id==='guard_step') {
    q[27]={...q[27],x:midX-sw*0.63}; q[28]={...q[28],x:midX+sw*0.63};
  }
  if (id==='open_guard'||id==='guard_step') {
    q[15]={...q[15],x:p[11].x-sw*0.33,y:p[11].y+bh*0.04};
    q[16]={...q[16],x:p[12].x+sw*0.33,y:p[12].y+bh*0.04};
    q[13]={...q[13],x:p[11].x-sw*0.15,y:(p[11].y+p[23].y)/2};
    q[14]={...q[14],x:p[12].x+sw*0.15,y:(p[12].y+p[24].y)/2};
  }
  if (id==='head_cover') {
    q[15]={...q[15],x:p[7].x-sw*0.16,y:p[7].y};q[16]={...q[16],x:p[8].x+sw*0.16,y:p[8].y};
  }
  return q;
}
export function renderPoseFrame(canvas,video,pose,assessmentId,calibration,result) {
  const ctx=canvas.getContext('2d');
  const w=canvas.clientWidth*devicePixelRatio,h=canvas.clientHeight*devicePixelRatio;
  if (canvas.width!==Math.round(w)||canvas.height!==Math.round(h)) {canvas.width=Math.round(w);canvas.height=Math.round(h)}
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const videoRatio=(video.videoWidth||4)/(video.videoHeight||3),boxRatio=canvas.width/canvas.height;
  const rect=videoRatio>boxRatio?{x:0,y:(canvas.height-canvas.width/videoRatio)/2,w:canvas.width,h:canvas.width/videoRatio}:{x:(canvas.width-canvas.height*videoRatio)/2,y:0,w:canvas.height*videoRatio,h:canvas.height};
  ctx.poseRect=rect;
  ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=3;ctx.setLineDash([12,9]);
  ctx.strokeRect(rect.x+rect.w*.08,rect.y+rect.h*.05,rect.w*.84,rect.h*.9);ctx.setLineDash([]);
  if (!pose) return;
  const ghost=assessmentId?targetPose(pose,assessmentId,calibration):null;
  if (ghost) { ctx.setLineDash([10,8]);for(const [a,b] of BONES) line(ctx,ghost[a],ghost[b],'rgba(255,255,255,.62)',8);ctx.setLineDash([]);for(const i of [11,12,13,14,15,16,23,24,25,26,27,28]) dot(ctx,ghost[i],'rgba(255,255,255,.72)',6); }
  const bad=new Set((result?.criteria||[]).filter(c=>c.status==='needs work').map(c=>c.id));
  const adjust=new Set((result?.criteria||[]).filter(c=>c.status==='adjust').map(c=>c.id));
  const stateFor=(a,b)=>{
    const lower=[23,24,25,26,27,28].includes(a)||[23,24,25,26,27,28].includes(b);
    const upper=[13,14,15,16].includes(a)||[13,14,15,16].includes(b);
    const key=lower?['width','base','center','travel','recovery']:upper?['hands','elbows','cover']:['upright'];
    return key.some(k=>bad.has(k))?'#fa8275':key.some(k=>adjust.has(k))?'#ffd08a':'#8be3ba';
  };
  for(const [a,b] of BONES) if((pose[a].visibility??0)>.45&&(pose[b].visibility??0)>.45) line(ctx,pose[a],pose[b],stateFor(a,b),5);
  for(const i of [11,12,13,14,15,16,23,24,25,26,27,28]) if((pose[i].visibility??0)>.45) dot(ctx,pose[i],'#fff',5);
}

export async function startPose({video,canvas,onFrame,onStatus,assessmentId=null,calibration=null,facingMode='user'}) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not support camera access. Try a current browser over HTTPS.');
  const controller={ running:true, stream:null, frame:0, last:0, pose:null, session:{phase:'ready'}, stop() {
    this.running=false;cancelAnimationFrame(this.frame);this.stream?.getTracks().forEach(track=>track.stop());video.srcObject=null;
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
  }};
  try {
    onStatus('Requesting camera permission…');
    let expired=false, timer;
    const request=navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode, width:{ideal:960},height:{ideal:720},frameRate:{ideal:24,max:30}}});
    request.then(stream=>{if(expired)stream.getTracks().forEach(track=>track.stop())}).catch(()=>{});
    try { controller.stream=await Promise.race([request,new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(new Error('Camera permission timed out. Check the browser permission prompt, then try again.'))},12000)})]); }
    finally { clearTimeout(timer); }
    video.srcObject=controller.stream;await video.play();
    if (!controller.running) return controller;
    onStatus('Loading private, on-device pose tracking…');
    const model=await getModel();
    if (!controller.running) return controller;
    onStatus('Tracking ready. Keep your whole body in the guide.');
    const loop=(now)=>{
      if (!controller.running) return;
      controller.frame=requestAnimationFrame(loop);
      if (document.hidden||video.readyState<2||now-controller.last<85) return;
      controller.last=now;
      try {
        const poses=model.detectForVideo(video,now).landmarks;
        controller.pose=poses?.length?smoothPose(controller.pose,poses[0]):null;
        const seen=visibility(controller.pose,assessmentId);
        if (assessmentId && seen.ok && ASSESSMENTS[assessmentId].kind==='dynamic') updateMovement(controller.session,controller.pose,calibration);
        const result=assessmentId?evaluate(assessmentId,controller.pose,calibration,controller.session):null;
        renderPoseFrame(canvas,video,controller.pose,assessmentId,calibration,result);
        onFrame({pose:controller.pose,visibility:seen,result,session:controller.session,video});
      } catch(error) {controller.stop();onStatus(`Pose tracking stopped: ${error.message}`);}
    };
    controller.frame=requestAnimationFrame(loop);
    return controller;
  } catch(error) {controller.stop();throw error;}
}
