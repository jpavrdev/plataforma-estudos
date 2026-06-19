import { useAuth } from "../../contexts/AuthContext";

export function Home() {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1> Oi, {user?.name}!</h1>
            <p>Você está logado com o e-mail: <strong>{user?.email}</strong></p>

            <div style={{ marginTop: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                <h3>Seus dados de perfil:</h3>
                <p>Gênero: {user?.gender}</p>
                <p>Telefone: {user?.phone}</p>
            </div>

            <button
                onClick={logout}
                style={{ marginTop: '2rem', backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
            >
                Sair da conta
            </button>
        </div>
    );
}