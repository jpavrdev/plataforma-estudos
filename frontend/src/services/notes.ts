import api from './api';

export type NoteKind = 'nota' | 'grifo';

export interface LessonNote {
  id: string;
  lessonId: string;
  kind: NoteKind;
  body: string;
  createdAt: string;
}

/** In the whole-track view each card carries the title of the lesson it came from. */
export interface TrailNote extends LessonNote {
  aula: string;
}

export async function listLessonNotes(lessonId: string): Promise<LessonNote[]> {
  const { data } = await api.get(`/lessons/${lessonId}/notes`);
  return data;
}

export async function listTrailNotes(trailId: string): Promise<TrailNote[]> {
  const { data } = await api.get(`/trails/${trailId}/notes`);
  return data;
}

export async function createNote(lessonId: string, kind: NoteKind, body: string): Promise<LessonNote> {
  const { data } = await api.post(`/lessons/${lessonId}/notes`, { tipo: kind, texto: body });
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`);
}
