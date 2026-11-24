import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Trash, Notebook, X } from './Icons';
import {
  createNote,
  deleteNote,
  listTrailNotes,
  type LessonNote,
  type TrailNote,
} from '../services/notes';

type Tab = 'lesson' | 'trail';

// The notebook sits beside the lesson: notes the student writes and highlights
// taken from the text, with a whole-trail tab gathering the journey so far.
export function LessonNotebook({
  trailId,
  lessonId,
  notes,
  onClose,
  onNoteAdded,
  onNoteRemoved,
}: {
  trailId: string;
  lessonId: string;
  notes: LessonNote[];
  onClose: () => void;
  onNoteAdded: (note: LessonNote) => void;
  onNoteRemoved: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>('lesson');
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  // The trail tab owns its data and loads it lazily, only when first opened.
  const [trailNotes, setTrailNotes] = useState<TrailNote[] | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (tab !== 'trail' || trailNotes) return;
    let active = true;
    listTrailNotes(trailId)
      .then((list) => active && setTrailNotes(list))
      .catch((err) => {
        console.error('Failed to load the trail notebook.', err);
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [tab, trailId, trailNotes]);

  async function save() {
    const body = draft.trim();
    if (!body || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      const note = await createNote(lessonId, 'nota', body);
      onNoteAdded(note);
      setDraft('');
      // The trail tab reloads from the server on its next visit: only the backend
      // can join the lesson title into the new note.
      setTrailNotes(null);
      areaRef.current?.focus();
    } catch (err) {
      console.error('Failed to save the note.', err);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(note: LessonNote) {
    try {
      await deleteNote(note.id);
      onNoteRemoved(note.id);
      if (trailNotes) setTrailNotes(trailNotes.filter((n) => n.id !== note.id));
    } catch (err) {
      console.error('Failed to delete the note.', err);
      setFailed(true);
    }
  }

  const fromTrail = trailNotes ?? [];

  return (
    <aside className="notebook" aria-label={t('aula.notebook.aria')}>
      <div className="notebook__head">
        <span className="notebook__title">
          <Notebook size={16} />
          {t('aula.notebook.title')}
        </span>
        <button
          type="button"
          className="notebook__close"
          onClick={onClose}
          aria-label={t('aula.notebook.close')}
        >
          <X size={16} />
        </button>
      </div>

      <div className="notebook__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'lesson'}
          className={`notebook__tab${tab === 'lesson' ? ' notebook__tab--active' : ''}`}
          onClick={() => setTab('lesson')}
        >
          {t('aula.notebook.tabLesson')}
          <span className="notebook__tab-n">{notes.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'trail'}
          className={`notebook__tab${tab === 'trail' ? ' notebook__tab--active' : ''}`}
          onClick={() => setTab('trail')}
        >
          {t('aula.notebook.tabTrail')}
          <span className="notebook__tab-n">{trailNotes ? fromTrail.length : '…'}</span>
        </button>
      </div>

      <div className="notebook__composer">
        <textarea
          ref={areaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('aula.notebook.placeholder')}
          rows={3}
          maxLength={2000}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') save();
          }}
        />
        <button
          type="button"
          className="btn btn--accent notebook__save"
          disabled={!draft.trim() || saving}
          onClick={save}
        >
          {saving ? t('common.saving') : t('aula.notebook.save')}
        </button>
      </div>

      {failed && <div className="auth__alert">{t('aula.notebook.error')}</div>}

      <div className="notebook__list">
        {tab === 'lesson' ? (
          notes.length === 0 ? (
            <p className="notebook__empty">{t('aula.notebook.emptyLesson')}</p>
          ) : (
            notes.map((n) => (
              <NoteCard key={n.id} note={n} onDelete={remove} locale={i18n.language} />
            ))
          )
        ) : fromTrail.length === 0 ? (
          <p className="notebook__empty">
            {trailNotes ? t('aula.notebook.emptyTrail') : t('common.loading')}
          </p>
        ) : (
          fromTrail.map((n) => (
            <NoteCard key={n.id} note={n} onDelete={remove} locale={i18n.language} />
          ))
        )}
      </div>
    </aside>
  );
}

function NoteCard({
  note,
  onDelete,
  locale,
}: {
  note: LessonNote;
  onDelete: (note: LessonNote) => void;
  locale: string;
}) {
  const { t } = useTranslation();
  const lessonTitle = (note as TrailNote).aula;
  return (
    <article className={`notebook__card${note.kind === 'grifo' ? ' notebook__card--highlight' : ''}`}>
      <p className="notebook__card-body">{note.body}</p>
      <div className="notebook__card-meta">
        <span className="notebook__card-info">
          {note.kind === 'grifo' ? t('aula.notebook.kindHighlight') : t('aula.notebook.kindNote')}
          {' · '}
          {relativeDate(note.createdAt, locale, t)}
          {lessonTitle ? ` · ${lessonTitle}` : ''}
        </span>
        <button
          type="button"
          className="notebook__card-del"
          onClick={() => onDelete(note)}
          aria-label={t('aula.notebook.delete')}
        >
          <Trash size={14} />
        </button>
      </div>
    </article>
  );
}

// "today" and "yesterday" cover the common case; anything older becomes a short date.
function relativeDate(iso: string, locale: string, t: TFunction): string {
  const date = new Date(iso);
  const now = new Date();
  const days = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86400000,
  );
  if (days === 0) return t('aula.notebook.today');
  if (days === 1) return t('aula.notebook.yesterday');
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(date);
}
