"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Home, NotebookPen, Sparkles, User } from "lucide-react";
import UserSidebarContent from "./UserSidebarContent";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

const bottomNavItems = [
  { label: "Beranda", href: "/merchant", icon: Home },
  { label: "Catat Manual", href: "/manual-transaction", icon: NotebookPen },
  { label: "Catat AI", href: "/ai-transaction", icon: Sparkles },
  { label: "Profil", href: "/profile", icon: User },
];

const UserDashboardLayout = ({ children }: Props) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SessionProvider>
      <div className="flex min-h-dvh bg-dl-background">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-dl-border bg-white transition-all duration-200 md:flex",
            collapsed ? "w-16" : "w-60",
          )}
        >
          <UserSidebarContent
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
          />
        </aside>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col transition-all duration-200",
            collapsed ? "md:pl-16" : "md:pl-60",
          )}
        >
          <main className="flex-1 p-4 pb-20 sm:p-6 md:pb-8 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-dl-border bg-white px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-dl-primary"
                  : "text-dl-muted hover:text-dl-foreground",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "text-dl-primary")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </SessionProvider>
  );
};

export default UserDashboardLayout;
