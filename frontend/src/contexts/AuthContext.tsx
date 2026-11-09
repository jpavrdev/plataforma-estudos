import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import api from '../services/api';
import i18n, { currentLocale, LOCALES, setLocale, type Locale } from '../i18n';
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
  // Admin without 2FA enabled, or with a session older than the activation: the
  // admin area stays blocked.
  pendingTwoFactor?: '2fa_required' | '2fa_session' | null;
  // Language saved in the account; it wins over the one of the screen at sign-in.
  locale?: Locale;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ challenge?: string }>;
  confirmTwoFactor: (challenge: string, code: string) => Promise<void>;
  entrarComToken: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  atualizarUsuario: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Merges a patch into the signed-in user and keeps the cache in step.
function mergeUser(patch: Partial<User>) {
  return (prev: User | null) => {
    if (!prev) return prev;
    const next = { ...prev, ...patch };
    localStorage.setItem('@App:user', JSON.stringify(next));
    return next;
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // A language change made while signed in (the profile selector or the toggle on
  // other screens) is saved in the account, which also decides the emails' language.
  useEffect(() => {
    function saveInAccount(language: string) {
      const current = userRef.current;
      const locale = LOCALES.find((l) => l === language);
      if (!current || !locale || current.locale === locale) return;
      api
        .put('/me/locale', { locale })
        .then(() => setUser(mergeUser({ locale })))
        .catch((e: unknown) => console.error('Could not save the language in the account', e));
    }
    i18n.on('languageChanged', saveInAccount);
    return () => i18n.off('languageChanged', saveInAccount);
  }, []);

  // The account language is applied when the user loads: at sign-in, at the social
  // sign-in and when the app opens with a session. It comes after the effect that
  // updates userRef, so the change it causes is not saved back.
  useEffect(() => {
    if (user?.locale && user.locale !== currentLocale()) setLocale(user.locale);
  }, [user?.locale]);

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

  async function login(email: string, password: string): Promise<{ challenge?: string }> {
    const response = await api.post('/login', { email: email.trim(), password });
    // 2FA account: the password only opens the challenge, and the code completes the login.
    if (response.data.challenge) return { challenge: response.data.challenge as string };
    const { token } = response.data;

    localStorage.setItem('@App:accessToken', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;

    const meResponse = await api.get('/me');
    setUser(meResponse.data);
    localStorage.setItem('@App:user', JSON.stringify(meResponse.data));
    aplicarAccent(meResponse.data.apoiador ? meResponse.data.accent : null);
    aplicarFundo(meResponse.data.apoiador ? urlImagem(meResponse.data.backgroundUrl) : null);
    aplicarVeu(meResponse.data.apoiador ? meResponse.data.backgroundDim : null);
    return {};
  }

  async function confirmTwoFactor(challenge: string, code: string) {
    const { data } = await api.post('/login/2fa', { challenge, code });
    await entrarComToken(data.token);
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
    setUser(mergeUser(patch));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        confirmTwoFactor,
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
