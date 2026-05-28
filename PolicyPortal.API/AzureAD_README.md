Azure Entra ID (Azure AD) configuration for PolicyPortal.API

1. Register two App registrations in Azure AD:
   - Frontend SPA (Redirect URI: http://localhost:3000)
   - Backend Web API (Expose an API scope, e.g., api://<API_CLIENT_ID>/access_as_user)

2. Configure API permissions:
   - For SPA, add delegated permission to call the backend scope.
   - Grant admin consent as required.

3. Update `appsettings.json` in `PolicyPortal.API` with values:
   "AzureAd": {
     "Instance": "https://login.microsoftonline.com/",
     "TenantId": "<YOUR_TENANT_ID>",
     "ClientId": "<YOUR_API_CLIENT_ID>",
     "Domain": "<YOUR_TENANT_DOMAIN>",
     "Scopes": "api://<YOUR_API_CLIENT_ID>/access_as_user"
   }

4. Frontend `.env` variables (see policyhub/.env.example):
   REACT_APP_MSAL_CLIENT_ID
   REACT_APP_MSAL_AUTHORITY
   REACT_APP_MSAL_REDIRECT_URI
   REACT_APP_MSAL_SCOPE

5. NuGet / NPM packages required:
   - Backend: Microsoft.Identity.Web (added to csproj)
   - Frontend: @azure/msal-browser, @azure/msal-react (install via npm)

6. Notes:
   - After login, the frontend will redirect back to SPA. MSAL will handle token acquisition.
   - The backend validates incoming access tokens using Microsoft.Identity.Web.
   - User sync middleware will create or update a `User` record on first authenticated API call.
