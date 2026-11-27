import type { SprintTaskView } from '../../services/sprints';

// Derived views over the engine's task list: which track node state each task
// paints, and what the mini ranking on the HUD shows.

export function trackStatus(task: SprintTaskView): 'done' | 'review' | 'current' | 'locked' {
  if (task.status === 'done') return 'done';
  if (task.status === 'review') return 'review';
  return task.locked ? 'locked' : 'current';
}

// The HUD shows the top of the table plus the student's own line.
export function miniRanking(
  ranking: { position: number; name: string; points: number; you: boolean }[],
): { position: number; name: string; points: number; you: boolean }[] {
  const top = ranking.slice(0, 2);
  const you = ranking.find((r) => r.you);
  if (!you || top.includes(you)) return top;
  return [...top, you];
}
