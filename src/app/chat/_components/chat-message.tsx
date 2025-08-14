"use client";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Moon, User } from "lucide-react";
import { cn } from "~/lib/utils";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  sources?: Array<{
    title: string;
    snippet: string;
    page?: number;
    score?: number;
    documentId?: string;
  }>;
}

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className="group relative px-6 py-4">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className={cn(
                "text-xs font-medium",
                isUser
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
              )}
            >
              {isUser ? (
                <User className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-3">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>

          {/* Sources for assistant messages */}
          {!isUser && message.sources && message.sources.length > 0 && (
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
                      <Badge variant="secondary" className="h-4 text-xs">
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
  );
}
