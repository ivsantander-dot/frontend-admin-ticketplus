import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // 1. Extraemos 'accounts' de useMsal()
  const { accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 2. Tomamos la primera cuenta disponible (la sesión actual)
  const account = accounts[0];
  
  // 3. Leemos los claims (información) del token
  const idTokenClaims = account?.idTokenClaims as { roles?: string[] } | undefined;
  
  // Verificar si tiene el rol exacto "admin"
  const hasAdminRole = idTokenClaims?.roles?.includes('admin');

  if (!hasAdminRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-700">
            No tienes permisos de administrador para acceder a este panel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};