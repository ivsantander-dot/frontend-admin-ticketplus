import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { RabbitMQPanel } from './pages/RabbitMQPanel';
import { AnaliticaPanel } from './pages/AnaliticaPanel';
import { KafkaPanel } from './pages/KafkaPanel';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { UsuariosPanel } from './pages/UsuariosPanel';
import { EventosPanel } from './pages/EventosPanel';
import { TicketsPanel } from './pages/TicketsPanel';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rabbitmq"
            element={
              <ProtectedRoute>
                <Layout>
                  <RabbitMQPanel />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analitica"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnaliticaPanel />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kafka"
            element={
              <ProtectedRoute>
                <Layout>
                  <KafkaPanel />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />

          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <Layout>
                  <UsuariosPanel />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/eventos"
            element={
              <ProtectedRoute>
                <Layout>
                  <EventosPanel />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Layout>
                  <TicketsPanel />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;