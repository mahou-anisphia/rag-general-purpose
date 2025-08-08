import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "~/server/auth";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { LogOut, Folder, Users, MessageSquare, Wallet, Database, ServerCog, LayoutDashboard, Home } from "lucide-react";

import { ClientSideNavigation } from "./_components/client-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  // Redirect to home page if not authenticated
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r lg:block bg-sidebar">
        <div className="flex h-14 items-center gap-2 px-4 border-b">
          <LayoutDashboard className="size-5 text-primary" />
          <span className="font-semibold">Admin Panel</span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          <ClientSideNavigation />
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 h-14 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-2 lg:hidden">
              <LayoutDashboard className="size-5 text-primary" />
              <span className="font-semibold">Admin Panel</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Welcome, {session.user.name}
              </div>
              <Link href="/">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Home className="mr-2 size-4" />
                  View Site
                </Button>
              </Link>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <Button variant="ghost" size="sm" type="submit" aria-label="Sign out">
                  <LogOut className="size-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 