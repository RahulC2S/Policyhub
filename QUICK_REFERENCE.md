# Quick Reference - View Switcher Feature

## What Was Implemented

SuperAdmin and HRAdmin users can now switch between "Admin View" and "Employee View" without logging out.

## Visual Layout

```
Header (top-right corner):
┌─────────────────────────────────────────┐
│ Rahul Thipparthi          [Admin View ▼] Logout │
│ SuperAdmin                              │
└─────────────────────────────────────────┘

When clicked, dropdown shows:
┌──────────────────┐
│ Admin View   ✓   │
│ Employee View    │
└──────────────────┘
```

## User Roles

| Role | Can Switch | Default View | Sees Switcher |
|------|-----------|--------------|--------------|
| SuperAdmin | ✓ Yes | Admin View | ✓ Yes |
| HRAdmin | ✓ Yes | Admin View | ✓ Yes |
| Employee | ✗ No | Employee | ✗ No |

## What Changes When Switching Views

### Admin View
- Dashboard: Shows admin metrics and statistics
- Sidebar Menu:
  - Dashboard
  - Policies (admin policies)
  - Assignments
  - Categories
  - Users
  - History

### Employee View
- Dashboard: Shows personal policy assignments and acknowledgments
- Sidebar Menu:
  - Dashboard
  - My Policies (employee-assigned policies)
  - History

## Storage

- View preference saved to browser's `localStorage`
- Key: `'viewPreference'`
- Values: `'admin'` or `'employee'`
- Persists across:
  - Page refreshes
  - Tab closes and reopens
  - Browser restarts (as long as localStorage is not cleared)

## Key Points

✅ All existing screens remain unchanged
✅ Only display logic modified (no business logic changes)
✅ Seamless integration with existing authentication
✅ No backend/API changes required
✅ Zero new dependencies added
✅ Works with existing role-based access control

## Testing the Feature

1. **For SuperAdmin user**:
   - Login as SuperAdmin
   - See dropdown in header showing "Admin View"
   - Click dropdown and select "Employee View"
   - Dashboard and sidebar should change
   - Refresh page - view preference should persist
   - Click dropdown again and select "Admin View"
   - Verify admin dashboard and menu return

2. **For Regular Employee**:
   - Login as Employee
   - Verify NO dropdown appears in header
   - Only see employee dashboard and menu items

## How It Works

1. **AuthContext** tracks `viewPreference` state
2. **ViewSwitcher** component allows switching (hidden for non-admins)
3. **Dashboard** checks both role AND viewPreference before showing admin dashboard
4. **Sidebar** hides admin menu items when in employee view
5. **localStorage** remembers preference across sessions

## Support

If view switcher doesn't appear:
- Verify user has admin role (SuperAdmin or HRAdmin)
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`

If view preference doesn't persist:
- Check browser's privacy/incognito mode
- Verify localStorage is enabled
- Check browser storage settings

## Files Changed

**Modified:**
- src/context/AuthContext.jsx
- src/pages/dashboard/Dashboard.jsx
- src/components/common/Navigation.jsx
- src/components/common/Sidebar.jsx
- src/assets/styles/App.css

**New:**
- src/components/common/ViewSwitcher.jsx
- src/components/common/ViewSwitcher.css
