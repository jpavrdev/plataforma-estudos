import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../services/api";

interface User {
    id: string,
    name: string,
    emails: string
}

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean,
    loading: boolean;
    login: (email: string, password: (string)) => Promise<void>;
    logout: () => void;
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

    async function login(email: string, password: (string)) {
        const response = await api.post('/login', { email, password });

        const { accessToken, refreshToken, user: userData } = response.data;

        setUser(userData);

        localStorage.setItem('@App:accessToken', accessToken);
        localStorage.setItem('@App:refreshToken', refreshToken);
        localStorage.setItem('@App:user', JSON.stringify(userData));

        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
    }

    function logout() {
        localStorage.clear();
        setUser(null);
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