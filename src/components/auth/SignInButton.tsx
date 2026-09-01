import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../../auth/loginRequest';

export const SignInButton = () => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated(); // Detecta si hay sesión activa
  const navigate = useNavigate(); // Permite cambiar de ruta

  // Escucha cambios en la autenticación
  useEffect(() => {
    if (isAuthenticated) {
      // Redirige al dashboard. (Cambia '/dashboard' si tu ruta se llama distinto)
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-sm border border-orange-500 transition-colors text-sm"
    >
      Iniciar Sesión con Microsoft
    </button>
  );
};
