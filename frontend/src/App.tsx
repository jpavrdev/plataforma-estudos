import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Trilhas } from './pages/Trilhas';
import { Aula } from './pages/Aula';
import { Estudio } from './pages/Estudio';
import { EstudioHome } from './pages/EstudioHome';
import { Configuracoes } from './pages/Configuracoes';
import { Perfil } from './pages/Perfil';
import { Ranking } from './pages/Ranking';
import { VerifyEmail } from './pages/VerifyEmail';
import { OAuthCallback } from './pages/OAuthCallback';
import { CompletarPerfil } from './pages/CompletarPerfil';
import { Placeholder } from './pages/Placeholder';

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return isAuthenticated ? children : <Navigate to="/" />;
}

function AdminRoute({ children }: { children: React.JSX.Element }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/" />;
  return user?.role === 'admin' ? children : <Navigate to="/home" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
      <Route path="/cadastro" element={isAuthenticated ? <Navigate to="/home" /> : <Register />} />
      <Route path="/verificar-email" element={<VerifyEmail />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route
        path="/completar-perfil"
        element={
          <PrivateRoute>
            <CompletarPerfil />
          </PrivateRoute>
        }
      />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/trilhas"
        element={
          <PrivateRoute>
            <Trilhas />
          </PrivateRoute>
        }
      />
      <Route
        path="/trilhas/:trailId/aula/:lessonId"
        element={
          <PrivateRoute>
            <Aula />
          </PrivateRoute>
        }
      />
      <Route
        path="/estudio"
        element={
          <AdminRoute>
            <EstudioHome />
          </AdminRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <AdminRoute>
            <Configuracoes />
          </AdminRoute>
        }
      />
      <Route
        path="/estudio/:trailId"
        element={
          <AdminRoute>
            <Estudio />
          </AdminRoute>
        }
      />
      <Route
        path="/ranking"
        element={
          <PrivateRoute>
            <Ranking />
          </PrivateRoute>
        }
      />
      <Route
        path="/comunidade"
        element={
          <PrivateRoute>
            <Placeholder
              title="Comunidade"
              description="Em breve a atividade da comunidade aparecerá aqui."
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />
      <Route
        path="/progresso"
        element={
          <PrivateRoute>
            <Placeholder
              title="Meu progresso"
              description="Em breve seu progresso por trilhas e conquistas aparecerá aqui."
            />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes></AppRoutes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
