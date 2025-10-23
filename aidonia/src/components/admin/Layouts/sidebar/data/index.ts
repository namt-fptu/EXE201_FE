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
        items: [],
      },
      
      {
        title: "Categories",
        url: "/admin/categories",
        icon: Icons.Table,
        items: [],
      },
      
      {
        title: "Post Approval",
        url: "/admin/post-approval",
        icon: Icons.Settings,
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
