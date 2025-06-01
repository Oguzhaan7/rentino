# 🏠 Rentino - Property Management System

A comprehensive, multi-tenant property management system built with modern technologies. Features Vue.js/Nuxt.js frontend and Fastify backend for efficient real estate and tenant management.

## 📋 Table of Contents

- [🚀 Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ Project Structure](#️-project-structure)
- [⚙️ Installation](#️-installation)
- [🔧 Development](#-development)
- [🗃️ Database](#️-database)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [📊 API Overview](#-api-overview)
- [🎨 Frontend Features](#-frontend-features)
- [🔒 Security](#-security)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

## 🚀 Features

### 🏢 Multi-Tenant Architecture

- **Tenant Isolation**: Separate data isolation for each tenant organization
- **Domain-Based Routing**: Automatic tenant resolution via subdomain
- **Tenant Switching**: Admin users can switch between tenants
- **Cross-Tenant Access Control**: Secure tenant boundaries

### 👥 User Management

- **Role-Based Access Control (RBAC)**:

  - `ADMIN` - System administrator (all permissions)
  - `PROPERTY_OWNER` - Property owner (property and contract management)
  - `MANAGER` - Manager (operational tasks)
  - `ACCOUNTANT` - Accountant (financial operations)
  - `TENANT` - Tenant (personal information only)

- **User Operations**:
  - Complete CRUD operations
  - Profile management with avatar support
  - Role-based dashboard and menu system
  - User activation/deactivation
  - Last login tracking

### 🏠 Property Management

- **Comprehensive Property Database**:

  - Property types: Apartment, House, Office, Shop, Land, Warehouse
  - Status tracking: Available, Rented, Under Maintenance, For Sale, Sold
  - Detailed property information (area, rooms, age, floor, etc.)
  - Location data (city, district, address, postal code)

- **Property Operations**:
  - Property CRUD operations
  - Document and photo management
  - Maintenance history tracking
  - Property statistics and analytics

### 🏢 Building Management

- **Building Organization**:

  - Multi-property grouping
  - Building status tracking (Active, Under Maintenance, Inactive)
  - Floor and apartment numbering
  - Building manager assignment

- **Building Statistics**:
  - Total apartment count
  - Occupancy rates
  - Revenue analysis
  - Maintenance costs

### 📋 Contract Management

- **Comprehensive Contract System**:

  - Rental agreement creation and management
  - Contract status tracking (Active, Inactive, Expired)
  - Automatic renewal handling
  - Contract termination workflow

- **Contract Features**:
  - Flexible rental terms
  - Security deposit management
  - Payment schedule generation
  - Contract document storage

### 👨‍👩‍👧‍👦 Tenant Management

- **Tenant Operations**:

  - Tenant registration and profile management
  - Property assignment
  - Payment status tracking
  - Communication history

- **Tenant Services**:
  - Personal dashboard for tenants
  - Payment history
  - Contract details access
  - Maintenance request submission

### 💰 Financial Management

- **Payment Tracking**:

  - Rent payment management
  - Late payment notifications
  - Payment history and analytics
  - Financial reporting

- **Revenue Management**:
  - Income tracking
  - Expense management
  - Profit/loss analysis
  - Tax reporting support

### 🔔 Notification System

- **Automated Notifications**:
  - Payment reminders
  - Contract expiration alerts
  - Maintenance notifications
  - System announcements

### 📊 Dashboard & Reporting

- **Interactive Dashboard**:

  - Real-time statistics
  - Charts and graphs
  - Quick access buttons
  - Recent activities

- **Advanced Reporting**:
  - Customizable date ranges
  - Excel/PDF export
  - Filtering and search
  - Visual analytics

### 🔍 Search & Filtering

- **Advanced Search**:
  - Search across all modules
  - Multi-criteria filtering
  - Auto-complete functionality
  - Saved search filters

## 🛠️ Technology Stack

### Frontend (Web App)

- **Framework**: Vue.js 3 + Nuxt.js 3
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State Management**: Pinia
- **Type Safety**: TypeScript
- **Icons**: Lucide Vue
- **Features**:
  - Dark/Light Mode support
  - Responsive design
  - SSR/SSG support

### Backend (API Server)

- **Framework**: Fastify
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Validation**: Fastify JSON Schema
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate limiting

### Database & ORM

- **Database**: PostgreSQL
- **ORM**: Prisma
- **Migration**: Prisma Migrate
- **Management**: Prisma Studio

### Development Tools

- **Package Manager**: pnpm + Turborepo
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Vite
- **Hot Reload**: Development servers with HMR

## 🏗️ Project Structure

```
rentino/
├── apps/
│   ├── backend/                 # Fastify API server
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic services
│   │   │   ├── schemas/        # Validation schemas
│   │   │   ├── middleware/     # Custom middlewares
│   │   │   ├── plugins/        # Fastify plugins
│   │   │   └── utils/          # Utility functions
│   │   └── package.json
│   │
│   └── web/                    # Nuxt.js frontend application
│       ├── components/         # Vue components
│       ├── composables/        # Vue composables
│       ├── pages/              # Page components
│       ├── layouts/            # Layout definitions
│       ├── middleware/         # Route middlewares
│       ├── stores/             # Pinia stores
│       └── types/              # TypeScript type definitions
│
├── packages/                   # Shared packages
│   ├── database/              # Prisma database package
│   ├── tenant/                # Multi-tenant utilities
│   └── util/                  # Common utility functions
│
├── prisma/                    # Database schema and migrations
└── package.json              # Root package.json (workspace)
```

## ⚙️ Installation

### System Requirements

- Node.js 18+
- PostgreSQL 14+
- pnpm 8+

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rentino
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

**Backend (.env)**

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rentino"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=5000
```

**Frontend (.env)**

```env
NUXT_API_BASE_URL="http://localhost:5000/api"
```

### 4. Setup Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Open Prisma Studio
pnpm prisma:studio
```

### 5. Start the Application

```bash
# Start all services (with turborepo)
pnpm dev

# Or separately
pnpm --filter backend dev    # Backend: http://localhost:5000
pnpm --filter web dev        # Frontend: http://localhost:3000
```

## 🔧 Development

### Development Commands

```bash
# Run all applications in development mode
pnpm dev

# Build all applications
pnpm build

# Lint code
pnpm lint

# Prisma commands
pnpm prisma:generate    # Generate client
pnpm prisma:migrate     # Run migrations
pnpm prisma:studio      # Database browser
```

### Code Style & Conventions

- **ESLint**: Code quality and style control
- **TypeScript**: Type safety
- **Prettier**: Code formatting (integrated with ESLint)
- **Conventional Commits**: Git commit format

## 🗃️ Database

### Core Tables

#### Users

- Identity information (email, password)
- Profile information (name, phone, avatar)
- Role management (ADMIN, PROPERTY_OWNER, MANAGER, ACCOUNTANT, TENANT)
- Tenant relationship

#### Properties

- Property details (title, type, status, area, rooms)
- Location information (address, city, district)
- Ownership information
- Building relationship

#### Buildings

- Building information (name, address, manager)
- Status tracking (active, maintenance, inactive)
- Property relationships

#### Contracts

- Contract details (start, end, rent amount)
- Tenant and property relationships
- Status tracking (active, inactive, expired)

#### Transactions

- Financial transaction records
- Payment tracking
- Income-expense categories

### Database Relationships

```sql
-- Core relationships
User 1:N Property (ownedProperties)
User 1:N Contract (tenancies)
Property 1:N Contract (rentalContracts)
Building 1:N Property (properties)
User 1:N Building (managedBuildings)

-- Multi-tenant relationships
Tenant 1:N User
Tenant 1:N Property
Tenant 1:N Building
```

## 🔐 Authentication & Authorization

### JWT Authentication

- **Login**: Email/password authentication
- **Token**: JWT token-based authentication
- **Refresh**: Automatic token renewal
- **Logout**: Secure logout

### Role-Based Authorization (RBAC)

#### ADMIN

- ✅ Complete system management
- ✅ User management
- ✅ Tenant management
- ✅ All reports and statistics

#### PROPERTY_OWNER

- ✅ Property management (CRUD)
- ✅ Contract management
- ✅ Financial reports
- ✅ Tenant information
- ❌ User management

#### MANAGER

- ✅ Operational tasks
- ✅ Building management
- ✅ Maintenance management
- ✅ Some reports
- ❌ Financial operations

#### ACCOUNTANT

- ✅ Financial operations
- ✅ Payment tracking
- ✅ Invoice management
- ✅ Financial reports
- ❌ Property management

#### TENANT

- ✅ Personal rental information
- ✅ Payment history
- ✅ Contract details
- ❌ Other user data

### Multi-Tenant Security

- **Tenant Isolation**: Database-level tenant filtering
- **Cross-Tenant Protection**: Automatic tenant boundary control
- **Admin Override**: Multi-tenant access for system administrators

## 📊 API Overview

### Core API Modules

- **Authentication**: Login, register, logout, profile
- **Users**: User CRUD, role management, statistics
- **Properties**: Property CRUD, documents, maintenance
- **Buildings**: Building CRUD, management, statistics
- **Contracts**: Contract CRUD, renewal, termination
- **Tenants**: Tenant CRUD, notifications, status
- **Roles**: Role management and permissions
- **Organizational Tenants**: Multi-tenant management

### API Documentation

- **Swagger UI**: Available at `/documentation`
- **Interactive Testing**: Built-in API testing interface
- **Schema Validation**: Automatic request/response validation
- **Examples**: Request/response examples for all endpoints

## 🎨 Frontend Features

### Modern UI/UX

- **Shadcn/ui**: Modern, accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Mobile-first approach

### Vue.js 3 Features

- **Composition API**: Modern Vue.js syntax
- **Composables**: Reusable logic composition
- **Pinia State Management**: Reactive state management
- **TypeScript**: Full type support

### UI Components

- **Form Components**: Input, Select, Checkbox, Radio
- **Data Display**: Table, Card, Badge, Avatar
- **Navigation**: Sidebar, Breadcrumb, Pagination
- **Feedback**: Toast, Modal, Alert, Loading
- **Layout**: Grid, Container, Spacer

### Composables (Reusable Logic)

```typescript
// API operations
useApi()              # HTTP client wrapper
useProperties()       # Property CRUD operations
useUsers()            # User management
useTenants()          # Tenant management
useBuildings()        # Building management
useRoles()            # Role management

// UI utilities
useNavigation()       # Menu and navigation
useToast()            # Notification system
useModal()            # Modal management
```

### State Management (Pinia)

```typescript
// Stores
useUserStore()        # User state and permissions
useTenantStore()      # Multi-tenant state
useThemeStore()       # Theme and UI settings
```

## 🔒 Security

### Backend Security

- **Helmet**: Security headers (XSS, CSRF, etc.)
- **CORS**: Cross-origin resource sharing control
- **Rate Limiting**: API request limiting
- **Input Validation**: JSON Schema validation
- **SQL Injection**: Prisma ORM protection
- **Password Hashing**: Secure encryption with bcryptjs

### Frontend Security

- **XSS Protection**: Vue.js built-in sanitization
- **CSRF Protection**: Token-based requests
- **Route Guards**: Middleware access control
- **Sensitive Data**: Debug mode disabled in production
- **Environment Variables**: Secure configuration

### Multi-Tenant Security

- **Data Isolation**: Tenant-level data isolation
- **Access Control**: Automatic tenant boundary control
- **Audit Logging**: Operation logging for all actions
- **Admin Supervision**: Cross-tenant access logging

## 🚀 Deployment

### Production Build

```bash
# Build all applications
pnpm build

# Backend production start
cd apps/backend && pnpm start

# Frontend static build (SSG)
cd apps/web && pnpm generate
```

### Environment Configuration

```env
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=super-secret-production-key
API_BASE_URL=https://api.yourdomain.com
```

### Deployment Platforms

- **Backend**: Railway, Heroku, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: PostgreSQL (Neon, Supabase, Railway, AWS RDS)

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Commit** with conventional commits
7. **Push** to your fork
8. **Create** a pull request

### Code Standards

- **TypeScript**: Full type support required
- **ESLint**: Compliance with linting rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Pull Request Guidelines

- Descriptive title and description
- Link to related issue
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

---

## 🏷️ Version History

### v1.0.0 (Current)

- ✅ Multi-tenant architecture
- ✅ User management (RBAC)
- ✅ Property management
- ✅ Building management
- ✅ Tenant management
- ✅ Contract management
- ✅ Dashboard and statistics
- ✅ Responsive UI/UX

### Future Releases

- 🔄 **v1.1.0**: Payment system integration
- 🔄 **v1.2.0**: Advanced reporting
- 🔄 **v1.3.0**: Mobile application
- 🔄 **v2.0.0**: Microservices architecture

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Open source projects and libraries used in this project:

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Nuxt.js](https://nuxtjs.org/) - Vue.js meta-framework
- [Fastify](https://www.fastify.io/) - Fast web framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn/ui](https://ui.shadcn.com/) - Re-usable components

---

**Rentino** - Experience modern property management! 🏠✨
