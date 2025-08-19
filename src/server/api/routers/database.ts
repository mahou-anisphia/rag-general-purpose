import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { healthCheck, getCollectionInfo } from "~/utils/vector-store";

export const databaseRouter = createTRPCRouter({
  status: publicProcedure.query(async () => {
    try {
      // Check PostgreSQL/Prisma connection
      const prismaStatus = await checkPrismaConnection();

      // Check Qdrant connection
      const qdrantStatus = await checkQdrantConnection();

      // Get database statistics
      const stats = await getDatabaseStats();

      return {
        prisma: prismaStatus,
        qdrant: qdrantStatus,
        stats,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Database status check failed:", error);
      throw new Error("Failed to check database status");
    }
  }),

  prismaHealth: publicProcedure.query(async () => {
    return checkPrismaConnection();
  }),

  qdrantHealth: publicProcedure.query(async () => {
    return checkQdrantConnection();
  }),
});

async function checkPrismaConnection() {
  try {
    // Simple query to test connection
    await db.$queryRaw`SELECT 1`;

    // Get basic connection info
    const result = await db.$queryRaw<[{ version: string }]>`SELECT version()`;
    const version = result[0]?.version || "Unknown";

    // Get database size
    const sizeResult = await db.$queryRaw<[{ size: string }]>`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;
    const dbSize = sizeResult[0]?.size || "Unknown";

    return {
      status: "connected" as const,
      version: version.split(" ")[0] + " " + version.split(" ")[1], // e.g., "PostgreSQL 15.x"
      databaseSize: dbSize,
      connectionPool: {
        // Note: These would need Prisma metrics extension for real values
        active: "N/A",
        idle: "N/A",
        total: "N/A",
      },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Prisma connection check failed:", error);
    return {
      status: "disconnected" as const,
      error: error instanceof Error ? error.message : "Unknown error",
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkQdrantConnection() {
  try {
    const isHealthy = await healthCheck();

    if (!isHealthy) {
      return {
        status: "disconnected" as const,
        error: "Health check failed",
        lastChecked: new Date().toISOString(),
      };
    }

    const collectionInfo = await getCollectionInfo();

    return {
      status: "connected" as const,
      collectionName: process.env.QDRANT_COLLECTION ?? "documents",
      pointsCount: collectionInfo.pointsCount,
      indexedVectorsCount: collectionInfo.indexedVectorsCount,
      collectionStatus: collectionInfo.status,
      embeddingModel:
        process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-large",
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Qdrant connection check failed:", error);
    return {
      status: "disconnected" as const,
      error: error instanceof Error ? error.message : "Unknown error",
      lastChecked: new Date().toISOString(),
    };
  }
}

async function getDatabaseStats() {
  try {
    const [documentsCount, documentsProcessed, chatCount] = await Promise.all([
      db.document.count(),
      db.document.count({ where: { status: "INDEXED" } }),
      db.chat.count(),
    ]);

    // Get basic table information instead of sizes to avoid complex raw SQL issues
    const tableSizes: Array<{ table_name: string; size: string }> = [
      { table_name: "Documents", size: documentsCount.toString() + " records" },
      { table_name: "Chats", size: chatCount.toString() + " records" },
    ];

    // Try to get actual table sizes if possible, but don't fail if it doesn't work
    try {
      const dbSizeResult = await db.$queryRaw<[{ total_size: string }]>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as total_size
      `;
      if (dbSizeResult[0]?.total_size) {
        tableSizes.unshift({
          table_name: "Total Database",
          size: dbSizeResult[0].total_size,
        });
      }
    } catch (sizeError) {
      console.error("Could not get database size:", sizeError);
    }

    return {
      documents: {
        total: documentsCount,
        processed: documentsProcessed,
        unprocessed: documentsCount - documentsProcessed,
      },
      chats: chatCount,
      tableSizes: tableSizes.map((t) => ({
        name: t.table_name,
        size: t.size,
      })),
    };
  } catch (error) {
    console.error("Failed to get database stats:", error);
    return {
      documents: { total: 0, processed: 0, unprocessed: 0 },
      chats: 0,
      tableSizes: [],
    };
  }
}
