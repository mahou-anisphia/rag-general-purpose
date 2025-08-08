import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { create as uploadToS3, getDownloadUrl, deleteFile as deleteFromS3 } from "~/utils/s3";

export const documentsRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileContent: z.string(), // Base64 encoded file content
        contentType: z.string(),
        fileSize: z.number().max(20 * 1024 * 1024), // Max 20 MB
      })
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
          error instanceof Error ? error.message : "Failed to upload file"
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
      status: doc.status.toLowerCase() as "pending" | "processing" | "indexed" | "error",
    }));
  }),

  getPreviewUrl: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get document and verify ownership
      const document = await ctx.db.document.findFirst({
        where: {
          id: input.documentId,
          uploadedById: ctx.session.user.id,
        },
      });

      if (!document) {
        throw new Error("Document not found or access denied");
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
        // Get document and verify ownership
        const document = await ctx.db.document.findFirst({
          where: {
            id: input.documentId,
            uploadedById: ctx.session.user.id,
          },
        });

        if (!document) {
          throw new Error("Document not found or access denied");
        }

        // Delete from MinIO/S3 first
        await deleteFromS3(document.fileKey);

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
          error instanceof Error ? error.message : "Failed to delete document"
        );
      }
    }),
});

// Helper functions
function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
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
