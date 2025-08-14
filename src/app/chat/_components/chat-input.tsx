"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  variant?: "default" | "centered";
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Message KuruBot...",
  variant = "default",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={cn(
        variant === "default" ? "bg-background border-t p-4" : "p-0",
      )}
    >
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              "border-input max-h-32 min-h-[52px] resize-none rounded-lg py-3 pr-12 text-sm",
              "focus-visible:ring-ring focus-visible:ring-1",
              "placeholder:text-muted-foreground/60",
              variant === "centered" &&
                "focus-visible:border-primary border-2 shadow-md",
            )}
            rows={1}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || isLoading || disabled}
            className="absolute top-2 right-2 h-8 w-8 rounded-md p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
