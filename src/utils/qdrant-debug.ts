import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";

const qdrant = new QdrantClient({
  url: env.QDRANT_URL,
});

export async function debugQdrantConnection() {
  try {
    console.log("🔍 Qdrant Debug Information");
    console.log("URL:", env.QDRANT_URL);
    console.log("Collection:", env.QDRANT_COLLECTION);
    console.log("Model:", env.OPENAI_EMBEDDING_MODEL);

    // Test connection
    console.log("\n📡 Testing connection...");
    const collections = await qdrant.getCollections();
    console.log("✅ Connection successful");
    console.log(
      "Available collections:",
      collections.collections.map((c) => c.name),
    );

    // Check if our collection exists
    const collectionExists = collections.collections.some(
      (col) => col.name === env.QDRANT_COLLECTION,
    );

    if (collectionExists) {
      console.log(`✅ Collection '${env.QDRANT_COLLECTION}' exists`);

      // Get collection info
      const collectionInfo = await qdrant.getCollection(env.QDRANT_COLLECTION);
      console.log("Collection info:", JSON.stringify(collectionInfo, null, 2));
    } else {
      console.log(`❌ Collection '${env.QDRANT_COLLECTION}' does not exist`);
    }

    return { success: true, collectionExists };
  } catch (error) {
    console.error("❌ Qdrant debug failed:", error);
    return { success: false, error };
  }
}

export async function createCollectionManually() {
  try {
    console.log("🔧 Creating collection manually...");

    await qdrant.createCollection(env.QDRANT_COLLECTION, {
      vectors: {
        [env.OPENAI_EMBEDDING_MODEL]: {
          size: 3072, // text-embedding-3-large
          distance: "Cosine",
        },
      },
    });

    console.log("✅ Collection created successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to create collection:", error);
    return { success: false, error };
  }
}

export async function testVectorInsert() {
  try {
    console.log("🧪 Testing vector insert...");

    // Test data
    const testVector = new Array(3072).fill(0.1);
    const testId = uuidv4(); // Use UUID for point ID
    const testUuid = uuidv4();
    const testPoint = {
      id: testId,
      vector: {
        [env.OPENAI_EMBEDDING_MODEL]: testVector,
      },
      payload: {
        // Required fields matching Qdrant schema
        chunk_id: testUuid, // Use proper UUID
        category: "test_chunk",
        created_at: new Date().toISOString(),
        filename: "test_document",
        // Our additional fields
        doc_id: "test_doc",
        chunk_idx: 0,
        text_content: "test content",
        start_idx: 0,
        end_idx: 12,
      },
    };

    await qdrant.upsert(env.QDRANT_COLLECTION, {
      wait: true,
      points: [testPoint],
    });

    console.log("✅ Test vector inserted successfully");

    // Clean up test point
    await qdrant.delete(env.QDRANT_COLLECTION, {
      wait: true,
      points: [testId],
    });

    console.log("✅ Test vector cleaned up");
    return { success: true };
  } catch (error) {
    console.error("❌ Vector insert test failed:", error);

    // Log detailed error information
    if (error && typeof error === "object" && "data" in error) {
      console.error(
        "Detailed error data:",
        JSON.stringify(error.data, null, 2),
      );
    }

    return { success: false, error };
  }
}
