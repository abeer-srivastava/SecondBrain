"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantDelete = exports.batchAnalyzeContent = exports.getContentRecommendations = exports.getIntelligentReferences = exports.QdrantSearchWithContext = exports.QdrantSearch = exports.QdrantUpsertPoints = void 0;
const cleanPayload_1 = require("./cleanPayload");
const TextEmbeddings_1 = require("./TextEmbeddings");
const Qd_config_1 = require("../config/Qd.config");
/**
 * Upsert content into Qdrant with embeddings + optional LLM analysis
 */
const QdrantUpsertPoints = async (data, runAnalysis = true) => {
    try {
        // Clean base payload
        const payload = (0, cleanPayload_1.cleanPayload)(data);
        let llmAnalysis = {};
        if (runAnalysis) {
            llmAnalysis = await (0, TextEmbeddings_1.analyzeContentWithLLM)({
                title: data.title,
                link: data.link,
                type: data.type,
                tags: data.tags.map(tag => typeof tag === "string" ? tag : (tag?.title ?? "")).filter(Boolean),
            });
        }
        // Build enhanced embedding data
        const enhancedData = {
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
        const embeddings = await (0, TextEmbeddings_1.getEmbeddings)(enhancedData);
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
        await Qd_config_1.client.upsert("secondBrain", {
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
    }
    catch (error) {
        console.error("Error upserting points:", error);
        throw error;
    }
};
exports.QdrantUpsertPoints = QdrantUpsertPoints;
/**
 * Basic vector search
 */
const QdrantSearch = async (embeddings, limit = 3) => {
    try {
        const response = await Qd_config_1.client.search("secondBrain", {
            vector: embeddings,
            limit,
            with_payload: true,
        });
        return response.map(res => ({
            id: String(res.id),
            payload: res.payload,
            score: res.score,
        }));
    }
    catch (error) {
        console.error("Error searching for points:", error);
        throw error;
    }
};
exports.QdrantSearch = QdrantSearch;
/**
 * Enhanced semantic search
 */
const QdrantSearchWithContext = async (query, limit = 5) => {
    try {
        const queryEmbeddings = await (0, TextEmbeddings_1.getEmbeddings)(query);
        const searchResults = await (0, exports.QdrantSearch)(queryEmbeddings, limit);
        // Directly enrich search results
        const enhancedResults = await (0, TextEmbeddings_1.semanticSearchWithContext)(query, queryEmbeddings, searchResults);
        return enhancedResults;
    }
    catch (error) {
        console.error("Error in enhanced search:", error);
        throw error;
    }
};
exports.QdrantSearchWithContext = QdrantSearchWithContext;
/**
 * Get intelligent references (LLM-driven connections between items)
 */
const getIntelligentReferences = async (query, limit = 5) => {
    try {
        const allContent = await Qd_config_1.client.scroll("secondBrain", {
            limit: 100,
            with_payload: true,
        });
        const contentForAnalysis = allContent.points.map(point => ({
            contentId: String(point.id),
            title: String(point.payload?.title || ""),
            tags: Array.isArray(point.payload?.tagTitles)
                ? point.payload.tagTitles.map((t) => String(t))
                : [],
            type: String(point.payload?.type || ""),
        }));
        return (0, TextEmbeddings_1.generateIntelligentReferences)(query, contentForAnalysis, limit);
    }
    catch (error) {
        console.error("Error generating intelligent references:", error);
        throw error;
    }
};
exports.getIntelligentReferences = getIntelligentReferences;
/**
 * Get recommended content based on similarity
 */
const getContentRecommendations = async (contentId, limit = 5) => {
    try {
        // Retrieve the target content
        const targetContent = await Qd_config_1.client.retrieve("secondBrain", {
            ids: [contentId],
            with_payload: true,
            with_vector: true,
        });
        if (!targetContent.length || !targetContent[0].vector) {
            throw new Error("Content or vector not found");
        }
        const target = targetContent[0];
        const similarContent = await Qd_config_1.client.search("secondBrain", {
            vector: target.vector,
            limit: limit + 1,
            with_payload: true,
            filter: {
                must_not: [{ key: "contentId", match: { value: contentId } }],
            },
        });
        return (0, TextEmbeddings_1.semanticSearchWithContext)(`Content similar to: ${target.payload?.title}`, target.vector, similarContent.map(item => ({
            id: String(item.id),
            payload: item.payload || {},
            score: item.score,
        })));
    }
    catch (error) {
        console.error("Error getting content recommendations:", error);
        throw error;
    }
};
exports.getContentRecommendations = getContentRecommendations;
/**
 * Batch LLM analysis for unanalyzed content
 */
const batchAnalyzeContent = async () => {
    try {
        const unanalyzedContent = await Qd_config_1.client.scroll("secondBrain", {
            limit: 100,
            with_payload: true,
            filter: { must_not: [{ key: "llmAnalyzed", match: { value: true } }] },
            with_vector: true, // ✅ need vectors for re-upsert
        });
        const results = [];
        for (const point of unanalyzedContent.points) {
            try {
                const llmAnalysis = await (0, TextEmbeddings_1.analyzeContentWithLLM)({
                    title: String(point.payload?.title || ""),
                    link: String(point.payload?.link || ""),
                    type: String(point.payload?.type || ""),
                    tags: Array.isArray(point.payload?.tagTitles)
                        ? point.payload.tagTitles.map((t) => String(t))
                        : [],
                });
                await Qd_config_1.client.upsert("secondBrain", {
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
                            vector: point.vector, // ✅ re-use existing vector
                        },
                    ],
                });
                results.push({ contentId: String(point.id), success: true });
            }
            catch (err) {
                results.push({
                    contentId: String(point.id),
                    success: false,
                    error: err.message || "Unknown error",
                });
            }
        }
        return results;
    }
    catch (error) {
        console.error("Error in batch analysis:", error);
        throw error;
    }
};
exports.batchAnalyzeContent = batchAnalyzeContent;
/**
 * Delete content from Qdrant
 */
const QdrantDelete = async (contentId) => {
    try {
        await Qd_config_1.client.delete("secondBrain", { points: [contentId] });
        console.log("Qdrant Deleted id:", contentId);
    }
    catch (error) {
        console.error("Error deleting points:", error);
    }
};
exports.QdrantDelete = QdrantDelete;
