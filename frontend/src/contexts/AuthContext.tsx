import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../services/api";

interface User {
    id: string,
    name: string,
    email: string,
    gender: string,
    phone: string,
    role?: 'user' | 'admin' | 'moderator'
}

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean,
    loading: boolean;
    login: (email: string, password: (string)) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const StoragedToken = localStorage.getItem('@App:accessToken');
            const storagedUser = localStorage.getItem('@App:user');

            if (StoragedToken && storagedUser) {
                setUser(JSON.parse(storagedUser));
                api.defaults.headers.Authorization = `Bearer ${StoragedToken}`;
            }
            setLoading(false);
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

    }

    async function logout() {
        try {
            await api.post('/logout');
        } catch {

        } finally {
            localStorage.clear();
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}