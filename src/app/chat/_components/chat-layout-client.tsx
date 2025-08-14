"use client";

import { useState } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { useRouter, useParams } from "next/navigation";

interface ChatLayoutClientProps {
  children: React.ReactNode;
}

export function ChatLayoutClient({ children }: ChatLayoutClientProps) {
  const router = useRouter();
  const params = useParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        currentChatId={params?.id as string}
        onNewChat={handleNewChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
