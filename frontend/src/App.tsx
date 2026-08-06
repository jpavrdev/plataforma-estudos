import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useSeo } from './hooks/useSeo';
import { ToastProvider } from './contexts/ToastContext';
import { Landing } from './pages/Landing';
import { ComunicadoPrompt } from './components/ComunicadoPrompt';
import { BottomNav } from './components/BottomNav';
import { ConquistaToaster } from './components/ConquistaToaster';

// Cada página é baixada só quando a rota abre. A Landing fica no pacote principal
// por ser a primeira tela de quem chega. As páginas exportam por nome, e o lazy
// espera um export default, daí a adaptação em cada linha.
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Trilhas = lazy(() => import('./pages/Trilhas').then((m) => ({ default: m.Trilhas })));
const Roadmaps = lazy(() => import('./pages/Roadmaps').then((m) => ({ default: m.Roadmaps })));
const RoadmapDetalhe = lazy(() =>
  import('./pages/Roadmaps/Detalhe').then((m) => ({ default: m.RoadmapDetalhe })),
);
const Aula = lazy(() => import('./pages/Aula').then((m) => ({ default: m.Aula })));
const TrilhaDetalhe = lazy(() =>
  import('./pages/TrilhaDetalhe').then((m) => ({ default: m.TrilhaDetalhe })),
);
const Estudio = lazy(() => import('./pages/Estudio').then((m) => ({ default: m.Estudio })));
const EstudioHome = lazy(() =>
  import('./pages/EstudioHome').then((m) => ({ default: m.EstudioHome })),
);
const Usuarios = lazy(() => import('./pages/Usuarios').then((m) => ({ default: m.Usuarios })));
const Configuracoes = lazy(() =>
  import('./pages/Configuracoes').then((m) => ({ default: m.Configuracoes })),
);
const Perfil = lazy(() => import('./pages/Perfil').then((m) => ({ default: m.Perfil })));
const Ranking = lazy(() => import('./pages/Ranking').then((m) => ({ default: m.Ranking })));
const Simulados = lazy(() => import('./pages/Simulados').then((m) => ({ default: m.Simulados })));
const Conquistas = lazy(() =>
  import('./pages/Conquistas').then((m) => ({ default: m.Conquistas })),
);
const SimuladoBriefing = lazy(() =>
  import('./pages/Simulados/Briefing').then((m) => ({ default: m.SimuladoBriefing })),
);
const TentativaSimulado = lazy(() =>
  import('./pages/Simulados/Tentativa').then((m) => ({ default: m.TentativaSimulado })),
);
const SimuladosAdmin = lazy(() =>
  import('./pages/SimuladosAdmin').then((m) => ({ default: m.SimuladosAdmin })),
);
const SimuladoEditor = lazy(() =>
  import('./pages/SimuladosAdmin/Editor').then((m) => ({ default: m.SimuladoEditor })),
);
const RoadmapsAdmin = lazy(() =>
  import('./pages/RoadmapsAdmin').then((m) => ({ default: m.RoadmapsAdmin })),
);
const RoadmapEditor = lazy(() =>
  import('./pages/RoadmapsAdmin/Editor').then((m) => ({ default: m.RoadmapEditor })),
);
const Desafios = lazy(() => import('./pages/Desafios').then((m) => ({ default: m.Desafios })));
const Desafio = lazy(() =>
  import('./pages/Desafios/Desafio').then((m) => ({ default: m.Desafio })),
);
const DesafiosAdmin = lazy(() =>
  import('./pages/DesafiosAdmin').then((m) => ({ default: m.DesafiosAdmin })),
);
const ComunicadosAdmin = lazy(() =>
  import('./pages/ComunicadosAdmin').then((m) => ({ default: m.ComunicadosAdmin })),
);
const AssinaturasAdmin = lazy(() =>
  import('./pages/AssinaturasAdmin').then((m) => ({ default: m.AssinaturasAdmin })),
);
const DesafioEditor = lazy(() =>
  import('./pages/DesafiosAdmin/Editor').then((m) => ({ default: m.DesafioEditor })),
);
const VerifyEmail = lazy(() =>
  import('./pages/VerifyEmail').then((m) => ({ default: m.VerifyEmail })),
);
const RecuperarSenha = lazy(() =>
  import('./pages/RecuperarSenha').then((m) => ({ default: m.RecuperarSenha })),
);
const RedefinirSenha = lazy(() =>
  import('./pages/RedefinirSenha').then((m) => ({ default: m.RedefinirSenha })),
);
const OAuthCallback = lazy(() =>
  import('./pages/OAuthCallback').then((m) => ({ default: m.OAuthCallback })),
);
const CertificadoValidar = lazy(() =>
  import('./pages/CertificadoValidar').then((m) => ({ default: m.CertificadoValidar })),
);
const PerfilPublico = lazy(() =>
  import('./pages/PerfilPublico').then((m) => ({ default: m.PerfilPublico })),
);
const Progresso = lazy(() => import('./pages/Progresso').then((m) => ({ default: m.Progresso })));
const Comunidade = lazy(() =>
  import('./pages/Comunidade').then((m) => ({ default: m.Comunidade })),
);
const Apoie = lazy(() => import('./pages/Apoie').then((m) => ({ default: m.Apoie })));
const Curriculo = lazy(() => import('./pages/Curriculo').then((m) => ({ default: m.Curriculo })));
const CompletarPerfil = lazy(() =>
  import('./pages/CompletarPerfil').then((m) => ({ default: m.CompletarPerfil })),
);

function AuthRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return isAuthenticated ? children : <Navigate to="/entrar" />;
}

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/entrar" />;
  if (!user?.username) return <Navigate to="/completar-perfil" replace />;
  return children;
}

function AdminRoute({ children }: { children: React.JSX.Element }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/entrar" />;
  if (!user?.username) return <Navigate to="/completar-perfil" replace />;
  return user?.role === 'admin' ? children : <Navigate to="/home" />;
}

// A URL canônica do perfil é /username: o dono vê a versão editável, os demais a pública.
function PerfilPorUsername() {
  const { user, isAuthenticated } = useAuth();
  const { username } = useParams();
  if (isAuthenticated && user?.username && user.username === username) return <Perfil />;
  return <PerfilPublico />;
}

// /perfil segue funcionando (links antigos), mas redireciona para a URL canônica.
function MeuPerfil() {
  const { user } = useAuth();
  return user?.username ? <Navigate to={`/${user.username}`} replace /> : <Perfil />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  useSeo();

  return (
    <>
      <ComunicadoPrompt />
      <Suspense fallback={<div className="lesson__loading">Carregando...</div>}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Landing />} />
          <Route path="/entrar" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
          <Route
            path="/cadastro"
            element={isAuthenticated ? <Navigate to="/home" /> : <Register />}
          />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/certificados/:code" element={<CertificadoValidar />} />
          <Route
            path="/completar-perfil"
            element={
              <AuthRoute>
                <CompletarPerfil />
              </AuthRoute>
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
            path="/trilhas/:trailId"
            element={
              <PrivateRoute>
                <TrilhaDetalhe />
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
            path="/roadmaps"
            element={
              <PrivateRoute>
                <Roadmaps />
              </PrivateRoute>
            }
          />
          <Route
            path="/roadmaps/:slug"
            element={
              <PrivateRoute>
                <RoadmapDetalhe />
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
            path="/estudio/usuarios"
            element={
              <AdminRoute>
                <Usuarios />
              </AdminRoute>
            }
          />
          <Route
            path="/estudio/roadmaps"
            element={
              <AdminRoute>
                <RoadmapsAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/estudio/roadmaps/:id"
            element={
              <AdminRoute>
                <RoadmapEditor />
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
            path="/estudio/simulados"
            element={
              <AdminRoute>
                <SimuladosAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/estudio/simulados/:slug"
            element={
              <AdminRoute>
                <SimuladoEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/estudio/comunicados"
            element={
              <AdminRoute>
                <ComunicadosAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/estudio/assinaturas"
            element={
              <AdminRoute>
                <AssinaturasAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/estudio/desafios"
            element={
              <AdminRoute>
                <DesafiosAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/estudio/desafios/:id"
            element={
              <AdminRoute>
                <DesafioEditor />
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
            path="/simulados"
            element={
              <PrivateRoute>
                <Simulados />
              </PrivateRoute>
            }
          />
          <Route
            path="/conquistas"
            element={
              <PrivateRoute>
                <Conquistas />
              </PrivateRoute>
            }
          />
          <Route
            path="/simulados/tentativa/:attemptId"
            element={
              <PrivateRoute>
                <TentativaSimulado />
              </PrivateRoute>
            }
          />
          <Route
            path="/simulados/:slug"
            element={
              <PrivateRoute>
                <SimuladoBriefing />
              </PrivateRoute>
            }
          />
          <Route
            path="/desafios"
            element={
              <PrivateRoute>
                <Desafios />
              </PrivateRoute>
            }
          />
          <Route
            path="/desafios/:id"
            element={
              <PrivateRoute>
                <Desafio />
              </PrivateRoute>
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
                <Comunidade />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <MeuPerfil />
              </PrivateRoute>
            }
          />
          <Route
            path="/progresso"
            element={
              <PrivateRoute>
                <Progresso />
              </PrivateRoute>
            }
          />
          <Route
            path="/apoie"
            element={
              <PrivateRoute>
                <Apoie />
              </PrivateRoute>
            }
          />
          <Route
            path="/curriculo"
            element={
              <PrivateRoute>
                <Curriculo />
              </PrivateRoute>
            }
          />
          {/* Perfil compartilhável: /username. Fica por último; rotas fixas têm prioridade. */}
          <Route path="/:username" element={<PerfilPorUsername />} />
        </Routes>
      </Suspense>
      {isAuthenticated && <BottomNav />}
      {isAuthenticated && <ConquistaToaster />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
