// Presentation helpers. Curriculum IDs and persisted learning records stay unchanged.
const shapes = {
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  path:'<path d="M6 3v5a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v5"/><circle cx="6" cy="3" r="2"/><circle cx="18" cy="21" r="2"/>',
  progress:'<path d="M4 20V11m6 9V5m6 15v-7m4 7V9"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  shield:'<path d="M12 2 4 5v6c0 5 3.5 8.7 8 11 4.5-2.3 8-6 8-11V5z"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  play:'<path d="m8 5 11 7-11 7z"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back:'<path d="M20 12H4m6 6-6-6 6-6"/>',
  camera:'<rect x="2" y="6" width="20" height="15" rx="3"/><path d="m7 6 1.5-3h7L17 6"/><circle cx="12" cy="13.5" r="3"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  spark:'<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8zM19 18l.5 1.5L21 20l-1.5.5L19 22l-.5-1.5L17 20l1.5-.5z"/>',
  flame:'<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-6 .2 3-1 4-2 4 0-4-3-8-5-10 0 4-4 7-4 12 0 4 3 7 7 7z"/>',
  trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0zM7 5H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8"/>',
  retry:'<path d="M3 12a9 9 0 1 0 3-7M3 4v5h5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  laptop:'<rect x="4" y="4" width="16" height="12" rx="1"/><path d="M2 20h20l-2-4H4z"/>',
  book:'<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1zm0 0v15"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  star:'<path d="m12 2 3 6.5 7 .9-5 5 .9 7-5.9-3.3-5.9 3.3.9-7-5-5 7-.9z"/>',
  eye:'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  message:'<path d="M4 5h16v12H9l-5 4V5z"/><path d="M8 9h8m-8 4h5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 2 2 5-5"/>'
};
export function icon(name, size=22) {
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes[name]||shapes.shield}</svg>`;
}

export function lessonBlocks(item) {
  const check=item.blocks.find(block=>block.type==='choice');
  const steps=item.blocks.find(block=>block.type==='steps');
  if(!check||!steps)throw new Error(`Lesson ${item.id} needs a decision and practical steps.`);
  if(item.assessmentId){
    return [
      {id:'activity-intro',type:'activity-intro',summary:item.summary,steps:steps.items,demo:item.blocks.find(block=>block.type==='demonstration'),cues:item.blocks.find(block=>block.type==='cues')},
      {id:'camera-practice',type:'camera'},
      check
    ];
  }
  const practice=item.blocks.find(block=>block.type==='practice');
  if(!practice)throw new Error(`Lesson ${item.id} needs a practice activity.`);
  return [check,{id:'insight',type:'insight',summary:item.summary,steps:steps.items},practice];
}

const placeKey = (userId, lessonId) => `rakshaone:place:${userId}:${lessonId}`;
const recentKey = userId => `rakshaone:recent:${userId}`;
export function savePlace(userId, item, blockId) {
  if (!userId) return;
  localStorage.setItem(placeKey(userId, item.id), blockId);
  localStorage.setItem(recentKey(userId), item.id);
}
export function readPlace(userId, item) {
  const blockId = localStorage.getItem(placeKey(userId, item.id));
  const blocks=lessonBlocks(item);
  const index=blocks.findIndex(block=>block.id===blockId);
  if(index>=0)return index;
  if(['idea','method','show','cues','map'].includes(blockId))return blocks.findIndex(block=>['insight','activity-intro'].includes(block.id));
  if(blockId==='practice'&&item.assessmentId)return blocks.findIndex(block=>block.id==='camera-practice');
  return 0;
}
export function clearPlace(userId, item) {
  if (!userId) return;
  localStorage.removeItem(placeKey(userId, item.id));
  if (localStorage.getItem(recentKey(userId)) === item.id) localStorage.removeItem(recentKey(userId));
}
export function resumeLesson(userId, items, progress) {
  const recent = items.find(item => item.id === localStorage.getItem(recentKey(userId)));
  const done = item => ['passed','mastered'].includes(progress.get(item.id)?.status);
  const started=item=>readPlace(userId,item)>0||progress.get(item.id)?.status==='practiced';
  if (recent && !done(recent) && started(recent)) return recent;
  const inProgress = items.filter(item => !done(item) && started(item))
    .sort((a, b) => (progress.get(b.id)?.updated_at || '').localeCompare(progress.get(a.id)?.updated_at || ''));
  if (inProgress.length) return inProgress[0];
  return items.find(item => !done(item)) || items.at(-1);
}

export function lessonReward(old, nextStatus) {
  const firstFinish = !old?.completed_at && ['passed', 'mastered'].includes(nextStatus);
  const masteryEarned = nextStatus === 'mastered' && old?.status !== 'mastered';
  return { firstFinish, masteryEarned, xp: (firstFinish ? 20 : 0) + (masteryEarned ? 10 : 0) };
}

export function hasPassedDecision(attempts, item) {
  return attempts.some(attempt => attempt.lesson_id === item.id && attempt.exercise_id === `${item.id}.check` && attempt.kind === 'quiz' && attempt.passed);
}
