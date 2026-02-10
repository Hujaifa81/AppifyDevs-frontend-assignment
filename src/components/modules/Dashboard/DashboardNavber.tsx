import { getDefaultDashboardRoute } from "@/lib/auth";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { UserInfo } from "@/types";
import { getNavItemsByRole } from "@/lib/sidebarItems.config";
import DashboardNavbarContent from "@/components/modules/Dashboard/DashboardNavbarContent";
import { redirect } from 'next/navigation';

const DashboardNavbar = async () => {
  const userInfo = await getUserInfo();

  if (!userInfo) {
    redirect('/login');
  }

  const navItems = await getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardNavbarContent
      userInfo={userInfo as UserInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardNavbar;