import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import './style.css';

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login, loading } = useAuth();

    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        try {
            await login(email, password);
            navigate('/home');
            alert('Login realizado com sucesso');
        } catch (err: any) {
            setError(err.response?.data?.erro || 'Erro ao fazer login. Tente Novamente.');
        }
    }

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h1>Entrar</h1>

                {error && <p className="error-message">{error}</p>}

                <div className="input-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="seu@email.com"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Senha</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="********"
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Entrando' : 'Entrar'}
                </button>
            </form>
        </div>
    )
}