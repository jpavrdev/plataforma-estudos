import api from './api';

export interface PerfilPublicoData {
  name: string;
  username: string;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  languages: string[];
  github: string | null;
  linkedin: string | null;
  x: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  memberSince: string;
  apoiador: boolean;
  xp: number;
  level: number;
  lessonsCompleted: number;
  questionsCorrect: number;
  challengesCompleted: number;
  streak: number;
  conquistas: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string | null;
  }[];
  trilhas: {
    name: string;
    trailLevel: 'iniciante' | 'intermediario' | 'avancado';
    totalLessons: number;
    completedLessons: number;
    progress: number;
  }[];
  certificados: {
    code: string;
    trailName: string;
    language: string | null;
    workloadHours: number;
    issuedAt: string;
  }[];
}

export async function obterPerfilPublico(username: string) {
  const { data } = await api.get<PerfilPublicoData>(`/perfis/${username}`);
  return data;
}
