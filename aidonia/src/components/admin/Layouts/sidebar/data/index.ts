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
        title: "Calendar",
        url: "/admin/calendar",
        icon: Icons.Calendar,
      },
      
      {
        title: "Packages",
        url: "/admin/packages",
        icon: Icons.Package,
        items: [],
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
