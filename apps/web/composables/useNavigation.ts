import {
  SquareTerminal,
  Building,
  Users,
  DollarSign,
  BarChart3,
  Home,
  Wrench,
  CreditCard,
  Receipt,
  UserCheck,
  Building2,
  TrendingUp,
  PieChart,
  Calculator,
  Settings2,
  ReceiptText,
  type LucideIcon,
} from "lucide-vue-next";

interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
  items?: NavigationItem[];
  isActive?: boolean;
}

export const useNavigation = () => {
  const userStore = useUserStore();

  const getNavigationData = () => {
    const navMain: NavigationItem[] = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
    ];

    // Properties - Available for ADMIN, PROPERTY_OWNER, MANAGER
    // Backend: POST/GET/PUT/DELETE /api/properties, /api/properties/:id, /api/properties/stats
    if (userStore.canManageProperties) {
      navMain.push({
        title: "Mülkler",
        url: "/properties",
        icon: Building,
        items: [
          {
            title: "Tüm Mülkler",
            url: "/properties",
            icon: Building,
          },
          {
            title: "Yeni Mülk",
            url: "/properties/create",
            icon: Building,
          },
          {
            title: "Mülk İstatistikleri",
            url: "/properties/stats",
            icon: BarChart3,
          },
        ],
      });
    }

    // Buildings - Available for ADMIN, MANAGER only (Backend restriction)
    // Backend: POST/GET/PUT/DELETE /api/buildings, /api/buildings/:id, /api/buildings/stats
    if (
      userStore.user?.role === "ADMIN" ||
      userStore.user?.role === "MANAGER"
    ) {
      navMain.push({
        title: "Binalar",
        url: "/buildings",
        icon: Building2,
        items: [
          {
            title: "Tüm Binalar",
            url: "/buildings",
            icon: Building2,
          },
          {
            title: "Yeni Bina",
            url: "/buildings/create",
            icon: Building2,
          },
          {
            title: "Bina İstatistikleri",
            url: "/buildings/stats",
            icon: BarChart3,
          },
        ],
      });
    }

    // Contracts - Available for ADMIN, PROPERTY_OWNER, MANAGER
    // Backend: POST/GET/PUT/DELETE /api/contracts, /api/contracts/:id
    if (userStore.canManageContracts) {
      navMain.push({
        title: "Sözleşmeler",
        url: "/contracts",
        icon: ReceiptText,
        items: [
          {
            title: "Aktif Sözleşmeler",
            url: "/contracts?status=active",
            icon: ReceiptText,
          },
          {
            title: "Sona Eren Sözleşmeler",
            url: "/contracts?status=expired",
            icon: ReceiptText,
          },
          {
            title: "Yeni Sözleşme",
            url: "/contracts/create",
            icon: ReceiptText,
          },
        ],
      });
    }

    // Finance - Role-based access with proper backend permissions
    const financeItems: NavigationItem[] = [];

    // Payments - Available for ADMIN, MANAGER, ACCOUNTANT
    if (
      userStore.user?.role === "ADMIN" ||
      userStore.user?.role === "MANAGER" ||
      userStore.user?.role === "ACCOUNTANT"
    ) {
      financeItems.push({
        title: "Ödemeler",
        url: "/finance/payments",
        icon: CreditCard,
      });
    }

    // General Finance - Available for ADMIN, PROPERTY_OWNER, ACCOUNTANT
    if (
      userStore.user?.role === "ADMIN" ||
      userStore.user?.role === "PROPERTY_OWNER" ||
      userStore.user?.role === "ACCOUNTANT"
    ) {
      financeItems.push(
        {
          title: "Faturalar",
          url: "/finance/invoices",
          icon: Receipt,
        },
        {
          title: "Giderler",
          url: "/finance/expenses",
          icon: Calculator,
        }
      );
    }

    // Building Finance - Available for ADMIN, MANAGER, ACCOUNTANT
    if (
      userStore.user?.role === "ADMIN" ||
      userStore.user?.role === "MANAGER" ||
      userStore.user?.role === "ACCOUNTANT"
    ) {
      financeItems.push({
        title: "Bina Giderleri",
        url: "/finance/building-expenses",
        icon: Building2,
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

    // Reports - Available for ADMIN, PROPERTY_OWNER, MANAGER, ACCOUNTANT
    if (userStore.canViewReports) {
      navMain.push({
        title: "Raporlar",
        url: "/reports",
        icon: BarChart3,
        items: [
          {
            title: "Gelir Raporu",
            url: "/reports/income",
            icon: TrendingUp,
          },
          {
            title: "Doluluk Raporu",
            url: "/reports/occupancy",
            icon: PieChart,
          },
          {
            title: "Bakım Raporu",
            url: "/reports/maintenance",
            icon: Wrench,
          },
        ],
      });
    }

    // User Management - ADMIN only
    // Backend: Need to implement /api/users endpoints
    if (userStore.user?.role === "ADMIN") {
      navMain.push({
        title: "Kullanıcı Yönetimi",
        url: "/users",
        icon: Users,
        items: [
          {
            title: "Tüm Kullanıcılar",
            url: "/users",
            icon: Users,
          },
          {
            title: "Yeni Kullanıcı",
            url: "/users/create",
            icon: Users,
          },
          {
            title: "Roller",
            url: "/users/roles",
            icon: UserCheck,
          },
        ],
      });
    }

    // Tenant Management - ADMIN only
    // Backend: /api/tenants endpoints available
    if (userStore.user?.role === "ADMIN") {
      navMain.push({
        title: "Kiracı Yönetimi",
        url: "/tenants",
        icon: UserCheck,
        items: [
          {
            title: "Tüm Kiracılar",
            url: "/tenants",
            icon: UserCheck,
          },
          {
            title: "Yeni Kiracı",
            url: "/tenants/create",
            icon: UserCheck,
          },
        ],
      });
    }

    // For TENANT role - My Rental info
    // Backend: Need to implement tenant-specific /api/my/* endpoints
    if (userStore.user?.role === "TENANT") {
      navMain.push({
        title: "Kiralama Bilgilerim",
        url: "/my-rental",
        icon: Home,
        items: [
          {
            title: "Sözleşme Detayları",
            url: "/my-rental/contract",
            icon: Contract,
          },
          {
            title: "Ödeme Geçmişi",
            url: "/my-rental/payments",
            icon: CreditCard,
          },
          {
            title: "Bakım Talepleri",
            url: "/my-rental/maintenance",
            icon: Wrench,
          },
        ],
      });
    }

    // Settings - Available for all authenticated users
    // Backend: Need to implement /api/settings endpoints
    navMain.push({
      title: "Ayarlar",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Profil",
          url: "/settings/profile",
          icon: Settings2,
        },
        {
          title: "Hesap",
          url: "/settings/account",
          icon: Settings2,
        },
        {
          title: "Bildirimler",
          url: "/settings/notifications",
          icon: Settings2,
        },
      ],
    });

    const projects: NavigationItem[] = [];

    const user = {
      name:
        userStore.user?.firstName && userStore.user?.lastName
          ? `${userStore.user.firstName} ${userStore.user.lastName}`
          : userStore.user?.email || "Kullanıcı",
      email: userStore.user?.email || "",
      avatar: userStore.user?.avatar || "/avatars/default.jpg",
    };

    return {
      navMain,
      projects,
      user,
    };
  };

  const canAccessRoute = (route: string): boolean => {
    const authToken = useCookie<string | null>("auth_token");
    if (!authToken.value) return false;

    if (!userStore.user) {
      const basicRoutes = ["/dashboard", "/settings"];
      return basicRoutes.includes(route);
    }

    const allowedRoutes = getMenuItemsForRole(userStore.user.role);

    const routeMap: Record<string, string> = {
      "/dashboard": "dashboard",
      "/properties": "properties",
      "/buildings": "buildings",
      "/contracts": "contracts",
      "/finance": "finance",
      "/reports": "reports",
      "/users": "users",
      "/tenants": "tenants",
      "/my-rental": "my-rental",
      "/settings": "settings",
    };

    const requiredPermission = routeMap[route];
    return !requiredPermission || allowedRoutes.includes(requiredPermission);
  };

  const getMenuItemsForRole = (role: string) => {
    const roleItems: Record<string, string[]> = {
      ADMIN: [
        "dashboard",
        "properties",
        "buildings",
        "contracts",
        "finance",
        "reports",
        "users",
        "tenants",
        "settings",
      ],
      PROPERTY_OWNER: [
        "dashboard",
        "properties",
        "contracts",
        "finance",
        "reports",
        "settings",
      ],
      MANAGER: [
        "dashboard",
        "properties",
        "buildings",
        "contracts",
        "finance",
        "reports",
        "settings",
      ],
      ACCOUNTANT: ["dashboard", "finance", "reports", "settings"],
      TENANT: ["dashboard", "my-rental", "settings"],
    };

    return roleItems[role] || ["dashboard", "settings"];
  };

  return {
    getNavigationData,
    canAccessRoute,
    getMenuItemsForRole,
  };
};
