import DashboardSidebarContent from "@/components/modules/Dashboard/DashboardSidebarContent";
import { getDefaultDashboardRoute } from "@/lib/auth";
import { getNavItemsByRole } from "@/lib/sidebarItems.config";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { NavSection, UserInfo } from "@/types";

const DashboardSidebar = async () => {
  const userInfo = (await getUserInfo()) as UserInfo;

  const navItems: NavSection[] = await getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardSidebarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardSidebar;