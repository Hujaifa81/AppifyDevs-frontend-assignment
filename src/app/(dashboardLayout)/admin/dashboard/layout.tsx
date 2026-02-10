import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavber";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import React from "react";
import ReduxProvider from '@/redux/provider';
import requireAuth from '@/lib/requireAuth';

export const dynamic = "force-dynamic";

const CommonDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await requireAuth();
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
          <ReduxProvider>
            <div className="">{children}</div>
          </ReduxProvider>
        </main>
      </div>
    </div>
  );
};

export default CommonDashboardLayout;