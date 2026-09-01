import { Configuration } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_CLIENT_ID;
const tenantId = import.meta.env.VITE_TENANT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

// Validar que los IDs no sean placeholders
export const isAuthConfigured = (): boolean => {
  return (
    clientId !== 'REEMPLAZAR_CON_TU_CLIENT_ID' &&
    tenantId !== 'REEMPLAZAR_CON_TU_TENANT_ID' &&
    clientId !== undefined &&
    tenantId !== undefined &&
    clientId !== '' &&
    tenantId !== ''
  );
};

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId || '',
    authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
    redirectUri: redirectUri || 'http://localhost:5173',
    postLogoutRedirectUri: redirectUri || 'http://localhost:5173',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};
