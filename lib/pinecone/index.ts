import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export async function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export async function checkVideoExistsInPinecone(
  videoId: string,
  indexName: string
) {
  try {
    const pinecone = await getPineconeClient();
    const index = pinecone.index(indexName);

    // We'll use a fetch method with a filter to check if the videoId exists
    const queryResult = await index.query({
      vector: Array(1536).fill(0), // Dummy vector
      topK: 1,
      filter: {
        videoId: { $eq: videoId },
      },
      includeMetadata: true,
    });

    // If we get any results, the video exists in Pinecone
    return queryResult.matches.length > 0;
  } catch (error) {
    console.error("Error checking if video exists in Pinecone:", error);
    return false;
  }
}

export async function storeVideoTranscriptEmbeddings(
  embeddings: {
    id: string;
    values: number[];
    metadata: {
      videoId: string;
      text: string;
      videoTitle: string;
      startTime: number;
    };
  }[],
  indexName: string
) {
  try {
    const pinecone = await getPineconeClient();
    const index = pinecone.index(indexName);

    // Upsert embeddings to Pinecone
    await index.upsert(embeddings);

    return true;
  } catch (error) {
    console.error(
      "Error storing video transcript embeddings in Pinecone:",
      error
    );
    throw error;
  }
}
