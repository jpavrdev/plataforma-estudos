const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function SocialAuth() {
  const entrar = (provider: 'google' | 'github') => {
    window.location.href = `${API}/auth/${provider}`;
  };

  return (
    <>
      <div className="auth__social">
        <button type="button" className="btn btn--ghost" onClick={() => entrar('google')}>
          <span className="provider">G</span> Google
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => entrar('github')}>
          <span className="provider provider--mono">&lt;&gt;</span> GitHub
        </button>
      </div>

      <div className="divider">
        <span>ou com e-mail</span>
      </div>
    </>
  );
}
