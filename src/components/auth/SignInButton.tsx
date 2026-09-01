import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../auth/loginRequest';

export const SignInButton = () => {
  const { instance } = useMsal();

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
