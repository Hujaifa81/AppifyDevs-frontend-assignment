import { getDefaultDashboardRoute } from "@/lib/auth";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { UserInfo } from "@/types";
import { getNavItemsByRole } from "@/lib/sidebarItems.config";
import DashboardNavbarContent from "@/components/modules/Dashboard/DashboardNavbarContent";

const DashboardNavbar = async () => {
  const userInfo = (await getUserInfo()) as UserInfo;
  const navItems = await getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardNavbarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardNavbar;