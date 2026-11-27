import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Lock } from '../../components/Icons';
import { SPRINT, type SprintTask } from './sprintData';

// XP counting on the final stats (F4): 28 steps of 45ms starting at 900ms.
const XP_STEPS = 28;
const XP_STEP_MS = 45;
const XP_START_MS = 900;
const XP_PER_POINT = 20;

// Screen 4 of the sprint game: the sprint is over. The product stacks up
// brick by brick, the sprint numbers come in, the final ranking highlights
// the student and the team leaves their word. Only the XP count is JS.
export function SprintEnd({
  tasks,
  userInitials,
  onBackToProjects,
}: {
  tasks: SprintTask[];
  userInitials: string;
  onBackToProjects: () => void;
}) {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  const [xp, setXp] = useState(0);
  const timers = useRef<number[]>([]);

  const totalPoints = tasks.reduce((sum, tk) => sum + tk.points, 0);
  const xpTotal = totalPoints * XP_PER_POINT;

  useEffect(() => {
    mainRef.current?.focus();
    for (let step = 1; step <= XP_STEPS; step++) {
      timers.current.push(
        window.setTimeout(() => {
          const k = step / XP_STEPS;
          setXp(Math.round(xpTotal * (1 - Math.pow(1 - k, 3))));
        }, XP_START_MS + step * XP_STEP_MS),
      );
    }
    return () => timers.current.forEach(window.clearTimeout);
    // The screen mounts once per finished sprint.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ranking = [
    { pos: 1, avatar: 'M', name: 'marina.dev', time: '2d 04h', pts: 21 },
    { pos: 2, avatar: 'J', name: 'joaopedro', time: '2d 11h', pts: 21 },
    { pos: 3, avatar: 'B', name: 'biaalves', time: '3d 01h', pts: 21 },
    { pos: 8, avatar: 'L', name: 'lucas.tx', time: '5d 09h', pts: 21 },
    { pos: 9, avatar: userInitials, name: t('projects.you'), time: '5d 18h', pts: 21, you: true },
    { pos: 10, avatar: 'R', name: 'rafa_lima', time: '6d 02h', pts: 21 },
  ];

  return (
    <main className="g-end" ref={mainRef} tabIndex={-1}>
      <h1 className="g-sr-only">{t('projects.endSrTitle', { product: SPRINT.product })}</h1>

      <section className="g-end-hero g-panel-dark g-enter" aria-labelledby="g-end-h">
        <div className="g-end-hero__text">
          <span className="g-badge-dark g-badge-dark--ok g-enter" style={{ ['--d' as string]: '.1s' }}>
            {t('projects.endBadge', { sprint: SPRINT.number })}
          </span>
          <h2 id="g-end-h" className="g-enter" style={{ ['--d' as string]: '.18s' }}>
            {t('projects.endTitleA')} <em>{SPRINT.product}</em> {t('projects.endTitleB')}
          </h2>
          <p className="g-hero__lead g-enter" style={{ ['--d' as string]: '.26s' }}>
            {t('projects.endLead', { done: tasks.length, total: tasks.length })}
          </p>
          <div className="g-end-hero__actions g-enter" style={{ ['--d' as string]: '.34s' }}>
            <a className="g-btn g-btn--primary" href="#g-ranking">
              <span>{t('projects.seeFullRanking')}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </a>
            <button type="button" className="g-btn g-btn--ghost" onClick={onBackToProjects}>
              {t('projects.backToProjects')}
            </button>
          </div>
        </div>
        <div className="g-built">
          <div className="g-built__head">
            <span className="g-dark-label">{t('projects.builtLabel')}</span>
            {/* F3 · pops when the tower finishes stacking */}
            <span className="g-on-air g-pop" style={{ ['--d' as string]: '1.95s' }}>
              <span className="g-live-dot" aria-hidden="true" />
              <span>{t('projects.onAir')}</span>
            </span>
          </div>
          {/* F2 · HTML order is task 1 to 5; CSS flips it so 1 sits at the base */}
          <ol className="g-tower" aria-label={t('projects.towerAria')}>
            {tasks.map((task, i) => (
              <li className="g-brick" style={{ ['--d' as string]: `${0.5 + i * 0.22}s` }} key={task.id}>
                <span>{i + 1}</span>
                <b>{task.title}</b>
                <span>{task.points} pts</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="g-stats" aria-label={t('projects.statsAria')}>
        <div className="g-stat g-tile g-enter" style={{ ['--d' as string]: '.3s' }}>
          <b>{totalPoints}/{totalPoints}</b>
          <span>{t('projects.statPts')}</span>
        </div>
        <div className="g-stat g-stat--xp g-tile g-enter" style={{ ['--d' as string]: '.38s' }}>
          <b>+{xp}</b>
          <span>{t('projects.rewardXp')}</span>
        </div>
        <div className="g-stat g-tile g-enter" style={{ ['--d' as string]: '.46s' }}>
          <b>{tasks.length}/{tasks.length}</b>
          <span>{t('projects.statApproved')}</span>
        </div>
        <div className="g-stat g-tile g-enter" style={{ ['--d' as string]: '.54s' }}>
          <b>1d 06h</b>
          <span>{t('projects.statSlack')}</span>
        </div>
      </section>

      <div className="g-end-grid">
        <section id="g-ranking" className="g-final-rank g-tile g-enter" style={{ ['--d' as string]: '.6s' }} aria-labelledby="g-rank-h">
          <div className="g-final-rank__head">
            <h2 id="g-rank-h">{t('projects.finalRankTitle')}</h2>
            <span>{t('projects.finalRankNote')}</span>
          </div>
          <ol>
            {ranking.map((row, i) => (
              <li key={row.pos}>
                {/* F5 · the gap before your section of the table */}
                {row.pos === 8 && <span className="g-rank-gap" aria-hidden="true">···</span>}
                <div
                  className={`g-rank-row${row.pos === 1 ? ' g-rank-row--first' : ''}${row.you ? ' g-rank-row--you' : ''}`}
                  style={{ ['--d' as string]: `${0.74 + i * 0.07}s` }}
                >
                  <span className="g-rank-row__pos">{row.pos}º</span>
                  <span className="g-avatar" aria-hidden="true">{row.avatar}</span>
                  <span className="g-rank-row__name">{row.name}</span>
                  <span className="g-rank-row__time">{row.time}</span>
                  <span className="g-rank-row__pts">{row.pts} pts</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="g-end-side">
          {/* F6 · the team's word, one speech at a time */}
          <section className="g-team-note g-tile g-enter" style={{ ['--d' as string]: '.7s' }} aria-labelledby="g-team-h">
            <h2 id="g-team-h">{t('projects.teamNoteTitle')}</h2>
            <div className="g-msg">
              <span className="g-avatar g-avatar--lia" aria-hidden="true">L</span>
              <div className="g-msg__body">
                <span className="g-who">LIA · {t('projects.rolePo')}</span>
                <p className="g-bubble" style={{ ['--d' as string]: '1.3s' }}>{t('projects.liaFinalMsg')}</p>
              </div>
            </div>
            <div className="g-msg">
              <span className="g-avatar g-avatar--davi" aria-hidden="true">D</span>
              <div className="g-msg__body">
                <span className="g-who">DAVI · {t('projects.roleReviewer')}</span>
                <p className="g-bubble" style={{ ['--d' as string]: '1.9s' }}>{t('projects.daviFinalMsg')}</p>
              </div>
            </div>
          </section>

          <section className="g-next-sprint g-enter" style={{ ['--d' as string]: '.8s' }} aria-label={t('projects.nextSprintAria')}>
            <span className="g-next-sprint__lock" aria-hidden="true"><Lock size={20} /></span>
            <div className="g-next-sprint__text">
              <span className="g-label">{t('projects.nextSprintLabel', { sprint: SPRINT.number + 1 })}</span>
              <b>{t('projects.nextSprintName')}</b>
              <small>{t('projects.nextSprintDate')}</small>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
