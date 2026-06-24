import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID,
    authority: process.env.REACT_APP_MSAL_AUTHORITY,
    redirectUri: process.env.REACT_APP_MSAL_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: process.env.REACT_APP_MSAL_REDIRECT_URI || window.location.origin,
  },

  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

const configuredScopes = process.env.REACT_APP_MSAL_SCOPE
  ? process.env.REACT_APP_MSAL_SCOPE.split(' ').filter(Boolean)
  : [];

export const loginRequest = {
  scopes: Array.from(new Set(["openid", "profile", ...configuredScopes])),
};

export const msalInstance = new PublicClientApplication(msalConfig);