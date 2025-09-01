import { CleanedPayload } from "./cleanPayload";
import { CohereClient } from 'cohere-ai';
import { OpenAI } from 'openai';

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface EnhancedEmbeddingData {
    title: string;
    contentId: string;
    tagTitles: string[];
    link: string;
    type: string;
    summary?: string;
    references?: string[];
    keywords?: string[];
    relatedTopics?: string[];
}

export const getEmbeddings = async (data: CleanedPayload | string | EnhancedEmbeddingData): Promise<number[]> => {
    let stagedData: string;
    
    if (typeof data === "string") {
        stagedData = data.trim();
    } else if ('tagTitles' in data) {
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
    } else {
        stagedData = (data.title + " " + data.tagTitles.join(" ")).trim();
    }

    if (!stagedData) {
        throw new Error("Staged data is empty, cannot generate embeddings.");
    }
    
    try {
        const embed = await cohere.v2.embed({
            model: 'embed-english-v3.0',
            inputType: 'search_document',
            embeddingTypes: ['float'],
            texts: [stagedData],
        });
        const vector = embed.embeddings.float![0]
        return vector;

    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error(`Error in getEmbeddings: ${error}`);
    }
};

// LLM-powered content analysis and reference generation
export const analyzeContentWithLLM = async (content: {
    title: string;
    link: string;
    type: string;
    tags: string[];
    description?: string;
}): Promise<{
    summary: string;
    references: string[];
    keywords: string[];
    relatedTopics: string[];
    insights: string;
}> => {
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

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert content analyst. Provide accurate, relevant analysis in the exact JSON format requested."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error("No response from LLM");
        }

        // Parse the JSON response
        const analysis = JSON.parse(response);
        
        return {
            summary: analysis.summary || "",
            references: analysis.references || [],
            keywords: analysis.keywords || [],
            relatedTopics: analysis.relatedTopics || [],
            insights: analysis.insights || ""
        };

    } catch (error) {
        console.error("Error analyzing content with LLM:", error);
        // Fallback to basic analysis
        return {
            summary: `Content about ${content.title} related to ${content.tags.join(', ')}`,
            references: [],
            keywords: content.tags,
            relatedTopics: [content.type],
            insights: "Content analysis completed"
        };
    }
};

// Generate intelligent references based on content similarity
export const generateIntelligentReferences = async (
    query: string,
    existingContent: Array<{
        title: string;
        tags: string[];
        type: string;
        contentId: string;
    }>,
    limit: number = 5
): Promise<Array<{
    contentId: string;
    title: string;
    relevance: number;
    reason: string;
}>> => {
    try {
        const prompt = `
        Given the following query and existing content, identify the most relevant references.
        
        Query: ${query}
        
        Existing Content:
        ${existingContent.map((item, index) => 
            `${index + 1}. Title: ${item.title}, Tags: ${item.tags.join(', ')}, Type: ${item.type}`
        ).join('\n')}
        
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

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert at finding relevant content references. Analyze semantic similarity and provide relevance scores with explanations."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.2,
            max_tokens: 800
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error("No response from LLM");
        }

        const result = JSON.parse(response);
        return result.references || [];

    } catch (error) {
        console.error("Error generating intelligent references:", error);
        // Fallback to basic tag-based matching
        return existingContent
            .filter(item => 
                item.tags.some(tag => 
                    query.toLowerCase().includes(tag.toLowerCase())
                ) || 
                item.title.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, limit)
            .map(item => ({
                contentId: item.contentId,
                title: item.title,
                relevance: 0.7,
                reason: "Tag or title match"
            }));
    }
};

// Enhanced semantic search with LLM context
export const semanticSearchWithContext = async (
    query: string,
    embeddings: number[],
    searchResults: Array<{
        id: string;
        payload: any;
        score: number;
    }>
): Promise<Array<{
    id: string;
    payload: any;
    score: number;
    relevance: string;
    suggestedUse: string;
}>> => {
    try {
        const prompt = `
        Analyze the search query and results to provide context and suggestions.
        
        Query: ${query}
        
        Search Results:
        ${searchResults.map((result, index) => 
            `${index + 1}. Score: ${result.score}, Title: ${result.payload.title}, Tags: ${result.payload.tagTitles?.join(', ') || 'N/A'}`
        ).join('\n')}
        
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

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert at analyzing search relevance and suggesting content usage."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 600
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error("No response from LLM");
        }

        const analysis = JSON.parse(response);
        
        return searchResults.map((result, index) => ({
            ...result,
            relevance: analysis.results?.[index]?.relevance || "Relevance analysis unavailable",
            suggestedUse: analysis.results?.[index]?.suggestedUse || "Use case analysis unavailable"
        }));

    } catch (error) {
        console.error("Error in semantic search with context:", error);
        // Return results without enhanced context
        return searchResults.map(result => ({
            ...result,
            relevance: "Semantic match based on vector similarity",
            suggestedUse: "Content available for reference"
        }));
    }
};