import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  create as uploadToS3,
  getDownloadUrl,
  deleteFile as deleteFromS3,
  getFileContent,
} from "~/utils/s3";
import { chunkText, getChunkingStats } from "~/utils/chunking";
import {
  generateBatchEmbeddings,
  calculateEmbeddingCost,
} from "~/utils/embeddings";
import {
  indexDocumentChunks,
  deleteDocumentVectors,
} from "~/utils/vector-store";
import {
  debugQdrantConnection,
  createCollectionManually,
  testVectorInsert,
} from "~/utils/qdrant-debug";

export const documentsRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileContent: z.string(), // Base64 encoded file content
        contentType: z.string(),
        fileSize: z.number().max(20 * 1024 * 1024), // Max 20 MB
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert base64 to buffer
        const fileBuffer = Buffer.from(input.fileContent, "base64");

        // Validate file size
        if (fileBuffer.length > 20 * 1024 * 1024) {
          throw new Error("File size exceeds 20 MB limit");
        }

        // Generate unique file key with timestamp and user ID
        const timestamp = Date.now();
        const userId = ctx.session.user.id;
        const fileKey = `documents/${userId}/${timestamp}-${input.fileName}`;

        // Upload to MinIO/S3
        const uploadResult = await uploadToS3({
          file: fileBuffer,
          key: fileKey,
          contentType: input.contentType,
          metadata: {
            uploadedBy: userId,
            originalName: input.fileName,
            uploadedAt: new Date().toISOString(),
          },
        });

        // Save document metadata to database
        const document = await ctx.db.document.create({
          data: {
            name: input.fileName,
            fileName: input.fileName,
            fileKey: uploadResult.key,
            contentType: input.contentType,
            fileSize: input.fileSize,
            status: "PENDING", // All uploads start as PENDING
            source: "MANUAL_UPLOAD",
            uploadedById: userId,
          },
        });

        return {
          success: true,
          documentId: document.id,
          fileKey: uploadResult.key,
          etag: uploadResult.etag,
          message: "File uploaded successfully",
        };
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to upload file",
        );
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const documents = await ctx.db.document.findMany({
      where: {
        uploadedById: ctx.session.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      fileName: doc.fileName,
      fileKey: doc.fileKey,
      uploader: doc.uploadedBy.email ?? doc.uploadedBy.name ?? "Unknown",
      uploadedAt: doc.createdAt.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      size: formatFileSize(doc.fileSize),
      contentType: doc.contentType,
      source: formatSource(doc.source),
      status: doc.status.toLowerCase() as
        | "pending"
        | "processing"
        | "indexed"
        | "error",
    }));
  }),

  listAll: protectedProcedure.query(async ({ ctx }) => {
    // For admin use - lists all documents from all users
    const documents = await ctx.db.document.findMany({
      include: {
        uploadedBy: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      fileName: doc.fileName,
      fileKey: doc.fileKey,
      uploader: doc.uploadedBy.email ?? doc.uploadedBy.name ?? "Unknown",
      uploadedAt: doc.createdAt.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      size: formatFileSize(doc.fileSize),
      contentType: doc.contentType,
      source: formatSource(doc.source),
      status: doc.status.toLowerCase() as
        | "pending"
        | "processing"
        | "indexed"
        | "error",
      hasRawText: !!doc.rawText,
    }));
  }),

  getPreviewUrl: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get document - admin can preview any document, regular users only their own
      const document = await ctx.db.document.findFirst({
        where: {
          id: input.documentId,
          // For admin users, don't restrict by ownership
          // For regular users, restrict to their own documents
          // Note: You might want to add proper role checking here
        },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      // Check if the file type supports preview
      const previewableTypes = [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/csv",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!previewableTypes.includes(document.contentType)) {
        throw new Error("Preview not available for this file type");
      }

      // Generate presigned URL for download (valid for 5 minutes)
      const previewUrl = await getDownloadUrl(document.fileKey, 300);

      return {
        url: previewUrl,
        contentType: document.contentType,
        fileName: document.fileName,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get document - admin can delete any document, regular users only their own
        const document = await ctx.db.document.findFirst({
          where: {
            id: input.documentId,
            // For admin users, don't restrict by ownership
            // For regular users, restrict to their own documents
            // Note: You might want to add proper role checking here
          },
        });

        if (!document) {
          throw new Error("Document not found");
        }

        // Delete from MinIO/S3 first
        await deleteFromS3(document.fileKey);

        // Delete vectors from Qdrant if document was indexed
        if (document.status === "INDEXED") {
          try {
            await deleteDocumentVectors(input.documentId);
          } catch (vectorError) {
            console.warn("Failed to delete vectors for document:", vectorError);
            // Continue with deletion even if vector cleanup fails
          }
        }

        // Delete from database
        await ctx.db.document.delete({
          where: {
            id: input.documentId,
          },
        });

        return {
          success: true,
          message: "Document deleted successfully",
        };
      } catch (error) {
        console.error("Delete error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to delete document",
        );
      }
    }),

  processPdf: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get document from database and verify it exists
        const document = await ctx.db.document.findUnique({
          where: {
            id: input.documentId,
          },
        });

        if (!document) {
          throw new Error("Document not found");
        }

        // Check if document is PDF
        if (document.contentType !== "application/pdf") {
          throw new Error("Only PDF documents can be processed");
        }

        // Check if already processed
        if (document.rawText) {
          throw new Error("Document has already been processed");
        }

        // Update status to processing
        await ctx.db.document.update({
          where: {
            id: input.documentId,
          },
          data: {
            status: "PROCESSING",
          },
        });

        try {
          // Fetch PDF file from MinIO
          const fileBuffer = await getFileContent(document.fileKey);

          // Import pdf-parse with debugging disabled
          const pdf = (await import("pdf-parse-debugging-disabled")).default;

          // Extract text from PDF
          const pdfData = await pdf(fileBuffer);
          const extractedText: string = pdfData.text;

          if (!extractedText || extractedText.trim().length === 0) {
            throw new Error("No text content found in PDF");
          }

          // Update document with extracted text and processing status
          await ctx.db.document.update({
            where: {
              id: input.documentId,
            },
            data: {
              rawText: extractedText,
              status: "PROCESSING",
            },
          });

          return {
            success: true,
            message: "PDF text extracted successfully - ready for indexing",
            textLength: extractedText.length,
          };
        } catch (processingError) {
          // Update status to error if processing failed
          await ctx.db.document.update({
            where: {
              id: input.documentId,
            },
            data: {
              status: "ERROR",
            },
          });

          throw processingError;
        }
      } catch (error) {
        console.error("PDF processing error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to process PDF",
        );
      }
    }),

  processForIndexing: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get document from database and verify it exists
        const document = await ctx.db.document.findUnique({
          where: {
            id: input.documentId,
          },
        });

        if (!document) {
          throw new Error("Document not found");
        }

        // Check if document has raw text
        if (!document.rawText || document.rawText.trim().length === 0) {
          throw new Error(
            "Document has no extracted text. Please process the PDF first.",
          );
        }

        // Check if already indexed
        if (document.status === "INDEXED") {
          throw new Error("Document is already indexed");
        }

        // Update status to processing
        await ctx.db.document.update({
          where: {
            id: input.documentId,
          },
          data: {
            status: "PROCESSING",
          },
        });

        try {
          // Step 1: Chunk the text
          const chunks = await chunkText(document.rawText);
          const chunkStats = getChunkingStats(chunks);

          if (chunks.length === 0) {
            throw new Error("No text chunks were generated");
          }

          // Step 2: Generate embeddings for all chunks
          const chunkTexts = chunks.map((chunk) => chunk.content);
          const embeddingResult = await generateBatchEmbeddings(chunkTexts);

          // Step 3: Index vectors in Qdrant
          const indexingResult = await indexDocumentChunks(
            input.documentId,
            chunks,
            embeddingResult,
          );

          // Step 4: Update document status to indexed
          await ctx.db.document.update({
            where: {
              id: input.documentId,
            },
            data: {
              status: "INDEXED",
            },
          });

          // Calculate costs
          const embeddingCost = calculateEmbeddingCost(
            embeddingResult.totalTokens,
          );

          return {
            success: true,
            message: "Document successfully processed and indexed",
            stats: {
              chunks: chunkStats.totalChunks,
              totalCharacters: chunkStats.totalCharacters,
              averageChunkSize: chunkStats.averageChunkSize,
              pointsIndexed: indexingResult.pointsIndexed,
              tokensUsed: embeddingResult.totalTokens,
              estimatedCost: embeddingCost,
              model: embeddingResult.model,
            },
          };
        } catch (processingError) {
          // Update status to error if processing failed
          await ctx.db.document.update({
            where: {
              id: input.documentId,
            },
            data: {
              status: "ERROR",
            },
          });

          throw processingError;
        }
      } catch (error) {
        console.error("Document indexing error:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to process document for indexing",
        );
      }
    }),

  debugQdrant: protectedProcedure.mutation(async () => {
    try {
      const debug = await debugQdrantConnection();

      if (!debug.success) {
        throw new Error("Qdrant connection failed");
      }

      if (!debug.collectionExists) {
        console.log("Collection doesn't exist, creating...");
        const createResult = await createCollectionManually();
        if (!createResult.success) {
          throw new Error("Failed to create collection");
        }
      }

      // Test vector insert
      const testResult = await testVectorInsert();
      if (!testResult.success) {
        throw new Error("Vector insert test failed");
      }

      return {
        success: true,
        message: "Qdrant debug completed successfully",
        collectionExists: debug.collectionExists,
      };
    } catch (error) {
      console.error("Qdrant debug error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Qdrant debug failed",
      );
    }
  }),
});

// Helper functions
function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function formatSource(source: string): string {
  switch (source) {
    case "MANUAL_UPLOAD":
      return "Manual Upload";
    case "EMAIL_INGEST":
      return "Email Ingest";
    case "API_UPLOAD":
      return "API Upload";
    default:
      return source;
  }
}
