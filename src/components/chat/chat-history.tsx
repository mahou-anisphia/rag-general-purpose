"use client";

import { useEffect, useRef } from "react";
import { ChatMessageComponent, type ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  showInputInCenter?: boolean;
  onSendMessage?: (message: string) => void;
}

export function ChatHistory({
  messages,
  isLoading = false,
  showInputInCenter = false,
  onSendMessage,
}: ChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center p-8">
          <div className="w-full max-w-3xl space-y-8 text-center">
            <div className="space-y-6">
              <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <svg
                  className="text-muted-foreground h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  How can I help you today?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ask KuruBot questions about your uploaded documents or start a
                  conversation about anything.
                </p>
              </div>
            </div>
            {showInputInCenter && onSendMessage && (
              <div className="w-full px-6">
                <ChatInput
                  onSendMessage={onSendMessage}
                  placeholder="Message KuruBot..."
                  variant="centered"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {messages.map((message) => (
            <ChatMessageComponent key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="group relative px-6 py-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                    <svg
                      className="h-4 w-4 animate-spin text-orange-700 dark:text-orange-300"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex gap-1 pt-2">
                    <div className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full" />
                    <div className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:0.1s]" />
                    <div className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

