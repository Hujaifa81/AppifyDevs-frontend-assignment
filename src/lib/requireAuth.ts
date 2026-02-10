import { getUserInfo } from '@/services/auth/getUserInfo';
import { redirect } from 'next/navigation';
import { getDefaultDashboardRoute } from '@/lib/auth';
import type { Role } from '@/types/role.type';

export async function requireAuth(requiredRoles?: Role[] | Role) {
  const user = await getUserInfo();
  if (!user) {
    redirect('/login');
  }

  if (requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (!roles.includes(user.role as Role)) {
      redirect(getDefaultDashboardRoute(user.role as Role));
    }
  }

  return user;
}

export default requireAuth;
