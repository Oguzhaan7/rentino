# Action Plan: Fix Backend Routes vs UI Navigation Issues

## Phase 1: Critical Permission Fixes (Immediate)

### 1.1 Fix Building Management Access

**Issue**: UI shows building management to PROPERTY_OWNER but backend only allows ADMIN + MANAGER

**Solution Options**:
A) **Backend Fix**: Allow PROPERTY_OWNER access to building routes
B) **UI Fix**: Hide building menu from PROPERTY_OWNER

**Recommendation**: Option A - Allow PROPERTY_OWNER building access since they own properties within buildings.

### 1.2 Fix MANAGER Finance Access

**Issue**: MANAGERs can handle payments in backend but UI doesn't show finance menu

**Solution**: Update UI navigation to show limited finance menu for MANAGERs (payments only)

### 1.3 Fix Tenant Management Inconsistency

**Issue**: Only ADMIN can manage tenants in backend, but UI permission logic might be unclear

**Solution**: Ensure UI properly restricts tenant management to ADMIN only

## Phase 2: Add Critical Missing Backend Routes

### 2.1 User Management Routes

```typescript
// New routes needed in /api/users
GET    /api/users              // List users (ADMIN only)
POST   /api/users              // Create user (ADMIN only)
GET    /api/users/:id          // Get user (ADMIN only)
PUT    /api/users/:id          // Update user (ADMIN only)
DELETE /api/users/:id          // Delete user (ADMIN only)
GET    /api/roles              // List available roles (ADMIN only)
```

### 2.2 Settings Routes

```typescript
// New routes needed in /api/settings
GET / api / settings; // Get user settings (authenticated)
PUT / api / settings; // Update user settings (authenticated)
POST / api / settings / avatar; // Upload avatar (authenticated)
```

### 2.3 Report Routes

```typescript
// New routes needed in /api/reports
GET / api / reports / income; // Income reports (ADMIN, PROPERTY_OWNER, ACCOUNTANT, MANAGER)
GET / api / reports / occupancy; // Occupancy reports (ADMIN, PROPERTY_OWNER, ACCOUNTANT, MANAGER)
GET / api / reports / maintenance; // Maintenance reports (ADMIN, PROPERTY_OWNER, ACCOUNTANT, MANAGER)
```

### 2.4 General Finance Routes

```typescript
// New routes needed in /api/finance
GET / api / finance / invoices; // List invoices (ADMIN, PROPERTY_OWNER, ACCOUNTANT)
POST / api / finance / invoices; // Create invoice (ADMIN, PROPERTY_OWNER, ACCOUNTANT)
GET / api / finance / expenses; // List expenses (ADMIN, PROPERTY_OWNER, ACCOUNTANT)
POST / api / finance / expenses; // Create expense (ADMIN, PROPERTY_OWNER, ACCOUNTANT)
GET / api / finance / payments; // List all payments (ADMIN, ACCOUNTANT, MANAGER)
```

### 2.5 Tenant Self-Service Routes

```typescript
// New routes needed in /api/my (tenant self-service)
GET / api / my / contract; // Get tenant's current contract (TENANT only)
GET / api / my / payments; // Get tenant's payment history (TENANT only)
POST / api / my / maintenance; // Create maintenance request (TENANT only)
GET / api / my / maintenance; // List tenant's maintenance requests (TENANT only)
```

## Phase 3: UI Navigation Updates

### 3.1 Update Role-Based Permissions

Update `apps/web/stores/user.ts` computed properties:

```typescript
// Add new permission for managers to handle payments
const canManagePayments = computed(
  () => isAdmin.value || isAccountant.value || isManager.value
);

// Update finance permissions to be more granular
const canViewInvoices = computed(
  () => isAdmin.value || isPropertyOwner.value || isAccountant.value
);

const canViewExpenses = computed(
  () => isAdmin.value || isPropertyOwner.value || isAccountant.value
);
```

### 3.2 Update Navigation Menu Logic

Update `apps/web/composables/useNavigation.ts`:

```typescript
// Fix building access for property owners
if (userStore.canManageBuildings || userStore.isPropertyOwner) {
  // Building menu items
}

// Add limited finance menu for managers
if (userStore.canViewFinancials) {
  const financeItems = [];

  if (userStore.canViewInvoices) {
    financeItems.push({
      title: "Faturalar",
      url: "/finance/invoices",
      icon: Receipt,
    });
  }

  if (userStore.canViewExpenses) {
    financeItems.push({
      title: "Giderler",
      url: "/finance/expenses",
      icon: DollarSign,
    });
  }

  if (userStore.canManagePayments) {
    financeItems.push({
      title: "Ödemeler",
      url: "/finance/payments",
      icon: CreditCard,
    });
  }

  if (financeItems.length > 0) {
    navMain.push({
      title: "Mali İşlemler",
      url: "/finance",
      icon: DollarSign,
      items: financeItems,
    });
  }
}
```

## Phase 4: Implementation Priority

### Week 1: Permission Fixes

1. **Day 1-2**: Fix building management permissions

   - Update backend building routes to allow PROPERTY_OWNER
   - Test permissions thoroughly

2. **Day 3-4**: Fix MANAGER finance access

   - Update UI navigation for managers
   - Update permission computeds in user store

3. **Day 5**: Testing and validation
   - Test all role-based access
   - Ensure no unauthorized access

### Week 2: Critical Backend Routes

1. **Day 1-2**: User management routes

   - Create user service and routes
   - Implement CRUD operations for users

2. **Day 3-4**: Settings routes

   - Create settings service and routes
   - Implement user preferences storage

3. **Day 5**: Testing backend routes
   - Test all new endpoints
   - Validate permissions

### Week 3: Reports and Finance

1. **Day 1-2**: Report generation routes

   - Implement report services
   - Create data aggregation logic

2. **Day 3-4**: General finance routes

   - Create invoice/expense management
   - Separate from building-specific expenses

3. **Day 5**: Integration testing
   - Test report generation
   - Test finance workflows

### Week 4: Tenant Features and UI

1. **Day 1-2**: Tenant self-service routes

   - Implement "My" endpoints for tenants
   - Create tenant-specific views

2. **Day 3-4**: UI page implementations

   - Create missing UI pages for new routes
   - Implement proper error handling

3. **Day 5**: End-to-end testing
   - Test complete user workflows
   - Performance testing

## Files to Modify

### Backend Files

- `apps/backend/src/routes/building.ts` - Add PROPERTY_OWNER to permissions
- `apps/backend/src/routes/user.ts` - Create new file
- `apps/backend/src/routes/settings.ts` - Create new file
- `apps/backend/src/routes/reports.ts` - Create new file
- `apps/backend/src/routes/finance.ts` - Create new file
- `apps/backend/src/routes/my.ts` - Create new file
- `apps/backend/src/services/` - Add corresponding services

### Frontend Files

- `apps/web/stores/user.ts` - Update permissions
- `apps/web/composables/useNavigation.ts` - Update navigation logic
- `apps/web/pages/` - Create missing pages for new routes
- `apps/web/middleware/auth.ts` - Update route protection logic

## Success Metrics

- [ ] All UI menu items have corresponding backend endpoints
- [ ] All backend endpoints have proper UI access
- [ ] Role permissions are consistent between frontend and backend
- [ ] No unauthorized access possible through any role
- [ ] All user workflows are complete and functional
