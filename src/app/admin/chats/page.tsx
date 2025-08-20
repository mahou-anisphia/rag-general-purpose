"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ChatHistory } from "~/components/chat";
import { Eye, Trash2, MessageSquare, Calendar, User } from "lucide-react";
// Helper function to format dates
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Interface removed as it's not used - the API response types are inferred from tRPC

export default function AdminChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  // Get all chats for admin view
  const {
    data: chats = [],
    isLoading,
    refetch,
  } = api.chat.adminListAll.useQuery();

  // Get specific chat data for dialog
  const { data: selectedChat } = api.chat.adminGetChat.useQuery(
    { chatId: selectedChatId! },
    {
      enabled: !!selectedChatId,
      retry: false,
    },
  );

  // Delete chat mutation
  const deleteChatMutation = api.chat.adminDeleteChat.useMutation({
    onSuccess: () => {
      void refetch();
      setDeleteConfirmOpen(false);
      setChatToDelete(null);
    },
  });

  const handleViewChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setDialogOpen(true);
  };

  const handleDeleteChat = (chatId: string) => {
    setChatToDelete(chatId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (chatToDelete) {
      await deleteChatMutation.mutateAsync({ chatId: chatToDelete });
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return formatDate(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Chat Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all user conversations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{chats.length} Total Chats</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
        </div>
      ) : chats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MessageSquare className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Chats Found</h3>
            <p className="text-muted-foreground text-center">
              There are no chat conversations in the system yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Chat Conversations</CardTitle>
            <CardDescription>
              All user chat conversations with KuruBot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chat Title</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chats.map((chat) => (
                  <TableRow key={chat.id}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-medium">{chat.title}</div>
                        {chat.previewMessage && (
                          <div className="text-muted-foreground line-clamp-1 text-sm">
                            {chat.previewMessage.slice(0, 100)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground h-4 w-4" />
                        <div className="space-y-1">
                          <div className="font-medium">
                            {chat.user.name ?? "Unknown"}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {chat.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {chat.messageCount} messages
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        {formatTime(chat.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(chat.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewChat(chat.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChat(chat.id)}
                          disabled={deleteChatMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Chat View Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="h-[90vh] w-[95vw] max-w-[1600px] min-w-[70vw] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              <span className="break-words">
                {selectedChat?.title ?? "Chat Conversation"}
              </span>
            </DialogTitle>
            {selectedChat && (
              <div className="text-muted-foreground mt-2 flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">
                    {selectedChat.user.name ?? "Unknown User"} (
                    {selectedChat.user.email})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Created {formatDateTime(selectedChat.createdAt)}</span>
                </div>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-8 pb-8">
            {selectedChat ? (
              <div className="h-full rounded-lg border">
                <div className="h-full overflow-y-auto p-4">
                  {selectedChat.messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-8">
                      <div className="w-full max-w-3xl space-y-8 text-center">
                        <div className="space-y-6">
                          <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <MessageSquare className="text-muted-foreground h-6 w-6" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">
                              No messages yet
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              This chat conversation is empty.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedChat.messages.map((message) => (
                        <div
                          key={message.id}
                          className="group relative px-4 py-6"
                        >
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                  message.role === "user"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                }`}
                              >
                                {message.role === "user" ? (
                                  <User className="h-4 w-4" />
                                ) : (
                                  <MessageSquare className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              </div>
                              {/* Sources for assistant messages */}
                              {message.role !== "user" &&
                                message.sources &&
                                message.sources.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-muted-foreground text-xs font-medium">
                                      Sources:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {message.sources.map((source, index) => (
                                        <div
                                          key={index}
                                          className="bg-muted/50 rounded-md border px-2 py-1 text-xs"
                                        >
                                          <div className="flex items-center gap-1">
                                            <Badge
                                              variant="secondary"
                                              className="h-4 text-xs"
                                            >
                                              {source.title}
                                            </Badge>
                                            {source.page && (
                                              <span className="text-muted-foreground">
                                                p. {source.page}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-muted-foreground mt-1 line-clamp-2">
                                            {source.snippet}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete this chat conversation? This
              action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteChatMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
