import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { aplicarAccent, accentSalvo, aplicarFundo, fundoSalvo, aplicarVeu, veuSalvo } from '../utils/accent';
import { urlImagem } from '../utils/urlImagem';

interface User {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  gender: string;
  phone: string;
  role?: 'user' | 'admin' | 'moderator';
  streak?: number;
  level?: number;
  avatarUrl?: string | null;
  apoiador?: boolean;
  accent?: string | null;
  backgroundUrl?: string | null;
  backgroundDim?: number | null;
  features?: string[];
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  entrarComToken: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  atualizarUsuario: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const StoragedToken = localStorage.getItem('@App:accessToken');
      const storagedUser = localStorage.getItem('@App:user');

      if (!StoragedToken) {
        setLoading(false);
        return;
      }

      api.defaults.headers.Authorization = `Bearer ${StoragedToken}`;
      // Mostra o cache na hora (sem tela de loading) e revalida com /me em
      // segundo plano, trazendo streak/role/perfil atualizados.
      aplicarAccent(accentSalvo());
      aplicarFundo(fundoSalvo());
      aplicarVeu(veuSalvo());
      if (storagedUser) {
        setUser(JSON.parse(storagedUser));
        setLoading(false);
      }

      try {
        const { data } = await api.get('/me');
        setUser(data);
        localStorage.setItem('@App:user', JSON.stringify(data));
        aplicarAccent(data.apoiador ? data.accent : null);
        aplicarFundo(data.apoiador ? urlImagem(data.backgroundUrl) : null);
        aplicarVeu(data.apoiador ? data.backgroundDim : null);
      } catch (e) {
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          localStorage.clear();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function login(email: string, password: string) {
    const response = await api.post('/login', { email: email.trim(), password });
    const { token } = response.data;

    localStorage.setItem('@App:accessToken', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;

    const meResponse = await api.get('/me');
    setUser(meResponse.data);
    localStorage.setItem('@App:user', JSON.stringify(meResponse.data));
    aplicarAccent(meResponse.data.apoiador ? meResponse.data.accent : null);
    aplicarFundo(meResponse.data.apoiador ? urlImagem(meResponse.data.backgroundUrl) : null);
    aplicarVeu(meResponse.data.apoiador ? meResponse.data.backgroundDim : null);
  }

  // Entra a partir de um access token já emitido (usado no callback do login social).
  async function entrarComToken(accessToken: string) {
    localStorage.setItem('@App:accessToken', accessToken);
    api.defaults.headers.Authorization = `Bearer ${accessToken}`;
    const { data } = await api.get('/me');
    setUser(data);
    localStorage.setItem('@App:user', JSON.stringify(data));
    aplicarAccent(data.apoiador ? data.accent : null);
    aplicarFundo(data.apoiador ? urlImagem(data.backgroundUrl) : null);
    aplicarVeu(data.apoiador ? data.backgroundDim : null);
  }

  async function logout() {
    try {
      await api.post('/logout');
    } catch {
      // Mesmo se a chamada falhar, limpamos a sessão local no finally.
    } finally {
      localStorage.clear();
      aplicarAccent(null);
      aplicarFundo(null);
      aplicarVeu(null);
      setUser(null);
    }
  }

  // Atualiza campos do usuário logado (ex.: foto ou nome mudados no perfil) e persiste no cache.
  function atualizarUsuario(patch: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      const novo = { ...prev, ...patch };
      localStorage.setItem('@App:user', JSON.stringify(novo));
      return novo;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        entrarComToken,
        logout,
        atualizarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Checa se o usuário logado tem uma feature liberada (flag "on", ou "beta" com
// o usuário na allowlist). A lista vem pronta do /me.
export function useFeature(key: string): boolean {
  const { user } = useAuth();
  return user?.features?.includes(key) ?? false;
}
