import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClockExam,
  Code,
  Eye,
  Lock,
} from '../../components/Icons';
import {
  RANKING,
  SPRINT,
  deliveredCount,
  initialTasks,
  trackStatus,
  type SprintTask,
} from './sprintData';
import { useCountdown } from './useCountdown';

// Timing of the column-change choreography (Q8 -> Q9), straight from the spec.
const MOVE_MS = 260;
// How long the PO stays "typing" before her next line arrives (Q11).
const PO_REPLY_MS = 1400;

type MoveFx = { id: string; cls: 'g-drop-in' | 'g-drop-back' };

// Screen 1 of the sprint game: the board. The student sees the sprint score
// (deadline, task track, ranking), the PO's message and the four columns, and
// moves a task from the backlog with the choreographed card flight.
export function SprintBoard({ userInitials }: { userInitials: string }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<SprintTask[]>(initialTasks);
  const [poState, setPoState] = useState<'idle' | 'typing' | 'picked'>('idle');
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [moveFx, setMoveFx] = useState<MoveFx | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  // When the sprint engine exists these become POSTs; the choreography fires
  // on the response the same way it fires on the local move today.
  function moveTask(id: string, to: 'backlog' | 'doing') {
    const from = to === 'doing' ? 'backlog' : 'doing';
    const task = tasks.find((tk) => tk.id === id);
    if (!task || task.status !== from || leavingId) return;

    setLeavingId(id);
    if (to === 'doing') setPoState('typing');
    timers.current.push(
      window.setTimeout(() => {
        setTasks((list) => list.map((tk) => (tk.id === id ? { ...tk, status: to } : tk)));
        setLeavingId(null);
        setMoveFx({ id, cls: to === 'doing' ? 'g-drop-in' : 'g-drop-back' });
      }, MOVE_MS),
      window.setTimeout(
        () => setPoState(to === 'doing' ? 'picked' : 'idle'),
        PO_REPLY_MS,
      ),
      window.setTimeout(() => setMoveFx(null), MOVE_MS + 700),
    );
  }

  const columns: { status: SprintTask['status']; titleKey: 'projects.colBacklog' | 'projects.colDoing' | 'projects.colReview' | 'projects.colDone'; helperKey: 'projects.backlogHelper' | 'projects.doingHelper' | 'projects.reviewHelper' | 'projects.doneHelper'; who: 'lia' | 'you' | 'davi' | 'ok' }[] = [
    { status: 'backlog', titleKey: 'projects.colBacklog', helperKey: 'projects.backlogHelper', who: 'lia' },
    { status: 'doing', titleKey: 'projects.colDoing', helperKey: 'projects.doingHelper', who: 'you' },
    { status: 'review', titleKey: 'projects.colReview', helperKey: 'projects.reviewHelper', who: 'davi' },
    { status: 'done', titleKey: 'projects.colDone', helperKey: 'projects.doneHelper', who: 'ok' },
  ];

  return (
    <div className="g-page">
      <div className="g-page-head g-enter">
        <div className="g-page-head__text">
          <h1>{t('projects.title')}</h1>
          <p>{t('projects.subtitle')}</p>
        </div>
        <ul className="g-team" aria-label={t('projects.teamAria')}>
          <li>
            <span className="g-avatar g-avatar--lia" aria-hidden="true">L</span>
            <span className="g-team__who"><b>Lia</b><small>{t('projects.rolePo')}</small></span>
          </li>
          <li>
            <span className="g-avatar g-avatar--davi" aria-hidden="true">D</span>
            <span className="g-team__who"><b>Davi</b><small>{t('projects.roleReviewer')}</small></span>
          </li>
          <li>
            <span className="g-avatar g-avatar--you" aria-hidden="true">{userInitials}</span>
            <span className="g-team__who"><b>{t('projects.you')}</b><small>{t('projects.roleDev')}</small></span>
          </li>
        </ul>
      </div>

      <SprintHud tasks={tasks} />

      <div className="g-po g-enter" style={{ ['--d' as string]: '.16s' }}>
        <span className="g-avatar g-avatar--lg g-avatar--lia" aria-hidden="true">L</span>
        <div className="g-po__body" aria-live="polite">
          <span className="g-who">LIA · {t('projects.rolePo')}</span>
          {poState === 'typing' ? (
            <p className="g-bubble g-bubble--card g-bubble--typing" aria-label={t('projects.poTyping')}>
              <span className="g-dots" aria-hidden="true"><span /><span /><span /></span>
            </p>
          ) : (
            <p className="g-bubble g-bubble--card" key={poState}>
              {poState === 'picked' ? t('projects.poPicked') : t('projects.poIdle')}
            </p>
          )}
        </div>
      </div>

      <section className="g-board" aria-label={t('projects.boardAria')}>
        {columns.map((col, i) => {
          const items = tasks.filter((tk) => tk.status === col.status);
          return (
            <div className="g-col g-enter" style={{ ['--d' as string]: `${0.26 + i * 0.08}s` }} key={col.status}>
              <div className="g-col__head">
                {col.who === 'lia' && <span className="g-avatar g-avatar--sm g-avatar--lia" aria-hidden="true">L</span>}
                {col.who === 'davi' && <span className="g-avatar g-avatar--sm g-avatar--davi" aria-hidden="true">D</span>}
                {col.who === 'you' && <span className="g-avatar g-avatar--sm g-avatar--you" aria-hidden="true">{userInitials}</span>}
                {col.who === 'ok' && (
                  <span className="g-avatar g-avatar--sm g-avatar--ok" aria-hidden="true">
                    <span className="g-icon--bold"><Check size={12} /></span>
                  </span>
                )}
                <div className="g-col__title">
                  <h2>{t(col.titleKey)}</h2>
                  <span>{t(col.helperKey)}</span>
                </div>
                <span className="g-count" key={`${col.status}-${items.length}`}>{items.length}</span>
              </div>

              {col.status === 'doing' && items.length === 0 && (
                <div className="g-col__empty">
                  <span className="g-nudge-back" aria-hidden="true"><ChevronLeft size={22} /></span>
                  <span>{t('projects.doingEmpty')}</span>
                </div>
              )}

              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  fx={leavingId === task.id ? 'g-is-leaving' : moveFx?.id === task.id ? moveFx.cls : undefined}
                  onPick={() => moveTask(task.id, 'doing')}
                  onGiveBack={() => moveTask(task.id, 'backlog')}
                />
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function SprintHud({ tasks }: { tasks: SprintTask[] }) {
  const { t } = useTranslation();
  const deadline = useRef(Date.now() + SPRINT.deadlineOffsetMs).current;
  const clock = useCountdown(deadline);
  const delivered = deliveredCount(tasks);
  const earned = tasks.filter((tk) => tk.status === 'done').reduce((sum, tk) => sum + tk.points, 0);
  // The fill goes from the first node's center to the current node's (10%-90%).
  const fillPct = Math.min(100, (delivered / Math.max(1, tasks.length - 1)) * 100);

  return (
    <section className="g-hud g-panel-dark g-enter" style={{ ['--d' as string]: '.08s' }} aria-label={t('projects.hudAria')}>
      <div className="g-hud__sprint">
        <div className="g-hud__intro">
          <div className="g-hud__meta">
            <span className="g-badge-dark">SPRINT {SPRINT.number}</span>
            <span className="g-hud__live">
              <span className="g-live-dot" aria-hidden="true" />
              <span>{t('projects.sprintLive')}</span>
            </span>
          </div>
          <h2 className="g-hud__title">{SPRINT.product}</h2>
          <p className="g-hud__sub">{SPRINT.summary}</p>
        </div>
        <div className="g-track">
          <div className="g-track__rail">
            <div className="g-track__line" aria-hidden="true">
              <div className="g-track__fill" style={{ width: `${fillPct}%` }} />
            </div>
            <ol className="g-track__nodes" aria-label={t('projects.trackAria')}>
              {tasks.map((task, i) => {
                const st = trackStatus(task);
                return (
                  <li key={task.id}>
                    <span
                      className={`g-node g-node--${st}`}
                      style={{ ['--d' as string]: `${0.5 + i * 0.12}s` }}
                      title={t(`projects.node_${st}`)}
                    >
                      {st === 'done' && (
                        <span className="g-icon--bold" aria-hidden="true"><Check size={13} /></span>
                      )}
                      {st === 'review' && <Eye size={13} aria-hidden="true" />}
                      {st === 'locked' && <Lock size={11} aria-hidden="true" />}
                    </span>
                    <span className={`g-node__name${st === 'current' ? ' g-node__name--on' : st === 'locked' ? ' g-node__name--off' : ''}`}>
                      {task.trackName}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          <p className="g-hud__sub g-hud__sub--sm">
            {t('projects.trackProgress', { done: delivered, total: tasks.length, pts: earned, ptsTotal: SPRINT.totalPoints })}
          </p>
        </div>
      </div>

      <div className="g-hud__clock">
        <div className="g-dark-label">
          <ClockExam size={14} aria-hidden="true" />
          <span>{t('projects.deadlineLabel')}</span>
        </div>
        <div className="g-countdown" role="timer" aria-label={t('projects.deadlineLabel')}>
          <div className="g-countdown__tile"><b>{clock.dd}</b><small>{t('projects.unitDays')}</small></div>
          <div className="g-countdown__tile"><b>{clock.hh}</b><small>{t('projects.unitHours')}</small></div>
          <div className="g-countdown__tile"><b>{clock.mm}</b><small>{t('projects.unitMinutes')}</small></div>
          <div className="g-countdown__tile g-countdown__tile--sec"><b className="g-tick" key={clock.ss}>{clock.ss}</b><small>{t('projects.unitSeconds')}</small></div>
        </div>
      </div>

      <div className="g-hud__rank">
        <div className="g-hud__rank-head">
          <span className="g-dark-label">{t('projects.rankLabel')}</span>
          <a href="#ranking-geral">{t('projects.rankAll')}</a>
        </div>
        <ol className="g-rank-mini">
          {RANKING.map((row) => (
            <li key={row.position} className={row.you ? 'is-you' : undefined}>
              <span className="g-rank-mini__pos">{row.position}º</span>
              <span className="g-rank-mini__name">{row.name}</span>
              {row.climbed ? (
                <span className="g-rank-mini__up" role="img" aria-label={t('projects.rankClimbed', { n: row.climbed })}>
                  <ChevronUp size={12} aria-hidden="true" />{row.climbed}
                </span>
              ) : null}
              <span className="g-rank-mini__pts">{row.points} pts</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function TaskCard({
  task,
  fx,
  onPick,
  onGiveBack,
}: {
  task: SprintTask;
  fx?: string;
  onPick: () => void;
  onGiveBack: () => void;
}) {
  const { t } = useTranslation();
  const next = task.status === 'backlog' && !task.locked;
  const cls = [
    'g-tcard',
    next ? 'g-tcard--next' : '',
    task.locked ? 'g-tcard--locked' : '',
    fx ?? '',
  ].filter(Boolean).join(' ');

  return (
    <article className={cls}>
      <div className="g-tcard__top">
        <span className="g-tag">{task.tag}</span>
        <span className="g-pts">{task.points} pts</span>
      </div>
      <h3>{task.title}</h3>
      {task.locked ? (
        <p className="g-tcard__status">
          <Lock size={14} aria-hidden="true" />
          <span>{t('projects.lockedHint')}</span>
        </p>
      ) : (
        <p className="g-tcard__desc">{task.description}</p>
      )}

      {task.status === 'backlog' && next && (
        <button type="button" className="g-btn g-btn--primary g-btn--block" onClick={onPick}>
          <span>{t('projects.pickTask')}</span>
          <span className="g-nudge" aria-hidden="true"><ChevronRight size={16} /></span>
        </button>
      )}

      {task.status === 'doing' && (
        <>
          <p className="g-tcard__status g-tcard__status--now">
            <span className="g-blink-block" aria-hidden="true" />
            <span>{t('projects.withYouNow')}</span>
          </p>
          <button type="button" className="g-btn g-btn--primary g-btn--block" disabled title={t('projects.editorSoon')}>
            <Code size={16} aria-hidden="true" />
            <span>{t('projects.openEditor')}</span>
          </button>
          <button type="button" className="g-btn g-btn--quiet g-btn--block" onClick={onGiveBack}>
            {t('projects.giveBack')}
          </button>
        </>
      )}

      {task.status === 'review' && (
        <div className="g-tcard__review">
          <p className="g-tcard__status g-tcard__status--review">
            <span>{t('projects.daviReviewing')}</span>
            <span className="g-dots g-dots--sm" aria-hidden="true"><span /><span /><span /></span>
          </p>
          <div className="g-scan" aria-hidden="true" />
        </div>
      )}

      {task.status === 'done' && (
        <div className="g-tcard__foot">
          <span className="g-tcard__ok">
            <Check size={15} aria-hidden="true" />
            <span>{t('projects.testsPassed', { passed: 5, total: 5 })}</span>
          </span>
          <span className="g-tcard__xp">+100 XP</span>
        </div>
      )}
    </article>
  );
}
