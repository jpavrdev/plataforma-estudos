import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from './pages/Home';
import { Trilhas } from './pages/Trilhas';
import { VerifyEmail } from './pages/VerifyEmail';
import { Placeholder } from './pages/Placeholder';

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return isAuthenticated ? children : <Navigate to="/" />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
      <Route path="/cadastro" element={isAuthenticated ? <Navigate to="/home" /> : <Register />} />
      <Route path="/verificar-email" element={<VerifyEmail />} />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
      <Route
        path="/trilhas"
        element={
          <PrivateRoute>
            <Trilhas />
          </PrivateRoute>
        } />
      <Route
        path="/ranking"
        element={
          <PrivateRoute>
            <Placeholder title="Ranking" description="Em breve o ranking global completo aparecerá aqui." />
          </PrivateRoute>
        } />
      <Route
        path="/comunidade"
        element={
          <PrivateRoute>
            <Placeholder title="Comunidade" description="Em breve a atividade da comunidade aparecerá aqui." />
          </PrivateRoute>
        } />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Placeholder title="Perfil" description="Em breve você poderá ver e editar seus dados de perfil aqui." />
          </PrivateRoute>
        } />
      <Route
        path="/progresso"
        element={
          <PrivateRoute>
            <Placeholder title="Meu progresso" description="Em breve seu progresso por trilhas e conquistas aparecerá aqui." />
          </PrivateRoute>
        } />
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
  )
}

export default App;