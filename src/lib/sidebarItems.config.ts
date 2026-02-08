import { Role, NavSection } from '@/types';
import { getDefaultDashboardRoute } from './auth';



export const getCommonNavItems = (role: Role): NavSection[] => {
  const defaultDashboard = getDefaultDashboardRoute(role);

  return [
    {
      items: [
        {
          title: 'Dashboard',
          href: defaultDashboard,
          icon: 'LayoutDashboard',
          roles: ['ADMIN', 'MANAGER'],
        },
      ],
    },
  ];
};


export const adminNavItems: NavSection[] = [
  {
    title: 'Analytics',
    items: [
      {
        title: 'Revenue',
        href: '/admin/dashboard/revenue',
        icon: 'DollarSign',
        roles: ['ADMIN'],
      },
      {
        title: 'Orders',
        href: '/admin/dashboard/orders',
        icon: 'ShoppingCart',
        roles: ['ADMIN'],
      },
      {
        title: 'Users',
        href: '/admin/dashboard/users',
        icon: 'Users',
        roles: ['ADMIN'],
      },
      {
        title: 'Traffic',
        href: '/admin/dashboard/traffic',
        icon: 'Globe',
        roles: ['ADMIN'],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        href: '/admin/dashboard/settings',
        icon: 'Settings',
        roles: ['ADMIN'],
      },
    ],
  },
];


export const managerNavItems: NavSection[] = [
  {
    title: 'Analytics',
    items: [
      {
        title: 'Orders',
        href: '/manager/dashboard/orders',
        icon: 'ShoppingCart',
        roles: ['MANAGER'],
      },
      {
        title: 'Users',
        href: '/manager/dashboard/users',
        icon: 'Users',
        roles: ['MANAGER'],
      },
    ],
  },
];


export const getNavItemsByRole = (role: Role): NavSection[] => {
  const commonNavItems = getCommonNavItems(role);

  switch (role) {
    case 'ADMIN':
      return [...commonNavItems, ...adminNavItems];
    case 'MANAGER':
      return [...commonNavItems, ...managerNavItems];
    default:
      return commonNavItems;
  }
};