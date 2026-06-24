import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance, loginRequest } from '../auth/msalConfig';

// Simple wrapper around MSAL to acquire tokens and manage session
export const login = async () => {
  try {
    await msalInstance.loginRedirect(loginRequest);
  } catch (err) {
    console.error('MSAL login error', err);
    throw err;
  }
};

export const logout = async () => {
  try {
    const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    await msalInstance.logoutRedirect({
      account,
      postLogoutRedirectUri: window.location.origin,
    });
  } catch (err) {
    console.error('MSAL logout error', err);
  }
};

export const getAccessToken = async () => {
  const active = msalInstance.getActiveAccount();
  const accounts = msalInstance.getAllAccounts();
  const account = active || accounts[0];
  if (!account) return null;

  const request = {
    account,
    scopes: loginRequest.scopes,
    forceRefresh: false,
  };

  try {
    const response = await msalInstance.acquireTokenSilent(request);
    console.debug('authService: acquired token silently');
    return response.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      console.warn('authService: silent token acquisition requires interaction', err);
    } else {
      console.warn('authService: acquireTokenSilent failed', err);
    }
    return null;
  }
};

export const getAccount = () => msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;
