import { ContentType } from "../types/Schemas";
import { cleanPayload } from "./cleanPayload";
import { 
  getEmbeddings, 
  analyzeContentWithLLM, 
  generateIntelligentReferences,
  semanticSearchWithContext,
  EnhancedEmbeddingData 
} from "./TextEmbeddings";
import { client } from "../config/Qd.config";

/**
 * Upsert content into Qdrant with embeddings + optional LLM analysis
 */
export const QdrantUpsertPoints = async (
  data: ContentType,
  runAnalysis: boolean = true
) => {
  try {
    // Clean base payload
    const payload = cleanPayload(data);

    let llmAnalysis: any = {};
    if (runAnalysis) {
      llmAnalysis = await analyzeContentWithLLM({
        title: data.title,
        link: data.link,
        type: data.type,
        tags: data.tags.map(tag =>
          typeof tag === "string" ? tag : (tag?.title ?? "")
        ).filter(Boolean),
      });
    }

    // Build enhanced embedding data
    const enhancedData: EnhancedEmbeddingData = {
      ...payload,
      link: data.link,
      type: data.type,
      ...(runAnalysis && {
        summary: llmAnalysis.summary,
        references: llmAnalysis.references,
        keywords: llmAnalysis.keywords,
        relatedTopics: llmAnalysis.relatedTopics,
      }),
    };

    // Generate embeddings
    const embeddings = await getEmbeddings(enhancedData);

    // Enhanced payload stored in Qdrant
    const enhancedPayload = {
      ...payload,
      ...(runAnalysis && {
        summary: llmAnalysis.summary,
        references: llmAnalysis.references,
        keywords: llmAnalysis.keywords,
        relatedTopics: llmAnalysis.relatedTopics,
        insights: llmAnalysis.insights,
        llmAnalyzed: true,
        analyzedAt: new Date().toISOString(),
      }),
    };

    await client.upsert("secondBrain", {
      points: [
        {
          id: payload.contentId, // consistent id usage
          payload: enhancedPayload,
          vector: embeddings,
        },
      ],
    });

    return {
      success: true,
      contentId: payload.contentId,
      ...(runAnalysis ? { analysis: llmAnalysis } : {}),
    };
  } catch (error) {
    console.error("Error upserting points:", error);
    throw error;
  }
};

/**
 * Basic vector search
 */
export const QdrantSearch = async (embeddings: number[], limit = 3) => {
  try {
    const response = await client.search("secondBrain", {
      vector: embeddings,
      limit,
      with_payload: true,
    });

    return response.map(res => ({
      id: String(res.id),
      payload: res.payload,
      score: res.score,
    }));
  } catch (error) {
    console.error("Error searching for points:", error);
    throw error;
  }
};

/**
 * Enhanced semantic search
 */
export const QdrantSearchWithContext = async (query: string, limit = 5) => {
  try {
    const queryEmbeddings = await getEmbeddings(query);

    const searchResults = await QdrantSearch(queryEmbeddings, limit);

    // Directly enrich search results
    const enhancedResults = await semanticSearchWithContext(
      query,
      queryEmbeddings,
      searchResults
    );

    return enhancedResults;
  } catch (error) {
    console.error("Error in enhanced search:", error);
    throw error;
  }
};

/**
 * Get intelligent references (LLM-driven connections between items)
 */
export const getIntelligentReferences = async (query: string, limit = 5) => {
  try {
    const allContent = await client.scroll("secondBrain", {
      limit: 100,
      with_payload: true,
    });

    const contentForAnalysis = allContent.points.map(point => ({
      contentId: String(point.id),
      title: String(point.payload?.title || ""),
      tags: Array.isArray(point.payload?.tagTitles)
        ? point.payload.tagTitles.map((t: any) => String(t))
        : [],
      type: String(point.payload?.type || ""),
    }));

    return generateIntelligentReferences(query, contentForAnalysis, limit);
  } catch (error) {
    console.error("Error generating intelligent references:", error);
    throw error;
  }
};

/**
 * Get recommended content based on similarity
 */
export const getContentRecommendations = async (
  contentId: string,
  limit = 5
) => {
  try {
    // Retrieve the target content
    const targetContent = await client.retrieve("secondBrain", {
      ids: [contentId],
      with_payload: true,
      with_vector: true, 
    });

    if (!targetContent.length || !targetContent[0].vector) {
      throw new Error("Content or vector not found");
    }

    const target = targetContent[0];

    const similarContent = await client.search("secondBrain", {
      vector: target.vector as number[],
      limit: limit + 1,
      with_payload: true,
      filter: {
        must_not: [{ key: "contentId", match: { value: contentId } }],
      },
    });

    return semanticSearchWithContext(
      `Content similar to: ${target.payload?.title}`,
      target.vector as number[],
      similarContent.map(item => ({
        id: String(item.id),
        payload: item.payload || {},
        score: item.score,
      }))
    );
  } catch (error) {
    console.error("Error getting content recommendations:", error);
    throw error;
  }
};

/**
 * Batch LLM analysis for unanalyzed content
 */
export const batchAnalyzeContent = async () => {
  try {
    const unanalyzedContent = await client.scroll("secondBrain", {
      limit: 100,
      with_payload: true,
      filter: { must_not: [{ key: "llmAnalyzed", match: { value: true } }] },
      with_vector: true, // ✅ need vectors for re-upsert
    });

    const results: any[] = [];

    for (const point of unanalyzedContent.points) {
      try {
        const llmAnalysis = await analyzeContentWithLLM({
          title: String(point.payload?.title || ""),
          link: String(point.payload?.link || ""),
          type: String(point.payload?.type || ""),
          tags: Array.isArray(point.payload?.tagTitles)
            ? point.payload.tagTitles.map((t: any) => String(t))
            : [],
        });

        await client.upsert("secondBrain", {
          points: [
            {
              id: point.id,
              payload: {
                ...point.payload,
                summary: llmAnalysis.summary,
                references: llmAnalysis.references,
                keywords: llmAnalysis.keywords,
                relatedTopics: llmAnalysis.relatedTopics,
                insights: llmAnalysis.insights,
                llmAnalyzed: true,
                analyzedAt: new Date().toISOString(),
              },
              vector: point.vector as number[], // ✅ re-use existing vector
            },
          ],
        });

        results.push({ contentId: String(point.id), success: true });
      } catch (err: any) {
        results.push({
          contentId: String(point.id),
          success: false,
          error: err.message || "Unknown error",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in batch analysis:", error);
    throw error;
  }
};

/**
 * Delete content from Qdrant
 */
export const QdrantDelete = async (contentId: string) => {
  try {
    await client.delete("secondBrain", { points: [contentId] });
    console.log("Qdrant Deleted id:", contentId);
  } catch (error) {
    console.error("Error deleting points:", error);
  }
};
