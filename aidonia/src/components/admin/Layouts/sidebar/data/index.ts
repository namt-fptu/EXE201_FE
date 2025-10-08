import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "DASHBOARD",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Overview", 
            url: "/admin",
          },
          {
            title: "Analytics",
            url: "/admin/analytics",
          },
          {
            title: "Charts",
            url: "/admin/charts/basic-chart",
          },
          {
            title: "Reports",
            url: "/admin/reports",
          },
        ],
      },
    ],
  },
  {
    label: "MANAGEMENT", 
    items: [
      {
        title: "Packages",
        url: "/admin/packages",
        icon: Icons.Package,
      },
      {
        title: "Calendar",
        url: "/admin/calendar",
        icon: Icons.Calendar,
      },
      {
        title: "Tables",
        url: "/admin/tables",
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: "/admin/tables",
          },
        ],
      },
      {
        title: "Packages",
        url: "/admin/packages",
        icon: Icons.Package,
        items: [],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/admin/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      {
        title: "Profile", 
        url: "/admin/profile",
        icon: Icons.User,
      },
      {
        title: "Settings",
        url: "/admin/pages/settings",
        icon: Icons.Settings,
      },
    ],
  },
];
