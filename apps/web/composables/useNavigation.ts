import {
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  Frame,
  Building,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Home,
  Wrench,
  CreditCard,
  Receipt,
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
        url: "/",
        icon: SquareTerminal,
        isActive: true,
      },
    ];
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
        ],
      });
    }

    if (userStore.canManageBuildings) {
      navMain.push({
        title: "Binalar",
        url: "/buildings",
        icon: BookOpen,
        items: [
          {
            title: "Tüm Binalar",
            url: "/buildings",
            icon: BookOpen,
          },
          {
            title: "Yeni Bina",
            url: "/buildings/create",
            icon: BookOpen,
          },
        ],
      });
    }

    if (userStore.canManageContracts) {
      navMain.push({
        title: "Sözleşmeler",
        url: "/contracts",
        icon: FileText,
        items: [
          {
            title: "Aktif Sözleşmeler",
            url: "/contracts?status=ACTIVE",
            icon: FileText,
          },
          {
            title: "Süresi Dolan",
            url: "/contracts?status=EXPIRED",
            icon: FileText,
          },
          {
            title: "Yeni Sözleşme",
            url: "/contracts/create",
            icon: FileText,
          },
        ],
      });
    }
    if (userStore.canViewFinancials) {
      navMain.push({
        title: "Mali İşlemler",
        url: "/finance",
        icon: DollarSign,
        items: [
          {
            title: "Ödemeler",
            url: "/finance/payments",
            icon: CreditCard,
          },
          {
            title: "Faturalar",
            url: "/finance/invoices",
            icon: Receipt,
          },
          {
            title: "Giderler",
            url: "/finance/expenses",
            icon: DollarSign,
          },
        ],
      });
    }
    if (userStore.isTenant) {
      navMain.push({
        title: "Kira Bilgilerim",
        url: "/my-rental",
        icon: Home,
        items: [
          {
            title: "Sözleşmem",
            url: "/my-rental/contract",
            icon: FileText,
          },
          {
            title: "Ödemelerim",
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
    if (userStore.canViewReports) {
      navMain.push({
        title: "Raporlar",
        url: "/reports",
        icon: BarChart3,
        items: [
          {
            title: "Gelir Raporu",
            url: "/reports/income",
            icon: DollarSign,
          },
          {
            title: "Doluluk Raporu",
            url: "/reports/occupancy",
            icon: BarChart3,
          },
          {
            title: "Bakım Raporu",
            url: "/reports/maintenance",
            icon: Wrench,
          },
        ],
      });
    }
    if (userStore.canManageUsers) {
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
            icon: Settings2,
          },
        ],
      });
    }

    if (userStore.canManageTenants) {
      navMain.push({
        title: "Tenant Yönetimi",
        url: "/tenants",
        icon: Bot,
        items: [
          {
            title: "Tüm Tenantlar",
            url: "/tenants",
            icon: Bot,
          },
          {
            title: "Yeni Tenant",
            url: "/tenants/create",
            icon: Bot,
          },
        ],
      });
    }
    const projects = [
      {
        name: "Ayarlar",
        url: "/settings",
        icon: Frame,
      },
    ];
    return {
      navMain,
      projects,
      user: {
        name:
          userStore.user?.firstName && userStore.user?.lastName
            ? `${userStore.user.firstName} ${userStore.user.lastName}`
            : userStore.user?.email?.split("@")[0] || "Kullanıcı",
        email: userStore.user?.email || "",
        avatar: "/avatars/default.jpg",
      },
    };
  };
  const canAccessRoute = (route: string): boolean => {
    const authToken = useCookie<string | null>("auth_token");
    if (!authToken.value) return false;

    if (!userStore.user) {
      const basicRoutes = ["/", "/settings"];
      return basicRoutes.includes(route);
    }

    const allowedRoutes = getMenuItemsForRole(userStore.user.role);

    const routeMap: Record<string, string> = {
      "/": "dashboard",
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
        "buildings",
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
