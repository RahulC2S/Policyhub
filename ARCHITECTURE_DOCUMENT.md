# Policy Hub - Comprehensive Architecture Document

**Version:** 1.0  
**Date:** June 2026  
**Project:** PolicyHub - Enterprise Policy Management System  

---

## Executive Summary

Policy Hub is a modern, cloud-native enterprise policy management platform designed to streamline policy distribution, enforcement, and acknowledgment across organizations. Built with a scalable microservices approach on Azure infrastructure, the system ensures secure authentication, role-based access control (RBAC), and comprehensive audit trails.

### Key Features
- Azure AD SSO authentication with MSAL
- Role-based access control (Employee, HRAdmin, Auditor, SuperAdmin)
- Policy versioning and approval workflows
- Digital signatures and policy acknowledgments
- Real-time notifications
- Comprehensive audit logging
- Secure blob storage for policy documents

### Technology Stack
- **Frontend:** React 18.3, TypeScript, Axios, Azure MSAL
- **Backend:** .NET 8, ASP.NET Core, Entity Framework Core
- **Database:** Azure SQL Server
- **Storage:** Azure Blob Storage
- **Authentication:** Azure Entra ID (Azure AD)
- **Deployment:** Azure App Service, Azure SQL Database

---

## 1. HIGH-LEVEL DESIGN (HLD)

### 1.1 System Overview

```mermaid
graph TB
    User["👤 User"]
    Browser["🌐 Web Browser"]
    CDN["📦 CDN"]
    
    MSAL["🔐 Azure MSAL<br/>Authentication"]
    AAD["🔑 Azure Entra ID"]
    
    FE["React Frontend<br/>policyhub.azurewebsites.net"]
    API["API Gateway<br/.NET Core REST API"]
    
    DB["Azure SQL<br/>Database"]
    BLOB["Azure Blob<br/>Storage"]
    
    User -->|HTTPS| Browser
    Browser -->|Static Assets| CDN
    Browser -->|Login Flow| MSAL
    MSAL -->|Validate Token| AAD
    Browser -->|Authenticated Requests<br/>JWT Token| API
    API -->|Query/Update| DB
    API -->|Upload/Download| BLOB
    
    style User fill:#e1f5ff
    style AAD fill:#fff3e0
    style API fill:#f3e5f5
    style DB fill:#e8f5e9
    style BLOB fill:#fce4ec
```

### 1.2 Layered Architecture

```mermaid
graph LR
    subgraph Client["Client Layer"]
        Browser["Web Browser<br/>React 18.3"]
        Cache["Browser Cache<br/>Session Storage"]
    end
    
    subgraph Auth["Authentication Layer"]
        MSAL["MSAL Instance"]
        AuthContext["Auth Context<br/>State Management"]
        ProtectedRoute["Protected Routes"]
    end
    
    subgraph API["API Layer"]
        Controllers["REST Controllers"]
        Services["Business Services"]
        Repos["Data Repositories"]
        Middleware["Custom Middleware"]
    end
    
    subgraph Data["Data Layer"]
        DBContext["Entity Framework<br/>DbContext"]
        SQLDb["Azure SQL<br/>Database"]
        BlobStorage["Azure Blob<br/>Storage"]
    end
    
    Browser -->|MSAL Login| AuthContext
    AuthContext -->|Protected Access| ProtectedRoute
    ProtectedRoute -->|API Calls| Controllers
    Controllers -->|Business Logic| Services
    Services -->|Data Access| Repos
    Repos -->|ORM Query| DBContext
    DBContext -->|SQL| SQLDb
    Services -->|File Operations| BlobStorage
    
    style Client fill:#e1f5ff
    style Auth fill:#fff3e0
    style API fill:#f3e5f5
    style Data fill:#e8f5e9
```

### 1.3 Core Domains

```mermaid
graph TB
    Policy["📋 Policy Domain"]
    User["👤 User Domain"]
    Audit["📊 Audit Domain"]
    Workflow["⚙️ Workflow Domain"]
    Notification["🔔 Notification Domain"]
    
    Policy -->|Manages| PolicyVersion["Policy Versions"]
    Policy -->|Assigned Via| PolicyAssignment["Policy Assignments"]
    
    User -->|Acknowledges| PolicyAck["Policy Acknowledgments"]
    User -->|Signs| PolicySig["Policy Signatures"]
    User -->|Belongs to| Department["Departments"]
    User -->|Has| Role["Roles"]
    
    Audit -->|Tracks| AuditLog["Audit Logs"]
    Audit -->|Monitors| User
    Audit -->|Records| Policy
    
    Workflow -->|Manages| PolicyApproval["Approval Process"]
    Workflow -->|Triggers| Notification
    
    Notification -->|Notifies| User
    
    style Policy fill:#e3f2fd
    style User fill:#f3e5f5
    style Audit fill:#e8f5e9
    style Workflow fill:#fff3e0
    style Notification fill:#fce4ec
```

---

## 2. LOW-LEVEL DESIGN (LLD)

### 2.1 Frontend Architecture

```mermaid
graph TB
    subgraph App["React Application"]
        index["index.js<br/>Entry Point"]
        App["App.js<br/>Router Setup"]
        
        subgraph Pages["Page Components"]
            Login["Login.jsx"]
            Dashboard["Dashboard.jsx"]
            Policies["Policies.jsx"]
            Users["Users.jsx"]
            Admin["Admin Pages"]
            History["History.jsx"]
        end
        
        subgraph Context["Context API"]
            AuthContext["AuthContext.jsx<br/>Authentication State"]
        end
        
        subgraph Layouts["Layout Components"]
            MainLayout["MainLayout.jsx"]
            Navigation["Navigation.jsx"]
            Sidebar["Sidebar.jsx"]
        end
        
        subgraph Common["Common Components"]
            FullScreenLoader["FullScreenLoader"]
            ViewSwitcher["ViewSwitcher"]
            Notifications["Notifications"]
        end
        
        subgraph Routes["Route Protection"]
            ProtectedRoute["ProtectedRoute"]
            RoleGuard["Role Guard Logic"]
        end
        
        subgraph Services["Services"]
            AuthService["authService.js"]
            AxiosClient["axiosClient.js"]
            MsalConfig["msalConfig.js"]
        end
    end
    
    index --> App
    App --> Pages
    App --> ProtectedRoute
    ProtectedRoute --> RoleGuard
    AuthContext --> AuthService
    AuthService --> MsalConfig
    Pages --> Layouts
    Pages --> Common
    AxiosClient -->|HTTP Requests| API["REST API"]
    
    style AuthContext fill:#fff3e0
    style ProtectedRoute fill:#ffe0b2
    style Services fill:#f3e5f5
```

### 2.2 Backend Architecture

```mermaid
graph TB
    subgraph Request["Request Pipeline"]
        HTTPReq["HTTP Request"]
        Cors["CORS Middleware"]
        Auth["Authentication"]
        UserSync["User Sync Middleware"]
        AuthZ["Authorization"]
    end
    
    subgraph Controllers["API Controllers"]
        PoliciesCtrl["PoliciesController"]
        UsersCtrl["UsersController"]
        AssignmentCtrl["PolicyAssignmentsController"]
        AckCtrl["PolicyAcknowledgmentsController"]
        AuditCtrl["AuditLogsController"]
        OtherCtrl["Other Controllers"]
    end
    
    subgraph Services["Business Services"]
        PolicySvc["PolicyService"]
        UserSvc["User Service"]
        NotificationSvc["Notification Service"]
        AuditSvc["Audit Service"]
        BlobSvc["BlobService"]
    end
    
    subgraph Repos["Data Access"]
        PolicyRepo["PolicyRepository"]
        GenericRepo["Generic Repositories"]
        DBContext["ApplicationDbContext"]
    end
    
    subgraph Database["Database"]
        Policies["Policies Table"]
        Users["Users Table"]
        Assignments["PolicyAssignments"]
        Acks["PolicyAcknowledgments"]
        Audits["AuditLogs Table"]
        Other["Other Tables"]
    end
    
    HTTPReq --> Cors
    Cors --> Auth
    Auth --> UserSync
    UserSync --> AuthZ
    AuthZ --> Controllers
    
    Controllers --> Services
    Services --> Repos
    Services -->|File Ops| BlobSvc
    
    Repos --> DBContext
    DBContext --> Policies
    DBContext --> Users
    DBContext --> Assignments
    DBContext --> Acks
    DBContext --> Audits
    DBContext --> Other
    
    style Controllers fill:#e1f5ff
    style Services fill:#f3e5f5
    style Repos fill:#e8f5e9
    style Database fill:#c8e6c9
```

### 2.3 Entity Relationships

```mermaid
erDiagram
    USER ||--o{ POLICY_ASSIGNMENT : "assigned via"
    USER ||--o{ POLICY_ACKNOWLEDGMENT : "acknowledges"
    USER ||--o{ POLICY_SIGNATURE : "signs"
    USER ||--o{ AUDIT_LOG : "performs"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ REPORT_EXPORT : "generates"
    USER }o--|| DEPARTMENT : "belongs to"
    USER }o--|| ROLE : "has"
    
    POLICY ||--o{ POLICY_VERSION : "has"
    POLICY ||--o{ POLICY_ASSIGNMENT : "assigned via"
    POLICY }o--|| CATEGORY : "categorized as"
    POLICY }o--|| USER : "created by"
    
    POLICY_ASSIGNMENT ||--o{ POLICY_ACKNOWLEDGMENT : "related to"
    POLICY_ASSIGNMENT }o--|| DEPARTMENT : "assigned to"
    POLICY_ASSIGNMENT }o--|| POLICY_VERSION : "links to"
    
    POLICY_ACKNOWLEDGMENT ||--o{ POLICY_SIGNATURE : "leads to"
    
    DEPARTMENT ||--o{ POLICY_ASSIGNMENT : "receives"
    DEPARTMENT ||--o{ USER : "has"
```

---

## 3. COMPONENT DIAGRAM

```mermaid
graph TB
    subgraph External["External Services"]
        AAD["Azure Entra ID<br/>(Authentication)"]
        BLOB["Azure Blob Storage<br/>(Document Storage)"]
    end
    
    subgraph Frontend["Frontend Application"]
        UI["UI Components<br/>React"]
        Auth["Authentication Module<br/>MSAL Integration"]
        Router["Routing Module<br/>React Router"]
        State["State Management<br/>Context API"]
    end
    
    subgraph Backend["API Backend"]
        Gateway["API Gateway<br/>ASP.NET Core"]
        Controllers["Controller Layer<br/>REST Endpoints"]
        Services["Service Layer<br/>Business Logic"]
        Middleware["Middleware<br/>Authentication, User Sync"]
    end
    
    subgraph DataLayer["Data Access Layer"]
        ORM["Object Mapper<br/>Entity Framework"]
        DBAccess["Repository Pattern<br/>Data Access"]
        BlobClient["Blob Client<br/>File Management"]
    end
    
    subgraph Database["Persistent Storage"]
        SQLDb["Azure SQL Database<br/>Relational Data"]
        BlobStore["Azure Blob Storage<br/>Policy Documents"]
    end
    
    UI -->|Uses| Auth
    Router -->|Manages| UI
    State -->|Provides| Auth
    Auth -->|Validates with| AAD
    
    UI -->|Calls via Axios| Gateway
    Gateway -->|Routes to| Controllers
    Controllers -->|Uses| Services
    Services -->|Uses| Middleware
    Services -->|Accesses| DBAccess
    Services -->|Manages| BlobClient
    
    DBAccess -->|Query/Update| ORM
    ORM -->|SQL| SQLDb
    BlobClient -->|Upload/Download| BLOB
    BlobClient -->|Access| BlobStore
    
    style Frontend fill:#e3f2fd
    style Backend fill:#f3e5f5
    style DataLayer fill:#e8f5e9
    style Database fill:#c8e6c9
    style External fill:#fff3e0
```

---

## 4. DEPLOYMENT DIAGRAM

```mermaid
graph TB
    subgraph Azure["Azure Cloud Platform"]
        subgraph Compute["Compute Resources"]
            FrontendApp["Azure App Service<br/>policyhub-dev<br/>React SPA"]
            BackendApp["Azure App Service<br/>policyhub-api<br/>ASP.NET Core"]
            AppInsights["Application Insights<br/>Monitoring"]
        end
        
        subgraph Storage["Storage Resources"]
            SQLDB["Azure SQL Database<br/>policyhub"]
            BlobStorage["Azure Blob Storage<br/>policyhubportal"]
        end
        
        subgraph Security["Security & Identity"]
            KeyVault["Key Vault<br/>Secrets Management"]
            EntraID["Azure Entra ID<br/>AAD Tenant"]
        end
        
        subgraph Network["Network"]
            VNET["Virtual Network"]
            NSG["Network Security Group"]
            FW["Firewall Rules"]
        end
    end
    
    Users["👥 End Users<br/>HTTPS"]
    CDN["🌐 CDN<br/>Static Assets"]
    
    Users -->|HTTPS| FrontendApp
    Users -->|AAD Login| EntraID
    FrontendApp -->|Calls| BackendApp
    BackendApp -->|Queries| SQLDB
    BackendApp -->|Reads/Writes| BlobStorage
    BackendApp -->|Get Secrets| KeyVault
    BackendApp -->|Logs| AppInsights
    FrontendApp -->|Logs| AppInsights
    
    BackendApp -->|Protected by| NSG
    VNET -->|Contains| BackendApp
    
    CDN -->|Serves| FrontendApp
    
    style Compute fill:#e1f5ff
    style Storage fill:#c8e6c9
    style Security fill:#fff3e0
    style Network fill:#f3e5f5
```

---

## 5. DATABASE ER DIAGRAM

```mermaid
erDiagram
    USERS ||--o{ POLICIES : "creates"
    USERS ||--o{ POLICY_ASSIGNMENTS : "assigned_to"
    USERS ||--o{ POLICY_ACKNOWLEDGMENTS : "acknowledges"
    USERS ||--o{ POLICY_SIGNATURES : "signs"
    USERS ||--o{ AUDIT_LOGS : "performs"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ REPORT_EXPORTS : "exports"
    USERS }o--|| DEPARTMENTS : "belongs_to"
    USERS }o--|| ROLES : "has_role"
    
    DEPARTMENTS ||--o{ POLICY_ASSIGNMENTS : "department_assigned"
    DEPARTMENTS ||--o{ USERS : "has_users"
    
    ROLES ||--o{ USERS : "has_users"
    
    CATEGORIES ||--o{ POLICIES : "has_policies"
    
    POLICIES ||--o{ POLICY_VERSIONS : "has_versions"
    POLICIES ||--o{ POLICY_ASSIGNMENTS : "assigned_via"
    POLICIES }o--|| CATEGORIES : "belongs_to"
    POLICIES }o--|| USERS : "created_by"
    
    POLICY_VERSIONS ||--o{ POLICY_ASSIGNMENTS : "links_to"
    POLICY_VERSIONS ||--o{ POLICY_SIGNATURES : "signed_on"
    POLICY_VERSIONS }o--|| USERS : "created_by"
    
    POLICY_ASSIGNMENTS ||--o{ POLICY_ACKNOWLEDGMENTS : "related_to"
    POLICY_ASSIGNMENTS }o--|| DEPARTMENTS : "assigned_to_dept"
    POLICY_ASSIGNMENTS }o--|| USERS : "assigned_to_user"
    POLICY_ASSIGNMENTS }o--|| POLICIES : "policy"
    POLICY_ASSIGNMENTS }o--|| POLICY_VERSIONS : "version"
    
    POLICY_ACKNOWLEDGMENTS ||--o{ POLICY_SIGNATURES : "leads_to"
    POLICY_ACKNOWLEDGMENTS }o--|| USERS : "acknowledged_by"
    POLICY_ACKNOWLEDGMENTS }o--|| POLICY_ASSIGNMENTS : "assignment"
    
    POLICY_SIGNATURES }o--|| USERS : "signed_by"
    POLICY_SIGNATURES }o--|| POLICY_VERSIONS : "version"
    
    AUDIT_LOGS }o--|| USERS : "performed_by"
    
    NOTIFICATIONS }o--|| USERS : "sent_to"
    
    REPORT_EXPORTS }o--|| USERS : "created_by"
```

### 5.1 Key Tables

**Users Table**
- UserId (PK)
- FullName, Email
- AzureObjectId, DepartmentId, RoleId
- IsActive, CreatedAt, LastLogin

**Policies Table**
- PolicyId (PK)
- Title, Description
- CategoryId, CreatedBy
- BlobPath (link to Azure Blob)
- IsActive, CreatedAt

**Policy Assignments Table**
- AssignmentId (PK)
- PolicyId, AssignedToUserId/AssignedToDepartmentId
- IsMandatory, AssignedDate

**Policy Acknowledgments Table**
- AcknowledgmentId (PK)
- AssignmentId, UserId
- Status (Pending/Acknowledged)

**Audit Logs Table**
- AuditId (PK)
- UserId, Action, EntityType
- Timestamp

---

## 6. AUTHENTICATION FLOW DIAGRAM

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant MSALLib["MSAL Library"]
    participant AzureAD["Azure Entra ID"]
    participant AuthContext["AuthContext"]
    participant API["REST API"]
    
    User->>Browser: Click "Sign in with Microsoft"
    activate Browser
    
    Browser->>MSALLib: loginRedirect()
    activate MSALLib
    
    MSALLib->>AzureAD: Redirect to login page
    deactivate MSALLib
    activate AzureAD
    
    AzureAD-->>User: Display login form
    User->>AzureAD: Enter credentials
    
    AzureAD->>AzureAD: Validate credentials
    AzureAD->>AzureAD: Generate JWT Token
    
    AzureAD-->>Browser: Redirect with authorization code
    deactivate AzureAD
    
    activate Browser
    Browser->>MSALLib: handleRedirectPromise()
    activate MSALLib
    
    MSALLib->>MSALLib: Exchange code for token
    MSALLib->>MSALLib: Cache token in localStorage
    MSALLib-->>AuthContext: Token & Account info
    deactivate MSALLib
    
    activate AuthContext
    AuthContext->>AuthContext: Set isAuthenticating=true
    AuthContext->>API: GET /Users/me (with JWT Bearer token)
    deactivate AuthContext
    
    activate API
    API->>API: Validate JWT signature
    API->>API: Extract user claims
    API->>API: Query database for user roles
    API-->>AuthContext: User data + roles
    deactivate API
    
    AuthContext->>AuthContext: Create merged user object
    AuthContext->>AuthContext: Set user state
    AuthContext->>AuthContext: Set loading=false
    deactivate AuthContext
    
    Browser->>Browser: Redirect to /dashboard
    deactivate Browser
```

---

## 7. LOGIN SEQUENCE DIAGRAM

```mermaid
sequenceDiagram
    participant User
    participant LoginPage as Login Component
    participant MSALInstance as MSAL Instance
    participant AuthService as Auth Service
    participant AuthContext as Auth Context
    participant AppRouter as App Router
    participant ProtectedRoute as Protected Route
    participant Dashboard as Dashboard
    
    User->>LoginPage: Navigate to /login
    LoginPage->>LoginPage: Check auth state
    
    alt Already logged in
        LoginPage->>AuthContext: Get user state
        AuthContext-->>LoginPage: user !== null
        LoginPage->>AppRouter: navigate('/dashboard')
    else Not logged in
        LoginPage->>LoginPage: Display login button
        User->>LoginPage: Click "Sign in with Microsoft"
        
        LoginPage->>LoginPage: startLogin()
        LoginPage->>AuthContext: Clear stored data
        LoginPage->>MSALInstance: loginRedirect(loginRequest)
        
        activate MSALInstance
        MSALInstance->>MSALInstance: Redirect to Azure AD
        note over MSALInstance: User enters credentials
        MSALInstance->>MSALInstance: Receive auth code
        MSALInstance->>MSALInstance: Exchange for tokens
        MSALInstance->>MSALInstance: Cache in localStorage
        MSALInstance->>AuthContext: Event: msal:loginSuccess
        deactivate MSALInstance
        
        activate AuthContext
        AuthContext->>AuthContext: Set loading=true, isAuthenticating=true
        AuthContext->>AuthService: getAccessToken()
        AuthService->>AuthService: acquireTokenSilent()
        AuthService-->>AuthContext: JWT access token
        
        AuthContext->>AuthContext: Get active account from MSAL
        AuthContext->>AuthContext: createUserFromAccount(account)
        AuthContext->>AuthService: fetchBackendUser()
        AuthService-->>AuthContext: Backend user data
        AuthContext->>AuthContext: Merge account + backend user
        AuthContext->>AuthContext: setPersistUser(mergedUser)
        AuthContext->>AuthContext: Set loading=false, isAuthenticating=false
        deactivate AuthContext
        
        AuthContext-->>AppRouter: user updated
        AppRouter->>ProtectedRoute: Render protected routes
        ProtectedRoute->>ProtectedRoute: Check user && roles
        ProtectedRoute->>Dashboard: Render Dashboard
    end
```

---

## 8. POLICY UPLOAD FLOW

```mermaid
sequenceDiagram
    actor Admin
    participant AdminUI["Admin UI"]
    participant AxiosClient as Axios Client
    participant PoliciesAPI as Policies Controller
    participant BlobService as Blob Service
    participant BlobStorage as Azure Blob Storage
    participant PolicyService as Policy Service
    participant Database as SQL Database
    
    Admin->>AdminUI: Click "Upload Policy"
    AdminUI->>Admin: Display upload form
    Admin->>AdminUI: Select PDF file + metadata
    
    Admin->>AdminUI: Click "Submit"
    AdminUI->>AdminUI: Prepare form data (file + title + category)
    AdminUI->>AxiosClient: POST /api/policies/upload
    
    activate AxiosClient
    AxiosClient->>AxiosClient: Add JWT Bearer token to headers
    AxiosClient->>PoliciesAPI: Send multipart form data
    deactivate AxiosClient
    
    activate PoliciesAPI
    PoliciesAPI->>PoliciesAPI: Validate JWT token
    PoliciesAPI->>PoliciesAPI: Check authorization (HRAdmin role)
    PoliciesAPI->>BlobService: UploadBlobAsync(file)
    deactivate PoliciesAPI
    
    activate BlobService
    BlobService->>BlobStorage: Generate unique filename
    BlobService->>BlobStorage: Upload file to "policy" container
    BlobStorage->>BlobStorage: Store file
    BlobStorage-->>BlobService: Return blob URL
    deactivate BlobService
    
    activate PolicyService
    PoliciesAPI->>PolicyService: CreatePolicyAsync()
    
    PolicyService->>Database: Insert Policy record
    Database->>Database: Set:
    note over Database: - Title, Description
    note over Database: - CategoryId
    note over Database: - BlobPath (from blob URL)
    note over Database: - CreatedBy (from JWT user ID)
    note over Database: - CreatedAt (current timestamp)
    note over Database: - IsActive = true
    
    Database-->>PolicyService: Return Policy object
    deactivate PolicyService
    
    PolicyService->>Database: Insert Policy_Version record
    Database->>Database: Create initial version
    
    Database-->>PoliciesAPI: Confirmation
    PoliciesAPI-->>AxiosClient: 201 Created
    
    activate AxiosClient
    AxiosClient-->>AdminUI: Success response
    deactivate AxiosClient
    
    AdminUI->>AdminUI: Show success notification
    AdminUI->>AdminUI: Refresh policy list
    Admin->>Admin: Policy is now available for assignment
```

---

## 9. POLICY APPROVAL WORKFLOW

```mermaid
stateDiagram-v2
    [*] --> Draft: Policy Created
    
    Draft --> PendingReview: Submit for Review
    
    PendingReview --> Approved: HR Admin<br/>Approves
    PendingReview --> Rejected: HR Admin<br/>Rejects
    
    Rejected --> Draft: Return to Draft
    
    Approved --> PendingAssignment: Ready for<br/>Assignment
    
    PendingAssignment --> Assigned: HR Admin<br/>Assigns to Dept/User
    
    Assigned --> NotificationSent: Send<br/>Notifications
    
    NotificationSent --> Acknowledged: Employees<br/>Acknowledge
    
    Acknowledged --> Signed: Employees<br/>Sign
    
    Signed --> Complete: All users<br/>signed & acknowledged
    
    Complete --> Archived: Policy<br/>Retention Period<br/>Expires
    
    Archived --> [*]
    
    note right of Draft
        Admin creates policy
        Uploads document
    end
    
    note right of PendingReview
        Awaiting HR/SuperAdmin
        approval
    end
    
    note right of Approved
        Policy content
        validated
    end
    
    note right of Assigned
        Department/User
        assigned policy
    end
    
    note right of Acknowledged
        User reads policy
        Acknowledges receipt
    end
    
    note right of Signed
        User digitally signs
        document
    end
```

---

## 10. DETAILED APPROVAL WORKFLOW WITH ACTORS

```mermaid
graph TB
    subgraph Steps["Approval Workflow Steps"]
        S1["1️⃣ Policy Upload<br/>Admin uploads policy<br/>document & metadata"]
        S2["2️⃣ Submit for Review<br/>Status: PendingReview"]
        S3["3️⃣ HR Review<br/>HR Admin reviews content"]
        
        S4a["✅ APPROVED<br/>Status: Approved"]
        S4b["❌ REJECTED<br/>Return to admin"]
        
        S5["4️⃣ Assignment<br/>HR Admin selects<br/>Departments/Users"]
        S6["5️⃣ Notifications Sent<br/>Employees notified"]
        S7["6️⃣ Acknowledgment<br/>Status: Acknowledged"]
        S8["7️⃣ Digital Signature<br/>Employee signs policy"]
        S9["8️⃣ Complete<br/>Status: Completed"]
    end
    
    subgraph Actors["Actors & Permissions"]
        Admin["🔴 Admin<br/>- Upload policy<br/>- Submit for review"]
        HRAdmin["🟠 HR Admin<br/>- Approve/Reject<br/>- Assign policies<br/>- View reports"]
        Employee["🟢 Employee<br/>- View assigned<br/>- Acknowledge<br/>- Sign"]
        Auditor["🔵 Auditor<br/>- View audit logs<br/>- Generate reports"]
        SuperAdmin["🟣 SuperAdmin<br/>- All permissions"]
    end
    
    S1 --> Admin
    S2 --> Admin
    S3 --> HRAdmin
    S3 --> S4a
    S3 --> S4b
    S4b --> S1
    S4a --> S5
    S5 --> HRAdmin
    S5 --> S6
    S6 --> S7
    S7 --> Employee
    S8 --> Employee
    S8 --> S9
    S9 --> Auditor
    
    style S1 fill:#e1f5ff
    style S3 fill:#fff3e0
    style S4a fill:#c8e6c9
    style S4b fill:#ffccbc
    style S7 fill:#f3e5f5
    style S9 fill:#e8f5e9
```

---

## 11. AZURE ARCHITECTURE DIAGRAM

```mermaid
graph TB
    subgraph External["External Services"]
        Users["👥 End Users<br/>Internet"]
        AAD["Azure Entra ID<br/>Authentication Service"]
    end
    
    subgraph Gateway["API Gateway & CDN"]
        AppGW["Azure Application Gateway<br/>Load Balancing"]
        CDN["Azure CDN<br/>Static Content Delivery"]
    end
    
    subgraph Compute["Compute Layer"]
        FrontendAS["App Service<br/>policyhub-dev<br/>React SPA<br/>Autoscale: 2-4"]
        BackendAS["App Service<br/>policyhub-api<br/>.NET Core API<br/>Autoscale: 2-4"]
    end
    
    subgraph Monitoring["Observability"]
        AppInsights["Application Insights<br/>Metrics & Logs"]
        Alerts["Alert Rules<br/>Performance Monitoring"]
    end
    
    subgraph Security["Security"]
        KeyVault["Key Vault<br/>Secrets, Certificates"]
        NSG["Network Security Groups<br/>Firewall Rules"]
    end
    
    subgraph Data["Data Layer"]
        SQLDB["Azure SQL Database<br/>policyhub<br/>Single Database<br/>Standard S2"]
        BlobStorage["Blob Storage<br/>policyhubportal<br/>Hot Tier<br/>Redundancy: GRS"]
        BlobContainer["📁 'policy' Container<br/>Policy Documents"]
    end
    
    subgraph Network["Networking"]
        VNET["Virtual Network<br/>192.168.0.0/16"]
        Subnet1["Subnet: Compute<br/>192.168.1.0/24"]
        Subnet2["Subnet: Data<br/>192.168.2.0/24"]
    end
    
    Users -->|HTTPS| AppGW
    Users -->|AAD Login| AAD
    
    AppGW -->|Routes| CDN
    AppGW -->|Routes| FrontendAS
    AppGW -->|Routes| BackendAS
    
    CDN -->|Serves| FrontendAS
    
    FrontendAS -->|Calls API| BackendAS
    BackendAS -->|Query/Update| SQLDB
    BackendAS -->|Upload/Download| BlobStorage
    BlobStorage -->|Contains| BlobContainer
    BackendAS -->|Get Secrets| KeyVault
    
    FrontendAS -->|Logs Metrics| AppInsights
    BackendAS -->|Logs Metrics| AppInsights
    AppInsights -->|Triggers| Alerts
    
    FrontendAS -->|Protected by| NSG
    BackendAS -->|Protected by| NSG
    SQLDB -->|Protected by| NSG
    
    VNET -->|Contains| Subnet1
    VNET -->|Contains| Subnet2
    Subnet1 -->|Hosts| FrontendAS
    Subnet1 -->|Hosts| BackendAS
    Subnet2 -->|Hosts| SQLDB
    Subnet2 -->|Hosts| BlobStorage
    
    style External fill:#fff3e0
    style Gateway fill:#e1f5ff
    style Compute fill:#f3e5f5
    style Data fill:#c8e6c9
    style Security fill:#ffccbc
    style Network fill:#e8f5e9
    style Monitoring fill:#f1f8e9
```

---

## 12. ROLE-BASED ACCESS CONTROL (RBAC)

```mermaid
graph TB
    subgraph Roles["User Roles"]
        Employee["👤 Employee"]
        HRAdmin["🔐 HR Admin"]
        Auditor["📊 Auditor"]
        SuperAdmin["⭐ SuperAdmin"]
    end
    
    subgraph Permissions["Permissions Matrix"]
        ViewPolicies["View Policies"]
        AcknowledgePolicy["Acknowledge Policy"]
        SignPolicy["Digital Signature"]
        UploadPolicy["Upload Policy"]
        ApprovPolicy["Approve Policy"]
        AssignPolicy["Assign Policy"]
        ManageUsers["Manage Users"]
        ViewAuditLogs["View Audit Logs"]
        GenerateReports["Generate Reports"]
        ViewApprovals["View Approvals"]
    end
    
    Employee -->|Can| ViewPolicies
    Employee -->|Can| AcknowledgePolicy
    Employee -->|Can| SignPolicy
    Employee -->|Can| ViewApprovals
    
    HRAdmin -->|Can| ViewPolicies
    HRAdmin -->|Can| UploadPolicy
    HRAdmin -->|Can| ApprovPolicy
    HRAdmin -->|Can| AssignPolicy
    HRAdmin -->|Can| ManageUsers
    HRAdmin -->|Can| ViewAuditLogs
    HRAdmin -->|Can| GenerateReports
    
    Auditor -->|Can| ViewPolicies
    Auditor -->|Can| ViewAuditLogs
    Auditor -->|Can| GenerateReports
    
    SuperAdmin -->|Can| ViewPolicies
    SuperAdmin -->|Can| UploadPolicy
    SuperAdmin -->|Can| ApprovPolicy
    SuperAdmin -->|Can| AssignPolicy
    SuperAdmin -->|Can| ManageUsers
    SuperAdmin -->|Can| ViewAuditLogs
    SuperAdmin -->|Can| GenerateReports
    SuperAdmin -->|Can| AcknowledgePolicy
    SuperAdmin -->|Can| SignPolicy
    
    style Employee fill:#c8e6c9
    style HRAdmin fill:#fff3e0
    style Auditor fill:#e3f2fd
    style SuperAdmin fill:#ffccbc
```

---

## 13. DATA FLOW DIAGRAM

```mermaid
graph TB
    subgraph Input["Data Input"]
        PolicyUpload["Policy Document Upload"]
        UserAssignment["User/Department Assignment"]
        UserActions["User Acknowledgments & Signatures"]
    end
    
    subgraph Process["Processing Layer"]
        BlobUpload["Upload to Blob Storage"]
        CreatePolicy["Create Policy Record"]
        CreateAssignment["Create Assignment Record"]
        CreateAck["Create Acknowledgment Record"]
        CreateSignature["Create Signature Record"]
    end
    
    subgraph Store["Data Storage"]
        PolicyTable["Policies Table"]
        AssignmentTable["Policy Assignments Table"]
        AckTable["Acknowledgments Table"]
        SignatureTable["Signatures Table"]
        AuditTable["Audit Logs Table"]
        BlobStorage["Policy Documents<br/>Blob Storage"]
    end
    
    subgraph Output["Data Output & Reporting"]
        Dashboard["Admin Dashboard"]
        Reports["Compliance Reports"]
        Audit["Audit Trail"]
        Notifications["Notifications"]
    end
    
    PolicyUpload --> BlobUpload
    PolicyUpload --> CreatePolicy
    BlobUpload --> BlobStorage
    CreatePolicy --> PolicyTable
    
    UserAssignment --> CreateAssignment
    CreateAssignment --> AssignmentTable
    AssignmentTable --> Notifications
    
    UserActions --> CreateAck
    UserActions --> CreateSignature
    CreateAck --> AckTable
    CreateSignature --> SignatureTable
    
    PolicyTable --> Dashboard
    AssignmentTable --> Dashboard
    AckTable --> Dashboard
    SignatureTable --> Dashboard
    
    PolicyTable --> Reports
    AckTable --> Reports
    SignatureTable --> Reports
    
    AckTable --> AuditTable
    SignatureTable --> AuditTable
    
    AuditTable --> Audit
    AuditTable --> Reports
    
    Notifications -->|Sent to Users| Output
    
    style Input fill:#e1f5ff
    style Process fill:#f3e5f5
    style Store fill:#c8e6c9
    style Output fill:#e8f5e9
```

---

## 14. INTEGRATION POINTS

### 14.1 Azure Services Integration

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Azure Entra ID** | User Authentication | MSAL for frontend, JWT validation in backend |
| **Azure SQL Database** | Primary Data Store | EF Core with ADO.NET provider |
| **Azure Blob Storage** | Document Storage | Azure SDK for uploading/downloading policy PDFs |
| **Application Insights** | Monitoring & Diagnostics | SDK integrated in ASP.NET Core |
| **Key Vault** | Secrets Management | Connection strings, API keys stored securely |
| **App Service** | Hosting | Both frontend and backend hosted |

### 14.2 External API Integrations

| API | Purpose | Authentication |
|-----|---------|-----------------|
| **Azure Graph API** | User profile data | OAuth 2.0 (via MSAL) |
| **Microsoft Teams** | Notifications | Webhooks (future phase) |
| **Email Service** | Policy notifications | SendGrid / Azure Communications (future) |

---

## 15. SECURITY ARCHITECTURE

```mermaid
graph TB
    subgraph AuthN["Authentication"]
        MSAL["MSAL - Multi-tenant support"]
        AAD["Azure Entra ID SSO"]
        JWT["JWT Token Validation"]
    end
    
    subgraph AuthZ["Authorization"]
        RBAC["Role-Based Access Control"]
        Policies["Authorization Policies"]
        Claims["Claims-Based Authorization"]
    end
    
    subgraph Transport["Transport Security"]
        HTTPS["HTTPS/TLS 1.2+"]
        CORS["CORS Policy Enforcement"]
    end
    
    subgraph Storage["Data Security"]
        Encryption["Azure Storage Encryption"]
        DBEncryption["Transparent Data Encryption"]
        KeyVault["Key Vault Integration"]
    end
    
    subgraph Audit["Audit & Compliance"]
        AuditLogs["Comprehensive Audit Logs"]
        UserTracking["User Action Tracking"]
        PolicyHistory["Policy Version History"]
    end
    
    User["User"] -->|Authenticate| AuthN
    AuthN -->|Validate| AuthZ
    AuthZ -->|Issue Token| JWT
    JWT -->|Secure Channel| Transport
    Transport -->|Encrypted Storage| Storage
    Storage -->|Managed Secrets| KeyVault
    
    User -->|All Actions| Audit
    Audit -->|Track Changes| AuditLogs
    
    style AuthN fill:#fff3e0
    style AuthZ fill:#ffe0b2
    style Transport fill:#ffccbc
    style Storage fill:#ffab91
    style Audit fill:#e8f5e9
```

---

## 16. DEPLOYMENT & DEVOPS

### 16.1 CI/CD Pipeline

```mermaid
graph LR
    Git["GitHub Repository"]
    Build["Build Stage<br/>npm run build<br/>dotnet publish"]
    Test["Test Stage<br/>Unit Tests<br/>Integration Tests"]
    StageDeploy["Deploy to Staging"]
    Approval["Manual Approval"]
    ProdDeploy["Deploy to Production"]
    Monitor["Monitor & Alerts"]
    
    Git -->|Trigger| Build
    Build -->|Publish Artifacts| Test
    Test -->|Pass| StageDeploy
    StageDeploy -->|Validate| Approval
    Approval -->|Approve| ProdDeploy
    ProdDeploy -->|Live| Monitor
    
    style Build fill:#e3f2fd
    style Test fill:#f3e5f5
    style StageDeploy fill:#e8f5e9
    style ProdDeploy fill:#c8e6c9
    style Monitor fill:#fff3e0
```

### 16.2 Environment Configuration

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Development** | http://localhost:3000 | http://localhost:5007 | Local/Dev SQL |
| **Staging** | policyhub-staging.azurewebsites.net | policyhub-api-staging.azurewebsites.net | Azure SQL Dev |
| **Production** | policyhub.azurewebsites.net | policyhub-api.azurewebsites.net | Azure SQL Prod |

---

## 17. PERFORMANCE & SCALABILITY

### 17.1 Caching Strategy

```mermaid
graph TB
    Client["Client Browser"]
    
    subgraph Cache["Caching Layers"]
        BrowserCache["Browser Cache<br/>Static Assets"]
        SessionStorage["Session Storage<br/>Auth Tokens"]
        MSALCache["MSAL Token Cache<br/>localStorage"]
    end
    
    subgraph APICache["API Layer"]
        ResponseCache["HTTP Caching Headers"]
        AppServiceCache["Application Insights<br/>Performance Counters"]
    end
    
    subgraph DBCache["Data Layer"]
        EFCache["EF Core Change Tracking"]
        SQLCache["SQL Query Caching"]
    end
    
    Client -->|Store| BrowserCache
    Client -->|Store| SessionStorage
    Client -->|Store| MSALCache
    
    BrowserCache -->|Retrieve| Client
    SessionStorage -->|Retrieve| Client
    MSALCache -->|Retrieve| Client
    
    style Cache fill:#e1f5ff
    style APICache fill:#f3e5f5
    style DBCache fill:#e8f5e9
```

### 17.2 Scalability Features

- **Horizontal Scaling:** App Services configured for auto-scale (2-4 instances)
- **Load Balancing:** Azure Application Gateway distributes traffic
- **Database:** Connection pooling configured in EF Core
- **Blob Storage:** Geo-redundant replication (GRS)
- **CDN:** Static assets cached globally

---

## 18. ERROR HANDLING & RESILIENCE

```mermaid
graph TB
    subgraph Frontend["Frontend Error Handling"]
        TokenExpiry["Token Expiry"]
        NetworkError["Network Errors"]
        ValidationError["Form Validation"]
    end
    
    subgraph Backend["Backend Error Handling"]
        AuthError["Authentication Failures"]
        DbError["Database Errors"]
        BlobError["Blob Storage Errors"]
    end
    
    subgraph Recovery["Recovery Strategy"]
        TokenRefresh["Silent Token Refresh"]
        Retry["Exponential Backoff Retry"]
        FallbackUI["Fallback UI States"]
    end
    
    TokenExpiry -->|Handle| TokenRefresh
    NetworkError -->|Handle| Retry
    ValidationError -->|Handle| FallbackUI
    
    AuthError -->|Handle| TokenRefresh
    DbError -->|Handle| Retry
    BlobError -->|Handle| Retry
    
    style Frontend fill:#ffccbc
    style Backend fill:#ffb74d
    style Recovery fill:#a5d6a7
```

---

## PPT-READY SUMMARY SECTION

---

## 19. EXECUTIVE OVERVIEW

### Vision
Policy Hub is a cloud-native enterprise policy management platform that digitizes policy distribution, acknowledgment, and compliance tracking.

### Key Benefits
✅ **Reduced Compliance Risk** - Digital acknowledgment and signature trails  
✅ **Improved Efficiency** - Automated policy assignment and notifications  
✅ **Enhanced Transparency** - Comprehensive audit logs and reporting  
✅ **Scalable Infrastructure** - Cloud-based with auto-scaling capabilities  
✅ **Enterprise Security** - Azure Entra ID SSO and RBAC  

### Core Capabilities
1. **Policy Management** - Upload, version, and manage organizational policies
2. **User Engagement** - Digital acknowledgment and signature workflows
3. **Role-Based Access** - Granular permissions for employees, admins, auditors
4. **Compliance Tracking** - Complete audit trail of all actions
5. **Reporting** - Dashboard and export capabilities for compliance

---

## 20. TECHNICAL HIGHLIGHTS

### Resilience & Availability
- Multi-tier architecture for fault isolation
- Auto-scaling based on demand
- Geo-redundant storage
- Comprehensive monitoring and alerting

### Security
- OAuth 2.0 with Azure Entra ID
- Role-based access control (RBAC)
- Encrypted data in transit and at rest
- Comprehensive audit logging

### Scalability
- Stateless microservices design
- Azure app services auto-scale to 4 instances
- Load-balanced API gateway
- Optimized database with connection pooling

### Developer Experience
- RESTful API design
- TypeScript/React frontend
- Entity Framework ORM
- Clear separation of concerns

---

## 21. ROADMAP & FUTURE ENHANCEMENTS

### Phase 2 (Q3-Q4 2026)
- [ ] Advanced reporting dashboard (Power BI integration)
- [ ] Email notifications (Azure Communications Service)
- [ ] Mobile app (React Native)
- [ ] Workflow builder (low-code policy approval workflows)

### Phase 3 (2027)
- [ ] Document automation (template-based policy generation)
- [ ] Machine learning analytics (policy effectiveness scoring)
- [ ] Microsoft Teams integration
- [ ] Multi-tenant SaaS deployment

### Phase 4 (2027+)
- [ ] E-signature integration (DocuSign/Adobe Sign)
- [ ] API marketplace for third-party integrations
- [ ] Advanced compliance reporting (SOC 2, ISO 27001)

---

## 22. COST ESTIMATION (Monthly Azure)

| Resource | SKU | Estimated Cost |
|----------|-----|-----------------|
| App Service (Frontend) | B2 (2 instances) | $50-75 |
| App Service (Backend) | B2 (2 instances) | $50-75 |
| SQL Database | Standard S2 | $150-200 |
| Blob Storage (100GB) | Hot Tier | $2-3 |
| Application Insights | Pay-as-you-go | $10-20 |
| Key Vault | Standard | $0.6 |
| **TOTAL** | | **$263-374** |

---

## 23. DECISION MATRIX

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend Framework** | React 18.3 | Reactive UI, component reusability, MSAL support |
| **Backend Framework** | .NET 8 + ASP.NET Core | Enterprise-grade, high performance, Azure integration |
| **Database** | Azure SQL Server | ACID compliance, full-featured relational DB |
| **Authentication** | Azure Entra ID + MSAL | Enterprise SSO, security, no credential management |
| **Document Storage** | Azure Blob Storage | Cost-effective, scalable, integrated encryption |
| **Deployment** | Azure App Service | Managed platform, auto-scaling, no infrastructure management |
| **Architecture Pattern** | Layered + Repository | Clear separation of concerns, testable, maintainable |

---

## 24. CONCLUSION

Policy Hub represents a modern, enterprise-grade solution for policy management built on cloud-native principles. The architecture emphasizes security, scalability, and maintainability, with Azure services providing a robust foundation for growth and future enhancements.

### Contact & Questions
- **Architecture Lead:** [Contact Information]
- **Project Manager:** [Contact Information]
- **Technical Leads:** [Contact Information]

---

**Document Classification:** Internal | **Last Updated:** June 2026 | **Version:** 1.0
