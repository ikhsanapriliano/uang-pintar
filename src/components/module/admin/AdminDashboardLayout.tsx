"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import AdminSidebarContent, { navItems } from "./AdminSidebarContent";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

const AdminDashboardLayout = ({ children }: Props) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const pageTitle =
    navItems.find((item) => pathname === item.href)?.label ?? "Admin";

  return (
    <SessionProvider>
      <div className="flex min-h-dvh bg-dl-background">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-dl-border bg-white transition-all duration-200 md:flex",
            collapsed ? "w-16" : "w-60",
          )}
        >
          <AdminSidebarContent
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
          <header className="flex items-center gap-3 border-b border-dl-border bg-white px-4 py-3 md:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-dl-foreground"
                  aria-label="Buka menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] bg-white p-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <SheetTitle className="sr-only">Menu Admin</SheetTitle>
                <AdminSidebarContent onNavigate={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="truncate text-sm font-bold text-dl-foreground">
              {pageTitle}
            </span>
          </header>

          <main className="flex-1 p-4 pb-8 sm:p-6 md:pb-8 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
};

export default AdminDashboardLayout;
