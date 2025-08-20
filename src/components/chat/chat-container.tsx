"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatHistory } from "./chat-history";
import { ChatInput } from "./chat-input";
import { type ChatMessage } from "./chat-message";
import { api } from "~/trpc/react";

// Helper function to transform tRPC response to ChatMessage
function transformTooChatMessage(msg: {
  id: string;
  content: string;
  role: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    snippet: string;
    page?: number | null;
    score?: number | null;
    documentId?: string | null;
  }>;
}): ChatMessage {
  return {
    id: msg.id,
    content: msg.content,
    role: msg.role as "user" | "assistant" | "system",
    timestamp: msg.timestamp,
    sources: msg.sources?.map((source) => ({
      title: source.title,
      snippet: source.snippet,
      page: source.page ?? undefined,
      score: source.score ?? undefined,
      documentId: source.documentId ?? undefined,
    })),
  };
}

interface ChatContainerProps {
  chatId?: string;
  initialMessages?: ChatMessage[];
  isLoading?: boolean;
}

export function ChatContainer({
  chatId,
  initialMessages = [],
  isLoading = false,
}: ChatContainerProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    chatId ?? null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // tRPC mutations
  const createChatMutation = api.chat.create.useMutation();
  const sendMessageMutation = api.chat.sendMessage.useMutation();

  // Load chat data if chatId is provided
  const shouldFetchChat = Boolean(
    currentChatId &&
      currentChatId.length > 0 &&
      currentChatId !== "undefined" &&
      currentChatId !== "null",
  );

  const { data: chatData, isLoading: chatLoading } = api.chat.getChat.useQuery(
    { chatId: currentChatId! },
    {
      enabled: shouldFetchChat,
      retry: false,
    },
  );

  // Update messages when chat data loads
  useEffect(() => {
    if (chatData?.messages) {
      const transformedMessages = chatData.messages.map(
        transformTooChatMessage,
      );
      setMessages(transformedMessages);
    }
  }, [chatData]);

  const handleSendMessage = async (content: string) => {
    try {
      setIsProcessing(true);

      let targetChatId = currentChatId;

      // Create new chat if none exists
      if (!targetChatId) {
        const newChat = await createChatMutation.mutateAsync({});
        targetChatId = newChat.id;
        setCurrentChatId(targetChatId);
        // Navigate to the new chat
        router.push(`/chat/${targetChatId}`);
      }

      // Send message and get response
      const result = await sendMessageMutation.mutateAsync({
        chatId: targetChatId,
        message: content,
        useRetrieval: true, // Re-enable retrieval for RAG functionality
        maxSources: 5,
        scoreThreshold: 0.3, // Lower threshold for better retrieval
      });

      // Add both user and assistant messages to local state
      const newUserMessage = transformTooChatMessage(result.userMessage);
      const newAssistantMessage = transformTooChatMessage(
        result.assistantMessage,
      );

      setMessages((prev) => [...prev, newUserMessage, newAssistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  };

  const hasMessages = messages.length > 0;
  const isLoadingData = chatLoading ?? isLoading;

  // Show loading state while fetching chat data
  if (currentChatId && chatLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ChatHistory
        messages={messages}
        isLoading={isProcessing}
        showInputInCenter={!hasMessages}
        onSendMessage={hasMessages ? undefined : handleSendMessage}
      />
      {hasMessages && (
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isProcessing || isLoadingData}
          disabled={isLoadingData}
        />
      )}
    </div>
  );
}
