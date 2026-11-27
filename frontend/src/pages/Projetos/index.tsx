import { useMemo, useState } from 'react';
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
import { SPRINT, initialTasks } from './sprintData';
// The game stylesheet travels in this page's lazy chunk, not in the shared
// bundle: the territory boundary is real, not just a folder convention.
import '../../styles/game.css';

// Territory of the sprint game: the tab where the student joins a fictional
// team, picks backlog tasks and implements them until the tests pass. The
// "projetos-guiados" flag gates it so nobody trips over work in progress.
export function Projects() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const nav = useNavPrincipal();
  const enabled = useFeature('projetos-guiados');
  useSeo({ titulo: t('projects.title'), descricao: t('projects.subtitle') });

  // The whole game state lives here so the screens hand work to each other:
  // the board moves tasks between columns, the task screen delivers, the
  // celebration screen approves and unlocks the next task.
  const [tasks, setTasks] = useState(initialTasks);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [doneTaskId, setDoneTaskId] = useState<string | null>(null);
  const deadline = useMemo(() => Date.now() + SPRINT.deadlineOffsetMs, []);

  if (!enabled) return <Navigate to="/home" replace />;

  const displayName = authUser?.name ?? '';
  const doing = tasks.find((tk) => tk.status === 'doing') ?? null;
  const doneTask = doneTaskId ? tasks.find((tk) => tk.id === doneTaskId) ?? null : null;
  const doneIndex = doneTask ? tasks.findIndex((tk) => tk.id === doneTask.id) + 1 : 0;
  const nextTask = doneTask ? tasks.find((tk) => tk.locked) ?? null : null;

  function backToBoard() {
    if (!doneTask) return;
    setTasks((list) =>
      list.map((tk) => {
        if (tk.id === doneTask.id) return { ...tk, status: 'done' };
        // The next locked task in line opens up.
        if (tk.locked && tk.id === tasks.find((c) => c.locked)?.id) return { ...tk, locked: false };
        return tk;
      }),
    );
    setDoneTaskId(null);
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
          {doneTask ? (
            <TaskDone
              task={doneTask}
              nextTask={nextTask}
              taskIndex={doneIndex}
              totalTasks={tasks.length}
              onBack={backToBoard}
            />
          ) : openTaskId && doing ? (
            <TaskScreen
              task={doing}
              deadline={deadline}
              onBack={() => setOpenTaskId(null)}
              onDeliver={() => setDoneTaskId(doing.id)}
            />
          ) : (
            <SprintBoard
              tasks={tasks}
              setTasks={setTasks}
              deadline={deadline}
              onOpenTask={setOpenTaskId}
              userInitials={getInitials(displayName)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
