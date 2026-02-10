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
        // optional badge (example: highlight new reports)
        badge: undefined,
        roles: ['ADMIN'],
      },
      {
        title: 'Orders',
        href: '/admin/dashboard/orders',
        icon: 'ShoppingCart',
        badge: 'new',
        roles: ['ADMIN'],
      },
      {
        title: 'Users',
        href: '/admin/dashboard/users',
        icon: 'Users',
        badge: undefined,
        roles: ['ADMIN'],
      },
      {
        title: 'Traffic',
        href: '/admin/dashboard/traffic',
        icon: 'Globe',
        badge: undefined,
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
        title: 'Revenue',
        href: '/manager/dashboard/revenue',
        icon: 'DollarSign',
        roles: ['MANAGER'],
      },
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
      {
        title: 'Traffic',
        href: '/manager/dashboard/traffic',
        icon: 'Globe',
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