import {
  Users,
  UserPlus,
  Building,
  LayoutDashboard,
  ChartBar,
  Settings,
  FileText,
  Ship,
  Plus,
  Key,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboard",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Employee Management",
    items: [
      {
        title: "All Employees",
        url: "/dashboard/employees",
        icon: Users,
      },
      {
        title: "Add Employee",
        url: "/dashboard/employees/add",
        icon: UserPlus,
      },
      {
        title: "Departments",
        url: "/dashboard/departments",
        icon: Building,
      },
    ],
  },
  {
    id: 3,
    label: "Fleet Management",
    items: [
      {
        title: "All Ships",
        url: "/dashboard/ships",
        icon: Ship,
      },
      {
        title: "Add Ship",
        url: "/dashboard/ships/add",
        icon: Plus,
      },
      {
        title: "Ship Authentication",
        url: "/dashboard/ships/auth",
        icon: Key,
      },
    ],
  },
  {
    id: 4,
    label: "Administration",
    items: [
      {
        title: "User Approval",
        url: "/dashboard/users/approval",
        icon: UserCheck,
      },
    ],
  },
  {
    id: 5,
    label: "Reports & Analytics",
    items: [
      {
        title: "Employee Reports",
        url: "/dashboard/reports/employees",
        icon: FileText,
      },
      {
        title: "Ship Reports",
        url: "/dashboard/reports/ships",
        icon: FileText,
      },
      {
        title: "Fleet Analytics",
        url: "/dashboard/reports/fleet",
        icon: ChartBar,
      },
    ],
  },
  {
    id: 6,
    label: "Settings",
    items: [
      {
        title: "System Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
