import { Navigate } from 'react-router-dom';
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
    // const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    // await msalInstance.logoutRedirect({
    //   account,
    //   postLogoutRedirectUri: window.location.origin,
    // });
  
    localStorage.clear();
    Navigate('/login');
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
    console.warn('authService: acquireTokenSilent failed', err);
    try {
      await msalInstance.acquireTokenRedirect(request);
      // acquireTokenRedirect does not return a response here
      return null;
    } catch (inner) {
      console.error('Token acquisition failed', inner);
      return null;
    }
  }
};

export const getAccount = () => msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;
