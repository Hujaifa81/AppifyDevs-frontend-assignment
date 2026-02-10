"use client";

import { Badge } from "@/components/ui/badge";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection, UserInfo } from "@/types";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { logoutUser } from "@/services/auth/logoutUser";

interface DashboardSidebarContentProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardSidebarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardSidebarContentProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      "hidden md:flex h-full flex-col border-r bg-sidebar text-sidebar-foreground shadow-sm transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-foreground shadow-md hover:bg-accent transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={cn("flex h-20 items-center transition-all duration-300", isCollapsed ? "px-6" : "px-8")}>
        <Link href={dashboardHome} className="flex items-center space-x-2">
          <div className="min-w-8 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-black">A</span>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-extrabold tracking-tighter text-sidebar-foreground animate-in fade-in duration-500">
              AppifyDevs
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-8">
          {navItems.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-2">
              {section.title && !isCollapsed && (
                <h4 className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-80 animate-in fade-in duration-500 text-nowrap">
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
                      title={isCollapsed ? item.title : ""}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-primary",
                        isCollapsed && "justify-center px-0 w-12 mx-auto"
                      )}
                    >
                      {isActive && (
                        <div className={cn(
                          "absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full",
                          isCollapsed && "-left-2"
                        )} />
                      )}
                      <Icon className={cn("h-5 w-5 transition-colors shrink-0", isActive ? "text-primary" : "group-hover:text-primary")} />
                      {!isCollapsed && (
                        <span className="flex-1 animate-in fade-in slide-in-from-left-2 duration-300">{item.title}</span>
                      )}
                      {item.badge && !isCollapsed && (
                        <Badge
                          className={cn(
                            "ml-auto text-[10px] px-1.5 py-0 rounded-md font-black animate-in fade-in duration-500",
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

      <div className={cn(
        "p-4 m-4 rounded-2xl bg-sidebar-accent/50 border border-sidebar-border/50 transition-all duration-300 space-y-3",
        isCollapsed ? "m-2 px-2" : "m-4"
      )}>
        <div className="flex items-center gap-3">
          <div className="min-w-10 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="text-sm font-black text-primary-foreground">
              {userInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden animate-in fade-in duration-500">
              <p className="text-sm font-bold truncate tracking-tight">{userInfo.name}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">
                {userInfo.role}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => logoutUser()}
          className={cn(
            "flex items-center gap-3 w-full p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-200 mt-2",
            isCollapsed ? "justify-center" : "px-3"
          )}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={18} />
          {!isCollapsed && (
            <span className="text-sm font-bold animate-in fade-in duration-500">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebarContent;