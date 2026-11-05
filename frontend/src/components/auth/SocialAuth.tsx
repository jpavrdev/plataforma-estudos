import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function SocialAuth() {
  const { t } = useTranslation();
  const signIn = (provider: 'google' | 'github') => {
    window.location.href = `${API}/auth/${provider}`;
  };

  return (
    <>
      <div className="divider">
        <span>{t('auth.socialDivider')}</span>
      </div>

      <div className="auth__social">
        <button type="button" className="btn btn--ghost" onClick={() => signIn('google')}>
          <span className="provider">G</span> Google
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => signIn('github')}>
          <span className="provider provider--mono">&lt;&gt;</span> GitHub
        </button>
      </div>
    </>
  );
}
