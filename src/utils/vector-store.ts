import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";
import type { TextChunk } from "./chunking";
import type { BatchEmbeddingResult } from "./embeddings";

// Initialize Qdrant client
const qdrant = new QdrantClient({
  url: env.QDRANT_URL,
});

export interface VectorPoint {
  id: string;
  vector: number[];
  payload: {
    // Required fields matching Qdrant schema
    chunk_id: string;
    category: string;
    created_at: string;
    filename: string;
    // Our additional fields (using different names to avoid conflicts)
    doc_id?: string;
    chunk_idx?: number;
    text_content?: string;
    start_idx?: number;
    end_idx?: number;
  };
}

export interface VectorSearchResult {
  id: string;
  score: number;
  payload: VectorPoint["payload"];
}

export interface IndexingResult {
  success: boolean;
  pointsIndexed: number;
  collectionName: string;
  message: string;
}

/**
 * Ensure the Qdrant collection exists with proper configuration
 */
export async function ensureCollection(): Promise<void> {
  try {
    const collections = await qdrant.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === env.QDRANT_COLLECTION,
    );

    if (!collectionExists) {
      await qdrant.createCollection(env.QDRANT_COLLECTION, {
        vectors: {
          [env.OPENAI_EMBEDDING_MODEL]: {
            size: 3072, // text-embedding-3-large dimensions
            distance: "Cosine",
            hnsw_config: {
              m: 24,
              ef_construct: 256,
              payload_m: 24,
            },
            on_disk: false,
            datatype: "float32",
          },
        },
        shard_number: 1,
        replication_factor: 1,
        write_consistency_factor: 1,
        on_disk_payload: true,
        sparse_vectors: {
          "text-sparse-vector": {
            index: {
              on_disk: true,
              datatype: "float32",
            },
          },
        },
        // Additional configuration can be added here if needed
      });
    }
  } catch (error) {
    console.error("Error ensuring collection:", error);
    throw new Error(
      `Failed to ensure collection: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Index document chunks as vectors in Qdrant
 */
export async function indexDocumentChunks(
  documentId: string,
  chunks: TextChunk[],
  embeddings: BatchEmbeddingResult,
): Promise<IndexingResult> {
  if (chunks.length !== embeddings.embeddings.length) {
    throw new Error("Number of chunks and embeddings must match");
  }

  try {
    await ensureCollection();

    const points: VectorPoint[] = chunks.map((chunk, index) => ({
      id: uuidv4(), // Use UUID for point ID
      vector: embeddings.embeddings[index]!,
      payload: {
        // Required fields matching Qdrant schema
        chunk_id: uuidv4(), // Generate proper UUID
        category: "document_chunk",
        created_at: new Date().toISOString(),
        filename: `document_${documentId}`,
        // Our additional fields
        doc_id: documentId,
        chunk_idx: chunk.metadata.chunkIndex,
        text_content: chunk.content,
        start_idx: chunk.metadata.startIndex,
        end_idx: chunk.metadata.endIndex,
      },
    }));

    // Upsert points in batches to handle large documents
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await qdrant.upsert(env.QDRANT_COLLECTION, {
        wait: true,
        points: batch.map((point) => ({
          id: point.id,
          vector: {
            [env.OPENAI_EMBEDDING_MODEL]: point.vector,
          },
          payload: point.payload,
        })),
      });
    }

    return {
      success: true,
      pointsIndexed: points.length,
      collectionName: env.QDRANT_COLLECTION,
      message: `Successfully indexed ${points.length} chunks for document ${documentId}`,
    };
  } catch (error) {
    console.error("Error indexing document chunks:", error);
    throw new Error(
      `Failed to index document chunks: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Search for similar vectors in Qdrant
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit = 10,
  scoreThreshold = 0.7,
  documentId?: string,
): Promise<VectorSearchResult[]> {
  try {
    const filter = documentId
      ? {
          must: [
            {
              key: "doc_id",
              match: {
                value: documentId,
              },
            },
          ],
        }
      : undefined;

    const searchResult = await qdrant.search(env.QDRANT_COLLECTION, {
      vector: {
        name: env.OPENAI_EMBEDDING_MODEL,
        vector: queryEmbedding,
      },
      filter,
      limit,
      score_threshold: scoreThreshold,
      with_payload: true,
    });

    return searchResult.map((result) => ({
      id: result.id as string,
      score: result.score,
      payload: result.payload as VectorPoint["payload"],
    }));
  } catch (error) {
    console.error("Error searching similar chunks:", error);
    throw new Error(
      `Failed to search similar chunks: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Delete all vectors for a specific document
 */
export async function deleteDocumentVectors(documentId: string): Promise<void> {
  try {
    await qdrant.delete(env.QDRANT_COLLECTION, {
      wait: true,
      filter: {
        must: [
          {
            key: "doc_id",
            match: {
              value: documentId,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error deleting document vectors:", error);
    throw new Error(
      `Failed to delete document vectors: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get collection info and statistics
 */
export async function getCollectionInfo(): Promise<{
  pointsCount: number;
  indexedVectorsCount: number;
  status: string;
}> {
  try {
    const info = await qdrant.getCollection(env.QDRANT_COLLECTION);
    return {
      pointsCount: info.points_count ?? 0,
      indexedVectorsCount: info.indexed_vectors_count ?? 0,
      status: info.status,
    };
  } catch (error) {
    console.error("Error getting collection info:", error);
    throw new Error(
      `Failed to get collection info: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Health check for Qdrant connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await qdrant.getCollections();
    return true;
  } catch (error) {
    console.error("Qdrant health check failed:", error);
    return false;
  }
}
