import OpenAI from "openai";
import { env } from "~/env";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  totalTokens: number;
  model: string;
}

/**
 * Generate embedding for a single text using OpenAI's embedding model
 */
export async function generateEmbedding(
  text: string,
): Promise<EmbeddingResult> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text content is empty or invalid");
  }

  try {
    const response = await openai.embeddings.create({
      model: env.OPENAI_EMBEDDING_MODEL,
      input: text,
      encoding_format: "float",
    });

    const embeddingData = response.data[0];
    if (!embeddingData) {
      throw new Error("No embedding data received from OpenAI");
    }

    return {
      embedding: embeddingData.embedding,
      tokenCount: response.usage.total_tokens,
    };
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(
      `Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * OpenAI allows up to 2048 inputs per request
 */
export async function generateBatchEmbeddings(
  texts: string[],
  batchSize = 100, // Conservative batch size to avoid token limits
): Promise<BatchEmbeddingResult> {
  if (!texts || texts.length === 0) {
    throw new Error("No texts provided for embedding generation");
  }

  // Filter out empty texts
  const validTexts = texts.filter((text) => text && text.trim().length > 0);
  if (validTexts.length === 0) {
    throw new Error("No valid texts found for embedding generation");
  }

  try {
    const allEmbeddings: number[][] = [];
    let totalTokens = 0;

    // Process in batches to handle API limits
    for (let i = 0; i < validTexts.length; i += batchSize) {
      const batch = validTexts.slice(i, i + batchSize);

      const response = await openai.embeddings.create({
        model: env.OPENAI_EMBEDDING_MODEL,
        input: batch,
        encoding_format: "float",
      });

      // Extract embeddings and add to results
      const batchEmbeddings = response.data.map((item) => item.embedding);
      allEmbeddings.push(...batchEmbeddings);
      totalTokens += response.usage.total_tokens;

      // Add small delay between batches to avoid rate limiting
      if (i + batchSize < validTexts.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return {
      embeddings: allEmbeddings,
      totalTokens,
      model: env.OPENAI_EMBEDDING_MODEL,
    };
  } catch (error) {
    console.error("Error generating batch embeddings:", error);
    throw new Error(
      `Failed to generate batch embeddings: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Calculate embedding cost based on token usage
 * Pricing as of 2024 for text-embedding-3-large: $0.00013 per 1K tokens
 */
export function calculateEmbeddingCost(
  tokenCount: number,
  model: string = env.OPENAI_EMBEDDING_MODEL,
): number {
  // Pricing per 1K tokens (update these as needed)
  const pricingMap: Record<string, number> = {
    "text-embedding-3-large": 0.00013,
    "text-embedding-3-small": 0.00002,
    "text-embedding-ada-002": 0.0001,
  };

  const pricePerThousand = pricingMap[model] ?? 0.00013; // Default to 3-large pricing
  return (tokenCount / 1000) * pricePerThousand;
}

/**
 * Get embedding model dimensions for vector database configuration
 */
export function getEmbeddingDimensions(
  model: string = env.OPENAI_EMBEDDING_MODEL,
): number {
  const dimensionsMap: Record<string, number> = {
    "text-embedding-3-large": 3072,
    "text-embedding-3-small": 1536,
    "text-embedding-ada-002": 1536,
  };

  return dimensionsMap[model] ?? 3072; // Default to 3-large dimensions
}
