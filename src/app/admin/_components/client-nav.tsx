"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Folder, Users, MessageSquare, Wallet, Database, ServerCog } from "lucide-react";

function SidebarLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive ? "bg-sidebar-accent text-sidebar-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </Link>
  );
}

export function ClientSideNavigation() {
  return (
    <>
      <SidebarLink href="/admin" label="Documents" icon={Folder} />
      <SidebarLink href="/admin/users" label="User Management" icon={Users} />
      <SidebarLink href="/admin/chats" label="Chat Management" icon={MessageSquare} />
      <SidebarLink href="/admin/costs" label="Cost Analysis" icon={Wallet} />
      <SidebarLink href="/admin/database" label="Database Status" icon={Database} />
      <SidebarLink href="/admin/services" label="Module Services" icon={ServerCog} />
    </>
  );
}
