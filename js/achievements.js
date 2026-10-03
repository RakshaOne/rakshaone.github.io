import { lessons, units } from './curriculum.js';

const finished = status => status === 'passed' || status === 'mastered';
const unitSize = Object.fromEntries(units.map(unit => [unit.id, unit.lessons.length]));

export function achievementStats(progress, days, summary) {
  const completedByUnit = Object.fromEntries(units.map(unit => [unit.id, 0]));
  const masteredModes = new Set();
  for (const lesson of lessons) {
    const status = progress.get(lesson.id)?.status;
    if (finished(status)) completedByUnit[lesson.unitId]++;
    if (status === 'mastered' && lesson.assessmentId) masteredModes.add(lesson.assessmentId);
  }
  const dates = [...new Set(days.filter(day => day.lessons_completed || day.practice_count).map(day => day.activity_date))].sort();
  let bestStreak = 0, run = 0, previous = null;
  for (const date of dates) {
    const current = Date.parse(`${date}T00:00:00Z`);
    run = previous !== null && current - previous === 86400000 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = current;
  }
  return {
    completed: summary.completed,
    mastered: summary.mastered,
    completedByUnit,
    completedUnits: units.filter(unit => completedByUnit[unit.id] === unitSize[unit.id]).length,
    masteredModes: masteredModes.size,
    activeDays: dates.length,
    bestStreak
  };
}

export const ACHIEVEMENTS = [
  { id:'first-choice', title:'First safe choice', description:'Finish your first lesson.', category:'Learning', icon:'shield', tone:'coral', target:1, value:s=>s.completed },
  { id:'five-steps', title:'Five steady steps', description:'Finish five lessons.', category:'Learning', icon:'path', tone:'peach', target:5, value:s=>s.completed },
  { id:'safety-foundations', title:'Safety foundations', description:'Finish Choose safety first.', category:'Learning', icon:'check', tone:'gold', target:unitSize.foundations, value:s=>s.completedByUnit.foundations },
  { id:'everyday-awareness', title:'Everyday awareness', description:'Finish Read the room.', category:'Learning', icon:'eye', tone:'teal', target:unitSize.awareness, value:s=>s.completedByUnit.awareness },
  { id:'clear-voice', title:'Clear voice', description:'Finish Speak and seek help.', category:'Learning', icon:'message', tone:'plum', target:unitSize.voice, value:s=>s.completedByUnit.voice },
  { id:'halfway', title:'Halfway there', description:'Finish 20 lessons.', category:'Learning', icon:'star', tone:'blue', target:20, value:s=>s.completed },
  { id:'all-chapters', title:'All eight chapters', description:'Finish every unit.', category:'Learning', icon:'trophy', tone:'gold', target:units.length, value:s=>s.completedUnits },
  { id:'camera-explorer', title:'Camera explorer', description:'Master one camera skill.', category:'Camera practice', icon:'camera', tone:'teal', target:1, value:s=>s.mastered },
  { id:'movement-mix', title:'Movement mix', description:'Master three different camera movements.', category:'Camera practice', icon:'target', tone:'coral', target:3, value:s=>s.masteredModes },
  { id:'practice-regular', title:'Practice regular', description:'Master five camera lessons.', category:'Camera practice', icon:'spark', tone:'plum', target:5, value:s=>s.mastered },
  { id:'three-day-rhythm', title:'Three-day rhythm', description:'Learn or practice on three days in a row.', category:'Consistency', icon:'flame', tone:'peach', target:3, value:s=>s.bestStreak },
  { id:'week-of-care', title:'A week of care', description:'Learn or practice on seven days in a row.', category:'Consistency', icon:'calendar', tone:'blue', target:7, value:s=>s.bestStreak },
  { id:'ten-returns', title:'Ten returns', description:'Come back to learn or practice on ten days.', category:'Consistency', icon:'retry', tone:'teal', target:10, value:s=>s.activeDays }
];

export const earnedAchievementIds = stats => new Set(ACHIEVEMENTS.filter(award => award.value(stats) >= award.target).map(award => award.id));
export const newlyEarnedAchievements = (before, after) => ACHIEVEMENTS.filter(award => !before.has(award.id) && after.has(award.id));
