import DashboardSidebarContent from "@/components/modules/Dashboard/DashboardSidebarContent";
import { getDefaultDashboardRoute } from "@/lib/auth";
import { getNavItemsByRole } from "@/lib/sidebarItems.config";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { NavSection, UserInfo } from "@/types";
import { redirect } from 'next/navigation';

const DashboardSidebar = async () => {
  const userInfo = await getUserInfo();

  if (!userInfo) {
    redirect('/login');
  }

  const navItems: NavSection[] = await getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardSidebarContent
      userInfo={userInfo as UserInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardSidebar;