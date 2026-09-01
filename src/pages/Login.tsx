import { isAuthConfigured } from '../auth/msalConfig';
import { SignInButton } from '../components/auth/SignInButton';

export const Login = () => {
  const isConfigured = isAuthConfigured();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-sm shadow-sm border-t-4 border-orange-500 border-x border-b border-gray-200 max-w-md w-full">
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              TicketPlus
            </h1>
            <p className="text-sm text-gray-500 mt-1">Panel de Administración</p>
          </div>
          <div className="h-px bg-gray-200"></div>
        </div>

        {isConfigured ? (
          <div>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Inicia sesión con tu cuenta de Microsoft para acceder al panel de administración.
            </p>
            <SignInButton />
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-sm p-4">
            <h2 className="text-sm font-semibold text-orange-900 mb-2">
              Configuración Incompleta
            </h2>
            <p className="text-orange-800 text-xs leading-relaxed">
              La configuración de autenticación no está completa. Por favor, configura las variables de entorno
              (VITE_CLIENT_ID, VITE_TENANT_ID) en el archivo .env
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Solo usuarios con rol administrador pueden acceder
          </p>
        </div>
      </div>
    </div>
  );
};
