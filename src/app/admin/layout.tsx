import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

import { Button } from "~/components/ui/button";
import { LogoutDialog } from "~/components/logout-dialog";
import { NotificationProvider } from "~/components/notification-provider";
import {
  LogOut,
  LayoutDashboard,
  Home,
} from "lucide-react";

import { ClientSideNavigation } from "./_components/client-nav";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Redirect to home page if not authenticated
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="bg-sidebar hidden border-r lg:block">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <LayoutDashboard className="text-primary size-5" />
          <span className="font-semibold">Admin Panel</span>
        </div>
        <nav className="space-y-1 px-3 py-4">
          <ClientSideNavigation />
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 h-14 border-b backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-2 lg:hidden">
              <LayoutDashboard className="text-primary size-5" />
              <span className="font-semibold">Admin Panel</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-muted-foreground text-sm">
                Welcome, {session.user.name}
              </div>
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  <Home className="mr-2 size-4" />
                  View Site
                </Button>
              </Link>
              <LogoutDialog>
                <Button variant="ghost" size="sm" aria-label="Sign out">
                  <LogOut className="size-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </LogoutDialog>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
      <NotificationProvider />
    </div>
  );
}
