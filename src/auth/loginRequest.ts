import type { RedirectRequest } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_CLIENT_ID ?? '';
const apiScope = `api://${clientId}/access_as_user`;

export const loginRequest: RedirectRequest = {
  // Quitamos 'User.Read' y agregamos tu apiScope
  scopes: ['openid', 'profile', apiScope],
};