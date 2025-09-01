"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantDelete = exports.batchAnalyzeContent = exports.getContentRecommendations = exports.getIntelligentReferences = exports.QdrantSearchWithContext = exports.QdrantSearch = exports.QdrantUpsertPoints = void 0;
const cleanPayload_1 = require("./cleanPayload");
const TextEmbeddings_1 = require("./TextEmbeddings");
const Qd_config_1 = require("../config/Qd.config");
const QdrantUpsertPoints = async (data) => {
    console.log("data in Qdrant", data);
    try {
        // Get basic payload
        const payload = (0, cleanPayload_1.cleanPayload)(data);
        console.log("payload in Qdrant", payload);
        // Enhanced LLM analysis for better embeddings
        const llmAnalysis = await (0, TextEmbeddings_1.analyzeContentWithLLM)({
            title: data.title,
            link: data.link,
            type: data.type,
            tags: data.tags.map(tag => {
                if (typeof tag === 'string') {
                    return tag;
                }
                else if (tag && typeof tag === 'object' && 'title' in tag) {
                    return tag.title;
                }
                return '';
            }).filter(Boolean),
        });
        // Create enhanced embedding data
        const enhancedData = {
            ...payload,
            link: data.link,
            type: data.type,
            summary: llmAnalysis.summary,
            references: llmAnalysis.references,
            keywords: llmAnalysis.keywords,
            relatedTopics: llmAnalysis.relatedTopics,
        };
        // Generate enhanced embeddings with LLM context
        const embeddings = await (0, TextEmbeddings_1.getEmbeddings)(enhancedData);
        // Store enhanced payload with LLM analysis
        const enhancedPayload = {
            ...payload,
            summary: llmAnalysis.summary,
            references: llmAnalysis.references,
            keywords: llmAnalysis.keywords,
            relatedTopics: llmAnalysis.relatedTopics,
            insights: llmAnalysis.insights,
            llmAnalyzed: true,
            analyzedAt: new Date().toISOString()
        };
        await Qd_config_1.client.upsert("secondBrain", {
            points: [{
                    id: data.contentId,
                    payload: enhancedPayload,
                    vector: embeddings,
                }]
        });
        console.log("Qdrant Created id: ", data.contentId);
        console.log("LLM Analysis completed for: ", data.title);
        return {
            success: true,
            contentId: data.contentId,
            analysis: llmAnalysis
        };
    }
    catch (error) {
        console.error("Error upserting points:", error);
        throw error;
    }
};
exports.QdrantUpsertPoints = QdrantUpsertPoints;
const QdrantSearch = async (embeddings, limit = 3) => {
    try {
        const response = await Qd_config_1.client.search("secondBrain", {
            vector: embeddings,
            limit: limit,
            with_payload: true
        });
        return response.map(response => ({
            id: response.id,
            payload: response.payload,
            score: response.score
        }));
    }
    catch (error) {
        console.error("Error searching for points:", error);
        throw error;
    }
};
exports.QdrantSearch = QdrantSearch;
// Enhanced search with LLM context and intelligent references
const QdrantSearchWithContext = async (query, limit = 5) => {
    try {
        // First, get embeddings for the query
        const queryEmbeddings = await (0, TextEmbeddings_1.getEmbeddings)(query);
        // Search in Qdrant
        const searchResults = await (0, exports.QdrantSearch)(queryEmbeddings, limit);
        // Enhance results with LLM context
        const enhancedResults = await (0, TextEmbeddings_1.semanticSearchWithContext)(query, queryEmbeddings, searchResults.map(result => ({
            id: String(result.id),
            payload: result.payload || {},
            score: result.score
        })));
        return enhancedResults;
    }
    catch (error) {
        console.error("Error in enhanced search:", error);
        throw error;
    }
};
exports.QdrantSearchWithContext = QdrantSearchWithContext;
// Generate intelligent references for a given query
const getIntelligentReferences = async (query, limit = 5) => {
    try {
        // Get all content from Qdrant for analysis
        const allContent = await Qd_config_1.client.scroll("secondBrain", {
            limit: 100, // Adjust based on your content size
            with_payload: true
        });
        const contentForAnalysis = allContent.points.map(point => ({
            contentId: String(point.id),
            title: String(point.payload?.title || ''),
            tags: Array.isArray(point.payload?.tagTitles) ? point.payload.tagTitles.map(t => String(t)) : [],
            type: String(point.payload?.type || '')
        }));
        // Generate intelligent references using LLM
        const references = await (0, TextEmbeddings_1.generateIntelligentReferences)(query, contentForAnalysis, limit);
        return references;
    }
    catch (error) {
        console.error("Error generating intelligent references:", error);
        throw error;
    }
};
exports.getIntelligentReferences = getIntelligentReferences;
// Content recommendation system
const getContentRecommendations = async (contentId, limit = 5) => {
    try {
        // Get the target content
        const targetContent = await Qd_config_1.client.retrieve("secondBrain", {
            ids: [contentId]
        });
        if (!targetContent.length) {
            throw new Error("Content not found");
        }
        const target = targetContent[0];
        // Search for similar content
        const similarContent = await Qd_config_1.client.search("secondBrain", {
            vector: target.vector,
            limit: limit + 1, // +1 to exclude the target itself
            with_payload: true,
            filter: {
                must_not: [
                    {
                        key: "contentId",
                        match: { value: contentId }
                    }
                ]
            }
        });
        // Enhance with LLM analysis
        const recommendations = await (0, TextEmbeddings_1.semanticSearchWithContext)(`Content similar to: ${target.payload?.title}`, target.vector, similarContent.map(item => ({
            id: String(item.id),
            payload: item.payload || {},
            score: item.score
        })));
        return recommendations;
    }
    catch (error) {
        console.error("Error getting content recommendations:", error);
        throw error;
    }
};
exports.getContentRecommendations = getContentRecommendations;
// Batch content analysis for existing content
const batchAnalyzeContent = async () => {
    try {
        console.log("Starting batch content analysis...");
        // Get all content that hasn't been analyzed by LLM
        const unanalyzedContent = await Qd_config_1.client.scroll("secondBrain", {
            limit: 100,
            with_payload: true,
            filter: {
                must_not: [
                    {
                        key: "llmAnalyzed",
                        match: { value: true }
                    }
                ]
            }
        });
        console.log(`Found ${unanalyzedContent.points.length} items to analyze`);
        const results = [];
        for (const point of unanalyzedContent.points) {
            try {
                // Re-analyze with LLM
                const llmAnalysis = await (0, TextEmbeddings_1.analyzeContentWithLLM)({
                    title: String(point.payload?.title || ''),
                    link: String(point.payload?.link || ''),
                    type: String(point.payload?.type || ''),
                    tags: Array.isArray(point.payload?.tagTitles) ? point.payload.tagTitles.map(t => String(t)) : [],
                });
                // Update the point with new analysis using upsert instead of update
                await Qd_config_1.client.upsert("secondBrain", {
                    points: [{
                            id: point.id,
                            payload: {
                                ...point.payload,
                                summary: llmAnalysis.summary,
                                references: llmAnalysis.references,
                                keywords: llmAnalysis.keywords,
                                relatedTopics: llmAnalysis.relatedTopics,
                                insights: llmAnalysis.insights,
                                llmAnalyzed: true,
                                analyzedAt: new Date().toISOString()
                            },
                            vector: point.vector
                        }]
                });
                results.push({
                    contentId: String(point.id),
                    success: true,
                    analysis: llmAnalysis
                });
                console.log(`Analyzed content: ${point.payload?.title}`);
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                console.error(`Error analyzing content ${point.id}:`, error);
                results.push({
                    contentId: String(point.id),
                    success: false,
                    error: error.message || 'Unknown error'
                });
            }
        }
        console.log("Batch analysis completed");
        return results;
    }
    catch (error) {
        console.error("Error in batch analysis:", error);
        throw error;
    }
};
exports.batchAnalyzeContent = batchAnalyzeContent;
const QdrantDelete = async (contentId) => {
    try {
        await Qd_config_1.client.delete("secondBrain", {
            points: [contentId]
        });
        console.log("Qdrant Deleting id: ", contentId);
        return;
    }
    catch (error) {
        console.error("Error deleting points:", error);
    }
};
exports.QdrantDelete = QdrantDelete;
