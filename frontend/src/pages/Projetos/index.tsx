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
  // the board moves tasks between columns, the task screen delivers to review.
  const [tasks, setTasks] = useState(initialTasks);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const deadline = useMemo(() => Date.now() + SPRINT.deadlineOffsetMs, []);

  if (!enabled) return <Navigate to="/home" replace />;

  const displayName = authUser?.name ?? '';
  const doing = tasks.find((tk) => tk.status === 'doing') ?? null;

  function deliverToReview(taskId: string) {
    setTasks((list) => list.map((tk) => (tk.id === taskId ? { ...tk, status: 'review' } : tk)));
    setOpenTaskId(null);
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
          {openTaskId && doing ? (
            <TaskScreen
              task={doing}
              deadline={deadline}
              onBack={() => setOpenTaskId(null)}
              onDeliver={() => deliverToReview(doing.id)}
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
