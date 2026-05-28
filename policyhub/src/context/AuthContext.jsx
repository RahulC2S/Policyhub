import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getAccessToken } from '../services/authService';

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

  useEffect(() => {
    if (!instance) return;
    const savedUser = user;

    const handleAuthResponse = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        const acc = response?.account || instance.getActiveAccount() || instance.getAllAccounts()[0];
        console.debug('AuthContext: handleRedirectPromise response:', response);
        console.debug('AuthContext: msal account after redirect or existing:', acc);

        if (acc) {
          try {
            if (!instance.getActiveAccount()) {
              instance.setActiveAccount(acc);
              console.debug('AuthContext: set active account', acc);
            }
          } catch (e) {
            console.warn('AuthContext: setActiveAccount failed', e);
          }

          const authenticatedUser = createUserFromAccount(acc);
          console.debug('AuthContext: account claims:', acc.idTokenClaims);
          persistUser(authenticatedUser);
        } else if (!savedUser) {
          persistUser(null);
        }
      } catch (err) {
        console.warn('AuthContext: handleRedirectPromise failed', err);
      } finally {
        setLoading(false);
      }
    };

    handleAuthResponse();

    const callbackId = instance.addEventCallback((message) => {
      if (message.eventType === 'msal:loginSuccess') {
        const acc = instance.getActiveAccount() || instance.getAllAccounts()[0];
        const authenticatedUser = createUserFromAccount(acc);
        persistUser(authenticatedUser);
        setLoading(false);
      }
      if (message.eventType === 'msal:loginFailure') {
        persistUser(null);
        setLoading(false);
      }
    });

    return () => {
      if (callbackId) instance.removeEventCallback(callbackId);
    };
  }, [instance]);

  const getToken = async () => {
    return await getAccessToken();
  };

  const logout = async () => {
    try {
      console.debug('AuthContext: logging out');
      persistUser(null);
      const account = instance?.getActiveAccount() || instance?.getAllAccounts()?.[0];
      await instance.logoutRedirect({
        account,
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (err) {
      console.warn('AuthContext: logout failed', err);
      persistUser(null);
    }
  };

  const value = {
    user,
    loading,
    getToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
