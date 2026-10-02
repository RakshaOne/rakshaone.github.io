import { icon } from './experience.js';

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const TRACK_WIDTH=88;
const STEP=108;
const xAt=index=>[44,52,44,36,44][index%5];

export function roadmapCurve(count) {
  const points=Array.from({length:count},(_,index)=>({x:xAt(index),y:STEP*index+STEP/2}));
  if(!points.length)return {width:TRACK_WIDTH,height:0,points:[],d:''};
  let d=`M ${points[0].x} 0 L ${points[0].x} ${points[0].y}`;
  for(let index=1;index<points.length;index++){
    const a=points[index-1],b=points[index],middle=(a.y+b.y)/2;
    d+=` C ${a.x} ${middle} ${b.x} ${middle} ${b.x} ${b.y}`;
  }
  d+=` L ${points.at(-1).x} ${STEP*count}`;
  return {width:TRACK_WIDTH,height:STEP*count,points,d};
}

export function renderRoadmapUnit(unit,current,progress,allLessons,number,total,compact=false) {
  const done=item=>['passed','mastered'].includes(progress.get(item.id)?.status);
  const count=unit.lessons.filter(done).length;
  const currentIndex=allLessons.findIndex(item=>item.id===current.id);
  const route=roadmapCurve(unit.lessons.length);
  const drawn=count===0?0:Math.round((count-.45)/unit.lessons.length*100);
  const nodes=unit.lessons.map((item,index)=>{
    const status=progress.get(item.id)?.status;
    const state=status==='mastered'?'mastered':done(item)?'completed':item.id===current.id?'current':allLessons.findIndex(lesson=>lesson.id===item.id)<currentIndex?'available':'upcoming';
    const label=state==='current'?(progress.get(item.id)?.status==='practiced'?'Continue here':'Next checkpoint'):state==='mastered'?'Mastered':state==='completed'?'Completed':state==='available'?'Ready':'Coming up';
    const point=route.points[index];
    const symbol=state==='mastered'?'star':state==='completed'?'check':item.assessmentId?'camera':state==='current'?'play':'book';
    return `<a class="path-node ${state} ${index===unit.lessons.length-1?'milestone':''}" href="#/lesson/${encodeURIComponent(item.id)}" style="--waypoint:${(point.x/TRACK_WIDTH).toFixed(3)}" ${state==='current'?'aria-current="step"':''} aria-label="${escapeHtml(item.title)}. ${label}${item.assessmentId?', camera activity':''}."><span class="checkpoint">${icon(symbol,25)}</span><span class="checkpoint-copy"><small>Checkpoint ${index+1}${item.assessmentId?' · Camera activity':''}</small><strong>${escapeHtml(item.title)}</strong><em>${label}</em></span></a>`;
  }).join('');
  return `<section class="path-unit unit-${unit.id} ${compact?'compact':''}" id="unit-${unit.id}"><div class="chapter-landscape" aria-hidden="true"><i></i><i></i><i></i></div><div class="path-unit-heading"><div class="unit-emblem">${icon(count===unit.lessons.length?'trophy':'shield',27)}</div><div class="path-unit-title"><span class="eyebrow">Unit ${number} of ${total}${count===unit.lessons.length?' · Complete':''}</span><h2>${escapeHtml(unit.title)}</h2><p>${escapeHtml(unit.subtitle)}</p></div><span class="unit-count">${count}/${unit.lessons.length}</span></div><div class="path-nodes"><svg class="roadmap-spine" viewBox="0 0 ${route.width} ${route.height}" preserveAspectRatio="none" style="height:${route.height}px" aria-hidden="true"><path class="roadmap-track" d="${route.d}"/><path class="roadmap-complete" d="${route.d}" pathLength="100" style="--drawn:${drawn}"/></svg>${nodes}</div></section>`;
}
