import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MobileMenu } from '../../components/MobileMenu';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame } from '../../components/Icons';
import { useNavPrincipal } from '../../hooks/useNavPrincipal';
import { useAuth, useFeature } from '../../contexts/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { getInitials } from '../../utils/initials';
import { SprintBoard } from './SprintBoard';
import { TaskScreen } from './TaskScreen';
import { TaskDone } from './TaskDone';
import { SprintEnd } from './SprintEnd';
import {
  claimSprintTask,
  completeSprintTask,
  fetchCurrentSprint,
  returnSprintTask,
  type SprintData,
} from '../../services/sprints';
// The game stylesheet travels in this page's lazy chunk, not in the shared
// bundle: the territory boundary is real, not just a folder convention.
import '../../styles/game.css';

// Territory of the sprint game. The engine behind /sprints serves the board;
// screens hand work to each other: the board moves tasks, the task screen
// delivers, the celebration completes. The "projetos-guiados" flag gates it.
export function Projects() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const nav = useNavPrincipal();
  const enabled = useFeature('projetos-guiados');
  useSeo({ titulo: t('projects.title'), descricao: t('projects.subtitle') });

  const [data, setData] = useState<SprintData | null>(null);
  const [failed, setFailed] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  // After the sprint ends, "back to projects" shows the finished board.
  const [forceBoard, setForceBoard] = useState(false);

  const reload = useCallback(async () => {
    try {
      setData(await fetchCurrentSprint());
      setFailed(false);
    } catch (err) {
      console.error('Failed to load the current sprint.', err);
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (!enabled) return <Navigate to="/home" replace />;

  const displayName = authUser?.name ?? '';
  const doing = data?.tasks.find((tk) => tk.status === 'doing') ?? null;
  const celebrating = celebratingId ? data?.tasks.find((tk) => tk.id === celebratingId) ?? null : null;
  const nextTask = celebrating ? data?.tasks.find((tk) => tk.locked) ?? null : null;

  // The board choreographs the move locally; this applies it to the engine
  // state and persists it. On failure the reload brings the truth back.
  async function moveTask(taskId: string, to: 'doing' | 'backlog') {
    setData((current) =>
      current
        ? {
            ...current,
            tasks: current.tasks.map((tk) => (tk.id === taskId ? { ...tk, status: to } : tk)),
          }
        : current,
    );
    try {
      if (to === 'doing') await claimSprintTask(taskId);
      else await returnSprintTask(taskId);
    } catch (err) {
      console.error('Failed to move the sprint task.', err);
      reload();
    }
  }

  // Leaving the celebration completes the task in the engine; the reloaded
  // board knows whether the sprint just ended.
  async function completeFromCelebration(taskId: string) {
    try {
      await completeSprintTask(taskId);
    } catch (err) {
      console.error('Failed to complete the sprint task.', err);
    }
    setCelebratingId(null);
    await reload();
  }

  return (
    <div className="home-shell">
      <div className="home">
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.to === '/projetos' ? ' nav__item--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar__spacer" />
          <div className="streak-pill">
            <Flame size={16} /> {authUser?.streak ?? 0}
          </div>
          <ThemeToggle inline />
          <UserMenu
            initials={getInitials(displayName)}
            level={authUser?.level ?? 1}
            name={displayName}
            email={authUser?.email ?? ''}
          />
        </header>

        <div className="g-root">
          {data?.sprint.over && !forceBoard ? (
            <SprintEnd
              data={data}
              userInitials={getInitials(displayName)}
              onBackToProjects={() => setForceBoard(true)}
            />
          ) : celebrating && data ? (
            <TaskDone
              sprint={data.sprint}
              task={celebrating}
              nextTask={nextTask}
              taskIndex={celebrating.position}
              totalTasks={data.sprint.totalTasks}
              onComplete={() => completeFromCelebration(celebrating.id)}
            />
          ) : openTaskId && doing ? (
            <TaskScreen
              taskId={doing.id}
              deadline={data ? Date.parse(data.sprint.endsAt) : Date.now()}
              taskMeta={data?.sprint ?? null}
              previousTasks={
                data?.tasks
                  .filter((tk) => tk.status === 'done' && tk.position < doing.position)
                  .slice(-2)
                  .reverse() ?? []
              }
              onBack={() => setOpenTaskId(null)}
              onDeliver={() => {
                // Delivering leaves the editor: forgetting to clear this
                // reopens the task screen as soon as the next task is picked.
                setOpenTaskId(null);
                setCelebratingId(doing.id);
              }}
            />
          ) : (
            <SprintBoard
              data={data}
              failed={failed}
              onRetry={reload}
              onMove={moveTask}
              onOpenTask={setOpenTaskId}
              userInitials={getInitials(displayName)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
