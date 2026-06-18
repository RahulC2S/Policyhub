import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getAccessToken } from '../services/authService';
import API from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { instance } = useMsal();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [viewPreference, setViewPreference] = useState(() => {
    try {
      const saved = localStorage.getItem('viewPreference');
      return saved || 'admin';
    } catch {
      return 'admin';
    }
  });

  const clearStoredAuthData = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('viewPreference');
    } catch (err) {
      console.warn('AuthContext: failed to clear localStorage', err);
    }
  };

  const fetchBackendUser = async () => {
    try {
      const response = await API.get('/Users/me');
      return response.data;
    } catch (err) {
      return null;
    }
  };

  const createUserFromAccount = (acc) => {
    if (!acc) return null;
    const claims = acc.idTokenClaims || {};
    const roles = Array.isArray(claims.roles)
      ? claims.roles
      : claims.roles
      ? [claims.roles]
      : [];

    return {
      userId: claims.oid || acc.localAccountId || acc.homeAccountId,
      username: acc.username,
      name: claims.name || acc.name || acc.username,
      fullName:
        claims.name || `${claims.given_name || ''} ${claims.family_name || ''}`.trim() || acc.name || acc.username,
      email: claims.email || claims.preferred_username || acc.username,
      oid: claims.oid,
      tenantId: claims.tid,
      localAccountId: acc.localAccountId,
      roles,
      preferredUsername: claims.preferred_username || acc.username,
    };
  };

  const mergeAccountAndBackendUser = (accountUser, backendUser) => {
    if (!backendUser) return accountUser;

    return {
      ...accountUser,
      ...backendUser,
      roles: accountUser.roles,
      fullName: backendUser.fullName || accountUser.fullName,
      email: backendUser.email || accountUser.email,
    };
  };

  const persistUser = (userData) => {
    setUser(userData);
    try {
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.warn('AuthContext: localStorage set failed', err);
    }
  };

  const clearUserState = () => {
    clearStoredAuthData();
    setViewPreference('admin');
    persistUser(null);
  };

  useEffect(() => {
    if (!instance) return;
    const savedUser = user;

    const loadAuthState = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        const acc = response?.account || instance.getActiveAccount() || instance.getAllAccounts()[0];
        console.debug('AuthContext: handleRedirectPromise response:', response);
        console.debug('AuthContext: msal account after redirect or existing:', acc);

        if (!acc && savedUser) {
          console.debug('AuthContext: clearing stale localStorage user because no MSAL account is present');
          clearUserState();
        }

        if (acc) {
          setIsAuthenticating(true);
          try {
            if (!instance.getActiveAccount()) {
              instance.setActiveAccount(acc);
              console.debug('AuthContext: set active account', acc);
            }
          } catch (e) {
            console.warn('AuthContext: setActiveAccount failed', e);
          }

          const authenticatedUser = createUserFromAccount(acc);
          const backendUser = await fetchBackendUser();
          const mergedUser = mergeAccountAndBackendUser(authenticatedUser, backendUser);
          console.debug('AuthContext: account claims:', acc.idTokenClaims);
          persistUser(mergedUser);
        } else if (!savedUser) {
          persistUser(null);
        }
      } catch (err) {
        console.warn('AuthContext: handleRedirectPromise failed', err);
        clearUserState();
      } finally {
        setLoading(false);
        setIsAuthenticating(false);
      }
    };

    loadAuthState();

    const callbackId = instance.addEventCallback(async (message) => {
      if (message.eventType === 'msal:loginStart') {
        setIsAuthenticating(true);
      }

      if (message.eventType === 'msal:loginSuccess') {
        const acc = instance.getActiveAccount() || instance.getAllAccounts()[0];
        const authenticatedUser = createUserFromAccount(acc);
        const backendUser = await fetchBackendUser();
        const mergedUser = mergeAccountAndBackendUser(authenticatedUser, backendUser);
        persistUser(mergedUser);
        setLoading(false);
        setIsAuthenticating(false);
      }

      if (message.eventType === 'msal:loginFailure') {
        clearUserState();
        setLoading(false);
        setIsAuthenticating(false);
        window.location.replace('/login');
      }
    });

    return () => {
      if (callbackId) instance.removeEventCallback(callbackId);
    };
  }, [instance]);

  const getToken = async () => {
    return await getAccessToken();
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      const acc = instance.getActiveAccount() || instance.getAllAccounts()[0];
      if (!acc) {
        clearUserState();
        return null;
      }

      if (!instance.getActiveAccount()) {
        instance.setActiveAccount(acc);
      }

      const authenticatedUser = createUserFromAccount(acc);
      const backendUser = await fetchBackendUser();
      const mergedUser = mergeAccountAndBackendUser(authenticatedUser, backendUser);
      persistUser(mergedUser);
      return mergedUser;
    } catch (err) {
      console.warn('AuthContext: refreshUser failed', err);
      clearUserState();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startLogin = () => {
    clearStoredAuthData();
    persistUser(null);
    setIsAuthenticating(true);
  };

  const setView = (view) => {
    if (['admin', 'employee'].includes(view)) {
      setViewPreference(view);
      try {
        localStorage.setItem('viewPreference', view);
      } catch (err) {
        console.warn('AuthContext: localStorage setView failed', err);
      }
    }
  };

  const logout = async () => {
    try {
      console.debug('AuthContext: logging out');
      clearUserState();
      const account = instance?.getActiveAccount() || instance?.getAllAccounts()?.[0];
      await instance.logoutRedirect({
        account,
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (err) {
      console.warn('AuthContext: logout failed', err);
      clearUserState();
    }
  };

  const value = {
    user,
    loading,
    isAuthenticating,
    getToken,
    refreshUser,
    startLogin,
    logout,
    viewPreference,
    setView,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
