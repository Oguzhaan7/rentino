# Backend Routes vs UI Navigation Analysis

## Complete Backend Route Analysis

### 1. Authentication Routes (`/api/auth`)

- **POST** `/signup` - Register new user (public)
- **POST** `/signin` - User login (public)
- **POST** `/logout` - User logout (authenticated)
- **GET** `/me` - Get current user profile (authenticated)
- **POST** `/change-password` - Change user password (authenticated)
- **POST** `/reset-password` - Reset password (public)

### 2. Property Routes (`/api/properties`)

- **POST** `/` - Create property (ADMIN, PROPERTY_OWNER, MANAGER)
- **GET** `/` - List all properties (authenticated)
- **GET** `/:id` - Get property by ID (authenticated)
- **PUT** `/:id` - Update property (ADMIN, PROPERTY_OWNER, MANAGER)
- **DELETE** `/:id` - Delete property (ADMIN, PROPERTY_OWNER, MANAGER)
- **POST** `/:propertyId/documents` - Add property document (ADMIN, PROPERTY_OWNER, MANAGER)
- **POST** `/:propertyId/maintenance` - Add property maintenance (ADMIN, PROPERTY_OWNER, MANAGER)
- **GET** `/stats` - Get property statistics (authenticated)

### 3. Building Routes (`/api/buildings`)

- **POST** `/` - Create building (ADMIN, MANAGER)
- **GET** `/` - List all buildings (authenticated)
- **GET** `/:id` - Get building by ID (authenticated)
- **PUT** `/:id` - Update building (ADMIN, MANAGER)
- **DELETE** `/:id` - Delete building (ADMIN, MANAGER)
- **POST** `/:buildingId/expenses` - Add building expense (ADMIN, MANAGER, ACCOUNTANT)
- **POST** `/:buildingId/dues` - Create building dues (ADMIN, MANAGER, ACCOUNTANT)
- **GET** `/stats` - Get building statistics (authenticated)

### 4. Contract Routes (`/api/contracts`)

- **POST** `/` - Create contract (ADMIN, MANAGER, PROPERTY_OWNER)
- **GET** `/` - List all contracts (authenticated)
- **GET** `/:id` - Get contract by ID (authenticated)
- **PUT** `/:id` - Update contract (ADMIN, MANAGER, PROPERTY_OWNER)
- **DELETE** `/:id` - Delete contract (ADMIN, MANAGER, PROPERTY_OWNER)
- **POST** `/:id/terminate` - Terminate contract (ADMIN, MANAGER, PROPERTY_OWNER)
- **POST** `/:contractId/payments` - Add rent payment (ADMIN, MANAGER, ACCOUNTANT)
- **PUT** `/:contractId/payments/:paymentId` - Update rent payment (ADMIN, MANAGER, ACCOUNTANT)
- **DELETE** `/:contractId/payments/:paymentId` - Delete rent payment (ADMIN, MANAGER, ACCOUNTANT)

### 5. Tenant Routes (`/api/tenants`)

- **POST** `/` - Create tenant (ADMIN only)
- **GET** `/` - List all tenants (ADMIN only)
- **GET** `/:id` - Get tenant by ID (ADMIN only)
- **PUT** `/:id` - Update tenant (ADMIN only)
- **DELETE** `/:id` - Delete tenant (ADMIN only)
- **GET** `/:id/stats` - Get tenant statistics (ADMIN only)

---

## UI Navigation System Analysis

### Role-Based Menu Items:

#### ADMIN (Full Access)

- Dashboard
- Mülkler (Properties) - Create, List
- Binalar (Buildings) - Create, List
- Sözleşmeler (Contracts) - Active, Expired, Create
- Mali İşlemler (Finance) - Payments, Invoices, Expenses
- Raporlar (Reports) - Income, Occupancy, Maintenance
- Kullanıcı Yönetimi (Users) - List, Create, Roles
- Tenant Yönetimi (Tenants) - List, Create
- Ayarlar (Settings)

#### PROPERTY_OWNER

- Dashboard
- Mülkler (Properties) - Create, List
- Binalar (Buildings) - Create, List
- Sözleşmeler (Contracts) - Active, Expired, Create
- Mali İşlemler (Finance) - Payments, Invoices, Expenses
- Raporlar (Reports) - Income, Occupancy, Maintenance
- Ayarlar (Settings)

#### MANAGER

- Dashboard
- Mülkler (Properties) - Create, List
- Binalar (Buildings) - Create, List
- Sözleşmeler (Contracts) - Active, Expired, Create
- Raporlar (Reports) - Income, Occupancy, Maintenance
- Ayarlar (Settings)

#### ACCOUNTANT

- Dashboard
- Mali İşlemler (Finance) - Payments, Invoices, Expenses
- Raporlar (Reports) - Income, Occupancy, Maintenance
- Ayarlar (Settings)

#### TENANT

- Dashboard
- Kira Bilgilerim (My Rental) - Contract, Payments, Maintenance
- Ayarlar (Settings)

---

## Issues & Inconsistencies Found

### 1. **Role Permission Mismatches**

#### Building Management

- **Backend**: Buildings can only be created/updated by ADMIN + MANAGER
- **UI**: Property Owners can also see building management menu
- **Fix Needed**: UI should hide buildings from PROPERTY_OWNER or backend should allow PROPERTY_OWNER access

#### Building Expenses/Dues

- **Backend**: Building expenses/dues require ADMIN + MANAGER + ACCOUNTANT
- **UI**: No specific UI menu for building expenses/dues management
- **Missing**: UI components for building financial management

#### Finance Access for MANAGER

- **Backend**: MANAGERs can handle payments but not all financial operations
- **UI**: MANAGERs don't see Finance menu at all
- **Fix Needed**: MANAGER should have limited finance access (payments only)

### 2. **Missing Backend Endpoints**

#### User Management

- **UI Has**: User management menus (create, list, roles)
- **Backend Missing**: No user management routes beyond auth
- **Needed**:
  - GET `/api/users` - List users
  - POST `/api/users` - Create user
  - PUT `/api/users/:id` - Update user
  - DELETE `/api/users/:id` - Delete user
  - GET `/api/roles` - List roles

#### Reports

- **UI Has**: Income, Occupancy, Maintenance reports
- **Backend Missing**: No dedicated report endpoints
- **Needed**:
  - GET `/api/reports/income` - Income reports
  - GET `/api/reports/occupancy` - Occupancy reports
  - GET `/api/reports/maintenance` - Maintenance reports

#### Invoices/Expenses Management

- **UI Has**: Invoices and Expenses menus
- **Backend Missing**: No general invoice/expense endpoints
- **Available**: Only building-specific expenses
- **Needed**:
  - GET `/api/finance/invoices` - List invoices
  - POST `/api/finance/invoices` - Create invoice
  - GET `/api/finance/expenses` - List expenses
  - POST `/api/finance/expenses` - Create expense

#### Settings

- **UI Has**: Settings menu for all users
- **Backend Missing**: No settings endpoints
- **Needed**:
  - GET `/api/settings` - Get user settings
  - PUT `/api/settings` - Update user settings

### 3. **Missing UI Components**

#### Property Documents & Maintenance

- **Backend Has**: Document and maintenance endpoints for properties
- **UI Missing**: No specific menus for these features

#### Building Financial Management

- **Backend Has**: Building expenses and dues endpoints
- **UI Missing**: No dedicated building finance menus

#### Tenant Self-Service Features

- **UI Has**: "My Rental" section for tenants
- **Backend Missing**: Tenant-specific endpoints for:
  - GET `/api/my/contract` - Get tenant's contract
  - GET `/api/my/payments` - Get tenant's payments
  - POST `/api/my/maintenance` - Create maintenance request

### 4. **Route Structure Issues**

#### Inconsistent Permission Requirements

- Most endpoints require authentication but have varying role requirements
- Some endpoints like stats are open to all authenticated users
- Payment management has different requirements than contract management

---

## Recommendations

### 1. **Fix Role Permissions**

- Align UI permissions with backend role requirements
- Update MANAGER finance access in UI
- Clarify PROPERTY_OWNER building access

### 2. **Add Missing Backend Routes**

- Implement user management endpoints
- Create report generation endpoints
- Add general finance management endpoints
- Implement settings endpoints
- Add tenant self-service endpoints

### 3. **Enhance UI Menus**

- Add property document/maintenance management
- Add building financial management
- Implement report viewing interfaces
- Create settings pages

### 4. **Standardize Permissions**

- Create consistent role-based access patterns
- Implement middleware for complex permission checks
- Document role capabilities clearly

### 5. **Priority Implementation Order**

1. Fix role permission mismatches (immediate)
2. Add user management backend routes
3. Implement settings functionality
4. Add report generation
5. Enhance tenant self-service features
6. Add advanced property/building management features
