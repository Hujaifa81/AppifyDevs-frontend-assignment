import type { Role } from './role.type';

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: Role[];
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

