"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  Plus,
  MessageSquare,
  Trash2,
  Home,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface ChatSidebarProps {
  currentChatId?: string;
  onNewChat: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatSidebar({
  currentChatId,
  onNewChat,
  isCollapsed = false,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Get chat list from tRPC
  const { data: chats = [], isLoading } = api.chat.list.useQuery();
  const utils = api.useUtils();
  const deleteChatMutation = api.chat.delete.useMutation({
    onSuccess: () => {
      // Refresh the chat list after deletion
      void utils.chat.list.invalidate();
    },
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const handleDeleteChatClick = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedChatId(chatId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteChat = async () => {
    if (selectedChatId) {
      try {
        await deleteChatMutation.mutateAsync({ chatId: selectedChatId });
        setDeleteConfirmOpen(false);
        setSelectedChatId(null);
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  return (
    <div
      className={cn(
        "bg-background flex h-screen flex-col border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="border-b p-4">
        <div
          className={cn(
            "mb-3 flex items-center",
            isCollapsed ? "justify-center" : "gap-2",
          )}
        >
          {!isCollapsed && (
            <>
              <div className="from-primary to-primary/80 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br">
                <Moon className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">KuruBot</span>
            </>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn("h-8 w-8 p-0", isCollapsed ? "" : "ml-auto")}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        {!isCollapsed && (
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        )}
        {isCollapsed && (
          <Button
            onClick={onNewChat}
            className="w-full justify-center"
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MessageSquare className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No chats yet</p>
              <p className="text-muted-foreground text-xs">
                Start a new conversation
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={cn(
                  "hover:bg-muted/50 block rounded-lg text-sm transition-colors",
                  currentChatId === chat.id && "bg-muted",
                  isCollapsed ? "p-2" : "p-3",
                )}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
                title={isCollapsed ? chat.title : undefined}
              >
                {isCollapsed ? (
                  <div className="flex justify-center">
                    <MessageSquare className="text-muted-foreground h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <h4 className="truncate leading-tight font-medium">
                        {chat.title}
                      </h4>
                      {chat.previewMessage && (
                        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                          {chat.previewMessage}
                        </p>
                      )}
                      <div className="text-muted-foreground flex items-center gap-3 text-xs">
                        <span>{formatTime(chat.updatedAt)}</span>
                      </div>
                    </div>
                    {hoveredChat === chat.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        onClick={(e) => handleDeleteChatClick(chat.id, e)}
                        disabled={deleteChatMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-2 border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full",
            isCollapsed ? "justify-center" : "justify-start gap-2",
          )}
          asChild
          title={isCollapsed ? "Home" : undefined}
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            {!isCollapsed && "Home"}
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full",
            isCollapsed ? "justify-center" : "justify-start gap-2",
          )}
          asChild
          title={isCollapsed ? "Admin Panel" : undefined}
        >
          <Link href="/admin">
            <Settings className="h-4 w-4" />
            {!isCollapsed && "Admin Panel"}
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-muted-foreground w-full",
            isCollapsed ? "justify-center" : "justify-start gap-2",
          )}
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && "Sign out"}
        </Button>
      </div>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedChatId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteChat}
              disabled={deleteChatMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
