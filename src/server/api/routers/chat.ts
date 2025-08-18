import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generateEmbedding } from "~/utils/embeddings";
import { searchSimilarChunks } from "~/utils/vector-store";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "~/env";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export const chatRouter = createTRPCRouter({
  // Create a new chat
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
        },
      });

      return {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
      };
    }),

  // Get chat history for a specific chat
  getChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.chatId,
          userId: ctx.session.user.id,
        },
        include: {
          messages: {
            include: {
              sources: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      return {
        id: chat.id,
        title: chat.title,
        messages: chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          role: message.role.toLowerCase() as "user" | "assistant" | "system",
          timestamp: message.createdAt,
          sources: message.sources.map((source) => ({
            title: source.title,
            snippet: source.snippet,
            page: source.page,
            score: source.score,
            documentId: source.documentId,
          })),
        })),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    }),

  // List all chats for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const chats = await ctx.db.chat.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        messages: {
          take: 1, // Just get the first message to show preview
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chats.map((chat) => ({
      id: chat.id,
      title:
        chat.title ??
        (chat.messages[0]?.content
          ? chat.messages[0].content.slice(0, 50) + "..."
          : null) ??
        "New Chat",
      updatedAt: chat.updatedAt,
      previewMessage: chat.messages[0]?.content,
    }));
  }),

  // Delete a chat
  delete: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.chatId,
          userId: ctx.session.user.id,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      await ctx.db.chat.delete({
        where: {
          id: input.chatId,
        },
      });

      return { success: true };
    }),

  // Send a message and get RAG response
  sendMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        message: z.string().min(1).max(4000),
        useRetrieval: z.boolean().default(true),
        maxSources: z.number().min(1).max(10).default(5),
        scoreThreshold: z.number().min(0).max(1).default(0.7),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify chat belongs to user
        const chat = await ctx.db.chat.findFirst({
          where: {
            id: input.chatId,
            userId: ctx.session.user.id,
          },
        });

        if (!chat) {
          throw new Error("Chat not found");
        }

        // Save user message first
        const userMessage = await ctx.db.message.create({
          data: {
            content: input.message,
            role: "USER",
            chatId: input.chatId,
          },
        });

        let contextChunks: Array<{
          payload: {
            filename?: string;
            text_content?: string;
            doc_id?: string;
          };
          score: number;
        }> = [];
        let sources: Array<{
          title: string;
          snippet: string;
          page?: number;
          score: number;
          documentId?: string;
        }> = [];

        // Perform retrieval if enabled - make this completely optional
        if (input.useRetrieval) {
          try {
            // Generate embedding for the user's question
            const embeddingResult = await generateEmbedding(input.message);

            // Search for similar chunks in the vector database
            const searchResults = await searchSimilarChunks(
              embeddingResult.embedding,
              input.maxSources,
              input.scoreThreshold,
            );

            if (searchResults && searchResults.length > 0) {
              contextChunks = searchResults;
              sources = searchResults.map((result, index) => ({
                title: result.payload.filename || `Document ${index + 1}`,
                snippet:
                  result.payload.text_content?.slice(0, 200) + "..." || "",
                page: undefined, // Could add page info if available in payload
                score: result.score,
                documentId: result.payload.doc_id,
              }));
            }
          } catch (retrievalError) {
            console.warn(
              "Retrieval failed, continuing without context:",
              retrievalError,
            );
            // Continue without retrieval context - this is fine
          }
        }

        // Prepare context for the LLM
        const contextText =
          contextChunks.length > 0
            ? contextChunks
                .map(
                  (chunk) =>
                    `[Document: ${chunk.payload.filename ?? "Unknown"}]\n${chunk.payload.text_content ?? ""}`,
                )
                .join("\n\n---\n\n")
            : "";

        // Build the system prompt
        const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided document context. 

${
  contextText
    ? `Use the following context to answer the user's question. If the context doesn't contain relevant information, let the user know that you don't have enough information in the provided documents to answer their question.

CONTEXT:
${contextText}

`
    : "You don't have access to any specific document context for this question. Provide a helpful general response."
}

Guidelines:
- Be accurate and cite the source documents when possible
- If you're unsure or the context doesn't contain the answer, say so
- Provide comprehensive answers when the context supports it
- Be conversational and helpful`;

        // Get recent chat history for context
        const recentMessages = await ctx.db.message.findMany({
          where: {
            chatId: input.chatId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Get last 10 messages for context
        });

        // Build conversation history (reverse to get chronological order)
        const conversationHistory = recentMessages
          .reverse()
          .slice(0, -1) // Remove the message we just added
          .map((msg) => ({
            role: msg.role.toLowerCase() as "user" | "assistant",
            content: msg.content,
          }));

        // Generate response using Anthropic

        if (!env.ANTHROPIC_API_KEY) {
          throw new Error("Anthropic API key not configured");
        }

        if (!env.ANTHROPIC_CLAUDE_MODEL) {
          throw new Error("Anthropic model not configured");
        }

        const response = await anthropic.messages.create({
          model: env.ANTHROPIC_CLAUDE_MODEL,
          max_tokens: 4000,
          temperature: 0.7,
          system: systemPrompt,
          messages: [
            ...conversationHistory,
            {
              role: "user",
              content: input.message,
            },
          ],
        });

        const assistantContent = response.content[0];
        if (assistantContent?.type !== "text") {
          throw new Error("Unexpected response format from Anthropic");
        }

        // Save assistant message
        const assistantMessage = await ctx.db.message.create({
          data: {
            content: assistantContent.text,
            role: "ASSISTANT",
            chatId: input.chatId,
            sources: {
              create: sources,
            },
          },
          include: {
            sources: true,
          },
        });

        // Update chat title if it's the first message and no title exists
        if (!chat.title && conversationHistory.length === 0) {
          const title =
            input.message.slice(0, 50) +
            (input.message.length > 50 ? "..." : "");
          await ctx.db.chat.update({
            where: { id: input.chatId },
            data: { title },
          });
        }

        // Update chat's updatedAt timestamp
        await ctx.db.chat.update({
          where: { id: input.chatId },
          data: { updatedAt: new Date() },
        });

        return {
          userMessage: {
            id: userMessage.id,
            content: userMessage.content,
            role: "user" as const,
            timestamp: userMessage.createdAt,
            sources: [],
          },
          assistantMessage: {
            id: assistantMessage.id,
            content: assistantMessage.content,
            role: "assistant" as const,
            timestamp: assistantMessage.createdAt,
            sources: assistantMessage.sources.map((source) => ({
              title: source.title,
              snippet: source.snippet,
              page: source.page,
              score: source.score,
              documentId: source.documentId,
            })),
          },
          totalSources: sources.length,
          retrievalUsed: input.useRetrieval && contextChunks.length > 0,
        };
      } catch (error) {
        console.error("Error in sendMessage:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to send message",
        );
      }
    }),

  // Get chat statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalChats = await ctx.db.chat.count({
      where: { userId: ctx.session.user.id },
    });

    const totalMessages = await ctx.db.message.count({
      where: {
        chat: {
          userId: ctx.session.user.id,
        },
      },
    });

    const assistantMessages = await ctx.db.message.count({
      where: {
        role: "ASSISTANT",
        chat: {
          userId: ctx.session.user.id,
        },
      },
    });

    const userQueries = await ctx.db.message.count({
      where: {
        role: "USER",
        chat: {
          userId: ctx.session.user.id,
        },
      },
    });

    return {
      totalChats,
      totalMessages,
      assistantMessages,
      userQueries,
      averageMessagesPerChat:
        totalChats > 0 ? Math.round(totalMessages / totalChats) : 0,
    };
  }),
});
