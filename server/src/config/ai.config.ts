export const AI_CONFIG = {
    // Google Gemini Configuration
    GEMINI: {
        MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        MAX_TOKENS: parseInt(process.env.GEMINI_MAX_TOKENS || '1000'),
        TEMPERATURE: parseFloat(process.env.GEMINI_TEMPERATURE || '0.3'),
        TIMEOUT: parseInt(process.env.GEMINI_TIMEOUT || '30000'),
        SAFETY_SETTINGS: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
        ]
    },
    
    // Cohere Configuration
    COHERE: {
        MODEL: process.env.COHERE_MODEL || 'embed-english-v3.0',
        INPUT_TYPE: process.env.COHERE_INPUT_TYPE || 'search_document',
        EMBEDDING_TYPES: ['float'],
    },
    
    // Qdrant Configuration
    QDRANT: {
        HOST: process.env.QDRANT_HOST || 'localhost',
        PORT: parseInt(process.env.QDRANT_PORT || '6333'),
        COLLECTION: process.env.QDRANT_COLLECTION || 'secondBrain',
        VECTOR_SIZE: parseInt(process.env.QDRANT_VECTOR_SIZE || '1024'),
    },
    
    // Analysis Configuration
    ANALYSIS: {
        BATCH_SIZE: parseInt(process.env.ANALYSIS_BATCH_SIZE || '10'),
        DELAY_BETWEEN_REQUESTS: parseInt(process.env.ANALYSIS_DELAY || '1000'),
        MAX_RETRIES: parseInt(process.env.ANALYSIS_MAX_RETRIES || '3'),
    },
    
    // Search Configuration
    SEARCH: {
        DEFAULT_LIMIT: parseInt(process.env.SEARCH_DEFAULT_LIMIT || '5'),
        MAX_LIMIT: parseInt(process.env.SEARCH_MAX_LIMIT || '20'),
        SIMILARITY_THRESHOLD: parseFloat(process.env.SEARCH_SIMILARITY_THRESHOLD || '0.7'),
    }
};

export const PROMPTS = {
    CONTENT_ANALYSIS: `You are an expert content analyst. Analyze the following content and provide insights in the exact JSON format requested.

Content to analyze:
Title: {title}
Type: {type}
Tags: {tags}
{description}
Link: {link}

Provide your analysis in this exact JSON format:
{
    "summary": "A concise 2-3 sentence summary of the content",
    "references": ["3-5 relevant references or related topics"],
    "keywords": ["5-8 key keywords that represent the main concepts"],
    "relatedTopics": ["3-4 related topics or themes"],
    "insights": "Key insights or takeaways from this content"
}

Ensure the response is valid JSON with no additional text.`,

    INTELLIGENT_REFERENCES: `You are an expert at finding relevant content references. Analyze the following query and existing content to identify the most relevant references.

Query: {query}

Existing Content:
{content}

Analyze the relevance of each piece of content to the query and return the top {limit} most relevant items.
Consider semantic similarity, tag overlap, and content type relevance.

Provide your response in this exact JSON format:
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

Ensure the response is valid JSON with no additional text.`,

    SEARCH_CONTEXT: `You are an expert at analyzing search relevance and suggesting content usage. Analyze the following search query and results.

Query: {query}

Search Results:
{results}

For each result, provide:
1. Relevance explanation (why it matches the query)
2. Suggested use case (how this content could be used)

Provide your response in this exact JSON format:
{
    "results": [
        {
            "id": "id1",
            "relevance": "explanation of relevance",
            "suggestedUse": "suggested use case"
        }
    ]
}

Ensure the response is valid JSON with no additional text.`
};

export const ERROR_MESSAGES = {
    LLM_ANALYSIS_FAILED: 'Failed to analyze content with Gemini',
    EMBEDDING_GENERATION_FAILED: 'Failed to generate embeddings',
    QDRANT_OPERATION_FAILED: 'Failed to perform Qdrant operation',
    INVALID_CONTENT_TYPE: 'Invalid content type provided',
    CONTENT_NOT_FOUND: 'Content not found',
    UNAUTHORIZED: 'Unauthorized access',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded, please try again later',
    INVALID_API_KEY: 'Invalid Gemini API key provided',
    SERVICE_UNAVAILABLE: 'Gemini AI service temporarily unavailable'
}; 