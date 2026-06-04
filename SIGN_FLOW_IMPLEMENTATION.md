# Policy Sign Flow Implementation Summary

## Problem Fixed
The 400 Bad Request error was caused by model validation on the full `PolicyAcknowledgment` model with required fields.

## Solution Implemented

### 1. Backend Changes
**File:** `PolicyPortal.API/Controllers/PolicyAcknowledgmentsController.cs`

Added a lightweight SignRequest DTO and new `POST /api/PolicyAcknowledgments/sign` endpoint that:
- Accepts only `AssignmentId` and `ConsentText`
- Retrieves current user from Azure AD claims
- Creates `PolicyAcknowledgment` record (AssignmentId, UserId, Status="Signed", SignedAt, ConsentText)
- Creates `PolicySignature` record with:
  - IP Address from HttpContext
  - User Agent from request headers
  - SHA256 signature hash of (UserId|AcknowledgmentId|IP|UA|Timestamp)
  - SignedBy = current user
- Creates `AuditLog` entry (Action="SignedPolicy", EntityType="PolicyAcknowledgment")
- Returns both acknowledgment and signature objects

### 2. Frontend Changes
**File:** `policyhub/src/pages/policies/Policies.jsx`
- Updated to call `/PolicyAcknowledgments/sign` instead of `/PolicyAcknowledgments`
- Passes only `assignmentId` and `consentText`

**File:** `policyhub/src/components/common/PolicyModal.jsx`
- Fixed checkbox state synchronization with parent
- Syncs `agreeChecked` prop with local state
- Calls `onAgreeChange` callback when checkbox changes

## Database Schema (Already Exists)

### PolicyAcknowledgments
```
AcknowledgmentId (int, PK)
AssignmentId (int, FK)
UserId (int, FK)
Status (varchar(20), default='Pending')
SignedAt (datetime)
ConsentText (nvarchar)
```

### PolicySignatures
```
SignatureId (int, PK)
AcknowledgmentId (int, FK)
SignedBy (int, FK to User)
SignedAt (datetime)
IPAddress (varchar(50))
UserAgent (varchar(255))
SignatureHash (varchar(500))
```

### AuditLogs
```
AuditId (int, PK)
UserId (int, FK)
Action (varchar(100))
EntityType (varchar(100))
EntityId (int)
Timestamp (datetime)
Metadata (nvarchar)
```

## Testing Steps

1. **Open the frontend** at `http://localhost:3001`
2. **Navigate to Assigned Policies**
3. **Click on a policy** to open the modal
4. **Scroll to the end** of the policy document
5. **Check the consent checkbox** - "I have read the policy and agree..."
6. **Click "Proceed to Sign"** button
7. **Expected response:**
   - Modal closes
   - Policy status changes to "Signed"
   - Entries created in database:
     - PolicyAcknowledgments (with Status="Signed")
     - PolicySignatures (with signature hash and IP/UserAgent)
     - AuditLogs (with action "SignedPolicy")

## Troubleshooting

### If you get 400 Bad Request:
- Check browser console for error message
- Verify API is running on `http://localhost:5007`
- Ensure authorization header is present (Bearer token)

### If API doesn't start:
```powershell
# From PolicyPortal.API folder:
dotnet clean
dotnet build
dotnet run --urls "http://localhost:5007"
```

### If frontend won't start:
```powershell
# From policyhub folder:
npm install
npm start
```

## API Endpoint Reference

### POST /api/PolicyAcknowledgments/sign
**Request:**
```json
{
  "assignmentId": 1,
  "consentText": "I agree to the policy terms."
}
```

**Response (200 OK):**
```json
{
  "acknowledgment": {
    "acknowledgmentId": 5,
    "assignmentId": 1,
    "userId": 10,
    "status": "Signed",
    "signedAt": "2026-06-03T12:00:00Z",
    "consentText": "I agree to the policy terms."
  },
  "signature": {
    "signatureId": 8,
    "acknowledgmentId": 5,
    "signedBy": 10,
    "signedAt": "2026-06-03T12:00:00Z",
    "ipaddress": "::1",
    "userAgent": "Mozilla/5.0...",
    "signatureHash": "base64encodedsha256hash=="
  }
}
```

## Files Modified
1. ✅ `PolicyPortal.API/Controllers/PolicyAcknowledgmentsController.cs` - Added sign endpoint
2. ✅ `policyhub/src/pages/policies/Policies.jsx` - Updated to use sign endpoint
3. ✅ `policyhub/src/components/common/PolicyModal.jsx` - Fixed checkbox state sync

## Status
- ✅ API compiled successfully
- ✅ Frontend compiled successfully
- ✅ Both servers running (API:5007, Frontend:3001)
- Ready for testing

