import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./pages/Login";
import { Home } from './pages/Home';

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return isAuthenticated ? children : <Navigate to="/" />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      { /* Se já estiver logado manda pra Home */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
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