"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.semanticSearchWithContext = exports.generateIntelligentReferences = exports.analyzeContentWithLLM = exports.getEmbeddings = void 0;
const cohere_ai_1 = require("cohere-ai");
const generative_ai_1 = require("@google/generative-ai");
const json5_1 = __importDefault(require("json5"));
// Initialize Cohere client only if API key is available
let cohere = null;
try {
    if (process.env.COHERE_API_KEY) {
        cohere = new cohere_ai_1.CohereClient({
            token: process.env.COHERE_API_KEY
        });
        console.log("Cohere client initialized successfully");
    }
    else {
        console.warn("COHERE_API_KEY not found, embeddings will use fallback method", process.env.COHERE_API_KEY);
    }
}
catch (error) {
    console.warn("Failed to initialize Cohere client:", error);
    cohere = null;
}
// Initialize Gemini client only if API key is available
let genAI = null;
let geminiModel = null;
try {
    if (process.env.GEMINI_API_KEY) {
        console.log(process.env.GEMINI_API_KEY);
        genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
        });
        console.log("Gemini client initialized successfully");
    }
    else {
        console.warn("GEMINI_API_KEY not found, LLM features will be disabled");
    }
}
catch (error) {
    console.warn("Failed to initialize Gemini client:", error);
    genAI = null;
    geminiModel = null;
}
function safeJSONParse(text) {
    try {
        console.log(text);
        return JSON.parse(text); // strict parse
    }
    catch {
        try {
            return json5_1.default.parse(text); // tolerant parse
        }
        catch (err) {
            console.error("Failed to parse LLM response as JSON:", text);
            throw err;
        }
    }
}
// Simple hash-based fallback embedding generator
const generateFallbackEmbeddings = (text) => {
    const hash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    // Generate a 1024-dimensional vector using the hash
    const vector = [];
    for (let i = 0; i < 1024; i++) {
        const seed = (hash + i * 12345) % 1000000;
        vector.push((seed / 1000000) * 2 - 1); // Normalize to [-1, 1]
    }
    return vector;
};
const getEmbeddings = async (data) => {
    let stagedData;
    if (typeof data === "string") {
        stagedData = data.trim();
    }
    else if ('tagTitles' in data && 'type' in data) {
        // Enhanced data with additional context
        const contextParts = [
            data.title,
            ...data.tagTitles,
            data.type,
            data.summary || '',
            ...(data.keywords || []),
            ...(data.relatedTopics || [])
        ].filter(Boolean);
        stagedData = contextParts.join(" ").trim();
    }
    else if ('tagTitles' in data) {
        // Basic cleaned payload
        stagedData = (data.title + " " + data.tagTitles.join(" ")).trim();
    }
    else {
        throw new Error("Invalid data format for embeddings");
    }
    if (!stagedData) {
        throw new Error("Staged data is empty, cannot generate embeddings.");
    }
    // Try Cohere first, fallback to hash-based method if unavailable
    if (cohere) {
        try {
            const embed = await cohere.v2.embed({
                model: 'embed-english-v3.0',
                inputType: 'search_document',
                embeddingTypes: ['float'],
                texts: [stagedData],
            });
            const vector = embed.embeddings.float[0];
            console.log("Generated embeddings using Cohere");
            return vector;
        }
        catch (error) {
            console.warn("Cohere embedding failed, using fallback method:", error);
        }
    }
    // Fallback to hash-based embeddings
    console.log("Using fallback embedding method");
    return generateFallbackEmbeddings(stagedData);
};
exports.getEmbeddings = getEmbeddings;
// LLM-powered content analysis and reference generation
const analyzeContentWithLLM = async (content) => {
    // Check if Gemini is available
    if (!geminiModel) {
        console.log("Gemini not available, using fallback analysis");
        return {
            summary: `Content about ${content.title} related to ${content.tags.join(', ')}`,
            references: [],
            keywords: content.tags,
            relatedTopics: [content.type],
            insights: "Content analysis completed (LLM not available)"
        };
    }
    try {
        const prompt = `
        Analyze the following content and provide:
        1. A concise summary (2-3 sentences)
        2. 3-5 relevant references or related topics
        3. 5-8 key keywords
        4. 3-4 related topics or themes
        5. Key insights or takeaways

        Content:
        Title: ${content.title}
        Type: ${content.type}
        Tags: ${content.tags.join(', ')}
        ${content.description ? `Description: ${content.description}` : ''}
        Link: ${content.link}

        Please format your response as JSON:
        {
            "summary": "brief summary here",
            "references": ["reference1", "reference2", "reference3"],
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "relatedTopics": ["topic1", "topic2", "topic3"],
            "insights": "key insights here"
        }
        `;
        const result = await geminiModel.generateContent(prompt);
        let response = result.response.text();
        if (!response) {
            throw new Error("No response from Gemini");
        }
        response = response
            .replace(/```json|```/g, "")
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .trim();
        // Parse the JSON response
        const analysis = safeJSONParse(response);
        return {
            summary: analysis.summary || "",
            references: analysis.references || [],
            keywords: analysis.keywords || [],
            relatedTopics: analysis.relatedTopics || [],
            insights: analysis.insights || ""
        };
    }
    catch (error) {
        console.error("Error analyzing content with LLM:", error);
        // Fallback to basic analysis
        return {
            summary: `Content about ${content.title} related to ${content.tags.join(', ')}`,
            references: [],
            keywords: content.tags,
            relatedTopics: [content.type],
            insights: "Content analysis completed (LLM error)"
        };
    }
};
exports.analyzeContentWithLLM = analyzeContentWithLLM;
// Generate intelligent references based on content similarity
const generateIntelligentReferences = async (query, existingContent, limit = 5) => {
    // Check if Gemini is available
    if (!geminiModel) {
        console.log("Gemini not available, using fallback reference matching");
        return existingContent
            .filter(item => item.tags.some(tag => query.toLowerCase().includes(tag.toLowerCase())) ||
            item.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, limit)
            .map(item => ({
            contentId: item.contentId,
            title: item.title,
            relevance: 0.7,
            reason: "Tag or title match (LLM not available)"
        }));
    }
    try {
        const prompt = `Respond with ONLY strict JSON. Do not include any extra text, comments, or code fences.
        All keys must be in double quotes. All string values must use double quotes.
        Given the following query and existing content, identify the most relevant references.
        
        Query: ${query}
        
        Existing Content:
        ${existingContent.map((item, index) => `${index + 1}. Title: ${item.title}, Tags: ${item.tags.join(', ')}, Type: ${item.type}`).join('\n')}
        
        Please analyze the relevance of each piece of content to the query and return the top ${limit} most relevant items.
        Consider semantic similarity, tag overlap, and content type relevance.
        
        Format your response as JSON:
        {
            "references": [
                {
                    "contentId": "id1",
                    "title": "title1",
                    "relevance": 0.95,
                    "reason": "explanation of relevance"
                }
            ]
        }
        `;
        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();
        if (!response) {
            throw new Error("No response from Gemini");
        }
        const parsedResult = JSON.parse(response);
        return parsedResult.references || [];
    }
    catch (error) {
        console.error("Error generating intelligent references:", error);
        // Fallback to basic tag-based matching
        return existingContent
            .filter(item => item.tags.some(tag => query.toLowerCase().includes(tag.toLowerCase())) ||
            item.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, limit)
            .map(item => ({
            contentId: item.contentId,
            title: item.title,
            relevance: 0.7,
            reason: "Tag or title match (LLM error)"
        }));
    }
};
exports.generateIntelligentReferences = generateIntelligentReferences;
// Enhanced semantic search with LLM context
const semanticSearchWithContext = async (query, embeddings, searchResults) => {
    // Check if Gemini is available
    if (!geminiModel) {
        console.log("Gemini not available, using basic search context");
        return searchResults.map(result => ({
            ...result,
            relevance: "Semantic match based on vector similarity (LLM not available)",
            suggestedUse: "Content available for reference"
        }));
    }
    try {
        const prompt = `
        Analyze the search query and results to provide context and suggestions.
        
        Query: ${query}
        
        Search Results:
        ${searchResults.map((result, index) => `${index + 1}. Score: ${result.score}, Title: ${result.payload.title}, Tags: ${result.payload.tagTitles?.join(', ') || 'N/A'}`).join('\n')}
        
        For each result, provide:
        1. Relevance explanation (why it matches the query)
        2. Suggested use case (how this content could be used)
        
        Format as JSON:
        {
            "results": [
                {
                    "id": "id1",
                    "relevance": "explanation of relevance",
                    "suggestedUse": "suggested use case"
                }
            ]
        }
        `;
        const result = await geminiModel.generateContent(prompt);
        let response = result.response.text();
        if (!response) {
            throw new Error("No response from Gemini");
        }
        response = response
            .replace(/```json|```/g, "")
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .trim();
        const analysis = safeJSONParse(response);
        return searchResults.map((result, index) => ({
            ...result,
            relevance: analysis.results?.[index]?.relevance || "Relevance analysis unavailable",
            suggestedUse: analysis.results?.[index]?.suggestedUse || "Use case analysis unavailable"
        }));
    }
    catch (error) {
        console.error("Error in semantic search with context:", error);
        // Return results without enhanced context
        return searchResults.map(result => ({
            ...result,
            relevance: "Semantic match based on vector similarity (LLM error)",
            suggestedUse: "Content available for reference"
        }));
    }
};
exports.semanticSearchWithContext = semanticSearchWithContext;
