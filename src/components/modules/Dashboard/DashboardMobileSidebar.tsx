"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection, UserInfo } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";
import { logoutUser } from "@/services/auth/logoutUser";

interface DashboardMobileSidebarContentProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardMobileSidebar = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardMobileSidebarContentProps) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-20 items-center px-8 border-b border-sidebar-border/50">
        <Link href={dashboardHome} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-black">A</span>
          </div>
          <span className="text-xl font-extrabold tracking-tighter">AppifyDevs</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-8">
          {navItems.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-3">
              {section.title && (
                <h4 className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-80">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = getIconComponent(item.icon);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "group-hover:text-primary")} />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge
                          className={cn(
                            "ml-auto text-[10px] px-1.5 py-0 rounded-md font-black",
                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info & Logout at Bottom */}
      <div className="p-4 m-4 rounded-2xl bg-sidebar-accent/50 border border-sidebar-border/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-sm font-black text-primary-foreground">
              {userInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate tracking-tight">{userInfo.name}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">
              {userInfo.role}
            </p>
          </div>
        </div>

        <button
          onClick={() => logoutUser()}
          className="flex items-center gap-3 w-full p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-200 font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardMobileSidebar;
