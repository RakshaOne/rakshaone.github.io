// Time-based capture gates keep a single lucky frame from ending a drill.
export function heldFor(since, eligible, now, durationMs) {
  if (!eligible) return { since: null, remaining: durationMs, ready: false };
  const started = since ?? now;
  const remaining = Math.max(0, durationMs - (now - started));
  return { since: started, remaining, ready: remaining === 0 };
}

export function neutralPoseReady(pose) {
  if (!pose || [11,12,15,16,23,24].some(i => (pose[i]?.visibility ?? 0) < 0.55)) return false;
  const shoulders = (pose[11].y + pose[12].y) / 2;
  const hips = (pose[23].y + pose[24].y) / 2;
  const drop = Math.max(0.06, (hips - shoulders) * 0.22);
  return pose[15].y > shoulders + drop && pose[16].y > shoulders + drop;
}

export function armsOutReady(pose, neutral) {
  if (!pose || !neutral || [11,12,15,16].some(i => (pose[i]?.visibility ?? 0) < 0.55)) return false;
  const shoulderWidth = Math.abs(neutral[11].x - neutral[12].x);
  return Math.abs(pose[15].x - pose[16].x) > shoulderWidth * 1.8;
}
