import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export interface ChunkingConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

export interface TextChunk {
  content: string;
  metadata: {
    startIndex: number;
    endIndex: number;
    chunkIndex: number;
  };
}

/**
 * Default chunking configuration using RecursiveCharacterTextSplitter
 * This can be easily modified for different chunking strategies in the future
 */
export const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", " ", ""], // Default separators for recursive splitting
};

/**
 * Abstract chunking function that can be extended for different chunking methods
 * Currently implements RecursiveCharacterTextSplitter from LangChain
 */
export async function chunkText(
  text: string,
  config: ChunkingConfig = DEFAULT_CHUNKING_CONFIG,
): Promise<TextChunk[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text content is empty or invalid");
  }

  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      separators: config.separators,
    });

    const docs = await splitter.createDocuments([text]);

    const chunks: TextChunk[] = [];
    let currentIndex = 0;

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      if (!doc?.pageContent) continue;

      const content = doc.pageContent;
      const startIndex = currentIndex;
      const endIndex = startIndex + content.length;

      chunks.push({
        content,
        metadata: {
          startIndex,
          endIndex,
          chunkIndex: i,
        },
      });

      // Update current index, accounting for overlap
      currentIndex = endIndex - config.chunkOverlap;
    }

    return chunks;
  } catch (error) {
    console.error("Error chunking text:", error);
    throw new Error(
      `Failed to chunk text: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Utility function to get chunking statistics
 */
export function getChunkingStats(chunks: TextChunk[]): {
  totalChunks: number;
  totalCharacters: number;
  averageChunkSize: number;
  minChunkSize: number;
  maxChunkSize: number;
} {
  if (chunks.length === 0) {
    return {
      totalChunks: 0,
      totalCharacters: 0,
      averageChunkSize: 0,
      minChunkSize: 0,
      maxChunkSize: 0,
    };
  }

  const chunkSizes = chunks.map((chunk) => chunk.content.length);
  const totalCharacters = chunkSizes.reduce((sum, size) => sum + size, 0);

  return {
    totalChunks: chunks.length,
    totalCharacters,
    averageChunkSize: Math.round(totalCharacters / chunks.length),
    minChunkSize: Math.min(...chunkSizes),
    maxChunkSize: Math.max(...chunkSizes),
  };
}
