import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, ChevronUp, Lock, Unlock } from '../../components/Icons';
import { SPRINT, type SprintTask } from './sprintData';

// Celebration timings, straight from the spec: the reviewer answers at 2.4s,
// the next task unlocks at 3.1s and the ranking rows swap at 3.6s.
const DAVI_MS = 2400;
const UNLOCK_MS = 3100;
const RANK_MS = 3600;

// XP counting (C6): 24 steps of 45ms with a cubic ease-out.
const XP_STEPS = 24;
const XP_STEP_MS = 45;
const XP_PER_POINT = 20;
const LEVEL_BASE = 340;
const LEVEL_MAX = 500;

// Screen 3 of the sprint game: the task is approved. The stamp slams, the XP
// counts up, the reviewer says his word, the next task unlocks and the
// ranking row climbs. Only counting and the three timers live in JS.
export function TaskDone({
  task,
  nextTask,
  taskIndex,
  totalTasks,
  onBack,
}: {
  task: SprintTask;
  nextTask: SprintTask | null;
  taskIndex: number;
  totalTasks: number;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  const [xp, setXp] = useState(0);
  const [daviDone, setDaviDone] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [rankMoved, setRankMoved] = useState(false);
  const timers = useRef<number[]>([]);

  const xpTotal = task.points * XP_PER_POINT;
  const levelNow = LEVEL_BASE + xp;
  const levelLeft = LEVEL_MAX - levelNow;

  useEffect(() => {
    mainRef.current?.focus();
    for (let step = 1; step <= XP_STEPS; step++) {
      timers.current.push(
        window.setTimeout(() => {
          const k = step / XP_STEPS;
          setXp(Math.round(xpTotal * (1 - Math.pow(1 - k, 3))));
        }, 1100 + step * XP_STEP_MS),
      );
    }
    timers.current.push(
      window.setTimeout(() => setDaviDone(true), DAVI_MS),
      window.setTimeout(() => setUnlocked(true), UNLOCK_MS),
      window.setTimeout(() => setRankMoved(true), RANK_MS),
    );
    return () => timers.current.forEach(window.clearTimeout);
    // The screen remounts per delivered task; counting starts once.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="g-done" ref={mainRef} tabIndex={-1}>
      <h1 className="g-sr-only">{t('projects.doneTitle')}</h1>

      <section className="g-hero g-panel-dark g-hero-in" aria-labelledby="g-done-h">
        <div className="g-hero__text">
          <span className="g-badge-dark g-enter" style={{ ['--d' as string]: '.1s' }}>
            {t('projects.taskMeta', { sprint: SPRINT.number, index: taskIndex, total: totalTasks })}
          </span>
          <h2 id="g-done-h" className="g-enter" style={{ ['--d' as string]: '.18s' }}>
            {t('projects.doneTitle')}
          </h2>
          <p className="g-hero__lead g-enter" style={{ ['--d' as string]: '.26s' }}>
            {t('projects.doneLead', { title: task.title, product: SPRINT.product })}
          </p>
          {/* C6 · the level bar follows the XP count */}
          <div className="g-level g-enter" style={{ ['--d' as string]: '1.3s' }}>
            <div className="g-level__row">
              <b>{t('projects.levelLabel', { n: 4 })}</b>
              <span>{t('projects.levelOf', { now: levelNow, max: LEVEL_MAX })}</span>
            </div>
            <div
              className="g-level__bar"
              role="progressbar"
              aria-label={t('projects.levelBarAria', { n: 4 })}
              aria-valuemin={0}
              aria-valuemax={LEVEL_MAX}
              aria-valuenow={levelNow}
            >
              <div className="g-level__fill" style={{ width: `${(levelNow / LEVEL_MAX) * 100}%` }} />
            </div>
            <span>{t('projects.levelLeft', { left: levelLeft, n: 5 })}</span>
          </div>
        </div>
        <div className="g-hero__reward">
          <div className="g-stamp-wrap">
            <div className="g-bits" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} />
              ))}
            </div>
            <div className="g-stamp g-slam" role="img" aria-label={t('projects.stampAria')}>
              <div className="g-stamp__inner">
                <Check size={36} />
                <b>{t('projects.stampLabel')}</b>
                <small>{t('projects.stampSub')}</small>
              </div>
            </div>
          </div>
          <div className="g-rewards">
            <div className="g-reward g-reward--xp g-pop" style={{ ['--d' as string]: '1s' }}>
              <b>+{xp}</b>
              <span>{t('projects.rewardXp')}</span>
            </div>
            <div className="g-reward g-pop" style={{ ['--d' as string]: '1.12s' }}>
              <b>+{task.points}</b>
              <span>{t('projects.rewardPts')}</span>
            </div>
            <div className="g-reward g-pop" style={{ ['--d' as string]: '1.24s' }}>
              <b>5/5</b>
              <span>{t('projects.rewardTests')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="g-after">
        {/* C9 · the reviewer types, then approves */}
        <section className="g-tile g-after__card g-after__card--row g-enter" style={{ ['--d' as string]: '.5s' }} aria-label={t('projects.reviewAria')}>
          <span className="g-avatar g-avatar--lg g-avatar--davi" aria-hidden="true">D</span>
          <div className="g-review" aria-live="polite">
            <div className="g-review__who">
              <span className="g-who">DAVI · {t('projects.roleReviewer')}</span>
              {daviDone && (
                <span className="g-status-chip g-pop">{t('projects.chipApproved')}</span>
              )}
            </div>
            {!daviDone ? (
              <p className="g-bubble g-bubble--typing" aria-label={t('projects.daviTyping')}>
                <span className="g-dots" aria-hidden="true"><span /><span /><span /></span>
              </p>
            ) : (
              <p className="g-bubble" key="done">{t('projects.daviReviewMsg')}</p>
            )}
          </div>
        </section>

        {/* C10 · the next task unlocks */}
        <section className="g-tile g-after__card g-enter" style={{ ['--d' as string]: '.62s' }} aria-label={t('projects.nextAria')}>
          {nextTask ? (
            <>
              <span className="g-label" aria-live="polite">
                {unlocked ? t('projects.nextUnlocked') : t('projects.nextLabel')}
              </span>
              <div className={`g-next${unlocked ? ' is-open' : ''}`}>
                <span className="g-next__lock" aria-hidden="true">
                  <span className="g-i-closed"><Lock size={18} /></span>
                  <span className="g-i-open"><Unlock size={18} /></span>
                </span>
                <div className="g-next__text">
                  <b>{nextTask.title}</b>
                  <span className="g-tag">{nextTask.tag} · {nextTask.points} pts</span>
                </div>
              </div>
            </>
          ) : (
            <span className="g-label" aria-live="polite">{t('projects.lastTaskLabel')}</span>
          )}
          <button type="button" className="g-btn g-btn--primary g-btn--block g-after__cta" onClick={onBack}>
            <span>{t('projects.backToBoard')}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </section>

        {/* C11 · the ranking row climbs */}
        <section className="g-tile g-after__card g-enter" style={{ ['--d' as string]: '.74s' }} aria-label={t('projects.rankLabel')}>
          <div className="g-after__head">
            <span className="g-label">{t('projects.rankLabel')}</span>
            <span className="g-rank-gain">
              <ChevronUp size={14} aria-hidden="true" />
              <span>{t('projects.rankGain', { n: 2 })}</span>
            </span>
          </div>
          <div className={`g-rank-move${rankMoved ? ' is-moved' : ''}`}>
            <span className="g-rank-move__pos">10º</span>
            <div className="g-rank-move__row g-rank-move__row--you">
              {t('projects.you')}
              <span>{xp >= xpTotal ? 8 + task.points : 8} pts</span>
            </div>
            <span className="g-rank-move__pos">11º</span>
            <div className="g-rank-move__row">rafa_lima<span>10 pts</span></div>
            <span className="g-rank-move__pos">12º</span>
            <div className="g-rank-move__row">dani.codes<span>9 pts</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
