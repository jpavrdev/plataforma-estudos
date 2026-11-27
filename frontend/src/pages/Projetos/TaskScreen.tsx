import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, ChevronRight, ClockExam, Play, X } from '../../components/Icons';
import { SPRINT, TASK_DETAIL, type SprintTask } from './sprintData';
import { useCountdown } from './useCountdown';

// One test resolves every 560ms while running (T3), straight from the spec.
const TEST_MS = 560;

type TestState = 'idle' | 'run' | 'pass' | 'fail';

// Placeholder grader: the sprint engine will grade the submission for real.
// Until it exists, the untouched starter fails the case-insensitive test
// (the bug the task is about) and any edit to the code passes everything.
function grade(starterUntouched: boolean): TestState[] {
  return TASK_DETAIL.tests.map((_, i) =>
    starterUntouched && i === 2 ? 'fail' : 'pass',
  );
}

// Screen 2 of the sprint game: the task. The spec the PO wrote on the left,
// the editor in the middle, the tests on the right; each criterion lights up
// together with the test that proves it.
export function TaskScreen({
  task,
  deadline,
  onBack,
  onDeliver,
}: {
  task: SprintTask;
  deadline: number;
  onBack: () => void;
  onDeliver: () => void;
}) {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  const [states, setStates] = useState<TestState[]>(() => TASK_DETAIL.tests.map(() => 'idle'));
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [code, setCode] = useState(TASK_DETAIL.starterCode);
  const [edited, setEdited] = useState(false);
  const [saved, setSaved] = useState(true);
  const clock = useCountdown(deadline);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    mainRef.current?.focus();
    return () => timers.current.forEach(window.clearTimeout);
  }, []);

  // Local save with a small debounce: honest "Salvo" indicator, no backend yet.
  useEffect(() => {
    if (saved) return;
    const id = window.setTimeout(() => setSaved(true), 900);
    return () => window.clearTimeout(id);
  }, [code, saved]);

  const allPassed = score === TASK_DETAIL.tests.length && !running;
  const failed = states.includes('fail') && !running;
  const daviLine = allPassed
    ? t('projects.daviPass')
    : failed
      ? t('projects.daviFail')
      : t('projects.daviIdle');

  function editCode(next: string) {
    setCode(next);
    setEdited(true);
    setSaved(false);
  }

  function runTests() {
    if (running) return;
    setRunning(true);
    setStates(TASK_DETAIL.tests.map(() => 'idle'));
    setScore(0);

    const results = grade(!edited);
    results.forEach((result, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setStates((list) => list.map((s, j) => (j === i ? 'run' : s)));
        }, i * TEST_MS),
        window.setTimeout(() => {
          setStates((list) => list.map((s, j) => (j === i ? result : s)));
          if (result === 'pass') setScore((n) => n + 1);
          if (i === TASK_DETAIL.tests.length - 1) setRunning(false);
        }, (i + 1) * TEST_MS),
      );
    });
  }

  return (
    <main className="g-task-screen" ref={mainRef} tabIndex={-1}>
      <h1 className="g-sr-only">
        {t('projects.taskSrTitle', { title: task.title, index: 3, total: 5 })}
      </h1>

      {/* Focus bar: back to the board, task identity, deadline and actions. */}
      <div className="g-focus-bar">
        <button type="button" className="g-btn g-btn--quiet g-focus-bar__back" onClick={onBack}>
          <ChevronLeft size={16} aria-hidden="true" />
          <span>{t('projects.backToBoard')}</span>
        </button>
        <div className="g-focus-bar__title">
          <span className="g-tag">
            {t('projects.taskMeta', { sprint: SPRINT.number, index: 3, total: 5 })}
          </span>
          <div className="g-focus-bar__name">
            <strong>{task.title}</strong>
            <span className="g-tag">{task.tag}</span>
            <span className="g-pts">{task.points} pts</span>
          </div>
        </div>
        <div className="g-focus-bar__actions">
          <span className="g-clock-pill" role="timer" aria-label={t('projects.deadlineLabel')}>
            <ClockExam size={15} aria-hidden="true" />
            <span>{t('projects.clockCompact', { d: Number(clock.dd), h: clock.hh, m: clock.mm, s: clock.ss })}</span>
          </span>
          <button type="button" className="g-btn g-btn--dark" onClick={runTests} disabled={running}>
            <Play size={13} aria-hidden="true" />
            <span>{running ? t('projects.running') : t('projects.runTests')}</span>
          </button>
          {allPassed ? (
            <button type="button" className="g-btn g-btn--primary g-deliver-in" onClick={onDeliver}>
              <span>{t('projects.deliver')}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="g-btn g-btn--locked"
              disabled
              title={t('projects.deliverLockedTitle')}
            >
              {t('projects.deliver')}
            </button>
          )}
        </div>
      </div>

      <div className="g-task">
        {/* Specification */}
        <section className="g-pane g-pane--spec g-tile g-enter" aria-labelledby="g-spec-h">
          <div className="g-msg">
            <span className="g-avatar g-avatar--lia" aria-hidden="true">L</span>
            <div className="g-msg__body">
              <span className="g-who">LIA · {t('projects.rolePo')}</span>
              <p className="g-bubble">{TASK_DETAIL.poAsk}</p>
            </div>
          </div>
          <div className="g-pane__head">
            <span className="g-label">{t('projects.specLabel')}</span>
            <h2 id="g-spec-h">{t('projects.specTitle')}</h2>
          </div>
          <ol className="g-crits">
            {TASK_DETAIL.criteria.map((crit, i) => (
              <li className="g-crit" data-state={states[i]} key={crit}>
                <span className="g-mk" aria-hidden="true">
                  <span className="g-mk__num">{i + 1}</span>
                  <span className="g-mk__ok"><Check size={13} /></span>
                  <span className="g-mk__no"><X size={12} /></span>
                </span>
                <span className="g-crit__text">{crit}</span>
              </li>
            ))}
          </ol>
          <div className="g-pane__foot g-base">
            <span className="g-label">{t('projects.fromPreviousLabel')}</span>
            <div className="g-base__chips">
              {TASK_DETAIL.baseChips.map((chip) => (
                <span className="g-ok-chip" key={chip}>
                  <Check size={13} aria-hidden="true" />
                  <span>{chip}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="g-pane g-pane--editor g-enter" style={{ ['--d' as string]: '.1s' }} aria-label={t('projects.editorAria')}>
          <div className="g-tabs">
            <button type="button" className="g-tab" aria-pressed="true">cadastro.rs</button>
            <span className="g-tabs__saved" data-state={saved ? 'saved' : 'editing'}>
              {saved ? t('projects.saved') : t('projects.editing')}
            </span>
          </div>
          <CodeEditor
            code={code}
            onChange={editCode}
            flagLine={failed ? TASK_DETAIL.failLine : null}
            ariaLabel={t('projects.editorAria')}
          />
          <div className="g-editor__status">
            <span>Rust</span>
            <span>{t('projects.editorHint')}</span>
          </div>
        </section>

        {/* Tests */}
        <section className="g-pane g-pane--tests g-tile g-enter" style={{ ['--d' as string]: '.2s' }} aria-labelledby="g-tests-h">
          <div className="g-tests__head">
            <div className="g-pane__head">
              <span className="g-label">{t('projects.testsLabel')}</span>
              <h2 id="g-tests-h">{t('projects.testsTitleIdle')}</h2>
            </div>
            <span className="g-score" key={score} title={t('projects.scoreTitle')}>
              {score}/{TASK_DETAIL.tests.length}
            </span>
          </div>
          <div className="g-segs" aria-hidden="true">
            {TASK_DETAIL.tests.map((test, i) => (
              <span className="g-seg" data-state={states[i]} key={test.name} />
            ))}
          </div>
          <ol className="g-trows">
            {TASK_DETAIL.tests.map((test, i) => (
              <li className="g-trow" data-state={states[i]} key={test.name}>
                <span className="g-mk" aria-hidden="true">
                  <span className="g-mk__ok"><Check size={13} /></span>
                  <span className="g-mk__no"><X size={12} /></span>
                </span>
                <span className="g-trow__name">{test.name}</span>
                <span className="g-trow__ms">{states[i] === 'pass' || states[i] === 'fail' ? `${test.ms} ms` : ''}</span>
              </li>
            ))}
          </ol>

          {failed && (
            <div className="g-result g-result--fail" role="status">
              <strong>{TASK_DETAIL.failTitle}</strong>
              <span>{TASK_DETAIL.failBody}</span>
            </div>
          )}
          {allPassed && (
            <div className="g-result g-result--pass" role="status">
              <Check size={16} aria-hidden="true" />
              <span>{t('projects.allPassing')}</span>
            </div>
          )}

          <div className="g-pane__foot g-msg">
            <span className="g-avatar g-avatar--davi" aria-hidden="true">D</span>
            <div className="g-msg__body" aria-live="polite">
              <span className="g-who">DAVI · {t('projects.roleReviewer')}</span>
              <p className="g-bubble" key={daviLine}>{daviLine}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Editable code with a highlight layer behind a transparent textarea. Both
// layers are absolutely stacked and share one padding scheme, so the caret
// lands exactly on the painted text; line numbers are CSS counters on the
// painted layer, which keeps the two layers from ever drifting apart.
function CodeEditor({
  code,
  onChange,
  flagLine,
  ariaLabel,
}: {
  code: string;
  onChange: (next: string) => void;
  flagLine: number | null;
  ariaLabel: string;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const hlRef = useRef<HTMLPreElement>(null);

  const lines = useMemo(() => code.split('\n'), [code]);

  function syncScroll() {
    const area = areaRef.current;
    if (!area) return;
    if (hlRef.current) {
      hlRef.current.scrollTop = area.scrollTop;
      hlRef.current.scrollLeft = area.scrollLeft;
    }
  }

  return (
    <div className="g-code-wrap">
      <pre className="g-hl" ref={hlRef} aria-hidden="true">
        <code>
          {lines.map((line, i) => (
            <div className={`g-ln${flagLine === i + 1 ? ' g-ln--flag' : ''}`} key={i}>
              {highlightRust(line)}
            </div>
          ))}
        </code>
      </pre>
      <textarea
        className="g-code-input"
        ref={areaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label={ariaLabel}
      />
    </div>
  );
}

// Tiny Rust highlight: keywords, types, strings and comments. The real editor
// (CodeMirror) arrives with the sprint engine; this is the game's stand-in.
const RUST_TOKEN =
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|\b(pub|async|fn|let|if|return|mut|await|use|struct|Ok|Err)\b|\b([A-Z][A-Za-z0-9_]*)\b/g;

function highlightRust(line: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  RUST_TOKEN.lastIndex = 0;
  while ((match = RUST_TOKEN.exec(line)) !== null) {
    if (match.index > last) out.push(line.slice(last, match.index));
    const cls = match[1] ? 'g-c' : match[2] ? 'g-s' : match[3] ? 'g-k' : 'g-t';
    out.push(
      <span className={cls} key={match.index}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out.length ? out : ' ';
}
