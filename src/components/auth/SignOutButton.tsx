import { useMsal } from '@azure/msal-react';

export const SignOutButton = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-sm border border-gray-300 transition-colors text-sm"
    >
      Cerrar Sesión
    </button>
  );
};
