import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { lessonReward } from './experience.js';

export const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
export const state = { user: null, profile: null, progress: new Map(), attempts: [], days: [], calibrations: [], loading: true };

function fail(error) { if (error) throw error; }
async function loadActivityDays(userId) {
  const rows=[];
  for(let offset=0;;offset+=500){
    const { data, error }=await db.from('activity_days').select('*').eq('user_id',userId).order('activity_date',{ascending:false}).range(offset,offset+499);
    fail(error);
    rows.push(...(data||[]));
    if((data||[]).length<500)return {data:rows,error:null};
  }
}
export async function loadAccount() {
  const { data: { user }, error } = await db.auth.getUser();
  if (error && error.name !== 'AuthSessionMissingError') throw error;
  state.user = user || null;
  state.progress.clear(); state.attempts = []; state.days = []; state.calibrations = []; state.profile = null;
  if (!user) { state.loading = false; return; }
  const tables = await Promise.all([
    db.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
    db.from('lesson_progress').select('*').eq('user_id', user.id),
    db.from('exercise_attempts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
    loadActivityDays(user.id),
    db.from('device_calibrations').select('*').eq('user_id', user.id)
  ]);
  for (const result of tables) fail(result.error);
  state.profile = tables[0].data;
  state.progress = new Map((tables[1].data || []).map(row => [row.lesson_id, row]));
  state.attempts = tables[2].data || []; state.days = tables[3].data || []; state.calibrations = tables[4].data || [];
  state.loading = false;
}

export async function saveProfile(values) {
  const row = { user_id: state.user.id, ...values, updated_at: new Date().toISOString() };
  const { data, error } = await db.from('profiles').upsert(row).select().single(); fail(error);
  state.profile = data; return data;
}

const rank = { viewed: 0, learned: 1, practiced: 2, passed: 3, mastered: 4 };
const progressWrites = new Map();
export function saveLesson(lessonId, status, score = null) {
  const prior = progressWrites.get(lessonId) || Promise.resolve();
  const next = prior.catch(() => {}).then(() => writeLesson(lessonId, status, score));
  progressWrites.set(lessonId, next);
  return next;
}
async function writeLesson(lessonId, status, score = null) {
  const old = state.progress.get(lessonId);
  const nextStatus = old && rank[old.status] > rank[status] ? old.status : status;
  const { firstFinish, masteryEarned, xp } = lessonReward(old, nextStatus);
  const row = {
    user_id: state.user.id, lesson_id: lessonId, status: nextStatus,
    best_score: score == null ? old?.best_score ?? null : Math.max(score, old?.best_score ?? 0),
    attempts: (old?.attempts || 0) + (status === 'viewed' ? 0 : 1),
    xp_awarded: (old?.xp_awarded || 0) + xp,
    first_viewed_at: old?.first_viewed_at || new Date().toISOString(),
    completed_at: firstFinish ? new Date().toISOString() : old?.completed_at || null,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await db.from('lesson_progress').upsert(row).select().single(); fail(error);
  state.progress.set(lessonId, data);
  if (xp) await recordActivity(firstFinish ? 1 : 0, 0, xp);
  return { row: data, xp, masteryEarned };
}

export async function recordAttempt(lessonId, exerciseId, kind, score, passed, criteria = {}) {
  const { data, error } = await db.from('exercise_attempts').insert({
    user_id: state.user.id, lesson_id: lessonId, exercise_id: exerciseId, kind, score, passed, criteria
  }).select().single(); fail(error);
  state.attempts.unshift(data);
  if (kind === 'camera' || kind === 'guided') await recordActivity(0, 1, 0);
  return data;
}

async function recordActivity(lessons, practice, xp) {
  const today = new Date().toLocaleDateString('en-CA');
  const old = state.days.find(item => item.activity_date === today);
  const row = { user_id: state.user.id, activity_date: today, lessons_completed: (old?.lessons_completed || 0) + lessons, practice_count: (old?.practice_count || 0) + practice, xp_earned: (old?.xp_earned || 0) + xp };
  const { data, error } = await db.from('activity_days').upsert(row).select().single(); fail(error);
  state.days = [data, ...state.days.filter(item => item.activity_date !== today)];
}

export async function saveCalibration(deviceId, deviceClass, metrics, quality) {
  const { data, error } = await db.from('device_calibrations').upsert({
    user_id: state.user.id, device_id: deviceId, device_class: deviceClass, metrics, quality, updated_at: new Date().toISOString()
  }).select().single(); fail(error);
  state.calibrations = [data, ...state.calibrations.filter(item => item.device_id !== deviceId)]; return data;
}

export async function removeCalibration(deviceId) {
  const { error } = await db.from('device_calibrations').delete().eq('user_id', state.user.id).eq('device_id', deviceId); fail(error);
  state.calibrations = state.calibrations.filter(item => item.device_id !== deviceId);
}

export function totals() {
  const rows = [...state.progress.values()];
  const completed = rows.filter(row => rank[row.status] >= 3).length;
  const mastered = rows.filter(row => row.status === 'mastered').length;
  const xp = rows.reduce((sum, row) => sum + row.xp_awarded, 0);
  const days = new Set(state.days.filter(row => row.lessons_completed || row.practice_count).map(row => row.activity_date));
  let streak = 0; const day = new Date();
  if (!days.has(day.toLocaleDateString('en-CA'))) day.setDate(day.getDate() - 1);
  while (days.has(day.toLocaleDateString('en-CA'))) { streak++; day.setDate(day.getDate() - 1); }
  return { completed, mastered, xp, level: Math.floor(xp / 150) + 1, streak };
}

export function calibrationForDevice() {
  const deviceId = getDeviceId(); const deviceClass = getDeviceClass();
  return state.calibrations.find(item => item.device_id === deviceId && item.device_class === deviceClass) || null;
}
export function getDeviceClass() { return matchMedia('(pointer: coarse)').matches && innerWidth < 900 ? 'mobile' : 'desktop'; }
export function getDeviceId() {
  let id = localStorage.getItem('raksha-device-id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('raksha-device-id', id); }
  return id;
}
